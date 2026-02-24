# Architecture Overview

High-level technical architecture of m-control.

## 🎯 Design Goals

1. **Extensibility** - Easy to add new tools without modifying core
2. **Isolation** - Tool failures don't crash orchestrator
3. **Polyglot** - Support tools in any language (TypeScript, Python, .NET, etc.)
4. **Hybrid-Ready** - Works local-first, cloud-optional
5. **AI-Friendly** - Clear contracts for AI-assisted development

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User                                  │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLI Entry Point                           │
│  (mctl / mm)                                                 │
│  ├─ Parse args                                               │
│  ├─ Route to mode (interactive vs direct)                    │
│  └─ Initialize services                                      │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TUI / Interactive Mode                     │
│  ├─ Category selection (prompts)                             │
│  ├─ Command selection                                        │
│  └─ Parameter input (if needed)                              │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Orchestrator Core                           │
│  ├─ Plugin Registry                                          │
│  ├─ Service Locator (auth, config, logger, telemetry)       │
│  └─ Execution Engine                                         │
└─────────────┬───────────────────────────────────────────────┘
              │
      ┌───────┴───────┬───────────┬────────────┐
      ▼               ▼           ▼            ▼
┌──────────┐    ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Plugin A │    │ Plugin B │ │ Plugin C │ │ Plugin D │
│(TypeScript)    │(TypeScript)│(Python)   │(.NET)    │
└────┬─────┘    └────┬─────┘ └────┬─────┘ └────┬─────┘
     │               │            │            │
     ▼               ▼            ▼            ▼
┌─────────────────────────────────────────────────────┐
│          External Services / APIs                    │
│  (Azure DevOps, K8s, Git, Claude API, etc.)         │
└─────────────────────────────────────────────────────┘
```

## 📦 Component Breakdown

### 1. CLI Entry Point
**Location:** `src/index.ts`  
**Responsibility:** Parse arguments, route to appropriate handler

**Modes:**
- **No args:** Interactive TUI mode
- **Command arg:** Direct execution
- **--help:** Show help

### 2. TUI (Interactive Mode)
**Location:** `src/ui/interactive.ts`  
**Technology:** `prompts` library  
**Responsibility:** User interaction for command selection

**Flow:**
1. Check config exists (init if needed)
2. Show category selection
3. Show command selection
4. Execute selected command

### 3. Orchestrator Core

#### Plugin Registry
**Location:** `src/commands/index.ts` (current), future: `src/core/plugin/`  
**Responsibility:** Maintain catalog of available commands/plugins

**Data structure:**
```typescript
{
  groups: [
    {
      name: "Category",
      commands: [
        {
          id: "command-id",
          name: "Display Name",
          description: "What it does",
          handler: async () => {...}
        }
      ]
    }
  ]
}
```

#### Service Locator
**Location:** `src/core/services/` (future)  
**Responsibility:** Provide access to cross-cutting concerns

**Services:**
- **Config:** Read/write configuration
- **Auth:** Authenticate with cloud services (future)
- **Logger:** Structured logging
- **Telemetry:** Usage tracking (future)

#### Execution Engine
**Location:** `src/core/tool-runner.ts` (for external tools)  
**Responsibility:** Execute plugins and external tools safely

**Execution types:**
1. **In-process (TypeScript plugins):** Direct function call
2. **External process (Python/.NET):** Spawn child process with JSON I/O

### 4. Plugins

**Structure:**
```
src/plugins/
  category/
    tool-name/
      manifest.json    # Metadata
      index.ts         # Entry point
      README.md        # Documentation
```

**Plugin types:**
- **Internal (TypeScript):** Implemented in TypeScript, runs in same process
- **External (Polyglot):** Executable (Python, .NET, etc.), spawned as child process

**Communication:**
- **Input:** JSON via stdin or temp file
- **Output:** JSON via stdout or temp file
- **Exit codes:** 0 = success, non-zero = failure

## 🔄 Data Flow

### Interactive Mode Flow
```
User runs `mctl`
  → Entry point checks config
  → TUI shows categories
  → User selects category
  → TUI shows commands in category
  → User selects command
  → Orchestrator loads command handler
  → Handler executes
  → Result displayed to user
```

### Direct Execution Flow
```
User runs `mctl command-id`
  → Entry point parses args
  → Orchestrator looks up command
  → Command found? Execute : Show error
  → Handler executes
  → Result displayed to user
```

### External Tool Execution Flow
```
Orchestrator calls tool
  → Prepare input JSON
  → Spawn child process (python tool.py --input input.json)
  → Tool executes
  → Tool writes output JSON
  → Orchestrator reads output
  → Parse result and return
```

## 🗂️ Directory Structure

```
m-control/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Plugin registry (will move to core/plugin/)
│   │   ├── index.ts
│   │   └── category/
│   │       └── tool/
│   ├── core/
│   │   ├── config.ts         # Config management
│   │   ├── tool-runner.ts    # External tool executor
│   │   ├── types.ts          # Shared types
│   │   └── services/         # Service abstractions (future)
│   │       ├── auth.service.ts
│   │       ├── logger.service.ts
│   │       └── telemetry.service.ts
│   └── ui/
│       └── interactive.ts    # TUI implementation
├── dist/                     # Compiled output
├── config/
│   └── config.template.json  # Config template (embedded in code)
└── scripts/
    ├── bundle.js             # Build script
    └── install.ps1           # Windows installer
```

## 🔌 Plugin Architecture

### Plugin Lifecycle
1. **Discovery:** Load from registry or scan directory (future)
2. **Validation:** Check manifest, dependencies
3. **Execution:** Call handler or spawn process
4. **Cleanup:** Release resources

### Plugin Contract
Every plugin must:
- Have unique ID
- Export async handler function (TypeScript) OR accept JSON I/O (external)
- Handle errors gracefully
- Return success/failure status

See [plugin-contract.md](plugin-contract.md) for details.

## 🌐 Hybrid Architecture (Local + Cloud)

### Local Mode (MVP)
- All execution happens locally
- Config stored in `~/.m-control/config.json`
- No network calls except to external APIs (AZDO, K8s, etc.)

### Cloud Mode (Future)
- Config sync to cloud
- License validation
- Telemetry submission
- Shared team workflows

### Hybrid Approach
- Local execution by default
- Cloud features opt-in
- Graceful degradation when offline

## 🔐 Security Considerations

### Credentials Management
- **Current:** Plaintext in config.json (user's machine)
- **Future:** OS keychain integration (Credential Manager on Windows, Keychain on Mac)

### Plugin Isolation
- TypeScript plugins: Share process (trust model)
- External tools: Separate process (OS-level isolation)

### Network Security
- Only orchestrator makes network calls
- Plugins never directly access network (except via orchestrator services)

## 📊 Technology Stack

| Component          | Technology        | Rationale                    |
|--------------------|-------------------|------------------------------|
| Language           | TypeScript        | AI-friendly, rapid iteration |
| Runtime            | Node.js 18+       | Cross-platform               |
| TUI                | prompts           | Simple, effective            |
| Build              | tsc + esbuild     | Fast, single file output     |
| Package Manager    | npm/yarn          | Standard Node.js             |
| Future Desktop     | Electron          | Easy migration from CLI      |
| Future Backend     | NestJS (.NET?)    | TBD based on needs           |

## 🚀 Evolution Path

### Current (v0.1.0)
- ✅ Basic orchestrator
- ✅ Hardcoded commands
- ✅ Config management
- ✅ TUI

### Near Future (v0.2.0)
- 🔨 Plugin discovery system
- 🔨 Service abstractions
- 🔨 External tool runner
- 🔨 Error handling improvements

### Medium Term (v0.5.0)
- License validation
- Telemetry
- Cloud config sync
- Auto-updates

### Long Term (v1.0+)
- Full cloud backend
- Marketplace
- Team features
- Desktop app (Electron)

## 🎯 Design Principles

1. **Convention over Configuration** - Sensible defaults, minimal setup
2. **Fail Fast** - Validate early, provide clear error messages
3. **Progressive Enhancement** - Core works offline, cloud adds features
4. **Separation of Concerns** - Orchestrator ≠ Tools ≠ Services
5. **Testability** - Clear boundaries for testing

## 📚 Related Documentation

- [Plugin Contract](plugin-contract.md) - How plugins work
- [Execution Model](execution-model.md) - How commands execute
- [Context Model](context-model.md) - How data flows
- [Constraints](constraints.md) - Architectural rules

---

**Last updated:** 2025-02-18  
**Next review:** After plugin architecture implementation
