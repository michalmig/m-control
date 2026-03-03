import { WorkStep } from '@m-control/core';

/** Result of executing a single work step. */
export interface StepResult {
  step: WorkStep;
  success: boolean;
  /** Human-readable failure reason. Present only when success is false. */
  errorMessage?: string;
}
