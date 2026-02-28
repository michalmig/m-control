# m-control — AI Project Context

**Read this FIRST when starting a new AI session.**

## What is m-control?

A personal CLI orchestrator for developer productivity — discovers and runs standalone tool processes. Personal use today, SaaS product for developer teams tomorrow.

**Current phase:** MVP — building for personal use (Michał's workflow)
**Future:** SaaS product for developer teams
**Tech stack:** TypeScript monorepo, Node.js CLI, polyglot tool processes

---

## Current state (as of 2026-02-28)

### What works

- ✅ Yarn workspaces monorepo (`apps/mctl`, `packages/core`)
- ✅ `@m-control/core` — runtime engine: tool discovery, protocol types, runner interface
- ✅ `@m-control/mctl` — CLI: `mctl list`, `mctl run <id>`, `mctl --help`
- ✅ Tool Protocol v1 — NDJSON stdout / JSON stdin / exit codes (ADR-0003)
- ✅ `hello-world` tool in `tools/misc/hello-world/`
- ✅ ncc bundle at `apps/mctl/dist/bundle/index.js` (single self-contained file)
- ✅ ESLint + Prettier + TypeScript strict mode
- ✅ GitHub Actions CI — typecheck, lint, build, smoke test on push/PR to main/develop
- ✅ Windows installer: `scripts/install.ps1`

### What's next

- 🔨 First real tool: AZDO PR review (Claude-powered)
- 🔨 Kubernetes pod inspector
- 🔨 Service abstractions (auth, logger, telemetry stubs)

### Roadmap

- v0.5: License system
- v1.0: Cloud backend, Stream Deck integration
- v1.0+: Marketplace

---

## Monorepo structure

```
m-control/
├── apps/mctl/          # CLI binary (@m-control/mctl)
│   └── dist/bundle/    # ncc output — index.js is the runnable binary
├── packages/core/      # Runtime engine (@m-control/core) — library, no I/O
│   └── dist/           # TypeScript compiled output
├── tools/              # Standalone tool processes (NOT npm packages)
│   └── misc/hello-world/
├── templates/          # Boilerplate for new tools
├── docs/               # Architecture, ADRs, AI context
└── scripts/            # install.ps1
```

**Build output:** `apps/mctl/dist/bundle/index.js` — run with `node apps/mctl/dist/bundle/index.js`

---

## Build order (critical)

```bash
yarn install                            # from monorepo root always
yarn workspace @m-control/core build    # FIRST
yarn workspace @m-control/mctl build    # SECOND (imports core/dist)
yarn build                              # runs both in correct order
```

---

## CI pipeline (GitHub Actions)

Pipeline: `.github/workflows/ci.yml`
Triggers: push or PR to `main` or `develop`

Steps:
1. Checkout
2. Setup Node 22
3. `yarn install --frozen-lockfile`
4. `yarn typecheck` — type-check all packages
5. `yarn lint` — lint all packages
6. `yarn build` — core then mctl
7. Smoke test: `node apps/mctl/dist/bundle/index.js --help`

---

## Branching strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, releasable. Version tags here only. |
| `develop` | Active development. Direct commits while solo. |

- Day-to-day work goes to `develop` directly (no self-PRs while solo)
- `main` is updated by merging `develop` at milestones
- CI gates both branches
- See ADR-0005 for the full rationale

---

## Backlog

GitHub Projects is the backlog tool. Issues use templates from `.github/ISSUE_TEMPLATE/` (feature, bug).

---

## Architecture overview

```
User
  ↓
mctl CLI (apps/mctl)
  ↓
@m-control/core
  ├─ discoverTools()     — scans tools/ for manifest.json
  ├─ ToolRunner          — spawns process, reads NDJSON stdout
  └─ Types               — ToolRequest, ToolEvent, ToolManifest
  ↓
Tool process (tools/<category>/<id>/)
  ├─ stdin  → JSON ToolRequest
  ├─ stdout → NDJSON ToolEvent stream
  └─ stderr → raw diagnostic logs
```

**Key principle:** Core coordinates, tools execute. Core has no I/O of its own.

---

## Key constraints (MUST READ)

### Never
- `console.log` in production code in `packages/` or `apps/` — use EventSink
- Hardcode paths — use `path.resolve()` or config
- Modify `packages/core` public API without updating `src/index.ts`
- Raw stdout in tools — all output via ToolEvent NDJSON
- Import from `packages/core/src/` directly — use the package name `@m-control/core`
- Store credentials in plaintext logs
- Break config compatibility without migration

### Always
- Use structured logging
- Validate user input
- Handle errors gracefully with actionable messages
- Think: "Does this work local AND cloud?"
- Document WHY not just WHAT (ADRs for architecture decisions)

**Full list:** `docs/architecture/constraints.md`

---

## Error handling

Use the error class hierarchy — never throw raw `Error`:

```typescript
import { ConfigError, ManifestError, RunnerError } from '@m-control/core';
throw new ConfigError('configVersion mismatch: expected 1, got 2. Delete ~/.m-control/config.json and run mctl init.');
```

**Full guide:** `.claude/rules/errors.md`

---

## Adding a tool

1. Copy `templates/tool-boilerplate/` to `tools/<category>/<id>/`
2. Edit `manifest.json` — set `manifestVersion: 1`, `id`, `runtime`, `entry`
3. Implement the entry file:
   - Read all stdin before executing (JSON ToolRequest)
   - Emit NDJSON ToolEvent lines to stdout — never raw `console.log`
   - Emit: `started` → zero or more `log` → `result` or `error`
4. Discovery is automatic — no registration step

**Full protocol:** `docs/architecture/execution-model.md`

---

## Common tasks

```bash
yarn install                            # install dependencies (from root)
yarn typecheck                          # type-check all packages
yarn lint                               # lint all packages
yarn build                              # full build
node apps/mctl/dist/bundle/index.js list          # list tools
node apps/mctl/dist/bundle/index.js run hello-world
```

---

## Where to find things

| Question | File |
|----------|------|
| Architecture rules | `docs/architecture/constraints.md` |
| Tool Protocol spec | `docs/architecture/execution-model.md` |
| Code patterns | `docs/ai/CODING-GUIDELINES.md` |
| Anti-patterns | `docs/ai/ANTI-PATTERNS.md` |
| Past decisions | `docs/adr/` |
| Product vision | `docs/VISION.md` |
| First run guide | `QUICKSTART.md` |

---

## Red flags in AI-generated code

Stop and review if you see:
- `console.log` in `packages/` or `apps/`
- Hardcoded paths (should use `path.resolve()` or config)
- `any` type without a comment explaining why
- Breaking config changes without a migration path
- Direct access to `packages/core/src/` internals
- Synchronous I/O (`readFileSync` etc.) in the hot path

---

**Last updated:** 2026-02-28
