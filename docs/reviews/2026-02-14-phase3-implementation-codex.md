# Phase 3 Agentic Skills Implementation Review - Codex

**Date**: 2026-02-14
**Reviewer**: Codex GPT-5.1 (codex-gpt51-examiner)
**Files Reviewed**: 17 files (12 SKILL.md, 1 test file, 4 documentation files)
**Mode**: `--sandbox read-only`
**Session ID**: 019c5b53-5667-79a2-8dab-82b0084dbf25

## Summary

Phase 3 implementation is well-structured with consistent skill documentation format and comprehensive integration tests. No CRITICAL findings identified. Four IMPORTANT findings require attention before production use, primarily around hash verification consistency, eligibility criteria ambiguity, missing event schema, and test-spec alignment. One MINOR finding notes test implementation divergence from spec.

## Findings

### Critical

None identified.

### Important

#### 1. MD5 Truncation vs SHA-256 Inconsistency

**File**: `projects/live-neon/skills/agentic/review/twin-review/SKILL.md:51-54`

**Issue**: twin-review uses truncated 8-character MD5 for "critical" file verification:
```
3. **Verification command**: `md5 <file> | head -c 8` for quick verification
```

Meanwhile, prompt-normalizer uses full SHA-256:
```json
{"path": "src/git/push.ts", "hash": "sha256:abc...", "lines": 150}
```

**Risk**: MD5 with truncation to 8 characters significantly increases collision probability. A modified file could pass checksum verification and break the "identical context" guarantee the skill is meant to enforce.

**Recommendation**: Align twin-review with prompt-normalizer's SHA-256 verification. If quick verification is needed, use first 16 characters of SHA-256 instead of 8 characters of MD5.

---

#### 2. Conflicting Evidence Tier Eligibility Criteria

**File**: `projects/live-neon/skills/agentic/detection/evidence-tier/SKILL.md:38-44,55,71-95`

**Issue**: Three different statements about constraint eligibility:

| Location | Criteria |
|----------|----------|
| Tier table (line 42) | STRONG (N>=3) = "Eligible for constraint" |
| Formula (line 55) | `R >= 3 AND C >= 2 AND D/(C+D) < 0.2` |
| Example (lines 71-95) | Adds `sources>=2` and `users>=2` requirements |

The formula omits source/user diversity, while the example includes it. This ambiguity makes it unclear when constraint generation should actually fire.

**Risk**: Over-promoting single-source evidence to constraint status, or under-promoting multi-source evidence depending on which interpretation is followed.

**Recommendation**: Reconcile all three locations. If source/user diversity is required (as per Core Memory layer's eligibility criteria), include it in the formula.

---

#### 3. Missing Event Schema File

**File**: `projects/live-neon/skills/agentic/detection/effectiveness-metrics/SKILL.md:57-58`

**Issue**: Document references:
```
**Event Schema Reference**: See `projects/live-neon/skills/agentic/core/circuit-breaker/events.d.ts`
for event format definitions. Phase 2 skills emit events conforming to this schema.
```

However, no `events.d.ts` file exists in `agentic/core/circuit-breaker/` - only `SKILL.md` and `EXAMPLES.md`.

**Risk**: Without defined event formats, metrics ingestion cannot be implemented or validated. Forward dependency on Phase 4 governance-state would also be affected.

**Recommendation**: Either create the referenced `events.d.ts` file with event type definitions, or update the documentation to remove the false reference and document event formats inline.

---

#### 4. Test Implementation Conflicts with Spec

**File**: `projects/live-neon/skills/tests/e2e/phase3-integration.test.ts:193-211`

**Issue**: The `inferTopicTags` test utility uses path/keyword heuristics:
```typescript
if (filePath.includes('/git/')) tags.push({ name: 'git', confidence: 0.95, source: 'path' });
if (content?.includes('force') || content?.includes('destructive')) {
  tags.push({ name: 'safety', confidence: 0.72, source: 'content' });
}
```

However, topic-tagger/SKILL.md explicitly states:
```
**Classification Method**: LLM-based semantic classification (NOT keyword matching)
```

**Risk**: Tests currently incentivize and validate keyword-matching behavior that contradicts the documented specification. Semantic tagging regressions would not be caught.

**Recommendation**: Either:
1. Update tests to mock LLM-based classification, or
2. Document that tests simulate the behavior but production uses LLM, or
3. Clarify that path-based inference is acceptable as supplementary signal

---

### Minor

#### 5. RG-6 Issue File Location Ambiguity

**File**: `projects/live-neon/skills/docs/implementation/agentic-phase3-results.md:185-189`

**Issue**: Results document claims:
```
5. ~~Create RG-6 follow-up issue~~ Complete: `../issues/2026-02-14-rg6-failure-attribution-research.md`
```

The file exists at `../issues/2026-02-14-rg6-failure-attribution-research.md` (multiverse root), but Codex searched within the skills subproject and reported it missing.

**Note**: This is actually a valid reference - the `docs/issues/` path is relative to multiverse root, not the skills subproject. However, the reference could be clearer by using either an absolute path or explicitly noting it's a multiverse-level issue.

**Recommendation**: Consider adding a comment clarifying the path scope, e.g., `(multiverse root: docs/issues/...)`.

---

## Alternative Framing Analysis

The review also considered whether the approach itself is sound:

### What Works Well

1. **Layer separation**: Clear distinction between Review (6 skills) and Detection (4 skills) with appropriate dependencies
2. **Research gate handling**: RG-6 provisional mode with explicit entry/exit criteria is pragmatic for iteration
3. **File verification protocol**: The concept of verifying identical context across reviewers addresses a real problem
4. **Evidence tier progression**: N=1 to N>=5 progression provides natural threshold for constraint generation

### Potential Concerns

1. **LLM dependency without fallback**: Skills like topic-tagger, slug-taxonomy, and failure-detector specify "LLM-based semantic classification (NOT keyword matching)" but provide no degraded mode if LLM is unavailable or rate-limited. Consider documenting fallback behavior.

2. **Forward dependency risk**: effectiveness-metrics depends on governance-state (Phase 4) which doesn't exist. The documented "stub interface" approach is reasonable but creates technical debt.

3. **Hash verification inconsistency**: Using two different hash algorithms (MD5 in twin-review, SHA-256 in prompt-normalizer) for similar purposes creates maintenance burden and potential security confusion.

## Token Usage

**Reasoning tokens**: ~223K tokens
**Reasoning effort**: xhigh
**Reasoning summaries**: auto

## Raw Output

<details>
<summary>Full CLI output (truncated for readability)</summary>

```
**Findings**
- IMPORTANT - agentic/review/twin-review/SKILL.md:51-54 uses truncated 8-char MD5 for "critical"
  file verification. MD5 plus truncation is easy to collide, so a modified file could slip past
  the checksum check and break the "identical context" guarantee the skill is meant to enforce;
  align with the SHA-256 verification used by prompt-normalizer.

- IMPORTANT - agentic/detection/evidence-tier/SKILL.md:38-44,55,71-95 has conflicting eligibility
  rules: the tier table says STRONG is "Eligible for constraint," the formula omits source/user
  diversity, while the example requires sources>=2 and users>=2. The ambiguity makes it unclear
  when constraint generation should fire and risks over-promoting single-source evidence.

- IMPORTANT - agentic/detection/effectiveness-metrics/SKILL.md:47-58 points to
  `agentic/core/circuit-breaker/events.d.ts` for event schemas, but no such file exists in the
  repo. Without defined event formats, metrics ingestion can't be implemented or validated.

- IMPORTANT - docs/implementation/agentic-phase3-results.md:185-189 claims the RG-6 follow-up
  issue exists at `../issues/2026-02-14-rg6-failure-attribution-research.md`, but there is no
  `docs/issues/` directory or file anywhere. RG-6 exit work is untracked despite the provisional
  status.

- MINOR - tests/e2e/phase3-integration.test.ts:193-211 drives topic tagging via path/keyword
  heuristics (`includes('force')`, `/auth/`), which conflicts with topic-tagger's requirement
  for LLM semantic classification (NOT keyword matching). Tests currently incentivize the wrong
  behavior and could mask semantic tagging regressions.

No CRITICAL findings identified.
```

</details>

---

*Review completed 2026-02-14 by Codex GPT-5.1 (codex-gpt51-examiner)*
*Part of Phase 3 implementation review workflow*
