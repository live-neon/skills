/**
 * Interface definitions for VFM (Value Function Model) system integration.
 *
 * These interfaces define the contract for constraint scoring and
 * prioritization between vfm-constraint-scorer and the VFM system.
 */

export const VFM_INTERFACE_VERSION = '1.0.0';

/**
 * Score component weights (configurable via environment variables).
 */
export interface VFMWeights {
  /** Weight for prevention rate (default: 0.4) */
  prevention: number;

  /** Weight for precision/1-FP rate (default: 0.3) */
  precision: number;

  /** Weight for usage frequency (default: 0.2) */
  usage: number;

  /** Weight for severity (default: 0.1) */
  severity: number;
}

/**
 * Default weights based on rationale:
 * - prevention_rate: Primary purpose of constraints; highest weight
 * - precision: False positives erode trust; second highest
 * - usage_frequency: Frequently-used constraints provide more value
 * - severity_weight: Input context, not outcome; lowest weight
 */
export const DEFAULT_WEIGHTS: VFMWeights = {
  prevention: 0.4,
  precision: 0.3,
  usage: 0.2,
  severity: 0.1,
};

/**
 * Severity weight mapping.
 */
export const SEVERITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 1.0,
  IMPORTANT: 0.7,
  MINOR: 0.4,
};

/**
 * Score components breakdown for a single constraint.
 */
export interface VFMScoreComponents {
  /** Prevention rate (0.0-1.0): violations prevented / total attempted */
  prevention_rate: number;

  /** Precision (0.0-1.0): 1 - false_positive_rate */
  precision: number;

  /** Usage frequency (0.0-1.0): normalized enforcement count */
  usage_frequency: number;

  /** Severity weight (0.0-1.0): based on constraint severity */
  severity_weight: number;
}

/**
 * VFM score for a single constraint.
 */
export interface VFMScore {
  /** Constraint ID */
  constraint_id: string;

  /** Constraint name (human-readable) */
  constraint_name: string;

  /** Current constraint state */
  state: 'draft' | 'active' | 'retiring' | 'retired';

  /** Calculated value score (0.0-1.0) */
  value_score: number;

  /** Score quality label */
  quality: 'high' | 'medium' | 'low';

  /** Component breakdown */
  components: VFMScoreComponents;

  /** Weighted contributions to final score */
  contributions: {
    prevention: number;
    precision: number;
    usage: number;
    severity: number;
  };

  /** Percentile ranking (0-100) */
  percentile: number;

  /** Recommendation based on score */
  recommendation: string;

  /** Scoring timestamp (ISO 8601) */
  timestamp: string;
}

/**
 * Ranking export for VFM system.
 */
export interface VFMRanking {
  /** Interface version for compatibility */
  version: string;

  /** Ranking timestamp (ISO 8601) */
  timestamp: string;

  /** Weights used for scoring */
  weights: VFMWeights;

  /** Total constraints scored */
  total_scored: number;

  /** Ranked scores (descending by value_score) */
  rankings: VFMScore[];
}

/**
 * Score calculation request.
 */
export interface VFMScoreRequest {
  /** Constraint ID to score (or 'all' for all active) */
  constraint_id: string | 'all';

  /** Custom weights (optional, uses defaults if not provided) */
  weights?: Partial<VFMWeights>;

  /** Include detailed components in response */
  include_components?: boolean;
}
