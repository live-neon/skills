/**
 * Interface definitions for self-improving-agent integration.
 *
 * These interfaces define the contract for learnings export from the
 * constraint system to self-improving-agent's learning loop.
 */

export const SELF_IMPROVING_INTERFACE_VERSION = '1.0.0';

/**
 * A single learning extracted from observation N-count progression.
 */
export interface Learning {
  /** Unique identifier for this learning */
  id: string;

  /** Source observation ID */
  observation_id: string;

  /** N-count (recurrence count) - only N>=3 are exported */
  n_count: number;

  /** Human-readable summary of the learning */
  summary: string;

  /** Category (e.g., 'safety', 'workflow', 'testing') */
  category?: string;

  /** Linked constraint ID if observation generated a constraint */
  constraint_id?: string;

  /** Prevention rate if constraint exists (0.0-1.0) */
  prevention_rate?: number;

  /** Related observation IDs from "## Related" sections */
  related_observations?: string[];
}

/**
 * Export format for learnings consumed by self-improving-agent.
 */
export interface LearningsExport {
  /** Interface version for compatibility checking */
  version: string;

  /** Export timestamp (ISO 8601) */
  exported_at: string;

  /** Minimum N-count filter applied */
  min_n_count: number;

  /** Array of learnings meeting the filter criteria */
  learnings: Learning[];

  /** Total count of exported learnings */
  total_count: number;
}

/**
 * Query parameters for learnings retrieval.
 */
export interface LearningsQuery {
  /** Minimum N-count to include (default: 3) */
  min_n_count?: number;

  /** Filter by category */
  category?: string;

  /** Filter by timeframe (e.g., '7d', '30d') */
  timeframe?: string;

  /** Include related observations in results */
  include_related?: boolean;
}
