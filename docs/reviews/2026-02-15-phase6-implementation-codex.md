# Phase 6 Agentic Skills Implementation Review - Codex

**Date**: 2026-02-15
**Reviewer**: Codex GPT-5.1 (codex-gpt51-examiner)
**Files Reviewed**: 10 SKILL.md files, 5 test files, 12 fixtures, ARCHITECTURE.md
**Mode**: `codex exec --sandbox read-only -m gpt-5.1-codex-max`

## Summary

Phase 6 implements 10 observation-backed extension skills with comprehensive contract tests. The implementation is solid overall, but has several important issues around spec-implementation divergence, particularly in error handling, edge case coverage, and MCE compliance claims. No critical security issues found.

## Findings

### Critical

*None identified.*

### Important

#### 1. loop-closer check command path bug
**File**: `e2e/phase6-workflow-skills.test.ts:96-102`
**Issue**: The `check` method never finds matches for valid files because `scan` always appends a `markers` subfolder. Checking `fixtures/phase6/markers/todo-sample.ts` resolves to `.../markers/markers`.

**Impact**: The `/loop-closer check <path>` command is broken - it will not detect open loops in specific files.

**Recommendation**: Make `check` scan the actual file or its parent directory without hard-coding the extra segment. Add positive test for `check` command.

---

#### 2. parallel-decision scoring biased toward SERIAL
**File**: `e2e/phase6-workflow-skills.test.ts:118-147`
**Issue**: Line 145 forces 2-3 PARALLEL factors to return `SERIAL`:
```typescript
const recommendation = parallelCount >= 4 ? 'PARALLEL' : (parallelCount <= 1 ? 'SERIAL' : 'SERIAL');
```
The SKILL spec states 2-3 factors should be "context-dependent" with medium confidence, not automatic SERIAL.

Additionally, `resources` is always treated as PARALLEL (line 136), so resource constraint failures cannot be expressed.

**Impact**: The 5-factor framework's "context-dependent" band (2-3 factors) is not usable. Resource constraints are ignored.

**Recommendation**:
- Implement medium-confidence handling for 2-3 factor cases
- Add resource constraint heuristic based on task description keywords
- Add tests for 2-3 factor scenarios and resource shortages

---

#### 3. observation-refactoring scan omits consolidate detection
**File**: `e2e/phase6-observation-skills.test.ts:168-214`
**Issue**: The `scan` method does not detect consolidate candidates despite the SKILL spec listing it as one of four operations. Archive candidates are only size-based; F=2 protection checks use an undefined `frame` field instead of `d_count` or a dedicated `f_count`.

**Impact**: Consolidate operation (merging related observations) cannot be discovered automatically. F=2 protection may not work correctly.

**Recommendation**:
- Add consolidate candidate detection (related observations with same patterns)
- Use `d_count` for F-protection, or add explicit `f_count` field
- Add tests exercising consolidate detection and F=2 protection

---

#### 4. pbd-strength-classifier error handling diverges from spec
**File**: `e2e/phase6-observation-skills.test.ts:41-137`
**Issue**:
- Missing frontmatter throws an error, but SKILL spec says it should warn
- "Multiple sources" is inferred from `r_count >= 2`, not actual source tracking
- Invalid `n_count` values (negative, non-integer) are not validated

**Impact**: Error handling is inconsistent with documented behavior. Source diversity is approximated, not measured.

**Recommendation**:
- Handle missing frontmatter gracefully with warning (not throw)
- Add `n_count` validation for type and range
- Add fixtures for malformed observations and test error paths

---

### Minor

#### 5. pattern-convergence-detector incomplete signal extraction
**File**: `e2e/phase6-pattern-skills.test.ts:27-139`
**Issue**: Only considers `root_cause` and `category` signals; ignores keyword and related-pattern signals mentioned in SKILL. Only processes N=2 files, missing `--min-similarity` threshold support.

**Impact**: Pattern convergence detection is less nuanced than specified. N>=2 patterns cannot be analyzed.

**Recommendation**: Extend signal extraction to include keywords and "Related Patterns" section. Add configurable similarity thresholds. Add tests for low-signal and no-cluster scenarios.

---

#### 6. SKILL.md files exceed claimed MCE limits
**Files**:
- `agentic/extensions/cross-session-safety-check/SKILL.md`: 217 lines
- `agentic/extensions/hub-subworkflow/SKILL.md`: 209 lines
- `agentic/extensions/threshold-delegator/SKILL.md`: 203 lines

**Issue**: All three exceed the "SKILL.md compliant with MCE limits (<200 lines body)" claim in their acceptance criteria.

**Recommendation**: Either trim the files to under 200 lines, or adjust the stated limit to reflect the actual tolerance (e.g., "<220 lines" with 10% buffer).

---

#### 7. Acceptance checkbox convention violation
**Files**: All 10 SKILL.md files
**Reference**: `ARCHITECTURE.md:732` (Acceptance Criteria Convention)

**Issue**: ARCHITECTURE.md specifies that acceptance criteria checkboxes should remain unchecked as documentation, but all SKILL.md files have them checked (`[x]`).

**Recommendation**: Align checkbox usage with architecture convention (either update SKILL.md files to use unchecked boxes, or update ARCHITECTURE.md to reflect current practice).

---

## Alternative Framing: Is the Approach Right?

### Observation: Mock-Heavy Contract Testing

The test strategy uses mock implementations rather than actual skill code. This has trade-offs:

**Pros**:
- Tests behavioral contracts, not implementation details
- Fast execution (no external dependencies)
- Clear specification of expected behavior

**Cons**:
- Mocks can diverge from actual implementation
- Real integration bugs may not surface
- Some findings (like path bugs) exist in mocks, not necessarily in production

**Question**: Should there be a layer of integration tests that exercise actual skill implementations?

### Observation: CLI Skills Without CLI Implementations

Skills are defined as CLI commands (`/loop-closer scan`), but the Phase 6 implementation only creates SKILL.md specifications and mock-based tests. There's no actual CLI implementation.

**Question**: Is Phase 6 intended to be spec-only? If so, the "status: active" flag may be premature. Consider `status: specified` until CLI implementation exists.

### Observation: N-Count Evidence Varies Widely

| Skill | N-Count | Evidence Strength |
|-------|---------|-------------------|
| pbd-strength-classifier | 11 | Strong |
| constraint-versioning | 9 | Strong |
| mce-refactorer | 7 | Strong |
| parallel-decision | 5 | Medium-Strong |
| hub-subworkflow | 5 | Medium-Strong |
| observation-refactoring | 5 | Medium-Strong |
| cross-session-safety-check | 4 | Medium |
| loop-closer | 3 | Medium |
| threshold-delegator | 3 | Medium |
| pattern-convergence-detector | 2 | Weak |

The pattern-convergence-detector has N=2 (below the N>=3 constraint candidacy threshold). This is noted in the SKILL frontmatter as "N=2+" but raises a question: Should skills with N<3 be in the Extensions layer, or should they wait for more evidence?

## Test Coverage Assessment

| Test File | Skills Covered | Tests | Integration Tests |
|-----------|---------------|-------|-------------------|
| phase6-workflow-skills.test.ts | 3 | 21 | 0 |
| phase6-mce-skills.test.ts | 2 | 18 | 1 |
| phase6-observation-skills.test.ts | 2 | 20 | 2 |
| phase6-evolution-skills.test.ts | 2 | 20 | 1 |
| phase6-pattern-skills.test.ts | 1 | 15 | 1 |

**Total**: 94 tests, 5 integration tests

**Coverage Gaps**:
- No negative path tests for loop-closer check command
- No tests for 2-3 factor cases in parallel-decision
- No consolidate detection tests in observation-refactoring
- No invalid frontmatter tests for pbd-strength-classifier
- No keyword/related-pattern signal tests for convergence-detector

## Architecture Assessment

**Layer Compliance**: All 10 skills correctly placed in Extensions layer per ARCHITECTURE.md.

**Dependency Declaration**: Skills correctly declare dependencies:
- `mce-refactorer` -> `hub-subworkflow` (for doc files)
- `observation-refactoring` -> `pbd-strength-classifier`
- `constraint-versioning` -> `pbd-strength-classifier`
- `pattern-convergence-detector` -> `pbd-strength-classifier`

**Data Flow**: No circular dependencies detected.

## Recommendations

### Immediate (Pre-Merge)

1. Fix loop-closer check path bug
2. Fix parallel-decision 2-3 factor handling
3. Align SKILL.md line counts with claims (or adjust claims)

### Short-Term (Next Iteration)

1. Add consolidate detection to observation-refactoring
2. Add missing error path tests for pbd-strength-classifier
3. Extend pattern-convergence-detector signals

### Long-Term (Architecture)

1. Consider integration tests layer for actual CLI implementations
2. Clarify status: active vs status: specified distinction
3. Document whether N<3 skills should be admitted to Extensions layer

## Raw Output

<details>
<summary>Full CLI output</summary>

```
OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/tests
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c62e3-e9f2-71f3-9d4c-6da3ebe6d55e
--------

**Findings**
- Important: /loop-closer check never finds matches for valid file because scan always appends markers subfolder (e2e/phase6-workflow-skills.test.ts:96-102)
- Important: parallel-decision scoring skewed - 2-3 PARALLEL factors forced to SERIAL, resources always PARALLEL (e2e/phase6-workflow-skills.test.ts:118-147)
- Important: observation-refactoring scan omits consolidate detection and F>=2 protection; archive only size-based (e2e/phase6-observation-skills.test.ts:168-214)
- Important: pbd-strength-classifier failure handling diverges from spec (e2e/phase6-observation-skills.test.ts:41-137)
- Minor: pattern-convergence-detector only considers root_cause/category signals (e2e/phase6-pattern-skills.test.ts:27-139)
- Minor: SKILL docs claiming <200 line MCE compliance exceed it (cross-session-safety-check 217, hub-subworkflow 209, threshold-delegator 203)

tokens used: 336,246
```

</details>

---

*Review completed 2026-02-15 by Codex GPT-5.1 (codex-gpt51-examiner)*
*Part of N=2 external review (+ Gemini) or N=3 independent review (+ Gemini + Cognitive)*
