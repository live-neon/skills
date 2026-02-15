/**
 * Interface definitions for proactive-agent integration.
 *
 * These interfaces define the contract for WAL parsing and health alerts
 * between the bridge skills and proactive-agent.
 */

export const PROACTIVE_INTERFACE_VERSION = '1.0.0';

/**
 * WAL entry status types.
 */
export type WALStatus = 'PENDING' | 'SUCCESS' | 'ROLLBACK' | 'TIMEOUT' | 'CONFLICT';

/**
 * Failure signature types derived from WAL analysis.
 * Note: These are NOT the same as WALStatus - they represent categorized failure patterns.
 * - ROLLBACK, TIMEOUT, CONFLICT map directly from WALStatus
 * - RETRY_EXCEEDED is derived when retry_count > threshold (not a status itself)
 */
export type FailureSignature = 'ROLLBACK' | 'RETRY_EXCEEDED' | 'TIMEOUT' | 'CONFLICT';

/**
 * A single entry from the write-ahead log.
 */
export interface WALEntry {
  /** Entry timestamp (ISO 8601) */
  timestamp: string;

  /** Action description (command or operation) */
  action: string;

  /** Entry status */
  status: WALStatus;

  /** Number of retry attempts (0 for first attempt) */
  retry_count: number;

  /** Optional metadata (branch, endpoint, path, etc.) */
  metadata?: Record<string, unknown>;

  /** Line number in WAL file (for debugging) */
  line_number?: number;
}

/**
 * Failure signature detected in WAL.
 */
export interface WALFailure {
  /** The WAL entry that triggered the failure */
  entry: WALEntry;

  /** Failure signature type (derived from WAL analysis, not raw status) */
  signature: FailureSignature;

  /** Whether this failure is already tracked by failure-detector */
  already_tracked: boolean;

  /** Suggested pattern name for this failure type */
  suggested_pattern?: string;

  /** Linked constraint ID if matches existing constraint */
  constraint_id?: string;
}

/**
 * Health alert severity levels.
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Health alert for proactive-agent notification.
 */
export interface HealthAlert {
  /** Constraint ID that triggered the alert */
  constraint_id: string;

  /** Alert severity */
  severity: AlertSeverity;

  /** Human-readable alert message */
  message: string;

  /** Recommended action to resolve */
  action: string;

  /** Alert timestamp (ISO 8601) */
  timestamp: string;

  /** Additional context */
  context?: {
    /** Current effectiveness rate */
    effectiveness?: number;

    /** Scope files affected */
    scope_files?: string[];

    /** Days since last review */
    days_since_review?: number;
  };
}

/**
 * Health check result for a single constraint.
 */
export interface ConstraintHealth {
  /** Constraint ID */
  constraint_id: string;

  /** Overall health status */
  status: 'healthy' | 'warning' | 'critical';

  /** Individual check results */
  checks: {
    file_exists: boolean;
    schema_valid: boolean;
    scope_relevant: boolean;
    effectiveness_ok: boolean;
  };

  /** Alert if status is not healthy */
  alert?: HealthAlert;
}

/**
 * Health check summary for all constraints.
 */
export interface HealthCheckSummary {
  /** Interface version for compatibility */
  version: string;

  /** Check timestamp (ISO 8601) */
  timestamp: string;

  /** Execution time in milliseconds */
  execution_time_ms: number;

  /** Count by status */
  counts: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };

  /** Individual constraint health results */
  constraints: ConstraintHealth[];

  /** Next scheduled check timestamp */
  next_check?: string;
}
