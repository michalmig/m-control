---
globs: ["packages/**/*.ts", "apps/**/*.ts"]
---

# Error Handling Rules

## Use the error hierarchy — never throw raw Error
```typescript
// CORRECT
import { ConfigError, ManifestError, RunnerError } from '@m-control/core';
throw new ConfigError('Config not found. Run mctl init.');

// WRONG
throw new Error('config not found');
```

## Error classes
- `ConfigError` — config missing, wrong version, unreadable
- `ManifestError` — manifest invalid, bad version, bad schema
- `DiscoveryError` — tools root unreadable (not individual manifests)
- `RunnerError` — process spawn, process error
- `RunnerGuardrailError` — timeout / maxOutputBytes / maxEvents
- `NotImplementedError` — runtime not yet supported

## Error messages must be actionable
Bad:  `throw new ConfigError('Invalid config')`
Good: `throw new ConfigError('configVersion mismatch: expected 1, got 2. Delete ~/.m-control/config.json and run mctl init.')`

## Never swallow errors silently
```typescript
// WRONG
try { ... } catch { }

// CORRECT — at minimum log, preferably rethrow with context
try { ... } catch (err) {
  throw new RunnerError(`Failed to spawn ${toolId}: ${err instanceof Error ? err.message : String(err)}`);
}
```
