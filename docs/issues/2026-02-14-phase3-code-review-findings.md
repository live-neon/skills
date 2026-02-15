# Phase 3 Code Review Findings

**Created**: 2026-02-14
**Status**: Resolved
**Priority**: High
**Source**: N=2 Code Review (Codex GPT-5.1 + Gemini 2.5 Pro)
**Type**: Implementation
**Resolved**: 2026-02-14

## Summary

External code review of Phase 3 Agentic Skills implementation identified 5 confirmed
findings requiring remediation. Two findings were disconfirmed (false alarms).

## Cross-References

### Review Files
- `../reviews/2026-02-14-phase3-implementation-codex.md`
- `../reviews/2026-02-14-phase3-implementation-gemini.md`

### Related Issues
- `../issues/2026-02-14-rg6-failure-attribution-research.md` (Finding 1 extends this)
- `../issues/2026-02-14-phase3-twin-review-findings.md` (Follow-up twin review)

### Context
- `output/context/2026-02-14-phase3-implementation-context.md`

---

## Verified Findings (N=2)

### Finding 1: Single-Cause Attribution Flaw [CRITICAL - EXTENDS RG-6]

**Source**: Gemini (critical), Codex (alternative framing)
**File**: `projects/live-neon/skills/agentic/detection/failure-detector/SKILL.md`

**Issue**: The `provisional_single_cause` model treats multi-causal failures as exceptions
flagged by a confidence threshold (`< 0.7`). Complex systems rarely have single-cause
failures. This forces superficial analysis and risks incorrect diagnoses.

**Verification**: N=2 (Both reviewers converged on this concern)

**Status**: Already tracked by RG-6 provisional status. This finding strengthens the case
for RG-6 research and adds external validation.

**Action**: Update `../issues/2026-02-14-rg6-failure-attribution-research.md`:
- Add N=2 code review cross-reference
- Elevate priority from Medium to High
- Add reviewer recommendation: "Default to multi-factor attribution"

---

### Finding 2: Tests Validate Mocks, Not Implementations [CRITICAL]

**Source**: Both reviewers (Codex: important, Gemini: critical)
**File**: `projects/live-neon/skills/tests/e2e/phase3-integration.test.ts:132-362`

**Issue**: Integration tests define local mock implementations (`createContextPacket`,
`spawnTwinReview`, `detectFailure`, etc.) and test these mocks rather than actual
skill implementations. Tests verify contracts work, not actual skill behavior.

**Verification**: N=2 CONFIRMED
- Lines 132-146: `createContextPacket` mock with random SHA-256
- Lines 148-156: `createFileManifest` mock with random MD5
- Lines 158-168: `spawnTwinReview` mock
- All 21 tests exercise these mocks only

**Impact**: False confidence in system correctness. Production skills untested.

**Remediation Options**:
1. Rename to `phase3-contracts.test.ts` (accurate expectations)
2. Add actual integration tests that invoke real skill implementations
3. Document limitation in results file and acceptance criteria

**Recommended**: Option 1 + 3 (short-term), Option 2 (long-term)

---

### Finding 3: Hash Algorithm Inconsistency [IMPORTANT]

**Source**: Both reviewers
**Files**:
- `projects/live-neon/skills/agentic/review/prompt-normalizer/SKILL.md:53-94` (SHA-256)
- `projects/live-neon/skills/agentic/review/twin-review/SKILL.md:51-152` (MD5)

**Issue**: Inconsistent hashing algorithms for file verification:
- `prompt-normalizer` uses SHA-256: `"hash": "sha256:abc..."`
- `twin-review` uses MD5 (truncated 8 chars): `md5 <file> | head -c 8`

**Verification**: N=2 CONFIRMED (grep verified both files)

**Impact**:
- MD5 is vulnerable to collision attacks
- 8-char truncation further increases collision probability
- Inconsistency creates maintenance burden and security confusion

**Remediation**:
- Standardize on SHA-256 for all file verification
- Update `twin-review` file verification protocol
- Use first 16 chars of SHA-256 if quick verification needed

---

### Finding 4: Evidence Tier Eligibility Ambiguity [IMPORTANT]

**Source**: Codex
**File**: `projects/live-neon/skills/agentic/detection/evidence-tier/SKILL.md`

**Issue**: Three locations give different constraint eligibility requirements:

| Location | Lines | Criteria |
|----------|-------|----------|
| Tier table | 42 | STRONG (N>=3) = "Eligible for constraint" |
| Formula | 55 | `R >= 3 AND C >= 2 AND D/(C+D) < 0.2` |
| Output/Example | 71, 91-94 | Adds `sources>=2` and `users>=2` |

**Verification**: N=2 CONFIRMED (Read verified all three locations)

**Impact**: Ambiguous when constraint generation should fire. Risk of over/under-promoting.

**Remediation**:
- Reconcile all three locations with single authoritative formula
- If source/user diversity required, add to line 55 formula
- Update tier table to reference formula, not restate criteria

---

### Finding 5: Missing events.d.ts Schema [IMPORTANT]

**Source**: Codex
**File**: `projects/live-neon/skills/agentic/detection/effectiveness-metrics/SKILL.md:57-58`

**Issue**: Document references non-existent file:
```
**Event Schema Reference**: See `projects/live-neon/skills/agentic/core/circuit-breaker/events.d.ts`
```

**Verification**: N=2 CONFIRMED
- Glob found only `node_modules/@types/node/events.d.ts` (Node.js types)
- No `events.d.ts` in `agentic/core/circuit-breaker/`

**Impact**: Metrics ingestion cannot be implemented without defined event formats.

**Remediation Options**:
1. Create the referenced `events.d.ts` with TypeScript event type definitions
2. Remove false reference and document event formats inline in SKILL.md
3. Defer to Phase 4 governance-state (document as forward dependency)

---

## Disconfirmed Findings (N=2 False Alarms)

### D1: SEMANTIC_SIMILARITY_GUIDE.md Missing

**Source**: Gemini (minor)
**Verification**: N=2 DISCONFIRMED - File EXISTS at:
`projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Action**: None required

---

### D2: RG-6 Issue File Missing

**Source**: Codex (minor - self-corrected)
**Verification**: N=2 DISCONFIRMED - File EXISTS at multiverse root:
`../issues/2026-02-14-rg6-failure-attribution-research.md`

**Action**: None required (Codex searched only skills subproject)

---

## N=1 Observations (Monitor)

### O1: Test Keyword Matching vs LLM Spec

**Source**: Both reviewers
**File**: `phase3-integration.test.ts:193-211`

**Issue**: Tests use path/keyword heuristics while `topic-tagger/SKILL.md` specifies
"LLM-based semantic classification (NOT keyword matching)".

**Note**: This is a design decision - tests simulate behavior, production uses LLM.
Should be documented but not necessarily changed.

**Action**: Document in test file header that these are contract tests simulating
LLM behavior via heuristics.

---

### O2: Model Naming Inconsistency

**Source**: Gemini (minor)
**File**: `cognitive-review/SKILL.md:42-48`

**Issue**: References "Opus 3" and "Sonnet 4.5" with explanation note.

**Action**: Monitor only. Naming is documented in skill.

---

## Remediation Checklist

### Critical (Block Phase 4)
- [x] Finding 2: Rename test file OR document limitation
  - Renamed to `phase3-contracts.test.ts`
  - Added comprehensive header documenting contract test nature
- [x] Finding 1: Update RG-6 issue with N=2 evidence (cross-reference this issue)
  - RG-6 issue updated with external validation section
  - Priority elevated from Medium to High

### Important (Address before production)
- [x] Finding 3: Standardize hash algorithm to SHA-256
  - twin-review/SKILL.md updated to use SHA-256
  - 16-char prefix for quick verification
  - Test file updated to match
- [x] Finding 4: Reconcile evidence tier eligibility criteria
  - evidence-tier/SKILL.md formula updated with full requirements
  - Tier table clarified that STRONG is necessary but not sufficient
- [x] Finding 5: Create events.d.ts OR remove false reference
  - Removed false reference
  - Added inline event format table

### Minor (Address opportunistically)
- [x] O1: Document test heuristic approach in test file header
  - Added DESIGN NOTE explaining heuristic simulation of LLM behavior

---

## Acceptance Criteria

This issue is resolved when:
1. [x] All Critical items addressed
2. [x] All Important items addressed
3. [x] RG-6 issue updated with cross-reference
4. [x] Phase 3 results file updated with remediation notes

---

*Issue created 2026-02-14 from N=2 code review.*
*Reviewers: Codex GPT-5.1 (codex-gpt51-examiner) + Gemini 2.5 Pro (gemini-25pro-validator)*
*Resolved 2026-02-14: All findings addressed, tests passing (21/21).*
