# ADR-0004: CLI Distribution Strategy

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Michał + Claude
**Tags:** distribution, build, cli

## Context

`mctl` lives in a monorepo alongside `@m-control/core`. The CLI imports core as a workspace package (`"@m-control/core": "*"`). This works inside the repo because Yarn workspaces symlink `node_modules/@m-control/core` to `packages/core/dist/`. Outside the repo — on an end-user's machine — that symlink does not exist and the import fails.

The project is currently a personal tool evolving toward SaaS. The install story needs to be simple enough for a solo developer, but must not create unnecessary debt when the first external users arrive.

## Decision

Bundle `apps/mctl` with **ncc** (`@vercel/ncc`) at build time.

ncc compiles the TypeScript output (`dist/index.js`) and all its transitive dependencies into a single `dist/bundle/index.js` file. The installer copies only that one file to `~/.m-control/mctl.js`. The `.cmd` wrappers invoke `node mctl.js` directly — no `node_modules` required on the target machine.

Build script in `apps/mctl/package.json`:
```
tsc -p tsconfig.json && ncc build dist/index.js -o dist/bundle --minify
```

## Consequences

### Positive
- ✅ Zero-configuration install — one file, works anywhere Node.js is present
- ✅ Simple installer — `Copy-Item` a single JS file, no directory tree needed
- ✅ No dependency on repo being on disk at runtime
- ✅ Faster cold start (no module resolution traversal)

### Negative
- ❌ Bundle grows with every new dependency added to core or mctl
- ❌ Native addons (`.node` files) are not supported by ncc — incompatible with future native deps
- ❌ Production debugging is harder — minified single file, stack traces are less readable
- ❌ End users get the entire bundle on each update; no partial/differential updates

### Neutral
- ⚪ ncc is a devDependency — no runtime overhead, only affects build step
- ⚪ `dist/index.js` (TypeScript output) is still produced and used for local `ts-node` dev

## Alternatives Considered

### Option A: Run-from-repo
**Description:** `.cmd` wrappers point directly into the checked-out repo (e.g. `node C:\repos\m-control\apps\mctl\dist\index.js`).

**Pros:**
- No bundler needed
- Updates take effect immediately after `git pull && yarn build`

**Cons:**
- Breaks for any machine without the repo checked out at a fixed path
- Ties install location to repo location — fragile for a tool meant to be installed globally

**Why rejected:** Fundamentally wrong distribution model. Does not scale beyond the author's own machine.

### Option B: npm publish
**Description:** Publish `@m-control/mctl` to npm (public or private registry); users install via `npm install -g @m-control/mctl`.

**Pros:**
- Correct long-term model — semantic versioning, partial updates, standard tooling
- `@m-control/core` can also be published and resolved normally by npm

**Cons:**
- Requires npm account, publish pipeline, version discipline
- Premature overhead for a tool with zero external users

**Why rejected:** Correct endgame, but too much overhead for MVP. Revisit when onboarding the first external user.

### Option C: pkg / Deno compile (native binary)
**Description:** Compile mctl to a self-contained native executable using `pkg` or Deno's compile feature.

**Pros:**
- No Node.js runtime required on target machine
- Single binary, clean distribution

**Cons:**
- `pkg` is largely unmaintained; Deno compile requires rewriting in Deno/TypeScript without npm
- Significant toolchain complexity
- Overkill for a tool targeting developers who already have Node.js

**Why rejected:** Engineering overhead not justified at this stage.

## Implementation Notes

- `ncc` is pinned in `apps/mctl` devDependencies (not root) — it is mctl-specific
- Root `package.json` build script already sequences core before mctl: `yarn workspace @m-control/core build && yarn workspace @m-control/mctl build`
- The installer (`scripts/install.ps1`) checks for `dist/bundle/index.js` existence before copying

## Related Decisions

- **Related to:** ADR-0001 (TypeScript Orchestrator — same Node.js runtime dependency reasoning)
- **Superseded by:** future ADR when migrating to `npm publish`

## References

- [ncc GitHub](https://github.com/vercel/ncc)
- ADR-0001: `docs/adr/0001-typescript-orchestrator.md`
