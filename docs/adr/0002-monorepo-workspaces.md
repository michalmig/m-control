# ADR-0002: Monorepo with Yarn Workspaces (no Nx)

**Status:** Accepted  
**Date:** 2025-02-25  

---

## Context

m-control started as a single-package CLI (`src/`). The product roadmap includes multiple runnables that need to share code:

- `apps/mctl` — current CLI
- `apps/cloud` — future SaaS backend (subscriptions, cloud sync)
- `packages/core` — runtime engine (discovery, runner, protocol types)
- `packages/sdk` — future plugin authoring SDK

Without a monorepo, `core` would either be duplicated in each app or published as a separate npm package with its own release cycle — both painful for a project at this stage.

The question was: plain workspaces, or a full monorepo orchestrator (Nx, Turborepo, Lerna)?

---

## Decision

Use **Yarn Workspaces** (v1 classic) with a flat `apps/*/` and `packages/*/` layout. No Nx, no Turborepo for now.

---

## Rationale

### Why monorepo at all?

`@m-control/core` will be imported by both `mctl` and the future cloud backend. Without a workspace setup, you'd either:

1. Copy-paste types/runtime — instant drift
2. Publish to npm — adds release ceremony to every core change during active dev
3. `npm link` — works locally but fragile in CI and across machines

Workspaces solve this with zero ceremony: `import { Runner } from '@m-control/core'` just works.

### Why NOT Nx / Turborepo now?

| Tool | Adds | Costs |
|------|------|-------|
| Nx | Affected builds, caching, generators | Config overhead, learning curve, migration risk |
| Turborepo | Build graph caching | Another config layer, Vercel dependency |
| Plain workspaces | Package linking | None |

At 2 packages + 1 app, build times are negligible. Nx shines at 10+ packages with expensive build steps. Adding it now buys nothing and adds noise to every AI coding session context.

**Escape hatch:** Adding Nx later is non-destructive — it reads the existing workspace structure. The migration is: install Nx, run `nx init`. Zero restructuring.

### Why Yarn over npm/pnpm workspaces?

- Yarn v1 is already the preferred package manager in this project
- Yarn workspaces have the best cross-platform support for the Windows-primary workflow
- pnpm's strict node_modules layout occasionally causes issues with tools that expect hoisting

---

## Consequences

**Positive:**
- `@m-control/core` is a real importable package — clean import paths, tree-shakeable
- `apps/*` are isolated runnables — each has its own `bin`, build output, deps
- Adding a new app (e.g. `apps/cloud`) is `mkdir apps/cloud && yarn init`
- TypeScript project references (`tsconfig.json extends`) give per-package type safety

**Negative:**
- `yarn install` at root — devs must remember to run from root, not package dir
- Each package needs its own `tsconfig.json`, `package.json` — slight boilerplate per new package
- Node resolution with workspaces can surprise tools that don't understand hoisting (rare)

**Neutral:**
- `node_modules` is hoisted to root — disk space win, but some packages may misbehave (handle case-by-case)

---

## Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Single package with `src/core/` | Core can't be a proper `@m-control/core` import; cloud backend would need copy-paste or npm publish |
| Nx from day one | Premature — adds config overhead with no build-time benefit at current scale |
| pnpm workspaces | Works fine, but yarn is already established in this project; switching PMs mid-project for no gain |
| Turborepo | No caching benefit at this scale; adds Vercel dependency |

---

## Review Trigger

Revisit when any of:
- Build times exceed 60s for incremental builds
- Package count exceeds 8
- CI pipeline needs per-package affected detection
