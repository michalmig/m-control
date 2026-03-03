import { spawn } from 'child_process';
import {
  discoverTools,
  extractToolConfig,
  getRunner,
  MControlConfig,
  RunContext,
  RunnerOptions,
  ToolInput,
  WorkStep,
} from '@m-control/core';
import { StepResult } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RUNNER_OPTIONS: RunnerOptions = {
  timeoutMs: 30_000,
  maxOutputBytes: 10 * 1024 * 1024, // 10 MB
  maxEvents: 10_000,
};

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * Execute a single work step.
 * Dispatches to tool or shell executor based on the step type.
 */
export async function executeStep(
  step: WorkStep,
  config: MControlConfig,
  toolsRoot: string,
  workspaceRoot: string
): Promise<StepResult> {
  if ('tool' in step) {
    return executeToolStep(step, config, toolsRoot, workspaceRoot);
  }
  return executeShellStep(step);
}

// ---------------------------------------------------------------------------
// Tool step
// ---------------------------------------------------------------------------

async function executeToolStep(
  step: { tool: string; input?: Record<string, unknown> },
  config: MControlConfig,
  toolsRoot: string,
  workspaceRoot: string
): Promise<StepResult> {
  const { tools, errors: discoveryErrors } = discoverTools(toolsRoot);

  for (const { file, error } of discoveryErrors) {
    process.stderr.write(
      `[warn] skipping invalid manifest: ${file}\n       ${error}\n`
    );
  }

  const tool = tools.find((t) => t.manifest.id === step.tool);
  if (!tool) {
    const available = tools.map((t) => t.manifest.id).join(', ') || 'none';
    return {
      step,
      success: false,
      errorMessage: `Tool "${step.tool}" not found. Available: ${available}`,
    };
  }

  const toolConfig = extractToolConfig(
    config,
    tool.manifest.requiredConfig ?? []
  );
  const context: RunContext = {
    toolId: step.tool,
    config: toolConfig,
    workspaceRoot,
  };
  const input: ToolInput = step.input ?? {};
  const runner = getRunner(tool.manifest);

  let errorMessage: string | undefined;
  try {
    for await (const event of runner.run(
      tool,
      context,
      input,
      RUNNER_OPTIONS
    )) {
      if (event.type === 'error') {
        // Capture the first error message; runner may emit more on crash
        if (errorMessage === undefined) {
          const payload = event.payload as { message: string };
          errorMessage = payload.message;
        }
      }
    }
  } catch (err) {
    return {
      step,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }

  if (errorMessage !== undefined) {
    return { step, success: false, errorMessage };
  }
  return { step, success: true };
}

// ---------------------------------------------------------------------------
// Shell step
// ---------------------------------------------------------------------------

async function executeShellStep(step: { shell: string }): Promise<StepResult> {
  return new Promise<StepResult>((resolve) => {
    // Cross-platform shell execution
    const isWindows = process.platform === 'win32';
    const spawnCmd = isWindows ? 'cmd' : 'sh';
    const spawnArgs = isWindows ? ['/c', step.shell] : ['-c', step.shell];

    const child = spawn(spawnCmd, spawnArgs, {
      // stdin: ignore (no interactive input)
      // stdout: ignore (work sessions show a clean step summary; run the tool directly for verbose output)
      // stderr: pipe so we can forward diagnostics without mixing into summary
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });

    child.stderr!.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk);
    });

    child.on('error', (err) => {
      resolve({
        step,
        success: false,
        errorMessage: `Failed to spawn shell command: ${err.message}`,
      });
    });

    child.on('close', (code) => {
      if (code !== 0) {
        resolve({
          step,
          success: false,
          errorMessage: `Shell command exited with code ${String(code)}`,
        });
      } else {
        resolve({ step, success: true });
      }
    });
  });
}
