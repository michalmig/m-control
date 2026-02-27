import { ResolvedTool, Runner, ToolManifest } from '../types';
import { NotImplementedError } from '../errors';
import { NodeRunner } from './node-runner';

export { NodeRunner } from './node-runner';

/**
 * Get the appropriate Runner for a given tool manifest.
 * Throws NotImplementedError for runtimes not yet supported.
 */
export function getRunner(manifest: ToolManifest): Runner {
  switch (manifest.runtime) {
    case 'node':
      return new NodeRunner();
    case 'python':
    case 'dotnet':
    case 'powershell':
      throw new NotImplementedError(manifest.runtime);
  }
}

// Re-export ResolvedTool for convenience (used in mctl run)
export type { ResolvedTool };
