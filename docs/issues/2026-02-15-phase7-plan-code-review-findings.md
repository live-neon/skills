---
created: 2026-02-15
type: issue
scope: internal
status: resolved
priority: medium
related_observations:
  - docs/observations/code-review-feedback.md
related_reviews:
  - ../reviews/2026-02-15-phase7-implementation-codex.md
  - ../reviews/2026-02-15-phase7-implementation-gemini.md
related_plan: ../plans/2026-02-15-agentic-skills-phase7-implementation.md
related_issues:
  - ../issues/2026-02-15-phase6-code-review-findings.md
  - ../issues/2026-02-15-phase6-twin-review-findings.md
---

# Issue: Phase 7 Plan Code Review Findings (Consolidated)

## Summary

External code review (N=2: Codex + Gemini) of Phase 7 Architecture Finalization implementation plan identified 5 important and 4 minor issues. One finding initially flagged as "critical" was re-evaluated as a documentation clarity issue. Several N=1 findings were verified to N=2 through plan inspection.

## Findings by Severity

### Important (5)

| # | Finding | Plan Line | N-Count | Status |
|---|---------|-----------|---------|--------|
| I-1 | Missing deferred item: twin-review I-1 (test files 411-608 lines) | 59 | N=2 (verified) | Resolved |
| I-2 | Missing deferred item: code-review A-3 (N-count evidence verification) | 59 | N=2 (verified) | Resolved |
| I-3 | Optional stages risk incomplete closure | 141, 175 | N=2 (consensus) | Resolved |
| I-4 | Success criteria not covered by stages | 315-317 | N=2 (verified) | Resolved |
| I-5 | Manual dependency verification is brittle | 74-103 | N=2 (consensus) | Resolved |

### Minor (4)

| # | Finding | Plan Line | N-Count | Status |
|---|---------|-----------|---------|--------|
| M-1 | Code snippets in plan (HOW vs WHAT/WHY) | 188, 235 | N=1 | Resolved |
| M-2 | Missing risk for pbd-strength-classifier rename | 199-201 | N=2 (verified) | Resolved |
| M-3 | Timeline optimistic (0.5-1 day for scope) | 256-265 | N=2 (consensus) | Resolved |
| M-4 | Success criteria vs Current State checkbox misalignment | 29-47, 311-318 | N=1 | Resolved |

### Documentation Clarity (Resolved in Review)

| # | Finding | Source | Disposition |
|---|---------|--------|-------------|
| C-1 | loop-closer "DEFERRED markers" wording ambiguous | Gemini | Wording clarification (skill IS implemented, it detects DEFERRED markers) |

## Evidence: N=1 to N=2 Verification

### I-1: Missing twin-review deferred item I-1 (N=2 Verified)

**Codex finding**: Twin review item I-1 (test files 411-608 lines exceeding 300-line guidance) not listed in deferred items.

**Plan verification** (lines 59-68):
```markdown
| Item | Source | Priority |
|------|--------|----------|
| Custom category prefixes for slug-taxonomy | Phase 3 Finding 6, Phase 6 I-2 | Medium |
| Skill dependency graph updates | Phase 6 I-2 | Medium |
| Mock DRY refactoring | Phase 6 M-5 | Low |
| "When NOT to use" sections | Phase 6 M-1 | Low |
| ARCHITECTURE.md density | Phase 6 M-4 | Low |
| pbd-strength-classifier rename | Phase 6 M-3 | Low (team decision) |
```

**Twin review verification** (2026-02-15-phase6-twin-review-findings.md lines 30, 186):
- I-1 exists: "Test files exceed 300-line guidance (411-608 lines)"
- Status: "Deferred (Phase 7)"

**Confirmed**: I-1 is deferred to Phase 7 but not tracked in Phase 7 plan.

### I-2: Missing code-review deferred item A-3 (N=2 Verified)

**Codex finding**: Phase 6 code-review long-term item A-3 (N-count evidence verification mechanism) not scheduled in any stage.

**Plan verification**: No mention of "N-count evidence verification" in any stage.

**Code review verification** (2026-02-15-phase6-code-review-findings.md line 53):
- A-3 exists: "N-count evidence verification mechanism"
- Disposition: "Future work (Phase 7+)"

**Confirmed**: A-3 is marked for Phase 7+ but not tracked in Phase 7 plan.

### I-3: Optional stages risk (N=2 Consensus)

**Both reviewers found**: Stages 3-4 marked "optional" allows deferred items to be skipped while claiming completion.

**Plan verification** (lines 141, 175):
- Line 141: "### Stage 3: Test Infrastructure Cleanup (Optional)"
- Line 175: "### Stage 4: Documentation Polish (Optional)"

**Items at risk if skipped**: Mock DRY refactor (M-5), "When NOT to use" sections (M-1), ARCHITECTURE.md density (M-4), pbd-strength-classifier rename (M-3).

### I-4: Success criteria not covered by stages (N=2 Verified)

**Codex finding**: Success criteria include items with no explicit verification tasks.

**Plan verification** (lines 315-317):
```markdown
- [ ] Failure→constraint lifecycle data flow documented
- [ ] ClawHub integration points (self-improving-agent, proactive-agent) documented
- [ ] Extension guide for adding new skills
```

**Stage task review**:
- No stage explicitly verifies "Failure→constraint lifecycle data flow"
- No stage explicitly verifies "Extension guide for adding new skills"
- ClawHub integration is mentioned in Current State as "Complete" (line 44) but also unchecked in Success Criteria

### I-5: Manual dependency verification is brittle (N=2 Consensus)

**Both reviewers found**: Stage 1 proposes manual cross-referencing of 47 SKILL.md files.

**Plan verification** (lines 81-93):
```markdown
1. **Extract dependency claims from ARCHITECTURE.md**:
   - Each layer section documents "Dependencies" and "Used by"
   - Create verification checklist

2. **Cross-reference with SKILL.md Integration sections**:
   - Each of 47 skills has Integration section with "Depends on" / "Used by"
   - Flag mismatches
```

**Issue**: Manual verification is time-consuming, error-prone, and not repeatable.

**Gemini recommendation**: Automate with script that parses dependencies and generates mismatch report.

### M-2: Missing rename risk (N=2 Verified)

**Gemini finding**: pbd-strength-classifier rename listed in Stage 4 but not in Risk Assessment.

**Plan verification**:
- Stage 4 Task 3 (lines 199-201): "pbd-strength-classifier rename (M-3): Document decision..."
- Risk Assessment (lines 269-276): No entry for rename risk

**Confirmed**: Cross-cutting rename could break tests/references but has no risk mitigation.

### M-3: Timeline optimistic (N=2 Consensus)

**Both reviewers found**: 0.5-1 day timeline appears unrealistic for scope.

**Plan scope**:
- 47 skills dependency verification
- Custom category prefix decision/implementation
- Optional test refactoring
- Optional documentation polish
- Final verification

**Codex**: "Timeline appears unrealistic for cross-checking 47 SKILL.md Integration sections, designing/documenting taxonomy extensions, and running final verification."

**Gemini**: "The plan covers dependency verification for 47 skills, potential custom prefix implementation, test refactoring, documentation polish, and final verification. Even with optional stages, this is ambitious."

## Proposed Resolution

### Pre-Implementation (Update Plan)

1. **I-1/I-2**: Add missing deferred items to tracking table:
   - I-1: Test file MCE compliance (411-608 lines) - decide: accept as contract-test pattern OR extract mocks
   - A-3: N-count evidence verification mechanism - schedule or explicitly defer to future phase

2. **I-3**: Reconsider "optional" designation or require explicit deferral decision with rationale (not silent skip)

3. **I-4**: Add verification tasks for uncovered success criteria:
   - Task: "Verify Failure→constraint lifecycle in ARCHITECTURE.md Data Flow section"
   - Task: "Verify Extension guide section is actionable"

4. **I-5**: Consider automating dependency verification (Gemini recommendation) or explicitly scope down to sample verification

5. **M-2**: Add rename risk to assessment table:
   ```
   | Rename cascade misses reference | Low | High | Global find-replace, run all 534 tests |
   ```

6. **M-3**: Adjust timeline to 1-1.5 days, or scope down Stage 1

### Optional (Low Priority)

1. **M-1**: Remove or relocate code snippets (lines 188-193, 235) to separate implementation notes
2. **M-4**: Align Current State with Success Criteria checkboxes

## Acceptance Criteria

- [x] I-1: twin-review I-1 added to deferred items table with disposition
- [x] I-2: code-review A-3 added to deferred items table with disposition
- [x] I-3: Optional stages have explicit deferral requirement (not silent skip)
- [x] I-4: Success criteria have matching verification tasks
- [x] I-5: Dependency verification approach decided (automate vs sample)
- [x] M-2: Rename risk added to Risk Assessment table
- [x] M-3: Timeline adjusted or scope explicitly reduced

## Related Documents

- **Reviews**:
  - [Codex Review](../reviews/2026-02-15-phase7-implementation-codex.md)
  - [Gemini Review](../reviews/2026-02-15-phase7-implementation-gemini.md)
- **Plan**: [Phase 7 Implementation Plan](../plans/2026-02-15-agentic-skills-phase7-implementation.md)
- **Parent Specification**: [Agentic Skills Specification](../proposals/2026-02-13-agentic-skills-specification.md)
- **Prior Issues**:
  - [Phase 6 Code Review Findings](2026-02-15-phase6-code-review-findings.md) (resolved)
  - [Phase 6 Twin Review Findings](../../issues/2026-02-15-phase6-twin-review-findings.md) (resolved)

## Resolution Summary

All findings addressed on 2026-02-15 by updating the Phase 7 implementation plan:

**Important Fixes:**
- **I-1/I-2**: Added missing deferred items to tracking table with dispositions (twin-review I-1: accept as contract-test pattern; code-review A-3: defer to future phase)
- **I-3**: Changed Stages 3-4 from "Optional" to "Time-Boxed" with explicit deferral policy requiring documented rationale
- **I-4**: Added verification tasks to Stage 5 for Failure→constraint lifecycle, Extension guide, and ClawHub integration
- **I-5**: Changed Stage 1 from exhaustive 47-skill manual check to sample-based verification (12 skills, 2 per layer) with optional automation

**Minor Fixes:**
- **M-1**: Removed code snippets (template and npm command), replaced with references
- **M-2**: Added rename cascade risk to Risk Assessment table
- **M-3**: Adjusted timeline from 0.5-1 day to 1-1.5 days
- **M-4**: Updated Current State table to distinguish "Exists" vs "Verified" with notes on Phase 7 verification scope

---

*Issue created from N=2 external review (Codex + Gemini) with N=1 findings verified to N=2 through plan inspection.*
*Resolved same day with all findings addressed.*

