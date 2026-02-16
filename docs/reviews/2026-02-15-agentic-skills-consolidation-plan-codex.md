# Agentic Skills Consolidation Plan Review - Codex

**Date**: 2026-02-15
**Reviewer**: codex-gpt51-examiner
**Model**: gpt-5.1-codex-max
**Files Reviewed**:
- `docs/plans/2026-02-15-agentic-skills-consolidation.md` (main plan, 492 lines)
- `output/context/2026-02-15-agentic-skills-consolidation-plan-context.md` (scout context)
- `ARCHITECTURE.md` (current state, 873 lines)
- `docs/issues/2026-02-15-skills-doc-migration-twin-review-findings.md` (related issues)
- `docs/plans/2026-02-15-agentic-skills-phase5b-implementation.md` (blocked plan)

## Summary

The consolidation plan proposes reducing 48 granular skills to 8 consolidated skills, with a stated goal of reducing prompt overhead from ~7,000 to ~1,600 characters and adding automation hooks. The core insight ("When does the agent need this information?") is sound, and the design decisions to preserve (R/C/D counters, eligibility criteria, circuit breaker) are appropriate.

However, the plan has significant gaps: ambiguous skill ownership (cross-session-safety-check), unrealistic timeline, missing test migration strategy, and incomplete hook specification. Most notably, the plan does not consider alternative approaches like retrieval-based selective injection that could achieve similar prompt reduction without the migration risk.

---

## Findings

### Critical

| Line | Finding |
|------|---------|
| 237 vs 199 | **Ambiguous cross-session-safety-check ownership**: Line 199 (safety-checks merges) includes `cross-session-safety-check`, but line 259 lists it again as "Deferred". This creates ambiguous ownership - is it merged into `safety-checks` or deferred? This safety guard could be dropped entirely or duplicated. The plan must explicitly resolve this conflict. |

### Important

| Line | Finding |
|------|---------|
| 69 | **Detection layer absorption risks proactive capabilities**: Merging Detection (4 skills) entirely into `failure-memory` removes a dedicated detection phase. Detection signals may be needed upstream (e.g., by governance for alerts) before failure recording. This tight coupling could complicate reuse and cut proactive detection capabilities. Consider whether `failure-memory detect` sub-command adequately replaces standalone detection skills. |
| 319-332 | **Archive migration breaks imports without migration plan**: The bulk `mv` commands moving all `agentic/core/*`, `agentic/review/*`, etc. to `_archive` will break existing imports, tests, and scripts. The plan mentions "incremental consolidation" as mitigation but provides no specific reference update strategy. Every file importing these paths needs updating simultaneously - this is a hidden large migration not reflected in the timeline. |
| 336-339, 441 | **Test consolidation lacks coverage preservation strategy**: Reducing 534 contract tests to ~100 without a coverage map or test prioritization strategy risks significant regression. Which tests are being removed? What coverage remains? The plan should include: (1) coverage baseline before consolidation, (2) explicit list of preserved tests, (3) coverage target after consolidation, (4) rationale for each test removal. |
| 420-432 | **Timeline is optimistic**: 4.5-6 days for: 8 new SKILL.md files with merged content, 3 hook scripts (with debugging), path migrations across all files, test suite rewrite (534->100), documentation refresh across 5+ files, and Phase 5B coordination. No buffer for hook debugging, integration issues, or unexpected reference breakage. Realistic estimate: 8-12 days with 30% buffer. |

### Minor

| Line | Finding |
|------|---------|
| 276-293 | **Hook specification incomplete**: Plan assumes OpenClaw exposes `PostToolUse`, `PreFileWrite`, and `Heartbeat` hooks exactly as named. Missing: error handling, timeout behavior, hook execution order, and what happens if hooks fail. Also, no hook for auto-triggering constraint generation when eligibility thresholds are met - this remains a manual gap despite automation being a stated goal. |
| 243-260 | **Deferred extensions drop workflow safety nets**: Deferring 7 of 10 extension skills (hub-subworkflow, pattern-convergence-detector, constraint-versioning, etc.) removes potential workflow safeguards without compensating coverage or explicit sunset criteria. The plan should document: (1) what capabilities are lost, (2) when they might be reconsidered, (3) manual workarounds in the interim. |
| 23-24 | **Alternative approach not considered**: The prompt overhead problem (7,000 chars) could also be addressed via retrieval-based selective injection: keep skills modular, index them, route relevant skills per turn based on context. This avoids large-scale rewrites, path churn, and the consolidation risks. The plan should at least document why this alternative was rejected. |

---

## Alternative Framing Analysis

The plan assumes consolidation is the solution, but the stated problems deserve examination:

**Problem 1: Token overhead (48 skills x ~150 chars = ~7,000 chars)**
- **Consolidation approach**: Reduce to 8 skills, ~1,600 chars
- **Alternative**: Retrieval-based injection - load only relevant skills per turn via semantic routing
- **Trade-off**: Consolidation is simpler but loses modularity; retrieval preserves modularity but adds routing complexity

**Problem 2: No automation (zero hooks/scripts)**
- **Consolidation approach**: Add hooks during consolidation
- **Alternative**: Add hooks to existing 48 skills without consolidation
- **Trade-off**: Consolidation couples two changes (structure + automation); could be done independently

**Problem 3: Paper architecture (specs without runtime)**
- **Consolidation approach**: Fewer specs to implement runtime for
- **Alternative**: Prioritize runtime for critical skills only (Phase 8 already planned)
- **Trade-off**: Consolidation delays Phase 8; prioritization allows partial runtime sooner

**Recommendation**: The plan conflates three separate problems (overhead, automation, runtime). Consider whether each could be addressed independently, reducing risk of the consolidated approach.

---

## Risk Assessment Gaps

The plan's risk table (lines 449-456) misses several risks:

| Risk | Likelihood | Impact | Mitigation Needed |
|------|------------|--------|-------------------|
| Import path breakage | High | Medium | Explicit reference update checklist |
| Test coverage loss | Medium | High | Coverage map before/after |
| Hook timing/ordering issues | Medium | Medium | Hook execution spec with tests |
| Deferred feature regression | Low | Medium | Sunset criteria, manual workarounds |
| Phase 5B coordination failure | Low | Medium | Explicit handoff checklist |

---

## Specific Recommendations

1. **Resolve cross-session-safety-check conflict** (Critical): Choose one location - merged into `safety-checks` OR deferred. Remove from the other list. Add explicit comment explaining the decision.

2. **Add test migration strategy** (Important): Before Stage 6, create a test coverage map showing which of 534 tests map to which consolidated skill, which are removed, and coverage delta.

3. **Expand timeline** (Important): Add 3-4 day buffer. Break Stage 5 (Hooks) into sub-stages with explicit debugging time. Consider making Stage 6 (Archive) a separate follow-up task.

4. **Document hook specification** (Minor): Add error handling, timeout behavior, execution order, and failure modes to Stage 5.

5. **Add alternatives section** (Minor): Document why retrieval-based injection was not chosen, even if briefly.

---

## Cross-References

- **Blocked plan**: `docs/plans/2026-02-15-agentic-skills-phase5b-implementation.md` depends on this consolidation
- **Current architecture**: `ARCHITECTURE.md` documents 48 skills, 6 layers, 534 tests
- **Specification**: `docs/proposals/2026-02-13-agentic-skills-specification.md` defines design decisions to preserve
- **Related findings**: `docs/issues/2026-02-15-skills-doc-migration-twin-review-findings.md` (skill count inconsistency already flagged)

---

## Raw Output

<details>
<summary>Full CLI output</summary>

```
- [CRITICAL] Line 237: cross-session-safety-check is listed as deferred even though it's merged into safety-checks at line 183, creating ambiguous ownership and a real risk the safety guard is dropped or duplicated.
- [IMPORTANT] Line 68: Folding Detection into failure-memory removes a dedicated detection layer; if detection signals are shared upstream (e.g., governance alerts), this could cut proactive detection or complicate reuse.
- [IMPORTANT] Line 291-304: Bulk-moving all agentic/* skill dirs into _archive and relocating bridge adapters will break existing imports/tests/scripts unless every reference is updated together; this hidden migration isn't accounted for elsewhere.
- [IMPORTANT] Line 308-310 & 413: Cutting 534 contract tests to ~100 without a coverage map or migration strategy invites major coverage loss and regressions during consolidation.
- [IMPORTANT] Line 390-402: 4.5-6 days looks optimistic for eight new SKILL.md docs, hook scripts, path migrations, test rewrite, and doc refresh, with no buffer for hook/debug time.
- [MINOR] Line 263-268: Hook plan assumes PostToolUse/PreFileWrite/Heartbeat exist as named and omits error/timeout handling; also no hook to auto-trigger constraint generation when thresholds are hit, leaving a manual gap.
- [MINOR] Line 75 & 231-238: Deferring seven extensions (hub-subworkflow, pattern-convergence-detector, etc.) drops workflow safety nets without compensating coverage or sunset criteria.
- [MINOR] Line 23-24: The prompt-overhead goal could also be met via retrieval-based selective injection (keep skills modular, index + route per turn), avoiding large-scale rewrites and path churn.

OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c63d5-eee7-7201-a9c6-dd080b277dec
--------
tokens used: 15,792
```

</details>

---

*Review generated 2026-02-15 by codex-gpt51-examiner (gpt-5.1-codex-max). Part of N=2 external code review.*
