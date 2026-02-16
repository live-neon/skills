# Agentic Skills Consolidation Plan Review - Codex (Round 2)

**Date**: 2026-02-15
**Reviewer**: codex-gpt51-examiner (via automation/claude/agents/codex-gpt51-examiner.md)
**Model**: gpt-5.1-codex-max
**Review Round**: N=2 (re-review after N=4 prior reviews)
**Files Reviewed**:
- `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/docs/plans/2026-02-15-agentic-skills-consolidation.md` (934 lines)
- `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/ARCHITECTURE.md` (874 lines)
- `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/docs/research/2026-02-15-openclaw-clawhub-hooks-research.md` (764 lines)
- `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/docs/standards/CJK_VOCABULARY.md` (151 lines)
- `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/docs/issues/2026-02-15-skills-doc-migration-twin-review-findings.md` (200 lines)
- Prior reviews: `2026-02-15-agentic-skills-consolidation-plan-codex.md` (N=1), `*-gemini.md` (N=1)

## Summary

This re-review validates that the prior N=4 review findings (2x code reviews + 2x twin reviews) were substantially addressed. The plan now includes:
- Merge strategy with logic reconciliation (lines 198-240)
- Versioning strategy with feature flags (lines 232-240)
- Test migration with coverage baseline (lines 659-729)
- Expanded timeline (8-12 days vs original 4.5-6 days)
- Alternatives considered section (lines 134-150)

However, several NEW issues emerged that were not caught in prior reviews, plus some prior fixes were incomplete.

---

## Findings

### Critical

None. Prior critical issues (cross-session-safety-check ambiguity) were resolved.

### Important

| # | Line | Finding |
|---|------|---------|
| I-1 | 706 | **Ghost test file: clawhub-bridge.test.ts**: Stage 3 explicitly converts bridge layer from skill to documentation (line 479: "Documentation, Not Skill"), yet Stage 6.3's new test structure includes `clawhub-bridge.test.ts` (line 706). This test file would test a non-existent skill, guaranteeing dead/failing tests. The test structure must be updated to remove this file or explain what it actually tests. |
| I-2 | 707-710 | **Premature hook tests**: Hook support is explicitly deferred ("Not in initial release" - line 539), but the new test structure includes `hooks/post-tool-use.test.ts`, `hooks/pre-action.test.ts`, and `hooks/heartbeat.test.ts` (lines 707-710). These tests would fail immediately since no hook implementation is planned. Either remove these from the test structure or clarify they are scaffolding for future work. |
| I-3 | 232-240 | **Versioning strategy lacks implementation details**: The versioning mitigation (feature flags, sub-command lifecycle) is mentioned but not actionable. Missing: (1) Where are flags stored? (SKILL frontmatter? environment variable? workspace file?), (2) How does the first rollback work? The plan says "add sub-command versioning after a rollback event (N>=1)" but provides no mechanism for the FIRST rollback before versioning exists. After a 48->7 merge, the first failure has no rollback path. |

### Minor

| # | Line | Finding |
|---|------|---------|
| M-1 | 669 vs 704 | **Coverage command mismatch**: Step 1 (line 669) writes `coverage-before.json`, but Step 4 (line 704) diffs `coverage-before.txt` vs `coverage-after.txt`. File extension inconsistency (`json` vs `txt`) means the coverage gate will fail or be skipped, undermining the <5% coverage-loss target. |
| M-2 | 153 | **Eligibility criteria inconsistency with /ce generate**: Line 153 lists eligibility as "R>=3, C>=2, sources>=2" but line 384 shows `/ce generate` as "R>=3 ^ C>=2 ^ D/(C+D)<0.2 ^ src>=2". The false positive rate constraint `D/(C+D)<0.2` is in the sub-command but not in the "What to Preserve" summary. Either both should match or the summary should note it's abbreviated. |
| M-3 | 719 | **clawhub-bridge.test.ts count mismatch**: Line 719 allocates "10-12 tests" for `clawhub-bridge.test.ts`, but per Stage 3, the bridge layer becomes documentation. This inflates the ~100 test target by 10-12 phantom tests. |

---

## Progress Verification

### Prior Findings - RESOLVED

| Prior Finding | Status | Evidence |
|---------------|--------|----------|
| Ambiguous cross-session-safety-check ownership | **RESOLVED** | Line 504: explicitly moved to `/sc session` sub-command |
| Missing merge strategy | **RESOLVED** | Lines 198-240: "Merge Strategy" section with logic reconciliation, unified eligibility, sub-command independence |
| Unrealistic timeline | **RESOLVED** | Lines 812-846: expanded to 8-12 days (from 4.5-6), includes buffer |
| Missing alternatives section | **RESOLVED** | Lines 134-150: "Alternatives Considered" with 4 options and trade-off rationale |
| Hook specification incomplete | **RESOLVED (deferred)** | Lines 539-563: hooks explicitly deferred to future release, Next Steps pattern adopted instead |
| Test migration lacks coverage preservation | **RESOLVED** | Lines 659-729: coverage baseline, categorization, migration map, verification steps |

### Prior Findings - PARTIALLY RESOLVED

| Prior Finding | Status | Gap |
|---------------|--------|-----|
| Loss of granular versioning | **PARTIAL** | Section exists (lines 232-240) but lacks storage location and first-rollback mechanism |
| Archive strategy unclear | **PARTIAL** | Strategy exists (lines 575-637) but test structure still references archived/non-existent skills |

---

## Alternative Framing Analysis

**Is the approach fundamentally wrong?**

The consolidation approach is sound for the stated goals (reduce overhead, add automation foundation). However, one assumption deserves scrutiny:

**Assumption**: "Skills that are always relevant at the same moment belong in the same SKILL.md" (line 19)

**Challenge**: This temporal co-relevance criterion works for operational skills (failure-memory + constraint-engine), but may not hold for:
- **Audit/compliance skills** (context-verifier) - needed occasionally, not every session
- **Review skills** (review-orchestrator) - invoked explicitly, not contextually co-relevant with failure tracking

The consolidation groups by *function* (memory, engine, orchestrator) more than by *temporal co-relevance*. This is fine, but the stated principle doesn't fully explain the groupings. Consider whether the principle should be "skills that share data models and state belong together" instead.

**Unquestioned assumption**: The plan assumes agents will reliably follow "Next Steps" text instructions. The proactive-agent case study (lines 560-633 of research file) shows this works, but proactive-agent uses very specific trigger patterns ("Actually...", "No, that's wrong"). The plan's detection triggers (lines 305-360) are less specific ("error:", "failed") and may have false positive issues.

---

## Recommendations

### Must Fix (Before Implementation)

1. **Remove clawhub-bridge.test.ts** from Stage 6.3 test structure (line 706, 719) - or rename to `clawhub-integration.test.ts` testing documentation compliance, not skill behavior.

2. **Remove or defer hooks/ test directory** from Stage 6.3 (lines 707-710) - inconsistent with "hooks deferred to future release" decision.

3. **Fix coverage command inconsistency** (line 669 vs 704) - use consistent file extension (`.json` for both).

### Should Fix (Important)

4. **Add first-rollback mechanism** to versioning strategy - at minimum, document that archive provides rollback path for entire skill, and feature flags will exist from day 1 for known-risky sub-commands.

### Nice to Have

5. **Align eligibility criteria** in summary (line 153) with sub-command definition (line 384) - either match exactly or note abbreviation.

---

## Cross-References

- **Prior Codex review**: `docs/reviews/2026-02-15-agentic-skills-consolidation-plan-codex.md` (Round 1)
- **Prior Gemini review**: `docs/reviews/2026-02-15-agentic-skills-consolidation-plan-gemini.md`
- **Twin reviews**: `docs/reviews/2026-02-15-agentic-skills-consolidation-plan-twin-technical.md`, `*-twin-creative.md`
- **Blocked plan**: `docs/plans/2026-02-15-agentic-skills-phase5b-implementation.md`
- **Current architecture**: `ARCHITECTURE.md` (48 skills, 6 layers, 534 tests)

---

## Raw Output

<details>
<summary>Full CLI output</summary>

```
**Findings**
- Important — ClawHub integration is reframed as documentation-only in Stage 3, yet Stage 6's new test structure still includes `clawhub-bridge.test.ts`, implying a non-existent skill and guaranteeing dead tests (`2026-02-15-agentic-skills-consolidation-plan.md:706`).
- Important — Hook support is explicitly deferred to a future release, but the new test suite adds `hooks/post-tool-use.test.ts`, `pre-action.test.ts`, and `heartbeat.test.ts` (with no hook implementation planned), so the migration plan bakes in failing tests (`2026-02-15-agentic-skills-consolidation-plan.md:707`).
- Important — Versioning mitigation remains non-actionable: feature flags and sub-command lifecycle are mentioned, but there's no storage/location defined (SKILL frontmatter? workspace file? env toggle) and no first-release rollback path beyond "add after a rollback event," leaving the first rollback unsupported after a 48→7 merge (`2026-02-15-agentic-skills-consolidation-plan.md:232`).
- Minor — Coverage gate commands conflict: Step 1 writes `coverage-before.json`, but Step 4 diffs `coverage-before.txt` vs `coverage-after.txt`, so the guard will either fail or be skipped, undermining the <5% coverage-loss target (`2026-02-15-agentic-skills-consolidation-plan.md:669`).

Progress check: merge strategy, timeline, and versioning sections were added as promised; timeline expanded to 8–12 days and merge/versioning content now exists, but the above gaps remain.
OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c645d-fc4b-7100-9064-7e1aa6995ce5
--------
tokens used: 15,792
```

</details>

---

*Review generated 2026-02-15 by codex-gpt51-examiner. This is Round 2 re-review after N=4 prior reviews. Part of N=2 external code review cycle.*
