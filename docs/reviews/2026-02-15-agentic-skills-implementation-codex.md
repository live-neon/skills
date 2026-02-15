# Agentic Skills Implementation Review - Codex

**Date**: 2026-02-15
**Reviewer**: codex-gpt51-examiner (GPT-5.1 Codex Max)
**Files Reviewed**:
- `../proposals/2026-02-13-agentic-skills-specification.md` (1459 lines)
- `../../ARCHITECTURE.md` (821 lines)
- 48 SKILL.md files in `projects/live-neon/skills/agentic/`
- 13 test files in `projects/live-neon/skills/tests/e2e/`

## Summary

The agentic skills implementation achieves specification completeness (47/47 skills + 1 extra) with comprehensive contract test coverage (534 tests). However, the implementation is **specification-only** - SKILL.md files define behavior but no runtime code exists. The mock-heavy testing strategy validates data contracts but not actual system behavior.

## Findings

### Critical

1. **No Runtime Implementation Exists** (ARCHITECTURE.md:455-458)
   - Phase 6 explicitly states: "specification + contract testing ONLY"
   - Skills are CLI specifications without executable code
   - System cannot perform any agentic actions beyond test mocks
   - **Impact**: The 47 "implemented" skills are actually 47 specifications

2. **Zero Integration Test Coverage** (tests/e2e/*.test.ts)
   - All 534 tests use local mock implementations
   - No tests validate real adapter behavior
   - Bridge layer ClawHub integration is entirely mocked
   - **Impact**: No proof that governance/bridge patterns work in practice

### Important

3. **Research Gate Exit Criteria Unmet** (ARCHITECTURE.md:321-342)
   - RG-2 (Multi-agent coordination): Provisional, single-agent mode only
   - RG-4 (Constraint decay): Provisional, manual retirement only
   - RG-6 (Failure attribution): Provisional, single-cause only
   - governance-state/SKILL.md:100-133 documents 5-min TTL locking without recovery strategy
   - **Impact**: Governance depends on unproven locking; multi-agent use blocked

4. **Unchecked Acceptance Criteria Pattern** (agentic/*/SKILL.md)
   - 183 unchecked boxes (`- [ ]`) across 24 Foundation/Core layer files
   - 199 checked boxes (`- [x]`) across 25 Phase 3+ files
   - ARCHITECTURE.md:744-757 documents this as intentional convention
   - **Impact**: Confusing - appears incomplete but is by design

5. **Mock Adapter Interface Drift Risk** (agentic/bridge/*/SKILL.md)
   - Bridge skills define interfaces for ClawHub components
   - No validation against real API schemas/auth/error surfaces
   - vfm-constraint-scorer/SKILL.md:234-244 shows adapter pattern
   - **Impact**: Real integration may fail despite passing tests

6. **Single-Agent Governance Lock Risk** (governance-state/SKILL.md:104-132)
   - 5-minute TTL with 60-second heartbeat refresh
   - No documented recovery for crashed agents holding stale locks
   - Fail-fast rejects concurrent writes without retry
   - **Impact**: Could dead-end under load if TTL/cleanup misbehaves

### Minor

7. **No Observability for Lock State** (governance-state/SKILL.md)
   - Lock file format documented but no metrics/logging specified
   - Cannot diagnose coordination failures without adding instrumentation
   - **Impact**: Debugging multi-agent issues will be difficult

8. **Test Scope Narrow Despite High Count** (tests/e2e/)
   - 534 tests sound comprehensive but validate contracts only
   - Missing smoke/system test suite for end-to-end validation
   - **Impact**: False confidence in test coverage

9. **Skill Layer vs Category Confusion** (ARCHITECTURE.md:62-71)
   - Directory (core/, review/) reflects category
   - Layer (Foundation, Core) reflects dependency
   - positive-framer is in detection/ but is Foundation layer
   - **Impact**: May confuse contributors about dependency rules

## Raw Output

<details>
<summary>Full CLI output from Codex review</summary>

```
## CRITICAL FINDINGS (blocking issues)
- Skill runtime absent: SKILL.md specs exist but no executable skill
  implementations, so agentic system cannot perform actions beyond mocks.
- Tests are solely contract/mocked; zero integration coverage with real
  adapters means no proof that governance/bridge patterns work in practice.

## IMPORTANT FINDINGS (should address)
- Provisional research gates (RG-2/4/6) lack exit completion; governance
  depends on unproven pessimistic locking and could dead-end if
  TTL/cleanup misbehaves under load.
- Single-agent governance with file-based 5-min TTL locking risks stale
  locks and no recovery strategy; no evidence of multi-agent contention
  handling beyond fail-fast.
- Bridge layer relies on mock adapter pattern for ClawHub; no validation
  of real API schemas/auth/error surfaces, so interface drift risk is
  unmitigated.
- Unchecked acceptance criteria across SKILL.md means requirements
  traceability is unclear; readiness of each skill cannot be asserted.

## MINOR FINDINGS (nice to have)
- No observability/contracts around lock state (metrics/logging) to
  diagnose coordination failures.
- Research gate criteria and mock behaviors are not cross-referenced;
  potential divergence between test mocks and gate assumptions.
- Tests count high (534) but scope narrow (contracts/workflow); missing
  smoke/system suite noted but not queued.

## ALTERNATIVE FRAMING
- Are we optimizing specs over delivery? Without runnable skills, should
  effort shift from enumerating SKILL.md to implementing minimal vertical
  slices?
- Does pessimistic locking fit the target concurrency model, or would
  idempotent tasks with optimistic retries reduce stale-lock risk?
- Should research gates be reframed as feature flags with telemetry so
  provisional paths can be exercised and measured instead of blocked?
- Are mocks masking integration complexity with ClawHub—would a thin
  real adapter contract test (against a captured schema) give better
  signal?
```

</details>

## Alternative Framing

The Codex review raised important strategic questions:

**Are we solving the right problem?**

1. **Specs vs Delivery**: The implementation is 47 specifications with zero runtime code. Should effort shift from documenting more SKILL.md files to implementing minimal vertical slices that actually execute?

2. **Contract Tests vs Integration**: 534 tests validate data contracts with mocks. Would a single real integration test against ClawHub provide more confidence than 500 mock tests?

3. **Pessimistic vs Optimistic**: The governance locking uses pessimistic fail-fast. For a 2-person team, would idempotent operations with optimistic retries be simpler and safer?

4. **Research Gates as Blockers**: RG-2/4/6 are "provisional" but effectively blocked. Could these be feature flags with telemetry instead, allowing the paths to be exercised and measured?

**Unquestioned Assumptions**:
- Assumption: Skills must be specifications before implementation (but spec-only has zero runtime value)
- Assumption: Mock adapters are sufficient for testing (but integration risk is unmitigated)
- Assumption: Single-agent is acceptable for now (but governance design assumes eventual multi-agent)

## Verification Notes

| Check | Result |
|-------|--------|
| 47 skills per specification | Pass (48 exist: +pattern-convergence-detector) |
| ARCHITECTURE.md accuracy | Pass (6 layers documented, dependency rules clear) |
| Test coverage claims | Partial (534 tests, but contract-only, no integration) |
| Research gate handling | Pass (RG-2/4/6 provisional with exit criteria) |
| Dependency graph | Pass (verified against 12-skill sample per Phase 7 results) |

---

*Review completed 2026-02-15 using Codex CLI v0.63.0 with gpt-5.1-codex-max model.*
