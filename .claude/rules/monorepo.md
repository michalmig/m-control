---
globs: ["packages/**/*", "apps/**/*", "package.json", "tsconfig*.json"]
---

# Monorepo Rules

## Package boundaries
- `packages/core` exports ONLY via `src/index.ts` — never import internal paths from outside
- `apps/mctl` imports `@m-control/core` (not relative paths into packages/)
- Tools in `tools/` are NOT npm packages — do not add them to workspaces

## Adding a new package
1. Create `packages/<name>/` with `package.json` (name: `@m-control/<name>`) and `tsconfig.json`
2. `tsconfig.json` must extend `../../tsconfig.base.json`
3. Add to root `package.json` workspaces if not covered by `packages/*` glob
4. Run `yarn install` from root

## TypeScript
- All packages use `tsconfig.base.json` compiler options
- Each package has its own `outDir: ./dist` and `rootDir: ./src`
- `core` must be built before any package that imports it

## Dependencies
- devDependencies shared across packages go in root `package.json`
- Runtime deps specific to a package go in that package's `package.json`
- `@types/node` is declared per-package (not hoisted) — keep it that way

## Never
- Import from `packages/core/src/` directly (use the package name `@m-control/core`)
- Add a `bin` field to `packages/core/package.json` (it's a library)
- Run `yarn install` from inside a package directory
