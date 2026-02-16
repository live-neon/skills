# Skill Category Alignment Plan Review - Codex

**Date**: 2026-02-15
**Reviewer**: codex-gpt51-examiner
**Files Reviewed**:
- `docs/plans/2026-02-15-skill-category-alignment.md` (325 lines)
- `docs/patterns/skill-format.md` (121 lines)
- `agentic/SKILL_TEMPLATE.md` (96 lines)
- `pbd/SKILL_TEMPLATE.md` (142 lines)
- `tests/e2e/skill-loading.test.ts` (222 lines)
- `agentic/README.md` (163 lines)
- `pbd/README.md` (153 lines)
- `agentic/failure-memory/SKILL.md` (205 lines)
- `pbd/essence-distiller/SKILL.md` (234 lines)
- `CONTRIBUTING.md` (19 lines)
- `tests/README.md` (103 lines)

## Summary

The plan identifies a real gap (no section validation for PBD skills, inconsistent Agentic validation) but introduces several conflicts with existing infrastructure. The core issue is **lack of single source of truth**: the plan, templates, and existing tests each define different required sections, and the plan doesn't reconcile these differences before adding new validation.

## Findings

### Critical

1. **Agentic required sections conflict across plan/template/test**
   - `docs/plans/2026-02-15-skill-category-alignment.md:111-117` - Plan Stage 2 lists: Usage, Arguments, Output, Integration, Failure Modes
   - `agentic/SKILL_TEMPLATE.md:20-78` - Template includes: Usage, Arguments, Output, Example, Integration, Failure Modes, Acceptance Criteria, Next Steps
   - `tests/e2e/skill-loading.test.ts:171-178` - Test enforces: Usage, Sub-Commands, Integration, Next Steps, Acceptance Criteria
   - **Impact**: None of these three sources agree. New checks will either fail against existing skills or miss template-critical sections.

2. **PBD frontmatter validation missing**
   - `docs/plans/2026-02-15-skill-category-alignment.md:75-85` - Plan defines required PBD fields: `user-invocable`, `emoji`
   - `tests/e2e/skill-loading.test.ts:140-148` - Current PBD tests only check name, version, description
   - `docs/plans/2026-02-15-skill-category-alignment.md:264-268` - Stage 5 script only prints missing fields, exits 0 regardless
   - **Impact**: PBD schema requirements exist on paper but are never enforced. The validation script provides false confidence.

### Important

3. **Agentic frontmatter spec vs tests disagree**
   - `docs/plans/2026-02-15-skill-category-alignment.md:71` - Plan marks `alias` as optional (`alias?: string`)
   - `tests/e2e/skill-loading.test.ts:165-167` - Test requires alias to exist
   - `tests/e2e/skill-loading.test.ts:191-198` - Test requires alias to match fixed list: `['fm', 'ce', 'cv', 'ro', 'gov', 'sc', 'wt']`
   - **Impact**: Plan says optional, tests say required. Which is authoritative? Adding skills without aliases would pass schema but fail tests.

4. **Hardcoded skill count creates brittleness**
   - `tests/e2e/skill-loading.test.ts:135-137` - `expect(agenticSkills.length).toBe(7)`
   - `tests/e2e/skill-loading.test.ts:22-30` - CONSOLIDATED_AGENTIC_SKILLS is a fixed name list
   - `tests/e2e/skill-loading.test.ts:151-156` - Test iterates this fixed list
   - **Impact**: Adding or renaming any Agentic skill requires test changes. The plan doesn't address this, though its goal is "alignment" that should enable future changes.

5. **Dual validation mechanisms invite drift**
   - `docs/plans/2026-02-15-skill-category-alignment.md:97-153` - Stage 2 creates vitest-based section validation
   - `docs/plans/2026-02-15-skill-category-alignment.md:237-286` - Stage 5 creates bash script validation
   - **Problem**: The bash script checks different sections (Agentic: Usage/Integration only; PBD: Agent Identity/Required Disclaimer only) than Stage 2's comprehensive list
   - **Impact**: Two rule sets means drift. The script also never fails (`set -e` but no failing assertions), so it's pure logging.

6. **Stage 3 cross-reference validation is superficial**
   - `docs/plans/2026-02-15-skill-category-alignment.md:167-169` - Claims to verify "Used by" and "Depends on" accuracy
   - `docs/plans/2026-02-15-skill-category-alignment.md:173-183` - Sample test only checks README mentions "PBD" or "Agentic"
   - **Impact**: Goal says "validate Integration sections are accurate" but mechanism only checks for substring presence in READMEs. The actual Integration sections in skills are never parsed.

### Minor

7. **Schema documentation location unclear**
   - `docs/plans/2026-02-15-skill-category-alignment.md:60-72` - Defines TypeScript interfaces
   - `docs/plans/2026-02-15-skill-category-alignment.md:88-89` - Says "Document schemas in pattern file"
   - `docs/patterns/skill-format.md:36-47` - Pattern file uses Markdown tables, not TypeScript
   - **Impact**: Ambiguous whether TS interfaces should be in test code, markdown, or both. Risk of drift between documentation and enforcement.

8. **Code sample uses wrong property name**
   - `docs/plans/2026-02-15-skill-category-alignment.md:123` - `expect(skill.content).toContain(section)`
   - `tests/e2e/skill-loading.test.ts:51` - Existing interface uses `body`, not `content`
   - **Impact**: Copy-pasting the Stage 2 sample code would fail. Minor but indicates plan wasn't tested against existing code.

## Alternative Framing

**Are we solving the right problem?**

The plan treats this as a validation problem (add more tests) but the root issue is **no authoritative source**:

1. Templates define sections but aren't machine-readable
2. Tests define different sections than templates
3. Plan proposes yet another set of sections

**Better approach**: Start with Stage 0 - reconcile template vs test vs plan into ONE authoritative list per category. Then validation becomes straightforward.

**Suggested order**:
1. Audit actual skills against templates (what sections exist in real skills?)
2. Update templates to match reality OR update skills to match templates
3. Update existing tests to match templates exactly
4. THEN add new validation (no need for separate file if existing test is correct)

The current plan risks cementing the inconsistencies by validating against yet another definition.

## Recommendations

| Priority | Action |
|----------|--------|
| **High** | Create authoritative section list per category BEFORE implementing validation |
| **High** | Decide: should `alias` be required or optional? Update plan AND tests to match |
| **High** | Make PBD frontmatter validation actually fail on missing fields |
| **Medium** | Remove hardcoded skill count; use discovery-based approach |
| **Medium** | Choose one validation mechanism (vitest OR script), not both |
| **Low** | Fix `content` vs `body` in code samples |

## Raw Output

<details>
<summary>Full CLI output</summary>

```
**Findings**
- Critical - Agentic required sections conflict across plan/template/test: plan Stage 2 lists Usage/Arguments/Output/Integration/Failure Modes (`docs/plans/2026-02-15-skill-category-alignment.md:111`), the Agentic template includes Acceptance Criteria and no Sub-Commands (`agentic/SKILL_TEMPLATE.md:20` and `agentic/SKILL_TEMPLATE.md:73`), while the existing test enforces Usage/Sub-Commands/Integration/Next Steps/Acceptance Criteria (`tests/e2e/skill-loading.test.ts:171`). Without a single source of truth, new checks will either fail or miss template-critical sections.
- Critical - PBD frontmatter fields marked required (`user-invocable`, `emoji`) in the plan (`docs/plans/2026-02-15-skill-category-alignment.md:75`) are not validated in the current tests (`tests/e2e/skill-loading.test.ts:140`), and the proposed shell validator only prints missing fields and still exits 0 (`docs/plans/2026-02-15-skill-category-alignment.md:264`). PBD schemas aren't actually enforced.
- Important - Agentic frontmatter spec vs tests differ: plan makes `alias` optional (`docs/plans/2026-02-15-skill-category-alignment.md:71`) and doesn't propose checks for `status`/`tags`, but tests require alias to exist and match a fixed list (`tests/e2e/skill-loading.test.ts:165` and `tests/e2e/skill-loading.test.ts:191`). This disagreement will either force undocumented requirements or allow missing fields through.
- Important - Skill discovery is hardcoded to exactly seven agentic skills (`tests/e2e/skill-loading.test.ts:135`) and a fixed name list (`tests/e2e/skill-loading.test.ts:151`), yet the plan doesn't address how validation should behave when adding or renaming skills. This brittleness undercuts the stated goal of alignment.
- Important - The Stage 5 validation script adds a second rule set (Agentic only Usage/Integration; PBD only Agent Identity/Required Disclaimer) and doesn't fail on missing sections (`docs/plans/2026-02-15-skill-category-alignment.md:253` and `docs/plans/2026-02-15-skill-category-alignment.md:266`). Maintaining both vitest checks and this non-failing script invites drift and false positives.
- Important - Stage 3 promises to verify "Used by"/"Depends on" accuracy (`docs/plans/2026-02-15-skill-category-alignment.md:167`), but the sample test only checks that READMEs mention the other category (`docs/plans/2026-02-15-skill-category-alignment.md:173`). No mechanism is defined to parse Integration sections or validate links, so the goal isn't achievable as written.
- Minor - Schema source of truth is unclear: the plan defines TypeScript interfaces (`docs/plans/2026-02-15-skill-category-alignment.md:60`) but says to document them in a pattern file (`docs/plans/2026-02-15-skill-category-alignment.md:88`) that's currently Markdown narrative (`docs/patterns/skill-format.md:36`). It's ambiguous whether validation should be driven by TS types, markdown tables, or both.
- Minor - The Stage 2 snippet asserts `skill.content` (`docs/plans/2026-02-15-skill-category-alignment.md:123`), but the loader in the existing test exposes `body` (`tests/e2e/skill-loading.test.ts:171`). Copy/pasting the sample would fail without adjusting the data model.

**Next Steps**
1) Decide authoritative required sections per category (template vs tests vs plan) and update all validation paths to match.
2) Extend frontmatter validation (tests and/or script) to cover both Agentic and PBD required fields, aligning required/optional decisions.
3) Remove hardcoded counts/names and consolidate on one validation mechanism (vitest or script) to avoid drift.
```

</details>

---

**Related Issue**: [skill-category-alignment-code-review-findings](../issues/2026-02-15-skill-category-alignment-code-review-findings.md)

*Review generated 2026-02-15 by codex-gpt51-examiner using gpt-5.1-codex-max*
