---
created: 2026-02-13
type: issue
scope: internal
status: resolved
priority: high
resolved: 2026-02-13
related_observations: []
related_reviews:
  - ../reviews/2026-02-13-agentic-guides-review-deepseek-v3.md
  - ../reviews/2026-02-13-agentic-guides-review-deepseek-v3.1.md
  - ../reviews/2026-02-13-agentic-guides-review-qwen3-max.md
  - ../reviews/2026-02-13-agentic-guides-review-claude-opus-4.1.md
  - ../reviews/2026-02-13-agentic-guides-review-gpt-5.2-pro.md
  - ../reviews/2026-02-13-agentic-guides-review-gemini-3-pro.md
related_plan: ../plans/2026-02-12-agentic-coding-system-guide-generation.md
---

# Issue: Agentic Coding System Guides — Round 1 Review Remediation

## Problem

Six external AI reviewers evaluated the Agentic Coding System guides (Architecture v4.3, System Guide v1.2). While consensus was highly positive ("Production-Ready", "LGTM", "State-of-the-Art"), multiple implementation issues and enhancement opportunities were identified that need addressing before the guides are finalized.

**Files to Update:**
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md`
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md`

## Impact

- **Implementation blockers**: Schema drift and type contradictions will cause bugs
- **Scalability gaps**: No guidance for >10k observations
- **Governance ambiguity**: Circuit breaker, constraint tiers, and approval gates need clarification
- **Adoption friction**: Missing progressive adoption path for teams

---

## Reviewer Summary

| Reviewer | Rating | Key Focus |
|----------|--------|-----------|
| DeepSeek v3.2 | Production-ready | Memory hierarchy, AGENTS.md pattern, typed contracts |
| DeepSeek v3.1 | 8.5/10 | Simplification, constraint budget, over-engineering risk |
| Qwen 3 Max | Production-ready | Scalability, severity field, MCP constraint server |
| Claude Opus 4.1 | Exceptional | Progressive adoption, template library, failure taxonomy |
| GPT 5.2 Pro | Strong (critical issues) | 5 implementation bugs (C1-C5), pseudo-code labeling |
| Gemini 3 Pro | LGTM / Avant-Garde | Night Watchman, constraint tiers, time decay |

---

## Findings by Recurrence (N-count)

### N=6 (Universal Validation)

| Finding | Status |
|---------|--------|
| Failure-Anchored Memory is the key innovation | ✅ Validated |
| Files-as-memory is correct architectural approach | ✅ Validated |
| Human accountability model is well-designed | ✅ Validated |

### N≥3 (Strong Consensus - Must Address)

#### 1. Circuit Breaker Pattern Incomplete
**N=4** (DeepSeek v3.2, DeepSeek v3.1, Claude Opus 4.1, Gemini 3 Pro)

**Problem:** Circuit breaker struct is global but enforcement should be per-constraint. State transitions lack hysteresis.

**Resolution:**
- Key circuit breaker state by constraint ID: `map[ConstraintID]CircuitBreakerState`
- Add hysteresis: require N successes in HALF_OPEN before closing
- Define valid transitions: CLOSED→OPEN, OPEN→HALF_OPEN, HALF_OPEN→CLOSED|OPEN

**Sources:**
- GPT 5.2 Pro: C4 critical issue
- DeepSeek v3.2: Transition validation code example
- Gemini 3 Pro: "Break Glass" protocol

---

#### 2. Progressive Adoption / Simplification Needed
**N=4** (DeepSeek v3.1, Claude Opus 4.1, GPT 5.2 Pro, Gemini 3 Pro)

**Problem:** System complexity may overwhelm teams. No "Quick Start" or incremental adoption path.

**Resolution:**
- Add "Quick Start" section for MVP implementation
- Identify "Core 5" principles for initial adoption
- Create "Minimal Viable Loop" plan:
  1. Manually create one failure file
  2. Manually approve one constraint
  3. Generate ACTIVE.generated.md
  4. Load contextually for one file path
  5. Warn in pre-action hook (non-blocking)
- Add maturity model: crawl → walk → run

**Sources:**
- DeepSeek v3.1: "Start small - implement 2-3 key constraints first"
- Claude Opus 4.1: "Core 5" subset, dependency graph for principles
- GPT 5.2 Pro: Step 3 "Minimal Viable Loop"
- Gemini 3 Pro: Risk-based tiering for reviews

---

#### 3. Observability Dashboard Needed
**N=3** (DeepSeek v3.2, DeepSeek v3.1, Gemini 3 Pro)

**Problem:** No visibility into system health, constraint effectiveness, or failure pattern evolution.

**Resolution:**
Add observability metrics section:
```markdown
## Multi-Agent Coordination Health

**Agent Load Distribution**:
- Scout: 15% of tokens (context gathering)
- Twins: 40% each (review)
- Historian: 5% (queries)

**Constraint Effectiveness**:
- Active: 8 constraints
- Violation rate: 2.3% (target <5%)
- Mean time to acknowledge: 3.2 hours

**Failure Pattern Evolution**:
- New failures/week: 1.2
- Resolution rate: 75% within 7 days
- Recurrence rate: 15% (target <10%)
```

**Sources:**
- DeepSeek v3.2: Agent load distribution metrics
- DeepSeek v3.1: "Create a Constraint Dashboard"
- Gemini 3 Pro: Constraint effectiveness metrics

---

#### 4. Contextual Constraint Injection
**N=3** (Gemini 3 Pro, DeepSeek v3.2, Qwen 3 Max)

**Problem:** All constraints injected regardless of relevance. 52 constraints/year = 2,000-3,000 tokens "alignment tax."

**Resolution:**
- Add `FilePatterns` and `TopicTags` to Constraint struct
- Only inject constraints matching current context
- Use Scout to determine active constraints per context
- Consider MCP as on-demand constraint server (Qwen 3 Max suggestion)

**Sources:**
- Gemini 3 Pro: Gap 1 "Hierarchy of Constraints"
- DeepSeek v3.2: Context filtering
- Qwen 3 Max: MCP constraint server for scalability

---

### N=2 (Consensus - Should Address)

#### 5. Schema/Type Duplication
**N=2** (GPT 5.2 Pro explicit, DeepSeek v3.2 implied)

**Problem:** `Observation`, `FailureObservation`, `Constraint` defined multiple times with different fields. "Go structs are source of truth" conflicts with multiple competing definitions.

**Resolution:**
- Pick one canonical Go model per entity
- Add canonical schema section near top of Architecture doc
- Make all other sections reference the canonical definition
- Add `// CANONICAL:` or `// PSEUDOCODE:` headers to code blocks

**Source:** GPT 5.2 Pro: C1 critical issue

---

#### 6. N-Count Monotonicity Contradiction
**N=2** (GPT 5.2 Pro, DeepSeek v3.2)

**Problem:** Section 9 shows `Delta: -1` for disconfirmations. Section 10 says "N-count is kept monotonic (G-counter style)."

**Resolution:**
- Confirmations are monotonic: `ConfirmN` grows only
- Disconfirmations are monotonic: `DisconfirmN` grows only
- Confidence is computed from both; **never** decrement counters
- Document the dual-counter approach explicitly

**Sources:**
- GPT 5.2 Pro: C2 critical issue
- DeepSeek v3.2: Stability logic conflation

---

#### 7. AGENTS.md Hierarchy Pattern
**N=2** (DeepSeek v3.2, Gemini 3 Pro)

**Problem:** Constraints exist in flat pool filtered by tags. Directory-level hierarchy (Tessl pattern) would scale better.

**Resolution:**
- Use `CLAUDE.md` for persona and high-level directives
- Use `AGENTS.md` or `RULES.md` in subdirectories for granular constraints
- Physical separation: Global constraints vs. Local constraints
- Agent reads local rules only when entering directory context

**Sources:**
- DeepSeek v3.2: "Consider AGENTS.md hierarchy as alternative"
- Gemini 3 Pro: Gap 1 "Tessl Pattern"

---

#### 8. Constraint Tiers / Severity Field
**N=2** (Gemini 3 Pro, Qwen 3 Max)

**Problem:** All constraints treated equally. Critical failures (security breach, data loss) shouldn't wait for N=3.

**Resolution:**
Add constraint level field:
```markdown
type: constraint
level: blocking | warning | info
```
- **Blocking:** Circuit breaker trips immediately
- **Warning:** Agent proceeds but requires N=2 review
- **Info:** Context injection only

Also add Severity field to FailureObservation for critical failures that bypass N-count threshold.

**Sources:**
- Gemini 3 Pro: "Constraint Tiers"
- Qwen 3 Max: Severity field for critical failures

---

#### 9. Scalability Guidance (>10k Observations)
**N=2** (Qwen 3 Max, Gemini 3 Pro)

**Problem:** No guidance for scale. Git operations and `ls` will slow at 10,000+ files.

**Resolution:**
- Consider hybrid model: files as interface, embedded DB (SQLite/DuckDB) as backend
- Files become "cached view" or "developer-friendly projection"
- Add archival strategy for old observations
- Document sharding approaches if needed

**Sources:**
- Qwen 3 Max: "Hybrid storage model"
- Gemini 3 Pro: "Scale concerns"

---

#### 10. Concrete Examples Needed
**N=2** (DeepSeek v3.1, Claude Opus 4.1)

**Problem:** Theory is clear but operational examples are sparse.

**Resolution:**
- Add concrete examples of failure→constraint→resolution cycle
- Add anti-pattern examples for each principle ("What happens when you violate this")
- Add real failure stories (sanitized)
- Add recovery procedures when principles are broken

**Sources:**
- DeepSeek v3.1: "Add concrete examples"
- Claude Opus 4.1: "Anti-Pattern Examples"

---

#### 11. Determinism in Generated Artifacts
**N=2** (GPT 5.2 Pro, DeepSeek v3.2)

**Problem:** `ACTIVE.generated.md` may cause churn/merge pain if not deterministic.

**Resolution:**
- Stable sort by constraint ID
- Stable formatting (no timestamps inside generated content unless necessary)
- Include hash of source constraint files for traceability

**Source:** GPT 5.2 Pro: I2 improvement

---

### N=1 (Verified → Promoted to N=2)

#### 12. filepath.Match Globstar Limitation
**N=1** (GPT 5.2 Pro) → **Verified: Valid**

**Problem:** Go's `filepath.Match` doesn't support `**` globstar semantics. Examples use `**`.

**Verification:** This is a known Go stdlib limitation. The documented patterns won't work as written.

**Resolution:**
- Constrain allowed patterns to what `filepath.Match` supports, OR
- Use doublestar library and standardize on it
- Document the supported pattern syntax

---

#### 13. Template-Based Constraint Generation
**N=1** (GPT 5.2 Pro) → **Verified: Valid**

**Problem:** `positiveFrame()` does blind string replacement that can produce nonsense rules ("avoid X" → "prefer X" inverts meaning).

**Verification:** String replacement is semantically unsafe. "without" → "with" can be wrong.

**Resolution:**
- Make constraint rule generation template-based, not string-replacement
- For each failure slug, define rule template with slots: verb, precondition, evidence
- Generator picks template based on slug taxonomy

---

#### 14. Night Watchman Async Validator
**N=1** (Gemini 3 Pro) → **Verified: Valid**

**Problem:** System only observes violations during active sessions. Human overrides (--no-verify, rush changes) escape tracking.

**Verification:** This is a real gap. The "Human Responsibility" model can drift to "Human Laziness."

**Resolution:**
- Add passive agent loop ("Outer-Loop Orchestration")
- Cron job agent scans codebase against active constraints
- Reports violations that happened outside agent sessions
- Updates violation counts for constraint effectiveness metrics

---

#### 15. Time Decay in Confidence Scoring
**N=1** (Gemini 3 Pro) → **Verified: Valid**

**Problem:** A pattern observed N=5 times two years ago is weighted the same as N=3 this week.

**Verification:** Temporal relevance matters for codebase evolution.

**Resolution:**
- Introduce decay factor: $Score = (Weights...) \cdot e^{-\lambda t}$
- $\lambda$ = decay constant based on codebase velocity
- More recent observations weighted higher

---

#### 16. Pseudo-Code Labeling Convention
**N=1** (GPT 5.2 Pro) → **Verified: Valid**

**Problem:** Code examples mix compiling Go with pseudo-code. Examples like `FindRetries(threshold: 3)` aren't valid Go.

**Verification:** Inconsistent code examples cause implementation confusion.

**Resolution:**
- Add `// PSEUDOCODE:` header for non-compiling examples
- Add `// COMPILES:` header for examples expected to compile
- Or mark pseudo-code explicitly in prose

---

#### 17. Evidence Tiers for Failure Detection
**N=1** (GPT 5.2 Pro) → **Verified: Valid**

**Problem:** No crisp rule for what increments recurrence vs what only logs.

**Verification:** TierHard/TierMedium/TierSoft mentioned but not operationalized.

**Resolution:**
- TierHard: auto-increment recurrence
- TierMedium: increment if human confirms (or already-confirmed slug)
- TierSoft: never increments without explicit human confirmation
- Define whether N is "times occurred" vs "times observed with evidence"

---

#### 18. Read-Only Review vs Enforcement Clarity
**N=1** (GPT 5.2 Pro) → **Verified: Valid**

**Problem:** Guide says review agents are read-only. Architecture has Enforcer that blocks actions. Relationship unclear.

**Verification:** Role boundaries should be explicit.

**Resolution:**
Document explicitly:
- Review agents: read-only
- Implementation agents: can write, must pass Enforcer checks
- Enforcer: doesn't mutate code; blocks/warns based on constraints

---

#### 19. Anti-Pattern Anchoring in Embeddings
**N=1** (Gemini 3 Pro) → **Verified: Valid**

**Problem:** "Premature optimization" embedding might not semantically match "I can't make this loop faster."

**Verification:** Semantic matching of failure patterns to new code is challenging.

**Resolution:**
- Map failures to anti-patterns in embedding space
- Concatenate specific failure text with generic architecture principle it violated
- Anchors specific failures to general concepts for better retrieval

---

### Lower Priority (P2 Enhancements)

#### 20. Terminology Normalization
**N=1** (GPT 5.2 Pro) — Valid

Use: "failure," "mistake," "learning event," "error-anchored," "constraint candidate," "draft constraint" interchangeably. Pick canonical labels per lifecycle state.

---

#### 21. Emoji in Appendix
**N=1** (GPT 5.2 Pro) — Valid

Move emoji-heavy "core equation" to appendix if docs are for external contributors. Keep top technical and searchable.

---

#### 22. File Naming Consistency
**N=1** (GPT 5.2 Pro) — Valid

Guide references filenames inconsistently. Pick exact names and update cross-links.

---

#### 23. Constraint A/B Testing
**N=1** (Claude Opus 4.1) — Lower priority

Measure actual effectiveness of constraints with before/after comparison.

---

#### 24. Metrics Streams Separation
**N=1** (GPT 5.2 Pro) — Valid

`CalculateEffectiveness()` mixes failure ID and constraint ID keys. Define two streams:
- Failure recurrence rate (by failure slug)
- Constraint violations (by constraint ID)

---

## Proposed Resolution Plan

### Phase 1: Critical Implementation Fixes (P0) ✅ COMPLETE
- [x] #5: Consolidate schema/type definitions
- [x] #6: Fix N-count monotonicity contradiction
- [x] #1: Per-constraint circuit breaker with hysteresis
- [x] #12: Document filepath.Match limitations or switch to doublestar

### Phase 2: Scalability & Governance (P1) ✅ COMPLETE
- [x] #4: Contextual constraint injection
- [x] #7: AGENTS.md hierarchy pattern
- [x] #8: Constraint tiers / severity field
- [x] #9: Scalability guidance section

### Phase 3: Adoption & Operational (P1) ✅ COMPLETE
- [x] #2: Progressive adoption guide / Quick Start
- [x] #3: Observability dashboard section
- [x] #10: Concrete examples and anti-patterns
- [x] #13: Template-based constraint generation
- [x] #25: Restructure System Guide to 10-section standard format
- [x] #26: Architecture Guide structure decision (exception or split)
- [x] #27-29: MCE/timelessness/methodology compliance checks

### Phase 4: Enhancements (P2) ✅ COMPLETE
- [x] #11: Determinism in generated artifacts
- [x] #14: Night Watchman async validator design
- [x] #15: Time decay in confidence scoring
- [x] #16-24: Documentation polish items
- [x] #30-34: Three Lenses Framework alignment
- [x] #35-39: OpenClaw skills proposal alignment (protocols, bridges, migration)

---

## Workaround

Guides are usable as-is for conceptual understanding. For implementation:
- Treat code examples as pseudo-code unless verified
- Start with manual constraint approval workflow
- Use simple glob patterns (no `**`)
- Implement circuit breaker per-constraint from the start

---

## Cross-References

**Source Reviews:**
- `../reviews/2026-02-13-agentic-guides-review-deepseek-v3.md` (DeepSeek v3.2)
- `../reviews/2026-02-13-agentic-guides-review-deepseek-v3.1.md` (DeepSeek v3.1)
- `../reviews/2026-02-13-agentic-guides-review-qwen3-max.md` (Qwen 3 Max)
- `../reviews/2026-02-13-agentic-guides-review-claude-opus-4.1.md` (Claude Opus 4.1)
- `../reviews/2026-02-13-agentic-guides-review-gpt-5.2-pro.md` (GPT 5.2 Pro)
- `../reviews/2026-02-13-agentic-guides-review-gemini-3-pro.md` (Gemini 3 Pro)

**Affected Files:**
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md`
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md`

**Related:**
- `../reviews/2026-02-13-agentic-guides-review-synthesis.md` (previous synthesis)
- `../issues/2026-02-13-agentic-guides-review-remediation.md` (previous round - resolved)
- `../plans/2026-02-12-agentic-coding-system-guide-generation.md` (original plan)

**OpenClaw Integration:**
All 6 reviewers provided OpenClaw integration analysis. This content has been consolidated into:
- `../proposals/2026-02-13-openclaw-skills-for-agentic-system.md` (fork strategies, mutual value, success metrics)

Guides themselves should NOT mention OpenClaw directly (per guide-generation.md anti-pattern: "Exposing Internal Methodologies").

---

## Guide Generation Workflow Compliance

Per `docs/workflows/guide-generation.md`, guides in `artifacts/guides/` should follow the standard 10-section structure:

### Required Sections (Stage 3)

1. **Introduction** - Why this approach matters
2. **TL;DR** - 5-line summary for experienced developers
3. **Core Stack** - Technology choices with rationale
4. **Production Checklists** - Actionable security/reliability items
5. **Implementation Patterns** - Code examples with explanations
6. **Testing Strategy** - How to validate the approach
7. **Common Pitfalls** - Real mistakes with fixes
8. **When to Use Alternatives** - Honest limitations
9. **Framework/Tool Comparisons** - Size, complexity, tradeoffs
10. **Conclusion** - Summary and decision framework

### Current State Analysis

**AGENTIC_CODING_SYSTEM_GUIDE.md (v1.2):**
- 6 sections (non-standard): Review Orchestration, Quality Workflow, Agent Architecture, Memory & Persistence, External Tool Integration, Quick Reference
- Missing: TL;DR, Core Stack, Production Checklists, Testing Strategy, Common Pitfalls, Alternatives, Comparisons
- **Status**: Needs restructuring to standard format

**AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md (v4.3):**
- 17 sections + 8 appendices (custom foundational doc structure)
- More comprehensive than standard template
- **Status**: May warrant exception as foundational architecture doc, OR split into multiple guides

### Compliance Tasks (Add to Phase 3)

- [ ] #25: Restructure AGENTIC_CODING_SYSTEM_GUIDE.md to 10-section standard format
- [ ] #26: Decide if Architecture Guide needs restructuring or documented exception
- [ ] #27: Apply MCE compliance checklist (≤50 line examples, minimal deps)
- [ ] #28: Apply timelessness checklist (no project paths, version dating, generic concepts)
- [ ] #29: Verify no internal methodology exposure (OpenClaw refs → proposal file)

---

## Three Lenses Framework Alignment

The Three-Skill Stack (proactive-agent + self-improving-agent + our system) discovered during OpenClaw research maps directly to the Three Lenses Framework (`artifacts/guides/methodology/THREE_LENSES_FRAMEWORK_GUIDE.md`).

### Application-Level Mapping (PBD Scales)

| Three-Skill Stack Layer | Three Lenses Scale | Function |
|-------------------------|-------------------|----------|
| **Layer 3: proactive-agent** | Telescope (Comparative) | Looks outward: context persistence, ecosystem security patterns, compaction recovery |
| **Layer 2: self-improving-agent** | Kaleidoscope (Experiential) | Captures patterns: learnings, errors, feature requests across sessions |
| **Layer 1: Our Agentic System** | Microscope (Project Compass) | Internal navigation: failures → constraints → enforcement for specific project |

### Meta-Level Mapping (Knowledge Governance)

| Component | Meta-Lens | Function |
|-----------|-----------|----------|
| **self-improving-agent** | PBD (Extraction) | Extract learnings from session complexity |
| **Our constraints** | Golden Master (Authority) | Constraints become authoritative rules |
| **Circuit breaker + override** | Separation of Powers (Trust) | Prevents constraint tyranny |

### Why This Alignment Matters

The Three Lenses Framework prevents knowledge governance failures:
- **Without PBD (self-improving-agent)**: Drowning in session complexity, no pattern extraction
- **Without Golden Master (our constraints)**: No authoritative source, drift and divergence
- **Without Separation of Powers (circuit breaker)**: Constraints become tyranny, no escape hatch

The three-skill stack is an **implementation of Three Lenses for agentic workflows**.

### Recommended Guide Updates

#### Architecture Guide (v4.3)

Add new section: "## Three Lenses Alignment"

```markdown
## Three Lenses Alignment

This architecture implements the Three Lenses Framework for agentic workflows:

### Application-Level (PBD Scales)
- **Telescope (proactive-agent)**: Context persistence, external security patterns
- **Kaleidoscope (self-improving-agent)**: Learning capture across sessions
- **Microscope (Our System)**: Specific project constraints and enforcement

### Meta-Level (Knowledge Governance)
- **PBD**: Observer extracts learnings from session complexity
- **Golden Master**: Constraints become authoritative rules (docs/constraints/)
- **Separation of Powers**: Circuit breaker prevents constraint tyranny

See: artifacts/guides/methodology/THREE_LENSES_FRAMEWORK_GUIDE.md
```

#### System Guide (v1.2)

Add to "Memory & Persistence" section:

```markdown
### Three-Skill Integration

Our system is designed to integrate with two complementary skills:

| Layer | Skill | Function |
|-------|-------|----------|
| Context | proactive-agent | WAL Protocol, Working Buffer, compaction recovery |
| Capture | self-improving-agent | LEARNINGS.md, ERRORS.md, FEATURE_REQUESTS.md |
| Consequence | Our System | N-count automation, constraint generation, enforcement |

See: ../proposals/2026-02-13-openclaw-skills-for-agentic-system.md
```

### Compliance Tasks (Add to Phase 4)

- [ ] #30: Add "Three Lenses Alignment" section to Architecture Guide
- [ ] #31: Add "Three-Skill Integration" subsection to System Guide
- [ ] #32: Cross-reference THREE_LENSES_FRAMEWORK_GUIDE.md in both guides
- [ ] #33: Update Architecture Guide Section 3 (Build vs Leverage) to reference skill stack
- [ ] #34: Verify governance model section explains Separation of Powers alignment

---

## OpenClaw Skills Proposal Alignment

The OpenClaw skills proposal (`../proposals/2026-02-13-openclaw-skills-for-agentic-system.md`) introduces concepts that need to be ported back to the guides for completeness.

### Gaps Identified

#### Gap 1: Protocol Integration Missing

The proposal introduces protocols from external skills not yet in the guides:

| Protocol | Source | Function | Guide Impact |
|----------|--------|----------|--------------|
| **WAL Protocol** | proactive-agent | Captures corrections BEFORE responding | Enhances failure detection |
| **VFM Protocol** | proactive-agent | Scores constraint candidates (priority) | Enhances approval workflow |
| **Working Buffer** | proactive-agent | Survives compaction (60%+ context) | Enhances context persistence |
| **Heartbeat System** | proactive-agent | Periodic constraint health checks | Enhances monitoring |
| **"See Also" Links** | self-improving-agent | Manual recurrence tracking | Alternative to auto N-count |

#### Gap 2: Bridge Skills Not Detailed

5 bridge skills connect external skills to our system:

| Bridge Skill | Function |
|--------------|----------|
| `learnings-n-counter` | Convert "See Also" links → formal N-count |
| `feature-request-tracker` | Track recurring capability requests |
| `wal-failure-detector` | WAL corrections → failure candidates |
| `heartbeat-constraint-check` | Constraint monitoring in heartbeats |
| `vfm-constraint-scorer` | VFM scoring for constraint approval |

#### Gap 3: Memory Structure Ambiguity

Conflict between directory structures:

| Source | Structure |
|--------|-----------|
| **Architecture Guide** | `docs/observations/`, `docs/failures/`, `docs/constraints/` |
| **Proposal (OpenClaw)** | `.agentic/failures/`, `.agentic/constraints/`, `.learnings/` |

Teams need guidance on which to use and how to migrate between them.

#### Gap 4: Skill Adoption Path

The proposal organizes 37 skills across 8 tiers, but guides don't explain progressive adoption.

### Conflicts Identified

#### Conflict 1: N-Count Tracking Mechanism

- **Architecture Guide**: Automatic N-count tracking (Observer detects, increments)
- **self-improving-agent**: Manual "See Also" links in ERRORS.md entries
- **Resolution**: `learnings-n-counter` bridge skill converts one to the other

#### Conflict 2: Constraint Approval Workflow

- **Architecture Guide**: Human approval gate only
- **Proposal (VFM)**: Score-based prioritization (VFM > 70 = high priority)
- **Resolution**: VFM informs priority, human still approves (complementary)

#### Conflict 3: Context Persistence

- **System Guide**: Progressive loading (CJK → section → full guide)
- **proactive-agent**: WAL Protocol + Working Buffer
- **Resolution**: Both are valid; guides should reference WAL as enhancement option

### Additional Compliance Tasks (Phase 4)

#### Protocol Integration
- [ ] #35: Add "External Protocol Integration" appendix to Architecture Guide
  - Document WAL Protocol compatibility with failure detection
  - Document VFM scoring as constraint approval enhancement
  - Document Working Buffer pattern for context persistence
  - Reference proactive-agent as source

#### Bridge Skills Documentation
- [ ] #36: Add "Migration from Existing Skills" section to System Guide
  - Document self-improving-agent → N-count migration path
  - Reference bridge skills (learnings-n-counter, wal-failure-detector)
  - Link to proposal for full skill list and implementation details

#### Memory Structure Clarification
- [ ] #37: Add "Directory Structure Options" to Architecture Guide Appendix A
  - Option 1: Standard structure (`docs/failures/`, `docs/constraints/`)
  - Option 2: OpenClaw structure (`.agentic/`, `.learnings/`)
  - Document migration path between structures
  - Clarify canonical structure recommendation

#### Skill Adoption Path
- [ ] #38: Add "Progressive Skill Adoption" section to System Guide
  - Reference skill tiers from proposal (Tier 1-8)
  - Recommend Phase 0 foundation skills first (proactive-agent, self-improving-agent)
  - Explain bridge skills as integration layer
  - Link to proposal for implementation details

#### Cross-Reference Updates
- [ ] #39: Add proposal reference to both guides
  - Architecture Guide Section 3 (Build vs Leverage): Reference skill stack strategy
  - System Guide Section 4 (Memory & Persistence): Reference OpenClaw integration
  - Add "See Also" link to proposal in both guide conclusions
