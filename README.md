# m-control

Michał's personal CLI orchestrator — discovers and runs standalone tool processes from a single `mctl` command. Evolving toward a SaaS product for developer teams.

## Features

- Tool discovery — drop a `manifest.json` in `tools/`, it just works
- NDJSON event streaming — live progress from long-running tools
- Polyglot runtime — tools can be Node.js, Python, .NET, or anything else
- Cross-platform — Windows primary, Linux secondary

## Requirements

- Node.js 18.0.0 or higher
- Yarn 1.22+

## Project structure

```
m-control/
├── apps/mctl/          # CLI binary (@m-control/mctl)
│   └── dist/bundle/    # Build output — index.js (ncc bundle)
├── packages/core/      # Runtime engine (@m-control/core) — library only
├── tools/              # Standalone tool processes (NOT npm packages)
│   └── misc/
│       └── hello-world/
├── templates/          # Boilerplate for new tools
├── docs/               # Architecture docs, ADRs, AI context
└── scripts/            # install.ps1 (Windows)
```

## Installation

### Windows

```powershell
.\scripts\install.ps1
```

This builds the project, copies `apps/mctl/dist/bundle/index.js` to `%USERPROFILE%\.m-control\`, adds `mctl` to PATH, and initializes config.

**Restart your terminal after installation.**

## Usage

```bash
mctl list               # list all discovered tools
mctl run hello-world    # run the hello-world tool
mctl --help             # show help
```

## Build

Always run from the monorepo root:

```bash
yarn install
yarn build
```

Build order is enforced: `@m-control/core` is built first, then `@m-control/mctl`. The final output is `apps/mctl/dist/bundle/index.js`.

To verify:

```bash
node apps/mctl/dist/bundle/index.js --help
```

## Development

```bash
yarn typecheck     # type-check all packages
yarn lint          # lint all packages
yarn build         # full build (core then mctl)
```

See `QUICKSTART.md` for a complete getting-started walkthrough.

## Branching strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, releasable. Tags here only. |
| `develop` | Active development. Direct commits while solo. |

CI runs on both branches. See `CONTRIBUTING.md` for details.

## Adding a tool

1. Copy `templates/tool-boilerplate/` to `tools/<category>/<id>/`
2. Edit `manifest.json` — set `id`, `runtime`, `entry`
3. Implement the entry file following Tool Protocol v1 (NDJSON stdout, JSON stdin)
4. No registration needed — discovery is automatic

See `docs/architecture/execution-model.md` for the protocol spec.

## Documentation

- `QUICKSTART.md` — step-by-step first-run guide
- `CONTRIBUTING.md` — branching, CI, commit conventions
- `docs/ai/PROJECT-CONTEXT.md` — AI session primer
- `docs/architecture/` — architecture docs and constraints
- `docs/adr/` — architecture decision records

## License

MIT
