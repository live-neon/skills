# Phase 3 Agentic Skills Implementation Plan Review - Gemini

**Date**: 2026-02-13
**Reviewer**: gemini-25pro-validator
**Model**: gemini-2.5-pro
**Files Reviewed**:
- `../plans/2026-02-13-agentic-skills-phase3-implementation.md` (primary)
- `../proposals/2026-02-13-agentic-skills-specification.md` (cross-reference)
- `docs/workflows/twin-review.md` (workflow capture check)
- `docs/workflows/cognitive-review.md` (workflow capture check)
- `docs/workflows/review.md` (review-selector source)
- `../plans/2026-02-13-agentic-skills-phase2-implementation.md` (template comparison)

## Summary

The Phase 3 plan is comprehensive and well-structured. It correctly identifies 10 skills (6 Review, 4 Detection), provides clear stage breakdowns, and includes a reasonable timeline with parallelization opportunities. However, the review identified one critical gap in workflow capture and several important issues regarding forward dependencies, template consistency, and plan organization.

**Overall Assessment**: Good plan structure, needs workflow protocol gap addressed before implementation.

---

## Findings

### Critical

1. **[twin-review skill spec, lines 276-328] File verification protocol not captured**

   The `twin-review` skill specification does not mention the extensive file verification protocol from `docs/workflows/twin-review.md` (lines 129-149, 382-494). The existing workflow mandates:
   - MD5 checksums for all files passed to reviewers
   - Verbose file references (path + lines + hash + commit + verified date)
   - Verification command (`md5 <file> | head -c 8`)
   - Twin must verify MD5 matches before reviewing

   The skill's Output Format (lines 309-322) shows context normalization but only references a `packet_id` without explicit hash verification requirements for the twin agents themselves.

   **Impact**: Without file verification, the skill would deviate from established workflow safety guarantees. The whole point of file verification is to prevent hallucination and ensure both twins review identical content.

   **Recommendation**: Add explicit file verification protocol to twin-review skill specification, referencing the `照:cjk-summary` (file-reference-protocol) and requiring agents to verify checksums before proceeding.

---

### Important

2. **[effectiveness-metrics skill, lines 692-770] Forward dependency on Phase 4 governance-state**

   The `effectiveness-metrics` skill lists `governance-state (Phase 4)` as a "Used by" target (line 757). This creates a forward dependency where Phase 3 produces output consumed by a skill that doesn't exist yet.

   **Impact**: The skill can be built, but integration testing (Scenario 3, line 805) cannot verify the full flow until Phase 4 is implemented.

   **Recommendation**: Either:
   - Document this as a known limitation in Stage 6 acceptance criteria
   - Create a stub interface for governance-state during Phase 3 development
   - Move effectiveness-metrics to Phase 4 (cleanest solution)

3. **[Plan overall, 962 lines] MCE compliance concern**

   The plan is 962 lines, significantly exceeding the project's MCE principle of keeping files under 200-300 lines. For comparison, Phase 2 plan is 1,387 lines (also exceeds).

   **Impact**: Large plans are harder to review thoroughly. The Phase 2 plan addressed this by having clear section markers and a CJK summary, which Phase 3 also has.

   **Recommendation**: Accept current structure since:
   - Plan has good section organization
   - CJK summary provides quick reference
   - Breaking into multiple files would fragment implementation guidance
   - Phase 2 set precedent for longer implementation plans

4. **[cognitive-review skill, lines 329-369] Model mapping inconsistency**

   The skill specification (lines 342-346) lists:
   - Analyst: Opus 4
   - Transformer: Opus 4.1
   - Operator: Sonnet 4.5

   But `docs/workflows/cognitive-review.md` (lines 75-79) shows:
   - Opus 3 (Sonnet 4.5): Operator mode
   - Opus 4: Analyst (Tension) mode
   - Opus 4.1: Transformer mode

   The skill spec uses "Opus 4" but the workflow calls it "Opus 4" for Analyst. The naming is consistent, but the skill spec should clarify that "Opus 3" in the workflow equals "Sonnet 4.5" to avoid confusion.

   **Recommendation**: Add clarifying note in cognitive-review skill spec about model version naming.

5. **[Integration tests, lines 777-852] Coverage may be thin for 10 skills**

   5 scenarios test 10 skills. Some skills appear in multiple scenarios (good), but:
   - slug-taxonomy only appears in Scenario 2
   - staged-quality-gate only appears in Scenario 5
   - prompt-normalizer only appears in Scenario 1

   **Recommendation**: Consider adding a Scenario 6 that exercises slug-taxonomy merge/consolidation to test deduplication logic. This is important because slug deduplication is central to preventing observation fragmentation.

---

### Minor

6. **[Stage ordering] Stage 4 (topic-tagger, evidence-tier) before Stage 5 (failure-detector) may be suboptimal**

   failure-detector (Stage 5) "Depends on: context-packet, slug-taxonomy" per line 675.
   topic-tagger (Stage 4) "Depends on: context-packet" per line 551.

   Since failure-detector depends on slug-taxonomy (Stage 1) but not topic-tagger, Stages 4 and 5 could theoretically run in parallel rather than sequentially. The plan already notes this in the parallelization table (lines 889-896).

   **No action needed** - parallelization already documented.

7. **[review-selector skill, lines 379-429] Security detection criteria could be more explicit**

   The selection criteria table (lines 389-396) shows "Critical security change" triggers independent-review, but doesn't specify how "security" is detected. Is it file path (`**/security/**`), content analysis, or topic-tagger output?

   **Recommendation**: Add note that security detection uses topic-tagger semantic classification, not pattern matching.

8. **[RG-6 resolution options, lines 99-121] No default recommendation**

   The plan presents 3 options but doesn't recommend one. Phase 2 plan explicitly selected "Option A - Research Sprint First" with checkboxes.

   **Recommendation**: Add a default recommendation (suggest Option B - Provisional Implementation, given that Phase 3 research scope is smaller than Phase 2's 4 gates).

9. **[Troubleshooting Guide, lines 932-958] Good addition**

   The troubleshooting guide follows Phase 2's pattern. This is a positive consistency signal.

---

## Specification Alignment Check

Verified Phase 3 skills against `../proposals/2026-02-13-agentic-skills-specification.md`:

| Spec Skill | In Plan | Notes |
|------------|---------|-------|
| twin-review | Yes | Stage 2 |
| cognitive-review | Yes | Stage 2 |
| review-selector | Yes | Stage 3 |
| staged-quality-gate | Yes | Stage 3 |
| prompt-normalizer | Yes | Stage 1 |
| slug-taxonomy | Yes | Stage 1 |
| failure-detector | Yes | Stage 5 |
| topic-tagger | Yes | Stage 4 |
| evidence-tier | Yes | Stage 4 |
| effectiveness-metrics | Yes | Stage 6 |

**Result**: All 10 Phase 3 skills from specification are present in plan. No gaps.

Note: Gemini CLI initially flagged `constraint-generator` as missing from Phase 3, but this was an error - `constraint-generator` is a Phase 2 skill (verified in specification lines 470, 482).

---

## Alternative Framing Assessment

**Question**: Is automating these workflows the right problem? Should review remain human-driven?

**Assessment**: Automation is appropriate here. The goal is not to replace human review but to:
1. Ensure consistency (prompt-normalizer guarantees identical context)
2. Reduce coordination overhead (spawning agents, collecting results)
3. Enable scaling (N=5 reviews become manageable)
4. Capture workflow knowledge (currently in 900-line markdown files)

The skills preserve human decision points:
- Human chooses when to invoke review
- Human receives findings, decides implementation
- Human confirms/disconfirms failure attributions (C/D counters)

**Verdict**: Approach is sound. No reframing needed.

---

## Recommendations Summary

**Must fix before implementation**:
1. Add file verification protocol to twin-review skill spec (Critical)

**Should address**:
2. Document or mitigate effectiveness-metrics forward dependency
3. Add scenario for slug-taxonomy merge testing
4. Add RG-6 default recommendation
5. Clarify cognitive-review model naming

**Can defer**:
6. MCE compliance (acceptable for implementation plans)
7. Security detection criteria clarification
8. Parallelization notes (already present)

---

## Raw Output

<details>
<summary>Full Gemini CLI output</summary>

```
Based on my review of the plan overview and the referenced context files, here are my findings.

### Executive Summary

The Phase 3 plan is comprehensive and mostly well-structured, but it has **one critical issue** regarding workflow capture and **several important issues** related to specification alignment, dependency management, and compliance with project standards.

The most significant finding is that the `twin-review` skill, as described, appears to omit the critical file verification and checksum protocols detailed in the corresponding workflow document. This represents a potential gap in ensuring the integrity of the review process.

While the plan is thorough, its length of 962 lines is a concern for MCE (Minimum Contextual Element) compliance, potentially hindering review and comprehension.

### Detailed Findings

Here is a breakdown of findings based on your review questions, formatted as requested:

---

**1. Specification Alignment**

*   **[../proposals/2026-02-13-agentic-skills-specification.md] Important:** The Phase 3 plan is missing one skill specified in the proposal: `constraint-generator`. The specification lists this under the "Detection" layer. This skill seems crucial as it's referenced in Integration Test Scenario #3 ("N=3 -> STRONG -> constraint-generator -> effectiveness-metrics"). This is a gap between the spec and the plan.
*   **Minor:** The specification mentions R/C/D counters (Review/Cognitive/Detection) as a requirement. The plan summary doesn't explicitly state if the 10 proposed skills implement these counters. This should be verified.

**2. Workflow Capture**

*   **[docs/workflows/twin-review.md] Critical:** The plan summary for the `twin-review` skill does not mention the extensive file verification protocol, including MD5 checksums and file listing validation, which is a major part of the `twin-review.md` workflow. The workflow document emphasizes this as a way to ensure both reviewers are working from identical, verified context. Omitting this from the automated skill would be a major deviation from the established manual process and could compromise review integrity.
*   **[docs/workflows/cognitive-review.md] Minor:** The `prompt-normalizer` skill appears to correctly model and enforce the "Same Prompt Principle" from the `cognitive-review.md` workflow. This seems well-captured.

**3. Research Gate RG-6**

*   The 3-option resolution approach for failure attribution (Research Sprint, Provisional, Defer) is appropriate. It aligns with the project's principles of **Honesty > Helpfulness** by acknowledging uncertainty and providing a path to move forward (Provisional) without sacrificing correctness in the long term. Mandating one option now would be premature.

**4. Forward Dependency**

*   **Important:** The `effectiveness-metrics` skill (Phase 3) depends on `governance-state` (Phase 4). This is a forward dependency risk. The plan should specify a mitigation strategy, such as creating a stub or mock interface for `governance-state` during Phase 3 development to allow `effectiveness-metrics` to be built and tested.

**5. Integration Test Coverage**

*   The 5 scenarios provide reasonable coverage for the 10 skills, with each skill appearing to be covered in at least one flow. However, with the `constraint-generator` skill missing from the plan, Scenario #3 cannot be fully implemented or tested.

**6. Stage Dependencies**

*   The stage ordering is mostly logical. No major issues detected in the dependency flow as described.

**7. Alternative Framing**

*   Automating these review and detection workflows is the right problem to solve for this project. It directly aligns with the stated goals of using AI collaboration to augment development processes. The goal isn't to replace human review but to make the AI's own self-review processes more robust, consistent, and scalable, which is a core tenet of the project.

**8. Semantic Classification**

*   The requirement for semantic classification seems to be correctly propagated from the specification into the planned skills, specifically with `slug-taxonomy` (naming failures) and `topic-tagger` (inferring topics).

**9. MCE Compliance**

*   **[Plan itself] Important:** At 962 lines, the plan violates the spirit, if not the letter, of the project's MCE principle of極) of keeping elements small and focused (<200 lines). A plan of this size is difficult to review thoroughly and manage. It should be split into smaller, more focused sub-plans, perhaps one for each stage or logical skill grouping.

**10. Template Consistency**

*   I cannot assess whether the Phase 3 plan follows Phase 2's template structure as the Phase 2 plan document was not provided.
```

Note: The Gemini CLI response contained one error - it claimed `constraint-generator` was missing from Phase 3. This skill is actually a Phase 2 Core Memory skill, not Phase 3 Review & Detection. Scenario #3 correctly references it as a Phase 2 skill that Phase 3 skills integrate with.

</details>

---

*Review generated by gemini-25pro-validator for Phase 3 Agentic Skills Implementation Plan review.*
