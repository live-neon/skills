# Agentic ClawHub Decoupling Plan - Twin Technical Review

**Date**: 2026-02-15
**Reviewer**: twin-technical (twin2)
**Model**: claude-opus-4-5-20251101
**Review Type**: Plan review (v2, post-code-review)

## Verified Files

| File | Lines | MD5 (8 char) |
|------|-------|--------------|
| `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` | 821 | 857fe952 |
| `agentic/review-orchestrator/SKILL.md` | 250 | d2527845 |
| `agentic/safety-checks/SKILL.md` | 311 | 5aa7154b |
| `agentic/governance/SKILL.md` | 289 | c3583af8 |
| `agentic/context-verifier/SKILL.md` | 256 | (verified) |
| `agentic/constraint-engine/SKILL.md` | 260 | (verified) |

**Status**: Approved with suggestions

---

## Summary

The v2 plan is well-structured and addresses the N=2 code review findings comprehensively. The spike-first approach for cognitive mode abstraction is sound, and the migration strategy addition resolves the most critical gap. However, several verification commands need strengthening, one stage dependency is incorrectly specified, and integration testing scope needs clarification.

---

## Findings by Severity

### Critical

None. The v2 plan addresses all critical gaps identified by Codex (C-1 migration, C-2 testing).

### Important

**I-1: Stage 4 targets wrong file for 90-day cadence**
- **Location**: Plan lines 363-375
- **File**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md`
- **Issue**: Plan says constraint-engine has the 90-day review cadence to configure, but actual verification shows:
  - `constraint-engine/SKILL.md:140`: Only mentions "90-day review gates" in diagram label
  - `governance/SKILL.md:109-119`: Contains actual 90-day review cycle logic and advisory note
- **Evidence**:
  ```
  $ grep -E "90.day" agentic/governance/SKILL.md
  | 76-90 | Approaching | Warning alert |
  > This 90-day review cycle is *not enforced programmatically*.

  $ grep -E "90.day" agentic/constraint-engine/SKILL.md
  └── 90-day review gates  # Just a diagram label
  ```
- **Confidence**: HIGH (direct file verification)
- **Suggestion**: Update Stage 4 to target `governance/SKILL.md` for cadence configuration, not constraint-engine. The plan already has a note "90-day cadence is in governance/SKILL.md" at line 364, which contradicts the Stage 4 scope listing constraint-engine.

**I-2: Stage 8 integration testing lacks negative test cases**
- **Location**: Plan lines 591-665 (Stage 8)
- **Issue**: Test cases only verify positive scenarios (config works, features work). Missing negative test cases:
  - What happens when `.openclaw/` and `.claude/` both exist with conflicting values?
  - What happens when neither config path exists?
  - What happens with malformed config YAML?
- **Confidence**: MEDIUM (inferred from test case list)
- **Suggestion**: Add negative test cases section:
  ```markdown
  ## Error Handling Tests
  - [ ] Conflicting configs: .openclaw/ takes precedence, warning logged
  - [ ] Missing all configs: Falls back to defaults, info logged
  - [ ] Malformed config: Clear error message, graceful degradation
  ```

**I-3: Stage 2 verification command misses CJK command name**
- **Location**: Plan lines 239-250
- **Issue**: Verification `grep -i "twin"` filters `Source skills:` and tags, but the command `/ro twin` (line 33 of SKILL.md) uses "twin" in the actual command name. This is user-facing and may need to become `/ro multi` or stay as-is with deprecation notice.
- **Evidence**:
  ```
  $ grep -i "twin" agentic/review-orchestrator/SKILL.md | head -5
  | `/ro twin` | 双子 | spawn(technical,creative)→findings[] | Explicit |
  | --technical-only | No | Skip creative twin |
  ```
- **Confidence**: HIGH (direct file verification)
- **Suggestion**: Clarify in Stage 2 whether `/ro twin` command name stays (with docs explaining multi-perspective) or changes (breaking change requiring version bump). The exit criteria "twin removed from user-facing documentation" conflicts with keeping the command name.

### Minor

**M-1: Stage 1 line estimates have gap**
- **Location**: Plan lines 121-164
- **Issue**: Line items sum to 80 lines (20+30+10+20) but estimate says 100-150. The v2 plan added "Integration and edge case handling (~20-40 lines)" at line 160 which partially addresses this, but 80+40=120 is still below 150.
- **Confidence**: LOW (estimation is inherently uncertain)
- **Suggestion**: Accept the range as-is; the spike will validate actual effort. No action needed.

**M-2: Verification command for S3 needs case-insensitivity**
- **Location**: Plan lines 307-308
- **Issue**: Command uses lowercase `grep -riE "S3|aws|bucket"` which is correct, but the actual SKILL.md has "S3" capitalized. The `-i` flag handles this, so the command is correct.
- **Confidence**: HIGH (verified command is correct)
- **Suggestion**: None needed. Gemini's M-3 finding was already addressed in v2.

**M-3: Timeline parallelism needs clarification**
- **Location**: Plan lines 759-773
- **Issue**: Timeline says "Sessions 2-4 can run in parallel if resources permit" but Stage 2 depends on Stage 1 (spike). Only Stages 3-4 are truly parallel-eligible.
- **Confidence**: HIGH (dependency analysis)
- **Suggestion**: Update timeline note to: "Stages 3-4 can run in parallel with Stage 2 completion."

---

## Verified Strengths

1. **Migration strategy is backward-compatible** (HIGH confidence)
   - Plan correctly states `.claude/` configs remain valid
   - Precedence order documented: `.openclaw/` > `.claude/` > workspace root
   - No forced migration required

2. **M-4 fix is correct** (HIGH confidence)
   - Verified: 90-day cadence IS in governance/SKILL.md, not constraint-engine
   - Plan Stage 4 note at line 364-365 correctly identifies this
   - However, Stage 4 scope still lists constraint-engine (see I-1)

3. **CJK retention policy is sound** (HIGH confidence)
   - CJK characters (双, 審, etc.) provide portable brand identity
   - Users don't need to understand CJK to use skills
   - This aligns with Gemini M-5 resolution

4. **Verification commands have PRESENCE checks** (HIGH confidence)
   - v2 added positive assertions (not just absence checks)
   - Example: Stage 1 line 175 checks `grep "Cognitive Mode Interface"`

5. **Risk owners added** (MEDIUM confidence)
   - Role-based ownership (@implementer, @planner, etc.)
   - Transferable across team members

---

## Technical Accuracy Verification

### Verification Command Testing

| Stage | Command | Result | Verdict |
|-------|---------|--------|---------|
| 1 | `grep -E "opus4\|opus41\|sonnet45"` | 6 matches found | Correctly identifies hardcodes |
| 2 | `grep -i "twin" \| grep -v tags` | 18+ matches | Needs command name decision |
| 3 | `grep -riE "S3\|aws\|bucket"` | 2 matches in safety-checks | Correctly identifies targets |
| 3 | `grep "claude-opus-4-5"` | 5 matches in safety-checks | Correctly identifies hardcodes |
| 4 | `grep "CLAUDE.md" context-verifier` | 1 match (line 85) | Correctly identifies target |
| 4 | 90-day in constraint-engine | 1 match (diagram only) | Wrong file targeted |

### Dependency Correctness

| Stage | Declared Deps | Actual Deps | Verdict |
|-------|---------------|-------------|---------|
| 1 | None | None | Correct |
| 2 | Stage 1 | Stage 1 | Correct |
| 3 | None (parallel) | None | Correct |
| 4 | None (parallel) | None | Correct |
| 5 | Stages 2-4 | Stages 2-4 | Correct |
| 6 | Stage 5 | Stage 5 | Correct |
| 7 | Stage 6 | Stage 6 | Correct |
| 8 | Stage 7 | Stage 7 | Correct |
| 9 | Stage 8 | Stage 8 | Correct |

---

## Estimate Realism Assessment

| Stage | Plan Estimate | Assessment | Confidence |
|-------|---------------|------------|------------|
| 1 | 1-2 sessions | Reasonable (spike validates) | MEDIUM |
| 2 | 1 session | Reasonable | HIGH |
| 3 | 1 session | Reasonable | HIGH |
| 4 | 0.5 session | Reasonable | HIGH |
| 5 | 1-2 sessions | May stretch to 2 | MEDIUM |
| 6 | 1-2 sessions | May stretch to 2 (standalone docs) | MEDIUM |
| 7 | 1 session | Reasonable | HIGH |
| 8 | 1 session | Reasonable | HIGH |
| 9 | 0.5 session | Reasonable | HIGH |
| **Total** | **8-11 sessions** | Realistic with buffer | MEDIUM |

The 8-11 session estimate is realistic. The spike (Stage 1) serves as the validation gate for the largest unknown.

---

## Risk Assessment Review

The 8 risks are comprehensive. One observation:

**Model-name drift risk** (line 703) is correctly identified with mitigation "Generic `{provider}-{model}` format." However, the format pattern in the plan (`{provider}-{model}-{version}-{date}`) differs slightly from the example in safety-checks/SKILL.md which uses `anthropic-opus-4-5-20251101`. Suggest standardizing format in Stage 3 changes.

**Missing risk**: No risk for "Integration testing discovers fundamental design flaw." While low likelihood, if Stage 8 reveals that cognitive mode abstraction doesn't work across providers, significant rework may be needed. Current rollback strategy (line 715) handles this but doesn't estimate the rework cost.

---

## Alternative Framing Consideration

The plan correctly defers formal adapter layer to v2 (line 810-812). This is appropriate - getting 7 portable skills published is higher value than architectural purity. The current approach removes surface dependencies without over-engineering.

**Monorepo vs 7 skills**: The plan's decision to keep 7 separate skills (line 816-817) is sound. Modular approach:
- Allows users to install single skills (failure-memory alone is useful)
- Provides 7 ClawHub keyword lanes for discoverability
- Suite README provides integration guidance for full-stack users

---

## Recommendations

### Must Fix Before Implementation

1. **I-1**: Update Stage 4 scope - remove constraint-engine, clarify governance is the correct target for 90-day cadence configuration.

2. **I-3**: Add explicit decision in Stage 2 about `/ro twin` command name - either keep (with documentation) or deprecate (with version bump).

### Should Fix

3. **I-2**: Add negative test cases to Stage 8 for config conflict, missing config, and malformed config scenarios.

4. **M-3**: Clarify timeline parallelism - only Stages 3-4 are parallel-eligible with Stage 2.

### Nice to Have

5. Add format standardization note to Stage 3 for model version pattern.

---

## Conclusion

The v2 plan demonstrates thorough incorporation of N=2 code review findings. The spike-first approach for cognitive mode abstraction is well-reasoned. With the Stage 4 target file correction and Stage 2 command name decision, the plan is ready for implementation.

**Verdict**: Approved with suggestions (2 must-fix, 2 should-fix)

---

*Review generated 2026-02-15 by twin-technical (twin2) using claude-opus-4-5-20251101.*
*Verification protocol: File identity verified via line count + MD5 checksum.*
