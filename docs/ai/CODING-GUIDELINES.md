# Coding Guidelines

Code style and patterns for m-control development.

## 🎯 Principles

1. **Clarity over Cleverness** - Readable > Clever
2. **Fail Fast** - Validate early, error clearly
3. **Explicit over Implicit** - Be obvious
4. **Future-Proof** - Think: local AND cloud
5. **User-Centric** - Error messages for humans, not machines

---

## 📝 TypeScript Style

### Type Annotations

```typescript
// ✅ GOOD - Explicit function signatures
export async function fetchPullRequest(
  prId: number,
  organization: string
): Promise<PullRequest> {
  // ...
}

// ❌ BAD - Inferred return type (unclear)
export async function fetchPullRequest(prId, organization) {
  // ...
}
```

### Any Type

```typescript
// ❌ BAD - No justification
function process(data: any) { ... }

// ✅ GOOD - Unknown with narrowing
function process(data: unknown) {
  if (typeof data === 'string') {
    // Use as string
  }
}

// ✅ ACCEPTABLE - With justification
function legacyAdapter(data: any) { 
  // External API has no types available
  // TODO: Create interface from API docs
  ...
}
```

### Async/Await

```typescript
// ✅ GOOD - Async/await
async function loadData() {
  const data = await fetchFromAPI();
  return process(data);
}

// ❌ BAD - Callbacks
function loadData(callback) {
  fetchFromAPI((data) => {
    process(data, (result) => {
      callback(result);
    });
  });
}
```

---

## 🗂️ File Organization

### Import Order

```typescript
// 1. Node.js built-ins
import * as fs from 'fs';
import * as path from 'path';

// 2. External dependencies
import prompts from 'prompts';

// 3. Internal - absolute imports (future)
// import { Config } from '@/core/config';

// 4. Internal - relative imports
import { Command } from './types';
import { loadConfig } from '../core/config';
```

### File Naming

```
kebab-case.ts         ✅ For TypeScript files
PascalCase.ts         ❌ No (except React components - not applicable here)
snake_case.ts         ❌ No
camelCase.ts          ❌ No
```

**Examples:**
- `azdo-review.ts` ✅
- `pull-request.service.ts` ✅
- `AZDOReview.ts` ❌
- `azdo_review.ts` ❌

---

## 🏗️ Code Structure

### Function Length

**Aim:** <50 lines per function

```typescript
// ✅ GOOD - Focused, single responsibility
async function validateConfig(config: Config): Promise<void> {
  if (!config.azdo?.token) {
    throw new Error('AZDO token required');
  }
  if (!config.azdo?.organization) {
    throw new Error('AZDO organization required');
  }
}

// ❌ BAD - Too much in one function
async function processEverything() {
  // 200 lines of mixed concerns
}
```

### Extract Magic Numbers

```typescript
// ✅ GOOD
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

await fetchWithRetry(url, MAX_RETRIES, DEFAULT_TIMEOUT_MS);

// ❌ BAD
await fetchWithRetry(url, 3, 30000); // What do these mean?
```

### Early Returns

```typescript
// ✅ GOOD - Early validation
function process(data: string | null): string {
  if (!data) {
    throw new Error('Data required');
  }
  if (data.length === 0) {
    return '';
  }
  
  // Main logic
  return data.toUpperCase();
}

// ❌ BAD - Nested conditionals
function process(data: string | null): string {
  if (data) {
    if (data.length > 0) {
      return data.toUpperCase();
    } else {
      return '';
    }
  } else {
    throw new Error('Data required');
  }
}
```

---

## 🛡️ Error Handling

### Custom Error Types

```typescript
// Define error types
class ToolError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean
  ) {
    super(message);
    this.name = 'ToolError';
  }
}

// Use specific errors
throw new ToolError(
  'Azure DevOps token is invalid',
  'AUTH_ERROR',
  true // User can fix by updating config
);
```

### Try-Catch Patterns

```typescript
// ✅ GOOD - Specific error handling
async function fetchData() {
  try {
    return await api.call();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new ToolError(
        'Cannot connect to API. Check your network.',
        'NETWORK_ERROR',
        true
      );
    }
    // Re-throw unexpected errors
    throw error;
  }
}

// ❌ BAD - Silent failures
async function fetchData() {
  try {
    return await api.call();
  } catch (error) {
    return null; // What happened? User has no idea!
  }
}
```

### Error Messages

```typescript
// ✅ GOOD - Helpful, actionable
throw new Error(
  'Config file not found at ~/.m-control/config.json\n' +
  'Run "mctl" to initialize configuration.'
);

// ❌ BAD - Cryptic
throw new Error('Config missing');
```

---

## 📊 Logging

### Structured Logging

```typescript
// ✅ GOOD (future pattern)
logger.info('PR review generated', {
  prId: 123,
  duration: 1234,
  success: true,
  userId: 'user-abc'
});

// ❌ BAD - Unstructured
console.log('PR review generated for PR 123 in 1234ms by user-abc');
```

### Log Levels

- **debug:** Detailed diagnostic info (verbose)
- **info:** General informational messages
- **warn:** Warning - something unexpected but not critical
- **error:** Error occurred, operation failed

```typescript
logger.debug('Fetching PR diff', { prId });
logger.info('PR diff retrieved', { files: 12 });
logger.warn('Large diff detected', { files: 100 });
logger.error('Failed to fetch PR', { error: err.message });
```

### What NOT to Log

```typescript
// ❌ NEVER log secrets
logger.info('Auth', { token: config.token }); // NO!

// ❌ NEVER log full errors in production (stack traces)
logger.error('Failed', { error }); // Might leak sensitive info

// ✅ GOOD - Log safe context
logger.error('Failed to authenticate', { 
  service: 'azdo',
  statusCode: 401 
});
```

---

## 🧪 Testing (Future)

### Test File Naming

```
src/
  commands/
    hello-world.ts
    hello-world.spec.ts      ✅ Co-located test
```

### Test Structure

```typescript
describe('hello-world', () => {
  it('should print hello world', async () => {
    // Arrange
    const spy = jest.spyOn(console, 'log');
    
    // Act
    await execute();
    
    // Assert
    expect(spy).toHaveBeenCalledWith('Hello World!');
  });
});
```

---

## 🎨 Naming Conventions

### Variables & Functions

```typescript
// camelCase
const userName = 'Michał';
function getUserById(id: string) { ... }

// Boolean - prefix with is/has/should
const isAuthenticated = true;
const hasPermission = false;
function shouldRetry() { ... }
```

### Constants

```typescript
// UPPER_SNAKE_CASE for true constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;

// camelCase for config-driven values
const apiEndpoint = config.get('api.endpoint');
```

### Classes & Interfaces

```typescript
// PascalCase
class ConfigService { ... }
interface PluginContext { ... }
type CommandHandler = () => Promise<void>;
```

### Files & Folders

```typescript
// kebab-case
src/commands/azdo-review.ts
src/core/config-service.ts

// No PascalCase, snake_case, or camelCase in file names
```

---

## 📦 Module Exports

### Prefer Named Exports

```typescript
// ✅ GOOD
export async function execute() { ... }
export interface Config { ... }

// ❌ BAD (for libraries, not CLI tools)
export default function execute() { ... }
```

---

## 🔧 Configuration

### Environment-Specific Code

```typescript
// ✅ GOOD - Detect platform
const configDir = process.platform === 'win32'
  ? path.join(process.env.USERPROFILE!, '.m-control')
  : path.join(os.homedir(), '.m-control');

// ❌ BAD - Hardcoded Windows path
const configDir = 'C:\\Users\\Michal\\.m-control';
```

### Path Handling

```typescript
// ✅ GOOD - Cross-platform
const filePath = path.join(baseDir, 'subdir', 'file.json');

// ❌ BAD - Windows-specific
const filePath = baseDir + '\\subdir\\file.json';
```

---

## 💬 Comments

### When to Comment

```typescript
// ✅ GOOD - Explain WHY (non-obvious reasoning)
// Azure DevOps API rate limit is 200 req/min
// We throttle to 150 req/min to stay safe
const RATE_LIMIT = 150;

// ❌ BAD - Explain WHAT (obvious from code)
// Set rate limit to 150
const RATE_LIMIT = 150;
```

### TODOs

```typescript
// ✅ GOOD - Specific TODO
// TODO(michał): Implement retry logic before v0.5

// ❌ BAD - Vague TODO
// TODO: Fix this
```

---

## 🎯 Best Practices Summary

### DO:
- ✅ Explicit types in function signatures
- ✅ Async/await (not callbacks)
- ✅ Early validation and returns
- ✅ Structured logging
- ✅ User-friendly error messages
- ✅ Extract magic numbers to constants
- ✅ Comment WHY, not WHAT

### DON'T:
- ❌ Use `any` without justification
- ❌ Silent failures (catch without handling)
- ❌ Hardcoded paths or credentials
- ❌ console.log in production
- ❌ Nested conditionals >3 levels
- ❌ Functions >50 lines

---

## 🔄 Code Review Checklist

Before committing:
- [ ] Follows naming conventions
- [ ] No `console.log` (use logger)
- [ ] No `any` without comment
- [ ] Error handling present
- [ ] User-friendly error messages
- [ ] No hardcoded paths/credentials
- [ ] Cross-platform compatible
- [ ] `npm run format` passed
- [ ] `npm run lint` passed

---

**These are guidelines, not laws. Use judgment.**

If breaking a guideline makes code clearer → do it and document why.

**Last updated:** 2025-02-18
