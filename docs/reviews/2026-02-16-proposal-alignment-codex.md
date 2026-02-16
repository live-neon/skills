# Proposal Alignment Plan Review - Codex

**Date**: 2026-02-16
**Reviewer**: 審碼 (codex-gpt51-examiner)
**Model**: gpt-5.1-codex-max
**Files Reviewed**:
- `docs/plans/2026-02-16-proposal-alignment.md` (550 lines)
- `docs/proposals/2026-02-13-agentic-skills-specification.md` (context)
- `docs/workflows/documentation-update.md` (context)

## Summary

The plan is well-structured and follows the established "Stage 0: Alignment Audit" pattern appropriately. However, there are several internal inconsistencies (47 vs 48 skill counts), a shell command bug that will cause false positives in verification, and a scope gap where PBD skills documentation is mentioned but not addressed in any stage.

## Findings

### Critical

*None identified.*

### Important

1. **[lines 95, 500-502] Shell command bug - false mismatch in verification**

   The skill-count verification uses:
   ```bash
   find agentic -maxdepth 1 -type d -name "[a-z]*" | wc -l
   ```

   This command counts directories but the `-maxdepth 1` without `-mindepth 1` may include edge cases. More critically, the `_archive` directory starts with `_` so it is excluded by `[a-z]*`, but verification should be explicit.

   **Fix**: Use `-mindepth 1` and explicitly exclude metadata directories:
   ```bash
   find agentic -mindepth 1 -maxdepth 1 -type d -name "[a-z]*" | wc -l
   ```

2. **[lines 24, 72, 188, 208] Inconsistent skill count: 47 vs 48**

   The plan alternates between counts:
   - Line 24 (Summary): "47 individual skills"
   - Line 72 (Divergence table): "47 skills"
   - Line 188 (Stage 3): "48 → 7 skills"
   - Line 208 (Consolidation Result table): "48 skills"

   This ambiguity will cause confusion when updating the specification. Reconcile the true pre-consolidation count before proceeding.

3. **[lines 78, 243-246] Scope gap: PBD skills not addressed**

   Line 78 mentions "Publishing 7 agentic + 7 PBD skills" but all 8 stages only update the two agentic proposals. The 7 PBD skills documentation remains untracked and potentially misaligned.

   **Recommendation**: Either expand scope to include PBD alignment or explicitly note it as out of scope with a follow-up plan reference.

4. **[lines 380-398] Mixed units in timeline: days vs sessions**

   The timeline section mixes:
   - Phases 1-7: "1-2 days", "3-5 days" (days)
   - Post-Phase 7: "6-8.5 days", "8-11 sessions" (days and sessions mixed)
   - Total line: Sums days + sessions without conversion

   This makes the total impossible to interpret. Either normalize to one unit or provide conversion (e.g., "1 session ≈ 2-4 hours").

### Minor

1. **[lines 334-357] Pre-checked success criteria without evidence**

   Success criteria include items marked `[x]` (complete) such as:
   - `[x] 7 consolidated skills operational`
   - `[x] All 7 skills decoupled from Multiverse dependencies`

   These are copied from prior plans without linked verification evidence. Risk: the specification will bake in unvalidated completion claims.

   **Recommendation**: Either link to evidence (e.g., issue closure, test results) or use unchecked boxes to indicate "to be verified during execution."

2. **[line 451-454] Verification regex may miss stale references**

   Final verification uses:
   ```bash
   grep -E "7 (consolidated )?skills" docs/proposals/...
   ```

   This confirms presence of "7 skills" but does not flag lingering "47 skills" references that may remain in headings, lists, or comments.

   **Recommendation**: Add negative check:
   ```bash
   # Should return 0 matches (no stale references)
   grep -E "47 skills" docs/proposals/2026-02-13-agentic-skills-specification.md | grep -v "Original design"
   ```

3. **[lines 271-304] Code blocks in plan vs plan template guidance**

   Stage 4 includes a 15-line code block showing directory structure. Per `docs/templates/implementation-plan-template.md`, plans should describe WHAT/WHY, not embed code. This is borderline acceptable since it's ASCII tree structure (documentation), not executable code.

   **No action required** - ASCII trees are documentation, not code.

## Alternative Framing

**Are we solving the right problem?**

The plan correctly identifies that specifications must match implementation. However:

1. **Assumption: Specifications should trail implementation**

   The current approach updates specs AFTER implementation diverges. An alternative is "Spec-First with Change Requests" where implementation changes require spec updates in the same PR. This would prevent drift rather than remediate it.

   The plan does address this via the "Maintenance Strategy" section (lines 487-510), but enforcement is manual. Consider adding pre-commit hooks or CI checks.

2. **Assumption: Historical sections are valuable**

   Stages 4-6 preserve original phase descriptions and timelines. This adds 100+ lines to an already 1,400+ line specification.

   Alternative: Archive historical details in `docs/implementation/` and keep the specification focused on current state. The spec then links to historical context rather than embedding it.

3. **Missing: Traceability matrix**

   The plan assumes the 7 consolidated skills fully cover the 47 original skills' requirements. No explicit mapping verifies this coverage.

   **Question**: Is there a requirements-to-skill trace confirming no functionality was lost in consolidation?

## Open Questions

1. Are we confident the 7 consolidated skills still cover all behaviors from the original 47/48, or do we need a requirements-to-skill trace before rewriting the spec?

2. Should the alignment scope explicitly cover PBD/ClawHub-bound skills and any other docs (ARCHITECTURE.md, INDEX.md) that still mention the pre-consolidation layout?

3. The `documentation-update.md` workflow lists proposals in the hierarchy but does not have explicit guidance for "major divergence alignment." Should this plan become a pattern in that workflow?

## Raw Output

<details>
<summary>Full CLI output</summary>

```
**Findings**
- important – docs/plans/2026-02-16-proposal-alignment.md:95,500: Skill-count checks use `find agentic -maxdepth 1 -type d -name "[a-z]*"` which counts the root folder, so it returns 8 instead of 7 and will always flag a false mismatch; add `-mindepth 1` (and/or explicitly exclude `_archive`) to make the staleness and audit checks meaningful.
- important – docs/plans/2026-02-16-proposal-alignment.md:24,72,188: The plan alternates between "47" and "48" skills (summary and divergence table say 47; consolidation section and mapping say 48), so the target delta is ambiguous; reconcile the true pre-consolidation count before updating specs or timelines.
- important – docs/plans/2026-02-16-proposal-alignment.md:78,243: Plan cites publishing "14 skills" (7 agentic + 7 PBD) but every stage only updates the two agentic proposals; without a step to align PBD documentation/specs, half the published set remains untracked and misaligned.
- important – docs/plans/2026-02-16-proposal-alignment.md:380,394,396,398: Timeline mixes units (days for phases 1-7, "sessions" for post-phase work) and then sums them, making the total impossible to interpret or compare; normalize to a single unit or provide conversions.
- minor – docs/plans/2026-02-16-proposal-alignment.md:334-357: Success criteria are pre-checked as complete (e.g., decoupling, publication phases) without linked evidence or verification steps, risking that the spec will bake in unvalidated statuses.
- minor – docs/plans/2026-02-16-proposal-alignment.md:451: Final verification relies on `grep -E "7 (consolidated )?skills"`, which can pass even if other "47 skills" claims remain (e.g., in headings or lists); include a negative check for lingering "47" references instead.

Open questions / assumptions
- Are we confident the 7 consolidated skills still cover all behaviors from the original 47/48, or do we need a requirements-to-skill trace before rewriting the spec?
- Should the alignment scope explicitly cover PBD/ClawHub-bound skills and any other docs (ARCHITECTURE.md, INDEX.md) that still mention the pre-consolidation layout?

tokens used: 44,221
```

</details>

---

*Review generated by 審碼 (codex-gpt51-examiner) using Codex CLI with gpt-5.1-codex-max model.*
*Part of N=2 code review workflow (審碼 + 審双) or N=3 independent review (+審雲).*
