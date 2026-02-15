/**
 * Mock VFM Constraint Scorer
 *
 * Mock skill implementation for contract testing vfm-constraint-scorer.
 * Extracted from phase5-bridge-contracts.test.ts during Phase 6 Stage 1.
 */

import type {
  VFMScore,
  VFMRanking,
  VFMWeights,
  VFMScoreComponents,
} from '../../agentic/bridge/interfaces/vfm-system';
import { DEFAULT_WEIGHTS, SEVERITY_WEIGHTS } from '../../agentic/bridge/interfaces/vfm-system';
import { getAdapter } from '../../agentic/bridge/adapters/factory';

export class MockVFMConstraintScorer {
  private constraints: Map<
    string,
    {
      name: string;
      state: 'draft' | 'active' | 'retiring' | 'retired';
      prevention_rate: number;
      false_positive_rate: number;
      usage_frequency: number;
      severity: 'CRITICAL' | 'IMPORTANT' | 'MINOR';
    }
  > = new Map();

  addConstraint(
    id: string,
    config: {
      name: string;
      state?: 'draft' | 'active' | 'retiring' | 'retired';
      prevention_rate: number;
      false_positive_rate: number;
      usage_frequency: number;
      severity: 'CRITICAL' | 'IMPORTANT' | 'MINOR';
    }
  ): void {
    this.constraints.set(id, {
      name: config.name,
      state: config.state ?? 'active',
      prevention_rate: config.prevention_rate,
      false_positive_rate: config.false_positive_rate,
      usage_frequency: config.usage_frequency,
      severity: config.severity,
    });
  }

  score(id: string, customWeights?: Partial<VFMWeights>): VFMScore | null {
    const config = this.constraints.get(id);
    if (!config) return null;

    let weights = DEFAULT_WEIGHTS;
    if (customWeights) {
      const merged = { ...DEFAULT_WEIGHTS, ...customWeights };
      const sum = merged.prevention + merged.precision + merged.usage + merged.severity;
      if (Math.abs(sum - 1.0) > 0.001) {
        console.warn('[VFMScorer] Invalid weights (sum !== 1.0), using defaults');
      } else {
        weights = merged;
      }
    }

    const components: VFMScoreComponents = {
      prevention_rate: config.prevention_rate,
      precision: 1 - config.false_positive_rate,
      usage_frequency: config.usage_frequency,
      severity_weight: SEVERITY_WEIGHTS[config.severity] || 0.4,
    };

    const contributions = {
      prevention: components.prevention_rate * weights.prevention,
      precision: components.precision * weights.precision,
      usage: components.usage_frequency * weights.usage,
      severity: components.severity_weight * weights.severity,
    };

    const value_score = Number(
      (contributions.prevention + contributions.precision + contributions.usage + contributions.severity).toFixed(4)
    );

    const quality: 'high' | 'medium' | 'low' =
      value_score >= 0.75 ? 'high' : value_score >= 0.5 ? 'medium' : 'low';

    return {
      constraint_id: id,
      constraint_name: config.name,
      state: config.state,
      value_score,
      quality,
      components,
      contributions,
      percentile: 0,
      recommendation:
        quality === 'high'
          ? 'Maintain - high-performing constraint'
          : quality === 'medium'
            ? 'Monitor - adequate performance'
            : 'Review - consider retirement or improvement',
      timestamp: new Date().toISOString(),
    };
  }

  rank(weights: VFMWeights = DEFAULT_WEIGHTS): VFMRanking {
    const scores: VFMScore[] = [];

    for (const id of this.constraints.keys()) {
      const score = this.score(id, weights);
      if (score) scores.push(score);
    }

    scores.sort((a, b) => b.value_score - a.value_score);

    const total = scores.length;
    scores.forEach((score, index) => {
      score.percentile = Math.round(((total - index) / total) * 100);
    });

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      weights,
      total_scored: scores.length,
      rankings: scores,
    };
  }

  async exportToVFM(): Promise<void> {
    const vfm = getAdapter('vfm-system');
    const ranking = this.rank();
    await vfm.submitRanking(ranking);
  }
}
