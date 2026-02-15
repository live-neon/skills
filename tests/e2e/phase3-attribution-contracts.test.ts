/**
 * Phase 3 Attribution Contract Tests
 *
 * Tests for Review & Detection layer evidence and attribution:
 *   - Scenario 3: Evidence Progression to Constraint
 *   - Scenario 7: RG-6 Uncertain Attribution
 *   - Cross-Layer Integration
 *
 * Split from phase3-contracts.test.ts during Phase 6 Stage 1 cleanup.
 *
 * @see phase3-shared.ts for types and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createContextPacket,
  spawnTwinReview,
  detectFailure,
  inferTopicTags,
  classifyEvidenceTier,
  isConstraintEligible,
  type ObservationEvidence,
} from './phase3-shared';

// =============================================================================
// Scenario 3: Evidence Progression to Constraint
// =============================================================================

describe('Scenario 3: Evidence Progression to Constraint', () => {
  it('progresses through evidence tiers as observations accumulate', () => {
    let evidence: ObservationEvidence = {
      slug: 'git-force-push',
      r_count: 1,
      c_count: 0,
      d_count: 0,
      tier: classifyEvidenceTier(1, 0, 0),
      constraint_eligible: false,
    };

    expect(evidence.tier).toBe('weak');
    expect(isConstraintEligible(evidence)).toBe(false);

    evidence = { ...evidence, r_count: 2, tier: classifyEvidenceTier(2, 0, 0) };

    expect(evidence.tier).toBe('emerging');
    expect(isConstraintEligible(evidence)).toBe(false);

    evidence = { ...evidence, r_count: 3, tier: classifyEvidenceTier(3, 0, 0) };

    expect(evidence.tier).toBe('strong');
    expect(isConstraintEligible(evidence)).toBe(false);

    evidence = { ...evidence, c_count: 2 };

    expect(isConstraintEligible(evidence)).toBe(true);

    evidence = { ...evidence, r_count: 5, tier: classifyEvidenceTier(5, 2, 0) };

    expect(evidence.tier).toBe('established');
    expect(isConstraintEligible(evidence)).toBe(true);
  });

  it('prevents constraint eligibility with high disconfirmation rate', () => {
    const evidence: ObservationEvidence = {
      slug: 'possibly-false-positive',
      r_count: 5,
      c_count: 2,
      d_count: 3,
      tier: 'established',
      constraint_eligible: false,
    };

    expect(isConstraintEligible(evidence)).toBe(false);
  });
});

// =============================================================================
// Scenario 7: RG-6 Uncertain Attribution
// =============================================================================

describe('Scenario 7: RG-6 Uncertain Attribution', () => {
  it('flags multi-causal failures as uncertain', () => {
    const failure = detectFailure('error', 'Complex system failure', { multiCausal: true });

    expect(failure.attribution.uncertain).toBe(true);
    expect(failure.attribution.confidence).toBeLessThan(0.7);
    expect(failure.attribution.alternative_causes.length).toBeGreaterThan(0);
    expect(failure.attribution.attribution_method).toBe('provisional_single_cause');
  });

  it('marks observation as requiring human review when uncertain', () => {
    const failure = detectFailure('error', 'Ambiguous failure', { multiCausal: true });

    expect(failure.attribution.uncertain).toBe(true);

    const humanReviewRequired = failure.attribution.uncertain;
    expect(humanReviewRequired).toBe(true);
  });

  it('allows confident attributions to proceed normally', () => {
    const failure = detectFailure('test', 'Clear test failure');

    expect(failure.attribution.uncertain).toBe(false);
    expect(failure.attribution.confidence).toBeGreaterThanOrEqual(0.7);
    expect(failure.attribution.alternative_causes.length).toBe(0);
  });

  it('documents provisional attribution method', () => {
    const failure = detectFailure('correction', 'User correction detected');

    expect(failure.attribution.attribution_method).toBe('provisional_single_cause');
  });
});

// =============================================================================
// Cross-Layer Integration
// =============================================================================

describe('Cross-Layer Integration', () => {
  it('integrates review findings with failure detection', () => {
    const packet = createContextPacket(['src/feature.ts']);
    const session = spawnTwinReview(packet);

    const reviewFinding = '[Critical] Missing error handling in feature.ts';
    const failure = detectFailure('review', reviewFinding);

    expect(failure.signal_type).toBe('review');
    expect(failure.attribution.uncertain).toBe(false);

    const tags = inferTopicTags('src/feature.ts');
    failure.tags = tags.filter(t => t.confidence >= 0.7).map(t => t.name);

    expect(failure.tags.length).toBeGreaterThan(0);
  });

  it('flows from detection through evidence to constraint eligibility', () => {
    const failure = detectFailure('test', 'Repeated test failure');

    let evidence: ObservationEvidence = {
      slug: failure.suggested_slug,
      r_count: 1,
      c_count: 0,
      d_count: 0,
      tier: 'weak',
      constraint_eligible: false,
    };

    for (let i = 0; i < 2; i++) {
      evidence = {
        ...evidence,
        r_count: evidence.r_count + 1,
        tier: classifyEvidenceTier(evidence.r_count + 1, evidence.c_count, evidence.d_count),
      };
    }

    expect(evidence.r_count).toBe(3);
    expect(evidence.tier).toBe('strong');

    evidence = { ...evidence, c_count: 2 };

    expect(isConstraintEligible(evidence)).toBe(true);
  });
});
