import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MControlConfig, CONFIG_VERSION } from './types';
import { ConfigError } from './errors';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Global config dir: ~/.m-control/ */
function globalConfigDir(): string {
  // On Windows, prefer USERPROFILE over os.homedir() for consistency with
  // existing PowerShell tooling in the project.
  const home =
    process.platform === 'win32'
      ? (process.env['USERPROFILE'] ?? os.homedir())
      : os.homedir();
  return path.join(home, '.m-control');
}

export function globalConfigPath(): string {
  return path.join(globalConfigDir(), 'config.json');
}

/** Project-local config: <cwd>/.m-control/config.json — optional, merged over global. */
export function projectConfigPath(cwd: string = process.cwd()): string {
  return path.join(cwd, '.m-control', 'config.json');
}

// ---------------------------------------------------------------------------
// Template written on first init
// ---------------------------------------------------------------------------

const CONFIG_TEMPLATE: MControlConfig = {
  configVersion: CONFIG_VERSION,
  tools: {
    azdo: {
      token: '',
      organization: '',
    },
    k8s: {
      defaultContext: '',
    },
    obsidian: {
      vaultPath: '',
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function configExists(): boolean {
  return fs.existsSync(globalConfigPath());
}

/**
 * Write the default config template to the global config path.
 * No-op if the file already exists (preserves user edits).
 */
export function initConfig(): void {
  const dir = globalConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const p = globalConfigPath();
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(CONFIG_TEMPLATE, null, 2), 'utf-8');
  }
}

/**
 * Load and merge config layers:
 *   1. Global:  ~/.m-control/config.json   (required)
 *   2. Project: <cwd>/.m-control/config.json (optional — merged over global)
 *
 * Merge strategy: deep merge of `tools` keys — project values win.
 * Both layers are validated for configVersion before merging.
 *
 * @param cwd  Working directory for project config resolution (default: process.cwd())
 */
export function loadConfig(cwd?: string): MControlConfig {
  const global = loadLayer(globalConfigPath(), 'global');

  const projectPath = projectConfigPath(cwd);
  if (fs.existsSync(projectPath)) {
    const project = loadLayer(projectPath, 'project');
    return mergeConfigs(global, project);
  }

  return global;
}

/**
 * Extract a flat key-value map of config values for a tool.
 * Used to build `RunContext.config` passed to tool processes.
 *
 * @example
 * extractToolConfig(config, ['azdo.token', 'azdo.organization'])
 * // => { 'azdo.token': 'pat-xxx', 'azdo.organization': 'myorg' }
 */
export function extractToolConfig(
  config: MControlConfig,
  keys: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of keys) {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = config;
    for (const part of parts) {
      if (value == null || typeof value !== 'object') {
        value = undefined;
        break;
      }
      value = value[part];
    }
    result[key] = value;
  }

  return result;
}

/**
 * Save config to the global path.
 * Does NOT validate before saving — caller is responsible.
 */
export function saveConfig(config: MControlConfig): void {
  const dir = globalConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    globalConfigPath(),
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function loadLayer(
  filePath: string,
  layer: 'global' | 'project'
): MControlConfig {
  if (!fs.existsSync(filePath)) {
    if (layer === 'global') {
      throw new ConfigError(
        `Global config not found at ${filePath}. Run 'mctl init' to create it.`
      );
    }
    throw new ConfigError(`Project config not found at ${filePath}.`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new ConfigError(
      `Cannot read ${layer} config at ${filePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ConfigError(
      `Invalid JSON in ${layer} config at ${filePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return validateConfig(parsed, filePath, layer);
}

function validateConfig(
  raw: unknown,
  filePath: string,
  layer: string
): MControlConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new ConfigError(
      `${layer} config at ${filePath}: root must be a JSON object`
    );
  }

  const obj = raw as Record<string, unknown>;

  if (obj['configVersion'] !== CONFIG_VERSION) {
    throw new ConfigError(
      `${layer} config at ${filePath}: unsupported configVersion: ${String(obj['configVersion'])}. ` +
        `Expected ${CONFIG_VERSION}. ` +
        `If you upgraded m-control, update your config file manually or delete it and run 'mctl init'.`
    );
  }

  return obj as unknown as MControlConfig;
}

/** Deep merge: project values override global, undefined project values fall back to global. */
function mergeConfigs(
  global: MControlConfig,
  project: MControlConfig
): MControlConfig {
  return {
    configVersion: CONFIG_VERSION,
    tools: {
      ...global.tools,
      // Spread project tools — each tool section is merged at the key level
      ...Object.fromEntries(
        Object.entries(project.tools).map(([key, projectValue]) => {
          const globalValue = global.tools[key as keyof typeof global.tools];
          return [
            key,
            typeof projectValue === 'object' && typeof globalValue === 'object'
              ? { ...globalValue, ...projectValue }
              : projectValue,
          ];
        })
      ),
    },
  };
}
