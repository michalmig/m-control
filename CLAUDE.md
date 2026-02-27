# m-control — Claude Code Context

## Project
Personal CLI orchestrator evolving toward SaaS. TypeScript monorepo.
- `packages/core` — runtime engine (`@m-control/core`), library only, no I/O
- `apps/mctl` — CLI binary, imports core
- `tools/` — standalone tool processes (NOT npm packages)
- Current phase: MVP runtime skeleton complete, building real tools next

## Always Read First
- `docs/ai/PROJECT-CONTEXT.md` — full product context
- `docs/architecture/constraints.md` — hard rules (the constitution)
- `docs/architecture/execution-model.md` — Tool Protocol v1 spec
- `docs/ai/CODING-GUIDELINES.md` — patterns and naming

## Build Order (critical)
```
yarn install          # from monorepo root always
yarn workspace @m-control/core build   # FIRST
yarn workspace @m-control/mctl build   # SECOND (imports core/dist)
yarn build            # runs both in correct order
```

## Stack
- TypeScript strict mode, Node 18+, Yarn workspaces
- `tsconfig.base.json` at root, extended by each package
- ESLint + Prettier (configs at root)
- No test framework yet — TBD (Jest or Vitest)

## Key Contracts
- Every tool needs `manifest.json` with `manifestVersion: 1`, `id`, `runtime`, `entry`
- Tool stdout = ONLY NDJSON ToolEvent lines. Never raw console.log to stdout in tools.
- Tool stdin = single JSON ToolRequest, read to EOF before executing
- `packages/core/src/types.ts` is the source of truth for all interfaces

## Adding a Tool
1. Create `tools/<category>/<id>/` with `manifest.json` + entry file
2. No registration — discovery is automatic (`discoverTools()`)
3. Copy `templates/tool-boilerplate/` as starting point
4. Node tools: plain `.js`, no build step, no TS

## ADR
Write ADR in `docs/adr/` for any architectural decision. Use `docs/adr/TEMPLATE.md`.
Next number: check `docs/adr/` and increment.

## Never
- `console.log` in production code in `packages/` or `apps/` (use EventSink)
- Hardcode paths — use `path.resolve()` or config
- Modify `packages/core` public API without updating `src/index.ts`
- Raw stdout in tools — all output via ToolEvent NDJSON
