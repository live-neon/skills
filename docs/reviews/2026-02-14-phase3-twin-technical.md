# Technical Review: Phase 3 Agentic Skills (Review & Detection Layer)

**Date**: 2026-02-14
**Reviewer**: Twin Technical (agent-twin-technical)
**Status**: Approved with suggestions
**Plan**: `../plans/2026-02-13-agentic-skills-phase3-implementation.md`

## Verified Files

**Review Skills (6)**:
- `projects/live-neon/skills/agentic/review/prompt-normalizer/SKILL.md` (123 lines, MD5: 1cfffc7c)
- `projects/live-neon/skills/agentic/review/slug-taxonomy/SKILL.md` (146 lines, MD5: 9d8e52e6)
- `projects/live-neon/skills/agentic/review/twin-review/SKILL.md` (160 lines, MD5: a5e6502e)
- `projects/live-neon/skills/agentic/review/cognitive-review/SKILL.md` (165 lines, MD5: 3059efc4)
- `projects/live-neon/skills/agentic/review/review-selector/SKILL.md` (156 lines, MD5: 48605bed)
- `projects/live-neon/skills/agentic/review/staged-quality-gate/SKILL.md` (160 lines, MD5: b7c078db)

**Detection Skills (4)**:
- `projects/live-neon/skills/agentic/detection/topic-tagger/SKILL.md` (151 lines, MD5: a336707f)
- `projects/live-neon/skills/agentic/detection/evidence-tier/SKILL.md` (174 lines, MD5: 202b4c11)
- `projects/live-neon/skills/agentic/detection/failure-detector/SKILL.md` (193 lines, MD5: ebd6f4d1)
- `projects/live-neon/skills/agentic/detection/effectiveness-metrics/SKILL.md` (215 lines, MD5: 22ebd09d)

**Tests & Documentation**:
- `projects/live-neon/skills/tests/e2e/phase3-contracts.test.ts` (747 lines)
- `projects/live-neon/skills/docs/implementation/agentic-phase3-results.md` (229 lines)
- `projects/live-neon/skills/ARCHITECTURE.md` (499 lines)

**Related Issues**:
- `../issues/2026-02-14-phase3-code-review-findings.md` (Status: Resolved)
- `../issues/2026-02-14-rg6-failure-attribution-research.md` (Status: Open, Priority: High)

---

## Strengths

### 1. Comprehensive Code Review Remediation
The N=2 code review findings (Codex + Gemini) were thoroughly addressed:
- Hash algorithm standardized to SHA-256 across all skills
- Evidence tier eligibility formula reconciled (R>=3, C>=2, D/(C+D)<0.2, sources>=2, users>=2)
- Test file appropriately renamed to `phase3-contracts.test.ts` with clear documentation
- False `events.d.ts` reference removed, event formats documented inline

### 2. MCE Compliance
All 10 skills comply with MCE limits:
- Maximum: 215 lines (effectiveness-metrics) - under 300-line documentation limit
- Minimum: 123 lines (prompt-normalizer)
- Average: 164 lines
- No skill approaches the danger zone

### 3. RG-6 Provisional Handling
The provisional mode pattern for failure-detector is well-executed:
- Entry criteria clearly documented in SKILL.md frontmatter (`rg6_status: provisional`)
- Exit criteria defined in follow-up issue
- Multi-causal failures flagged with `uncertain: true` for human review
- Priority appropriately elevated to High after N=2 external validation

### 4. Layer Separation
Clear architectural boundaries maintained:
- Review skills depend on prompt-normalizer/context-packet (correct)
- Detection skills feed Core Memory layer skills (correct)
- Forward dependency on governance-state (Phase 4) explicitly documented

### 5. Test Coverage
Contract tests cover all 7 integration scenarios with 21 tests passing:
- Review flow with file verification
- Detection to failure flow with tags
- Evidence progression to constraint
- Review selection with security detection
- Quality gate blocking
- Slug deduplication
- RG-6 uncertain attribution

---

## Issues Found

### Critical (Must Fix)

*None identified.* The N=2 external code review findings have been addressed.

### Important (Should Fix)

#### 1. Test File Exceeds MCE Limit

**File**: `projects/live-neon/skills/tests/e2e/phase3-contracts.test.ts`
**Lines**: 747 (MCE limit for code: 200)
**Confidence**: HIGH (verified via wc -l)

**Problem**: Test file significantly exceeds the 200-line MCE limit for code files. While tests have some leniency, 747 lines is 3.7x the limit and indicates the file should be split.

**Suggestion**: Split into scenario-based test files:
- `phase3-review-contracts.test.ts` (Scenarios 1, 4, 5)
- `phase3-detection-contracts.test.ts` (Scenarios 2, 3)
- `phase3-attribution-contracts.test.ts` (Scenarios 6, 7)
- `phase3-integration-contracts.test.ts` (Cross-Layer Integration)

**Severity**: Important (affects maintainability, not correctness)

#### 2. Inconsistent twin-review Line Count

**File**: `projects/live-neon/skills/agentic/review/twin-review/SKILL.md`
**Observed**: 160 lines (per wc -l)
**Reported**: 157 lines (in agentic-phase3-results.md line 24)

**Problem**: Minor discrepancy between reported and actual line count. This suggests the results file may have been written before final edits.

**Suggestion**: Update results file to reflect actual line counts.

**Severity**: Important (documentation accuracy)

#### 3. effectiveness-metrics Missing Evidence Tier Integration

**File**: `projects/live-neon/skills/agentic/detection/effectiveness-metrics/SKILL.md`
**Lines**: 44-55

**Problem**: Data Sources table (lines 44-55) lists circuit-breaker, failure-tracker, emergency-override, and constraint-lifecycle as sources. However, effectiveness-metrics should also consume evidence-tier data for tracking how quickly observations progress through tiers.

**Suggestion**: Add evidence tier progression metrics:
```
| Metric | Source Skill | Events | Window |
| Tier progression rate | evidence-tier | tier_upgraded | 30-day rolling |
```

**Confidence**: MEDIUM (inferred from architecture diagram vs implementation)

### Minor (Nice to Have)

#### 4. slug-taxonomy Category Hardcoding

**File**: `projects/live-neon/skills/agentic/review/slug-taxonomy/SKILL.md`
**Lines**: 43-50

**Observation**: Six category prefixes are hardcoded (git-, test-, workflow-, security-, docs-, quality-). No mechanism exists for adding new categories.

**Suggestion**: Consider adding a configuration or extension mechanism for custom categories (e.g., `infra-`, `api-`, `performance-`).

**Severity**: Minor (can be addressed in Phase 6 Extensions)

#### 5. Missing Batch Operation Error Handling

**File**: `projects/live-neon/skills/agentic/detection/topic-tagger/SKILL.md`
**Lines**: 94-108

**Observation**: `tag-batch` example shows success output but Failure Modes (lines 134-140) only cover single-file scenarios. What happens when some files in a batch fail while others succeed?

**Suggestion**: Add partial batch failure handling to Failure Modes:
```
| Partial batch failure | Warning: "Tagged X/Y files. Failures: [paths]. Review manually." |
```

**Severity**: Minor (edge case documentation)

---

## MCE Compliance Summary

| Skill | Lines | Limit | Status |
|-------|-------|-------|--------|
| prompt-normalizer | 123 | 300 | Pass |
| slug-taxonomy | 146 | 300 | Pass |
| twin-review | 160 | 300 | Pass |
| cognitive-review | 165 | 300 | Pass |
| review-selector | 156 | 300 | Pass |
| staged-quality-gate | 160 | 300 | Pass |
| topic-tagger | 151 | 300 | Pass |
| evidence-tier | 174 | 300 | Pass |
| failure-detector | 193 | 300 | Pass |
| effectiveness-metrics | 215 | 300 | Pass |
| **phase3-contracts.test.ts** | **747** | **200** | **FAIL** |
| agentic-phase3-results.md | 229 | 300 | Pass |
| ARCHITECTURE.md | 499 | 500 | Pass (claude.md limit) |

---

## Architecture Review

### Layer Dependencies (Correct)

```
Review Layer:
  prompt-normalizer -> context-packet (Foundation)
  twin-review -> prompt-normalizer + context-packet
  cognitive-review -> prompt-normalizer + context-packet
  review-selector -> twin-review + cognitive-review + topic-tagger (soft)
  staged-quality-gate -> constraint-enforcer (Core)
  slug-taxonomy -> failure-tracker (Core)

Detection Layer:
  topic-tagger -> context-packet (Foundation)
  evidence-tier -> observation-recorder (Core)
  failure-detector -> context-packet + slug-taxonomy
  effectiveness-metrics -> circuit-breaker + constraint-lifecycle (Core)
```

**Assessment**: Dependency flow follows layer architecture correctly. No circular dependencies detected. Soft dependency on topic-tagger for review-selector appropriately documented with path-based fallback.

### Forward Dependencies (Documented)

- effectiveness-metrics -> governance-state (Phase 4): Correctly flagged as forward dependency
- failure-detector -> RG-6 research: Provisional status clearly documented

---

## Test Coverage Assessment

### Contract Test vs Integration Test

The test file explicitly documents its nature (lines 1-39):
- Uses mock implementations defined locally
- Validates data flow contracts, not actual skill behavior
- Simulates LLM semantic classification with path/keyword heuristics

**Assessment**: This is appropriate for Phase 3. Real integration tests require runtime skill invocation which depends on Claude Code infrastructure not yet available in the skills subproject.

### Gap: No Actual Skill Loading Tests

**Observation**: Results file notes "All 10 skills load in Claude Code (requires runtime testing)" as unchecked (line 176). This is a known gap.

**Recommendation**: Phase 4 should include a skill loading verification script that invokes each skill with `--help` and validates output format.

---

## Alternative Framing

### Are We Solving the Right Problem?

**Question**: The contract tests validate mock implementations, not real skills. Does this provide false confidence?

**Assessment**: The tests serve a legitimate purpose: validating data contracts before implementation. However, the test naming and documentation improvements (from N=2 review) appropriately set expectations. The risk is not that tests are wrong, but that they don't catch implementation bugs in the actual skills.

**Recommendation**: Track "real integration test" as Phase 4 or Phase 5 deliverable. The contract tests are necessary but not sufficient.

### RG-6 Provisional Status

**Question**: Is provisional mode an acceptable long-term state for failure-detector?

**Assessment**: No. The provisional mode is appropriate for Phase 3 iteration but the research must be completed before Phase 5+. The priority elevation to High (from N=2 code review) correctly reflects urgency.

**Risk**: If RG-6 research is deferred indefinitely, failure-detector becomes a permanent source of incorrect attributions that compound over time.

---

## MCP Tool Usage Verification

No MCP tools (Gemini CLI, Codex CLI, GoDoctor) were invoked for this review. Review conducted using standard file read and bash operations.

---

## Next Steps

1. **Split test file** (Important): Break `phase3-contracts.test.ts` into scenario-based files
2. **Update results file** (Important): Fix line count discrepancy for twin-review
3. **Consider evidence-tier metrics** (Important): Add tier progression tracking to effectiveness-metrics
4. **Track real integration tests** (Tracking): Create issue for Phase 4/5 runtime skill testing
5. **Complete RG-6 research** (High Priority): Do not defer past Phase 5

---

## Approval

**Status**: Approved with suggestions

The Phase 3 implementation demonstrates solid engineering:
- N=2 code review findings thoroughly addressed
- MCE compliance maintained across all skills
- RG-6 provisional mode appropriately handled
- Architecture layering respected

The identified issues are maintenance concerns, not correctness bugs. The test file size is the most significant concern but does not block Phase 4.

**Recommendation**: Proceed to Phase 4 (Governance & Safety) after addressing Important issues 1 and 2.

---

*Review completed 2026-02-14 by Twin Technical (agent-twin-technical)*
*File verification protocol followed per 照:file-reference-protocol*
*Findings consolidated: `../issues/2026-02-14-phase3-twin-review-findings.md`*
