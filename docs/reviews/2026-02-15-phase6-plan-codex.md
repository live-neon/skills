# Phase 6 Implementation Plan Review - Codex

**Date**: 2026-02-15
**Reviewer**: 審碼 (codex-gpt51-examiner)
**Files Reviewed**:
- `../plans/2026-02-15-agentic-skills-phase6-implementation.md` (600 lines)
- `../proposals/2026-02-13-agentic-skills-specification.md` (partial, Phase 6 section)
- `[multiverse]/output/context/2026-02-15-phase6-plan-review-context.md`

## Summary

Phase 6 plan implements 10 observation-backed extension skills across 7 stages in 2-3 days. While the plan structure is comprehensive and aligns with previous phase patterns, there are critical gaps in MoSCoW prioritization, observation evidence operationalization, and timeline feasibility that should be addressed before implementation.

## Findings

### Critical

**Finding 1: Missing MoSCoW Split** (plan:81-96, spec:887-897)

The specification explicitly requires 5 "Could" skills and 5 "Won't" skills with different priorities:

```
| constraint-versioning | Could |
| pbd-strength-classifier | Could |
| cross-session-safety-check | Could |
| loop-closer | Could |
| mce-refactorer | Could |
| pattern-convergence-detector | Won't |
| observation-refactoring | Won't |
| parallel-decision | Won't |
| threshold-delegator | Won't |
| hub-subworkflow | Won't |
```

However, the plan treats all 10 skills as mandatory implementations in sequential stages without distinguishing priority. Stage 7 is marked "optional" but contains prior-phase deferrals (custom category prefixes, packet signing), not the "Won't" priority skills.

**Impact**: Schedule assumes all 10 skills are equal priority when half should be deprioritized.

**Recommendation**: Restructure plan to implement 5 "Could" skills first (Stages 2-5), with "Won't" skills in an explicit optional Stage 6b, separate from Stage 7 maintenance.

---

**Finding 2: Observation-Backed Validation Not Operationalized** (plan:79-96, plan:166-167)

The plan claims "Each skill has N>=3 validation from real usage" but provides no mechanism to:
1. Verify N-count evidence exists per skill before implementation
2. Gate acceptance on observation data availability
3. Test against real observation fixtures from source materials

The N-count table at lines 81-92 references source observations, but there is no acceptance criterion that verifies the skill actually matches the documented behavior in those observations.

**Impact**: Skills may be implemented without validating against the evidence that justifies their existence.

**Recommendation**: Add per-skill "Evidence Checkpoint" in each stage that verifies:
- Source observation file exists and is parseable
- N-count matches claim (e.g., mce-refactorer claims N=7, verify in source)
- Acceptance criteria map to specific observation scenarios

---

### Important

**Finding 3: Timeline Implausible for Scope** (plan:540-551)

The timeline allocates:
- Stage 1: 0.5 days (test infrastructure cleanup - 3 tasks)
- Stages 2-5: 0.5 days each (2-3 skills per stage)
- Stage 6: 0.25 days (1 skill)
- Stage 7: 0.25 days (optional maintenance)

This gives ~1.5-2 hours per skill including design, implementation, and validation. Phase 5 took 2-3 days for 5 skills (0.4-0.6 days each). Phase 6 allocates 0.17-0.25 days per skill for 10 skills - a 2-3x compression.

**Impact**: High risk of incomplete implementation or quality shortcuts.

**Recommendation**: Either:
- A) Extend timeline to 4-5 days
- B) Apply MoSCoW and implement only 5 "Could" skills (2.5 days), deferring "Won't" to Phase 6b
- C) Split into Phase 6a (5 skills, 2.5 days) and Phase 6b (5 skills, 2.5 days)

---

**Finding 4: Stages Lack Entry/Exit Criteria and Owners** (plan:138-465)

Unlike Phase 5 which had explicit verification gates and stage prerequisites, Phase 6 stages have only "Verification: Tests pass" without:
- Entry criteria (what must be true before starting)
- Exit criteria (what must be true to proceed)
- Stage owner assignment
- Dependencies between stages

Stage 1 (cleanup) is a dependency for Stage 2+ testing but has no gate ensuring cleanup is complete before skill implementation begins.

**Impact**: Risk of proceeding with incomplete prerequisites.

**Recommendation**: Add to each stage:
```markdown
**Entry Criteria**:
- [ ] Previous stage verification complete
- [ ] Required fixtures/mocks available

**Exit Criteria**:
- [ ] All acceptance criteria checked
- [ ] Tests added and passing
- [ ] SKILL.md compliant with MCE (<200 lines)

**Owner**: [TBD]
```

---

**Finding 5: Test Strategy Insufficient** (plan:466-499)

The test strategy specifies counts (~50 tests, 5 files) but lacks:
- Per-skill behavioral test matrix
- Observation-data fixtures (how to test skills that consume observation files)
- Cross-session behavior testing for cross-session-safety-check
- Parallel execution testing for parallel-decision
- MCE compliance validation for mce-refactorer (needs actual large files)

The fixture path `tests/fixtures/phase6/` is referenced but not created or populated in Stage 1.

**Impact**: Test coverage may be superficial, missing skill-specific behaviors.

**Recommendation**: Add Stage 1.5 "Fixture Scaffolding" with:
- Sample observations at various N-counts (N=1, N=3, N=5+)
- Sample large files exceeding MCE (300+ lines)
- Sample DEFERRED/PLACEHOLDER markers for loop-closer
- Historical session state examples for cross-session testing

---

### Minor

**Finding 6: Risk Assessment Incomplete** (plan:529-537)

The risk assessment omits several likely risks:
- **Schedule/capacity risk**: 10 skills in 2-3 days (MEDIUM likelihood, HIGH impact)
- **Observation data availability**: Source observations may not have extractable test scenarios (MEDIUM likelihood, MEDIUM impact)
- **Test infrastructure regression**: Stage 1 refactoring may break existing Phase 3-5 tests (LOW likelihood, HIGH impact)
- **Cross-phase dependency**: Skills reference Phase 4 governance-state but plan says "Phase 2 prerequisite" (LOW likelihood, MEDIUM impact)

**Recommendation**: Expand risk table with these items and add mitigation strategies and owners.

---

**Finding 7: Deferred Items from Stage 7 Could Block Phase 7** (plan:439-462, spec:712-714)

Stage 7 defers custom category prefixes and packet signing as "optional." However, the specification lists custom category prefixes as Phase 3 Finding 6 (N=2 validated) and packet signing as Phase 4 deferred item.

If Phase 7 (Architecture Documentation) assumes these are complete, there may be documentation gaps.

**Impact**: Documentation may describe features not implemented.

**Recommendation**: Clarify in plan whether Phase 7 can proceed without these items, or make them non-optional.

---

**Finding 8: Inconsistent File References in Frontmatter** (plan:24)

Frontmatter lists `docs/observations/2025-11-09-resist-file-proliferation.md` but the plan body references `docs/observations/resist-file-proliferation.md` (without date prefix) at line 304.

**Impact**: Minor confusion; may affect automated tooling.

**Recommendation**: Verify actual filename and use consistent reference.

---

## Alternative Framing

The Codex CLI suggested an alternative approach worth considering:

**Observation Evidence Pipeline First**

Instead of structuring around "skill implementation stages," structure around "evidence verification then implementation":

1. **Stage 1: Evidence Inventory** (0.5 days)
   - Verify all 10 source observations/workflows exist
   - Extract test scenarios from each source
   - Create per-skill evidence checklist

2. **Stage 2: MoSCoW Prioritization** (0.25 days)
   - Implement 5 "Could" skills first
   - Defer 5 "Won't" skills explicitly

3. **Stage 3: Test/Fixture Scaffolding** (0.5 days)
   - Create `tests/fixtures/phase6/`
   - Populate with observation samples
   - Set up mocks moved from Phase 5

4. **Stage 4: Could Skills Implementation** (1.5 days)
   - constraint-versioning, pbd-strength-classifier
   - cross-session-safety-check, loop-closer, mce-refactorer
   - Per-skill validation gates

5. **Stage 5: Won't Skills Implementation** (1.5 days) [OPTIONAL]
   - pattern-convergence-detector, observation-refactoring
   - parallel-decision, threshold-delegator, hub-subworkflow

6. **Stage 6: Verification + Cleanup** (0.5 days)
   - Regression testing (Phase 2-5 tests still pass)
   - Deferred items decision

This approach aligns implementation with the observation-backed nature of Phase 6 skills.

---

## Verification Notes

**Plan Alignment with Specification**: Partial
- Skill list matches specification
- MoSCoW distribution NOT reflected in stages
- Timeline matches specification (2-3 days)
- Prerequisites match (Phase 2 required)

**Previous Phase Pattern Consistency**: Good
- Follows Phase 5 structure (multiple stages, verification gates)
- Skill-per-stage pattern maintained
- Test strategy format matches Phase 5

**Source Material Coverage**: Good
- All 10 skills reference source workflows/patterns/observations
- Source files verified to exist (per context file)

---

## Raw Output

<details>
<summary>Full Codex CLI output</summary>

```
OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/tests
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c62b1-8b4a-7370-94f4-8efa3a947ab3
--------

thinking
**Reviewing plan content with severity findings**

Reviewed plan text from `../plans/2026-02-15-agentic-skills-phase6-implementation.md` (per provided content; file not present locally to confirm). Findings:

- critical: No MoSCoW classification or priority for 10 skills despite spec requiring 5 Could / 5 Won't; plan lumps all as Stage tasks without priority (lines 30-47, 66-73).
- critical: Observation-backed validation not operationalized; plan claims N>=3 validations per skill but lacks mapping to source observations or acceptance gating per skill, risking misalignment to spec (lines 34-37, 66).
- important: Schedule unrealistic for scope; 2.75 days for 10 skills plus cleanup, leaving 0.25 day per skill including validation and tests, lacking buffer or clear sequencing (lines 38-45).
- important: Stages lack entry/exit criteria, owners, and acceptance gates; Stage7 optional defers unresolved prior work risking repeated delays (lines 38-45, 54-58).
- important: Test strategy insufficient; only counts test files and tests, missing per-skill coverage, observation data integration, cross-session behavior testing, and fixture location uncertain (lines 49-53).
- minor: Risk assessment incomplete; omits schedule and integration risks, dependency gating, and mitigation plans (lines 60-64).

Alternative framing: Consider restructuring around an observation evidence pipeline first, with clear per-skill MoSCoW prioritization, dedicated instrumentation and validation stages, and gating by evidence and success metrics.

codex
Reviewed the provided text for `../plans/2026-02-15-agentic-skills-phase6-implementation.md` (couldn't locate the file locally; line numbers reflect the supplied content).

**Findings**
- critical: No MoSCoW split for the 10 skills even though the spec demands 5 Could / 5 Won't; all skills are treated as equal "must-do" items (lines 30-47 vs spec reminder on 66-73).
- critical: "Observation-backed" is asserted (34-37) but not operationalized-no per-skill mapping to `source_observations`, no plan to collect the >=3 real-usage validations, and no acceptance/gating criteria tied to observations in any stage (38-45).
- important: Timeline is implausible for scope-Stage 2 alone packs three skills into 0.5 day (~1.5h each including design, code, and validation); total 2.75-3.0 days leaves no buffer for Stage 1 cleanup or Stage 7 polish (38-47).
- important: Stages lack entry/exit criteria and owners; Stage 1 cleanup is a dependency for later testing but has no explicit gate, and Stage 7 is "optional" while it carries prior-phase deferrals (38-45, 54-58).
- important: Test strategy is a count, not coverage-no per-skill behavioral matrix, no plan for observation-data fixtures or cross-session/parallel behaviors, no validation of the >=3 real-usage signals, and the referenced fixture path `tests/fixtures/phase6/` is unspecified (49-53).
- minor: Risk list omits the most likely issues (schedule/capacity for 10 skills, availability/quality of observation data, regression risk from test infra refactor, dependency on Phase 5 assets) and has no mitigations or owners (60-64).

**Alternative framing**
Anchor the plan on observation evidence: 1) inventory observations per skill with acceptance checkpoints; 2) prioritize via the required MoSCoW split before scheduling; 3) reserve a day for test/fixture scaffolding plus data plumbing; 4) implement skills in 2-3 batches with per-batch validation gates; 5) close with regression pass and deferred items (packet signing, category prefixes) as explicit exit criteria rather than "optional."

tokens used: 104,307
```

</details>

---

*Review created 2026-02-15 by 審碼 (codex-gpt51-examiner). Part of N=2 external code review.*
