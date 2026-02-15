/**
 * Phase 3 Detection Contract Tests
 *
 * Tests for Review & Detection layer detection workflows:
 *   - Scenario 2: Detection to Failure Flow with Tags
 *   - Scenario 6: Slug Deduplication
 *
 * Split from phase3-contracts.test.ts during Phase 6 Stage 1 cleanup.
 *
 * @see phase3-shared.ts for types and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  detectFailure,
  inferTopicTags,
  suggestSlug,
} from './phase3-shared';

// =============================================================================
// Scenario 2: Detection to Failure Flow with Tags
// =============================================================================

describe('Scenario 2: Detection to Failure Flow with Tags', () => {
  it('detects failure, infers tags, and suggests slug', () => {
    const failure = detectFailure('test', 'Test push.test.ts failed: Expected confirmation prompt');

    expect(failure.signal_type).toBe('test');
    expect(failure.attribution.uncertain).toBe(false);
    expect(failure.attribution.confidence).toBeGreaterThanOrEqual(0.7);

    const tags = inferTopicTags('src/git/push.ts');

    expect(tags.some(t => t.name === 'git')).toBe(true);
    expect(tags.find(t => t.name === 'git')?.confidence).toBeGreaterThanOrEqual(0.7);

    failure.tags = tags.filter(t => t.confidence >= 0.7).map(t => t.name);

    expect(failure.tags).toContain('git');

    const existingSlugs = ['git-force-push', 'git-rebase-conflict'];
    const suggestion = suggestSlug('force push without confirmation', existingSlugs);

    expect(suggestion.category).toBe('git-');
    expect(suggestion.suggested_slug).toContain('git-');
  });

  it('applies semantic tags from content analysis', () => {
    const content = 'This function handles password reset and token generation';
    const tags = inferTopicTags('src/auth/reset.ts', content);

    expect(tags.some(t => t.name === 'auth')).toBe(true);
    expect(tags.some(t => t.name === 'security')).toBe(true);
    expect(tags.find(t => t.name === 'security')?.source).toBe('content');
  });
});

// =============================================================================
// Scenario 6: Slug Deduplication
// =============================================================================

describe('Scenario 6: Slug Deduplication', () => {
  it('detects existing similar slug and recommends merge', () => {
    const existingSlugs = ['git-force-push-without-confirmation', 'git-rebase-conflict'];
    const suggestion = suggestSlug('force push to main', existingSlugs);

    expect(suggestion.existing_matches.length).toBeGreaterThan(0);
    expect(suggestion.existing_matches[0].slug).toBe('git-force-push-without-confirmation');
    expect(suggestion.existing_matches[0].similarity).toBeGreaterThanOrEqual(0.8);
    expect(suggestion.merge_recommended).toBe(true);
  });

  it('suggests new slug when no similar matches', () => {
    const existingSlugs = ['git-force-push', 'test-flaky'];
    const suggestion = suggestSlug('database connection timeout', existingSlugs);

    expect(suggestion.existing_matches.length).toBe(0);
    expect(suggestion.merge_recommended).toBe(false);
    expect(suggestion.suggested_slug).toContain('git-');
  });

  it('validates slug format with category prefix', () => {
    const suggestion = suggestSlug('some error occurred', []);

    expect(suggestion.category).toBeDefined();
    expect(suggestion.suggested_slug.startsWith(suggestion.category)).toBe(true);
  });
});
