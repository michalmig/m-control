# m-control - AI Project Context

**Read this FIRST when starting a new AI session.**

## 🎯 What is m-control?

An AI-powered CLI orchestrator for developer productivity. Think "personal command center" that automates repetitive dev workflows using Claude/GPT.

**Current Phase:** MVP - Building for personal use (Michał's workflow)  
**Future:** SaaS product for developer teams  
**Tech Stack:** TypeScript CLI, hybrid local/cloud architecture

---

## 📊 Current State

### What Works Now (v0.1.0)
- ✅ TypeScript orchestrator with TUI (prompts library)
- ✅ Command registry with grouped commands
- ✅ Config management (auto-init on first run)
- ✅ Hello-world test command
- ✅ Interactive mode: `mctl` → select category → select command
- ✅ Direct mode: `mctl hello-world`
- ✅ Help: `mctl --help`
- ✅ Build system (tsc + esbuild)
- ✅ Documentation structure (you're reading it!)

### What's Next (Immediate)
- 🔨 Plugin architecture (dynamic discovery)
- 🔨 Service abstractions (auth, logger, telemetry - stubs)
- 🔨 First real tool: AZDO PR review (Claude-powered)
- 🔨 External tool runner (Python/.NET support)

### What's Later (Roadmap)
- License system (v0.5)
- Cloud backend (v1.0)
- Stream Deck integration (v1.0)
- Marketplace (v1.0+)

---

## 🏗️ Architecture Overview

```
User
  ↓
CLI Entry (mctl/mm)
  ↓
TUI (interactive) OR Direct execution
  ↓
Orchestrator Core
  ├─ Plugin Registry
  ├─ Services (config, logger, auth, telemetry)
  └─ Execution Engine
  ↓
Plugins (TypeScript or external: Python, .NET, etc.)
  ↓
External APIs (Azure DevOps, K8s, Claude API, etc.)
```

**Key principle:** Orchestrator coordinates, plugins execute.

---

## 🔑 Key Constraints (MUST READ)

### 🚫 NEVER:
- ❌ Store credentials in plaintext logs
- ❌ Hardcode API endpoints or tokens
- ❌ Break config compatibility without migration
- ❌ Use `console.log` (use logger abstraction)
- ❌ Couple plugins to orchestrator internals
- ❌ Assume Windows or Linux exclusively

### ✅ ALWAYS:
- ✅ Use structured logging
- ✅ Validate user input
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Think: "Does this work local AND cloud?"
- ✅ Document WHY not just WHAT

**Full list:** See `docs/architecture/constraints.md`

---

## 📂 Project Structure

```
m-control/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Plugin registry (will move to core/plugin/)
│   ├── core/
│   │   ├── config.ts         # Config management
│   │   ├── tool-runner.ts    # External tool executor
│   │   ├── types.ts          # Shared types
│   │   └── services/         # Service abstractions (future)
│   └── ui/
│       └── interactive.ts    # TUI implementation
├── docs/                     # You are here!
├── templates/                # Boilerplate for new tools
└── scripts/                  # Build & install
```

---

## 🎨 Code Style

**Enforced by tools:**
- ESLint + Prettier (run `npm run format`)
- TypeScript strict mode

**Manual guidelines:**
- Async/await > callbacks
- Explicit types in function signatures
- Early validation (fail fast)
- Clear error messages

**Full guide:** See `docs/ai/CODING-GUIDELINES.md`

---

## 🧰 Development Workflow

### Adding New Tool/Plugin
```bash
# 1. Use template
cp -r templates/tool-boilerplate src/plugins/category/new-tool

# 2. Edit manifest.json (id, name, description)

# 3. Implement in index.ts

# 4. Test
npm run dev new-tool

# 5. Add to registry (src/commands/index.ts)

# 6. Build
npm run build
```

**Detailed guide:** See `docs/ai/PROMPTS/implement-tool.md`

---

## 🔧 Common Tasks

### Run in Dev Mode
```bash
npm run dev              # Interactive
npm run dev hello-world  # Direct command
```

### Build for Production
```bash
npm run build
```

### Format & Lint
```bash
npm run format
npm run lint
```

### Install Locally (Windows)
```bash
.\scripts\install.ps1
```

---

## 📚 Where to Find Information

### Architecture Questions?
- **High-level:** `docs/architecture/OVERVIEW.md`
- **Plugins:** `docs/architecture/plugin-contract.md`
- **Execution:** `docs/architecture/execution-model.md`
- **Context:** `docs/architecture/context-model.md`
- **Rules:** `docs/architecture/constraints.md` ⚠️ CRITICAL

### Past Decisions?
- **ADRs:** `docs/adr/` (Architecture Decision Records)
- **Template:** `docs/adr/TEMPLATE.md`

### Product Vision?
- **Vision:** `docs/VISION.md`
- **Roadmap:** `docs/VISION.md#roadmap-summary`

### What Went Wrong Before?
- **Anti-patterns:** `docs/ai/ANTI-PATTERNS.md`
- **Lessons learned:** `LESSONS-LEARNED.md`

---

## 🎯 Current Focus

**Week of 2025-02-18:**
- Implementing plugin architecture
- Adding first real tool (AZDO PR review)
- Testing with Stream Deck

**This Month:**
- 5-10 core tools operational
- Daily personal use
- Architecture validated

**This Quarter:**
- Beta testing with 10-20 users
- Cloud features scoped
- Revenue model decided

---

## 💡 Quick Context Snippets

### For New Feature
```
I'm adding [FEATURE] to m-control.
Context: @docs/ai/PROJECT-CONTEXT.md
Constraints: @docs/architecture/constraints.md
Pattern: @docs/ai/PROMPTS/implement-tool.md
```

### For Architecture Change
```
I'm changing [COMPONENT] because [REASON].
Review: @docs/architecture/OVERVIEW.md
Past decisions: @docs/adr/
Create ADR: @docs/adr/TEMPLATE.md
```

### For Bug Fix
```
Issue: [DESCRIPTION]
Check anti-patterns: @docs/ai/ANTI-PATTERNS.md
Check constraints: @docs/architecture/constraints.md
```

---

## 🚨 Red Flags

If you see any of these in AI-generated code, STOP and review:

- ❌ `console.log` in production code
- ❌ Hardcoded paths (use `path.join` + env)
- ❌ `any` type without comment
- ❌ Breaking config changes without migration
- ❌ Direct config access in plugins (use context)
- ❌ Synchronous I/O (`readFileSync`, etc.)

---

## 🎓 Mental Model

Think of m-control as:
- **Orchestrator:** Air traffic controller (coordinates, doesn't fly)
- **Plugins:** Airplanes (do the actual work)
- **Config:** Flight plans (how things should work)
- **Services:** Airport infrastructure (shared utilities)

**Orchestrator should be dumb and stable.**  
**Plugins should be smart and replaceable.**

---

## 🤝 Working with This AI Session

### What I Know
- Project structure and architecture
- Constraints and best practices
- Past decisions (ADRs)
- Code patterns

### What I Don't Know (Ask Michał)
- Specific business requirements
- Token/API credentials
- Personal preferences on UX
- Priority of features

### How to Use Me
1. Reference docs: `@docs/ai/PROJECT-CONTEXT.md`
2. Ask specific questions: "How should I implement X?"
3. Request code: "Implement Y following constraints"
4. Review architecture: "Is this approach good for m-control?"

---

## 📝 Document Updates

When making significant changes:
1. **ADR:** If architectural decision → `docs/adr/XXXX-*.md`
2. **Anti-pattern:** If mistake made → `docs/ai/ANTI-PATTERNS.md`
3. **Lesson:** If pivot/insight → `LESSONS-LEARNED.md`
4. **Constraint:** If new rule → `docs/architecture/constraints.md`

---

## 🎯 Success Criteria

**This session is successful if:**
- Code follows constraints
- No breaking changes without migration
- User-friendly error messages
- Documentation updated (if needed)
- Tests pass (when we have them)

---

**Last updated:** 2025-02-18  
**Next review:** When architecture changes significantly

---

## Quick Links

- [Constraints](../architecture/constraints.md) ← START HERE
- [Coding Guidelines](CODING-GUIDELINES.md)
- [Anti-Patterns](ANTI-PATTERNS.md)
- [Prompt Templates](PROMPTS/)
- [Vision](../VISION.md)
