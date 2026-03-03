# Manual Testing Guide

Personal checklist for validating that mctl works correctly after AI-generated changes.
Run through this after any significant code change before committing or merging.

**Update this file whenever you add or change a feature.**

---

## Prerequisites

### 1. Build the project

```bash
yarn build
```

Expected: no errors. Both `packages/core` and `apps/mctl` compile cleanly.

### 2. Verify the binary exists

```bash
ls apps/mctl/dist/bundle/index.js
```

### 3. Set up an alias (optional, for shorter commands)

```bash
alias mctl="node /c/Projects/m-control/apps/mctl/dist/bundle/index.js"
```

All examples below use the full `node apps/mctl/dist/bundle/index.js` form so they work without the alias.

---

## Section 1 — Help & Baseline

### 1.1 No arguments

```bash
node apps/mctl/dist/bundle/index.js
```

Expected output:
```
m-control — Michał's personal command center

Usage:
  mctl list                              List available tools
  mctl run <tool-id>                     Run a tool
  mctl run <tool-id> --json              Passthrough raw NDJSON output

  mctl work start [--project <name>]     Start a work session
  mctl work stop  [--project <name>]     Stop a work session

  mctl --help                            Show this help

Configuration:
  ~/.m-control/config.json
```

Exit code: 0

### 1.2 Explicit --help flag

```bash
node apps/mctl/dist/bundle/index.js --help
```

Expected: same output as 1.1. Exit code: 0

---

## Section 2 — mctl list

### 2.1 List tools (happy path)

```bash
node apps/mctl/dist/bundle/index.js list
```

Expected output:
```
ID           VERSION  RUNTIME  DESCRIPTION
----------------------------------------------
hello-world  0.1.0    node     Sanity-check tool — verifies the runtime pipeline end to end

1 tool found.
```

Exit code: 0

---

## Section 3 — mctl run

### 3.1 Run hello-world (happy path)

```bash
node apps/mctl/dist/bundle/index.js run hello-world
```

Expected output:
```
▶ hello-world ({})
ℹ Running in workspace: C:\Projects\m-control
ℹ Hello, World!
✓ Done
{
  "message": "Hello, World!",
  "toolId": "hello-world"
}
```

Exit code: 0

### 3.2 Run hello-world with --json flag (raw NDJSON passthrough)

```bash
node apps/mctl/dist/bundle/index.js run hello-world --json
```

Expected: raw NDJSON lines, one JSON object per line:
```
{"type":"started","ts":"...","toolId":"hello-world","payload":{"meta":{}}}
{"type":"log","ts":"...","toolId":"hello-world","payload":{"level":"info","message":"Running in workspace: ..."}}
{"type":"log","ts":"...","toolId":"hello-world","payload":{"level":"info","message":"Hello, World!"}}
{"type":"log","ts":"...","toolId":"hello-world","payload":{"level":"debug","message":"Tool context received","data":{...}}}
{"type":"result","ts":"...","toolId":"hello-world","payload":{"message":"Hello, World!","toolId":"hello-world"}}
```

Exact `ts` values vary. Exit code: 0

### 3.3 Run with no tool-id (usage error)

```bash
node apps/mctl/dist/bundle/index.js run
```

Expected (stderr):
```
Usage: mctl run <tool-id> [--json]
```

Exit code: 1

### 3.4 Run unknown tool

```bash
node apps/mctl/dist/bundle/index.js run not-a-tool
```

Expected (stdout):
```
Unknown tool: "not-a-tool"
Available: hello-world
Run 'mctl list' to see all tools.
```

Exit code: 1

---

## Section 4 — mctl work

> All `work` tests require editing `~/.m-control/config.json`.
> Back it up first: `cp ~/.m-control/config.json ~/.m-control/config.json.bak`
> Restore after: `cp ~/.m-control/config.json.bak ~/.m-control/config.json`

### 4.1 work with no subcommand (usage error)

```bash
node apps/mctl/dist/bundle/index.js work
```

Expected (stderr):
```
Usage: mctl work <start|stop> [--project <name>]
```

Exit code: 1

### 4.2 work start — no work section in config

Ensure `~/.m-control/config.json` has **no** `"work"` key (default after `mctl init`).

```bash
node apps/mctl/dist/bundle/index.js work start
```

Expected (stdout):
```
No work configuration found.
Add a "work" section to ~/.m-control/config.json to get started.
```

Exit code: 0 (informational, not an error)

### 4.3 work start — unknown project

Add a minimal `"work"` section with a `default` project only, then run with an unknown name:

```json
"work": {
  "projects": {
    "default": { "start": [] }
  }
}
```

```bash
node apps/mctl/dist/bundle/index.js work start --project does-not-exist
```

Expected (stderr):
```
Project "does-not-exist" not found in work config.
Available projects: default
```

Exit code: 1

### 4.4 work start — empty steps list

With `default.start` set to `[]`:

```bash
node apps/mctl/dist/bundle/index.js work start
```

Expected (stdout):
```
No "start" steps configured for project "default".
```

Exit code: 0

### 4.5 work start — tool and shell steps (happy path)

Set config:

```json
"work": {
  "projects": {
    "default": {
      "start": [
        { "tool": "hello-world" },
        { "shell": "echo work session started" }
      ],
      "stop": [
        { "shell": "echo work session stopped" }
      ]
    }
  }
}
```

```bash
node apps/mctl/dist/bundle/index.js work start
```

Expected (stdout):
```

Starting work session [default]

  ✓ tool: hello-world
  ✓ shell: echo work session started

2/2 steps completed.
```

Exit code: 0

### 4.6 work stop (happy path)

Using the same config as 4.5:

```bash
node apps/mctl/dist/bundle/index.js work stop
```

Expected (stdout):
```

Starting work session [default]

  ✓ shell: echo work session stopped

1/1 steps completed.
```

Exit code: 0

### 4.7 work start — fail-fast on error

Set config with a bad tool in the middle:

```json
"work": {
  "projects": {
    "default": {
      "start": [
        { "tool": "hello-world" },
        { "tool": "not-a-tool" },
        { "shell": "echo this should NOT appear" }
      ]
    }
  }
}
```

```bash
node apps/mctl/dist/bundle/index.js work start
```

Expected (stdout):
```

Starting work session [default]

  ✓ tool: hello-world
  ✗ tool: not-a-tool
    → Error: Tool "not-a-tool" not found. Available: hello-world

1/2 steps completed.
```

Verify: the third step (`echo this should NOT appear`) does **not** run. Exit code: 1

### 4.8 work start — named project

Set config with a second project:

```json
"work": {
  "projects": {
    "default": { "start": [{ "tool": "hello-world" }] },
    "myproject": { "start": [{ "shell": "echo myproject start" }] }
  }
}
```

```bash
node apps/mctl/dist/bundle/index.js work start --project myproject
```

Expected:
```

Starting work session [myproject]

  ✓ shell: echo myproject start

1/1 steps completed.
```

Exit code: 0

---

## Section 5 — Edge Cases

### 5.1 Missing config file

Temporarily rename the config:

```bash
mv ~/.m-control/config.json ~/.m-control/config.json.tmp
node apps/mctl/dist/bundle/index.js run hello-world
mv ~/.m-control/config.json.tmp ~/.m-control/config.json
```

Expected (stderr):
```
Config not found. Run mctl init to create it.
```

Exit code: 1

### 5.2 Unknown top-level command

```bash
node apps/mctl/dist/bundle/index.js foobar
```

Expected (stderr):
```
Unknown command: foobar
Run 'mctl --help' for usage.
```

Exit code: 1

---

## Checklist Summary

| # | Command | Exit | Check |
|---|---------|------|-------|
| 1.1 | `mctl` (no args) | 0 | help printed |
| 1.2 | `mctl --help` | 0 | help printed |
| 2.1 | `mctl list` | 0 | hello-world listed |
| 3.1 | `mctl run hello-world` | 0 | result printed |
| 3.2 | `mctl run hello-world --json` | 0 | NDJSON lines |
| 3.3 | `mctl run` | 1 | usage error |
| 3.4 | `mctl run not-a-tool` | 1 | unknown tool message |
| 4.1 | `mctl work` | 1 | usage error |
| 4.2 | `mctl work start` (no work section) | 0 | info message |
| 4.3 | `mctl work start --project bad` | 1 | project not found |
| 4.4 | `mctl work start` (empty steps) | 0 | no steps message |
| 4.5 | `mctl work start` (tool + shell) | 0 | ✓ both steps |
| 4.6 | `mctl work stop` | 0 | ✓ stop step |
| 4.7 | `mctl work start` (bad tool) | 1 | fail-fast, ✗ on step 2 |
| 4.8 | `mctl work start --project myproject` | 0 | named project runs |
| 5.1 | run with no config file | 1 | config not found |
| 5.2 | `mctl foobar` | 1 | unknown command |

---

*Last updated: 2026-03-03 — covers mctl list, run, work start/stop*
