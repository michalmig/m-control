#!/usr/bin/env node
/**
 * @m-control/mctl - CLI entry point
 */

import { runList } from './commands/list';
import { runRun } from './commands/run';

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

function showHelp(): void {
  console.log(
    `
m-control — Michał's personal command center

Usage:
  mctl list                   List available tools
  mctl run <tool-id>          Run a tool
  mctl run <tool-id> --json   Passthrough raw NDJSON output

  mctl --help                 Show this help

Configuration:
  ~/.m-control/config.json
  `.trim()
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const [command, ...rest] = args;

  switch (command) {
    case 'list':
      runList();
      break;

    case 'run':
      await runRun(rest);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error(`Run 'mctl --help' for usage.`);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
