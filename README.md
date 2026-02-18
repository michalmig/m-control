# m-control

Michał's personal command center - a CLI toolset for development and operational tasks.

## Features

- 🎯 Interactive TUI for easy command selection
- ⚡ Direct command execution
- 🔧 Extensible architecture for custom tools
- 🌐 Cross-platform support (Windows primary, Linux secondary)

## Requirements

- Node.js 18.0.0 or higher

## Installation

### Windows

Run the installation script in PowerShell:

```powershell
.\scripts\install.ps1
```

This will:
- Build the project
- Install to `%USERPROFILE%\.m-control`
- Add to PATH
- Initialize configuration

**After installation, restart your terminal.**

## Usage

### Interactive Mode

```bash
mctl    # or use alias: mm
```

Navigate through categories and select commands using arrow keys.

### Direct Command Execution

```bash
mctl hello-world
mctl --help
```

## Configuration

Configuration is stored in `%USERPROFILE%\.m-control\config.json` (Windows) or `~/.m-control/config.json` (Linux).

On first run, a template config will be created. Fill in your credentials as needed:

```json
{
  "version": "0.1.0",
  "tools": {
    "azdo": {
      "token": "your-azure-devops-token",
      "organization": "your-org"
    },
    "k8s": {
      "defaultContext": "your-context"
    },
    "obsidian": {
      "vaultPath": "C:\\path\\to\\vault"
    }
  }
}
```

## Development

### Setup

```bash
npm install
```

### Run in dev mode

```bash
npm run dev              # Interactive mode
npm run dev hello-world  # Direct command
```

### Build

```bash
npm run build
```

### Lint & Format

```bash
npm run lint
npm run format
```

## Adding New Commands

1. Create command handler in `src/commands/<category>/<command-name>.ts`
2. Add to command registry in `src/commands/index.ts`
3. Export async function from handler
4. Test via interactive mode and direct execution

Example:

```typescript
// src/commands/misc/my-command.ts
export async function myCommand() {
  console.log('Hello from my command!');
}

// src/commands/index.ts
import { myCommand } from './misc/my-command';

export const commandGroups: CommandGroup[] = [
  {
    name: 'Misc',
    commands: [
      {
        id: 'my-command',
        name: 'My Command',
        description: 'Does something cool',
        handler: myCommand
      }
    ]
  }
];
```

## Roadmap

- [ ] Azure DevOps PR review generator
- [ ] Kubernetes pod helper
- [ ] Obsidian note launcher
- [ ] Git utilities
- [ ] System notification service

## License

MIT
