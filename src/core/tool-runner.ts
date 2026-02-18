import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Tool manifest interface
 * Defines how external tools are executed
 */
export interface ToolManifest {
  id: string;
  name: string;
  executable: string; // 'node', 'python', 'dotnet', 'pwsh', or direct path to binary
  entryPoint: string; // Path to script/binary (empty if executable is the binary)
  platform?: NodeJS.Platform; // Optional platform filter
}

/**
 * Tool input/output interface
 */
export interface ToolInput {
  toolId: string;
  params: Record<string, unknown>;
  config: Record<string, unknown>;
}

export interface ToolOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
}

/**
 * Execute external tool with JSON I/O
 * Future implementation for polyglot tools
 */
export async function executeTool(
  manifest: ToolManifest,
  params: Record<string, unknown>,
  config: Record<string, unknown>
): Promise<ToolOutput> {
  // Platform check
  if (manifest.platform && manifest.platform !== process.platform) {
    throw new Error(`Tool ${manifest.id} not supported on ${process.platform}`);
  }

  // Prepare temp files
  const inputFile = path.join(
    os.tmpdir(),
    `${manifest.id}-input-${Date.now()}.json`
  );
  const outputFile = path.join(
    os.tmpdir(),
    `${manifest.id}-output-${Date.now()}.json`
  );

  const input: ToolInput = {
    toolId: manifest.id,
    params,
    config,
  };

  fs.writeFileSync(inputFile, JSON.stringify(input, null, 2));

  // Build args
  const args = manifest.entryPoint
    ? [manifest.entryPoint, '--input', inputFile, '--output', outputFile]
    : ['--input', inputFile, '--output', outputFile];

  // Execute
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(manifest.executable, args, {
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tool exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });

  // Read output
  const outputContent = fs.readFileSync(outputFile, 'utf-8');
  const output = JSON.parse(outputContent) as ToolOutput;

  // Cleanup
  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);

  return output;
}
