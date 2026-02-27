# ADR-0003: Tool Protocol v1 — NDJSON Event Stream over stdin/stdout

**Status:** Accepted  
**Date:** 2025-02-25  

---

## Context

Tools (plugins) are separate processes. The orchestrator needs a way to:

1. **Send** input + context to a tool (request)
2. **Receive** structured output from a tool (events, result, errors)
3. **Handle** raw diagnostic output (stderr)
4. **Detect** success vs failure (exit code)

The contract must be:
- Language-agnostic (Python, .NET, PowerShell tools will use it)
- Streamable (tools should emit progress, not block until done)
- Simple to implement in any language (no special libraries required)
- Debuggable (human-readable in a terminal)

---

## Decision

**Tool Protocol v1:**

| Channel | Format | Purpose |
|---------|--------|---------|
| `stdin` | Single JSON object (`ToolRequest`) | Context + input from orchestrator |
| `stdout` | NDJSON — one `ToolEvent` JSON per line | Structured event stream |
| `stderr` | Raw text, unparsed | Diagnostic logs, stack traces |
| Exit code | `0` / `1` / `≥2` | Success / expected failure / crash |

### Event types (stdout NDJSON)

```jsonc
// started — first event, emitted immediately after init
{"type":"started","ts":"2025-02-25T10:00:00.000Z","toolId":"hello-world","payload":{}}

// log — structured human message (NOT raw stdout)
{"type":"log","ts":"...","toolId":"hello-world","payload":{"level":"info","message":"Fetching PR #42"}}

// result — final payload
{"type":"result","ts":"...","toolId":"hello-world","payload":{"prReview":"..."}}

// error — structured failure
{"type":"error","ts":"...","toolId":"hello-world","payload":{"message":"Token invalid","code":"AUTH_FAILED","recoverable":true}}
```

### stdin format

```json
{
  "context": {
    "toolId": "hello-world",
    "config": { "azdo.token": "...", "azdo.organization": "myorg" },
    "workspaceRoot": "/home/user/projects/myrepo"
  },
  "input": { "prId": 42 }
}
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success — result event emitted |
| `1` | Expected failure — error event emitted, user can fix |
| `≥2` | Crash — unhandled exception, OOM, signal |

---

## Rationale

### Why stdin/stdout over temp files?

Temp files were the previous approach (noted in execution-model.md). Problems:

- Cross-platform path handling (Windows `%TEMP%` vs `/tmp`)
- Cleanup responsibility — who deletes temp files on crash?
- Race conditions if orchestrator reads before tool finishes writing
- No streaming — tool must complete before orchestrator sees anything

stdin/stdout is universally available, doesn't touch the filesystem, and streams naturally.

### Why NDJSON on stdout, not plain JSON?

Plain JSON (`[event1, event2, ...]`) requires buffering the entire output before parsing. NDJSON (one JSON object per line) allows:

- Line-by-line streaming: orchestrator processes events as they arrive
- Early display of `log` events before `result` is ready
- No framing protocol needed — newline is the delimiter
- Easy to implement in any language: `json.dumps(event) + '\n'`
- Easy to debug: `mctl run hello-world | cat`

### Why `ts` and `toolId` in every event?

- `ts` enables latency profiling without external instrumentation
- `toolId` makes the stream self-describing — future multiplexing of parallel tools requires no protocol change
- Both fields are cheap to add now, expensive to add later without a protocol version bump

### Why strict stdout = NDJSON only?

If tools can mix raw prints and NDJSON on stdout, the parser becomes a heuristic. One tool doing `print("debug")` breaks the orchestrator's NDJSON parser. Strict separation makes the contract enforceable:

> "If it's on stdout, it's a ToolEvent. If it's for human eyes, use `log` event or stderr."

### Why `--json` flag on `mctl run`?

Passes raw NDJSON to caller's stdout. Enables:
```bash
mctl run azdo-pr-review --json | jq '.payload'
mctl run azdo-pr-review --json > result.ndjson
```
Zero overhead — the orchestrator just doesn't pretty-print.

---

## Consequences

**Positive:**
- Streamable output: `log` events appear live in the terminal
- Protocol is trivial to implement in Python, C#, PowerShell — just `print(json.dumps(event))`
- `--json` flag makes tools composable (piping, scripting)
- `ts` in every event gives free profiling data

**Negative:**
- Tools must never use raw `print` / `console.log` to stdout — discipline required
- NDJSON parser in runner must handle malformed lines gracefully (don't crash orchestrator)
- Binary output (e.g. generated files) can't go through this channel — must use filesystem

**Neutral:**
- stdin blocking: tool must read all of stdin before executing (one-shot, not streaming input)
- This is fine for current use cases; bidirectional streaming deferred to protocol v2

---

## Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Temp files (JSON in, JSON out) | No streaming, path issues on Windows, cleanup burden |
| Named pipes | OS-specific implementation, complexity not justified |
| HTTP server (each tool is an HTTP server) | Massive overhead for a CLI tool; port conflicts; lifecycle management |
| gRPC | Language-neutral but requires protobuf schema + codegen per language |
| Streaming JSON array | Can't parse until EOF; not streamable |
| Plain text stdout | Not machine-parseable; impossible to distinguish log lines from structured data |

---

## Review Trigger

Revisit when:
- Bidirectional streaming is needed (tool needs to ask user a question mid-execution)
- Binary payloads need to be returned through the protocol
- Protocol v2 is defined (bump `manifestVersion` accordingly)
