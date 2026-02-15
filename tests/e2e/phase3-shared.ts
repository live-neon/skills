/**
 * Phase 3 Shared Types and Utilities
 *
 * Extracted from phase3-contracts.test.ts during Phase 6 Stage 1 cleanup.
 * Used by: phase3-review-contracts.test.ts, phase3-detection-contracts.test.ts,
 *          phase3-attribution-contracts.test.ts
 */

// =============================================================================
// Phase 3 Types
// =============================================================================

export interface ContextPacket {
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

export interface FileManifest {
  path: string;
  lines: number;
  sha256: string;
  commit: string;
  verified: string;
}

export interface TwinReviewSession {
  packet_id: string;
  manifests: FileManifest[];
  twins: Array<{
    name: string;
    agent_id: string;
    status: 'spawned' | 'running' | 'completed' | 'error';
    verified_checksums: boolean;
  }>;
}

export interface CognitiveReviewSession {
  packet_id: string;
  prompt_hash: string;
  modes: Array<{
    name: 'analyst' | 'transformer' | 'operator';
    model_id: string;
    status: 'spawned' | 'running' | 'completed' | 'error';
  }>;
}

export interface TopicTag {
  name: string;
  confidence: number;
  source: 'path' | 'content' | 'semantic';
}

export interface FailureCandidate {
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

export type EvidenceTier = 'weak' | 'emerging' | 'strong' | 'established';

export interface ObservationEvidence {
  slug: string;
  r_count: number;
  c_count: number;
  d_count: number;
  tier: EvidenceTier;
  constraint_eligible: boolean;
}

export interface SlugSuggestion {
  suggested_slug: string;
  category: string;
  existing_matches: Array<{ slug: string; similarity: number }>;
  merge_recommended: boolean;
}

export interface QualityGateResult {
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

export interface ReviewRecommendation {
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

export function createContextPacket(files: string[]): ContextPacket {
  const sortedFiles = [...files].sort();
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

export function createFileManifest(path: string): FileManifest {
  return {
    path,
    lines: Math.floor(Math.random() * 300) + 50,
    sha256: Math.random().toString(36).substring(2, 18),
    commit: `main@${Math.random().toString(36).substring(2, 9)}`,
    verified: new Date().toISOString().split('T')[0],
  };
}

export function spawnTwinReview(packet: ContextPacket): TwinReviewSession {
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

export function verifyChecksums(session: TwinReviewSession, twinName: string): TwinReviewSession {
  return {
    ...session,
    twins: session.twins.map(t =>
      t.name === twinName ? { ...t, verified_checksums: true, status: 'running' as const } : t
    ),
  };
}

export function spawnCognitiveReview(packet: ContextPacket): CognitiveReviewSession {
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

export function inferTopicTags(filePath: string, content?: string): TopicTag[] {
  const tags: TopicTag[] = [];

  if (filePath.includes('/git/')) tags.push({ name: 'git', confidence: 0.95, source: 'path' });
  if (filePath.includes('/auth/')) tags.push({ name: 'auth', confidence: 0.95, source: 'path' });
  if (filePath.includes('/security/')) tags.push({ name: 'security', confidence: 0.92, source: 'path' });
  if (filePath.includes('/api/')) tags.push({ name: 'api', confidence: 0.90, source: 'path' });

  if (filePath.startsWith('src/')) tags.push({ name: 'backend', confidence: 0.80, source: 'path' });
  if (filePath.includes('test')) tags.push({ name: 'testing', confidence: 0.85, source: 'path' });

  if (content?.includes('force') || content?.includes('destructive')) {
    tags.push({ name: 'safety', confidence: 0.72, source: 'content' });
  }
  if (content?.includes('password') || content?.includes('token')) {
    tags.push({ name: 'security', confidence: 0.89, source: 'content' });
  }

  return tags;
}

export function detectFailure(
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

export function classifyEvidenceTier(r: number, c: number, d: number): EvidenceTier {
  const n = r;
  if (n >= 5) return 'established';
  if (n >= 3) return 'strong';
  if (n >= 2) return 'emerging';
  return 'weak';
}

export function isConstraintEligible(obs: ObservationEvidence): boolean {
  return (
    obs.r_count >= 3 &&
    obs.c_count >= 2 &&
    obs.d_count / (obs.c_count + obs.d_count || 1) < 0.2
  );
}

export function suggestSlug(description: string, existingSlugs: string[]): SlugSuggestion {
  const suggested = `git-${description.toLowerCase().replace(/\s+/g, '-').substring(0, 25)}`;
  const category = 'git-';

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

export function runQualityGate(stage: number, level: 'quick' | 'standard' | 'thorough', files: string[]): QualityGateResult {
  const checks: QualityGateResult['checks'] = [];
  const blocking_issues: string[] = [];

  checks.push({ name: 'tests_pass', passed: true });
  checks.push({ name: 'lint_clean', passed: true });

  if (level === 'standard' || level === 'thorough') {
    checks.push({ name: 'no_constraint_violations', passed: true });

    const mceViolations = files.filter(f => f.includes('large-file'));

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

export function recommendReview(filePath: string, tags: TopicTag[]): ReviewRecommendation {
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
