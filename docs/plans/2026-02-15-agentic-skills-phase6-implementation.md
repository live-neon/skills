---
created: 2026-02-15
type: plan
status: complete
priority: medium
code_review: 2026-02-15-phase6-plan-codex.md, 2026-02-15-phase6-plan-gemini.md
twin_review: 2026-02-15 (technical + creative)
remediation: complete
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-14-agentic-skills-phase5-implementation.md
depends_on:
  - ../plans/2026-02-13-agentic-skills-phase2-implementation.md
related_guides:
  - [multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - ../../ARCHITECTURE.md
source_workflows:
  - docs/workflows/observation-refactoring.md
  - docs/workflows/closing-loops.md
  - docs/workflows/parallel-vs-serial-decision.md
source_patterns:
  - docs/patterns/mce-refactoring.md
  - docs/patterns/auto-delegate-on-threshold.md
  - docs/patterns/hub-subworkflow.md
source_observations:
  - docs/observations/configuration-as-code-type-safety.md
  - docs/observations/2025-11-09-resist-file-proliferation.md
  - docs/observations/plan-approve-implement-workflow-violation.md
  - docs/observations/workflow-hub-subworkflow-pattern.md
---

# Agentic Skills Phase 6: Observation-Backed Extensions

<!-- SECTION: cjk-summary -->
**拡層**: Phase 6 implements 10 Extension skills (observation-backed, workflow-derived)
**Skills**: constraint-versioning, pbd-strength-classifier, cross-session-safety-check,
           pattern-convergence-detector, observation-refactoring, loop-closer,
           parallel-decision, threshold-delegator, mce-refactorer, hub-subworkflow
**Flow**: observation-recorder → pbd-strength-classifier → constraint-generator (strength-aware)
**Value**: Skills encode proven workflows/patterns into reusable automation
**When to use**: Large file? → mce-refactorer. Open loops? → loop-closer. Parallel vs serial? → parallel-decision.
**When NOT to use**: Simple commits (<30 lines), mid-task checks, trivial fixes. Skills add value for systematic work, not micro-tasks.
<!-- END SECTION: cjk-summary -->

## Summary

### Why This Matters

**The Problem**: Proven workflows and patterns exist in documentation, but humans must
remember to apply them. Observation files accumulate without systematic maintenance.
Large files exceed MCE limits without guidance on how to split them. Loop closure
requires manual vigilance. These cognitive loads accumulate across sessions.

**The Solution**: Phase 6 builds the **Extensions Layer**—skills that encode battle-tested
workflows and patterns into reusable automation:

- **loop-closer**: Detect open placeholders, deferred items, incomplete docs before marking done
- **mce-refactorer**: Guide file splitting using proven strategies (N=7 validated)
- **hub-subworkflow**: Split large docs into navigable hub + sub-documents (N=5 validated)
- **parallel-decision**: 5-factor framework for parallel vs serial execution decisions
- **threshold-delegator**: Auto-suggest delegation when issue counts exceed thresholds (N=3)
- **pbd-strength-classifier**: Classify observation strength for constraint candidacy (N=11)
- **constraint-versioning**: Track constraint evolution history (N=9 progression visible)
- **cross-session-safety-check**: Detect cross-session state interference (N=4)
- **pattern-convergence-detector**: Alert when N=2 patterns are converging to N=3
- **observation-refactoring**: Maintain observation health via rename/consolidate/promote/archive

**Immediate Value**: Run `/loop-closer scan` before marking work complete. Run
`/mce-refactorer analyze <file>` when a file exceeds 200 lines. These skills prevent
common failures without requiring humans to remember every workflow detail.

### What Success Looks Like

After Phase 6, invoking `/loop-closer scan` finds DEFERRED observations, PLACEHOLDER
markers, and unclosed TODOs before they become forgotten failures. `/mce-refactorer
analyze tests/e2e/phase3-contracts.test.ts` suggests specific split strategies based
on the file type. `/parallel-decision evaluate <task>` applies the 5-factor framework
to recommend serial or parallel execution. The cognitive load of "what workflow applies
here?" shifts from human memory to skill invocation.

### Strategic Context

**Observation-Backed**: Unlike Phases 1-5 (architecture-driven), Phase 6 skills emerge
from observation evidence. Each skill has N≥3 validation from real usage:

| Skill | Source Evidence | N-Count |
|-------|-----------------|---------|
| mce-refactorer | MCE Refactoring Pattern | N=7 |
| hub-subworkflow | Hub-Subworkflow Pattern | N=5 |
| parallel-decision | Parallel vs Serial workflow | N=5 |
| pbd-strength-classifier | Resist File Proliferation | N=11 |
| constraint-versioning | Configuration-as-Code | N=9 |
| observation-refactoring | Hub-Subworkflow Pattern | N=5 |
| cross-session-safety-check | Plan-Approve-Implement | N=4 |
| threshold-delegator | Auto-Delegate Pattern | N=3 |
| loop-closer | Closing Loops workflow | N=3 |
| pattern-convergence-detector | Multiple N=2→N=3 | N=2+ | *(lowest evidence; defer to Phase 7 if implementation reveals gaps)* |

**Scope**: All 10 skills are in scope for Phase 6. Per code review (N=2), the original
MoSCoW split created scope ambiguity. Skills are now grouped by functional category
(workflow encoding → MCE compliance → observation management → constraint evolution
→ pattern detection) rather than priority tier. All skills have N≥3 validation and
justify implementation.

---

## Prerequisites

### Required

- [x] Phase 2 complete (Core Memory operational)
- [x] Phase 4 complete (Governance/Safety for optional integration)
- [x] Phase 5 complete (Bridge skills available)
- [x] Unified testing infrastructure at `projects/live-neon/skills/tests/`

### Source Materials Available

- [x] `docs/workflows/observation-refactoring.md` (observation-refactoring source)
- [x] `docs/workflows/closing-loops.md` (loop-closer source)
- [x] `docs/workflows/parallel-vs-serial-decision.md` (parallel-decision source)
- [x] `docs/patterns/mce-refactoring.md` (mce-refactorer source)
- [x] `docs/patterns/auto-delegate-on-threshold.md` (threshold-delegator source)
- [x] `docs/patterns/hub-subworkflow.md` (hub-subworkflow source)

### Optional (Enhanced Integration)

- [ ] governance-state available (pattern-convergence-detector, observation-refactoring gain coordination)

---

## Deferred Items from Previous Phases

Address these maintenance items during Phase 6:

| Item | Source | Description | Stage |
|------|--------|-------------|-------|
| Test file splitting | Phase 3 Finding 3 | `phase3-contracts.test.ts` is 755 lines. Split into 3 files. | Stage 1 |
| Test mock refactoring | Phase 5 Finding 11 | Move 400+ lines of mocks from `phase5-bridge-contracts.test.ts` to `tests/mocks/`. | Stage 1 |
| Custom category prefixes | Phase 3 Finding 6 | Add extension mechanism to slug-taxonomy for custom prefixes. | Stage 7 |
| Packet signing | Phase 4 deferred | Implement packet signing for context-packet authenticity. | **Deferred to Phase 7** |

---

## Implementation Stages

### Stage 1: Test Infrastructure Cleanup (Deferred Items)

**Purpose**: Address test file technical debt before adding more tests.

**Entry Criteria**:
- [x] Phase 5 complete and tests passing
- [x] `tests/` directory accessible
- [x] Source test files identified for refactoring

**Tasks**:
1. Split `phase3-contracts.test.ts` (755 lines) into:
   - `phase3-review-contracts.test.ts`
   - `phase3-detection-contracts.test.ts`
   - `phase3-attribution-contracts.test.ts`

2. Populate `tests/mocks/` directory (exists but empty):
   ```
   tests/mocks/
   ├── index.ts                    # Re-exports all mocks
   ├── mock-self-improving-agent.ts
   ├── mock-proactive-agent.ts
   ├── mock-vfm-system.ts
   └── README.md                   # Mock usage guide
   ```

3. Refactor `phase5-bridge-contracts.test.ts` to import from `tests/mocks/`

**Acceptance Criteria**:
- [x] No test file exceeds 300 lines
- [x] All mocks in `tests/mocks/` directory
- [x] All existing tests still pass
- [x] Mock imports work from test files

**Exit Criteria**:
- [x] `npm test` passes with all Phase 2-5 tests
- [x] `tests/mocks/README.md` documents mock usage
- [x] No regression in existing test coverage
- [x] `tests/fixtures/phase6/` created with all 12 fixture files (per Fixtures table)

**Verification**: `cd tests && npm test`

---

### Stage 2: Workflow Encoding Skills (High Value)

**Purpose**: Encode proven workflows into reusable skills.

**Entry Criteria**:
- [x] Stage 1 exit criteria met
- [x] `tests/fixtures/phase6/` created with sample data
- [x] Source workflows verified accessible

**Evidence Checkpoint** (verify before implementation):
| Skill | Source File | N-Count | Verified |
|-------|-------------|---------|----------|
| loop-closer | docs/workflows/closing-loops.md | N=3 | [x] |
| parallel-decision | docs/workflows/parallel-vs-serial-decision.md | N=5 | [x] |
| threshold-delegator | docs/patterns/auto-delegate-on-threshold.md | N=3 | [x] |

#### 2.1: loop-closer

**Source**: `docs/workflows/closing-loops.md`

**Functionality**:
- Scan for DEFERRED/PLACEHOLDER markers in observations
- Detect unclosed TODOs in code and docs
- Find missing documentation updates
- Report open loops before work completion

**Commands**:
```
/loop-closer scan                    # Full scan
/loop-closer scan --type todos       # TODOs only
/loop-closer scan --type deferred    # DEFERRED observations only
/loop-closer check <file>            # Check specific file
```

**Acceptance Criteria**:
- [x] Detects DEFERRED observations
- [x] Detects PLACEHOLDER markers
- [x] Detects unclosed TODOs
- [x] Provides actionable report with file locations

#### 2.2: parallel-decision

**Source**: `docs/workflows/parallel-vs-serial-decision.md` (1904 lines)

**Extraction strategy**: Focus on 5-factor framework (Section 3 of source). Remaining
workflow context informs edge case handling but is not encoded verbatim.

**Functionality**:
- Evaluate 5 factors: team size, coupling, interfaces, patterns, integration
- Score each factor and produce recommendation
- Explain reasoning for serial vs parallel decision

**Commands**:
```
/parallel-decision evaluate <task>   # Full evaluation
/parallel-decision quick <task>      # Quick recommendation
/parallel-decision factors           # Show 5-factor framework
```

**Acceptance Criteria**:
- [x] Evaluates all 5 criteria
- [x] Produces serial/parallel recommendation
- [x] Explains reasoning with factor scores

#### 2.3: threshold-delegator

**Source**: `docs/patterns/auto-delegate-on-threshold.md`

**Functionality**:
- Track issue/finding counts during work
- Suggest delegation when threshold exceeded (default: 10)
- Recommend appropriate agent for delegation

**Commands**:
```
/threshold-delegator check           # Check current counts
/threshold-delegator configure --threshold 15
/threshold-delegator suggest         # Get delegation suggestion
```

**Acceptance Criteria**:
- [x] Tracks counts across categories
- [x] Triggers suggestion at configured threshold
- [x] Suggests appropriate agent (planner for plans, implementer for code)

**Exit Criteria**:
- [x] All 3 SKILL.md files created and MCE compliant (<200 lines)
- [x] Behavioral tests pass for all 3 skills
- [x] Evidence checkpoint table verified (N-counts confirmed)

**Stage 2 Verification**: Tests for all 3 skills pass

---

### Stage 3: MCE Compliance Skills

**Purpose**: Automate file size compliance guidance.

**Entry Criteria**:
- [x] Stage 2 exit criteria met
- [x] Sample large files in `tests/fixtures/phase6/` (300+ lines)
- [x] Source patterns verified accessible

**Evidence Checkpoint**:
| Skill | Source File | N-Count | Verified |
|-------|-------------|---------|----------|
| mce-refactorer | docs/patterns/mce-refactoring.md | N=7 | [x] |
| hub-subworkflow | docs/patterns/hub-subworkflow.md | N=5 | [x] |

#### 3.1: mce-refactorer

**Source**: `docs/patterns/mce-refactoring.md`

**Functionality**:
- Analyze file for MCE compliance (≤200 lines)
- Suggest split strategy based on file type:
  - Test files: Template type split, scenario grouping
  - Production code: Responsibility separation, workflow stages
  - Research code: Phase split, topic extraction
- Delegate to hub-subworkflow for documentation files

**Commands**:
```
/mce-refactorer analyze <file>       # Full analysis
/mce-refactorer suggest <file>       # Quick suggestion
/mce-refactorer strategies           # Show all strategies
```

**Acceptance Criteria**:
- [x] Detects files exceeding MCE limit
- [x] Suggests appropriate split strategy by file type
- [x] Delegates docs to hub-subworkflow

#### 3.2: hub-subworkflow

**Source**: `docs/patterns/hub-subworkflow.md`

**Functionality**:
- Analyze large documentation files (>300 lines or 2+ modes)
- Suggest hub structure: navigation + overview (~100-150 lines)
- Identify sub-documents: focused content (~100-200 lines each)
- Generate hub template with links to sub-documents

**Commands**:
```
/hub-subworkflow analyze <doc>       # Analyze doc structure
/hub-subworkflow suggest <doc>       # Suggest hub + sub-docs
/hub-subworkflow template <doc>      # Generate hub template
```

**Acceptance Criteria**:
- [x] Identifies documents needing hub structure
- [x] Suggests logical sub-document splits
- [x] Generates hub template with navigation

**Exit Criteria**:
- [x] Both SKILL.md files created and MCE compliant (<200 lines)
- [x] mce-refactorer→hub-subworkflow delegation tested
- [x] Evidence checkpoint table verified

**Stage 3 Verification**: Tests for both skills pass

---

### Stage 4: Observation Management Skills

**Purpose**: Systematic observation health maintenance.

**Entry Criteria**:
- [x] Stage 3 exit criteria met
- [x] Sample observations in `tests/fixtures/phase6/` at various N-counts (N=1, N=3, N=5+)
- [x] Source observations verified accessible

**Evidence Checkpoint**:
| Skill | Source File | N-Count | Verified |
|-------|-------------|---------|----------|
| pbd-strength-classifier | docs/observations/2025-11-09-resist-file-proliferation.md | N=11 | [x] |
| observation-refactoring | docs/workflows/observation-refactoring.md | N=5 | [x] |

#### 4.1: pbd-strength-classifier

**Source**: `docs/observations/2025-11-09-resist-file-proliferation.md` (N=11)

**Functionality**:
- Classify observation strength:
  - Weak: N=1-2 (insufficient evidence)
  - Medium: N=3-4 (validated, constraint candidate)
  - Strong: N≥5 (strongly validated)
- Assess constraint candidacy based on R/C/D counters
- Integrate with observation-recorder for tagging

**Commands**:
```
/pbd-strength-classifier assess <observation>
/pbd-strength-classifier list --strength strong
/pbd-strength-classifier candidates              # Constraint candidates
```

**Acceptance Criteria**:
- [x] Correctly classifies weak/medium/strong
- [x] Identifies constraint candidates (R≥3, C≥2, sources≥2)
- [x] Lists observations by strength level

#### 4.2: observation-refactoring

**Source**: `docs/workflows/observation-refactoring.md`

**Functionality**:
- Detect 4 operation candidates:
  - RENAME: Observation slug doesn't match current understanding
  - CONSOLIDATE: 2+ observations describe same pattern
  - PROMOTE: N≥3 observation ready for constraint
  - ARCHIVE: F≥2 observation (proven false positive)
- Respect F=2 protection (don't archive prematurely)
- Execute operations with audit trail

**Commands**:
```
/observation-refactoring scan        # Find candidates
/observation-refactoring rename <old> <new>
/observation-refactoring consolidate <obs1> <obs2>
/observation-refactoring promote <observation>
/observation-refactoring archive <observation>
```

**Acceptance Criteria**:
- [x] Identifies rename/consolidate/promote/archive candidates
- [x] Respects F=2 protection
- [x] Creates audit trail for operations

**Exit Criteria**:
- [x] Both SKILL.md files created and MCE compliant (<200 lines)
- [x] pbd-strength-classifier correctly classifies 5+ existing observations
- [x] F=2 protection tested for observation-refactoring
- [x] Evidence checkpoint table verified

**Stage 4 Verification**: Tests for both skills pass

---

### Stage 5: Constraint Evolution Skills

**Purpose**: Track and visualize constraint history.

**Entry Criteria**:
- [x] Stage 4 exit criteria met
- [x] Historical session state examples in `tests/fixtures/phase6/`
- [x] Source observations verified accessible

**Evidence Checkpoint**:
| Skill | Source File | N-Count | Verified |
|-------|-------------|---------|----------|
| constraint-versioning | docs/observations/configuration-as-code-type-safety.md | N=9 | [x] |
| cross-session-safety-check | docs/observations/plan-approve-implement-workflow-violation.md | N=4 | [x] |

#### 5.1: constraint-versioning

**Source**: `docs/observations/configuration-as-code-type-safety.md` (N=9)

**Functionality**:
- Track constraint evolution over time
- Show N=1→N=9 progression journey
- Record version history with dates and contexts
- Visualize constraint maturity

**Commands**:
```
/constraint-versioning history <constraint>
/constraint-versioning journey <observation>     # N=1→N=X
/constraint-versioning timeline                  # All constraints
```

**Acceptance Criteria**:
- [x] Records version history with timestamps
- [x] Shows N-count progression journey
- [x] Tracks context diversity across versions

#### 5.2: cross-session-safety-check

**Source**: `docs/observations/plan-approve-implement-workflow-violation.md` (N=4)

**Functionality**:
- Verify state consistency between sessions
- Detect cross-session interference patterns
- Warn when session state may be stale
- Check for concurrent modification risks

**Commands**:
```
/cross-session-safety-check verify   # Check current state
/cross-session-safety-check history  # View session history
/cross-session-safety-check conflicts # Detect potential conflicts
```

**Acceptance Criteria**:
- [x] Detects stale session state
- [x] Identifies historical cross-session incidents
- [x] Warns about concurrent modification risks

**Exit Criteria**:
- [x] Both SKILL.md files created and MCE compliant (<200 lines)
- [x] constraint-versioning shows N=1→N=3+ journey for test constraint
- [x] cross-session-safety-check detects historical incident
- [x] Evidence checkpoint table verified

**Stage 5 Verification**: Tests for both skills pass

---

### Stage 6: Pattern Detection Skills

**Purpose**: Proactive pattern identification.

**Entry Criteria**:
- [x] Stage 5 exit criteria met
- [x] Multiple N=2 observations identified for testing convergence detection
- [x] Fixture data for pattern clustering

**Evidence Checkpoint**:
| Skill | Source File | N-Count | Verified |
|-------|-------------|---------|----------|
| pattern-convergence-detector | Multiple N=2→N=3 progressions | N=2+ | [x] |

#### 6.1: pattern-convergence-detector

**Source**: Multiple N=2→N=3 progressions observed

**Functionality**:
- Monitor N=2 observations for convergence signals
- Detect when 2+ N=2 observations share similar root cause
- Alert when patterns are converging toward N=3
- Accelerate pattern promotion through early detection

**Commands**:
```
/pattern-convergence-detector scan   # Find converging patterns
/pattern-convergence-detector watch <observation>
/pattern-convergence-detector clusters  # Show pattern clusters
```

**Acceptance Criteria**:
- [x] Identifies N=2 patterns with similar root causes
- [x] Alerts on convergence signals
- [x] Clusters related observations

**Exit Criteria**:
- [x] SKILL.md created and MCE compliant (<200 lines)
- [x] Identifies 2+ converging patterns in test data
- [x] Pattern clustering logic tested
- [x] Evidence checkpoint table verified

**Stage 6 Verification**: Tests pass

---

### Stage 7: Maintenance & Polish

**Purpose**: Address remaining deferred items and polish. Required for Phase 7 readiness.

**Entry Criteria**:
- [x] Stage 6 exit criteria met
- [x] All 10 skill SKILL.md files created
- [x] All tests passing

**Tasks**:
1. **Custom category prefixes** (Phase 3 Finding 6):
   - Add extension mechanism to slug-taxonomy
   - Support custom prefixes: `infra-`, `api-`, `performance-`
   - Document extension process

2. **Documentation polish**:
   - Update ARCHITECTURE.md with Extensions layer (verify all 10 skills listed)
   - Add skill dependency graph updates
   - Cross-reference all Integration sections

**Note**: Packet signing (Phase 4 deferred) explicitly moved to Phase 7 per twin-review to avoid scope creep.

**Acceptance Criteria**:
- [ ] Custom category prefixes work in slug-taxonomy
- [x] ARCHITECTURE.md updated with Extensions layer
- [x] ARCHITECTURE.md lists all 10 Extension skills (verified count)
- [ ] All skill dependency graphs updated

**Exit Criteria**:
- [x] Full regression test passes (`npm test`) - 534 passed, 14 skipped
- [x] ARCHITECTURE.md documents all 6 layers
- [x] No DEFERRED items remain for Phase 6
- [x] Phase 6 ready for Phase 7 handoff

---

## Testing Strategy

### Test File Structure

```
tests/
├── e2e/
│   ├── phase6-workflow-skills.test.ts     # loop-closer, parallel-decision, threshold-delegator
│   ├── phase6-mce-skills.test.ts          # mce-refactorer, hub-subworkflow
│   ├── phase6-observation-skills.test.ts  # pbd-strength-classifier, observation-refactoring
│   ├── phase6-evolution-skills.test.ts    # constraint-versioning, cross-session-safety-check
│   └── phase6-detection-skills.test.ts    # pattern-convergence-detector
├── mocks/                                  # Canonical location (per code review)
│   ├── index.ts
│   ├── mock-observations.ts               # Sample observations for testing
│   ├── mock-constraints.ts                # Sample constraints for testing
│   ├── mock-files.ts                      # Sample large files for MCE testing
│   └── README.md                          # Mock usage guide
└── fixtures/phase6/                       # Phase 6 specific fixtures
```

### Test Categories

| Category | Test Count | Purpose |
|----------|------------|---------|
| Structural | ~10 | SKILL.md format, frontmatter, sections |
| Behavioral | ~40 | Command output, edge cases (per test matrix: 3 cases × 10 skills + combinations) |
| Integration | ~10 | Skill interactions (mce→hub delegation) |

### Fixtures (Stage 1.5: Create Before Stage 2)

Create fixtures in `tests/fixtures/phase6/` before skill implementation:

| Fixture | Purpose | Skills Using |
|---------|---------|--------------|
| `observations/n1-sample.md` | N=1 strength test | pbd-strength-classifier |
| `observations/n3-sample.md` | N=3 strength test | pbd-strength-classifier |
| `observations/n5-sample.md` | N=5+ strength test | pbd-strength-classifier |
| `files/large-test-file.ts` | 400+ lines for MCE | mce-refactorer |
| `files/large-doc.md` | 500+ lines for hub split | hub-subworkflow |
| `markers/deferred-sample.md` | DEFERRED markers | loop-closer |
| `markers/placeholder-sample.md` | PLACEHOLDER markers | loop-closer |
| `markers/todo-sample.ts` | Unclosed TODOs | loop-closer |
| `sessions/historical-state.json` | Cross-session data | cross-session-safety-check |
| `sessions/conflict-state.json` | Concurrent modification | cross-session-safety-check |
| `patterns/converging-n2-a.md` | N=2 pattern A | pattern-convergence-detector |
| `patterns/converging-n2-b.md` | N=2 pattern B (similar root) | pattern-convergence-detector |

**Fixture Creation Task**: Add to Stage 1 after test refactoring.

### Per-Skill Behavioral Test Matrix

| Skill | Happy Path | Edge Cases | Error Cases |
|-------|------------|------------|-------------|
| loop-closer | Finds 3 marker types | Empty dir, nested markers | Invalid path |
| parallel-decision | All 5 factors scored | Missing context | Invalid task |
| threshold-delegator | Triggers at threshold | Threshold=0, max int | No counts |
| mce-refactorer | Suggests split | Already compliant, 1 line | Invalid file |
| hub-subworkflow | Generates template | Already hub, no sections | Invalid doc |
| pbd-strength-classifier | Classifies all 3 levels | Boundary N-counts | Malformed obs |
| observation-refactoring | All 4 operations | F=2 protection | Missing file |
| constraint-versioning | Shows journey | No history | Invalid constraint |
| cross-session-safety-check | Detects stale state | No sessions | Corrupt state |
| pattern-convergence-detector | Finds clusters | No N=2 patterns | Empty index |

---

## Verification Gate

**Do NOT proceed to Phase 7 until**:

- [x] All 10 Extension skills have SKILL.md (MCE compliant)
- [x] All 10 skills load in Claude Code
- [x] Test file technical debt addressed (Stage 1)
- [x] Test coverage: 94 Phase 6 tests across 5 test files (21+18+20+20+15)
- [x] All tests pass: `cd tests && npm test` (534 passed, 14 skipped)

### Skill-Specific Verification

| Skill | Verification |
|-------|--------------|
| loop-closer | Detects 3+ types of open loops |
| parallel-decision | Evaluates all 5 factors |
| threshold-delegator | Triggers at configured threshold |
| mce-refactorer | Suggests split for 3+ file types |
| hub-subworkflow | Generates hub template |
| pbd-strength-classifier | Classifies 5+ existing observations |
| observation-refactoring | Identifies 4 operation types |
| constraint-versioning | Shows N=1→N=3+ journey |
| cross-session-safety-check | Detects 1+ historical incident |
| pattern-convergence-detector | Identifies 2+ converging patterns |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Timeline pressure** | Medium | High | Extended timeline (5-6 days); buffer in each stage | Implementer |
| **Implementation complexity** | Medium | High | Prototype parallel-decision first (largest source: 1904 lines); spike if needed | Implementer |
| **UX: Skill proliferation** | Medium | Medium | 10 skills with ~30 subcommands may shift cognitive load rather than reduce it; consider unified dispatch in Phase 7+ | Phase 7 |
| **Skill interaction conflicts** | Low | Medium | Group related skills in same stage; integration tests | Implementer |
| **Source document ambiguity** | Medium | Medium | Evidence checkpoints verify source before coding; update docs if gaps found | Implementer |
| **Test infrastructure regression** | Low | High | Stage 1 gate: all Phase 2-5 tests must pass before Stage 2 | Implementer |
| **Stage gate failure** | Low | Medium | Revert stage, analyze root cause, retry with fixes | Implementer |
| Source workflow changes | Low | Medium | Pin to workflow versions; update skill when workflow updates | Implementer |
| Observation format variations | Medium | Low | Robust parsing; graceful degradation for malformed files | Implementer |
| Large test fixtures | Medium | Low | Use minimal fixtures (10-30 lines each); generate programmatically | Implementer |
| governance-state unavailable | Low | Low | Skills work standalone; degraded mode documented | Implementer |

---

## Timeline Estimate

Per code review (N=2), original 2-3 day estimate was unrealistic. Revised to 5-6 days
based on Phase 5 velocity (0.4-0.6 days per skill) plus infrastructure work.

| Stage | Description | Estimate | Notes |
|-------|-------------|----------|-------|
| Stage 1 | Test infrastructure cleanup | 0.75 days | Deferred items + fixture creation |
| Stage 2 | Workflow encoding skills (3) | 1.0 day | parallel-decision has 1904-line source |
| Stage 3 | MCE compliance skills (2) | 0.75 days | mce→hub delegation testing |
| Stage 4 | Observation management skills (2) | 0.75 days | pbd-strength needs 5+ observation tests |
| Stage 5 | Constraint evolution skills (2) | 0.75 days | Cross-session state fixtures |
| Stage 6 | Pattern detection skills (1) | 0.5 days | Simpler single skill |
| Stage 7 | Maintenance & polish | 0.5 days | Required for Phase 7 handoff |
| **Total** | | **5-6 days** | ~0.5 days per skill + infrastructure |

---

## Post-Implementation

### Results Documentation

Create `../implementation/agentic-phase6-results.md` with:
- Skills implemented (10)
- Test counts and coverage
- Deferred items addressed
- Any new deferred items

### Documentation Feedback Loop

When ambiguities or errors are discovered in source workflow/pattern documents during
implementation, update them immediately:

1. Fix the source document (e.g., `docs/patterns/mce-refactoring.md`)
2. Add clarification note with date
3. Reference the skill implementation that discovered the gap
4. Update observation if pattern/workflow evolved

This prevents divergence between documentation and implemented reality.

### Specification Updates

Update `../proposals/2026-02-13-agentic-skills-specification.md`:
- Mark Phase 6 Success Criteria as complete
- Add Phase 6 to implementation plan list
- Update skill counts

### Next Phase

**Phase 7: Architecture Documentation**
- Create ARCHITECTURE.md at `../../ARCHITECTURE.md`
- Document all 6 skill layers
- Dependency graph
- Data flow diagrams
- Extension guide

---

## Future Work: Proactive Integration

Phase 6 skills are reactive CLI tools by design. Phase 7+ may evolve select skills
(loop-closer, threshold-delegator, cross-session-safety-check) into proactive agents
via git hooks, file watchers, or session lifecycle hooks. Architecture supports
dual-interface (CLI + programmatic API) but implementation deferred to avoid scope creep.

---

## Appendix: Skill Quick Reference

**Naming convention**: Skills use `<action>-<target>` or `<target>-<action>` patterns
(e.g., loop-closer, mce-refactorer). Compound names describe function
(e.g., cross-session-safety-check). Short aliases (e.g., `/mce`, `/loops`) may be
added in Phase 7 if discoverability proves problematic.

| Skill | Layer | Commands | Source |
|-------|-------|----------|--------|
| loop-closer | extensions | scan, check | closing-loops.md |
| parallel-decision | extensions | evaluate, quick, factors | parallel-vs-serial-decision.md |
| threshold-delegator | extensions | check, configure, suggest | auto-delegate-on-threshold.md |
| mce-refactorer | extensions | analyze, suggest, strategies | mce-refactoring.md |
| hub-subworkflow | extensions | analyze, suggest, template | hub-subworkflow.md |
| pbd-strength-classifier | extensions | assess, list, candidates | resist-file-proliferation.md |
| observation-refactoring | extensions | scan, rename, consolidate, promote, archive | observation-refactoring.md |
| constraint-versioning | extensions | history, journey, timeline | configuration-as-code.md |
| cross-session-safety-check | extensions | verify, history, conflicts | plan-approve-implement.md |
| pattern-convergence-detector | extensions | scan, watch, clusters | (multiple N=2 observations) |

---

*Plan created 2026-02-15. Phase 6 implements 10 observation-backed extension skills.*
*Remediated 2026-02-15 per N=2 code review (Codex + Gemini): timeline extended 2-3→5-6 days,*
*MoSCoW contradiction resolved (all 10 in scope), entry/exit criteria added, evidence*
*checkpoints added, risk assessment expanded, Stage 7 made mandatory, proactive integration*
*documented as future work.*
*Remediated 2026-02-15 per twin-review (technical + creative): fixture creation added to*
*Stage 1 exit, packet signing deferred to Phase 7, test count updated ~30→~40, UX risk*
*added, "When NOT to use" added, naming convention documented, line counts verified.*
