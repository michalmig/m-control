# Execution Model

How m-control executes commands from user input to completion.

## 🎯 Execution Modes

m-control supports two execution modes:

### 1. Interactive Mode
**Trigger:** User runs `mctl` or `mm` without arguments

**Flow:**
```
User → TUI → Category Selection → Command Selection → Execute
```

### 2. Direct Mode
**Trigger:** User runs `mctl <command-id>` with command name

**Flow:**
```
User → CLI Parser → Command Lookup → Execute
```

---

## 🔄 Detailed Execution Flow

### Interactive Mode Flow

```
┌─────────────────────────────────────────────┐
│ 1. User runs: mctl                          │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 2. Entry Point (src/index.ts)              │
│    ├─ Parse args: none                      │
│    └─ Route to: runInteractive()            │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 3. Check Config (src/ui/interactive.ts)    │
│    ├─ configExists()                        │
│    ├─ If NO: initConfig() → Show message   │
│    └─ If YES: Continue                      │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 4. Category Selection (TUI)                │
│    ├─ Load commandGroups from registry     │
│    ├─ Display categories (prompts)         │
│    └─ Wait for user selection              │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 5. Command Selection (TUI)                 │
│    ├─ Load commands from selected category │
│    ├─ Display commands (prompts)           │
│    └─ Wait for user selection              │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 6. Execute Command                          │
│    ├─ Lookup handler from registry         │
│    └─ await command.handler()               │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 7. Display Result                           │
│    └─ Show success/error to user            │
└─────────────────────────────────────────────┘
```

### Direct Mode Flow

```
┌─────────────────────────────────────────────┐
│ 1. User runs: mctl hello-world              │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 2. Entry Point (src/index.ts)              │
│    ├─ Parse args: ['hello-world']          │
│    └─ Route to: direct execution            │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 3. Command Lookup                           │
│    ├─ findCommand('hello-world')           │
│    ├─ If NOT FOUND: Show error             │
│    └─ If FOUND: Get handler                 │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 4. Execute Command                          │
│    └─ await command.handler()               │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ 5. Display Result                           │
│    └─ Show success/error to user            │
└─────────────────────────────────────────────┘
```

---

## 🏭 Plugin Execution Types

### Internal Plugin Execution (TypeScript)

```typescript
// 1. Lookup from registry
const command = findCommand('hello-world');

// 2. Call handler directly (in-process)
try {
  await command.handler();
  // Success
} catch (error) {
  // Error handling
  logger.error('Command failed', { error });
  throw error;
}
```

**Characteristics:**
- **Speed:** Fast (no process spawn)
- **Memory:** Shared with orchestrator
- **Isolation:** Same process (crash affects orchestrator)
- **Communication:** Direct function calls

### External Plugin Execution (Polyglot)

```typescript
// 1. Prepare input
const input = {
  toolId: 'k8s-pod-inspector',
  params: { namespace: 'prod' },
  config: getToolConfig('k8s')
};

const inputFile = '/tmp/input-123.json';
const outputFile = '/tmp/output-123.json';
fs.writeFileSync(inputFile, JSON.stringify(input));

// 2. Spawn process
const proc = spawn('python', [
  'tools/k8s/main.py',
  '--input', inputFile,
  '--output', outputFile
], {
  stdio: 'inherit' // Show tool's output
});

// 3. Wait for completion
await new Promise((resolve, reject) => {
  proc.on('close', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`Tool exited with code ${code}`));
  });
});

// 4. Read result
const output = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));

// 5. Cleanup
fs.unlinkSync(inputFile);
fs.unlinkSync(outputFile);

// 6. Return
return output;
```

**Characteristics:**
- **Speed:** Slower (process spawn ~50-200ms)
- **Memory:** Separate process
- **Isolation:** Process isolated (crash doesn't affect orchestrator)
- **Communication:** JSON files or stdin/stdout

---

## ⚡ Performance Considerations

### Internal Plugin
- **Startup:** ~0ms (already in process)
- **Memory:** Shared (~0 overhead)
- **Best for:** Frequent commands, simple operations

### External Plugin
- **Startup:** ~50-200ms (process spawn)
- **Memory:** Separate process (~10-50MB depending on runtime)
- **Best for:** Heavy operations, isolation needed, non-JS languages

---

## 🛡️ Error Handling

### Error Propagation

```typescript
// Plugin throws error
export async function execute() {
  throw new ToolError('API token invalid', 'AUTH_ERROR', true);
}

// Orchestrator catches
try {
  await command.handler();
} catch (error) {
  if (error instanceof ToolError) {
    // Structured error
    console.error(`❌ ${error.message}`);
    if (error.recoverable) {
      console.error('Hint: Check your config in ~/.m-control/config.json');
    }
  } else {
    // Unexpected error
    console.error('❌ Unexpected error occurred');
    logger.error('Unhandled error', { error });
  }
  process.exit(1);
}
```

### Error Types

```typescript
class ToolError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean
  ) {
    super(message);
  }
}

// Examples
new ToolError('Token invalid', 'AUTH_ERROR', true);  // User can fix
new ToolError('Network timeout', 'NETWORK_ERROR', true); // Retry possible
new ToolError('Internal bug', 'INTERNAL_ERROR', false); // Report bug
```

---

## ⏱️ Timeout Handling

### Future Implementation
```typescript
async function executeWithTimeout(
  handler: () => Promise<void>,
  timeoutMs: number = 60000
): Promise<void> {
  return Promise.race([
    handler(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
}

// Usage
await executeWithTimeout(command.handler, 30000); // 30s timeout
```

---

## 🔄 Lifecycle Hooks (Future)

Potential future hooks for plugins:

```typescript
interface Plugin {
  // Before execution
  onBeforeExecute?(context: PluginContext): Promise<void>;
  
  // Main execution
  execute(context: PluginContext): Promise<void>;
  
  // After execution (success or failure)
  onAfterExecute?(context: PluginContext, result: any): Promise<void>;
  
  // Cleanup (always runs)
  onCleanup?(context: PluginContext): Promise<void>;
}
```

**Use cases:**
- **onBeforeExecute:** Validate config, check prerequisites
- **execute:** Main logic
- **onAfterExecute:** Log telemetry, update cache
- **onCleanup:** Delete temp files, close connections

---

## 📊 Execution Context (Future)

Context passed to every plugin:

```typescript
interface PluginContext {
  // Config
  getConfig<T>(key: string): T;
  
  // Logging
  log: Logger;
  
  // Temp files
  getTempDir(): string;
  
  // HTTP client (with auth)
  getHttpClient(service: string): HttpClient;
  
  // User info
  getUserId(): string;
  
  // Telemetry
  trackEvent(name: string, data: any): void;
}
```

---

## 🎯 Execution Guarantees

### What m-control GUARANTEES:
- ✅ Plugins execute in order (sequential, not parallel - for now)
- ✅ Config loaded before execution
- ✅ Errors don't crash orchestrator (external plugins)
- ✅ Temp files cleaned up (external plugins)

### What m-control DOES NOT GUARANTEE:
- ❌ Plugins complete (user can Ctrl+C)
- ❌ Specific execution order if multiple commands (future feature)
- ❌ Atomic operations (plugin responsible for transaction handling)
- ❌ Retry on failure (plugin must implement retry logic)

---

## 🔒 Security & Isolation

### Internal Plugins
- **Process isolation:** NO (same process)
- **Memory isolation:** NO (shared heap)
- **File system:** Full access (uses Node.js permissions)
- **Network:** Full access

**Trust model:** Internal plugins are trusted code.

### External Plugins
- **Process isolation:** YES (separate OS process)
- **Memory isolation:** YES (separate address space)
- **File system:** OS-level permissions
- **Network:** OS-level permissions

**Trust model:** External plugins sandboxed by OS.

---

## 📈 Scaling Considerations

### Current (MVP)
- **Execution:** Sequential (one command at a time)
- **Concurrency:** None
- **Parallelism:** None

### Future (v0.5+)
- **Execution:** Configurable (sequential or parallel)
- **Concurrency:** Multiple commands in same session
- **Parallelism:** Multiple external tools simultaneously

**Example use case:**
```bash
mctl batch \
  --run "azdo-review --pr 123" \
  --run "k8s-logs --namespace prod" \
  --parallel
```

---

## 🧪 Testing Execution

### Unit Test (Internal Plugin)
```typescript
test('executes hello-world', async () => {
  const spy = jest.spyOn(console, 'log');
  await execute();
  expect(spy).toHaveBeenCalledWith('Hello World!');
});
```

### Integration Test (External Plugin)
```typescript
test('executes python plugin', async () => {
  const result = await executeTool({
    id: 'test-tool',
    executable: 'python',
    entryPoint: 'test.py'
  }, {}, {});
  
  expect(result.success).toBe(true);
});
```

---

## 📚 Related Docs

- [Plugin Contract](plugin-contract.md) - Plugin requirements
- [Context Model](context-model.md) - Context flow
- [Constraints](constraints.md) - Execution rules

---

**Last updated:** 2025-02-18  
**Next review:** After parallel execution implementation
