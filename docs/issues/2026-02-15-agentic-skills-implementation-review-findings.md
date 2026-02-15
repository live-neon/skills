---
created: 2026-02-15
resolved: 2026-02-15
type: issue
scope: internal
status: resolved
priority: high
related_reviews:
  - ../reviews/2026-02-15-agentic-skills-implementation-codex.md
  - ../reviews/2026-02-15-agentic-skills-implementation-gemini.md
related_spec: ../proposals/2026-02-13-agentic-skills-specification.md
related_architecture: projects/live-neon/skills/ARCHITECTURE.md
related_results:
  - projects/live-neon/skills/docs/implementation/agentic-phase7-results.md
related_observations:
  - docs/observations/code-review-feedback.md
---

# Issue: Agentic Skills Implementation Review Findings (N=2)

## Summary

External code review (N=2: Codex + Gemini) of the agentic skills implementation identified
significant gaps between specification promises and actual implementation. The system is
architecturally complete (47 skills documented) but behaviorally incomplete (zero runtime
code, semantic classification unimplemented).

**Core Finding**: The implementation is a "paper architecture" - comprehensive documentation
and 534 passing tests, but zero executable runtime. Skills are specifications, not code.

## Findings by Severity

### Critical (3)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| C-1 | No runtime implementation - skills are specs only | Both | N=2 | Documented |
| C-2 | Tests validate mocks, not runtime behavior | Both | N=2 | Documented |
| C-3 | Semantic classification unimplemented (core differentiator) | Gemini | N=2 (verified) | Documented |

### Important (6)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| I-1 | Research gates RG-2/4/6 remain provisional with no timeline | Codex | N=2 (verified) | Accepted |
| I-2 | Extension layer is spec-only (10 skills, Phase 7+ runtime) | Both | N=2 | Documented |
| I-3 | Bridge layer blocked on non-existent ClawHub | Both | N=2 | Accepted |
| I-4 | Mock adapter interface drift risk - no schema validation | Codex | N=1 | Deferred (Phase 5b) |
| I-5 | Single-agent governance lock risk (5-min TTL, no recovery) | Codex | N=1 | Deferred (RG-2) |
| I-6 | 8/10 extension skills missing "When NOT to use" sections | Gemini | N=2 (verified) | Resolved |

### Minor (5)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| M-1 | Unchecked acceptance criteria pattern (Phase 1-2 vs 3+) | Both | N=2 | Documented |
| M-2 | R/C/D counters narrowly scoped to 6 skills | Gemini | N=1 | Accepted |
| M-3 | ARCHITECTURE.md exceeds MCE limit (821 vs 300 lines) | Gemini | N=2 (verified) | Accepted |
| M-4 | No observability for lock state (metrics/logging) | Codex | N=1 | Deferred (RG-2) |
| M-5 | Skill layer vs category confusion in directory structure | Codex | N=1 | Documented |

## Evidence: N=1 to N=2 Verification

### C-3: Semantic classification unimplemented (N=2 Verified)

**Gemini finding**: Tier 3 LLM tests are scaffolded but skipped by default.

**Codebase verification** (`tests/e2e/skill-behavior.test.ts`):
```typescript
// Lines 43-48
const USE_REAL_LLM = process.env.USE_REAL_LLM === 'true';
const describeWithLLM = USE_REAL_LLM ? describe : describe.skip;

// Line 3397
describeWithLLM('Tier 3: Live LLM Tests', () => {
```

**Confirmed**: LLM tests exist but are skipped. The system uses fixture-based matching, not semantic classification.

### I-1: Research gates provisional (N=2 Verified)

**Codex finding**: RG-2, RG-4, RG-6 remain provisional with exit criteria but no timeline.

**Codebase verification** (`ARCHITECTURE.md:328-330`):
```markdown
| RG-2 | Multi-agent coordination | Provisional | Coordination strategy implemented... |
| RG-4 | Constraint decay | Provisional | Decay curve calibrated... |
| RG-6 | Failure attribution | Provisional | Multi-causal detection added... |
```

**Confirmed**: All three research gates are provisional with documented exit criteria but no completion timeline.

### I-6: Missing "When NOT to use" sections (N=2 Verified)

**Gemini finding**: 8 of 10 extension skills lack "When NOT to use" sections.

**Codebase verification** (grep for "When NOT to Use"):
- Found in 2 files: `mce-refactorer/SKILL.md`, `parallel-decision/SKILL.md`
- Missing from 8 files: loop-closer, threshold-delegator, hub-subworkflow, pbd-strength-classifier, observation-refactoring, constraint-versioning, cross-session-safety-check, pattern-convergence-detector

**Confirmed**: 8/10 extension skills missing guidance.

### M-3: ARCHITECTURE.md exceeds MCE (N=2 Verified)

**Gemini finding**: ARCHITECTURE.md is 821 lines, MCE limit is 300 lines.

**Codebase verification**: `wc -l ARCHITECTURE.md` returns 821 lines.

**Confirmed**: 2.7x over MCE limit. Accepted as technical debt - single architectural document benefits from completeness.

## Disposition Matrix

| Finding | Disposition | Rationale |
|---------|-------------|-----------|
| C-1, C-2 | **Accept (by design)** | Specification-first approach is intentional. Phase 7+ implements runtime. |
| C-3 | **Address (Phase 8)** | Semantic classification is core differentiator. Schedule Tier 3 LLM implementation. |
| I-1 | **Accept (research)** | Research gates are provisional by design. Exit criteria exist. |
| I-2 | **Accept (by design)** | Extension runtime explicitly deferred to Phase 7+. |
| I-3 | **Accept (external dependency)** | Bridge layer awaits ClawHub existence. Mock adapters enable development. |
| I-4 | **Address (Phase 5b)** | Add API schema validation when ClawHub exists. |
| I-5 | **Address (RG-2)** | Lock recovery strategy tied to multi-agent coordination research. |
| I-6 | **Address (incremental)** | Add "When NOT to use" sections as skills are implemented. |
| M-1 | **Documented** | Checkbox convention explained in ARCHITECTURE.md:744-757. |
| M-2 | **Accept** | R/C/D counters are scoped to failure lifecycle as designed. |
| M-3 | **Accepted debt** | Single comprehensive architecture doc benefits from completeness. |
| M-4 | **Defer (RG-2)** | Observability needed when multi-agent coordination implemented. |
| M-5 | **Documented** | Layer vs category distinction explained in ARCHITECTURE.md:62-71. |

## Alternative Framing (Both Reviewers)

Both reviewers raised strategic questions about the implementation approach:

### Specs vs Delivery
> "The implementation is 47 specifications with zero runtime code. Should effort shift from documenting more SKILL.md files to implementing minimal vertical slices that actually execute?"

### Contract Tests vs Integration
> "534 tests validate data contracts with mocks. Would a single real integration test against ClawHub provide more confidence than 500 mock tests?"

### Thinner Slice Deeper
> "For a 2-person team, a 'thinner slice deeper' approach (fewer skills, fully implemented) might deliver value faster than 'broader coverage shallower' (all skills, spec-only)."

### Response

The specification-first approach was intentional:
1. **Contract-first development**: Define interfaces before implementation
2. **Parallel enablement**: Specifications allow parallel implementation work
3. **Architecture validation**: Comprehensive design before code investment
4. **Test scaffolding**: Contract tests become integration tests when runtime exists

The "paper architecture" critique is valid but expected at this stage. Phase 7+ shifts from specification to implementation.

## Action Items

### Immediate (Before Phase 8)

1. **Document "paper architecture" status** in ARCHITECTURE.md
   - Add section: "Implementation Status" explaining spec-only nature
   - Clarify what "Implemented" means (spec + tests, not runtime)

2. **Add "When NOT to use" sections** to remaining 8 extension skills
   - Batch with next skill touch

### Phase 8 (Semantic Classification)

3. **Implement Tier 3 LLM tests** for one skill end-to-end
   - Start with `constraint-enforcer` (most safety-critical)
   - Validate semantic classification actually works

4. **Remove/caveat "semantic classification" claims**
   - Until Tier 3 tests pass, claims are aspirational

### Phase 5b (ClawHub Integration)

5. **Add API schema validation** for bridge adapters
   - When ClawHub exists, validate mock interfaces match real APIs

### Future (RG-2 Research)

6. **Lock recovery strategy** for crashed agents
   - Document recovery flow when multi-agent coordination implemented

## Cross-References

- **Reviews**:
  - [Codex Review](../reviews/2026-02-15-agentic-skills-implementation-codex.md)
  - [Gemini Review](../reviews/2026-02-15-agentic-skills-implementation-gemini.md)
- **Specification**: [Agentic Skills Specification](../proposals/2026-02-13-agentic-skills-specification.md)
- **Architecture**: [ARCHITECTURE.md](../../projects/live-neon/skills/ARCHITECTURE.md)
- **Phase 7 Results**: [agentic-phase7-results.md](../../projects/live-neon/skills/docs/implementation/agentic-phase7-results.md)
- **Twin Review Issue**: [N=2 Twin Review Findings](2026-02-15-agentic-skills-impl-twin-review-findings.md) (resolved)
- **Prior Issues**:
  - [Phase 7 Code Review Findings](2026-02-15-phase7-plan-code-review-findings.md) (resolved)
  - [Phase 7 Twin Review Findings](2026-02-15-phase7-plan-twin-review-findings.md) (resolved)

## Resolution Summary

All findings addressed on 2026-02-15:

**Immediate Actions Completed:**

1. **ARCHITECTURE.md "Implementation Status" section added** (C-1, C-2, I-2)
   - Documents specification-first approach
   - Clarifies what "Implemented" means (spec + tests, not runtime)
   - Added table showing component status

2. **"When NOT to use" sections added to 8 extension skills** (I-6)
   - loop-closer, threshold-delegator, hub-subworkflow
   - pbd-strength-classifier, observation-refactoring, constraint-versioning
   - cross-session-safety-check, pattern-convergence-detector
   - All 10 extension skills now have this section

3. **Semantic classification caveat added to specification** (C-3)
   - Added "Implementation Status" note explaining Tier 3 LLM tests are scaffolded but skipped
   - Links to this issue for tracking

**Accepted/Documented:**
- C-1, C-2: Spec-first approach documented in ARCHITECTURE.md
- I-1: Research gates provisional by design
- I-3: Bridge layer awaits ClawHub (external dependency)
- M-1, M-5: Already documented in ARCHITECTURE.md
- M-2, M-3: Accepted as designed/technical debt

**Deferred:**
- I-4: API schema validation → Phase 5b
- I-5, M-4: Lock recovery/observability → RG-2 research

**Tests**: 534 passing after all changes.

---

*Issue created from N=2 external review (Codex + Gemini) with N=1 findings verified to N=2 through codebase inspection.*
*Resolved same day with immediate action items completed.*
