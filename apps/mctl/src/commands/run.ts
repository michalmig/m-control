import * as path from 'path';
import {
  discoverTools,
  loadConfig,
  configExists,
  initConfig,
  extractToolConfig,
  createEventSink,
  getRunner,
  RunContext,
  ToolInput,
  RunnerOptions,
} from '@m-control/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findToolsRoot(): string {
  // __dirname = apps/mctl/dist/commands/ at runtime -> up 4 levels to monorepo root
  return path.resolve(__dirname, '../../../../tools');
}

function parseArgs(args: string[]): {
  toolId: string;
  jsonMode: boolean;
  input: ToolInput;
} {
  // args = everything after 'run', e.g. ['hello-world', '--json']
  const toolId = args[0];
  const jsonMode = args.includes('--json');

  // Future: parse --input or --key=value pairs here
  // For now, input is empty — tools use context only
  const input: ToolInput = {};

  return { toolId, jsonMode, input };
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export async function runRun(args: string[]): Promise<void> {
  if (!args[0]) {
    console.error('Usage: mctl run <tool-id> [--json]');
    process.exit(1);
  }

  const { toolId, jsonMode, input } = parseArgs(args);

  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------
  if (!configExists()) {
    initConfig();
    console.error(
      `Config initialised at ~/.m-control/config.json\n` +
        `Fill in your credentials and run 'mctl run ${toolId}' again.`
    );
    process.exit(1);
  }

  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(
      `Config error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Discovery — find the tool by id
  // -------------------------------------------------------------------------
  const toolsRoot = findToolsRoot();
  const { tools, errors: discoveryErrors } = discoverTools(toolsRoot);

  for (const { file, error } of discoveryErrors) {
    process.stderr.write(
      `[warn] skipping invalid manifest: ${file}\n       ${error}\n`
    );
  }

  const tool = tools.find((t) => t.manifest.id === toolId);
  if (!tool) {
    const known = tools.map((t) => t.manifest.id).join(', ') || '(none)';
    console.error(`Unknown tool: "${toolId}"`);
    console.error(`Available: ${known}`);
    console.error(`Run 'mctl list' to see all tools.`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Build RunContext
  // -------------------------------------------------------------------------
  const toolConfig = extractToolConfig(
    config,
    tool.manifest.requiredConfig ?? []
  );
  const workspaceRoot = path.resolve(__dirname, '../../../..');

  const context: RunContext = {
    toolId,
    config: toolConfig,
    workspaceRoot,
  };

  // -------------------------------------------------------------------------
  // Run
  // -------------------------------------------------------------------------
  const runner = getRunner(tool.manifest);
  const sink = createEventSink(jsonMode);

  const runnerOptions: RunnerOptions = {
    timeoutMs: 30_000,
    maxOutputBytes: 10 * 1024 * 1024,
    maxEvents: 10_000,
  };

  try {
    for await (const event of runner.run(tool, context, input, runnerOptions)) {
      sink.emit(event);
    }
    sink.flush?.();
  } catch (err) {
    console.error(
      `Runner error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}
