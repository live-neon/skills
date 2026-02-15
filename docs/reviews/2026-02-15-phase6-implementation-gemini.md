# Phase 6 Implementation Review - Gemini

**Date**: 2026-02-15
**Reviewer**: Gemini 2.5 Pro (gemini-25pro-validator)
**Files Reviewed**: 10 SKILL.md files, 5 test files, 12 fixtures, ARCHITECTURE.md

## Summary

Phase 6 implements 10 observation-backed extension skills. The documentation and test organization are thorough, but the architecture reveals a significant gap: skills exist only as SKILL.md specifications and test mocks, with no separate runtime CLI implementations. The mocks ARE the implementations, creating a circular testing pattern.

## Findings

### Critical

None identified. No security vulnerabilities or data integrity issues in the reviewed code.

### Important

1. **Missing Production Implementations**
   - Location: All 10 skills
   - Issue: Skills exist only as SKILL.md specifications and test mocks. No actual CLI runtime code found.
   - Impact: Tests pass by definition (they test what they implement). Changes to SKILL.md won't automatically update behavior.
   - Question: Is this intentional (specs-first approach with Phase 7+ implementation) or missing work?

2. **Inconsistent Fixture Schema**
   - Location: `../../tests/e2e/phase6-evolution-skills.test.ts:219`
   - Code: `user: conflictState?.current_user || (conflictState as any)?.user || 'unknown'`
   - Issue: Test needs defensive fallback chain because fixture uses `current_user` but code also checks `user`
   - Impact: Indicates unstable data contract between fixtures and implementation

3. **Undefined `frame` Property**
   - Location: `../../tests/e2e/phase6-observation-skills.test.ts:174`
   - Code: `return frontmatter?.frame === 2 || (frontmatter?.d_count || 0) >= 2;`
   - Issue: `isF2Protected` checks `frame === 2` but no fixture defines `frame` property
   - Impact: F=2 protection via `frame` property never triggers; relies entirely on `d_count >= 2`

4. **Architectural Ambiguity**
   - Issue: Tests implement full behavior in Mock classes (100+ lines each). These are implementation code, not test mocks.
   - Pattern: SKILL.md (spec) -> Mock in test (implementation) -> Test verifies mock
   - Problem: Tests cannot catch spec-implementation drift because they ARE the implementation

### Minor

1. **MCE Line Count Claims**
   - Location: All SKILL.md files, Acceptance Criteria section
   - Issue: Files claim "<200 lines body" but total line counts are 172-217. Unclear if frontmatter/metadata excluded from count.
   - Suggestion: Clarify MCE counting methodology

2. **Complex Cluster Name Generation**
   - Location: `../../tests/e2e/phase6-pattern-skills.test.ts:153-159`
   - Code: Multiple chained string transformations for cluster naming
   - Issue: Complex logic may produce unexpected slug formats; hard to predict output
   - Suggestion: Extract to named function with unit tests

3. **Date Format Inconsistency**
   - Location: Various fixtures
   - Issue: Mix of `YYYY-MM-DD` and ISO 8601 timestamps
   - Suggestion: Standardize on one format across all fixtures

4. **N-Count Evidence Verification**
   - Location: All SKILL.md frontmatter `n_count` fields
   - Issue: Each skill claims N-count from source documents. No automated verification that source docs exist and contain claimed evidence.
   - Suggestion: Add verification step or cross-reference check

## Alternative Framing

**Are we solving the right problem?**

The implementation creates comprehensive specifications and behavioral contracts but the execution model is unclear:

1. **If Phase 6 is spec-only**: Document this explicitly. The "contract testing" pattern makes sense as Phase 6 defines WHAT, Phase 7+ implements HOW.

2. **If CLI implementations are expected**: Extract Mock classes to actual skill implementations. Current mocks contain complete business logic (200-300 lines each).

3. **Dependency claims**: ARCHITECTURE.md shows dependencies (e.g., `mce-refactorer -> hub-subworkflow`, `observation-refactoring -> pbd-strength-classifier`). Tests verify these work but only in mock form.

**Unquestioned Assumptions**:

- Skills are invoked via CLI (`/loop-closer scan`) but no CLI wrapper code exists
- N-count evidence system assumes source documents are accurate (no automated verification)
- "Contract testing" validates contracts but who implements the actual runtime?

## Architecture Observations

### What Works Well

1. Consistent SKILL.md structure across all 10 skills
2. Comprehensive frontmatter with all metadata (name, version, source, n_count, tags, layer)
3. Clear dependency documentation in ARCHITECTURE.md
4. Integration tests verify skill interactions (e.g., mce-refactorer delegating to hub-subworkflow)
5. Fixture coverage appears complete for all test scenarios

### What Needs Clarification

1. Where do production implementations live?
2. How are CLI commands wired to skill implementations?
3. Is the Mock-as-Implementation pattern intentional (Phase 6 is contracts only)?
4. What's the verification mechanism for N-count claims?

## Recommendations

1. **Clarify Phase Scope**: Add explicit note in plan/ARCHITECTURE whether Phase 6 is spec-only or includes implementation
2. **Stabilize Fixture Schemas**: Fix `user/current_user` inconsistency; remove unused `frame` property check
3. **Extract Implementations**: If skills should work now, extract Mock classes to `src/skills/` directory
4. **Add Schema Validation**: Use TypeScript interfaces shared between fixtures and implementations
5. **Document MCE Counting**: Clarify what "body" means (excluding frontmatter? metadata?)

## Raw Output

<details>
<summary>Full CLI output</summary>

The Gemini CLI review focused on developer experience (DX) and CLI user experience:

**Developer Experience Issues Identified**:
- Confusion about where implementation code lives (mocks vs. production)
- No co-located specifications (SKILL.md files referenced but not in tests directory)
- Circular testing pattern: implementation tests itself
- Fixture inconsistencies create defensive coding patterns

**Current Workflow (Problematic)**:
```
SKILL.md (Specification) - exists outside project, not enforced
       |
       ? (Manual, error-prone link)
       |
test.ts (Implementation + Test) - Mocks contain actual logic
       |
       <-- Tests itself -->
       |
fixtures.json (Data) - Has inconsistent formats
```

**Proposed Workflow (Standard Practice)**:
```
SKILL.md (Specification) - Source of truth, co-located
       |
       `-- Informs -->
                     |
src/skill.ts  <-- test/skill.test.ts
(Implementation)    (Tests the implementation)
       |                  |
       `-- Consumes -->   `-- Uses consistent fixtures
```

**CLI UX Impact Predictions**:
- Inconsistent fixtures will produce inconsistent CLI output
- Out-of-sync specs and implementations will confuse users
- Unstable contracts make maintenance difficult

**Recommendations from Gemini**:
1. Co-locate SKILL.md specifications in repository
2. Extract Mock implementations to actual src/ files
3. Create true lightweight mocks for testing
4. Enforce data contracts with shared TypeScript types
5. Consider spec-driven development with formal frontmatter

</details>
