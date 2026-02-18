import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MControlConfig } from './types';

const CONFIG_DIR =
  process.platform === 'win32'
    ? path.join(process.env.USERPROFILE || os.homedir(), '.m-control')
    : path.join(os.homedir(), '.m-control');

const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

// Embedded config template
const CONFIG_TEMPLATE: MControlConfig = {
  version: '0.1.0',
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

/**
 * Get path to config directory
 */
export function getConfigDir(): string {
  return CONFIG_DIR;
}

/**
 * Get path to config file
 */
export function getConfigPath(): string {
  return CONFIG_PATH;
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH);
}

/**
 * Initialize config by copying template
 */
export function initConfig(): void {
  // Create config directory if it doesn't exist
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  // Write template to config location
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(CONFIG_TEMPLATE, null, 2),
    'utf-8'
  );
}

/**
 * Load config from file
 */
export function loadConfig(): MControlConfig {
  if (!configExists()) {
    throw new Error(
      `Config file not found. Run 'mctl' to initialize configuration.`
    );
  }

  const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(configContent) as MControlConfig;
}

/**
 * Save config to file
 */
export function saveConfig(config: MControlConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Get config for specific tool
 */
export function getToolConfig<T extends keyof MControlConfig['tools']>(
  toolName: T
): MControlConfig['tools'][T] {
  const config = loadConfig();
  return config.tools[toolName];
}
