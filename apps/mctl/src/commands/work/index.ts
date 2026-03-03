import * as path from 'path';
import { configExists, loadConfig, WorkStep } from '@m-control/core';
import { executeStep } from './executor';

// ---------------------------------------------------------------------------
// ANSI colours — no external dependency
// ---------------------------------------------------------------------------

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findToolsRoot(): string {
  // ncc bundles all modules into a single file at apps/mctl/dist/bundle/index.js,
  // so __dirname is always apps/mctl/dist/bundle/ at runtime — 4 levels from monorepo root.
  // This matches the same pattern used by run.ts and list.ts.
  return path.resolve(__dirname, '../../../../tools');
}

function findWorkspaceRoot(): string {
  return path.resolve(__dirname, '../../../..');
}

function stepLabel(step: WorkStep): string {
  if ('tool' in step) {
    return `tool: ${step.tool}`;
  }
  return `shell: ${step.shell}`;
}

function parseArgs(
  args: string[]
): { action: 'start' | 'stop'; project: string } | null {
  const action = args[0];
  if (action !== 'start' && action !== 'stop') {
    return null;
  }

  const projectIdx = args.indexOf('--project');
  const project =
    projectIdx !== -1 && args[projectIdx + 1] !== undefined
      ? args[projectIdx + 1]
      : 'default';

  return { action, project };
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export async function runWork(args: string[]): Promise<void> {
  const parsed = parseArgs(args);
  if (!parsed) {
    process.stderr.write('Usage: mctl work <start|stop> [--project <name>]\n');
    process.exit(1);
  }

  const { action, project } = parsed;

  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------
  if (!configExists()) {
    process.stderr.write('Config not found. Run mctl init to create it.\n');
    process.exit(1);
  }

  let config;
  try {
    config = loadConfig();
  } catch (err) {
    process.stderr.write(
      `Config error: ${err instanceof Error ? err.message : String(err)}\n`
    );
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Work config presence check
  // -------------------------------------------------------------------------
  if (!config.work) {
    process.stdout.write(
      'No work configuration found.\n' +
        'Add a "work" section to ~/.m-control/config.json to get started.\n'
    );
    return;
  }

  // -------------------------------------------------------------------------
  // Project validation
  // -------------------------------------------------------------------------
  const projectConfig = config.work.projects[project];
  if (!projectConfig) {
    const available = Object.keys(config.work.projects).join(', ') || 'none';
    process.stderr.write(
      `Project "${project}" not found in work config.\n` +
        `Available projects: ${available}\n`
    );
    process.exit(1);
  }

  const steps = projectConfig[action] ?? [];
  if (steps.length === 0) {
    process.stdout.write(
      `No "${action}" steps configured for project "${project}".\n`
    );
    return;
  }

  // -------------------------------------------------------------------------
  // Execution — sequential, fail-fast
  // -------------------------------------------------------------------------
  process.stdout.write(`\nStarting work session [${project}]\n\n`);

  const toolsRoot = findToolsRoot();
  const workspaceRoot = findWorkspaceRoot();

  let completedCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const label = stepLabel(step);

    const result = await executeStep(step, config, toolsRoot, workspaceRoot);

    if (result.success) {
      completedCount++;
      process.stdout.write(`  ${GREEN}\u2713${RESET} ${label}\n`);
    } else {
      process.stdout.write(`  ${RED}\u2717${RESET} ${label}\n`);
      if (result.errorMessage) {
        process.stdout.write(
          `    ${RED}\u2192${RESET} Error: ${result.errorMessage}\n`
        );
      }
      // Fail-fast: report attempted count (i + 1 = steps executed so far)
      const attempted = i + 1;
      process.stdout.write(
        `\n${completedCount}/${attempted} steps completed.\n`
      );
      process.exit(1);
    }
  }

  process.stdout.write(
    `\n${completedCount}/${steps.length} steps completed.\n`
  );
}
