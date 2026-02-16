---
created: 2026-02-15
type: issue
scope: internal
status: resolved
priority: high
related_reviews:
  - ../reviews/2026-02-15-skill-category-alignment-codex.md
  - ../reviews/2026-02-15-skill-category-alignment-gemini.md
related_plan: ../plans/2026-02-15-skill-category-alignment.md
related_patterns:
  - ../patterns/skill-format.md
---

# Issue: Skill Category Alignment Plan Code Review Findings

## Summary

External code review (N=2: Codex + Gemini) of the Skill Category Alignment plan identified
2 critical, 4 important, and 2 minor issues. Both reviewers converged on the same root
cause: **the plan creates a third source of truth rather than reconciling existing conflicts**.

**Recommendation**: Add Stage 0 (Reconciliation) before implementing validation.

## Root Cause Analysis

Three sources define different required sections for Agentic skills:

| Source | Required Sections |
|--------|-------------------|
| **Plan Stage 2** | Usage, Arguments, Output, Integration, Failure Modes |
| **Template** | Usage, Arguments, Output, Example, Integration, Failure Modes, Acceptance Criteria, Next Steps |
| **Existing Test** | Usage, Sub-Commands, Integration, Next Steps, Acceptance Criteria |

None of these agree. The plan would add a fourth source without resolving this conflict.

## Findings by Severity

### Critical (2)

| # | Finding | Location | N-Count | Status |
|---|---------|----------|---------|--------|
| C-1 | Conflicting section lists across plan/template/test | plan:111-117, template:20-78, test:171-178 | N=2 (consensus) | Resolved |
| C-2 | PBD frontmatter validation missing (`user-invocable`, `emoji` never enforced) | plan:75-85, test:140-148 | N=2 (verified) | Resolved |

### Important (4)

| # | Finding | Location | N-Count | Status |
|---|---------|----------|---------|--------|
| I-1 | `alias` marked optional in plan but required in tests | plan:71, test:165-167, test:191-198 | N=2 (verified) | Resolved |
| I-2 | Hardcoded skill count (7) and fixed name list creates brittleness | test:22-30, test:135-137 | N=2 (verified) | Resolved |
| I-3 | Dual validation (vitest + bash script) invites drift | plan:97-153, plan:237-286 | N=2 (consensus) | Resolved |
| I-4 | Stage 3 cross-reference validation is superficial (README substring only) | plan:167-183 | N=2 (consensus) | Resolved |

### Minor (2)

| # | Finding | Location | N-Count | Status |
|---|---------|----------|---------|--------|
| M-1 | Schema documentation location unclear (TypeScript vs Markdown) | plan:60-72, plan:88-89, pattern:36-47 | N=1→N=2 (verified) | Resolved |
| M-2 | Code sample uses `skill.content` but existing code uses `body` | plan:123, test:50-51 | N=2 (verified) | Resolved |

## Evidence: N=1 to N=2 Verification

### C-2: PBD Frontmatter Not Enforced (N=2 Verified)

**Codex finding**: PBD fields `user-invocable` and `emoji` marked required but never validated.

**Verification** (`tests/e2e/skill-loading.test.ts:140-147`):
```typescript
describe('PBD Skills', () => {
  it('should have valid SKILL.md format', () => {
    for (const skill of pbdSkills) {
      expect(skill.frontmatter.name).toBeDefined();
      expect(skill.frontmatter.version).toBeDefined();
      expect(skill.frontmatter.description).toBeDefined();
      // NOTE: NO check for user-invocable or emoji
    }
  });
});
```

**Result**: N=2 confirmed. Tests only validate name, version, description.

### I-1: Alias Required vs Optional (N=2 Verified)

**Codex finding**: Plan marks alias as optional but tests require it.

**Plan** (`docs/plans/2026-02-15-skill-category-alignment.md:71`):
```typescript
alias?: string;  // Optional: /xx short form
```

**Test** (`tests/e2e/skill-loading.test.ts:167`):
```typescript
expect(skill.frontmatter.alias, `${skill.name} missing alias`).toBeDefined();
```

**Result**: N=2 confirmed. Plan says optional, test says required.

### I-2: Hardcoded Skill Count (N=2 Verified)

**Codex finding**: Tests hardcode exactly 7 skills with fixed names.

**Test** (`tests/e2e/skill-loading.test.ts:22-30, 135-137`):
```typescript
const CONSOLIDATED_AGENTIC_SKILLS = [
  'failure-memory', 'constraint-engine', 'context-verifier',
  'review-orchestrator', 'governance', 'safety-checks', 'workflow-tools',
];
// ...
expect(agenticSkills.length).toBe(7);
```

**Result**: N=2 confirmed. Adding/renaming skills requires test changes.

### M-2: Content vs Body Property (N=2 Verified)

**Codex finding**: Plan uses wrong property name.

**Plan** (`docs/plans/2026-02-15-skill-category-alignment.md:123`):
```typescript
expect(skill.content).toContain(section);
```

**Test interface** (`tests/e2e/skill-loading.test.ts:45-51`):
```typescript
interface SkillInfo {
  // ...
  body: string;  // NOT content
}
```

**Result**: N=2 confirmed. Copy-pasting plan code would fail.

## Recommended Actions

| Priority | Action | Addresses |
|----------|--------|-----------|
| **High** | Add Stage 0: Reconcile template/test/plan into ONE authoritative list | C-1 |
| **High** | Modify existing `skill-loading.test.ts` instead of creating new file | C-1, I-3 |
| **High** | Add PBD frontmatter validation (`user-invocable`, `emoji`) to existing tests | C-2 |
| **Medium** | Decide: should `alias` be required or optional? Update plan AND tests | I-1 |
| **Medium** | Remove hardcoded skill count; use discovery-based assertions | I-2 |
| **Medium** | Remove bash script OR make it a thin wrapper around `npm test` | I-3 |
| **Medium** | Implement actual Integration section parsing for cross-reference validation | I-4 |
| **Low** | Fix `content` → `body` in code samples | M-2 |
| **Low** | Clarify whether schemas live in TypeScript or Markdown | M-1 |

## Plan Revision Required

The plan should be revised before implementation:

1. **Add Stage 0: Reconciliation**
   - Audit actual skills against templates
   - Update templates OR skills to align
   - Update existing tests to match templates
   - THEN proceed with new validation

2. **Remove Stage 2** (new test file)
   - Modify existing `skill-loading.test.ts` instead

3. **Revise Stage 5** (bash script)
   - Either remove or make it call `npm test`

4. **Update code samples**
   - Fix `skill.content` → `skill.body`

## Cross-References

- **Reviews**:
  - `docs/reviews/2026-02-15-skill-category-alignment-codex.md`
  - `docs/reviews/2026-02-15-skill-category-alignment-gemini.md`
- **Plan**: `docs/plans/2026-02-15-skill-category-alignment.md`
- **Pattern**: `docs/patterns/skill-format.md`
- **Existing Test**: `tests/e2e/skill-loading.test.ts`
- **Templates**:
  - `agentic/SKILL_TEMPLATE.md`
  - `pbd/SKILL_TEMPLATE.md`

## Resolution Summary (2026-02-15)

All 8 findings addressed:

| # | Finding | Resolution |
|---|---------|------------|
| C-1 | Conflicting section lists | Updated test to match actual skills (7 agentic sections, 3 PBD sections) |
| C-2 | PBD frontmatter not enforced | Added `user-invocable` and `emoji` validation to tests |
| I-1 | Alias required vs optional | Marked as required in plan (all skills have aliases) |
| I-2 | Hardcoded skill count | Changed to discovery-based (`toBeGreaterThan(0)`) |
| I-3 | Dual validation | Removed bash script from plan; use `npm test` only |
| I-4 | Superficial cross-reference | Simplified to README checks; deferred Integration parsing |
| M-1 | Schema location unclear | Clarified: pattern file (Markdown) is authoritative |
| M-2 | `content` vs `body` | Fixed in plan code samples |

**Files Modified**:
- `tests/e2e/skill-loading.test.ts` - Added section/frontmatter validation
- `docs/plans/2026-02-15-skill-category-alignment.md` - Revised per findings

**Tests**: 10 passing

---

*Issue created 2026-02-15 from N=2 code review (Codex + Gemini).*
*Issue resolved 2026-02-15.*
