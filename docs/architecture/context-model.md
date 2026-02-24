# Context Model

How context, configuration, and state flow through m-control system.

## 🎯 What is Context?

**Context** is all the information a plugin needs to execute:
- User configuration (tokens, URLs, preferences)
- Runtime state (user ID, session info)
- Services (logger, auth, telemetry)
- Environment (OS, temp directories)

---

## 📋 Context Layers

### Layer 1: Static Config (File-based)
**Source:** `~/.m-control/config.json`  
**Lifetime:** Persistent across sessions  
**Scope:** Per user

```json
{
  "version": "0.1.0",
  "tools": {
    "azdo": {
      "token": "...",
      "organization": "myorg"
    },
    "k8s": {
      "defaultContext": "prod"
    }
  }
}
```

### Layer 2: Runtime Context (In-memory)
**Source:** Created at startup  
**Lifetime:** Single execution  
**Scope:** Per command

```typescript
interface RuntimeContext {
  userId: string;
  sessionId: string;
  startTime: Date;
  platform: NodeJS.Platform;
}
```

### Layer 3: Service Context (Dependency Injection)
**Source:** Service locator/container  
**Lifetime:** Application lifetime  
**Scope:** Global

```typescript
interface Services {
  config: ConfigService;
  logger: LoggerService;
  auth: AuthService;    // Future
  telemetry: TelemetryService; // Future
}
```

---

## 🔄 Context Flow

### Current Implementation (MVP)

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  Entry Point                 │
│  ├─ Load config.json         │
│  └─ Create services (stub)   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Command Handler             │
│  ├─ Access config directly   │
│  └─ Use console.log          │
└──────────────────────────────┘
```

**Issues with current approach:**
- ❌ No dependency injection
- ❌ Hard to test (global state)
- ❌ Plugins coupled to config implementation

### Future Implementation (v0.2+)

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Entry Point                           │
│  ├─ Load config                        │
│  ├─ Create service container           │
│  └─ Create plugin context              │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Plugin Context                        │
│  ├─ config: ConfigService              │
│  ├─ logger: LoggerService              │
│  ├─ auth: AuthService                  │
│  └─ telemetry: TelemetryService        │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Command Handler                       │
│  function execute(ctx: PluginContext)  │
│  {                                     │
│    const token = ctx.getConfig('azdo.token');
│    ctx.log.info('Starting...');        │
│  }                                     │
└────────────────────────────────────────┘
```

**Benefits:**
- ✅ Testable (mock context)
- ✅ Decoupled (plugins don't import config directly)
- ✅ Extensible (add services without breaking plugins)

---

## 🔧 Service Interfaces

### ConfigService
```typescript
interface ConfigService {
  get<T>(key: string): T;
  set(key: string, value: any): void;
  exists(key: string): boolean;
  reload(): Promise<void>;
  save(): Promise<void>;
}

// Usage
const token = context.config.get<string>('azdo.token');
```

### LoggerService
```typescript
interface LoggerService {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error: Error, data?: any): void;
}

// Usage
context.logger.info('Processing PR', { prId: 123 });
```

### AuthService (Future)
```typescript
interface AuthService {
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
  login(): Promise<void>;
  logout(): Promise<void>;
  getToken(service: string): Promise<string>;
}

// Usage
const user = await context.auth.getCurrentUser();
const token = await context.auth.getToken('azdo');
```

### TelemetryService (Future)
```typescript
interface TelemetryService {
  trackCommand(commandId: string, duration: number, success: boolean): void;
  trackError(error: Error, context: any): void;
  trackEvent(name: string, properties: any): void;
}

// Usage
context.telemetry.trackCommand('azdo-review', 1234, true);
```

---

## 🏗️ Context Construction

### Bootstrap Sequence

```typescript
// 1. Load config
const config = await loadConfig();

// 2. Create services
const logger = new ConsoleLogger(); // Dev: console, Prod: file/cloud
const auth = new NoOpAuthService(); // Stub for now
const telemetry = new NoOpTelemetryService(); // Stub for now

// 3. Create service container
const services = {
  config: new ConfigService(config),
  logger,
  auth,
  telemetry
};

// 4. Create plugin context factory
const createContext = (commandId: string): PluginContext => ({
  getConfig: (key) => services.config.get(key),
  logger: services.logger,
  auth: services.auth,
  telemetry: services.telemetry,
  // Future: getTempDir, getHttpClient, etc.
});

// 5. Execute with context
const context = createContext('azdo-review');
await command.handler(context);
```

---

## 🔒 Config Scoping

Plugins should only receive configuration they need.

### Current (MVP) - No scoping
```typescript
// Plugin can access entire config
const config = loadConfig();
const token = config.tools.azdo.token; // Direct access
```

**Problem:** Plugin can access unrelated config (security/privacy issue).

### Future - Scoped config
```typescript
// Plugin manifest declares requirements
{
  "requiredConfig": ["azdo.token", "azdo.organization"]
}

// Orchestrator filters config
const scopedConfig = {
  token: config.tools.azdo.token,
  organization: config.tools.azdo.organization
};

// Plugin receives only what it needs
context.getConfig('token'); // ✅ Works
context.getConfig('k8s.defaultContext'); // ❌ Throws error
```

---

## 🌐 Hybrid Context (Local vs Cloud)

### Local Mode
```typescript
interface LocalContext extends PluginContext {
  config: FileConfigService;    // Read from ~/.m-control/config.json
  auth: NoOpAuthService;         // No cloud auth
  telemetry: NoOpTelemetryService; // No tracking
}
```

### Cloud Mode (Future)
```typescript
interface CloudContext extends PluginContext {
  config: CloudConfigService;    // Sync with cloud
  auth: CloudAuthService;        // JWT-based auth
  telemetry: CloudTelemetryService; // Send to analytics
}
```

### Hybrid Mode
```typescript
// Orchestrator decides which services to inject
const context = cloudMode 
  ? createCloudContext()
  : createLocalContext();

// Plugins work identically in both modes
await command.handler(context);
```

---

## 📦 Context Serialization (External Plugins)

When calling external tools, context must be serialized to JSON.

```typescript
// Internal representation
const context = {
  config: ConfigService,
  logger: LoggerService,
  // ... (complex objects)
};

// Serialized for external tool
const serialized = {
  toolId: 'k8s-pod-inspector',
  params: { namespace: 'prod' },
  config: {
    defaultContext: context.config.get('k8s.defaultContext')
  }
  // No logger, auth - can't serialize functions
};

// External tool receives
{
  "toolId": "k8s-pod-inspector",
  "params": { "namespace": "prod" },
  "config": { "defaultContext": "prod" }
}
```

**Limitation:** External tools can't call services (logger, auth).  
**Workaround:** Tools log to stdout, orchestrator captures and structures logs.

---

## 🎨 Best Practices

### DO:
- ✅ Pass context as first parameter
- ✅ Use context.getConfig() instead of global config
- ✅ Use context.logger instead of console.log
- ✅ Keep context immutable (read-only)

### DON'T:
- ❌ Mutate context
- ❌ Store state in context (use separate state object)
- ❌ Pass entire config to plugins
- ❌ Access global singletons from plugins

---

## 🧪 Testing with Context

### Mocking Context
```typescript
const mockContext: PluginContext = {
  getConfig: jest.fn((key) => {
    if (key === 'azdo.token') return 'test-token';
    throw new Error('Config not found');
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    // ...
  },
  // ...
};

await execute(mockContext);
expect(mockContext.logger.info).toHaveBeenCalledWith('Processing...');
```

---

## 🔄 Context Evolution

### v0.1.0 (Current)
- No formal context
- Direct config access
- Global console.log

### v0.2.0 (Near future)
- Introduce PluginContext interface
- Service abstractions (stubs)
- Gradual migration

### v0.5.0 (Medium term)
- Full dependency injection
- Cloud services integration
- Telemetry active

### v1.0.0 (Long term)
- Mature service ecosystem
- Plugin marketplace with scoped permissions
- Multi-tenant context (teams)

---

## 📚 Related Docs

- [Plugin Contract](plugin-contract.md) - How context is used
- [Execution Model](execution-model.md) - When context is created
- [Constraints](constraints.md) - Context security rules

---

**Last updated:** 2025-02-18  
**Next review:** After service abstraction implementation (v0.2.0)
