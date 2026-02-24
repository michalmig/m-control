/**
 * Tool: Tool Display Name
 * Category: misc
 *
 * Description: One-line description of what this tool does.
 *
 * Config keys required: none
 * External dependencies: none
 */

import { ConfigManager } from '../../../src/core/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolOptions {
  // Add tool-specific options here
  dryRun?: boolean;
}

// ---------------------------------------------------------------------------
// Main handler – exported as `execute` by convention
// ---------------------------------------------------------------------------

export async function execute(options: ToolOptions = {}): Promise<void> {
  const config = await ConfigManager.getInstance().getConfig();

  // Validate required config early – fail fast with actionable message
  // const token = config.tools.someService?.token;
  // if (!token) {
  //   throw new Error('Missing required config: tools.someService.token. Run `mctl config` to set it.');
  // }

  try {
    await run(options, config);
  } catch (error) {
    // Re-throw with context; orchestrator handles final user messaging
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[tool-id] ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

async function run(options: ToolOptions, _config: Awaited<ReturnType<typeof getConfig>>): Promise<void> {
  // TODO: implement tool logic here

  if (options.dryRun) {
    console.log('[tool-id] dry-run: no changes made');
    return;
  }

  console.log('[tool-id] running...');

  // Example: fetch data, call API, spawn subprocess, etc.

  console.log('[tool-id] done.');
}

// ---------------------------------------------------------------------------
// Config helper (avoids repetitive getInstance calls)
// ---------------------------------------------------------------------------

async function getConfig() {
  return ConfigManager.getInstance().getConfig();
}
