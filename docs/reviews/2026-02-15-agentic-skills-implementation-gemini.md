# Agentic Skills Implementation Review - Gemini

**Date**: 2026-02-15
**Reviewer**: Gemini 2.5 Pro (gemini-25pro-validator)
**Files Reviewed**: 48 SKILL.md files, 13 test files, ARCHITECTURE.md, specification
**Mode**: flexible (explored beyond scout context file)

## Summary

The agentic skills implementation is **architecturally complete** but **behaviorally incomplete**. All 47 specified skills exist as SKILL.md specifications with contract tests, but the "semantic classification over pattern matching" requirement - the core differentiator per the specification - is documented rather than implemented. The system provides excellent documentation and test scaffolding for a future implementation.

## Findings

### Critical

**C-1: Semantic Classification Unimplemented**

The specification's primary requirement states: "All agentic skills MUST use LLM-based semantic similarity for matching and classification. Pattern matching (string/glob/regex) is prohibited for safety-critical operations."

**Evidence**: The test file `tests/e2e/skill-behavior.test.ts` (lines 43-48) defines:
```typescript
const USE_REAL_LLM = process.env.USE_REAL_LLM === 'true';
const describeWithLLM = USE_REAL_LLM ? describe : describe.skip;
```

This shows Tier 3 LLM tests are scaffolded but skipped by default. The current implementation uses TypeScript fixture-based logic, not actual semantic classification. Skills like `constraint-enforcer`, `severity-tagger`, and `failure-detector` that claim semantic classification rely on deterministic code paths.

**Gap**: The system's intelligence is documented but not implemented. The specification promises LLM-based semantic matching; the implementation provides fixture-based structural matching.

**Impact**: False sense of security - users believe they have semantic classification when they have pattern matching with extra steps.

---

**C-2: Specification vs Implementation Terminology Mismatch**

The specification (lines 455-483) defines a **provisional implementation for RG-6** with attribution confidence thresholds:
- >= 0.7 = Attributed
- 0.4-0.7 = Uncertain
- < 0.4 = Unattributable

**Evidence**: Searching SKILL.md files, `failure-detector/SKILL.md` is marked "Provisional (RG-6)" but the actual confidence scoring mechanism is not implemented - it's documented as future work.

**Gap**: The specification's provisional design assumes working confidence scoring that doesn't exist. The system cannot distinguish attributed from unattributable failures.

---

### Important

**I-1: Tests Validate Reference Implementation, Not Production Runtime**

**Evidence**: `tests/e2e/phase5-bridge-contracts.test.ts` (lines 1-31) explicitly states:
```typescript
* CONTRACT TESTS - NOT INTEGRATION TESTS
*
* What these tests DO NOT validate:
*   - Real ClawHub component behavior
*   - End-to-end data flow through actual agents
*   - Production error handling
*   - Real integration (deferred to Phase 5b when ClawHub exists)
```

**Gap**: The 534 passing tests validate mock implementations, not actual skill behavior. The business logic lives in test helper functions. There is no runtime - SKILL.md files are specifications, not executable code.

**Impact**: High risk of divergence between tested reference implementation and future production code. No verification that actual skills behave as specified.

---

**I-2: Extension Layer Skills Are "Spec + Test Only"**

**Evidence**: ARCHITECTURE.md (lines 455-459):
```markdown
**Implementation Note**: Phase 6 is **specification + contract testing** only. Each skill has:
- SKILL.md specification defining behavior and CLI interface
- Contract tests with mock implementations verifying data contracts
- No runtime CLI wrapper code (deferred to Phase 7+)
```

**Gap**: 10 of 47 skills have no implementation at all - they are pure documentation. The "Implemented" checkmarks in ARCHITECTURE.md mean "spec written and tested against mocks," not "working code exists."

**Impact**: Users expecting executable `/mce-refactorer analyze <file>` will find no such command exists.

---

**I-3: Bridge Layer Depends on Non-Existent External Systems**

**Evidence**: All 5 Bridge skills (`learnings-n-counter`, `feature-request-tracker`, `wal-failure-detector`, `heartbeat-constraint-check`, `vfm-constraint-scorer`) use mock adapters. Real integration awaits "Phase 5b when ClawHub exists."

**Gap**: Bridge layer is architecturally designed but functionally dead-end. Mock adapters work perfectly but integrate with nothing real.

---

### Minor

**M-1: R/C/D Counters Narrowly Scoped**

**Evidence**: Only 6 of 48 SKILL.md files reference `r_count`/`c_count`/`d_count`:
- failure-tracker (core)
- constraint-generator (core)
- observation-recorder (core)
- evidence-tier (detection)
- pbd-strength-classifier (extensions)
- constraint-versioning (extensions)

**Gap**: The specification implies R/C/D counters are a system-wide feature. In practice, they're limited to the failure-to-constraint lifecycle. This is correct behavior but could be clearer in documentation.

---

**M-2: Acceptance Criteria Checkbox Convention Inconsistent**

**Evidence**: Phase 1-2 skills have unchecked boxes (`- [ ]`); Phase 3+ skills have checked boxes (`- [x]`). ARCHITECTURE.md (lines 746-757) explains this is intentional ("specs as immutable documentation" vs "contract-tested skills").

**Gap**: Confusing UX - unchecked boxes suggest work remaining when they actually indicate "spec only, not tracked."

---

**M-3: ARCHITECTURE.md Exceeds MCE Limits**

**Evidence**: ARCHITECTURE.md is 821 lines. The specification's MCE limit for documentation is 300 lines (mce-refactorer/SKILL.md line 59).

**Gap**: The document that explains MCE compliance itself exceeds MCE limits. This is noted as "accepted technical debt" but creates a poor precedent.

---

**M-4: Missing "When NOT to Use" Sections**

**Evidence**: Phase 7 results (line 968) document that 8 of 10 extension skills lack "When NOT to use" sections. Only `parallel-decision` and `mce-refactorer` have them.

**Gap**: Self-documenting skills principle not fully applied. Users may misapply skills without counter-indication guidance.

---

## Architectural Concerns

### Assumption Risk: "Specification = Implementation"

The entire system operates on the assumption that a future runtime will perfectly implement what's documented in SKILL.md files. This creates three risks:

1. **No enforcement**: Nothing prevents implementation divergence
2. **False confidence**: 534 passing tests validate mocks, not reality
3. **Documentation decay**: SKILL.md files will become stale as real implementation evolves

### Deferred Complexity

Multiple critical components are marked "deferred":
- Semantic classification (Tier 3 LLM tests)
- ClawHub integration (Phase 5b)
- CLI wrappers for Extensions (Phase 7+)
- Real adapter implementations (Phase 5b)

This creates a "paper architecture" - comprehensive on paper, hollow in practice.

### Alternative Framing

**Question**: Is building 47 specifications before any runtime the right approach?

The current approach optimizes for:
- Documentation completeness
- Contract test coverage
- Architectural coherence

At the cost of:
- Executable functionality
- Real-world validation
- User-testable behavior

For a 2-person team, a "thinner slice deeper" approach (fewer skills, fully implemented) might deliver value faster than "broader coverage shallower" (all skills, spec-only).

## Verification Status

| Phase | Skills | SKILL.md | Tests | Runtime | Verdict |
|-------|--------|----------|-------|---------|---------|
| 1 (Foundation) | 5 | Complete | Pass | None | Spec-only |
| 2 (Core) | 9 | Complete | Pass | None | Spec-only |
| 3 (Review/Detection) | 10 | Complete | Pass | None | Spec-only |
| 4 (Governance/Safety) | 9 | Complete | Pass | None | Spec-only |
| 5 (Bridge) | 5 | Complete | Pass | Mocks | Integration-blocked |
| 6 (Extensions) | 10 | Complete | Pass | None | Explicitly deferred |
| **Total** | **48** | **100%** | **534/534** | **0%** | **Paper architecture** |

## Recommendations

1. **Implement semantic classification for one skill end-to-end** before claiming the system uses semantic classification
2. **Clarify "Implemented" terminology** - distinguish "spec complete" from "runtime exists"
3. **Prioritize depth over breadth** - get 5 skills fully working before documenting 47
4. **Remove or caveat "semantic classification" claims** until Tier 3 LLM tests pass

## Raw Output

<details>
<summary>Full Gemini CLI output</summary>

I will begin by outlining a plan to investigate the codebase and validate the implementation against the specification. The focus will be on identifying discrepancies, particularly in areas like semantic classification, R/C/D counters, and test coverage depth.

First, I will analyze the structure of a representative `SKILL.md` file and its corresponding test file to understand the project's conventions. I'll start with the `circuit-breaker` skill. I'll read the `SKILL.md` file first.

Okay, I'll begin by reading the `SKILL.md` file for the `circuit-breaker` to understand the documentation structure.

The `circuit-breaker/SKILL.md` is well-structured with clear metadata, a detailed state machine, integration points, and acceptance criteria, fulfilling several specification requirements. Now, I will locate the corresponding test file by searching for "circuit-breaker" within the `tests` directory to verify the implementation.

`skill-behavior.test.ts` appears more relevant, with a dedicated "circuit-breaker behavior" block. I'll analyze it to assess the test depth, per my third focus area.

I've analyzed the first 2000 lines of `tests/e2e/skill-behavior.test.ts`, revealing a three-tier testing approach with conditional live LLM tests, and, crucially, that the file contains the core business logic implementation, not just test code. With the file structure now understood, I will proceed to verify the semantic classification capability by searching the entire file for the Tier 3 tests, which I suspect are located after the initial 2000 lines. First, I'll update my TODO list.

Okay, finding Tier 3 tests. Searching `tests/e2e/skill-behavior.test.ts` for `describeWithLLM` to see how semantic skills are tested.

`describeWithLLM` exists at line 3397. I'll read from line 3390 to the end of the file to understand the semantic tests.

I've found the `describeWithLLM` block reveals a critical issue: semantic classification is merely scaffolded with `// TODO` comments, not implemented. The system currently relies on TypeScript-based fixtures, failing to meet its core "semantic classification" promise. Next, I'll search all `SKILL.md` files for R/C/D counter documentation to assess that feature's status.

Okay, searching SKILL.md files for `r_count` to check for R/C/D counter implementation.

`r_count` is in 6 `SKILL.md` files, primarily in the core layer, including key skills. Now checking for `c_count` and `d_count`'s presence.

`c_count` is in those files. Now, `d_count`.

**Finding 2: R/C/D Counters Documented, Inconsistently Applied (MINOR)**

R/C/D counters exist in core skills documentation and are tested, fulfilling the specification for the failure/observation lifecycle. However, their absence from most `SKILL.md` files indicates a narrower application than implied, a minor documentation inconsistency.

**Next, Task 4: Assess Test Coverage Depth.**

My analysis of `skill-behavior.test.ts` shows it tests a reference implementation within the test file itself--more unit than integration testing. I'll now examine `phase5-bridge-contracts.test.ts` to see if the testing strategy differs for bridge layer skills.

Okay, reading `tests/e2e/phase5-bridge-contracts.test.ts` to check the bridge-layer skill testing strategy.

The bridge contract tests are explicitly not integration tests; they use local mocks to validate data contracts and in-memory logic, not real-world I/O or component behavior.

**Finding 3: Tests Validate Mock Reference, Not Real Implementation (IMPORTANT)**

The test suite validates a TypeScript reference implementation, not the actual skill runtime. This is great for verifying the spec and data contracts, but it means there's no assurance the production skills behave as tested. Bugs in the real implementation's runtime aspects wouldn't be caught, a major risk.

This architectural choice assumes the real implementation perfectly mirrors the tested logic.

Now to the final task: investigating the circuit breaker's "5 violations in 30 days" logic, which I've seen documented in the `SKILL.md` and tested in the reference implementation.

Investigations are complete. My findings: semantic classification is unimplemented (critical); R/C/D counters are inconsistently applied (minor); and tests validate a mock, not the real system (important). The circuit breaker logic, however, is well-documented and tested in the reference implementation. I will now synthesize these findings into a final report, highlighting gaps, wrong assumptions, and providing severity ratings.

Based on my review of the provided codebase, here are the key findings regarding the gaps between the Agentic Skills Specification and the implementation.

### Finding 1: Semantic Classification is a-Specification, Not an-Implementation
*   **Severity:** `CRITICAL`
*   **Description:** The specification's primary requirement for "semantic classification over pattern matching" is not met in the current codebase. The "Tier 3: Live LLM Tests" in `tests/e2e/skill-behavior.test.ts` are merely placeholders, containing `TODO` comments instead of actual LLM or embedding service calls.
*   **Evidence:** The test file `tests/e2e/skill-behavior.test.ts` (line 3397 onwards) contains test blocks like `describeWithLLM` that are skipped by default and contain no active logic.
*   **Gap:** This is the most significant gap. Core skills like `constraint-enforcer`, `severity-tagger`, and `failure-tracker` currently rely on deterministic logic and fixture data, not the promised semantic analysis. The system's intelligence is documented but not implemented.

### Finding 2: Test Suite Validates a Reference Implementation, Not Production Code
*   **Severity:** `IMPORTANT`
*   **Description:** The test suite's design is to validate a TypeScript-based reference implementation of the skills' logic, which is co-located with the tests themselves (in helper functions and mock classes). It does not perform integration or contract testing against the actual skill runtime (e.g., a CLI tool).
*   **Evidence:** The core business logic for skills like the circuit breaker and constraint lifecycle is defined in utility functions within `tests/e2e/skill-behavior.test.ts`. The bridge layer tests in `tests/e2e/phase5-bridge-contracts.test.ts` explicitly state they use "LOCAL MOCK IMPLEMENTATIONS" and do not validate real component behavior.
*   **Gap:** This reveals a key architectural assumption: that the production implementation will perfectly mirror the logic in the test suite's reference implementation. There is a significant risk that the documented and tested logic could diverge from the real-world behavior of the skills, as there are no tests to verify the actual implementation's behavior.

### Finding 3: R/C/D Counters Are Implemented but Narrowly Scoped
*   **Severity:** `MINOR`
*   **Description:** The Recurrence, Confirmation, and Disconfirmation (R/C/D) counter system is successfully documented and tested for the core failure-to-constraint lifecycle. Key skills like `failure-tracker` and `constraint-generator` use these counters to determine eligibility for promoting a failure to a constraint.
*   **Evidence:** `r_count`, `c_count`, and `d_count` are present in the `SKILL.md` files for core skills and the logic (`R>=3, C>=2`) is validated in `tests/e2e/skill-behavior.test.ts`.
*   **Gap:** The counters are not a universal feature present in all 48 skills. Their application is limited to a specific workflow. This is not a functional deficit but a documentation clarity issue; the specification might imply a broader use of R/C/D than is actually implemented. The implementation meets the requirement for the intended workflow.

</details>

---

*Review completed 2026-02-15. Gemini 2.5 Pro via gemini-25pro-validator agent.*
