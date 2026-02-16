---
created: 2026-02-15
type: issue
scope: internal
status: open
priority: medium
reviewer: twin1 (Lucas)
related_plan: ../plans/2026-02-15-skill-category-alignment.md
implementation_plan: ../plans/2026-02-15-agentic-clawhub-decoupling.md
related_code_reviews:
  - ../reviews/2026-02-15-agentic-consolidation-review-codex.md
  - ../reviews/2026-02-15-agentic-consolidation-review-gemini.md
related_twin_reviews:
  - ../reviews/2026-02-15-agentic-consolidation-review-twin-technical.md
  - ../reviews/2026-02-15-agentic-consolidation-review-twin-creative.md
---

# Issue: Agentic Consolidation Review Findings

## Summary

Twin review of the consolidated agentic skills (48→7) identified operational gaps and
repackaging opportunities. The consolidation itself was praised as "well-architected"
with consistent documentation and verified dependencies.

**Reviewer Assessment**: "Overall Quality: Excellent"

**Code Review (N=2)**: Codex + Gemini review on 2026-02-15 identified documentation
inconsistencies and estimate accuracy issues. All findings addressed in v3.

**Twin Review (N=2)**: Technical + Creative review on 2026-02-15 identified formalism/implementation
gaps and narrative improvements. All findings addressed in v4.

## Findings by Priority

### Medium Priority (4)

| # | Finding | Location | Status |
|---|---------|----------|--------|
| M-1 | 90-day governance review is advisory only | `agentic/governance/SKILL.md:116-119` | Open |
| M-2 | Bridge layer depends on ClawHub (mock mode) | `agentic/_archive/2026-02-consolidation/bridge/` | Open |
| M-3 | No CHANGELOG tracking 48→7 consolidation | `agentic/CHANGELOG.md` | Resolved |
| M-4 | Hardcoded Claude model dependencies in review-orchestrator | `agentic/review-orchestrator/SKILL.md:93-95` | Open |

### Low Priority (3)

| # | Finding | Location | Status |
|---|---------|----------|--------|
| L-1 | Archive depth varies (some have EXAMPLES.md, others minimal) | `agentic/_archive/2026-02-consolidation/` | Open |
| L-2 | No auto-generated INDEX.md | `agentic/INDEX.md` | Resolved |
| L-3 | pbd-strength-classifier removed (marked redundant with /fm classify) | `agentic/workflow-tools/SKILL.md` | Documented |

## Recommendations from Review

| Priority | Action | Addresses |
|----------|--------|-----------|
| **Medium** | Plan automated governance enforcement timeline | M-1 |
| **Medium** | Abstract model dependencies in review-orchestrator | M-4 |
| **Low** | Bridge layer activation when ClawHub available | M-2 |

## Verified Strengths (No Action Needed)

- Clean consolidation — 48 → 7 skills with clear sub-command structure
- Evidence tiers (弱/中/強) based on N-count with R/C/D counters
- Failure → Constraint lifecycle fully documented with eligibility criteria (N≥3)
- Circuit breaker pattern (5 violations in 30d → OPEN)
- Positive reframing built into constraint generation
- Complete archive of all 48 pre-consolidation skills
- CJK notation used consistently

## Dependency Graph

```
context-verifier (Foundation — no deps)
    ↓
failure-memory → context-verifier
constraint-engine → failure-memory
    ↓
review-orchestrator → failure-memory, context-verifier
    ↓
governance → constraint-engine, failure-memory
safety-checks → constraint-engine (one-way dependency)
    ↓
workflow-tools → failure-memory, constraint-engine
```

**Note**: safety-checks depends on constraint-engine; constraint-engine does NOT depend on
safety-checks. This is a one-way dependency, not circular.

---

## Repackaging Assessment (v4 — Twin Review Revised)

> **TL;DR**: 7 skills, **200-350+ lines** of fixes (revised from 150-250+), ship the full suite on ClawHub.

> **v4 corrections**: Twin review (N=2) identified that cognitive mode abstraction was still
> underestimated. Full abstraction requires interface definition + config system + implementations
> + tests (~100-150 lines for review-orchestrator alone, not ~60).

> **v3 corrections**: Code review (N=2) identified that the ~80 line estimate was unrealistic.
> Actual scope is larger when accounting for model abstraction in review-orchestrator and
> all Claude-specific references across safety-checks.

### Strategic Value: Earned Behavior vs Assigned Rules

**The core insight** (from twin1 review):

> "Today's agentic coding is reactive. Agent makes a mistake, human corrects it, agent says
> 'sorry,' makes the same mistake next session. Every session starts from zero behavioral
> knowledge. The agent might have skills and tools, but it has no memory of consequences."

**What this suite introduces**: Constraints that are **alive, not static**.

| Today (Static Rules) | With This Suite (Earned Behavior) |
|----------------------|-----------------------------------|
| Human writes rule in CLAUDE.md | Agent discovers rule from own failures |
| Agent follows because told to | Agent enforces because evidence proves it |
| No understanding of why | Provenance: R/C/D counters trace origin |
| No way to know if still relevant | Governance: 90-day review cycle |
| No mechanism to retire | Lifecycle: draft → active → retiring → retired |

---

## Implementation Details

> **Skip if evaluating, read if executing.** The sections below cover technical specifications,
> decoupling checklists, and publishing timelines.

---

### The Mathematical Formalism (What Makes It a Legal System)

> **Status**: Target Implementation (Specification). Current implementations use simplified
> N-count model. Full R/C/D with ratio calculations is the specification goal.

**The key differentiator**: Journals are qualitative ("I learned X"). Legal systems have formal
burden of proof. This suite ships with mathematical evaluation of consequences.

**Evidence Tiers (Formal Definitions)**:

```
弱 (weak):     R ≥ 1 ∧ C < 2
中 (emerging): R ≥ 2 ∧ C ≥ 1 ∧ D/(C+D) < 0.3
強 (strong):   R ≥ 3 ∧ C ≥ 2 ∧ D/(C+D) < 0.2 ∧ sources ≥ 2
```

Where:
- `R` = Recurrence (auto-detected occurrences)
- `C` = Confirmations (human-verified true positives)
- `D` = Disconfirmations (human-verified false positives)
- `sources` = distinct verification sources (prevents single-source bias)

> **Current State**: `failure-memory/SKILL.md` uses simplified N-count model: weak (N=1),
> emerging (N=2), strong (N≥3). The full R/C/D ratio calculations are specified but not
> yet implemented in the eligibility check.

**Constraint Eligibility (Burden of Proof)**:

```
eligible(obs) ⟺ R ≥ 3 ∧ C ≥ 2 ∧ D/(C+D) < 0.2 ∧ sources ≥ 2
```

A constraint can only be generated when evidence reaches `強` tier. No exceptions.

> **Implementation Gap**: `constraint-engine/SKILL.md` implements the full formula.
> `failure-memory/SKILL.md` eligibility check uses `R≥3 ∧ C≥2` without D/(C+D) ratio
> or sources requirement. Aligning failure-memory to full spec is tracked as future work.

**Circuit Breaker (Enforcement)**:

```
state(constraint, severity) = {
  CLOSED:    violations(30d) < threshold(severity)
  OPEN:      violations(30d) ≥ threshold(severity) → constraint suspended
  HALF-OPEN: manual reset → test period
}

threshold(severity) = {
  CRITICAL:  3 violations in 30 days
  IMPORTANT: 5 violations in 30 days
  MINOR:     10 violations in 30 days
}
```

Graduated thresholds: critical constraints trip faster, minor constraints are more tolerant.

**Threshold Rationale**:

| Threshold | Value | Rationale |
|-----------|-------|-----------|
| R ≥ 3 | 3+ recurrences | Aligns with project's N≥3 pattern standard for observations |
| C ≥ 2 | 2+ confirmations | Requires human verification from at least 2 instances |
| D/(C+D) < 0.2 | 80% precision | Industry standard for production systems (minimize false positives) |
| sources ≥ 2 | 2+ sources | Prevents single-source bias (multi-perspective validation) |

**Governance (Sunset Clause)**:

```
retire(constraint) ⟺ adoption_rate < 0.1 ∧ days_since_review > 90
where adoption_rate = sessions_with_constraint / total_sessions
```

**Override (Appeals Process)**:

```
override(constraint, action) → audit_log.append({
  constraint_id, action, timestamp, justification, outcome
})
```

Every override is logged. Patterns in overrides trigger governance review.

**The pitch** (human-readable):

> Journals say "I learned X."
> We say "Prove it. Show me 3 recurrences, 2 confirmations, less than 20% false positives,
> from 2 different sources. Then it becomes a constraint."

**The pitch** (formal notation, for technical documentation):

> `P(enforce|X) > 0.8 given R=5, C=3, D=0, sources=2`

**Competitor framing**:
- Self-improving competitors = **journals** (qualitative reflection)
- This suite = **legal system** (quantitative burden of proof)

**Market validation**: self-improving-agent has 2.6k downloads despite Suspicious security flag.
The demand exists. The execution isn't there. This is the execution.

**Philosophical alignment**: Same move NEON-SOUL makes for identity — earned, not assigned.
NEON-SOUL = who the agent is. Agentic suite = what the agent has learned.

### Executive Summary

7 consolidated skills (from 48) implementing a complete **failure-to-constraint lifecycle**:
detect failures → record observations → generate constraints → enforce rules → govern over time.

Built for Multiverse, but the problems they solve are **universal to any OpenClaw agent**.
Most "project-specific" features are actually OpenClaw-native patterns. Ship the full 7.

### What's Already OpenClaw-Native (Keep As-Is)

| Feature | Why It's Native |
|---------|-----------------|
| HEARTBEAT integration | Built-in OpenClaw proactive turn mechanism |
| Skill-to-skill refs (`/fm` → `/ce` → `/gov`) | How OpenClaw skills compose |
| `.learnings/` directory | Compatible with self-improving-agent@1.0.5 ecosystem |
| CJK notation | Token-efficient, brand identity, always paired with English |
| 90-day review cycle | Prevents constraint rot in any self-improving system |
| Governance layer | HEARTBEAT-driven governance for long-running agents |
| SKILL.md format + slash dispatch | Standard OpenClaw skill loading pattern |

### What's Actually Project-Specific (Revised Estimate v2)

| Item | Action | Est. Lines |
|------|--------|------------|
| `CLAUDE.md` hardcoded as critical file | Make configurable | ~2 |
| `.claude/settings.json` config path | Support `.openclaw/`, `.claude/`, workspace root | ~5-10 |
| Model version strings in safety-checks | Make model-agnostic | ~30-40 |
| `npm test` as quality gate command | Make test command pluggable | ~5 |
| Twin review (two-person team) | Generalize to multi-perspective | ~40-60 |
| Cognitive modes (opus4, opus41, sonnet45) | Make model-agnostic perspectives | ~100-150 |
| S3 in fallback examples | Generalize storage references | ~5 |
| Git/commit-only examples | Add diverse examples | ~30 |

**Revised Total**: 200-350+ lines across 7 files. Cognitive mode abstraction is the largest
effort — requires interface definition, config system, default implementations, and tests.

### Competitive Landscape (ClawHub)

**ClawHub ecosystem**: 3,286+ skills, 1.5M+ downloads. Most self-improving competitors flagged
Suspicious by security scanners. Wide-open lane for Benign/Benign skills.

| Competitor | Downloads | Security | Gap vs Our Skills |
|------------|-----------|----------|-------------------|
| Self Reflection | 2.7k | Benign/Benign | Only clean competitor. Basic reflection, no evidence tiers |
| Self Improving Agent | 2.6k | Suspicious | No R/C/D counters, no constraint generation |
| Reflect | 2.4k | Suspicious | Writes to global files, no verification |
| Proactive Solvr | 1.4k | Suspicious | Vague, no failure tracking structure |
| Openclaw Marshal | 401 | Benign/Suspicious | Freemium, no learning pipeline |

**Key insight**: Self Reflection is closest but basic. Our skills do reflection *plus* evidence-based
classification, constraint generation, circuit breaker, governance lifecycle, safety verification.

### Skill-by-Skill OpenClaw Fit

| Skill | OpenClaw Fit | Effort | Notes |
|-------|--------------|--------|-------|
| failure-memory (記憶) | ★★★★★ | Low | Flagship. R/C/D counters are novel |
| constraint-engine (制約) | ★★★★★ | Low | Circuit breaker + positive reframing |
| context-verifier (検証) | ★★★★☆ | Minimal | Zero deps, good "try it free" entry point |
| safety-checks (安全) | ★★★★★ | Medium | Model version abstraction needed |
| governance (治理) | ★★★★☆ | Low | Advanced tier, prevents constraint rot |
| review-orchestrator (審査) | ★★★☆☆ | **High** | Significant model abstraction required |
| workflow-tools (工具) | ★★★☆☆ | Low | Parallel decision framework is unique |

### Recommended Strategy: Ship Full Suite

**Publish as 7 separate skills** under `leegitw/` on ClawHub with progressive adoption:

| Skill | ClawHub Name | Role |
|-------|--------------|------|
| context-verifier | `leegitw/context-verifier` | Foundation — zero dependencies, "try it first" |
| failure-memory | `leegitw/failure-memory` | Core — **flagship**, R/C/D counters, strongest differentiator |
| constraint-engine | `leegitw/constraint-engine` | Core — evidence-based rule generation + circuit breaker |
| safety-checks | `leegitw/safety-checks` | Safety — model pinning, HEARTBEAT-driven checks |
| workflow-tools | `leegitw/workflow-tools` | Extensions — open loops, parallel decisions |
| review-orchestrator | `leegitw/review-orchestrator` | Review — multi-perspective quality gates |
| governance | `leegitw/governance` | Governance — constraint lifecycle, adoption monitoring |

**Why full suite, not bundle?**
1. OpenClaw skills are modular by design
2. Layer system IS the value proposition
3. Progressive adoption path (context-verifier → failure-memory → governance)
4. More ClawHub keyword lanes (7 skills = 7 search opportunities)
5. Smaller skills easier to pass Benign/Benign security scan

### Decoupling Checklist (Revised Estimate: 200-350+ Lines)

| Skill | Fix | Lines |
|-------|-----|-------|
| context-verifier | Remove `CLAUDE.md` hardcode (line 85), make pattern configurable | ~2 |
| safety-checks | Support `.openclaw/` and `.claude/` config paths | ~10 |
| safety-checks | Make model version format generic (lines 78, 134-147, 169-170) | ~30-40 |
| safety-checks | Generalize S3 → "primary/backup/local" | ~5 |
| review-orchestrator | Generalize "twin" → "multi-perspective" (lines 33-60) | ~50 |
| review-orchestrator | Make cognitive modes model-agnostic (lines 93-95, 149) | ~100-150 |
| review-orchestrator | Make quality gate checks pluggable | ~10 |
| constraint-engine | Make review cadence configurable (default: 90 days) | ~3 |
| All skills | Add diverse examples beyond git/commit | ~40 |

**Total**: 200-350+ lines across 7 files. Cognitive mode abstraction is the largest item:
requires interface definition (~20), config system (~30), default implementations (~40),
documentation (~20), tests (~40+).

### Publishing Plan

1. **Spike on review-orchestrator model abstraction** (1-2 sessions) — validate estimate
2. **Make decoupling fixes** (2-3 sessions)
3. **Add ClawHub frontmatter metadata** (1 session)
4. **Write suite README** with lifecycle diagram (1 session)
5. **Publish context-verifier first** (test Benign/Benign, verify install)
6. **Publish failure-memory + constraint-engine** (core pipeline)
7. **Publish remaining 4** (safety, workflow, review, governance)
8. **Cross-link from NEON-SOUL** ("Want your agent to learn from mistakes?")

**Estimated total effort**: 6-9 sessions (revised from 5-7, accounting for cognitive mode abstraction)

### Branding

**Suite name**: "NEON-SOUL Agentic"

**Tagline**: "From failure to constraint. Self-learning behavior for OpenClaw agents."

**Positioning**: Not a journal — a legal system.
- Journals: "I learned X" (qualitative)
- This suite: "Prove it. 3 recurrences, 2 confirmations, <20% false positives, 2 sources." (quantitative)

**Narrative**: NEON-SOUL teaches your agent *who it is*. The Agentic suite teaches your agent
*what it's learned*. Identity + behavior = a complete self-aware agent.

**The pitch**: "Your agent keeps making the same mistake? Give it consequences it can remember —
with mathematical proof that they matter."

**Technical differentiator**: Formal evidence tiers (弱/中/強), burden of proof for constraint
generation, circuit breaker enforcement, audit-logged appeals, adoption-based sunset clauses.

---

## Twin Review Findings (N=2: Technical + Creative)

### Findings Addressed

| ID | Finding | Source | Resolution |
|----|---------|--------|------------|
| T-1 | Evidence tier formalism doesn't match failure-memory implementation | Technical | Labeled as "Target Implementation (Specification)" with current state noted |
| T-2 | Eligibility check lacks D/(C+D) and sources criteria | Technical | Added "Implementation Gap" note, tracked as future work |
| T-3 | No empirical justification for thresholds | Technical | Added "Threshold Rationale" table with reasoning |
| T-4 | Cognitive mode abstraction underestimated (~60 → ~100-150) | Technical | Updated all estimates to 200-350+ lines |
| T-5 | Circuit breaker uses single threshold vs graduated | Technical | Updated formula to show severity-based thresholds |
| C-1 | Mathematical formalism disrupts narrative flow | Creative | Added "Implementation Details" section break |
| C-2 | Probability pitch alienates more than resonates | Creative | Added human-readable version, kept formal for tech docs |
| C-3 | Document serves two audiences poorly | Creative | Added section break; splitting deferred to publication prep |

### Verified Strengths (From Technical Review)

- Dependency graph: All 7 claims verified against SKILL.md files
- Cross-references: All 4 frontmatter references valid
- Archive structure: Bridge layer exists at claimed path
- Mathematical formalism: Novel differentiator (R/C/D with burden of proof)
- Competitive analysis: Self Reflection confirmed as only Benign/Benign competitor

### Narrative Improvements (From Creative Review)

- "Legal system vs journal" metaphor: Retained as strongest rhetorical move
- "Earned behavior vs assigned rules" insight: Core differentiator, prominently placed
- Human-readable pitch: "Prove it..." version for marketing, formal for tech docs

---

## Code Review Findings (N=2: Codex + Gemini)

### Findings Addressed

| ID | Finding | Source | Resolution |
|----|---------|--------|------------|
| C-1 | Broken `related_review` reference | N=2 | Removed from frontmatter; REPACKAGING_REVIEW.md was on twin1's machine |
| C-2 | Repackaging estimate (~80 lines) unrealistic | N=2 | Updated to 150-250+ lines in v3 |
| I-1 | Resolved items (M-3, L-2) in recommendations | Codex | Removed from recommendations table |
| I-2 | Hardcoded model dependencies not tracked | Gemini | Added as M-4 finding |
| I-3 | Dependency graph claims circular (is one-way) | Codex | Fixed graph note |
| M-1 | Vague location fields | Codex | Added full paths to all findings |
| M-2 | Contradictory verification claims | Codex | Removed "All clean. No broken references" |

### Alternative Framing (from Code Review)

**Should we separate concerns?**

The code review raised a valid point: internal consolidation (48→7) and external publication
(ClawHub) are distinct efforts with different readiness criteria. The hardcoded model
dependencies show the 7 skills are not yet standalone units ready for external publication.

**Recommendation**: Complete decoupling work before ClawHub publication. The skills work
well internally; external publication requires model abstraction.

---

## Action Items

### Completed (This Session)

1. [x] Create CHANGELOG.md documenting consolidation
2. [x] Generate INDEX.md (or create manually if /gov index not available)
3. [x] Address code review findings (C-1, C-2, I-1, I-2, I-3, M-1, M-2)

### Deferred

4. [ ] Plan automated governance enforcement (M-1)
5. [ ] Bridge layer activation timeline (M-2)
6. [ ] Abstract model dependencies in review-orchestrator (M-4) — **see implementation plan Stage 1-2**
7. [ ] Repackaging work for ClawHub publication (200-350+ lines, 6-9 sessions) — **see implementation plan**
8. [ ] Align failure-memory eligibility to full spec (D/(C+D) ratio + sources) — tracked as future work

**Implementation Plan**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (9 stages, 8-11 sessions, v3)

### Completed (Twin Review)

9. [x] Label formalism as "Target Implementation (Specification)" (T-1)
10. [x] Document implementation gap for eligibility check (T-2)
11. [x] Add threshold rationale table (T-3)
12. [x] Update estimates to 200-350+ lines (T-4)
13. [x] Update circuit breaker to graduated thresholds (T-5)
14. [x] Add "Implementation Details" section break (C-1)
15. [x] Add human-readable pitch version (C-2)
16. [x] Add twin review findings section (C-3)

---

*Issue created 2026-02-15 from twin1 review of agentic consolidation.*
*Repackaging assessment updated to v2 (OpenClaw-native analysis).*
*Updated to v3 (2026-02-15) addressing N=2 code review findings (Codex + Gemini).*
*Updated to v4 (2026-02-15) addressing N=2 twin review findings (Technical + Creative).*
