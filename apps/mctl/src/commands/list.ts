import * as path from 'path';
import { discoverTools, DiscoveryResult } from '@m-control/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findToolsRoot(): string {
  // Resolve tools/ relative to the monorepo root.
  // __dirname = apps/mctl/dist/commands/ at runtime → go up 4 levels.
  // In ts-node (dev) __dirname = apps/mctl/src/commands/ → same depth.
  return path.resolve(__dirname, '../../../../tools');
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function renderList(result: DiscoveryResult): void {
  if (result.errors.length > 0) {
    for (const { file, error } of result.errors) {
      process.stderr.write(
        `[warn] Skipping invalid manifest: ${file}\n       ${error}\n`
      );
    }
  }

  if (result.tools.length === 0) {
    console.log('No tools found.\n');
    console.log(`Expected manifests in: ${findToolsRoot()}`);
    return;
  }

  // Calculate column widths for alignment
  const idWidth = Math.max(4, ...result.tools.map((t) => t.manifest.id.length));
  const versionWidth = Math.max(
    7,
    ...result.tools.map((t) => t.manifest.version.length)
  );
  const runtimeWidth = Math.max(
    7,
    ...result.tools.map((t) => t.manifest.runtime.length)
  );

  const header =
    'ID'.padEnd(idWidth) +
    '  ' +
    'VERSION'.padEnd(versionWidth) +
    '  ' +
    'RUNTIME'.padEnd(runtimeWidth) +
    '  ' +
    'DESCRIPTION';

  const divider = '-'.repeat(header.length + 4);

  console.log('');
  console.log(header);
  console.log(divider);

  for (const { manifest } of result.tools) {
    const row =
      manifest.id.padEnd(idWidth) +
      '  ' +
      manifest.version.padEnd(versionWidth) +
      '  ' +
      manifest.runtime.padEnd(runtimeWidth) +
      '  ' +
      manifest.description;
    console.log(row);
  }

  console.log('');
  console.log(
    `${result.tools.length} tool${result.tools.length === 1 ? '' : 's'} found.`
  );
  console.log('');
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export function runList(): void {
  const toolsRoot = findToolsRoot();
  const result = discoverTools(toolsRoot);
  renderList(result);
}
