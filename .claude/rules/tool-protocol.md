---
globs: ["tools/**/*", "packages/core/src/runner/**/*", "packages/core/src/types.ts"]
---

# Tool Protocol v1 Rules

## stdout — NDJSON only
Every line emitted to stdout MUST be a valid ToolEvent JSON object.
Never emit raw text to stdout. Use `log` events or stderr for human output.

```js
// CORRECT
process.stdout.write(JSON.stringify({ type: 'log', ts: new Date().toISOString(), toolId: 'my-tool', payload: { level: 'info', message: 'Hello' } }) + '\n');

// WRONG — breaks the orchestrator NDJSON parser
console.log('Hello');
```

## Required event sequence
1. `started` — emit immediately, before any work
2. `log` — zero or more, for progress/debug
3. `result` (success) OR `error` (expected failure)
4. Exit 0 (success) / 1 (expected failure) / ≥2 (crash)

## stdin — read all before executing
```js
// Tools MUST read stdin to EOF before doing any work
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const req = JSON.parse(Buffer.concat(chunks).toString());
  // now execute
});
```

## Every event requires ts and toolId
```js
{ type, ts: new Date().toISOString(), toolId: manifest.id, payload }
```

## error.recoverable
- `true` — user can fix (bad config, bad input, missing credentials)
- `false` — bug, should be reported to developer
