# Phase 3 Agentic Skills Plan Review - Codex

**Date**: 2026-02-13
**Reviewer**: Codex GPT-5.1-max (via CLI)
**Files Reviewed**:
- `../plans/2026-02-13-agentic-skills-phase3-implementation.md` (962 lines)
- Cross-referenced: `../proposals/2026-02-13-agentic-skills-specification.md`
- Cross-referenced: `docs/workflows/twin-review.md`
- Cross-referenced: `docs/workflows/cognitive-review.md`
- Cross-referenced: `docs/workflows/review.md`

---

## Summary

The Phase 3 plan is well-structured with clear stage organization and detailed skill specifications. However, there are **1 critical gap**, **5 important issues**, and **1 minor risk** that should be addressed before implementation. The most significant concerns are: (1) missing prerequisite gates from the specification, (2) stage ordering conflicts between dependencies, and (3) incomplete encoding of existing workflow mandates into the skill specifications.

**Overall Assessment**: Good foundation, needs remediation before implementation.

---

## Findings

### Critical

#### 1. Missing Prerequisite Gates from Specification

**Location**: Plan lines 60-66 vs Specification lines 516-522

**Issue**: Phase 3 prerequisites omit specification-mandated verification gates:
- `algorithm:hash` format implementation (spec line 511)
- Behavioral test implementation (spec line 512)
- Integration test: failure->R=3+eligibility->constraint flow (spec line 518)
- Integration test: circuit-breaker trips correctly (spec line 519)

The plan's prerequisites only check:
```markdown
- [ ] Phase 2 complete (14 Core Memory skills implemented)
- [ ] Integration tests pass (all 5 scenarios from Phase 2)
- [ ] ARCHITECTURE.md Core Memory layer documented
- [ ] Phase 2 results reviewed and approved
```

**Impact**: Starting Phase 3 without these gates validated could lead to integration failures with Foundation/Core Memory layers.

**Recommendation**: Add missing checks to Prerequisites section, or document explicit risk acceptance if proceeding without them.

---

### Important

#### 2. Stage Ordering Conflicts with Dependencies

**Location**: Plan lines 426-429 (review-selector depends on topic-tagger) and lines 881-895 (parallelization table)

**Issue**: The `review-selector` skill depends on `topic-tagger` (line 428: "Depends on: twin-review, cognitive-review, topic-tagger"), yet Stage 3 (review-selector) is scheduled before/parallel to Stage 4 (topic-tagger).

The parallelization table shows:
```
| Stage 2 (twin, cognitive) | Stage 4 (tagger, tier) | No interdependency |
| Stage 3 (selector, gate) | Stage 5 (detector) | Stage 2 needed for Stage 3 |
```

This implies Stage 3 can run parallel to Stage 4, but review-selector cannot work without topic-tagger.

**Recommendation**: Either:
1. Reorder stages so Stage 4 completes before Stage 3
2. Remove topic-tagger from review-selector dependencies (stub it)
3. Update parallelization table to show Stage 3 depends on Stage 4

---

#### 3. Incomplete Workflow Mandate Encoding

**Location**: Plan lines 275-359 (twin-review and cognitive-review skill specs)

**Issue**: The skill specifications do not encode critical workflow mandates:

From `review.md` (lines 28-42):
- **Read-only enforcement**: "Reviewers MUST NOT modify files under review"

From `twin-review.md` (lines 21-49, 129-147):
- **Parallel twin invocation**: "Twin reviews MUST be called in parallel, not sequentially"
- **MD5/line-count context manifest**: File verification protocol requiring MD5 checksums

From `cognitive-review.md` (lines 58-68, 88-106):
- **Same Prompt Principle**: "All agents receive the identical prompt - no custom prompts per agent"
- **Scout manifest flow**: Context file is a manifest (list of files with paths, MD5, line counts)

The acceptance criteria (lines 360-369) mention "Context normalized before spawning" but don't specify:
- Read-only mode enforcement
- MD5 verification requirements
- Parallel execution guarantees
- Same prompt compliance

**Recommendation**: Extend skill specifications and acceptance criteria to explicitly require:
- `--sandbox read-only` flag or equivalent enforcement
- MD5/line-count verification before review
- Parallel spawning implementation (not sequential)
- Identical prompt validation

---

#### 4. MCE Threshold Inconsistency

**Location**: Plan lines 470-472, 845 vs `twin-review.md` lines 153-156

**Issue**: The plan sets MCE compliance at <=300 lines (line 845: "All SKILL.md files comply with MCE limits (<=300 lines)"), while `twin-review.md` enforces <=200 lines (line 153: "Functions >200 lines (MCE violation)").

This affects `staged-quality-gate` skill configuration and acceptance criteria.

**Recommendation**: Decide on a single threshold or document file-type exceptions:
- SKILL.md files: <=300 lines (documentation)
- Code files: <=200 lines (MCE standard)

Update acceptance criteria to reflect the chosen threshold(s).

---

#### 5. Unresolved RG-6 Research Gate Handling

**Location**: Plan lines 71-89 (research gate section), 655-676 (attribution confidence), 677-689 (acceptance criteria)

**Issue**: The RG-6 (Failure Attribution Accuracy) handling is incomplete:
- No option (A/B/C) has been selected
- No entry/exit criteria for provisional mode
- Integration tests don't verify uncertain/low-confidence attribution
- No tasks or dates for research output

The plan presents three options but doesn't select one:
```markdown
**Option A: Research Sprint First** (recommended for production)
**Option B: Provisional Implementation** (acceptable for iteration)
**Option C: Defer Complex Attribution** (minimal scope)
```

**Recommendation**:
1. Select Option A, B, or C and document the decision
2. If B or C: Add tasks/dates for follow-up research
3. Add integration test scenario for attribution confidence/uncertain flag propagation to failure-tracker

---

#### 6. Insufficient Integration Test Coverage

**Location**: Plan lines 779-852 (Stage 7: Integration Testing)

**Issue**: The five integration scenarios don't exercise several critical skill features:
- `prompt-normalizer`: verify/diff commands not tested
- `slug-taxonomy`: merge/validate commands not tested
- `staged-quality-gate`: configuration levels (Quick/Standard/Thorough) not tested
- `failure-detector`: uncertain/confidence paths not tested (RG-6 edge cases)
- `effectiveness-metrics`: dashboard/trend/per-constraint queries not tested

5 scenarios for 10 skills = 0.5 scenarios/skill, which is low coverage.

**Recommendation**: Either:
1. Add 2-3 additional scenarios covering the gaps
2. Extend existing scenarios to exercise more skill behaviors
3. At minimum, add a scenario for RG-6 uncertain attribution flow

---

### Minor

#### 7. Effectiveness-Metrics Data Source Mapping Unclear

**Location**: Plan lines 696-769 (effectiveness-metrics skill)

**Issue**: The skill specifies metrics to track but doesn't map how to compute them:
- Prevention rate: requires violation blocked/bypassed counts
- False positive rate: requires D/(C+D) calculation source
- Circuit trip rate: requires trip event logging
- Override rate: requires override/violation ratio

Missing specifications:
- Required inputs (which circuit-breaker/constraint-lifecycle events)
- Data schemas
- Time windowing rules (30d rolling? calendar month?)

**Recommendation**: Add a "Data Sources" section specifying:
- Event types consumed from circuit-breaker
- Event types consumed from constraint-lifecycle
- Windowing and aggregation rules

---

## Alternative Framing Assessment

**Question**: Is the overall approach correct, or are there unquestioned assumptions?

### Observation 1: Automating Manual Workflows vs. Designing for Automation

The plan assumes automating existing manual workflows (twin-review, cognitive-review) is the right approach. An alternative would be designing new workflows optimized for automation from the start.

**Risk**: The existing workflows evolved for human execution and may carry unnecessary complexity when automated.

**Assessment**: This is acceptable for Phase 3. The "automate existing" approach reduces design risk and ensures parity with proven workflows. New optimized workflows could be a Phase 7+ evolution.

### Observation 2: 10 Skills May Be Too Many for One Phase

Phase 3 implements 10 skills (vs. 5 in Phase 1, 9 in Phase 2). The skills span two categories (Review + Detection) with different concerns.

**Risk**: Scope creep or integration complexity could delay completion.

**Assessment**: The parallelization table suggests this is manageable. The timeline (2-3 days serial, 1.5-2 days parallel) seems realistic given Phase 2 precedent.

### Observation 3: Forward Dependency on Phase 4

`effectiveness-metrics` depends on `governance-state` (Phase 4). This creates a forward dependency that could limit Phase 3 completeness.

**Risk**: Phase 3 cannot be fully verified until Phase 4 exists.

**Assessment**: This is acknowledged in the plan (line 145: "governance-state (Phase 4)"). Consider stubbing the integration or deferring effectiveness-metrics to Phase 4.

---

## Recommendations Summary

| Priority | Item | Action |
|----------|------|--------|
| Critical | Missing prerequisite gates | Add spec-mandated checks to Prerequisites |
| Important | Stage ordering | Reorder Stage 3/4 or update parallelization table |
| Important | Workflow mandates | Add read-only, MD5, parallel, same-prompt requirements |
| Important | MCE threshold | Align on 200 vs 300 line threshold |
| Important | RG-6 handling | Select option and add integration test |
| Important | Test coverage | Add scenarios for untested skill features |
| Minor | Metrics data sources | Specify inputs, schemas, windows |

---

## Raw Output

<details>
<summary>Full Codex CLI output</summary>

```
Findings:

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:60-66 vs ../proposals/2026-02-13-agentic-skills-specification.md:516-522 - gap (critical): Phase 3 prerequisites omit spec-mandated gates (`algorithm:hash` format, behavioral test implementation, circuit-breaker/failure->R=3 integration tests). Add these checks (or document risk acceptance) before Stage 1 can start.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:426-429 and 881-895 - inconsistency (important): review-selector depends on topic-tagger, yet Stage 3 is scheduled before/parallel to Stage 4. Reorder stages or stub dependency; update parallelization table so selector doesn't run before tagging exists.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:275-359 - gap (important): Twin/cognitive review automation doesn't encode workflow mandates: read-only enforcement (review.md:28-42), parallel twin invocation + MD5/line-count context manifest (twin-review.md:21-49, 129-147), same-prompt principle and scout manifest flow for cognitive review (cognitive-review.md:24-68, 88-106). Extend skill specs/acceptance criteria to enforce read-only mode, manifest verification, identical prompts, and parallel spawning to avoid bias.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:470-472,845 vs docs/workflows/twin-review.md:153-156 - inconsistency (important): Plan sets MCE compliance at <=300 lines while workflow enforces <=200 lines. Decide on a single threshold (or file-type exceptions) and align staged-quality-gate + acceptance criteria accordingly.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:71-89,655-676,677-689 - risk (important): RG-6 handling is unresolved-no selected option, no defined entry/exit criteria for provisional mode, and integration tests don't verify uncertain/low-confidence attribution. Choose option A/B/C, add tasks/dates for research output, and require tests covering attribution confidence/uncertain flag propagation to failure-tracker.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:779-852 - gap (important): Five integration scenarios don't exercise several skills/features (prompt-normalizer verify/diff, slug-taxonomy merge/validate, staged-quality-gate configuration levels, failure-detector uncertain/confidence paths, effectiveness-metrics dashboard/trend/per-constraint). Add scenarios or extend existing ones so all 10 skills' critical behaviors and RG-6 edge cases are tested.

- ../plans/2026-02-13-agentic-skills-phase3-implementation.md:696-769 - risk (minor): Effectiveness-metrics lacks data-source mapping (how to compute prevention/false-positive/override rates from circuit-breaker + constraint-lifecycle events, windowing rules). Specify required inputs, schemas, and sampling windows to prevent unusable dashboards.

tokens used: 229,293
```

</details>

---

*Review generated 2026-02-13 by Codex GPT-5.1-max via `codex exec --sandbox read-only`*
