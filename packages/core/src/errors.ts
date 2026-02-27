/**
 * @m-control/core - Error types
 *
 * Structured error hierarchy so callers can branch on type without
 * string-matching error messages.
 */

/** Base class for all m-control errors. */
export class MControlError extends Error {
  constructor(
    message: string,
    /** Machine-readable code for programmatic handling. */
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Preserve prototype chain in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Config file not found, invalid version, or missing required keys. */
export class ConfigError extends MControlError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
  }
}

/** Manifest not found, invalid schema, or unsupported manifestVersion. */
export class ManifestError extends MControlError {
  constructor(message: string) {
    super(message, 'MANIFEST_ERROR');
  }
}

/** Plugin discovery failed (scan error, not individual manifest error). */
export class DiscoveryError extends MControlError {
  constructor(message: string) {
    super(message, 'DISCOVERY_ERROR');
  }
}

/** Tool execution failed at the runner level (process spawn, timeout, etc.). */
export class RunnerError extends MControlError {
  constructor(
    message: string,
    code: string = 'RUNNER_ERROR',
  ) {
    super(message, code);
  }
}

/** Runner hit a guardrail (maxOutputBytes, maxEvents, timeout). */
export class RunnerGuardrailError extends RunnerError {
  constructor(
    message: string,
    public readonly guardrail: 'maxOutputBytes' | 'maxEvents' | 'timeout',
  ) {
    super(message, 'RUNNER_GUARDRAIL');
  }
}

/** Runtime not yet implemented. */
export class NotImplementedError extends MControlError {
  constructor(runtime: string) {
    super(`Runner for runtime '${runtime}' is not yet implemented.`, 'NOT_IMPLEMENTED');
  }
}
