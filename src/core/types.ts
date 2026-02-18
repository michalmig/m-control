// Core types for m-control

export interface MControlConfig {
  version: string;
  tools: {
    azdo?: {
      token: string;
      organization: string;
    };
    k8s?: {
      defaultContext: string;
    };
    obsidian?: {
      vaultPath: string;
    };
  };
}

export interface Command {
  id: string;
  name: string;
  description: string;
  handler: () => Promise<void>;
}

export interface CommandGroup {
  name: string;
  commands: Command[];
}
