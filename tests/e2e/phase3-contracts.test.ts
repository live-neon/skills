/**
 * Phase 3 Contract Tests
 *
 * CONTRACT TESTS - NOT INTEGRATION TESTS
 *
 * These tests verify data contracts and simulated interactions between
 * Review & Detection layer skills. They use LOCAL MOCK IMPLEMENTATIONS
 * (defined in this file) rather than actual skill implementations.
 *
 * What these tests validate:
 *   - Data structure contracts (types, fields, formats)
 *   - Workflow logic with simulated skill responses
 *   - Cross-layer data flow patterns
 *
 * What these tests DO NOT validate:
 *   - Actual skill behavior in production
 *   - Real LLM-based semantic classification
 *   - Actual file I/O or checksum verification
 *
 * DESIGN NOTE (from N=2 code review 2026-02-14):
 * Topic tagging uses path/keyword heuristics (e.g., includes('/git/'))
 * to SIMULATE LLM-based semantic classification. This is intentional:
 * production skills use real LLM classification, but these contract
 * tests verify the data flow with deterministic heuristic responses.
 *
 * MCE NOTE (from N=2 twin review 2026-02-14):
 * This file is 747 lines, exceeding the 200-line MCE limit for code.
 * ACCEPTED AS TECHNICAL DEBT because:
 *   1. Test files have different maintainability concerns than production code
 *   2. Splitting would fragment related contract scenarios
 *   3. The file is well-organized with clear section separators
 * Consider splitting if file grows beyond 1000 lines or becomes hard to navigate.
 *
 * Scenarios:
 *   1. Review Flow with File Verification
 *   2. Detection to Failure Flow with Tags
 *   3. Evidence Progression to Constraint
 *   4. Review Selection with Security Detection
 *   5. Quality Gate Blocking
 *   6. Slug Deduplication
 *   7. RG-6 Uncertain Attribution
 *
 * Run tests:
 *   npx vitest run e2e/phase3-contracts.test.ts
 *
 * @see docs/issues/2026-02-14-phase3-code-review-findings.md (Finding 2, O1)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// =============================================================================
// Phase 3 Types
// =============================================================================

interface ContextPacket {
  packet_id: string;
  created: string;
  files: Array<{
    path: string;
    hash: string;
    lines: number;
  }>;
  total_tokens: number;
  system_prompt_hash: string;
  reviewers: string[];
}

interface FileManifest {
  path: string;
  lines: number;
  sha256: string;  // Standardized from MD5 per N=2 code review (2026-02-14)
  commit: string;
  verified: string;
}

interface TwinReviewSession {
  packet_id: string;
  manifests: FileManifest[];
  twins: Array<{
    name: string;
    agent_id: string;
    status: 'spawned' | 'running' | 'completed' | 'error';
    verified_checksums: boolean;
  }>;
}

interface CognitiveReviewSession {
  packet_id: string;
  prompt_hash: string;
  modes: Array<{
    name: 'analyst' | 'transformer' | 'operator';
    model_id: string;
    status: 'spawned' | 'running' | 'completed' | 'error';
  }>;
}

interface TopicTag {
  name: string;
  confidence: number;
  source: 'path' | 'content' | 'semantic';
}

interface FailureCandidate {
  description: string;
  signal_type: 'test' | 'correction' | 'review' | 'error' | 'violation';
  attribution: {
    primary_cause: string;
    confidence: number;
    alternative_causes: Array<{ cause: string; confidence: number }>;
    uncertain: boolean;
    attribution_method: string;
  };
  suggested_slug: string;
  tags: string[];
}

type EvidenceTier = 'weak' | 'emerging' | 'strong' | 'established';

interface ObservationEvidence {
  slug: string;
  r_count: number;
  c_count: number;
  d_count: number;
  tier: EvidenceTier;
  constraint_eligible: boolean;
}

interface SlugSuggestion {
  suggested_slug: string;
  category: string;
  existing_matches: Array<{ slug: string; similarity: number }>;
  merge_recommended: boolean;
}

interface QualityGateResult {
  stage: number;
  level: 'quick' | 'standard' | 'thorough';
  checks: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
  status: 'passed' | 'blocked';
  blocking_issues: string[];
}

interface ReviewRecommendation {
  file: string;
  file_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_review: string;
  rationale: string[];
  security_detected: boolean;
}

// =============================================================================
// Phase 3 Utilities
// =============================================================================

function createContextPacket(files: string[]): ContextPacket {
  const sortedFiles = [...files].sort(); // Alphabetical ordering
  return {
    packet_id: `norm-${Date.now()}`,
    created: new Date().toISOString(),
    files: sortedFiles.map((path, i) => ({
      path,
      hash: `sha256:${Math.random().toString(36).substring(7)}`,
      lines: 100 + i * 50,
    })),
    total_tokens: sortedFiles.length * 500,
    system_prompt_hash: `sha256:sysprompt${Math.random().toString(36).substring(7)}`,
    reviewers: [],
  };
}

function createFileManifest(path: string): FileManifest {
  return {
    path,
    lines: Math.floor(Math.random() * 300) + 50,
    sha256: Math.random().toString(36).substring(2, 18),  // 16-char prefix
    commit: `main@${Math.random().toString(36).substring(2, 9)}`,
    verified: new Date().toISOString().split('T')[0],
  };
}

function spawnTwinReview(packet: ContextPacket): TwinReviewSession {
  const manifests = packet.files.map(f => createFileManifest(f.path));
  return {
    packet_id: packet.packet_id,
    manifests,
    twins: [
      { name: 'twin-technical', agent_id: `tech-${Date.now()}`, status: 'spawned', verified_checksums: false },
      { name: 'twin-creative', agent_id: `creat-${Date.now()}`, status: 'spawned', verified_checksums: false },
    ],
  };
}

function verifyChecksums(session: TwinReviewSession, twinName: string): TwinReviewSession {
  return {
    ...session,
    twins: session.twins.map(t =>
      t.name === twinName ? { ...t, verified_checksums: true, status: 'running' as const } : t
    ),
  };
}

function spawnCognitiveReview(packet: ContextPacket): CognitiveReviewSession {
  const promptHash = packet.system_prompt_hash;
  return {
    packet_id: packet.packet_id,
    prompt_hash: promptHash,
    modes: [
      { name: 'analyst', model_id: 'claude-opus-4', status: 'spawned' },
      { name: 'transformer', model_id: 'claude-opus-4-1', status: 'spawned' },
      { name: 'operator', model_id: 'claude-sonnet-4-5', status: 'spawned' },
    ],
  };
}

function inferTopicTags(filePath: string, content?: string): TopicTag[] {
  const tags: TopicTag[] = [];

  // Path-based inference
  if (filePath.includes('/git/')) tags.push({ name: 'git', confidence: 0.95, source: 'path' });
  if (filePath.includes('/auth/')) tags.push({ name: 'auth', confidence: 0.95, source: 'path' });
  if (filePath.includes('/security/')) tags.push({ name: 'security', confidence: 0.92, source: 'path' });
  if (filePath.includes('/api/')) tags.push({ name: 'api', confidence: 0.90, source: 'path' });

  // Layer inference
  if (filePath.startsWith('src/')) tags.push({ name: 'backend', confidence: 0.80, source: 'path' });
  if (filePath.includes('test')) tags.push({ name: 'testing', confidence: 0.85, source: 'path' });

  // Content-based inference (simulated)
  if (content?.includes('force') || content?.includes('destructive')) {
    tags.push({ name: 'safety', confidence: 0.72, source: 'content' });
  }
  if (content?.includes('password') || content?.includes('token')) {
    tags.push({ name: 'security', confidence: 0.89, source: 'content' });
  }

  return tags;
}

function detectFailure(
  signalType: FailureCandidate['signal_type'],
  description: string,
  context?: { multiCausal?: boolean }
): FailureCandidate {
  const confidence = context?.multiCausal ? 0.55 : 0.85;
  const uncertain = confidence < 0.7;

  return {
    description,
    signal_type: signalType,
    attribution: {
      primary_cause: `Root cause for: ${description}`,
      confidence,
      alternative_causes: context?.multiCausal
        ? [
            { cause: 'Alternative cause 1', confidence: 0.52 },
            { cause: 'Alternative cause 2', confidence: 0.48 },
          ]
        : [],
      uncertain,
      attribution_method: 'provisional_single_cause',
    },
    suggested_slug: `${signalType}-${description.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`,
    tags: [],
  };
}

function classifyEvidenceTier(r: number, c: number, d: number): EvidenceTier {
  const n = r;
  if (n >= 5) return 'established';
  if (n >= 3) return 'strong';
  if (n >= 2) return 'emerging';
  return 'weak';
}

function isConstraintEligible(obs: ObservationEvidence): boolean {
  return (
    obs.r_count >= 3 &&
    obs.c_count >= 2 &&
    obs.d_count / (obs.c_count + obs.d_count || 1) < 0.2
  );
}

function suggestSlug(description: string, existingSlugs: string[]): SlugSuggestion {
  // Simulate semantic matching
  const suggested = `git-${description.toLowerCase().replace(/\s+/g, '-').substring(0, 25)}`;
  const category = 'git-';

  // Find similar existing slugs (simulated semantic similarity)
  const matches = existingSlugs
    .filter(s => s.startsWith('git-'))
    .map(slug => ({
      slug,
      similarity: description.toLowerCase().includes('force') && slug.includes('force') ? 0.87 : 0.45,
    }))
    .filter(m => m.similarity >= 0.7)
    .sort((a, b) => b.similarity - a.similarity);

  return {
    suggested_slug: suggested,
    category,
    existing_matches: matches,
    merge_recommended: matches.length > 0 && matches[0].similarity >= 0.8,
  };
}

function runQualityGate(stage: number, level: 'quick' | 'standard' | 'thorough', files: string[]): QualityGateResult {
  const checks: QualityGateResult['checks'] = [];
  const blocking_issues: string[] = [];

  // Quick level checks
  checks.push({ name: 'tests_pass', passed: true });
  checks.push({ name: 'lint_clean', passed: true });

  // Standard level checks
  if (level === 'standard' || level === 'thorough') {
    checks.push({ name: 'no_constraint_violations', passed: true });

    // MCE compliance check
    const mceViolations = files.filter(f => {
      // Simulate: some files exceed MCE limits
      return f.includes('large-file');
    });

    if (mceViolations.length > 0) {
      checks.push({
        name: 'mce_compliance',
        passed: false,
        details: `${mceViolations.length} files exceed MCE limits`,
      });
      blocking_issues.push(`MCE violation: ${mceViolations.join(', ')}`);
    } else {
      checks.push({ name: 'mce_compliance', passed: true });
    }
  }

  // Thorough level checks
  if (level === 'thorough') {
    checks.push({ name: 'twin_review_high_risk', passed: true });
  }

  return {
    stage,
    level,
    checks,
    status: blocking_issues.length > 0 ? 'blocked' : 'passed',
    blocking_issues,
  };
}

function recommendReview(filePath: string, tags: TopicTag[]): ReviewRecommendation {
  const securityDetected = tags.some(t => t.name === 'security' && t.confidence >= 0.7);
  const isAuth = filePath.includes('/auth/');
  const isPlan = filePath.endsWith('.md') && filePath.includes('plan');

  let risk_level: ReviewRecommendation['risk_level'] = 'medium';
  let recommended_review = 'twin-review';
  const rationale: string[] = [];

  if (securityDetected || isAuth) {
    risk_level = 'high';
    recommended_review = 'cognitive-review';
    rationale.push('Security-related content detected');
    rationale.push('Multiple perspectives catch different issues');
  }

  if (isPlan) {
    recommended_review = 'twin-review';
    rationale.push('Implementation plan benefits from twin review');
  }

  if (securityDetected && isPlan) {
    risk_level = 'critical';
    recommended_review = 'independent-review';
    rationale.push('Security-critical plan requires N=5 coverage');
  }

  return {
    file: filePath,
    file_type: filePath.split('.').pop() || 'unknown',
    risk_level,
    recommended_review,
    rationale,
    security_detected: securityDetected,
  };
}

// =============================================================================
// Scenario 1: Review Flow with File Verification
// =============================================================================

describe('Scenario 1: Review Flow with File Verification', () => {
  it('normalizes context and verifies checksums before twin review', () => {
    // Step 1: Create normalized context packet
    const files = ['src/git/push.ts', 'tests/push.test.ts'];
    const packet = createContextPacket(files);

    expect(packet.files).toHaveLength(2);
    expect(packet.files[0].path).toBe('src/git/push.ts'); // Alphabetical
    expect(packet.files[1].path).toBe('tests/push.test.ts');
    expect(packet.system_prompt_hash).toBeDefined();

    // Step 2: Spawn twin review
    const session = spawnTwinReview(packet);

    expect(session.twins).toHaveLength(2);
    expect(session.twins[0].name).toBe('twin-technical');
    expect(session.twins[1].name).toBe('twin-creative');
    expect(session.twins[0].verified_checksums).toBe(false);
    expect(session.twins[1].verified_checksums).toBe(false);

    // Step 3: Each twin verifies checksums
    let updatedSession = verifyChecksums(session, 'twin-technical');
    updatedSession = verifyChecksums(updatedSession, 'twin-creative');

    expect(updatedSession.twins[0].verified_checksums).toBe(true);
    expect(updatedSession.twins[1].verified_checksums).toBe(true);
    expect(updatedSession.twins[0].status).toBe('running');
    expect(updatedSession.twins[1].status).toBe('running');

    // Step 4: Verify manifests match packet
    expect(session.manifests).toHaveLength(packet.files.length);
    session.manifests.forEach((manifest, i) => {
      expect(manifest.path).toBe(packet.files[i].path);
    });
  });

  it('spawns cognitive review with identical prompts (Same Prompt Principle)', () => {
    // Step 1: Create context packet
    const packet = createContextPacket(['docs/plans/migration.md']);

    // Step 2: Spawn cognitive review
    const session = spawnCognitiveReview(packet);

    // Step 3: Verify all modes use same prompt hash
    expect(session.prompt_hash).toBe(packet.system_prompt_hash);

    // Step 4: Verify all three modes spawned
    expect(session.modes).toHaveLength(3);
    expect(session.modes.map(m => m.name)).toEqual(['analyst', 'transformer', 'operator']);

    // Step 5: Verify correct model IDs
    expect(session.modes.find(m => m.name === 'analyst')?.model_id).toBe('claude-opus-4');
    expect(session.modes.find(m => m.name === 'transformer')?.model_id).toBe('claude-opus-4-1');
    expect(session.modes.find(m => m.name === 'operator')?.model_id).toBe('claude-sonnet-4-5');
  });
});

// =============================================================================
// Scenario 2: Detection to Failure Flow with Tags
// =============================================================================

describe('Scenario 2: Detection to Failure Flow with Tags', () => {
  it('detects failure, infers tags, and suggests slug', () => {
    // Step 1: Detect test failure
    const failure = detectFailure('test', 'Test push.test.ts failed: Expected confirmation prompt');

    expect(failure.signal_type).toBe('test');
    expect(failure.attribution.uncertain).toBe(false);
    expect(failure.attribution.confidence).toBeGreaterThanOrEqual(0.7);

    // Step 2: Infer topic tags from file path
    const tags = inferTopicTags('src/git/push.ts');

    expect(tags.some(t => t.name === 'git')).toBe(true);
    expect(tags.find(t => t.name === 'git')?.confidence).toBeGreaterThanOrEqual(0.7);

    // Step 3: Add tags to failure candidate
    failure.tags = tags.filter(t => t.confidence >= 0.7).map(t => t.name);

    expect(failure.tags).toContain('git');

    // Step 4: Suggest canonical slug
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
// Scenario 3: Evidence Progression to Constraint
// =============================================================================

describe('Scenario 3: Evidence Progression to Constraint', () => {
  it('progresses through evidence tiers as observations accumulate', () => {
    // Step 1: First occurrence - WEAK
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

    // Step 2: Second occurrence - EMERGING
    evidence = { ...evidence, r_count: 2, tier: classifyEvidenceTier(2, 0, 0) };

    expect(evidence.tier).toBe('emerging');
    expect(isConstraintEligible(evidence)).toBe(false);

    // Step 3: Third occurrence - STRONG
    evidence = { ...evidence, r_count: 3, tier: classifyEvidenceTier(3, 0, 0) };

    expect(evidence.tier).toBe('strong');
    expect(isConstraintEligible(evidence)).toBe(false); // Still needs confirmations

    // Step 4: Add confirmations
    evidence = { ...evidence, c_count: 2 };

    expect(isConstraintEligible(evidence)).toBe(true);

    // Step 5: Fifth occurrence - ESTABLISHED
    evidence = { ...evidence, r_count: 5, tier: classifyEvidenceTier(5, 2, 0) };

    expect(evidence.tier).toBe('established');
    expect(isConstraintEligible(evidence)).toBe(true);
  });

  it('prevents constraint eligibility with high disconfirmation rate', () => {
    const evidence: ObservationEvidence = {
      slug: 'possibly-false-positive',
      r_count: 5,
      c_count: 2,
      d_count: 3, // 60% disconfirmation rate
      tier: 'established',
      constraint_eligible: false,
    };

    // D/(C+D) = 3/5 = 0.6 > 0.2 threshold
    expect(isConstraintEligible(evidence)).toBe(false);
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
    // Simulate no content tags, only path-based inference
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
    const files = ['src/feature.ts', 'src/large-file.ts']; // large-file triggers violation
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
    expect(suggestion.suggested_slug).toContain('git-'); // Still uses default category
  });

  it('validates slug format with category prefix', () => {
    const suggestion = suggestSlug('some error occurred', []);

    expect(suggestion.category).toBeDefined();
    expect(suggestion.suggested_slug.startsWith(suggestion.category)).toBe(true);
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

    // Uncertain attribution should not auto-generate constraint
    expect(failure.attribution.uncertain).toBe(true);

    // Simulate observation creation with human_review_required flag
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
    // Step 1: Run review
    const packet = createContextPacket(['src/feature.ts']);
    const session = spawnTwinReview(packet);

    // Step 2: Simulate review finding
    const reviewFinding = '[Critical] Missing error handling in feature.ts';

    // Step 3: Detection picks up review finding
    const failure = detectFailure('review', reviewFinding);

    expect(failure.signal_type).toBe('review');
    expect(failure.attribution.uncertain).toBe(false);

    // Step 4: Add tags from file
    const tags = inferTopicTags('src/feature.ts');
    failure.tags = tags.filter(t => t.confidence >= 0.7).map(t => t.name);

    expect(failure.tags.length).toBeGreaterThan(0);
  });

  it('flows from detection through evidence to constraint eligibility', () => {
    // Step 1: Detect failure
    const failure = detectFailure('test', 'Repeated test failure');

    // Step 2: Create evidence tracking
    let evidence: ObservationEvidence = {
      slug: failure.suggested_slug,
      r_count: 1,
      c_count: 0,
      d_count: 0,
      tier: 'weak',
      constraint_eligible: false,
    };

    // Step 3: Accumulate evidence
    for (let i = 0; i < 2; i++) {
      evidence = {
        ...evidence,
        r_count: evidence.r_count + 1,
        tier: classifyEvidenceTier(evidence.r_count + 1, evidence.c_count, evidence.d_count),
      };
    }

    expect(evidence.r_count).toBe(3);
    expect(evidence.tier).toBe('strong');

    // Step 4: Add confirmations
    evidence = { ...evidence, c_count: 2 };

    // Step 5: Check constraint eligibility
    expect(isConstraintEligible(evidence)).toBe(true);
  });
});
