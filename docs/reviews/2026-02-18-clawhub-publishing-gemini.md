# ClawHub Publishing Issues Review - Gemini

**Date**: 2026-02-18
**Reviewer**: gemini-25pro-validator
**Files Reviewed**:
- `docs/issues/2026-02-18-clawhub-publishing-issues.md`
- `docs/workflows/creating-new-skill.md`
- `docs/workflows/skill-publish.md`
- `agentic/constraint-engine/SKILL.md` (v1.2.0)
- `agentic/governance/SKILL.md` (v1.1.0)
- `agentic/failure-memory/SKILL.md` (v1.2.0)
- `agentic/context-verifier/SKILL.md` (v1.2.0)
- `agentic/safety-checks/SKILL.md` (v1.2.0)
- `agentic/review-orchestrator/SKILL.md` (v1.2.0)
- `agentic/workflow-tools/SKILL.md` (v1.1.0)

## Summary

The metadata format migration from top-level `config_paths`/`workspace_paths` to nested `metadata.openclaw.requires.*` is correctly applied across all 7 skills. Workflow documentation updates are comprehensive and should prevent future occurrences. However, two skills (`governance` and `workflow-tools`) have inconsistent "Data handling" statements and are missing "Security Considerations" sections.

## Findings

### Critical

None identified.

### Important

1. **[governance/SKILL.md:56-59] Data handling statement contradicts frontmatter**
   - Issue: Skill has `disable-model-invocation: true` in frontmatter but "Data handling" section states "All governance analysis uses your agent's configured model"
   - Impact: Contradictory statements may confuse users and trigger ClawHub scanner flags
   - Fix: Change to "instruction-only skill" language matching other 5 skills

2. **[workflow-tools/SKILL.md:59-62] Data handling statement contradicts frontmatter**
   - Issue: Same contradiction as governance - claims to use "agent's configured model" while marked `disable-model-invocation: true`
   - Impact: Inconsistency across skill suite, potential scanner flags
   - Fix: Update to match instruction-only pattern used by constraint-engine, failure-memory, context-verifier, safety-checks, review-orchestrator

3. **[governance/SKILL.md] Missing Security Considerations section**
   - Issue: 5 of 7 skills have "Security Considerations" sections; governance does not
   - Impact: Missing trust documentation may cause ClawHub to flag the skill
   - Fix: Add section following the template used by other skills:
     - What this skill accesses
     - What this skill does NOT access
     - What this skill does NOT do

4. **[workflow-tools/SKILL.md] Missing Security Considerations section**
   - Issue: Same as governance - no "Security Considerations" section
   - Impact: Inconsistent security documentation across suite
   - Fix: Add section with standard structure

### Minor

1. **Version inconsistency across skills**
   - Issue: governance and workflow-tools at v1.1.0, others at v1.2.0
   - Cause: Different starting versions before this fix cycle
   - Impact: Low - functional behavior unaffected
   - Action: Document as intentional or standardize in future batch update

2. **[issue doc line 85-97] Failure-memory detection triggers table may still cause confusion**
   - Issue: Table describes "auto-detection triggers" (scanning tool output, CI/CD) but skill is instruction-only
   - Context: Issue doc notes this needs clarification but action items are still unchecked
   - Recommendation: Ensure SKILL.md wording clarifies these are patterns agents can use to MANUALLY invoke `/fm detect`, not autonomous scanning

## Workflow Documentation Assessment

**Verdict: Excellent - prevents recurrence**

The updated workflow docs effectively address the root cause:

1. **creating-new-skill.md (lines 424-448)**: Explicitly warns that registry ignores top-level fields, shows correct nested format
2. **skill-publish.md (lines 259-282)**: Pre-publish checklist includes grep commands to detect wrong format
3. **skill-publish.md (lines 283-294)**: Common findings table lists "Metadata mismatch" and "Model invocation contradiction"

## Alternative Framing Assessment

**Question**: Are we solving the right problem?

**Analysis**: The implementation correctly works around the ClawHub parser limitation. However, filing a GitHub issue with ClawHub requesting support for both formats would:
- Benefit the broader community
- Reduce friction for new skill developers
- Provide a more forgiving parser experience

**Recommendation**: File feature request with ClawHub:
```
Title: [Feature Request] Support top-level config_paths/workspace_paths as fallback

Body: The registry parser currently only reads metadata.openclaw.requires.*
and ignores top-level config_paths/workspace_paths fields. This causes confusing
"metadata mismatch" errors. Suggest supporting both formats for better DX.
```

## Metadata Format Verification

All 7 skills now use correct format:

| Skill | Config Paths | Workspace Paths | Correct |
|-------|--------------|-----------------|---------|
| constraint-engine | .openclaw/constraint-engine.yaml, .claude/constraint-engine.yaml | output/constraints/, output/hooks/ | Yes |
| governance | .openclaw/governance.yaml, .claude/governance.yaml | output/governance/, output/constraints/, agentic/INDEX.md | Yes |
| failure-memory | .openclaw/failure-memory.yaml, .claude/failure-memory.yaml | .learnings/, .learnings/observations/ | Yes |
| context-verifier | .openclaw/context-verifier.yaml, .claude/context-verifier.yaml | output/context-packets/ | Yes |
| safety-checks | .openclaw/safety-checks.yaml, .claude/safety-checks.yaml | .openclaw/cache/, output/safety/ | Yes |
| review-orchestrator | .openclaw/review-orchestrator.yaml, .claude/review-orchestrator.yaml | docs/reviews/ | Yes |
| workflow-tools | .openclaw/workflow-tools.yaml, .claude/workflow-tools.yaml | output/loops/, output/parallel-decisions/, output/mce-analysis/, output/subworkflows/ | Yes |

## Recommendations

1. **Fix Important findings before republishing** - Update governance and workflow-tools to:
   - Change "Data handling" statements to instruction-only language
   - Add "Security Considerations" sections

2. **Consider version standardization** - Future release could align all skills to same major.minor

3. **File ClawHub feature request** - Request parser support for both formats

4. **Verify failure-memory detection trigger wording** - Clarify auto-detection vs manual invocation

## Raw Output

<details>
<summary>Full CLI output</summary>

Okay, I will start the review. First, I'll read the `SKILL.md` for each of the seven skills you listed to assess their metadata and content consistency.
I have reviewed the seven `SKILL.md` files. Now, I will locate the workflow documentation files (`creating-new-skill.md` and `skill-publish.md`) to continue my review. I'll search for them in the `docs/` directory.
Okay, I've found the documentation files. I will now read `creating-new-skill.md` and `skill-publish.md` to evaluate the completeness of the workflow documentation.
I have analyzed the seven skill files and the two workflow documents. Here is my review, structured by your questions.

### 1. METADATA CONSISTENCY: Are all skills using identical `metadata.openclaw.requires` structure?

**Finding:** Yes, the structure is consistent across all seven reviewed skills.

- **Severity:** None.
- **Details:** All skills correctly use the nested `metadata.openclaw.requires.config` and `metadata.openclaw.requires.workspace` format. The paths listed within these keys vary by skill, which is expected and correct. There are no structural variations that would cause parsing issues.

---

### 2. VERSION INCONSISTENCY: Some skills at v1.2.0, others at v1.1.0. Is this intentional?

**Finding:** Versioning is inconsistent, but likely intentional and low-risk.

- **Severity:** Minor.
- **Details:**
    - `governance` and `workflow-tools` are at `v1.1.0`.
    - The other five skills are at `v1.2.0`.
- **Analysis:** This is likely the result of the skills having different version histories prior to the consolidation work. While not perfectly consistent, it doesn't represent a functional bug. It's a minor discrepancy that could be cleaned up in a future batch update for standardization, but it does not require immediate action.

---

### 3. DATA HANDLING STATEMENTS: Is the contradiction between `disable-model-invocation: true` and the skill description a problem?

**Finding:** Yes, two skills have contradictory and misleading "Data handling" statements.

- **Severity:** Important.
- **Details:**
    - `governance` and `workflow-tools` are both marked with `disable-model-invocation: true`, which correctly prevents them from calling an AI model.
    - However, their "Data handling" sections incorrectly state: *"All governance analysis uses your agent's configured model..."*
    - This contradicts the frontmatter and the behavior of the other five skills, which correctly describe themselves as "instruction-only".
- **Recommendation:** Update the "Data handling" section in `agentic/governance/SKILL.md` and `agentic/workflow-tools/SKILL.md` to match the "instruction-only" description used in the other five skills. This will ensure accuracy and prevent user confusion.

---

### 4. SECURITY CONSIDERATIONS SECTIONS: Are they present in all skills? Are they consistent in structure?

**Finding:** Two of the seven skills are missing the "Security Considerations" section entirely.

- **Severity:** Important.
- **Details:**
    - The `governance` and `workflow-tools` skills are missing this section.
    - The other five skills (`constraint-engine`, `failure-memory`, `context-verifier`, `safety-checks`, `review-orchestrator`) include a comprehensive and consistently structured "Security Considerations" section.
- **Recommendation:** Add this section to `agentic/governance/SKILL.md` and `agentic/workflow-tools/SKILL.md`. The content should be modeled on the other skills, detailing what the skill accesses, does not access, and does not do. This is critical for user trust and passing ClawHub security reviews.

---

### 5. WORKFLOW DOC COMPLETENESS: Do the workflow docs now prevent the same mistake from recurring?

**Finding:** Yes, the updated documentation is excellent and should effectively prevent this issue from recurring.

- **Severity:** None.
- **Details:** Both `creating-new-skill.md` and `skill-publish.md` have been updated to:
    1.  **Explicitly Warn:** Both documents clearly state that the ClawHub registry *only* parses the nested `metadata.openclaw.requires` format and ignores top-level keys.
    2.  **Provide a Check:** The `skill-publish.md` includes a `grep` command in its pre-publish checklist specifically to detect the incorrect top-level format.
    3.  **Document the Failure Mode:** The docs list "Undeclared file access" and "Metadata mismatch" as common errors resulting from using the wrong format.
- **Analysis:** The documentation addresses the root cause directly, explains the consequences, and provides a concrete procedural step to catch the error.

---

### 6. ALTERNATIVE FRAMING: Should we also file a GitHub issue asking ClawHub to support both formats?

**Finding:** This is a valuable strategic suggestion that would benefit the wider community.

- **Severity:** None (This is a suggestion, not a finding).
- **Recommendation:** Yes, you should file a feature request with the ClawHub project.
- **Rationale:** While your internal documentation provides a robust solution, the underlying parser limitation in the ClawHub registry is a potential point of friction for all skill developers. Filing an issue could lead to a better developer experience for everyone.
- **Suggested Framing:**
    - **Title:** `[Feature Request] Improve parser robustness to support top-level config_paths and workspace_paths`
    - **Body:** Explain that the parser currently ignores top-level `config_paths`/`workspace_paths`, leading to confusing "metadata mismatch" errors. Propose that the parser be enhanced to support both the canonical nested format and the simpler top-level format as a fallback. This would make the system more forgiving and improve the overall developer experience.

</details>

---

*Review generated by gemini-2.5-pro via gemini CLI*
