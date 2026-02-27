import { ToolEvent, StartedEvent, LogEvent, ResultEvent, ErrorEvent } from './types';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * EventSink — consumer of the tool event stream.
 *
 * The runner emits ToolEvents; sinks decide what to do with them.
 * This separation means telemetry, logging, and UI rendering are
 * independent subscribers that can be added without touching runner logic.
 *
 * Current implementations:
 *   - ConsoleEventSink  (default — pretty-prints to terminal)
 *   - JsonEventSink     (--json flag — NDJSON passthrough to stdout)
 *
 * Future:
 *   - TelemetrySink, FileSink, WebSocketSink...
 */
export interface EventSink {
  emit(event: ToolEvent): void;
  /** Called once after the event stream ends (success or error). */
  flush?(): void;
}

// ---------------------------------------------------------------------------
// ConsoleEventSink — human-readable terminal output
// ---------------------------------------------------------------------------

export interface ConsoleEventSinkOptions {
  /** Include timestamps in output. Default: false. */
  timestamps?: boolean;
  /** Minimum log level to display. Default: 'info'. */
  minLogLevel?: 'debug' | 'info' | 'warn' | 'error';
}

const LOG_LEVEL_ORDER = { debug: 0, info: 1, warn: 2, error: 3 } as const;

/**
 * ConsoleEventSink — pretty-prints events to stdout/stderr.
 *
 * Layout:
 *   started  →  "▶ <name> v<version>"  (written to stdout)
 *   log      →  prefixed by level icon  (info/debug → stdout, warn/error → stderr)
 *   result   →  "✓ Done"  + JSON payload if non-empty  (stdout)
 *   error    →  "✗ <message>"  + hint if recoverable  (stderr)
 */
export class ConsoleEventSink implements EventSink {
  private readonly opts: Required<ConsoleEventSinkOptions>;

  constructor(options: ConsoleEventSinkOptions = {}) {
    this.opts = {
      timestamps: options.timestamps ?? false,
      minLogLevel: options.minLogLevel ?? 'info',
    };
  }

  emit(event: ToolEvent): void {
    switch (event.type) {
      case 'started':
        this.onStarted(event);
        break;
      case 'log':
        this.onLog(event);
        break;
      case 'result':
        this.onResult(event);
        break;
      case 'error':
        this.onError(event);
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flush(): void {}

  // ---------------------------------------------------------------------------

  private onStarted(event: StartedEvent): void {
    const meta = event.payload.meta;
    const suffix = meta ? ` (${JSON.stringify(meta)})` : '';
    process.stdout.write(`\u25B6 ${event.toolId}${suffix}\n`);
  }

  private onLog(event: LogEvent): void {
    const { level, message, data } = event.payload;

    const minOrder = LOG_LEVEL_ORDER[this.opts.minLogLevel];
    if (LOG_LEVEL_ORDER[level] < minOrder) return;

    const prefix = this.opts.timestamps ? `[${event.ts}] ` : '';
    const icon = LOG_ICONS[level];
    const dataStr = data !== undefined ? `  ${JSON.stringify(data)}` : '';
    const line = `${prefix}${icon} ${message}${dataStr}\n`;

    if (level === 'warn' || level === 'error') {
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  }

  private onResult(event: ResultEvent): void {
    const payload = event.payload;
    const hasPayload =
      payload !== null &&
      payload !== undefined &&
      !(typeof payload === 'object' && Object.keys(payload as object).length === 0);

    process.stdout.write('\u2713 Done\n');

    if (hasPayload) {
      process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
    }
  }

  private onError(event: ErrorEvent): void {
    const { message, code, recoverable } = event.payload;
    const codeStr = code ? ` [${code}]` : '';
    process.stderr.write(`\u2717 ${message}${codeStr}\n`);

    if (recoverable) {
      process.stderr.write(`  Hint: check your config or input and try again.\n`);
    } else {
      process.stderr.write(`  This looks like a bug. Please report it.\n`);
    }
  }
}

const LOG_ICONS: Record<'debug' | 'info' | 'warn' | 'error', string> = {
  debug: '\u25AA',  // ▪
  info:  '\u2139',  // ℹ
  warn:  '\u26A0',  // ⚠
  error: '\u2716',  // ✖
};

// ---------------------------------------------------------------------------
// JsonEventSink — NDJSON passthrough (for --json flag)
// ---------------------------------------------------------------------------

/**
 * JsonEventSink — writes each event as a raw NDJSON line to stdout.
 *
 * Used when `mctl run <id> --json` is passed.
 * No formatting, no filtering — pure passthrough.
 * Suitable for piping and scripting.
 */
export class JsonEventSink implements EventSink {
  emit(event: ToolEvent): void {
    process.stdout.write(JSON.stringify(event) + '\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flush(): void {}
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create the appropriate EventSink based on CLI flags.
 *
 * @param jsonMode  true when --json flag is present
 * @param options   ConsoleEventSink options (ignored in JSON mode)
 */
export function createEventSink(
  jsonMode: boolean,
  options?: ConsoleEventSinkOptions,
): EventSink {
  return jsonMode ? new JsonEventSink() : new ConsoleEventSink(options);
}
