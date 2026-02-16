/**
 * Phase 3 Review Contract Tests
 *
 * Tests for Review & Detection layer review workflows:
 *   - Scenario 1: Review Flow with File Verification
 *   - Scenario 4: Review Selection with Security Detection
 *   - Scenario 5: Quality Gate Blocking
 *
 * Split from phase3-contracts.test.ts during Phase 6 Stage 1 cleanup.
 *
 * @see phase3-shared.ts for types and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createContextPacket,
  spawnTwinReview,
  verifyChecksums,
  spawnCognitiveReview,
  inferTopicTags,
  runQualityGate,
  recommendReview,
  type TopicTag,
} from './phase3-shared';

// =============================================================================
// Scenario 1: Review Flow with File Verification
// =============================================================================

describe('Scenario 1: Review Flow with File Verification', () => {
  it('normalizes context and verifies checksums before twin review', () => {
    const files = ['src/git/push.ts', 'tests/push.test.ts'];
    const packet = createContextPacket(files);

    expect(packet.files).toHaveLength(2);
    expect(packet.files[0].path).toBe('src/git/push.ts');
    expect(packet.files[1].path).toBe('tests/push.test.ts');
    expect(packet.system_prompt_hash).toBeDefined();

    const session = spawnTwinReview(packet);

    expect(session.twins).toHaveLength(2);
    expect(session.twins[0].name).toBe('twin-technical');
    expect(session.twins[1].name).toBe('twin-creative');
    expect(session.twins[0].verified_checksums).toBe(false);
    expect(session.twins[1].verified_checksums).toBe(false);

    let updatedSession = verifyChecksums(session, 'twin-technical');
    updatedSession = verifyChecksums(updatedSession, 'twin-creative');

    expect(updatedSession.twins[0].verified_checksums).toBe(true);
    expect(updatedSession.twins[1].verified_checksums).toBe(true);
    expect(updatedSession.twins[0].status).toBe('running');
    expect(updatedSession.twins[1].status).toBe('running');

    expect(session.manifests).toHaveLength(packet.files.length);
    session.manifests.forEach((manifest, i) => {
      expect(manifest.path).toBe(packet.files[i].path);
    });
  });

  it('spawns cognitive review with identical prompts (Same Prompt Principle)', () => {
    const packet = createContextPacket(['docs/plans/migration.md']);
    const session = spawnCognitiveReview(packet);

    expect(session.prompt_hash).toBe(packet.system_prompt_hash);
    expect(session.modes).toHaveLength(3);
    expect(session.modes.map(m => m.name)).toEqual(['analyst', 'transformer', 'operator']);

    expect(session.modes.find(m => m.name === 'analyst')?.model_id).toBe('claude-opus-4');
    expect(session.modes.find(m => m.name === 'transformer')?.model_id).toBe('claude-opus-4-1');
    expect(session.modes.find(m => m.name === 'operator')?.model_id).toBe('claude-sonnet-4-5');
  });
});

// =============================================================================
// Scenario 4: Review Selection with Security Detection
// =============================================================================

describe('Scenario 4: Review Selection with Security Detection', () => {
  it('recommends cognitive-review for security-related files', () => {
    const tags = inferTopicTags('src/auth/login.ts', 'handles password verification');
    const recommendation = recommendReview('src/auth/login.ts', tags);

    expect(recommendation.security_detected).toBe(true);
    expect(recommendation.risk_level).toBe('high');
    expect(recommendation.recommended_review).toBe('cognitive-review');
    expect(recommendation.rationale).toContain('Security-related content detected');
  });

  it('recommends independent-review (N=5) for security-critical plans', () => {
    const tags: TopicTag[] = [{ name: 'security', confidence: 0.92, source: 'path' }];
    const recommendation = recommendReview('docs/plans/security-migration.md', tags);

    expect(recommendation.risk_level).toBe('critical');
    expect(recommendation.recommended_review).toBe('independent-review');
  });

  it('uses path-based fallback when topic-tagger unavailable', () => {
    const tags = inferTopicTags('src/security/validator.ts');
    const recommendation = recommendReview('src/security/validator.ts', tags);

    expect(recommendation.security_detected).toBe(true);
    expect(tags.find(t => t.name === 'security')?.source).toBe('path');
  });
});

// =============================================================================
// Scenario 5: Quality Gate Blocking
// =============================================================================

describe('Scenario 5: Quality Gate Blocking', () => {
  it('passes quality gate when all checks succeed', () => {
    const files = ['src/feature.ts', 'tests/feature.test.ts'];
    const result = runQualityGate(3, 'standard', files);

    expect(result.status).toBe('passed');
    expect(result.blocking_issues).toHaveLength(0);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('blocks on MCE violations', () => {
    const files = ['src/feature.ts', 'src/large-file.ts'];
    const result = runQualityGate(3, 'standard', files);

    expect(result.status).toBe('blocked');
    expect(result.blocking_issues.length).toBeGreaterThan(0);
    expect(result.blocking_issues[0]).toContain('MCE violation');
  });

  it('applies different checks per level', () => {
    const files = ['src/feature.ts'];

    const quickResult = runQualityGate(1, 'quick', files);
    const standardResult = runQualityGate(2, 'standard', files);
    const thoroughResult = runQualityGate(3, 'thorough', files);

    expect(quickResult.checks.length).toBeLessThan(standardResult.checks.length);
    expect(standardResult.checks.length).toBeLessThan(thoroughResult.checks.length);

    expect(quickResult.checks.some(c => c.name === 'mce_compliance')).toBe(false);
    expect(standardResult.checks.some(c => c.name === 'mce_compliance')).toBe(true);
    expect(thoroughResult.checks.some(c => c.name === 'twin_review_high_risk')).toBe(true);
  });
});
