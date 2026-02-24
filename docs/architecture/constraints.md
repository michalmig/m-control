# Architectural Constraints

The "Constitution" of m-control. These are inviolable rules that must be followed at all times.

## 🚫 NEVER DO THIS

### Security

#### ❌ NEVER store credentials in plaintext logs
```typescript
// BAD
console.log('Token:', config.azdo.token);
logger.info('Auth:', { token: user.token });

// GOOD
logger.info('Authenticated', { userId: user.id }); // No token
```

#### ❌ NEVER hardcode API endpoints or credentials
```typescript
// BAD
const AZDO_URL = 'https://dev.azure.com/myorg';
const API_KEY = 'abc123xyz';

// GOOD
const AZDO_URL = config.azdo.organization; // From config
const API_KEY = config.azdo.token; // From secure config
```

#### ❌ NEVER commit secrets to git
```bash
# ALWAYS in .gitignore:
config.json
.env
*.key
*.pem
```

#### ❌ NEVER log full error objects in production
```typescript
// BAD
catch (error) {
  logger.error(error); // Might contain sensitive data
}

// GOOD
catch (error) {
  logger.error('Operation failed', { 
    message: error.message,
    code: error.code 
    // No stack trace, no sensitive data
  });
}
```

---

### Architecture

#### ❌ NEVER couple plugins to orchestrator internals
```typescript
// BAD - Plugin directly imports orchestrator code
import { internalState } from '../../core/state';

// GOOD - Plugin uses only public contracts
export async function execute(context: PluginContext) {
  const config = context.getConfig();
}
```

#### ❌ NEVER break plugin isolation (shared mutable state)
```typescript
// BAD - Global state shared between plugins
let globalCounter = 0; // Plugins can interfere

// GOOD - Each plugin gets its own context
export async function execute(context: PluginContext) {
  const state = context.getState(); // Isolated
}
```

#### ❌ NEVER hardcode file paths
```typescript
// BAD
const configPath = 'C:\\Users\\Michal\\.m-control\\config.json';

// GOOD
const configPath = path.join(getConfigDir(), 'config.json');
```

#### ❌ NEVER assume Windows or Linux exclusively
```typescript
// BAD
const separator = '\\'; // Windows only

// GOOD
const separator = path.sep; // Cross-platform
```

---

### Configuration

#### ❌ NEVER change config schema without migration
```typescript
// BAD - Breaking change
interface Config {
  // Removed 'azdo' field - existing configs break!
  tools: { k8s: {...} }
}

// GOOD - Add migration
function migrateConfig(old: ConfigV1): ConfigV2 {
  return {
    ...old,
    version: '2.0',
    tools: {
      azdo: old.azdo || {}, // Preserve old data
      ...old.tools
    }
  };
}
```

#### ❌ NEVER remove config fields without deprecation period
```typescript
// BAD
// Removed config.azdo.organization immediately

// GOOD
// v1.0: Mark as deprecated
// v1.5: Show warning if used
// v2.0: Remove (with migration)
```

#### ❌ NEVER store config outside ~/.m-control/
```typescript
// BAD
const config = readFileSync('/var/lib/m-control/config.json');

// GOOD
const configDir = process.platform === 'win32'
  ? path.join(process.env.USERPROFILE, '.m-control')
  : path.join(os.homedir(), '.m-control');
```

---

### Code Quality

#### ❌ NEVER use console.log/console.error in production code
```typescript
// BAD
console.log('User logged in');
console.error('Failed:', error);

// GOOD
logger.info('User logged in', { userId });
logger.error('Operation failed', { error: error.message });
```

#### ❌ NEVER use `any` type without justification comment
```typescript
// BAD
function process(data: any) { ... }

// GOOD
function process(data: unknown) { ... }

// ACCEPTABLE (with comment)
function legacyAdapter(data: any) { // External API has no types
  ...
}
```

#### ❌ NEVER ignore errors silently
```typescript
// BAD
try {
  await riskyOperation();
} catch (e) {
  // Silent failure - user has no idea what happened
}

// GOOD
try {
  await riskyOperation();
} catch (e) {
  logger.error('Operation failed', { error: e.message });
  throw new ToolError('Failed to X', 'OPERATION_FAILED', true);
}
```

#### ❌ NEVER block the event loop
```typescript
// BAD
function processLargeFile(path: string) {
  const content = fs.readFileSync(path); // Blocks!
  return parse(content);
}

// GOOD
async function processLargeFile(path: string) {
  const content = await fs.promises.readFile(path);
  return parse(content);
}
```

---

### Performance

#### ❌ NEVER load entire large files into memory
```typescript
// BAD
const logContent = fs.readFileSync('huge-log.txt', 'utf-8');
const lines = logContent.split('\n');

// GOOD
const stream = fs.createReadStream('huge-log.txt');
const lines = readline.createInterface({ input: stream });
for await (const line of lines) {
  processLine(line);
}
```

#### ❌ NEVER make synchronous network calls
```typescript
// BAD
const result = https.request(url); // Blocking

// GOOD
const result = await fetch(url); // Async
```

---

### User Experience

#### ❌ NEVER show raw error messages to users
```typescript
// BAD
catch (error) {
  console.error(error.stack); // Scary technical jargon
}

// GOOD
catch (error) {
  console.error('Failed to connect to Azure DevOps.');
  console.error('Check your token in ~/.m-control/config.json');
  logger.debug('Full error:', error); // For debugging
}
```

#### ❌ NEVER make operations non-idempotent if they should be
```typescript
// BAD
function createNote(title: string) {
  // Creates duplicate if called twice
}

// GOOD
function createNote(title: string) {
  if (noteExists(title)) {
    return existingNote;
  }
  return createNew(title);
}
```

---

## ✅ ALWAYS DO THIS

### Code

#### ✅ ALWAYS use structured logging
```typescript
// Include context for debugging
logger.info('Command executed', {
  commandId: 'azdo-review',
  duration: 1234,
  success: true,
  userId: 'user-123'
});
```

#### ✅ ALWAYS validate user input
```typescript
function setApiToken(token: string) {
  if (!token || token.trim().length === 0) {
    throw new Error('Token cannot be empty');
  }
  if (token.length < 20) {
    throw new Error('Token appears invalid (too short)');
  }
  // Proceed
}
```

#### ✅ ALWAYS handle errors gracefully
```typescript
async function fetchData() {
  try {
    const result = await api.call();
    return result;
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      throw new ToolError(
        'Network connection failed. Check your internet.',
        'NETWORK_ERROR',
        true // recoverable
      );
    }
    throw error; // Re-throw unexpected errors
  }
}
```

#### ✅ ALWAYS think: "Does this work local AND cloud?"
```typescript
// Design for both modes from the start
async function getConfig() {
  if (cloudMode) {
    return await fetchCloudConfig();
  } else {
    return await loadLocalConfig();
  }
}
```

---

### Documentation

#### ✅ ALWAYS update ADR when making architectural decision
```bash
# Created plugin system? Write ADR.
cp docs/adr/TEMPLATE.md docs/adr/0002-plugin-system.md
```

#### ✅ ALWAYS document "why" not just "what"
```typescript
// BAD comment
// Set timeout to 30 seconds

// GOOD comment  
// Azure DevOps API sometimes takes >10s to respond
// 30s timeout balances user experience vs reliability
const TIMEOUT_MS = 30_000;
```

#### ✅ ALWAYS add to ANTI-PATTERNS.md when something goes wrong
```markdown
## Don't use console.log for errors

**Why:** We tried this. Debugging production issues was impossible.
No context, no structure, couldn't search logs.

**Use instead:** Structured logger
```

---

### User Experience

#### ✅ ALWAYS provide helpful error messages
```typescript
// BAD
throw new Error('Invalid config');

// GOOD
throw new Error(
  'Config is missing required field "azdo.token".\n' +
  'Add your Azure DevOps PAT to ~/.m-control/config.json'
);
```

#### ✅ ALWAYS show progress for long operations
```typescript
async function processLargeDataset() {
  console.log('Processing... this may take a minute');
  
  for (let i = 0; i < items.length; i++) {
    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${items.length}`);
    }
    await processItem(items[i]);
  }
  
  console.log('Done!');
}
```

#### ✅ ALWAYS make commands idempotent where possible
```typescript
// Running twice should be safe
async function syncConfig() {
  const local = await loadLocal();
  const remote = await fetchRemote();
  
  if (isEqual(local, remote)) {
    console.log('Already in sync');
    return;
  }
  
  await uploadToRemote(local);
}
```

---

### Testing

#### ✅ ALWAYS write tests for critical paths
- Config migration
- Auth flows
- External tool execution
- Error handling

#### ✅ ALWAYS test both local and cloud modes (when implemented)

#### ✅ ALWAYS test with empty/missing/invalid config

---

## 🎯 Principles

These constraints derive from these core principles:

1. **Security First** - User data and credentials are sacred
2. **Fail Fast** - Better to error than silently corrupt
3. **User Empathy** - Clear errors, helpful messages
4. **Extensibility** - Plugins shouldn't break orchestrator
5. **Hybrid Native** - Local and cloud are equal citizens

---

## 🔄 Updating This Document

**Add constraint when:**
- Production bug caused by violation
- Security issue discovered
- Painful refactor could have been prevented
- Team (or AI) repeatedly makes same mistake

**Format:**
```markdown
#### ❌ NEVER [what not to do]
[Bad example]

#### ✅ ALWAYS [what to do instead]
[Good example]
```

---

## 🚨 Enforcement

### During Development
- ESLint rules (where possible)
- Code review (manual check)
- AI prompts reference this file

### During Runtime
- Config validation on load
- Input validation at boundaries
- Error handling in all public APIs

### During Build
- TypeScript strict mode
- No `any` without comment (linter rule)
- No console.log in src/ (linter rule)

---

**When in doubt, ask:** "Does this violate a constraint?"

If yes → Don't do it.  
If unsure → Discuss in ADR before implementing.

---

**Last updated:** 2025-02-18  
**Reviewed by:** Michał + Claude  
**Next review:** When major constraint added
