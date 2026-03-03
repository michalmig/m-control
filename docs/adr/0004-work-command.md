# ADR-0004: `work` — Built-in Orchestrator Command for Sequential Step Execution

**Status:** Accepted
**Date:** 2026-03-03
**Deciders:** Michał + Claude
**Tags:** architecture, cli, config

---

## Context

As daily usage of m-control grows, there's a recurring need to run a fixed sequence of actions at the start and end of a work context (e.g. "start client-acme work session"). These sequences mix tool invocations (`mctl run <id>`) and shell commands.

Options considered:
1. A shell script wrapping multiple `mctl run` calls
2. A discoverable tool that orchestrates other tools
3. A built-in CLI command with config-driven step lists

The shell script approach works but puts orchestration outside m-control (no visibility, no summary). Implementing it as a tool would violate the tool isolation principle — tools are not supposed to know about or invoke other tools via the orchestrator.

A built-in command has full access to orchestrator internals (discovery, runner) and can be driven by config, keeping workflow definitions in one place.

## Decision

Add `mctl work <start|stop> [--project <name>]` as a **built-in orchestrator command** (not a discoverable tool). Project steps are declared in `~/.m-control/config.json` under a new optional `"work"` top-level key:

```json
{
  "configVersion": 1,
  "tools": { ... },
  "work": {
    "projects": {
      "default": {
        "start": [
          { "tool": "hello-world", "input": { "name": "Michał" } },
          { "shell": "echo 'Work started'" }
        ],
        "stop": [
          { "shell": "echo 'Work stopped'" }
        ]
      }
    }
  }
}
```

Each step is a discriminated union: `{ tool, input? }` or `{ shell }`.

Execution semantics:
- **Sequential** — one step at a time
- **Fail-fast** — stop on first failure, print partial summary
- **Stateless** — no session tracking, no PID management

### Implementation

| File | Role |
|---|---|
| `apps/mctl/src/commands/work/index.ts` | Arg parsing, config validation, execution loop, summary output |
| `apps/mctl/src/commands/work/executor.ts` | `executeStep()` — dispatches to tool or shell execution |
| `apps/mctl/src/commands/work/types.ts` | `StepResult` interface |
| `packages/core/src/types.ts` | `WorkStep`, `WorkProjectConfig`, `WorkConfig` added; `MControlConfig.work?` added |

Tool steps reuse the existing `discoverTools` + `getRunner` infrastructure. Shell steps spawn `sh -c` (Unix) or `cmd /c` (Windows).

## Consequences

### Positive
- ✅ Workflow definitions live in config alongside credentials — one file to manage
- ✅ Reuses existing tool discovery and runner infrastructure — no duplication
- ✅ Step-by-step terminal summary gives clear pass/fail visibility
- ✅ Adding a new project or step requires no code change
- ✅ Cross-platform shell execution handled centrally

### Negative
- ❌ Config schema grows — `work` section adds cognitive overhead for users who don't need it
- ❌ No parallel execution — sequential-only is a deliberate constraint for now
- ❌ No idempotency or state tracking — `work start` run twice does everything twice

### Neutral
- ⚪ `work` is a built-in command, not a discoverable tool — it has a privileged relationship with orchestrator internals. This is intentional but creates a two-tier model (built-ins vs. tools).
- ⚪ The `work` config section is optional — existing configs without it continue to work unchanged.

## Alternatives Considered

### Option A: Shell script wrapper
**Description:** User writes a shell script that calls `mctl run <id>` for each step.

**Pros:** Zero changes to m-control codebase.

**Cons:** Workflow lives outside the tool. No structured summary. Duplicates orchestration logic. Defeats the purpose of having an orchestrator.

**Why rejected:** Degrades UX and loses observability.

### Option B: Implement as a discoverable tool
**Description:** A tool in `tools/` that reads config and invokes other tools.

**Pros:** No special-casing in the CLI.

**Cons:** Violates tool isolation (tools should not orchestrate other tools). Would need to either re-implement discovery + runner inside the tool (duplication) or create a privileged IPC channel between tool and orchestrator (complexity).

**Why rejected:** Wrong layer — orchestration belongs to the orchestrator.

### Option C: Built-in command (chosen)
**Description:** First-class CLI command with config-driven steps.

**Pros:** Full access to orchestrator internals. Clean UX. Config co-location.

**Cons:** Adds a built-in/tool two-tier model.

**Why chosen:** Best balance of capability, simplicity, and consistency with existing patterns.

## Related Decisions

- **Depends on:** ADR-0003 (Tool Protocol v1 — tool steps use the same runner)
- **Related to:** ADR-0001 (TypeScript orchestrator — built-ins live in `apps/mctl`)
