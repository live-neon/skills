---
created: 2026-02-13
completed: 2026-02-13
type: plan
status: complete
priority: high
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-13-agentic-skills-phase1-implementation.md
results: projects/live-neon/skills/docs/implementation/agentic-phase2-results.md
depends_on:
  - ../plans/2026-02-13-agentic-skills-phase1-implementation.md
related_guides:
  - artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md
reviews:
  - ../reviews/2026-02-13-phase2-plan-codex.md
  - ../reviews/2026-02-13-phase2-plan-gemini.md
  - ../reviews/2026-02-13-phase2-plan-twin-technical.md
  - ../reviews/2026-02-13-phase2-plan-twin-creative.md
---

# Agentic Skills Phase 2: Core Memory Implementation

<!-- SECTION: cjk-summary -->
**核心記憶**: Phase 2 implements 9 Core Memory skills + 2 deferred items
**Skills**: failure-tracker (失), observation-recorder (観), constraint-generator (生), constraint-lifecycle (命), circuit-breaker (断), emergency-override (越), memory-search (探), contextual-injection (注), progressive-loader (漸)
**Flow**: 失→生→命→断→越 (failure→constraint→lifecycle→circuit→override)
<!-- END SECTION: cjk-summary -->

## Summary

### Why This Matters

AI assistants make the same mistakes repeatedly because they lack memory between sessions.
Instructions alone aren't enough—they're forgotten, ignored under pressure, or bypassed
through rephrasing. **Failure-anchored learning** solves this by turning mistakes into
enforced constraints: when a failure recurs enough times (R≥3) and humans confirm it's
real (C≥2), the system automatically generates a constraint that prevents recurrence.

Phase 1 established the Foundation layer (context-packet, file-verifier, constraint-enforcer,
severity-tagger, positive-framer). Phase 2 builds the Core Memory layer—the infrastructure
that makes failure→constraint transformation possible. This investment enables simpler
downstream development: once Core Memory is operational, new constraints emerge automatically
from observed failures rather than requiring manual enumeration.

### What We're Building

Implement 9 Core Memory layer skills plus 2 deferred items from Phase 1. These skills
form the heart of the failure-anchored learning system: tracking failures, generating
constraints, and managing the observation→constraint lifecycle.

**Specification**: See `../proposals/2026-02-13-agentic-skills-specification.md#phase-2-core-memory-9-remaining-core-skills`

**Phase 1 Results**: See `projects/live-neon/skills/docs/implementation/agentic-phase1-results.md`

---

## Code Review Findings Addressed

This plan incorporates N=2 external code review findings (Codex + Gemini):

| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| 1 | Emergency override approval undefined | Critical | Added interactive human approval workflow (Stage 6) |
| 2 | constraint-generator missing deps | Important | Added severity-tagger, positive-framer dependencies |
| 3 | Dependency inversions | Important | Reordered dependency graph, added "Provides To" column |
| 4 | Retiring/retired states undefined | Important | Added retirement criteria, effects, Scenario 5 |
| 5 | observation-recorder constraint gate | Important | Added explicit gating (eligible_for_constraint: false) |
| 6 | Integration tests incomplete | Important | Added Scenarios 4, 5 for context loading and retirement |
| 7 | Race conditions in state files | Important | Added atomic write-and-rename pattern |
| 8 | No rollback mechanism | Important | Added rollback command to constraint-lifecycle |
| 9 | Phase 1 gate not instrumented | Minor | Added explicit gate owner |
| 10 | Circuit breaker window undefined | Minor | Added UTC time, dedup, retention details |
| 11 | LLM test fallback incomplete | Minor | Added fixture-based fallback for CI |
| 12 | context-packet schema not referenced | Minor | Added cross-reference in memory-search |
| 13 | progressive-loader priorities vague | Minor | Added priority table with examples |
| 14 | Timeline optimistic | Minor | Adjusted from 3-5 days to 4-6 days |

**Reviews**: `../reviews/2026-02-13-phase2-plan-codex.md`, `../reviews/2026-02-13-phase2-plan-gemini.md`

---

## Twin Review Findings Addressed

This plan incorporates N=2 internal twin review findings (Technical + Creative):

| # | Finding | Source | Resolution |
|---|---------|--------|------------|
| 1 | Missing "Why This Matters" section | Creative | Added context to Summary explaining failure-anchored learning |
| 2 | Pattern vs observation terminology inconsistent | Creative | Unified with single `type: failure\|pattern` field |
| 3 | No troubleshooting guidance | Creative | Added Appendix A: Troubleshooting Guide |
| 4 | Missing phase-level rollback strategy | Creative | Added Appendix B: Phase-Level Rollback Strategy |
| 5 | Trust boundary implementation undefined | Technical | Added challenge-response with random token approach |
| 6 | Semantic classification not propagated | Technical | Added classification requirement to each skill spec |
| 7 | Observation storage location not specified | Technical | Added storage structure under Stage 2A |
| 8 | Evidence format example incomplete | Creative | Added concrete 3-occurrence evidence example |
| 9 | Timeline lacks parallelization | Creative | Added parallel track table and timeline options |
| 10 | Circuit breaker rationale missing | Creative | Added threshold rationale with reasoning |
| 11 | CJK summary opportunity | Creative | Added CJK quick reference at document top |
| 12 | MCE compliance not mentioned | Technical | Added MCE check to Stage 9 acceptance criteria |
| 13 | Deduplication window may be too narrow | Technical | Added configurable per-constraint option |

**Reviews**: `../reviews/2026-02-13-phase2-plan-twin-technical.md`, `../reviews/2026-02-13-phase2-plan-twin-creative.md`

---

## Prerequisites

- [x] Phase 1 complete (5 Foundation layer skills implemented)
- [x] Testing infrastructure operational (`npm test` passes)
- [x] ARCHITECTURE.md Foundation layer documented
- [ ] Phase 1 results reviewed and approved

**Gate**: Stage 1 MUST NOT begin until prerequisite 4 is checked. Owner: Human twin.

---

## Research Gates (Phase 2 Blockers)

**Reference**: `../proposals/2026-02-13-agentic-skills-specification.md#research-gates`

Phase 2 has 4 research gates that should be addressed before or during implementation:

| ID | Topic | Status | Affects Stage | Risk if Unresolved |
|----|-------|--------|---------------|-------------------|
| RG-1 | Circuit breaker parameters | ⚠️ PARTIAL | Stage 5 | 5/30-day threshold unvalidated externally |
| RG-3 | Semantic similarity thresholds | ⚠️ PARTIAL | All stages | Confidence scoring uncalibrated |
| RG-5 | Human confirmation bias | ❌ GAP | Stage 2, 3 | R/C/D counts may reflect biased feedback |
| RG-8 | LLM behavioral test patterns | ❌ GAP | Stage 1B | Test methodology unvalidated |

### Resolution Options

**Option A: Research Sprint First** (recommended for production)
- Complete RG-1, RG-3, RG-5, RG-8 research before Stage 1
- Estimated: 2-3 days additional
- Output: 4 new research files in `neon-soul/docs/research/`

**Option B: Provisional Implementation** (acceptable for iteration)
- Proceed with ⚠️ PARTIAL status
- Flag implementation as provisional in results
- Create follow-up tasks for research validation
- Document assumptions made without research backing

**Option C: Selective Research** (balanced approach)
- RG-8 (testing): Research before Stage 1B (blocks behavioral tests)
- RG-1 (circuit breaker): Research before Stage 5 (blocks threshold validation)
- RG-3, RG-5: Accept provisional status, validate post-implementation

### Research Gate Acceptance

- [x] **Research approach selected**: **Option A - Research Sprint First**
- N/A **Risk acceptance documented** (if B or C): Not applicable - doing research first
- N/A **Follow-up tasks created** (if B or C): Not applicable - doing research first

**Decision**: Complete all 4 research files before Stage 1 begins.

**Research Sprint Output** (in `projects/live-neon/neon-soul/docs/research/`):
- [x] `circuit-breaker-patterns.md` (RG-1) ✅ Completed 2026-02-13
- [x] `semantic-similarity-thresholds.md` (RG-3) ✅ Completed 2026-02-13
- [x] `human-confirmation-bias.md` (RG-5) ✅ Completed 2026-02-13
- [x] `llm-behavioral-testing.md` (RG-8) ✅ Completed 2026-02-13

**Research Sprint Complete**: All 4 research gates resolved. Key findings:
- RG-1: 5/30-day threshold validated; add configurability and 5-min deduplication
- RG-3: Tiered thresholds (CRITICAL≥0.85, IMPORTANT≥0.80, MINOR≥0.70); two-stage matching
- RG-5: Multi-user requirement (c_unique_users_min: 2); engagement time tracking
- RG-8: Three-tier testing (structural/fixture/live LLM); Vitest helpers

---

## Skills to Implement

### Core Memory Skills (9)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| failure-tracker | Core | Detect and record failures with R/C/D counters | context-packet | constraint-generator |
| observation-recorder | Core | Record positive patterns with evidence | context-packet | pbd-strength-classifier (Phase 6) |
| constraint-generator | Core | Generate constraints when R≥3, C≥2, sources≥2 | failure-tracker, severity-tagger, positive-framer | constraint-lifecycle |
| constraint-lifecycle | Core | Manage draft→active→retiring→retired states | constraint-generator | constraint-enforcer, circuit-breaker |
| circuit-breaker | Core | Track violations, trip at 5 in 30 days | constraint-lifecycle | emergency-override |
| emergency-override | Core | Temporary bypass with audit trail | circuit-breaker | Workflow skills |
| memory-search | Core | Query observations and constraints | context-packet (for hashing) | contextual-injection |
| contextual-injection | Core | Load relevant constraints by patterns/tags | memory-search, constraint-lifecycle | Session initialization |
| progressive-loader | Core | Defer low-priority document loads | None | contextual-injection |

**Data Flow** (unidirectional):
```
failure-tracker → constraint-generator → constraint-lifecycle → constraint-enforcer
                                                    ↓
                                              circuit-breaker → emergency-override
                                                    ↓
progressive-loader → memory-search → contextual-injection → Session context
```

### Deferred Items from Phase 1 (2)

| Item | Location | Description |
|------|----------|-------------|
| `algorithm:hash` format | file-verifier | Support `sha256:abc123` prefix format |
| Behavioral tests | tests/e2e/skill-behavior.test.ts | Implement actual tests (stubs exist) |

---

## Stage 1: Deferred Items from Phase 1

**Goal**: Clear Phase 1 technical debt before adding new skills.

### 1A: file-verifier algorithm:hash Format

**Location**: `projects/live-neon/skills/agentic/core/file-verifier/SKILL.md`

Update file-verifier to support explicit algorithm prefix:

```
# Current (auto-detection by length)
/file-verifier path/to/file abc123def456...

# New (explicit prefix)
/file-verifier path/to/file sha256:abc123def456...
/file-verifier path/to/file md5:abc123def456...
```

**Tasks**:
- [ ] Add `algorithm:hash` parsing to Arguments section
- [ ] Update auto-detection to prefer explicit prefix when present
- [ ] Add deprecation warning for length-based auto-detection
- [ ] Update examples to show new format

### 1B: Behavioral Test Implementation

**Location**: `projects/live-neon/skills/tests/e2e/skill-behavior.test.ts`

Implement the test stubs created in Phase 1. These require LLM integration for
semantic matching tests.

**Research Gate RG-8**: Testing methodology for LLM-based classification is a research gap.
See `../proposals/2026-02-13-agentic-skills-specification.md#rg-8-llm-behavioral-test-patterns-phase-2`.
Before implementing, consider researching:
- Deterministic testing strategies for probabilistic systems
- Fixture generation patterns for semantic classification
- Threshold calibration for test assertions

**Tasks**:
- [ ] Implement hash correctness tests (context-packet, file-verifier)
- [ ] Implement constraint semantic matching tests (constraint-enforcer)
- [ ] Implement transformation tests (positive-framer)
- [ ] Add `USE_REAL_LLM=true` environment variable support
- [ ] Update tests/README.md with LLM test instructions

**LLM Test Strategy** (N=2 code review finding):

| Environment | API Key | Behavior |
|-------------|---------|----------|
| Local dev | Available | Full LLM tests run |
| Local dev | Missing | Skip LLM tests with warning |
| CI | Available | Full LLM tests run |
| CI | Missing | Run fixture-based fallback tests |

**Fixture Fallback**:
- Pre-recorded LLM responses stored in `tests/fixtures/llm-responses/`
- Fixture tests validate structure and integration (not semantic accuracy)
- Ensures some behavioral validation always runs in CI
- Use `describeWithLLM` helper with `USE_FIXTURES=true` fallback

### Acceptance Criteria

- [x] file-verifier accepts `algorithm:hash` format ✅ 2026-02-13
- [x] Length-based detection shows deprecation warning ✅ 2026-02-13
- [x] At least 10 behavioral tests pass (50 passed, 11 skipped) ✅ 2026-02-13
- [x] Tests gracefully skip when LLM unavailable ✅ 2026-02-13

---

## Stage 2: Observation Recording (failure-tracker, observation-recorder)

**Goal**: Implement the two inverse observation operations.

### 2A: failure-tracker Skill

**Location**: `projects/live-neon/skills/agentic/core/failure-tracker/SKILL.md`

Detect and record failure observations with R/C/D counter tracking.

**Classification Method**: LLM-based semantic similarity (NOT pattern matching)
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Research Gate RG-3**: Semantic similarity thresholds are a research gap. Confidence scoring
(0.0-1.0) is mentioned but threshold calibration is not validated. See
`../proposals/2026-02-13-agentic-skills-specification.md#rg-3-semantic-similarity-thresholds-phase-2`.
Use conservative thresholds (≥0.8) if proceeding without calibration research.

**Specification**:
- **Input**: Failure signal (test failure, user correction, review finding, runtime error)
- **Output**: Creates/updates observation file with:
  - Failure description and evidence
  - R counter (auto-incremented on detection)
  - C/D counters (human-updated)
  - Source diversity tracking (file, session, date)
  - Context packet reference

**Counter Semantics** (Architecture Guide v5.2):
- $R$ = recurrence count (auto-detected, incremented by this skill)
- $C$ = confirmations (human-verified true positives)
- $D$ = disconfirmations (human-verified false positives)

**Research Gate RG-5**: Human confirmation quality is a research gap. The R/C/D system assumes
human confirmations are reliable, but cognitive biases (confirmation bias, anchoring) may affect
feedback quality. See `../proposals/2026-02-13-agentic-skills-specification.md#rg-5-human-confirmation-bias-phase-2`.
Consider bias mitigation strategies if proceeding with provisional status.

**Observation File Format**:
```markdown
---
slug: git-force-push-without-confirmation
type: failure              # 'failure' or 'pattern' - determines constraint eligibility
r_count: 3
c_count: 2
d_count: 0
sources:
  - file: src/git/push.ts
    date: 2026-02-10
    session: abc123
  - file: src/deploy/release.ts
    date: 2026-02-12
    session: def456
created: 2026-02-10
updated: 2026-02-13
context_packet: .packets/2026-02-13-abc123.json
---

# Force Push Without Confirmation

## Description

AI executed `git push --force` without asking for user confirmation.

## Evidence

### Occurrence 1 (2026-02-10)
- **File**: src/git/push.ts:47
- **Action**: Executed `git push --force origin main`
- **Context**: Deployment hotfix, user had requested quick deploy
- **Detection**: User correction after remote history lost

### Occurrence 2 (2026-02-11)
- **File**: src/deploy/release.ts:89
- **Action**: Executed `git push -f origin release/v2.1`
- **Context**: Branch cleanup during release prep
- **Detection**: CI failure triggered investigation

### Occurrence 3 (2026-02-12)
- **File**: src/git/push.ts:52
- **Action**: Executed `git push --force-with-lease origin feature/auth`
- **Context**: Rebasing feature branch
- **Detection**: Code review finding

## Resolution

Before executing any force push operation:
1. Present consequences to user (history will be overwritten)
2. List affected commits that will be lost on remote
3. Request explicit "yes" confirmation with reason
4. Log the decision and reason to audit trail
```

**Storage Location** (N=2 twin review finding):
```
docs/observations/
├── failures/           # failure-tracker output
│   └── <slug>.md       # e.g., git-force-push-without-confirmation.md
├── patterns/           # observation-recorder output
│   └── <slug>.md       # e.g., successful-tdd-workflow.md
└── *.md                # existing observations (legacy, not auto-generated)
```

**Naming Convention**: `<slug>.md` where slug is kebab-case failure/pattern identifier.

**Integration**:
- **Layer**: Core
- **Depends on**: context-packet (for evidence hashing)
- **Used by**: constraint-generator (triggers when eligible)

### 2B: observation-recorder Skill

**Location**: `projects/live-neon/skills/agentic/core/observation-recorder/SKILL.md`

Record positive patterns (not failures) for knowledge capture.

**Specification**:
- **Input**: Pattern description, evidence, source
- **Output**: Creates observation file (same format as failure-tracker, but `status: pattern`)

**Key Difference from failure-tracker**:
- failure-tracker: Captures problems to prevent
- observation-recorder: Captures successes to replicate

**Observation Types** (N=2 twin review finding - unified terminology):

Observations are classified by a single `type` field, not dual status/eligibility fields:

| Type | Created By | Constraint Eligible | Purpose |
|------|------------|---------------------|---------|
| `failure` | failure-tracker | Yes (when R≥3, C≥2) | Problems to prevent |
| `pattern` | observation-recorder | No (never) | Successes to replicate |

**Constraint Gate** (N=2 code review finding):
Pattern observations MUST NOT be promoted to constraints. Enforce via single field:
- `type: failure` → constraint-generator considers for promotion
- `type: pattern` → constraint-generator ignores (hard-coded exclusion)
- No `eligible_for_constraint` field needed - type determines eligibility
- constraint-generator MUST filter: `WHERE type = 'failure' AND r_count >= 3 AND c_count >= 2`

**Integration**:
- **Layer**: Core
- **Depends on**: context-packet
- **Used by**: pbd-strength-classifier (Phase 6)

### Acceptance Criteria

- [x] failure-tracker creates observation file with correct format ✅ 2026-02-13
- [x] R counter auto-increments on repeated failures ✅ 2026-02-13
- [x] Source diversity tracked (same failure from different files/sessions) ✅ 2026-02-13
- [x] observation-recorder creates pattern observations ✅ 2026-02-13
- [x] Both skills generate context packets for evidence ✅ 2026-02-13
- [x] Multi-user requirement implemented (c_unique_users ≥ 2, from RG-5) ✅ 2026-02-13
- [x] Engagement tracking for bias mitigation ✅ 2026-02-13
- [x] Pattern strength classification (HIGH/MEDIUM/LOW) ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (50 passed) ✅ 2026-02-13

---

## Stage 3: Constraint Generation (constraint-generator)

**Goal**: Automatically generate constraint candidates when eligibility criteria met.

### constraint-generator Skill

**Location**: `projects/live-neon/skills/agentic/core/constraint-generator/SKILL.md`

Generate constraint candidates from observations meeting eligibility criteria.

**Classification Method**: LLM-based semantic similarity (NOT pattern matching)
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

When comparing observations for similarity (to detect related failures), use semantic
classification, not string matching. Two failures with different wording but same root
cause should be recognized as related.

**Eligibility Criteria** (from Architecture Guide v5.2):
- $R \geq 3$ (at least 3 recurrences)
- $C \geq 2$ (at least 2 human confirmations)
- $|sources| \geq 2$ (from at least 2 distinct sources)

**Specification**:
- **Input**: Observation file path (or scans all observations)
- **Output**: Constraint candidate file in `docs/constraints/draft/`

**Constraint Candidate Format**:
```markdown
---
id: git-safety-force-push
severity: critical
status: draft
scope: "Actions that force-push to remote repositories"
intent: destructive
created: 2026-02-13
source_observation: docs/observations/git-force-push-without-confirmation.md
r_count: 5
c_count: 3
auto_generated: true
---

# Git Safety: Force Push

Never execute force push without explicit user confirmation.

## Semantic Scope

Actions matching this constraint include:
- Force pushing to any remote branch
- Overwriting remote history
- Using --force or -f flags with git push

## Required Actions

1. Present consequences to user
2. Request explicit "yes" confirmation
3. Log the decision
```

**Integration**:
- **Layer**: Core
- **Depends on**:
  - failure-tracker (reads observations)
  - severity-tagger (classifies constraint severity)
  - positive-framer (transforms negative rules to positive)
- **Used by**: constraint-lifecycle (manages generated constraints)

**Constraint Gate** (N=2 code review + twin review finding):
- MUST filter observations by `type: failure` (single field check)
- Pattern observations (`type: pattern`) are automatically excluded
- No ambiguous OR conditions - type field is the single source of truth

### Acceptance Criteria

- [x] Scans observations for eligibility ✅ 2026-02-13
- [x] Only generates when R≥3 AND C≥2 AND sources≥2 AND c_unique_users≥2 ✅ 2026-02-13
- [x] Filters out pattern observations (type: pattern) ✅ 2026-02-13
- [x] Creates draft constraint with correct format ✅ 2026-02-13
- [x] Uses severity-tagger to assign severity ✅ 2026-02-13
- [x] Uses positive-framer for rule transformation ✅ 2026-02-13
- [x] Links back to source observation ✅ 2026-02-13
- [x] Generates semantic scope from failure evidence ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (66 passed) ✅ 2026-02-13

---

## Stage 4: Constraint Lifecycle (constraint-lifecycle)

**Goal**: Manage constraint state transitions through their lifecycle.

### constraint-lifecycle Skill

**Location**: `projects/live-neon/skills/agentic/core/constraint-lifecycle/SKILL.md`

Manage constraint state machine: draft → active → retiring → retired.

**State Machine**:
```
draft ──────► active ──────► retiring ──────► retired
  │             │               │
  │             │               └──► active (if still needed)
  │             │
  │             └──► retired (emergency deprecation)
  │
  └──► deleted (never activated)
```

**Specification**:
- **Input**: Constraint ID + action (activate, retire, delete, etc.)
- **Output**: Updated constraint file, moved to appropriate directory

**Directory Structure**:
```
docs/constraints/
├── draft/      # Candidates pending review
├── active/     # Currently enforced
├── retiring/   # 90-day sunset period
└── retired/    # Historical reference
```

**Commands**:
```
/constraint-lifecycle activate <constraint-id>    # draft → active
/constraint-lifecycle retire <constraint-id>      # active → retiring
/constraint-lifecycle complete-retire <id>        # retiring → retired
/constraint-lifecycle emergency-retire <id>       # active → retired (skip retiring)
/constraint-lifecycle reactivate <constraint-id>  # retiring → active
/constraint-lifecycle rollback <constraint-id>    # active → draft (for faulty constraints)
/constraint-lifecycle delete <constraint-id>      # draft → deleted
/constraint-lifecycle status <constraint-id>      # Show current state
```

**Retirement Criteria** (N=2 code review finding):
| Trigger | Action | Effect |
|---------|--------|--------|
| Manual request | `retire <id>` | Enters 90-day retiring period |
| D count > C count | Auto-suggest retirement | Human approval required |
| 90 days without violations | Auto-suggest complete-retire | Human approval required |
| No activity in 180 days | Auto-suggest retirement | Human approval required |

**Retirement Effects**:
- `retiring`: Constraint still enforced, but with INFO-level warnings instead of blocks
- `retired`: Constraint no longer enforced, kept for historical reference

**State Synchronization** (N=2 code review finding):
When constraint state changes, lifecycle MUST synchronize:
1. Update `.circuit-state.json` - clear/archive circuit for retired constraints
2. Update `.overrides.json` - invalidate overrides for retired constraints
3. Notify dependent skills (circuit-breaker, contextual-injection)

**Rollback Mechanism** (N=2 code review finding):
If an activated constraint causes problems:
- `rollback <id>`: Moves constraint back to draft for review
- Preserves original observation link for re-evaluation
- Creates audit entry explaining rollback reason

**Integration**:
- **Layer**: Core
- **Depends on**: constraint-generator (receives draft constraints)
- **Provides to**: constraint-enforcer, circuit-breaker, contextual-injection
- **Used by**: constraint-reviewer (Phase 4), governance-state (Phase 4)

### Acceptance Criteria

- [x] All state transitions work correctly ✅ 2026-02-13
- [x] Files moved to appropriate directories ✅ 2026-02-13
- [x] Audit trail maintained (who, when, why) ✅ 2026-02-13
- [x] Emergency retire bypasses 90-day period ✅ 2026-02-13
- [x] Rollback moves active → draft with audit ✅ 2026-02-13
- [x] State synchronization updates circuit-state and overrides files ✅ 2026-02-13
- [x] Status command shows full history ✅ 2026-02-13
- [x] Reactivation supported during retiring period ✅ 2026-02-13
- [x] Enforcement modes: BLOCK (active), WARN (retiring), NONE (draft/retired) ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (94 passed) ✅ 2026-02-13

---

## Stage 5: Circuit Breaker (circuit-breaker)

**Goal**: Prevent violation loops by tracking and tripping on repeated violations.

### circuit-breaker Skill

**Location**: `projects/live-neon/skills/agentic/core/circuit-breaker/SKILL.md`

Track constraint violations and trip when threshold exceeded.

**States** (from ARCHITECTURE.md):
- **CLOSED**: Normal operation, actions allowed
- **OPEN**: Actions blocked, human notified (5 violations in 30 days)
- **HALF-OPEN**: Testing period after cooldown (24h), single violation → OPEN

**Threshold Rationale** (N=2 twin review finding):
- **30-day window**: Captures monthly work cycles; violations spread over months indicate
  sporadic issues (warning-worthy, not blocking), while 5 in 30 days indicates systematic problem
- **5-violation threshold**: Balances sensitivity with noise tolerance; 3 could trip on legitimate
  edge cases, 10 would allow too many violations before intervention
- **24-hour cooldown**: Allows time for human investigation and fixes; shorter cooldown risks
  retripping on the same underlying issue; longer delays recovery unnecessarily

**Research Gate RG-1**: These thresholds are derived from internal observation (Destructive Git Ops N=5)
but lack external validation. See `../proposals/2026-02-13-agentic-skills-specification.md#rg-1-circuit-breaker-parameters-phase-2`
for required research on industry circuit breaker patterns (Hystrix, Resilience4j). If proceeding
with provisional status, document threshold assumptions in results file.

**Specification**:
- **Input**: Wraps constraint-enforcer calls
- **Output**: Same as constraint-enforcer, plus circuit state

**Per-Constraint Tracking**:
Each constraint has its own circuit breaker state. One tripped circuit doesn't
affect other constraints.

**Rolling Window Implementation** (N=2 code review finding):
- **Time source**: UTC (consistent across environments)
- **Window calculation**: Violations older than 30 days excluded from count
- **Deduplication**: Same action within 60 seconds counts as 1 violation (prevents rapid-fire trips)
  - *Note*: Consider 300 seconds (5 min) if users need time to read error, think, and retry
  - Configurable per-constraint via optional `dedup_window_seconds` in constraint frontmatter
- **Retention**: All violations kept for history; only violations in window counted for trip

**File Locking** (N=2 code review finding):
State file updates use atomic write-and-rename pattern:
1. Write to `.circuit-state.json.tmp`
2. Rename to `.circuit-state.json` (atomic on POSIX)
3. For concurrent access: use OS-level flock if available, else retry with backoff

**State File Format** (`docs/constraints/.circuit-state.json`):
```json
{
  "git-safety-force-push": {
    "state": "CLOSED",
    "violations": [
      {"date": "2026-02-10", "action": "git push -f"},
      {"date": "2026-02-12", "action": "force push to main"}
    ],
    "last_trip": null,
    "last_reset": "2026-02-01"
  }
}
```

**Commands**:
```
/circuit-breaker status                    # Show all circuit states
/circuit-breaker status <constraint-id>    # Show specific circuit
/circuit-breaker reset <constraint-id>     # Manual reset to CLOSED
/circuit-breaker history <constraint-id>   # Show violation history
```

**Integration**:
- **Layer**: Core
- **Depends on**: constraint-enforcer (wraps it)
- **Used by**: emergency-override (can bypass tripped circuits)

### Acceptance Criteria

- [x] Tracks violations per constraint ✅ 2026-02-13
- [x] Trips to OPEN after 5 violations in 30 days ✅ 2026-02-13
- [x] OPEN state blocks actions and notifies human ✅ 2026-02-13
- [x] HALF-OPEN state after 24h cooldown ✅ 2026-02-13
- [x] Manual reset works ✅ 2026-02-13
- [x] Rolling 30-day window (not all-time) ✅ 2026-02-13
- [x] Per-constraint configuration override support ✅ 2026-02-13
- [x] Deduplication prevents rapid-retry penalty ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (125 passed) ✅ 2026-02-13

---

## Stage 6: Emergency Override (emergency-override)

**Goal**: Allow temporary bypass of constraints/circuits with full audit trail.

### emergency-override Skill

**Location**: `projects/live-neon/skills/agentic/core/emergency-override/SKILL.md`

Temporarily bypass constraints with human approval and audit trail.

**Specification**:
- **Input**: Constraint ID, reason, duration
- **Output**: Override record with expiry

**Override Record** (`docs/constraints/.overrides.json`):
```json
{
  "overrides": [
    {
      "id": "override-2026-02-13-001",
      "constraint_id": "git-safety-force-push",
      "reason": "Emergency hotfix deployment",
      "approved_by": "human",
      "created": "2026-02-13T10:30:00Z",
      "expires": "2026-02-13T11:30:00Z",
      "used": false
    }
  ]
}
```

**Commands**:
```
/emergency-override create <constraint-id> --reason "..." --duration 1h
/emergency-override list                   # Show active overrides
/emergency-override revoke <override-id>   # Cancel before expiry
/emergency-override history                # Show all overrides (audit)
```

**Safety Requirements**:
1. Requires explicit human approval (cannot be auto-approved)
2. Maximum duration: 24 hours
3. Single-use by default (override consumed after one bypass)
4. Full audit trail (who, when, why, what action taken)

**Human Approval Mechanism** (N=2 CRITICAL code review finding):

The AI CANNOT self-approve overrides. Approval workflow:

```
1. AI requests override:
   /emergency-override create git-safety-force-push --reason "Emergency hotfix"

2. System BLOCKS and prompts human:
   ┌─────────────────────────────────────────────────────────────┐
   │ EMERGENCY OVERRIDE REQUEST                                   │
   │                                                              │
   │ Constraint: git-safety-force-push (CRITICAL)                │
   │ Reason: Emergency hotfix                                    │
   │ Duration: 1 hour (max 24h)                                  │
   │ Single-use: Yes                                             │
   │                                                              │
   │ This will allow ONE bypass of the constraint.               │
   │                                                              │
   │ Type 'APPROVE' to confirm, or 'DENY' to reject:             │
   └─────────────────────────────────────────────────────────────┘

3. Human types 'APPROVE' (exact match required)

4. System generates time-limited approval token:
   - Token: base64(constraint_id + timestamp + random + HMAC)
   - Expires: created + duration
   - Stored in .overrides.json with approval_method: "interactive"
```

**Approval Methods** (extensible):
| Method | Security | Use Case |
|--------|----------|----------|
| `interactive` | High | CLI prompt, human types APPROVE |
| `signed_token` | High | Pre-generated token from auth system |
| `callback` | Medium | External approval service webhook |

**Implementation Notes**:
- Interactive prompt MUST block execution until human responds
- Prompt MUST be rendered to terminal (not swallowed by AI)
- Timeout after 5 minutes of no response → request denied
- AI responses to prompt (e.g., "APPROVE" in AI message) MUST be rejected
- Only direct terminal input from human accepted

**Trust Boundary Implementation** (N=2 twin review finding):

The challenge: In a REPL where AI generates text, how do we distinguish human terminal
input from AI-generated "APPROVE" strings?

**Research Reference**: See `projects/live-neon/neon-soul/docs/research/chat-interaction-patterns.md`
for validated patterns (N=2+) on human-AI handoff, explicit approval phrases, and the Governor pattern.

**Key insight from research**: Use explicit approval phrases with "(human)" marker to distinguish
from AI approvals in agent chains. The five-stage handoff (Request → Refinement → Approval →
Execution → Acknowledgment) with explicit Stage 3 approval gate is validated at N=2+.

**Recommended Approach: Challenge-Response with Random Token**

```
1. System generates random 6-character token: "X7K9M2"
2. Prompt displays:
   ┌─────────────────────────────────────────────────────────────┐
   │ To approve, type this exact code: X7K9M2                   │
   │ (This code is randomly generated and not visible to AI)    │
   └─────────────────────────────────────────────────────────────┘
3. Human types: X7K9M2
4. System validates exact match
```

**Why this works**:
- Token is generated AFTER AI's last response, invisible to AI context
- AI cannot predict or reproduce the random token
- Requires out-of-band human action (reading screen, typing token)

**Alternative Approaches** (if challenge-response not feasible):

| Approach | Security | Complexity | Use When |
|----------|----------|------------|----------|
| Challenge-response | High | Medium | Default - recommended |
| Time-gated (min 10s delay) | Medium | Low | Fallback for simple cases |
| External confirmation | High | High | High-security environments |

**Time-gated approach**: Require minimum 10 seconds between prompt display and
response acceptance. Humans need time to read; AI responds instantly. Not foolproof
but adds friction.

**External confirmation**: Webhook to separate approval service, email confirmation,
or mobile push notification. Most secure but adds infrastructure complexity.

**Override Record** (updated with approval tracking):
```json
{
  "overrides": [
    {
      "id": "override-2026-02-13-001",
      "constraint_id": "git-safety-force-push",
      "reason": "Emergency hotfix deployment",
      "approval_method": "interactive",
      "approval_timestamp": "2026-02-13T10:29:45Z",
      "approved_by": "human_terminal",
      "created": "2026-02-13T10:30:00Z",
      "expires": "2026-02-13T11:30:00Z",
      "used": false,
      "used_for": null
    }
  ]
}
```

**File Locking** (N=2 code review finding):
Same atomic write-and-rename pattern as circuit-state.json.

**Integration**:
- **Layer**: Core
- **Depends on**: constraint-enforcer, circuit-breaker
- **Used by**: Workflow skills that need emergency bypass

### Acceptance Criteria

- [x] Creates override with expiry ✅ 2026-02-13
- [x] Requires human approval (challenge-response with random token) ✅ 2026-02-13
- [x] Single-use override consumed after use ✅ 2026-02-13
- [x] Expired overrides rejected ✅ 2026-02-13
- [x] Full audit trail maintained ✅ 2026-02-13
- [x] Maximum 24h duration enforced ✅ 2026-02-13
- [x] Token generation secure (6-char, non-ambiguous charset) ✅ 2026-02-13
- [x] 5-minute timeout auto-denies request ✅ 2026-02-13
- [x] Override state machine (REQUESTED→ACTIVE→USED/EXPIRED/REVOKED) ✅ 2026-02-13
- [x] Integration with constraint-enforcer and circuit-breaker ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (177 passed) ✅ 2026-02-13

---

## Stage 7: Memory Search (memory-search)

**Goal**: Query the observation and constraint memory system.

### memory-search Skill

**Location**: `projects/live-neon/skills/agentic/core/memory-search/SKILL.md`

Search across observations and constraints using semantic similarity.

**Classification Method**: LLM-based semantic similarity (NOT pattern matching)
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

Semantic search means "force push safety" finds constraints about `git push --force`
even if those exact words don't appear. The LLM understands semantic equivalence.

**Specification**:
- **Input**: Query string + filters
- **Output**: Ranked results with relevance scores

**Search Modes**:
```
/memory-search "force push safety"                    # Semantic search
/memory-search --tag git --status active              # Filter search
/memory-search --type observation --min-r 3           # Type + threshold
/memory-search --file src/git/*.ts                    # File pattern
```

**Output Format**:
```
Found 3 results for "force push safety":

1. [CONSTRAINT] git-safety-force-push (relevance: 0.94)
   Status: active | Severity: critical
   Path: docs/constraints/active/git-safety-force-push.md

2. [OBSERVATION] git-force-push-without-confirmation (relevance: 0.87)
   Status: active | R=5, C=3, D=0
   Path: docs/observations/git-force-push-without-confirmation.md

3. [OBSERVATION] git-history-rewrite-patterns (relevance: 0.72)
   Status: pattern | R=2, C=1, D=0
   Path: docs/observations/git-history-rewrite-patterns.md
```

**Integration**:
- **Layer**: Core
- **Depends on**: context-packet (for result hashing/validation)
- **Used by**: contextual-injection, all workflow skills

**Cross-Reference**: See `projects/live-neon/skills/agentic/core/context-packet/SKILL.md` for
packet schema used in search result validation.

### Acceptance Criteria

- [x] Semantic search returns relevant results ✅ 2026-02-13
- [x] Filter by type (observation/constraint) ✅ 2026-02-13
- [x] Filter by status, tags, severity ✅ 2026-02-13
- [x] Filter by R/C/D thresholds ✅ 2026-02-13
- [x] File pattern matching (glob) ✅ 2026-02-13
- [x] Recent activity filtering ✅ 2026-02-13
- [x] Results ranked by relevance (0.0-1.0) ✅ 2026-02-13
- [x] Minimum relevance threshold (0.60) ✅ 2026-02-13
- [x] Filter validation ✅ 2026-02-13
- [x] Index management (create, rebuild check) ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (228 passed) ✅ 2026-02-13

---

## Stage 8: Context Loading (contextual-injection, progressive-loader)

**Goal**: Intelligently load relevant constraints and documentation.

### 8A: contextual-injection Skill

**Location**: `projects/live-neon/skills/agentic/core/contextual-injection/SKILL.md`

Load relevant constraints based on current working context.

**Classification Method**: LLM-based semantic similarity for tag/domain matching
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

File patterns use glob matching (acceptable for file selection), but tag and domain
matching use semantic similarity. A constraint tagged "version-control" should match
context involving "git" or "source code management".

**Specification**:
- **Input**: Current file paths, workflow stage, session context
- **Output**: List of relevant constraints to inject into prompt

**Matching Criteria**:
- File patterns in constraint scope
- Tags matching current domain
- Workflow stage (planning, implementing, reviewing)
- Historical violations in current session

**Output**:
```
Injecting 3 constraints for context [src/git/push.ts, planning]:

1. git-safety-force-push (critical)
   - Matched: file pattern src/git/*.ts

2. plan-approve-implement (important)
   - Matched: workflow stage "planning"

3. code-review-required (important)
   - Matched: tag "git"
```

**Integration**:
- **Layer**: Core
- **Depends on**: constraint-enforcer, memory-search
- **Used by**: Session initialization, workflow skills

### 8B: progressive-loader Skill

**Location**: `projects/live-neon/skills/agentic/core/progressive-loader/SKILL.md`

Defer loading of low-priority documentation to reduce context usage.

**Specification**:
- **Input**: Document list with priorities
- **Output**: Staged loading plan

**Priority Levels** (with examples):
| Priority | Load Timing | Examples |
|----------|-------------|----------|
| **Critical** | Immediately | Safety constraints (git-safety-*), active error context, CRITICAL severity |
| **High** | After critical | File-matched constraints, session violations, IMPORTANT severity |
| **Medium** | On demand | Related observations (R≥2), historical patterns, MINOR severity |
| **Low** | Deferred | Reference docs, examples, retired constraints, pattern observations |

**Assignment Criteria**:
- Constraint severity → priority mapping (CRITICAL→Critical, IMPORTANT→High, MINOR→Medium)
- File pattern match → +1 priority level
- Session violation history → +1 priority level
- Pattern observations always Low (not actionable)

**Commands**:
```
/progressive-loader plan docs/constraints/ docs/observations/
/progressive-loader load-next                    # Load next priority tier
/progressive-loader status                       # Show load plan
```

**Integration**:
- **Layer**: Core
- **Depends on**: None (foundational loading)
- **Used by**: Session initialization, contextual-injection

### Acceptance Criteria

- [x] contextual-injection matches by file patterns ✅ 2026-02-13
- [x] contextual-injection matches by workflow stage ✅ 2026-02-13
- [x] contextual-injection matches by tags (domain inference) ✅ 2026-02-13
- [x] contextual-injection priority calculation works ✅ 2026-02-13
- [x] progressive-loader creates staged load plan ✅ 2026-02-13
- [x] progressive-loader defers low-priority loads ✅ 2026-02-13
- [x] progressive-loader token estimation works ✅ 2026-02-13
- [x] progressive-loader tier boosting and forcing works ✅ 2026-02-13
- [x] Load status tracking works ✅ 2026-02-13
- [x] Tests added to skill-behavior.test.ts (292 passed) ✅ 2026-02-13

---

## Stage 9: Integration Testing

**Goal**: Verify the complete failure→constraint lifecycle works end-to-end.

### Integration Test Scenarios

#### Scenario 1: Failure to Constraint Flow

```
1. failure-tracker records failure (R=1)
2. Same failure detected twice more (R=3)
3. Human confirms twice (C=2)
4. constraint-generator creates draft
5. constraint-lifecycle activates constraint
6. constraint-enforcer blocks violating action
```

#### Scenario 2: Circuit Breaker Trip and Recovery

```
1. Constraint active, circuit CLOSED
2. 5 violations in 30 days
3. circuit-breaker trips to OPEN
4. Human notified, actions blocked
5. 24h cooldown → HALF-OPEN
6. No violations → CLOSED
```

#### Scenario 3: Emergency Override Flow

```
1. Circuit tripped (OPEN)
2. emergency-override created with approval
3. Single action bypasses circuit
4. Override consumed
5. Circuit remains OPEN
6. Full audit trail created
```

#### Scenario 4: Context Loading Flow (N=2 code review finding)

```
1. progressive-loader categorizes docs by priority
2. Critical docs loaded immediately
3. memory-search finds relevant constraints
4. contextual-injection matches by file pattern
5. contextual-injection matches by workflow stage
6. Constraints injected into session context
```

#### Scenario 5: Constraint Retirement Flow (N=2 code review finding)

```
1. Active constraint with D > C count
2. System suggests retirement
3. Human approves retirement
4. constraint-lifecycle transitions to retiring
5. 90-day sunset period (warnings, not blocks)
6. complete-retire transitions to retired
7. circuit-state and overrides synchronized
```

### Tasks

- [x] Create integration test file: `tests/e2e/phase2-integration.test.ts` ✅ 2026-02-13
- [x] Implement Scenario 1 test (failure→constraint flow) ✅ 2026-02-13
- [x] Implement Scenario 2 test (circuit breaker trip/recovery) ✅ 2026-02-13
- [x] Implement Scenario 3 test (emergency override) ✅ 2026-02-13
- [x] Implement Scenario 4 test (context loading) ✅ 2026-02-13
- [x] Implement Scenario 5 test (constraint retirement) ✅ 2026-02-13
- [x] Verify all 9 skills load correctly ✅ 2026-02-13
- [x] Update ARCHITECTURE.md Core Memory layer ✅ 2026-02-13
- [x] Document results in `docs/implementation/agentic-phase2-results.md` ✅ 2026-02-13

### Acceptance Criteria

- [x] All 9 Core Memory skills have SKILL.md ✅ 2026-02-13
- [x] All SKILL.md files comply with MCE limits (≤300 lines for markdown docs) ✅ 2026-02-13
- [x] All skills load in Claude Code ✅ 2026-02-13
- [x] Failure→constraint flow works end-to-end (Scenario 1) ✅ 2026-02-13
- [x] Circuit breaker trips and recovers correctly (Scenario 2) ✅ 2026-02-13
- [x] Emergency override requires human approval, creates audit trail (Scenario 3) ✅ 2026-02-13
- [x] Context loading prioritizes correctly (Scenario 4) ✅ 2026-02-13
- [x] Constraint retirement synchronizes state files (Scenario 5) ✅ 2026-02-13
- [x] All 5 integration test scenarios pass (30 tests) ✅ 2026-02-13

---

## Verification Gate

**Phase 2 Complete** ✅ 2026-02-13

### Research Gate Status
- [x] RG-1 (Circuit breaker): Resolved ✅ 2026-02-13
- [x] RG-3 (Semantic similarity): Resolved ✅ 2026-02-13
- [x] RG-5 (Human confirmation): Resolved ✅ 2026-02-13
- [x] RG-8 (LLM testing): Resolved ✅ 2026-02-13

### Implementation Checklist
- [x] All 14 core skills complete (5 Phase 1 + 9 Phase 2) ✅ 2026-02-13
- [x] Deferred items resolved:
  - [x] `algorithm:hash` format in file-verifier ✅ 2026-02-13
  - [x] Behavioral tests implemented (with fixture fallback for CI) ✅ 2026-02-13
- [x] Code review findings addressed:
  - [x] Emergency override has interactive human approval mechanism ✅ 2026-02-13
  - [x] Dependency graph is unidirectional (no inversions) ✅ 2026-02-13
  - [x] Constraint gate prevents pattern→constraint promotion ✅ 2026-02-13
  - [x] State file updates use atomic write-and-rename ✅ 2026-02-13
  - [x] Retirement criteria and effects defined ✅ 2026-02-13
  - [x] Rollback mechanism implemented ✅ 2026-02-13
- [x] Integration tests pass (5 scenarios):
  - [x] Scenario 1: failure→R=3+eligibility→constraint flow ✅ 2026-02-13
  - [x] Scenario 2: circuit-breaker trips at 5 violations in 30d ✅ 2026-02-13
  - [x] Scenario 3: emergency-override requires human approval, creates audit trail ✅ 2026-02-13
  - [x] Scenario 4: context loading prioritizes correctly ✅ 2026-02-13
  - [x] Scenario 5: constraint retirement synchronizes state ✅ 2026-02-13
- [x] ARCHITECTURE.md Core Memory layer populated ✅ 2026-02-13
- [x] Results documented in `docs/implementation/agentic-phase2-results.md` ✅ 2026-02-13

---

## Timeline

| Stage | Description | Duration | Notes |
|-------|-------------|----------|-------|
| Stage 1 | Deferred items (algorithm:hash, behavioral tests) | 3-4 hours | Includes fixture setup |
| Stage 2 | failure-tracker, observation-recorder | 3-4 hours | |
| Stage 3 | constraint-generator | 3-4 hours | +severity/positive-framer integration |
| Stage 4 | constraint-lifecycle | 4-5 hours | +retirement criteria, state sync, rollback |
| Stage 5 | circuit-breaker | 3-4 hours | +file locking, window implementation |
| Stage 6 | emergency-override | 4-5 hours | +interactive approval mechanism (complex) |
| Stage 7 | memory-search | 2-3 hours | |
| Stage 8 | contextual-injection, progressive-loader | 3-4 hours | |
| Stage 9 | Integration testing | 4-6 hours | 5 scenarios (N=2 review: may need more) |

**Total**: 4-6 days (serial execution)

**Parallelization Opportunities** (N=2 twin review finding):

If two implementers are available, these stages can run in parallel:

| Parallel Track A | Parallel Track B | Dependency |
|------------------|------------------|------------|
| Stage 1 (deferred items) | - | Must complete first |
| Stage 2 (failure/observation) | - | Needs Stage 1 |
| Stage 3 (constraint-gen) | Stage 7 (memory-search) | No interdependency |
| Stage 4 (lifecycle) | Stage 8 (context loading) | No interdependency |
| Stage 5 (circuit-breaker) | - | Needs Stage 4 |
| Stage 6 (emergency-override) | - | Needs Stage 5 |
| Stage 9 (integration) | - | Needs all above |

**Parallel Timeline**: 3-4 days with two implementers
**Serial Timeline**: 4-6 days with single implementer (current assumption)

**Note** (N=2 code review): Timeline adjusted upward from 3-5 days. Phase 1 identified
gaps post-implementation, and Phase 2 has more complex integrations (circuit-breaker,
emergency-override approval). Buffer included for debugging integration issues.

---

## Cross-References

### Specification & Plans
- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Phase 1 Plan**: `../plans/2026-02-13-agentic-skills-phase1-implementation.md`
- **Phase 1 Results**: `projects/live-neon/skills/docs/implementation/agentic-phase1-results.md`

### Code Reviews (N=2 External)
- **Codex Review**: `../reviews/2026-02-13-phase2-plan-codex.md`
- **Gemini Review**: `../reviews/2026-02-13-phase2-plan-gemini.md`

### Twin Reviews (N=2 Internal)
- **Technical Review**: `../reviews/2026-02-13-phase2-plan-twin-technical.md`
- **Creative Review**: `../reviews/2026-02-13-phase2-plan-twin-creative.md`

### Guides
- **Architecture Guide**: `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v5.2)
- **Semantic Similarity Guide**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`
- **Documentation Update Workflow**: `projects/live-neon/skills/docs/workflows/documentation-update.md`

### Research (Existing - Human Approval Patterns)
- **Chat Interaction Patterns**: `projects/live-neon/neon-soul/docs/research/chat-interaction-patterns.md`
  - Section 2.2: Explicit vs Implicit Approval (N=2 validated)
  - Section 2.3: The Governor Pattern (preview, confirm, audit)
  - Section 2.5: Anti-Patterns (premature execution, implicit acceptance)

### Research (Gaps - To Be Created)
- **RG-1**: `circuit-breaker-patterns.md` - Industry patterns (Hystrix, Resilience4j) for threshold validation
- **RG-3**: `semantic-similarity-thresholds.md` - Confidence calibration for constraint matching
- **RG-5**: `human-confirmation-bias.md` - Cognitive biases in human-AI feedback loops
- **RG-8**: `llm-behavioral-testing.md` - Testing strategies for LLM classification systems

### Architecture
- **Skills ARCHITECTURE.md**: `projects/live-neon/skills/ARCHITECTURE.md`
- **Skill Template**: `projects/live-neon/skills/agentic/SKILL_TEMPLATE.md`

### Observation Evidence
- **Configuration-as-Code** (N=9): `docs/observations/configuration-as-code-type-safety.md`
- **Destructive Git Ops** (N=5): `docs/observations/2025-11-11-git-destructive-operations-without-confirmation.md`
- **Plan-Approve-Implement** (N=4): `docs/observations/plan-approve-implement-workflow-violation.md`

---

## Appendix A: Troubleshooting Guide

Common issues and resolutions for Phase 2 skills (N=2 twin review finding).

### Failure-Tracker Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| R counter not incrementing | Semantic similarity threshold | Lower similarity threshold if different wordings mean same failure |
| Observation file not created | context-packet dependency | Verify context-packet skill is loaded and generating packets |
| Source diversity not tracking | Session/file detection | Check session ID and file path extraction in context |

### Constraint-Generator Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Constraint not generating | R/C/D counts | Verify R≥3 AND C≥2 AND sources≥2 |
| Wrong severity assigned | severity-tagger integration | Check severity-tagger is being called |
| Pattern observation promoted | type field | Ensure observation has `type: failure`, not `type: pattern` |

### Circuit-Breaker Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Not tripping at 5 violations | Rolling window | Verify UTC time source; old violations may have aged out |
| Tripping too quickly | Deduplication window | Same action within 60s should count as 1, not N |
| State file corruption | Atomic write | Check `.circuit-state.json.tmp` for failed writes |
| Race condition errors | File locking | Implement flock or retry-with-backoff |

### Emergency-Override Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Override request hanging | Terminal detection | Ensure prompt renders to terminal, not AI context |
| AI bypassing approval | Challenge token | Verify random token is generated AFTER AI response |
| Override not consumed | Single-use flag | Check `used: true` set after first use |
| Expired override accepted | Timestamp comparison | Verify UTC time comparison in validation |

### Constraint-Lifecycle Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| State not syncing | Dependent files | Verify `.circuit-state.json` and `.overrides.json` updated |
| Retired constraint still enforcing | contextual-injection cache | Clear cache or restart session |
| Rollback not working | Audit trail | Check rollback creates audit entry; verify file moves |

### Memory-Search Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| No results for valid query | Index freshness | Regenerate index if observations/constraints changed |
| Wrong relevance scores | Semantic model | Check LLM is performing semantic comparison, not string match |
| Filters not working | Query syntax | Verify correct `--tag`, `--status`, `--type` flags |

### Context-Loading Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Critical docs not loading | Priority assignment | Verify CRITICAL severity maps to Critical priority |
| Context overflow | progressive-loader | Check deferred loading is enabled; reduce batch size |
| Wrong constraints injected | File pattern matching | Verify glob patterns in constraint scope |

---

## Appendix B: Phase-Level Rollback Strategy

What to do if Phase 2 integration fails (N=2 twin review finding).

### Isolation Guarantee

Phase 2 skills are isolated in `projects/live-neon/skills/agentic/core/`:
```
agentic/core/
├── failure-tracker/       # Phase 2
├── observation-recorder/  # Phase 2
├── constraint-generator/  # Phase 2
├── constraint-lifecycle/  # Phase 2
├── circuit-breaker/       # Phase 2
├── emergency-override/    # Phase 2
├── memory-search/         # Phase 2
├── contextual-injection/  # Phase 2
├── progressive-loader/    # Phase 2
├── context-packet/        # Phase 1 (unchanged)
├── file-verifier/         # Phase 1 (unchanged)
├── constraint-enforcer/   # Phase 1 (unchanged)
├── severity-tagger/       # Phase 1 (unchanged)
└── positive-framer/       # Phase 1 (unchanged)
```

### Rollback Procedure

If Phase 2 integration testing reveals fundamental issues:

1. **Identify failure scope**: Which skills are failing? Is it isolated or systemic?

2. **Preserve learnings**:
   - Keep test failure observations in `docs/observations/failures/`
   - Document failure modes in `docs/implementation/agentic-phase2-results.md`

3. **Disable Phase 2 skills**:
   ```bash
   # Option A: Remove from load path (soft disable)
   # Edit skills loader to skip Phase 2 directories

   # Option B: Git revert (hard disable)
   git revert <phase2-commits>
   ```

4. **Verify Phase 1 intact**:
   - Run Phase 1 tests: `npm test -- --grep "Phase 1"`
   - Verify 5 Foundation skills still load and function

5. **Root cause analysis**:
   - Which integration point failed?
   - Was it skill-to-skill dependency or external integration?
   - Document in observation for future attempt

### Rollback Commits

If git revert needed, Phase 2 commits are isolated:
- Skills are in separate directories (no Phase 1 file modifications)
- State files (`.circuit-state.json`, `.overrides.json`) can be deleted
- ARCHITECTURE.md Core Memory section can be removed

### Recovery Path

After rollback:
1. Address root cause in isolation (single skill)
2. Re-test skill independently before integration
3. Incremental integration (skills 1-3, then 4-6, then 7-9)
4. Document what was learned for next attempt

---

*Plan created 2026-02-13. Implements Phase 2 of Agentic Skills Specification.*
*Updated 2026-02-13: Addressed N=2 code review findings (14 items - 1 critical, 7 important, 6 minor).*
*Updated 2026-02-13: Addressed N=2 twin review findings (7 important + 7 minor items).*
*Updated 2026-02-13: Added Research Gates section (4 gates: RG-1, RG-3, RG-5, RG-8) with resolution options.*
*Total review coverage: N=4 (Codex + Gemini + Twin Technical + Twin Creative).*
