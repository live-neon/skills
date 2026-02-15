# Phase 2 Agentic Skills Plan Review - Codex

**Date**: 2026-02-13
**Reviewer**: codex-gpt51-examiner (GPT-5.1-codex-max)
**Files Reviewed**:
- `../plans/2026-02-13-agentic-skills-phase2-implementation.md` (709 lines)
- `../proposals/2026-02-13-agentic-skills-specification.md` (context)
- `projects/live-neon/skills/docs/implementation/agentic-phase1-results.md` (context)
- `projects/live-neon/skills/ARCHITECTURE.md` (context)

## Summary

The Phase 2 plan is structurally complete and follows a logical stage progression. However, there is one critical security gap (emergency override approval mechanism) and several important integration issues between skills that could lead to inconsistent behavior if not addressed before implementation.

## Findings

### Critical

1. **[CRITICAL] Line 421 - Emergency Override Approval Mechanism Undefined**

   The plan states "requires explicit human approval (cannot be auto-approved)" but provides no:
   - Approval authority definition (who can approve?)
   - Approval channel specification (how does approval work?)
   - Enforcement hook into constraint/circuit execution

   Without these, overrides are effectively auto-approvable, undermining the safety gate entirely.

   **Recommendation**: Add explicit approval workflow:
   - Define approval authority (session owner, named principals, etc.)
   - Specify approval mechanism (interactive prompt, signed token, etc.)
   - Document how circuit-breaker and constraint-enforcer check approval status before honoring override

### Important

2. **[IMPORTANT] Line 45 - constraint-generator Missing Foundation Dependencies**

   The dependency table shows constraint-generator depends only on `failure-tracker`. However, the acceptance criteria (line 271) state it "Uses positive framing (calls positive-framer)" and the output format includes `severity: critical`.

   Neither `severity-tagger` nor `positive-framer` are declared as dependencies.

   **Impact**: Generated constraints may have inconsistent severity assignment or framing without these integrations.

   **Recommendation**: Add `severity-tagger` and `positive-framer` to constraint-generator dependencies.

3. **[IMPORTANT] Line 312 - constraint-lifecycle Missing State Synchronization**

   The skill depends on `constraint-enforcer` but has no dependency on:
   - `constraint-generator` (its input source)
   - `circuit-breaker` state files

   When constraints are moved/retired/deleted, there's no requirement to:
   - Clear or update `.circuit-state.json` entries
   - Invalidate enforcement caches
   - Clean up `.overrides.json` references

   **Impact**: Stale or retired constraints could remain in enforcement paths; active constraints could lose their circuit breaker state on file moves.

   **Recommendation**: Add synchronization requirements for lifecycle transitions that update circuit-state and override files.

4. **[IMPORTANT] Line 176 - observation-recorder Missing Constraint Gate**

   The plan states observation-recorder uses "same format as failure-tracker, but `status: pattern`". However, constraint-generator's eligibility check (R>=3, C>=2, sources>=2) could match pattern observations if:
   - Pattern observations accumulate R/C counts over time
   - The only differentiator is `status: pattern` vs `status: active`

   The plan doesn't explicitly gate constraint-generator to exclude pattern observations.

   **Impact**: Positive patterns could accidentally generate constraints meant only for failure prevention.

   **Recommendation**: Either:
   - Add explicit `eligible_for_constraint: false` to pattern observations, OR
   - Add constraint-generator logic to filter by status (excluding `pattern`)

5. **[IMPORTANT] Line 543 - Integration Tests Incomplete**

   Stage 9 defines three integration scenarios:
   - Scenario 1: Failure to Constraint Flow
   - Scenario 2: Circuit Breaker Trip and Recovery
   - Scenario 3: Emergency Override Flow

   But these omit end-to-end testing for:
   - `contextual-injection` (pattern matching, workflow stage matching)
   - `memory-search` (semantic search accuracy, filter correctness)
   - `progressive-loader` (deferred loading, priority tiers)

   These are 3 of 9 Core Memory skills without integration test coverage.

   **Recommendation**: Add Scenario 4 (Context Loading Flow) covering contextual-injection + progressive-loader + memory-search integration.

### Minor

6. **[MINOR] Line 35 - Phase 1 Prerequisite Gate Not Instrumented**

   Prerequisites show "Phase 1 results reviewed and approved" as unchecked `[ ]` but no task, owner, or gate mechanism is defined to enforce this before Stage 1 begins.

   **Recommendation**: Add explicit task in Stage 1 or block Stage 1 start on approval.

7. **[MINOR] Line 374 - Circuit Breaker Window Implementation Undefined**

   The plan specifies "rolling 30-day window" but doesn't define:
   - Time source (UTC? local? configurable?)
   - Violation deduplication (same action repeated rapidly = 1 or N violations?)
   - Retention policy (violations older than 30 days purged? kept for history?)

   **Recommendation**: Add implementation notes for window calculation behavior.

8. **[MINOR] Line 104 - LLM Test Fallback Strategy Incomplete**

   Behavioral tests "skip when LLM unavailable" means CI without API keys leaves Phase 1 behavioral gaps untested. The plan mentions `describeWithLLM` helper but no fixture-based fallback.

   **Recommendation**: Consider mock/fixture mode for CI that tests structure even without real LLM, ensuring some behavioral validation always runs.

## Alternative Framing: Is This the Right Approach?

The plan implements a comprehensive failure-anchored learning system. Three assumptions warrant examination:

### Assumption 1: Human Approval is Enforceable
The entire emergency-override safety model assumes human approval can be verified. In a CLI/REPL environment with AI-initiated actions, what prevents the AI from claiming "human approved" without actual human interaction? This is a trust boundary question that the plan doesn't address.

### Assumption 2: File-Based State is Sufficient
Circuit-breaker state (`.circuit-state.json`) and overrides (`.overrides.json`) are JSON files. In concurrent sessions or multi-agent scenarios:
- Race conditions on state updates
- No locking mechanism specified
- No conflict resolution strategy

For a two-person team this may be acceptable, but scaling could introduce issues.

### Assumption 3: 9 Skills in 3-5 Days is Realistic
The timeline estimates 3-5 days for 9 skills + 2 deferred items + integration tests. Given:
- Phase 1 (5 skills) identified behavioral test gaps post-implementation
- Several skills have complex integrations (circuit-breaker wraps constraint-enforcer)
- Integration testing requires end-to-end flow verification

This timeline may be optimistic. Consider adding buffer or prioritizing critical path skills first.

## Counter Terminology Consistency (R/C/D)

The plan is **consistent** with Architecture Guide v5.2 terminology:
- R = recurrence count (auto-incremented) - Line 134-136
- C = confirmations (human-verified true positives) - Line 137
- D = disconfirmations (human-verified false positives) - Line 137

Counter notation in observation file format (lines 176-177: `r_count`, `c_count`, `d_count`) matches the semantic definitions.

Eligibility criteria (lines 219-221) correctly use R >= 3, C >= 2, sources >= 2.

**No terminology inconsistencies found.**

## Summary Statistics

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Important | 4 |
| Minor | 3 |
| **Total** | **8** |

## Recommendations Priority

1. **Address Critical**: Define emergency-override approval mechanism before implementation
2. **Address Important before Stage 3**: Fix constraint-generator dependencies
3. **Address Important before Stage 4**: Add constraint-lifecycle state synchronization
4. **Address Important before Stage 2**: Add observation-recorder constraint gate
5. **Address Important in Stage 9**: Expand integration test coverage

---

## Raw Output

<details>
<summary>Full CLI output</summary>

```
[CRITICAL] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:421 - Emergency-override lists "requires explicit human approval" but provides no approval authority, channel, or enforcement hook into constraint/circuit execution, leaving overrides effectively auto-approvable and undermining the safety gate.
[IMPORTANT] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:45 - constraint-generator depends only on failure-tracker; severity assignment and positive framing rely on Phase 1 severity-tagger/positive-framer but those dependencies aren't declared, risking inconsistent severity and framing of generated constraints.
[IMPORTANT] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:312 - constraint-lifecycle depends on constraint-enforcer but not on constraint-generator output or circuit-breaker state; no requirement to synchronize moves/retire/delete with circuit-state/override files or enforcement caches, so stale or retired constraints could still be enforced or active constraints could lose breakers.
[IMPORTANT] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:176 - observation-recorder reuses failure observation format without an explicit gate (e.g., `eligible_for_constraint: false` or status handling) to prevent constraint-generator from promoting positive patterns, risking constraints generated from "pattern" entries.
[IMPORTANT] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:543 - Integration tests cover failure→constraint and breaker/override flows but omit contextual-injection, memory-search, and progressive-loader, leaving core Phase 2 skills unvalidated end-to-end.
[MINOR] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:35 - Prerequisite "Phase 1 results reviewed and approved" is unchecked with no planned task/owner, so Phase 2 could start without the required gate.
[MINOR] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:374 - Circuit-breaker rolling 30-day window is specified but time source, windowing method, and duplicate suppression aren't; unclear operational rule risks inconsistent trip behavior across environments.
[MINOR] ../plans/2026-02-13-agentic-skills-phase2-implementation.md:104 - Behavioral tests rely on real LLM but plan doesn't define deterministic fallback/fixtures beyond "skip," which could leave Phase 1 gaps untested in CI.
```

**CLI Session Info**:
- Model: gpt-5.1-codex-max
- Provider: openai
- Sandbox: read-only
- Tokens used: 16,473

</details>

---

*Review completed 2026-02-13 by codex-gpt51-examiner.*
*Part of N=2 code review workflow (codex + gemini).*
