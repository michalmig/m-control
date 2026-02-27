import { spawn } from 'child_process';
import {
  Runner,
  ResolvedTool,
  RunContext,
  ToolInput,
  ToolEvent,
  ToolRequest,
  RunnerOptions,
  EXIT_CODES,
} from '../types';
import { RunnerError, NotImplementedError } from '../errors';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: Required<RunnerOptions> = {
  timeoutMs: 30_000,
  maxOutputBytes: 10 * 1024 * 1024, // 10 MB
  maxEvents: 10_000,
};

// ---------------------------------------------------------------------------
// NodeRunner
// ---------------------------------------------------------------------------

/**
 * NodeRunner - spawns a tool as a child process and streams its events.
 *
 * Protocol (Tool Protocol v1):
 *   stdin  <- JSON ToolRequest (written once, then closed)
 *   stdout -> NDJSON ToolEvent lines (parsed and yielded)
 *   stderr -> raw text (forwarded to process.stderr unparsed)
 *   exit      0=success, 1=expected failure, >=2=crash
 *
 * Guardrails:
 *   - timeoutMs:      SIGTERM after N ms
 *   - maxOutputBytes: SIGTERM if stdout exceeds N bytes
 *   - maxEvents:      SIGTERM after N events yielded
 *
 * Malformed NDJSON lines from stdout are skipped with a stderr warning -
 * they never crash the orchestrator.
 */
export class NodeRunner implements Runner {
  async *run(
    tool: ResolvedTool,
    context: RunContext,
    input: ToolInput,
    options?: RunnerOptions,
  ): AsyncIterable<ToolEvent> {
    if (tool.manifest.runtime !== 'node') {
      throw new NotImplementedError(tool.manifest.runtime);
    }

    const opts: Required<RunnerOptions> = { ...DEFAULTS, ...options };
    const request: ToolRequest = { context, input };
    const requestJson = JSON.stringify(request);

    yield* spawnAndStream(tool.entryPath, requestJson, tool.manifest.id, opts);
  }
}

// ---------------------------------------------------------------------------
// Core streaming logic
// ---------------------------------------------------------------------------

async function* spawnAndStream(
  entryPath: string,
  requestJson: string,
  toolId: string,
  opts: Required<RunnerOptions>,
): AsyncIterable<ToolEvent> {
  // Bridge between event-based child process API and async generator:
  // child process pushes items into queue, generator pulls them.
  type QueueItem =
    | { kind: 'event'; event: ToolEvent }
    | { kind: 'done'; exitCode: number | null }
    | { kind: 'error'; err: Error };

  const queue: QueueItem[] = [];
  let wakeUp: (() => void) | null = null;
  const notify = (): void => {
    if (wakeUp) { wakeUp(); wakeUp = null; }
  };
  const push = (item: QueueItem): void => { queue.push(item); notify(); };

  // -------------------------------------------------------------------------
  // Spawn
  // -------------------------------------------------------------------------
  let proc: ReturnType<typeof spawn>;
  try {
    proc = spawn('node', [entryPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
  } catch (err) {
    throw new RunnerError(
      `Failed to spawn tool at ${entryPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // -------------------------------------------------------------------------
  // Guardrail: timeout
  // -------------------------------------------------------------------------
  let guardrailHit = false;

  const timeoutHandle = setTimeout(() => {
    guardrailHit = true;
    proc.kill('SIGTERM');
    push({
      kind: 'event',
      event: makeErrorEvent(
        toolId,
        `Tool exceeded timeout of ${opts.timeoutMs}ms`,
        'RUNNER_TIMEOUT',
      ),
    });
  }, opts.timeoutMs);

  // -------------------------------------------------------------------------
  // stdin - write request then close
  // -------------------------------------------------------------------------
  proc.stdin!.write(requestJson, 'utf-8', (writeErr) => {
    if (writeErr && !guardrailHit) {
      // Process likely died before reading - will be caught by 'error' or 'close'
      process.stderr.write(
        `[runner:${toolId}] stdin write error: ${writeErr.message}\n`,
      );
    }
    proc.stdin!.end();
  });

  // -------------------------------------------------------------------------
  // stderr - forward raw to orchestrator's stderr
  // -------------------------------------------------------------------------
  proc.stderr!.on('data', (chunk: Buffer) => {
    process.stderr.write(chunk);
  });

  // -------------------------------------------------------------------------
  // stdout - NDJSON line parser
  // -------------------------------------------------------------------------
  let bytesRead = 0;
  let eventsEmitted = 0;
  let lineBuffer = '';

  proc.stdout!.on('data', (chunk: Buffer) => {
    if (guardrailHit) return;

    // Guardrail: maxOutputBytes
    bytesRead += chunk.length;
    if (bytesRead > opts.maxOutputBytes) {
      guardrailHit = true;
      proc.kill('SIGTERM');
      push({
        kind: 'event',
        event: makeErrorEvent(
          toolId,
          `Tool stdout exceeded maxOutputBytes limit (${opts.maxOutputBytes} bytes)`,
          'RUNNER_MAX_OUTPUT_BYTES',
        ),
      });
      return;
    }

    lineBuffer += chunk.toString('utf-8');
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? ''; // last element may be incomplete

    for (const raw of lines) {
      if (guardrailHit) break;
      const line = raw.trim();
      if (!line) continue;

      const event = parseLine(line, toolId);
      if (!event) continue; // malformed - warned in parseLine

      // Guardrail: maxEvents
      eventsEmitted++;
      if (eventsEmitted > opts.maxEvents) {
        guardrailHit = true;
        proc.kill('SIGTERM');
        push({
          kind: 'event',
          event: makeErrorEvent(
            toolId,
            `Tool exceeded maxEvents limit (${opts.maxEvents} events)`,
            'RUNNER_MAX_EVENTS',
          ),
        });
        break;
      }

      push({ kind: 'event', event });
    }
  });

  proc.stdout!.on('end', () => {
    // Flush any remaining buffered incomplete line
    const line = lineBuffer.trim();
    if (line) {
      const event = parseLine(line, toolId);
      if (event) push({ kind: 'event', event });
    }
  });

  // -------------------------------------------------------------------------
  // Process lifecycle
  // -------------------------------------------------------------------------
  proc.on('error', (err) => {
    clearTimeout(timeoutHandle);
    push({ kind: 'error', err: new RunnerError(`Process error for ${toolId}: ${err.message}`) });
  });

  proc.on('close', (code) => {
    clearTimeout(timeoutHandle);

    // Emit a synthetic crash event if the tool exited badly without emitting error
    if (!guardrailHit && code !== null && code >= EXIT_CODES.CRASH_MIN) {
      push({
        kind: 'event',
        event: makeErrorEvent(
          toolId,
          `Tool crashed with exit code ${code}`,
          'TOOL_CRASH',
        ),
      });
    }

    push({ kind: 'done', exitCode: code });
  });

  // -------------------------------------------------------------------------
  // Generator drain loop
  // -------------------------------------------------------------------------
  while (true) {
    while (queue.length > 0) {
      const item = queue.shift()!;

      switch (item.kind) {
        case 'event':
          yield item.event;
          break;
        case 'done':
          return;
        case 'error':
          throw item.err;
      }
    }

    // Queue empty - suspend until child process pushes something
    await new Promise<void>((r) => { wakeUp = r; });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLine(line: string, toolId: string): ToolEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    process.stderr.write(`[runner:${toolId}] malformed NDJSON: ${line}\n`);
    return null;
  }

  if (!isToolEvent(parsed)) {
    process.stderr.write(`[runner:${toolId}] unexpected stdout shape: ${line}\n`);
    return null;
  }

  return parsed;
}

function isToolEvent(val: unknown): val is ToolEvent {
  if (typeof val !== 'object' || val === null) return false;
  const o = val as Record<string, unknown>;
  return (
    typeof o['type'] === 'string' &&
    typeof o['ts'] === 'string' &&
    typeof o['toolId'] === 'string' &&
    'payload' in o
  );
}

function makeErrorEvent(toolId: string, message: string, code: string): ToolEvent {
  return {
    type: 'error',
    ts: new Date().toISOString(),
    toolId,
    payload: { message, code, recoverable: false },
  };
}
