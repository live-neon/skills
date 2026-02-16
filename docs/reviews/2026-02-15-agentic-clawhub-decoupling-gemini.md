# Agentic ClawHub Decoupling Plan Review - Gemini

**Date**: 2026-02-15
**Reviewer**: gemini-25pro-validator
**Files Reviewed**:
- `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (490 lines)
- `docs/issues/2026-02-15-agentic-consolidation-review-findings.md` (462 lines)
- `agentic/review-orchestrator/SKILL.md` (250 lines)
- `agentic/safety-checks/SKILL.md` (311 lines)
- `agentic/context-verifier/SKILL.md` (255 lines)
- `agentic/constraint-engine/SKILL.md` (259 lines)

## Summary

The plan is well-structured with appropriate spike methodology for the highest-risk item (cognitive mode abstraction). However, several verification commands have gaps that could allow hardcoded references to slip through, and the risk assessment underestimates ClawHub-specific publication concerns. The plan solves the right problem but underspecifies the publication pipeline.

## Findings

### Critical

None identified. The plan is fundamentally sound.

### Important

**I-1: Stage 7 verification misses subtle dependencies**
- **Category**: Verification
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:389-399`
- **Issue**: Final verification grep commands check for explicit strings (`Multiverse`, `claude-opus`, etc.) but miss implicit dependencies: environment variable assumptions, directory structure expectations, or ecosystem-specific patterns.
- **Example**: `safety-checks/SKILL.md:271-281` assumes `.claude/` directory structure exists - a pattern that may not fail verification but would confuse non-Claude users.
- **Suggestion**: Add verification for implicit patterns:
  ```bash
  # Check for assumed directory structures
  grep -rE "\.claude/|output/|\.learnings/" agentic/*/SKILL.md
  # Expected: All paths have .openclaw/ alternative documented
  ```

**I-2: Missing ClawHub versioning strategy**
- **Category**: Publication
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:342-376` (Stage 6)
- **Issue**: Stage 6 adds `repository` and `license` to frontmatter but does not establish a versioning strategy. ClawHub skills require semantic versioning for dependency resolution.
- **Suggestion**: Add to Stage 6:
  - Decide versioning strategy (recommend SemVer)
  - All skills start at `1.0.0` since they are post-consolidation
  - Document version bump policy in suite README

**I-3: Missing skill-level documentation for external users**
- **Category**: Publication
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:356-363` (Stage 6)
- **Issue**: Suite README is planned (~100 lines) but individual skills need standalone documentation for ClawHub users who install a single skill. Currently, skills reference other skills (e.g., `failure-memory` references `context-verifier`) without explaining how to satisfy dependencies.
- **Suggestion**: Add to each SKILL.md:
  - Installation instructions (`openclaw install leegitw/[skill]`)
  - Dependency installation (`depends on: leegitw/context-verifier`)
  - Standalone usage example (not requiring suite)

**I-4: Risk assessment missing dependency conflicts**
- **Category**: Risk
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:426-437`
- **Issue**: Risk table does not consider dependency conflicts with other ClawHub skills. If a popular skill uses a conflicting pattern (e.g., different `.learnings/` structure), integration issues could block adoption.
- **Suggestion**: Add risk:
  ```
  | Risk | Likelihood | Impact | Mitigation |
  | Dependency conflicts with other ClawHub skills | Low | Medium | Specify versions, integration test with popular skills |
  ```

### Minor

**M-1: Stage 1 line estimates don't sum to total**
- **Category**: Plan Quality
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:73-108`
- **Issue**: Stage 1 line items (20+30+10+20 = 80 lines) don't match the stated estimate (100-150 lines). Missing ~20-70 lines of unspecified work creates tracking ambiguity.
- **Suggestion**: Add explicit line item: "Integration and edge case handling (~30-50 lines)" or adjust total estimate to match sum.

**M-2: Stage 2 twin grep may miss CJK transliterations**
- **Category**: Verification
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:166-169`
- **Issue**: Verification `grep -i "twin"` filters out `Source skills:` and frontmatter but CJK characters are also present. The character in line 33 references "twin" concept.
- **Actual line** (`review-orchestrator/SKILL.md:33`): `| /ro twin | | spawn(technical,creative)->findings[] |`
- **Suggestion**: The grep is acceptable since CJK characters are intentionally portable (brand identity). Clarify in plan that CJK notation is retained intentionally.

**M-3: Stage 3 S3 verification too narrow**
- **Category**: Verification
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:231-232`
- **Issue**: Verification only greps for "S3" but misses related AWS patterns (`bucket`, `aws-sdk`, `s3:`).
- **Suggestion**: Expand to:
  ```bash
  grep -riE "S3|aws|bucket" agentic/safety-checks/SKILL.md
  # Expected: 0 (all generalized)
  ```

**M-4: Stage 4 line reference incorrect**
- **Category**: Plan Quality
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:249`
- **Issue**: Plan says "Line 85" for context-verifier CLAUDE.md hardcode. Actual location is line 85 but the constraint-engine "Line 141" reference is wrong - line 141 shows the lifecycle diagram, not the 90-day cadence.
- **Actual location**: `constraint-engine/SKILL.md:140` (diagram), cadence referenced at line 130-133 (threshold table mentions 30 days, not 90).
- **Note**: The 90-day review cadence appears in governance/SKILL.md, not constraint-engine. Plan may need to verify which file needs the change.

**M-5: CJK rename in Stage 2 may break identity**
- **Category**: Framing
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:151-152`
- **Issue**: Plan says "Keep CJK notation generic: rename to generic term". However, per project standards, CJK notation is intentionally portable and part of brand identity. Changing may lose distinctiveness.
- **Suggestion**: Retain original CJK as "internal notation" - it's already explained in each skill. Users don't need to understand CJK to use the skill.

## Alternative Framing

**Question: Is decoupling the right granularity?**

The plan decouples 7 skills individually but publishes them as a related suite. An alternative approach:

1. **Define skill interface first**: Create a generic skill interface (inputs, outputs, config format) then refactor skills to implement it. This would make future skills automatically portable.

2. **Publish as monorepo**: Instead of 7 separate `leegitw/*` skills, publish as `leegitw/neon-agentic` with sub-skills. Simplifies versioning, documentation, and dependency management.

**Assessment**: The current approach is valid for rapid publication. The interface-first approach would delay publication but improve long-term maintainability. Not a blocker, but worth considering for v2.

**Unquestioned assumption**: The plan assumes ClawHub publication is the right distribution channel. If the skills are primarily valuable as a suite (failure-to-constraint lifecycle), a single bundled publication might have higher adoption than 7 separate skills requiring users to understand the full system.

## Verification Command Assessment

| Stage | Command | Verdict |
|-------|---------|---------|
| 1 | `grep -E "opus4\|opus41\|sonnet45\|claude-opus\|claude-sonnet"` | Adequate |
| 1 | `grep -E "\.openclaw/\|\.claude/"` | Adequate |
| 2 | `grep -i "twin" \| grep -v "Source skills:" \| grep -v "^---"` | Adequate (with clarification) |
| 2 | `grep "npm test"` | Adequate |
| 3 | `grep "\.claude/" \| wc -l` | Adequate |
| 3 | `grep "claude-opus-4-5"` | Adequate |
| 3 | `grep -i "S3"` | **Needs expansion** (add bucket, aws) |
| 4 | `grep "CLAUDE.md"` | Adequate |
| 4 | `grep -A2 "review_cadence"` | **Line reference wrong** |
| 7 | `grep -r "Multiverse\|multiverse\|Live Neon\|live-neon"` | Adequate |
| 7 | `grep -rE "claude-opus\|claude-sonnet\|opus4[^a-z]\|opus41\|sonnet45"` | Adequate |

## Raw Output

<details>
<summary>Full CLI output</summary>

```
Here is a review of the plan provided.

### Plan Quality

*   **Issue**: Stage 1's line-item estimates for "Changes" don't add up to the top-end estimate, creating a potential schedule risk if the work is more complex than the line items suggest.
*   **Severity**: Minor
*   **File:line reference**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:29-32`
*   **Suggestion**: The sum of line-item estimates for "Changes" (20+30+10+20) is 80 lines. The total estimate for the spike is 100-150 lines. Consider adding a line item for "Initial interface implementation and integration" to account for the additional 20-70 lines, or revise the total estimate to better reflect the sum of the parts. This will help in tracking the progress of the spike more accurately.

### Verification Steps

*   **Issue**: The `grep` command in Stage 2 to check for "twin" might be insufficient. The term "twin" could exist in CJK contexts as a transliteration or a loanword, and the current `grep` might not be able to distinguish between legitimate and illegitimate uses.
*   **Severity**: Minor
*   **File:line reference**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:65-67`
*   **Suggestion**: The verification step is good, but it could be more robust. The current command `grep -i "twin" agentic/review-orchestrator/SKILL.md | grep -v "Source skills:" | grep -v "^---"` is a good start. To improve it, consider adding a `grep -v "双"` to exclude the CJK character for "twin" if it's not expected in the output. This would make the check more precise.

*   **Issue**: The verification step in Stage 3 for S3-specific references might not be comprehensive enough.
*   **Severity**: Minor
*   **File:line reference**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:88-89`
*   **Suggestion**: Instead of just grepping for "S3", also search for other AWS-specific terms like "aws", "s3:", "bucket", "aws-sdk", etc. to ensure that all cloud-provider-specific references are removed. A more comprehensive command would be `grep -rE "S3|aws|bucket|aws-sdk" agentic/safety-checks/SKILL.md`.

*   **Issue**: The final verification step in Stage 7 is good for finding hardcoded references, but it might miss more subtle dependencies.
*   **Severity**: Important
*   **File:line reference**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md:112-118`
*   **Suggestion**: In addition to the `grep` commands, consider adding a verification step to check for any assumptions about the environment, such as the presence of specific environment variables or file paths that might be specific to the Multiverse project. This can be done by searching for patterns like `process.env` or common directory names.

### Risk Assessment

*   **Issue**: The risk assessment does not consider the potential for dependency conflicts with other skills on ClawHub.
*   **Severity**: Important
*   **Suggestion**: Add a risk for "Dependency conflicts with other ClawHub skills" and mitigate it by "- specifying dependency versions and performing integration testing with popular skills".

### ClawHub Publication Considerations

*   **Issue**: The plan does not mention anything about documentation for the skills, which is crucial for ClawHub publication.
*   **Severity**: Important
*   **Suggestion**: Add a new stage or substage for writing comprehensive documentation for each skill, including its purpose, inputs, outputs, and configuration options. This will be essential for users who want to use the skills from ClawHub.

*   **Issue**: The plan does not consider versioning of the skills for ClawHub.
*   **Severity**: Important
*   **Suggestion**: Add a step in Stage 6 or 7 to decide on a versioning strategy (e.g., Semantic Versioning) and apply initial versions to all the skills before publication.

### Alternative Framing

*   **Issue**: The plan focuses on decoupling existing skills. An alternative approach could be to define a generic skill interface first and then refactor the skills to implement that interface.
*   **Severity**: Minor
*   **Suggestion**: This is not a blocker for the current plan, but it's worth considering for future skill development. A standardized skill interface could make it easier to develop and publish new skills in the future. The current approach is more of a refactoring of existing skills, which is a valid approach to get them published quickly.
```

</details>

---

*Review generated 2026-02-15 by gemini-25pro-validator (gemini-2.5-pro via CLI).*
