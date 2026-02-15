---
created: 2026-02-14
type: plan
status: complete
priority: medium
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-13-agentic-skills-phase3-implementation.md
depends_on:
  - ../plans/2026-02-13-agentic-skills-phase3-implementation.md
related_guides:
  - artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md
related_research:
  - projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md
reviews:
  - type: code-review
    date: 2026-02-14
    reviewers: [codex-gpt51, gemini-2.5-pro]
    findings: ../reviews/2026-02-14-phase4-plan-codex.md, ../reviews/2026-02-14-phase4-plan-gemini.md
    status: remediated
  - type: twin-review
    date: 2026-02-14
    reviewers: [twin-technical, twin-creative]
    status: remediated
    decisions:
      - Event-driven governance over dashboard-driven (user decision)
      - Ed25519 signing retained (technical twin: reasonable complexity)
  - type: implementation-review
    date: 2026-02-14
    reviewers: [codex-gpt51, gemini-2.5-pro]
    findings: ../reviews/2026-02-14-phase4-implementation-codex.md, ../reviews/2026-02-14-phase4-implementation-gemini.md
    issue: ../issues/2026-02-14-phase4-code-review-findings.md
    status: open
    summary: 20 findings (2 critical, 6 important, 12 minor), no blocking issues
---

# Agentic Skills Phase 4: Governance & Safety Implementation

<!-- SECTION: cjk-summary -->
**治安層**: Phase 4 implements 8 Governance & Safety skills (event-driven primary)
**Governance**: constraint-reviewer (審), index-generator (索), round-trip-tester (往), governance-state (治)
**Safety**: model-pinner (固), fallback-checker (退), cache-validator (快), adoption-monitor (容)
**Additions**: packet-signing (署), observability (観), version-migration (版), cleanup (掃)
**Flow**: 治→審→索 (state→review→index) + 固→退→快 (pin→fallback→cache)
**When to use**: Constraint stale? → 審. Cache invalid? → 快. Model drift? → 固. System health? → 観.
<!-- END SECTION: cjk-summary -->

## Summary

### Why This Matters

Phases 1-3 built the memory and detection systems: failures become observations, observations
become constraints, constraints get enforced. But who ensures constraints don't become stale?
Who verifies model versions haven't drifted? Who handles graceful degradation when systems fail?

Phase 4 builds the **Governance & Safety** layer:
- **Governance Skills** manage the long-term health of constraints using **event-driven** approach:
  stale constraints auto-create issues, dormant constraints auto-retire, attention pulled only when needed.
  Dashboards available for deep-dives but not required for daily operation.
- **Safety Skills** protect runtime integrity—model pinning prevents version drift,
  fallback strategies ensure graceful degradation, cache validation prevents stale data (fail-closed)

This layer is the immune system of the agentic memory—it maintains health over time and
protects against degradation. Invisible until failure, then actionable.

### What We're Building

Implement 8 Governance & Safety layer skills plus 4 review-identified additions:

**Core Skills (8)**:
- 4 Governance skills: constraint-reviewer, index-generator, round-trip-tester, governance-state
- 4 Safety skills: model-pinner, fallback-checker, cache-validator, adoption-monitor

**Review-Identified Additions (4)**:
- Packet signing (identified in Phase 1 code review)
- Observability/Metrics (identified in Phase 2 twin review)
- Version migration strategy (identified in Phase 2 twin review)
- Cleanup/Maintenance (identified in Phase 2 twin review)

**Specification**: See `../proposals/2026-02-13-agentic-skills-specification.md#phase-4-governance--safety-8-skills`

**Phase 3 Results**: See `projects/live-neon/skills/docs/implementation/agentic-phase3-results.md`

### How Users Will Interact

**Architectural Decision**: Event-driven primary, dashboard secondary. See specification for rationale.

**For governance (event-driven - primary)**:
1. Constraint dormant for 90 days triggers automatic issue creation (`docs/issues/governance-alert-*.md`)
2. Developer sees issue in normal workflow (GitHub, grep, etc.)
3. Developer runs `/constraint-reviewer keep <id>` to preserve, OR closes issue (auto-retire)
4. No dashboard required for normal operation—governance is invisible until attention needed

**For governance (dashboard - secondary)**:
1. User runs `/governance-state dashboard` for periodic deep-dive
2. System shows constraints due for review, dormant constraints, state distribution
3. User runs `/constraint-reviewer check <constraint-id>` for specific review
4. 90-day review gate prompts: keep active, retire, or modify?

**For safety**:
1. `model-pinner` ensures consistent model versions across sessions
2. `fallback-checker` verifies graceful degradation paths exist
3. `cache-validator` detects stale cached responses (fail-closed on uncertainty)
4. Anomalies create issues automatically; `/adoption-monitor status` for deep-dive

**For packet signing**:
1. `context-packet` now signs output with cryptographic signature
2. `file-verifier` validates packet authenticity before processing
3. Tampering detected and rejected with audit trail

---

## Prerequisites

### Phase 3 Completion (Specification Gates)

From `../proposals/2026-02-13-agentic-skills-specification.md` lines 564-569:

- [x] All 24 skills complete (5 Phase 1 + 9 Phase 2 + 10 Phase 3)
- [x] Review skills integrate with existing twin-review workflow
- [x] Detection skills integrate with failure-tracker
- [x] Metrics skill produces dashboard output

From Phase 3 results (`agentic-phase3-results.md`):

- [x] All 10 Phase 3 skills have SKILL.md
- [x] All SKILL.md files comply with MCE limits (max 215 lines)
- [x] Integration tests pass (21 tests, 7 scenarios)
- [x] ARCHITECTURE.md Review & Detection layer populated

### Integration Verification

- [ ] All Phase 3 integration tests pass (`npm test`)
- [ ] effectiveness-metrics dashboard functional
- [ ] RG-6 provisional status documented (follow-up task exists)

**Gate**: Stage 1 MUST NOT begin until all prerequisites are checked. Owner: Human twin.

---

## Research Gates (Phase 4 Blockers)

**Reference**: `../proposals/2026-02-13-agentic-skills-specification.md#research-gates`

Phase 4 has 3 research gates:

| ID | Topic | Status | Affects Stage | Risk if Unresolved |
|----|-------|--------|---------------|-------------------|
| RG-2 | Multi-agent constraint coordination | GAP | Stage 1 (governance-state) | Race conditions in shared state |
| RG-4 | Constraint decay/obsolescence | GAP | Stage 2 (constraint-reviewer) | Arbitrary 90-day review cadence |
| RG-7 | Cryptographic audit chains | DONE | Stage 5 (packet-signing) | N/A - research complete |

### RG-2: Multi-Agent Constraint Coordination

**Current state**: Plan reviews identified race conditions in shared state files. No coordination strategy.

**Research needed**:
- Consensus algorithms for AI agent coordination (Raft, Paxos adaptations)
- Conflict resolution in multi-agent memory systems
- Optimistic vs pessimistic locking for constraint state
- Academic: Multi-agent reinforcement learning constraint satisfaction

**Output**: `neon-soul/docs/research/multi-agent-coordination.md`

**Acceptance**: Documented coordination strategy with trade-offs analysis.

**Provisional Mode** (if proceeding before research):

*Entry Criteria*:
- Document assumption: "Single-agent mode enforced"
- Reject concurrent write attempts with clear error
- Add `single_writer_lock` with version field for conflict detection
- Flag governance-state as provisional in results

*Exit Criteria*:
- RG-2 research complete (`multi-agent-coordination.md` created)
- Coordination strategy implemented (or single-agent mode validated)
- Integration test for concurrent access handling

### RG-4: Constraint Decay and Obsolescence

**Current state**: retiring→retired lifecycle exists but no decay detection.

**Research needed**:
- Temporal decay patterns for software constraints
- Automatic obsolescence detection (code drift, unused constraints)
- Optimal review cadence (90-day is arbitrary)
- Academic: Technical debt accumulation and decay patterns

**Output**: `neon-soul/docs/research/constraint-decay-patterns.md`

**Acceptance**: Evidence-based decay detection algorithm OR validated 90-day cadence.

**Provisional Mode** (if proceeding before research):

*Entry Criteria*:
- Document assumption: "90-day cadence is provisional pending RG-4 research"
- Add decay signals as mitigation (dormant detection, drift scoring)
- Flag constraint-reviewer as provisional in results

*Exit Criteria*:
- RG-4 research complete (`constraint-decay-patterns.md` created)
- Calibrated cadence based on research (or 90-day validated)
- Integration test for adaptive scheduling

### RG-7: Cryptographic Audit Chains (COMPLETE)

**Research**: `projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md`

**Application**: Packet signing for context-packet authenticity (deferred from Phase 1).

**Status**: Research complete. Ready for implementation.

### Resolution Options

**Option A: Research Sprint First** (recommended for production)
- Complete RG-2 and RG-4 research before affected stages
- Estimated: 1-2 days additional
- Output: 2 new research files

**Option B: Provisional Implementation** (recommended for iteration)
- Proceed with GAP status
- Flag governance-state and constraint-reviewer as provisional
- Implement simple strategies, document limitations
- Create follow-up tasks for research validation

**Option C: Hybrid Approach** (balanced)
- Complete RG-4 (affects core governance logic)
- Proceed provisional on RG-2 (multi-agent can be deferred)
- Estimated: 0.5-1 day for RG-4 research

**Recommendation**: Option C (Hybrid) - RG-4 directly affects constraint-reviewer's 90-day cadence
which is a core governance decision. RG-2 can be provisional since single-agent workflows
are the common case.

### Research Gate Acceptance

- [ ] **Research approach selected**: ____________
- [ ] **RG-4 status**: resolved OR provisional with entry/exit criteria
- [ ] **RG-2 status**: resolved OR provisional with entry/exit criteria
- [ ] **Follow-up tasks created** (if provisional)

---

## Skills to Implement

### Governance Skills (4)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| governance-state | Governance | Track constraint state machine | constraint-lifecycle, effectiveness-metrics | constraint-reviewer |
| constraint-reviewer | Governance | 90-day review gate | governance-state | index-generator |
| index-generator | Governance | Generate INDEX.md dashboards | governance-state, constraint-reviewer | Human users |
| round-trip-tester | Governance | Validate struct↔markdown sync | constraint-lifecycle | CI/CD |

### Safety Skills (4)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| model-pinner | Safety | Pin model versions | None (foundational) | All model-using skills |
| fallback-checker | Safety | Verify fallback strategies | model-pinner | Runtime protection |
| cache-validator | Safety | Validate cached responses | context-packet | Memory skills |
| adoption-monitor | Safety | Temporal error handling | effectiveness-metrics | Governance dashboards |

### Review-Identified Additions (4)

| Item | Identified In | Description | Affects |
|------|---------------|-------------|---------|
| Packet signing | Phase 1 code review | Sign context packets cryptographically | context-packet, file-verifier |
| Observability | Phase 2 twin review | System health monitoring | governance-state |
| Version migration | Phase 2 twin review | schema_version in state files | All state files |
| Cleanup/Maintenance | Phase 2 twin review | Archive, bulk retirement, scheduling | governance-state, index-generator |

**Data Flow**:
```
governance-state ──► constraint-reviewer ──► index-generator
       │                    │
       │                    └── (90-day gate) ──► retire/keep decision
       ↓
effectiveness-metrics (input from Phase 3)
       ↓
adoption-monitor ──► health dashboard

model-pinner ──► fallback-checker ──► cache-validator
       │                │
       │                └── (degradation path verified)
       ↓
All model-using skills

context-packet ──[signing]──► file-verifier ──[validation]──► secure audit trail
```

---

## Stage 1: State Management Foundation (governance-state)

**Goal**: Central state tracking for constraint lifecycle.

### governance-state Skill

**Location**: `projects/live-neon/skills/agentic/governance/governance-state/SKILL.md`

Track and manage the constraint state machine. This is the brain of the governance
layer—it knows the state of every constraint and coordinates transitions.

**Problem Being Solved**:
Constraints exist in states (draft, active, retiring, retired) but nothing tracks
the overall distribution or triggers reviews. governance-state provides the central
authority for constraint state.

**Specification**:
- **Input**: Constraint queries, state transition requests
- **Output**: State dashboards, transition results

**State Machine**:
```
     ┌─────────┐
     │  draft  │ ──(approved)──► active
     └────┬────┘                    │
          │                         │
     (rejected)               (90-day review)
          │                         │
          ▼                         ▼
     ┌─────────┐              ┌──────────┐
     │ deleted │              │ retiring │
     └─────────┘              └────┬─────┘
                                   │
                              (confirmed)
                                   │
                                   ▼
                              ┌─────────┐
                              │ retired │
                              └─────────┘
```

**Commands**:
```
/governance-state dashboard                 # Overall state distribution
/governance-state query --state active      # List by state
/governance-state approve <id>              # draft → active
/governance-state reject <id>               # draft → deleted (soft-delete, 7-day recovery)
/governance-state reject <id> --force       # draft → deleted (permanent, no recovery)
/governance-state recover <id>              # deleted → draft (within 7-day window)
/governance-state transition <id> retiring  # active → retiring
/governance-state confirm <id>              # retiring → retired
/governance-state history <id>              # State transition history
```

**Deletion Safeguard**: `reject` performs soft-delete by default with 7-day recovery window.
Use `--force` for permanent deletion. `recover` restores within window.

**Metrics Consumed** (from effectiveness-metrics):
- Prevention rate per constraint
- False positive rate per constraint
- Circuit trip history
- Override frequency

**Output Format**:
```
GOVERNANCE STATE DASHBOARD
──────────────────────────

Constraint Distribution:
  draft:    3
  active:   12
  retiring: 2
  retired:  8
  deleted:  1

Health Summary (excludes deleted):
  Due for review (>90 days): 4
  High false positive (>10%): 1
  Dormant (0 violations 60d): 2

Recent Transitions:
  git-force-push: active → retiring (2026-02-10)
  test-coverage: draft → active (2026-02-08)
```

**Multi-Agent Coordination** (RG-2):

If RG-2 resolved: Implement coordination strategy from research.
If RG-2 provisional: **Enforce single-agent mode**:
- Reject concurrent write attempts with error: "Concurrent modification detected. Retry or use --force"
- Version field in state file for conflict detection
- No automatic retry (fail-fast to surface coordination issues)
- Lock file with agent ID and timestamp for debugging
- Conflict detection via version field in state file
- Manual resolution required for conflicts

**Integration**:
- **Layer**: Governance
- **Depends on**: constraint-lifecycle, effectiveness-metrics
- **Used by**: constraint-reviewer, index-generator, adoption-monitor

### Acceptance Criteria

- [ ] State dashboard shows distribution (secondary mode)
- [ ] State queries filter correctly
- [ ] Transitions validate allowed paths
- [ ] History tracks all transitions
- [ ] Consumes effectiveness-metrics data
- [ ] RG-2 status documented (resolved or provisional)
- [ ] Soft-delete with 7-day recovery works
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 2: Review Gate (constraint-reviewer)

**Goal**: Implement 90-day constraint review process.

### constraint-reviewer Skill

**Location**: `projects/live-neon/skills/agentic/governance/constraint-reviewer/SKILL.md`

Implement the 90-day review gate for active constraints.

**Problem Being Solved**:
Constraints can become stale—the codebase evolves, patterns change, what was
once a critical rule may now be obsolete. Without periodic review, constraints
accumulate like technical debt.

**Specification**:
- **Input**: Constraint ID, review trigger (scheduled or manual)
- **Output**: Review prompt, decision options, transition request

**Review Cadence** (RG-4):

If RG-4 resolved: Use evidence-based cadence from research.
If RG-4 provisional: Use 90-day default with these mitigations:
- Cadence is arbitrary without evidence (documented as provisional)
- **Decay signals** provide early warning:
  - Dormant >60 days: Flag for early review consideration
  - High drift score: Prioritize review (source files changed significantly)
  - False positive rate >15%: Trigger immediate review
- Adaptive scheduling: High-activity constraints reviewed more frequently
- Follow-up task: `../issues/2026-02-14-rg4-constraint-decay-research.md`

**Review Process (Event-Driven - Primary)**:
```
1. Constraint reaches 90-day mark AND is dormant (0 violations)
2. Auto-create issue: docs/issues/governance-alert-YYYY-MM-DD-stale-<id>.md
3. Issue contains: metrics summary, recommended action, commands
4. Developer responds in normal workflow:
   - `/constraint-reviewer keep <id>` → preserve constraint, reset timer
   - Close issue without action → auto-retire after 7 days
5. No dashboard monitoring required—attention pulled only when needed
```

**Review Process (Dashboard - Secondary)**:
```
1. User runs `/constraint-reviewer due` for periodic deep-dive
2. Dashboard shows constraint metrics:
   - Prevention rate, False positive rate
   - Last violation date, Source file changes
3. Human decides: KEEP / MODIFY / RETIRE
4. governance-state records decision
```

**Commands**:
```
/constraint-reviewer check <id>           # Manual review trigger
/constraint-reviewer due                  # List due for review (dashboard mode)
/constraint-reviewer schedule             # Show review schedule
/constraint-reviewer keep <id>            # Preserve constraint, reset timer
/constraint-reviewer decide <id> retire   # Record retirement decision
```

**Review Evidence Presented**:
```
CONSTRAINT REVIEW: git-force-push-safety
────────────────────────────────────────

Age: 94 days (due for review)
State: active

Metrics (last 90 days):
  Violations: 12
  Prevention rate: 91.7%
  False positive rate: 8.3%
  Circuit trips: 2

Source Drift Analysis:
  Files referencing: 3 (unchanged)
  Related code changes: 7 commits
  Breaking changes: 0
  Drift score: 0.15 (low)

Recommendation: KEEP (healthy metrics, no drift)

**Source Drift Calculation**:
  - Track files mentioned in constraint scope
  - Use `git log --since=<created_date>` for commit count
  - Detect breaking changes via commit message patterns (BREAKING, !, major:)
  - Drift score = (commits × breaking_weight) / (age_days × files)
  - breaking_weight = 3.0 for breaking changes, 1.0 for normal commits

**Drift Thresholds**:
| Score | Level | Action |
|-------|-------|--------|
| < 0.25 | LOW | No action needed |
| 0.25 - 0.75 | MEDIUM | Flag for review |
| > 0.75 | HIGH | Priority review, consider retirement |

Options:
  1. KEEP active (no changes)
  2. MODIFY (update constraint)
  3. RETIRE (mark obsolete)

Decision: /constraint-reviewer decide git-force-push-safety [1|2|3]
```

**Integration**:
- **Layer**: Governance
- **Depends on**: governance-state
- **Used by**: index-generator (review status)

### Acceptance Criteria

- [ ] Event-driven: Auto-creates issue for dormant constraints (primary mode)
- [ ] Event-driven: `/constraint-reviewer keep <id>` preserves and resets timer
- [ ] Dashboard: Due constraints listed correctly (secondary mode)
- [ ] Review evidence includes metrics
- [ ] Source drift analysis functional with thresholds (LOW/MEDIUM/HIGH)
- [ ] Decision recorded in governance-state
- [ ] RG-4 status documented (resolved or provisional)
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 3: Dashboard Generation (index-generator, round-trip-tester)

**Goal**: Generate visibility dashboards and validate data integrity.

### 3A: index-generator Skill

**Location**: `projects/live-neon/skills/agentic/governance/index-generator/SKILL.md`

Generate INDEX.md dashboards for constraint/observation visibility.

**Problem Being Solved**:
With dozens of constraints and observations, humans need dashboards. INDEX.md
files provide navigable overviews of the system state.

**Specification**:
- **Input**: Directory path, generation options
- **Output**: INDEX.md file with dashboard content

**Generated Sections**:
- Constraint summary by state
- Observation summary by tier
- Recent activity timeline
- Health alerts
- Quick links to individual files

**Commands**:
```
/index-generator generate constraints/     # Generate constraint index
/index-generator generate observations/    # Generate observation index
/index-generator refresh                   # Regenerate all indexes
```

**Output Example** (`docs/constraints/INDEX.md`):
```markdown
# Constraints Index

Generated: 2026-02-14T10:00:00Z

## Summary

| State | Count | Health |
|-------|-------|--------|
| active | 12 | 10 healthy, 2 alerts |
| retiring | 2 | - |
| draft | 3 | - |

## Active Constraints

| Constraint | Age | Prevention | FP Rate | Status |
|------------|-----|------------|---------|--------|
| git-force-push-safety | 94d | 91.7% | 8.3% | Due for review |
| test-before-commit | 45d | 98.2% | 1.2% | Healthy |
...

## Alerts

- git-force-push-safety: Due for 90-day review
- code-review-required: Dormant (0 violations in 60d)
```

### 3B: round-trip-tester Skill

**Location**: `projects/live-neon/skills/agentic/governance/round-trip-tester/SKILL.md`

Validate struct↔markdown synchronization for constraints.

**Problem Being Solved**:
Constraints exist in both structured format (JSON/state files) and markdown format
(CONSTRAINT.md). These must stay synchronized. round-trip-tester detects drift.

**Specification**:
- **Input**: Constraint file or directory
- **Output**: Sync status, drift report

**Round-Trip Test**:
```
CONSTRAINT.md → parse → struct → serialize → CONSTRAINT.md'
                         │
                         └── compare: md == md' ?
```

**Source of Truth**: Markdown (CONSTRAINT.md) is authoritative. Struct is derived.
Auto-fix regenerates struct from markdown, not vice versa.

**Commands**:
```
/round-trip-tester check <constraint>      # Single constraint
/round-trip-tester check-all               # All constraints
/round-trip-tester fix <constraint>        # Preview fix (dry-run default, no changes)
/round-trip-tester fix <constraint> --apply  # Apply fix (markdown → struct)
```

**Safe by Default**: `fix` shows preview without changes. Require explicit `--apply` to modify files.

**Output Format**:
```
ROUND-TRIP TEST: git-force-push-safety
──────────────────────────────────────

Status: DRIFT DETECTED

Differences:
  Line 12: severity: "critical" → severity: "CRITICAL" (case)
  Line 45: Missing: "reviewed_date" field

Auto-fixable: Yes
Fix command: /round-trip-tester fix git-force-push-safety
```

### Acceptance Criteria

- [ ] index-generator creates valid markdown
- [ ] Constraint index shows state distribution
- [ ] Observation index shows tier distribution
- [ ] Health alerts included
- [ ] round-trip-tester detects drift
- [ ] Auto-fix works for simple cases
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 4: Safety Foundation (model-pinner, fallback-checker)

**Goal**: Runtime safety primitives.

### 4A: model-pinner Skill

**Location**: `projects/live-neon/skills/agentic/safety/model-pinner/SKILL.md`

Pin and verify model versions for consistency.

**Problem Being Solved**:
Model versions change. An update to Claude 4.1 might change behavior in ways
that break constraints calibrated for Claude 4.0. model-pinner ensures version
consistency within sessions and across reproducible runs.

**Specification**:
- **Input**: Model configuration, version specification
- **Output**: Pin record, verification result

**Pin Levels**:
| Level | Scope | Use Case |
|-------|-------|----------|
| Session | Current session only | Default for exploration |
| Project | This codebase | Reproducible builds |
| Global | All projects | Enterprise consistency |

**Fail-Closed Behavior**: If pinned model unavailable and no fallback defined,
BLOCK operation with error. Never silently use unpinned model.

**Commands**:
```
/model-pinner pin claude-4-opus --level session   # Current session only
/model-pinner pin claude-4-opus --level project   # This codebase (.claude/model-pin.json)
/model-pinner pin claude-4-opus --level global    # All projects (~/.claude/global-pin.json)
/model-pinner verify                              # Check current session
/model-pinner list                                # Show all pins (session, project, global)
/model-pinner history                             # Pin change history
/model-pinner unpin --level project               # Remove project pin
```

**Output Format** (session):
```
MODEL PIN STATUS
────────────────

Session: abc123
Pinned: claude-4-opus (exact: claude-4-opus-20260101)

Verification:
  Current model: claude-4-opus-20260101 ✓
  Pin level: session
  Expires: end of session

Drift detected: None
```

**Output Format** (project):
```
MODEL PIN STATUS
────────────────

Project: /Users/twin/multiverse
Pinned: claude-4-opus (exact: claude-4-opus-20260101)
Config: .claude/model-pin.json

Verification:
  Current model: claude-4-opus-20260101 ✓
  Pin level: project
  Expires: never (until unpinned)

Drift detected: None
```

**Output Format** (global):
```
MODEL PIN STATUS
────────────────

Global pin active
Pinned: claude-4-sonnet (exact: claude-4-sonnet-20260115)
Config: ~/.claude/global-pin.json

Verification:
  Current model: claude-4-sonnet-20260115 ✓
  Pin level: global
  Expires: never (until unpinned)
  Override: project pins take precedence

Drift detected: None
```

### 4B: fallback-checker Skill

**Location**: `projects/live-neon/skills/agentic/safety/fallback-checker/SKILL.md`

Verify fallback strategies exist for graceful degradation.

**Problem Being Solved**:
What happens when the pinned model is unavailable? When the memory search
returns nothing? When the circuit breaker is tripped? fallback-checker ensures
graceful degradation paths exist.

**Specification**:
- **Input**: Skill or system component
- **Output**: Fallback chain, coverage analysis

**Fallback Categories**:
| Category | Primary | Fallback | Fallback 2 |
|----------|---------|----------|------------|
| Model | claude-4-opus | claude-4-sonnet | claude-3.5-sonnet |
| Memory | memory-search | contextual-injection | manual context |
| Constraint | constraint-enforcer | warn-only mode | bypass (logged) |

**Commands**:
```
/fallback-checker analyze memory-search    # Single component
/fallback-checker coverage                 # Full coverage report
/fallback-checker simulate model-failure   # Test fallback path
```

**Output Format**:
```
FALLBACK ANALYSIS: memory-search
────────────────────────────────

Primary: memory-search (semantic query)
Fallback 1: contextual-injection (path-based)
Fallback 2: manual context loading

Coverage: COMPLETE

Simulation:
  memory-search fails → contextual-injection activates
  contextual-injection fails → prompt for manual context

Risk: LOW (all paths verified)
```

### Acceptance Criteria

- [ ] model-pinner creates valid pins
- [ ] Version verification accurate
- [ ] Pin levels work (session, project, global)
- [ ] fallback-checker identifies fallback chains
- [ ] Coverage report accurate
- [ ] Simulation works without side effects
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 5: Cache and Adoption Safety (cache-validator, adoption-monitor)

**Goal**: Protect against stale data and monitor system adoption.

### 5A: cache-validator Skill

**Location**: `projects/live-neon/skills/agentic/safety/cache-validator/SKILL.md`

Validate cached responses to prevent stale data.

**Problem Being Solved**:
Context packets, memory search results, and constraint lookups may be cached
for performance. But stale cache data can cause incorrect decisions. cache-validator
ensures freshness.

**Stage Sequencing Note**: cache-validator is implemented in Stage 5, before
packet signing (Stage 6A). Initially, cache-validator will validate unsigned packets
using hash-based content verification. After Stage 6A completes, cache-validator
will be updated to also verify packet signatures. This sequencing is intentional—
basic cache validation is useful immediately, and signature verification is additive.

**Specification**:
- **Input**: Cache key, freshness threshold
- **Output**: Validation result, staleness report

**Cache Categories**:
| Cache | TTL Default | Staleness Risk | Invalidation |
|-------|-------------|----------------|--------------|
| Context packets | 5 minutes | Medium (files change) | Hash-based (file content changed) |
| Memory search | 15 minutes | Low (observations stable) | TTL only |
| Constraint lookup | 1 hour | Low (constraints stable) | TTL + version field |
| Model responses | Session | High (context changes) | Context hash changed |

**Fail-Closed Behavior**: When validation fails or is uncertain, cache-validator
returns STALE and forces regeneration. Never proceed with potentially stale data
in safety-critical paths.

**Commands**:
```
/cache-validator check context-packet-abc  # Single cache entry
/cache-validator status                    # Cache health overview
/cache-validator invalidate <pattern>      # Force invalidation
/cache-validator configure --ttl 10m       # Adjust TTL
```

### 5B: adoption-monitor Skill

**Location**: `projects/live-neon/skills/agentic/safety/adoption-monitor/SKILL.md`

Monitor system adoption and temporal error patterns.

**Problem Being Solved**:
A new constraint might cause a spike in errors during adoption. adoption-monitor
tracks temporal patterns to distinguish adoption friction (temporary) from
systemic issues (permanent).

**Specification**:
- **Input**: Time range, component filter
- **Output**: Adoption curves, anomaly detection

**Metrics Tracked**:
- Constraint violation rate over time
- Circuit trip frequency trends
- Override usage patterns
- New constraint adoption curves

**Commands**:
```
/adoption-monitor status                   # Overall adoption health
/adoption-monitor constraint <id>          # Single constraint adoption
/adoption-monitor anomalies --days 7       # Recent anomalies
/adoption-monitor trend violation-rate     # Trend analysis
```

**Output Format**:
```
ADOPTION MONITOR: git-force-push-safety
───────────────────────────────────────

Constraint Age: 14 days
Adoption Phase: STABILIZING

Violation Rate (7-day windows):
  Week 1: 15 violations (expected - learning curve)
  Week 2: 4 violations (improving)

Trend: HEALTHY (82% reduction)

Anomalies: None

Recommendation: Continue monitoring, no intervention needed
```

### Acceptance Criteria

- [ ] cache-validator detects stale entries
- [ ] TTL configuration works
- [ ] Invalidation patterns work
- [ ] adoption-monitor tracks temporal patterns
- [ ] Anomaly detection functional
- [ ] Trend analysis accurate
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 6: Review-Identified Additions (packet-signing, observability, version-migration)

**Goal**: Implement items identified during previous phase reviews.

### 6A: Packet Signing

**Location**: Update `projects/live-neon/skills/agentic/core/context-packet/SKILL.md`

Add cryptographic signing to context packets.

**Research Reference**: `projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md`

**Problem Being Solved**:
Context packets are currently unsigned JSON. A malicious actor could rewrite
both the packet and file hashes together, creating a falsified audit trail.
Cryptographic signing prevents tampering.

**Threat Model Clarification** (per N=2 code review):
The RG-7 research distinguishes **provenance** (source tracking) from **integrity** (tamper detection).
For this 2-person team, the primary need is provenance—knowing which agent/session created a packet.
However, Ed25519 signing is chosen for:
1. Future multi-user scenarios
2. Audit compliance requirements
3. Defense in depth

If provenance-only is sufficient, consider simpler implementation (session ID + timestamp without crypto).

**Implementation Decision** (N=1 twin review finding):
Creative twin suggested Tier 1 (provenance now) / Tier 2 (Ed25519 later) split.
Technical twin found Ed25519 reasonable given low additional complexity.
**Chosen**: Implement Ed25519 now. Simpler provenance is documented as fallback if key management proves burdensome.

**Implementation**:
- Ed25519 signature on packet content
- Signature verification in file-verifier
- Key management (see subsection below)
- Audit trail of signed packets

**Key Management**:
| Aspect | Strategy |
|--------|----------|
| Generation | Auto-generate on first use (`~/.claude/keys/signing.key`) |
| Storage | OS keychain preferred; fallback to encrypted file with passphrase |
| Rotation | Manual trigger: `/context-packet rotate-key --reason "scheduled"` |
| Revocation | Add revoked keys to `.revoked-keys.json`; verifiers reject |
| Distribution | Public keys embedded in signed packets; project keys in `.claude/project-keys/` |

**Signed Packet Format**:
```json
{
  "packet_id": "ctx-2026-02-14-001",
  "created": "2026-02-14T10:00:00Z",
  "files": [...],
  "signature": {
    "algorithm": "Ed25519",
    "public_key": "base64...",
    "value": "base64...",
    "signed_at": "2026-02-14T10:00:00Z"
  }
}
```

### 6B: Observability Enhancement

**Location**: Update `projects/live-neon/skills/agentic/governance/governance-state/SKILL.md`

Add system health monitoring capabilities.

**Problem Being Solved** (from Phase 2 Twin Review Finding 8):
No skill monitors system health: circuit breaker trip rates, override approval/denial
rates, constraint generation velocity, memory search latency.

**Implementation**:
- Health metrics collection in governance-state
- Dashboard output format for monitoring
- Alert thresholds for anomalies
- Integration with effectiveness-metrics

**Health Metrics**:
| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Circuit trip rate | circuit-breaker | >3/month per constraint |
| Override rate | emergency-override | >5% of violations |
| Generation velocity | constraint-generator | <1/week (system idle?) |
| Search latency | memory-search | >2s average |

**Alert Delivery** (event-driven):
When threshold exceeded:
1. Create issue file: `docs/issues/governance-alert-YYYY-MM-DD-<metric>.md`
2. Include: metric name, current value, threshold, recommended action
3. Dashboard also shows alert (for deep-dive sessions)

Example: `docs/issues/governance-alert-2026-02-14-circuit-trip-rate.md`

### 6C: Version Migration

**Location**: All state files (`.circuit-state.json`, `.overrides.json`, etc.)

Add schema versioning for state files.

**Problem Being Solved** (from Phase 2 Twin Review Finding 10):
State files lack version information. When schema changes (v1.0.0 → v1.1.0),
migration is manual and error-prone.

**Implementation**:
- Add `schema_version` field to all state files
- Document migration procedures
- Backward compatibility layer
- Version mismatch detection

**Migration Tooling**:
```
/version-migration check                    # Detect version mismatches
/version-migration migrate <file> --to 1.1  # Migrate specific file
/version-migration migrate-all --to 1.1     # Migrate all state files
/version-migration rollback <file> --to 1.0 # Rollback if issues found
```

**Compatibility Rules**:
| Scenario | Behavior |
|----------|----------|
| Read v1.0 with v1.1 code | Auto-migrate on read (forward compat) |
| Read v1.1 with v1.0 code | Fail with upgrade prompt (no backward) |
| Unknown version (v2.0) | Fail closed, log error, prompt manual intervention |
| Missing version field | Treat as v0.9.0, auto-migrate to current |

**Validation**:
- Migration roundtrip test: v1.0 → v1.1 → v1.0 produces identical data
- Field preservation test: No data loss during migration
- Unknown field handling: Preserve unknown fields (future-proofing)

**Fail-Closed Behavior**: When version is unknown or migration fails, refuse to
proceed. Log detailed error with manual recovery steps. Never silently corrupt data.

**Versioned State Format**:
```json
{
  "schema_version": "1.0.0",
  "data": {
    // existing state data
  },
  "migration_history": [
    {"from": "0.9.0", "to": "1.0.0", "date": "2026-02-14"}
  ]
}
```

### 6D: Cleanup/Maintenance

**Location**: Subcommands in `projects/live-neon/skills/agentic/governance/governance-state/SKILL.md`

Add file accumulation management and scheduled maintenance.

**Problem Being Solved** (from Phase 2 Twin Review Finding 9):
Without cleanup, the system accumulates obsolete constraints and observations indefinitely.
Archived observations consume context budget. Dormant constraints add noise.

**Implementation**:
- Archive old observations (configurable age threshold)
- Bulk retirement of dormant constraints
- Scheduled index regeneration
- Storage cleanup for archived items

**Commands**:
```
/governance-state archive-observations --older-than 180d
/governance-state bulk-retire --dormant-days 90 --dry-run
/governance-state bulk-retire --dormant-days 90 --confirm
/governance-state cleanup-archived --delete-after 365d
/index-generator schedule --cron "0 0 * * 0"   # Weekly rebuild
```

**Output Format**:
```
BULK RETIREMENT DRY-RUN
───────────────────────

Dormant threshold: 90 days
Candidates: 3 constraints

Constraints to retire:
  - code-review-required (dormant 120d)
  - readme-format (dormant 95d)
  - test-naming (dormant 92d)

To apply: /governance-state bulk-retire --dormant-days 90 --confirm
```

### Acceptance Criteria

- [ ] Packet signing implemented with Ed25519
- [ ] Signature verification in file-verifier
- [ ] Key management documented
- [ ] Observability metrics in governance-state
- [ ] Health dashboard output functional
- [ ] Alert thresholds configurable
- [ ] schema_version in all state files
- [ ] Migration procedures documented
- [ ] Backward compatibility verified
- [ ] Cleanup/maintenance commands functional
- [ ] Archive and bulk-retire dry-run modes work
- [ ] Scheduled index regeneration configurable
- [ ] Tests added to skill-behavior.test.ts

### 6E: Self-Documenting Skills Retrofit

**Location**: All existing SKILL.md files in `projects/live-neon/skills/agentic/`

Add "Next Steps" sections to all existing skills to enable self-documentation.

**Problem Being Solved** (from Phase 4 Twin Review):
Agents completing skill work get stuck without clear guidance on what to do next.
Self-documenting skills prevent orphaned work and ensure loop closure.

**Implementation**:
- Add "Next Steps" section to all existing SKILL.md files (Phases 1-3)
- Follow template from `agentic/SKILL_TEMPLATE.md`
- Ensure "Related workflows" links are included

**Files to Update** (24 existing skills):
```
# Phase 1 (5 skills)
agentic/core/context-packet/SKILL.md
agentic/core/file-verifier/SKILL.md
agentic/core/constraint-enforcer/SKILL.md
agentic/core/severity-tagger/SKILL.md
agentic/core/positive-framer/SKILL.md

# Phase 2 (9 skills)
agentic/core/failure-tracker/SKILL.md
agentic/core/constraint-generator/SKILL.md
agentic/core/constraint-lifecycle/SKILL.md
agentic/core/memory-search/SKILL.md
agentic/core/circuit-breaker/SKILL.md
agentic/core/emergency-override/SKILL.md
agentic/core/contextual-injection/SKILL.md
agentic/core/observation-recorder/SKILL.md
agentic/core/decision-boundary/SKILL.md

# Phase 3 (10 skills)
agentic/review/prompt-normalizer/SKILL.md
agentic/review/slug-taxonomy/SKILL.md
agentic/review/twin-review/SKILL.md
agentic/review/cognitive-review/SKILL.md
agentic/review/review-selector/SKILL.md
agentic/review/staged-quality-gate/SKILL.md
agentic/detection/topic-tagger/SKILL.md
agentic/detection/evidence-tier/SKILL.md
agentic/detection/failure-detector/SKILL.md
agentic/detection/effectiveness-metrics/SKILL.md
```

**Next Steps Section Template**:
```markdown
## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to layer table if new skill
2. **Update upstream skills** - Add this skill to their "Used by" lists
3. **Update downstream skills** - Verify "Depends on" lists are current
4. **Run verification** - `cd tests && npm test`
5. **Check closing loops** - See `docs/workflows/phase-completion.md`

**If part of a phase implementation**:
- Mark stage complete in implementation plan
- Proceed to next stage OR run phase-completion workflow
- Update `docs/implementation/agentic-phase{N}-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
```

### Stage 6E Acceptance Criteria

- [ ] All 24 existing SKILL.md files have "Next Steps" section
- [ ] All "Next Steps" sections follow template format
- [ ] All skills link to documentation-update and phase-completion workflows
- [ ] SKILL_TEMPLATE.md updated (already done)

---

## Stage 7: Integration Testing

**Goal**: Verify Governance & Safety layer works with Review & Detection layer.

### Integration Test Scenarios

#### Scenario 1: Governance Dashboard Flow

```
1. effectiveness-metrics provides constraint health
2. governance-state aggregates into dashboard
3. Dashboard shows state distribution + alerts
4. index-generator creates INDEX.md from state
5. Human navigates to specific constraint
```

#### Scenario 2: Event-Driven Stale Constraint (Primary)

```
1. Constraint dormant for 90 days (no violations)
2. System auto-creates issue: docs/issues/governance-alert-*.md
3. Issue contains metrics summary and recommended action
4. Developer runs `/constraint-reviewer keep <id>`
5. Constraint preserved, timer resets
6. Issue auto-closed
```

#### Scenario 2B: Dashboard Review Cycle (Secondary)

```
1. User runs `/constraint-reviewer due` for deep-dive
2. Metrics pulled from effectiveness-metrics
3. Source drift analyzed
4. Human decides: KEEP
5. governance-state records decision
6. Review timer resets
```

#### Scenario 3: Safety Fallback Chain

```
1. model-pinner sets session pin
2. Model unavailable (simulated)
3. fallback-checker activates fallback
4. Operation continues with fallback model
5. Audit trail records fallback event
```

#### Scenario 4: Cache Staleness Detection

```
1. Context packet cached
2. Source file modified
3. cache-validator detects staleness
4. Packet invalidated
5. Fresh packet generated
6. Operation proceeds with current data
```

#### Scenario 5: Packet Signing Verification

```
1. context-packet creates signed packet
2. Packet transmitted
3. file-verifier validates signature
4. Tampering attempt (simulated)
5. Verification fails
6. Operation blocked with audit
```

#### Scenario 6: Adoption Monitoring

```
1. New constraint activated
2. High violation rate (week 1)
3. adoption-monitor tracks pattern
4. Rate decreases (week 2)
5. Status: STABILIZING
6. No alert triggered (expected pattern)
```

#### Scenario 7: Round-Trip Sync

```
1. Constraint modified via governance
2. round-trip-tester detects drift
3. `/round-trip-tester fix <id>` shows preview (dry-run default)
4. `/round-trip-tester fix <id> --apply` applies fix
5. Sync verified
6. Index regenerated
```

#### Scenario 8: Concurrent Write Rejection (Negative)

```
1. Agent A acquires write lock on governance-state
2. Agent B attempts concurrent modification
3. Agent B receives error: "Concurrent modification detected"
4. Agent B state file unchanged
5. Agent A completes successfully
6. Lock released
```

#### Scenario 9: Signature Verification Failure (Negative)

```
1. Context packet created and signed
2. Packet content tampered (hash modified)
3. file-verifier attempts validation
4. Signature mismatch detected
5. Operation BLOCKED (fail-closed)
6. Audit log records tampering attempt
7. Human alerted
```

#### Scenario 10: Version Migration Rollback (Negative)

```
1. State file at schema v1.1.0
2. Migration to v1.2.0 attempted
3. Migration fails (validation error)
4. Automatic rollback to v1.1.0
5. State file integrity preserved
6. Error logged for investigation
```

### Testing Strategy

**Test Boundaries** (per N=2 code review):

| Test Type | File | Scope |
|-----------|------|-------|
| Unit tests | `skill-behavior.test.ts` | Single skill, mocked dependencies |
| Contract tests | `phase4-contracts.test.ts` | Multi-skill data flow, mock implementations |
| Integration tests | (future) | Real skill invocations, filesystem |

**Negative Test Requirements**:
- Scenario 8: Concurrent write handling
- Scenario 9: Signature tampering detection
- Scenario 10: Migration failure recovery

### Tasks

- [ ] Create integration test file: `tests/e2e/phase4-contracts.test.ts`
- [ ] Implement Scenario 1 test (governance dashboard flow)
- [ ] Implement Scenario 2 test (event-driven stale constraint)
- [ ] Implement Scenario 2B test (dashboard review cycle)
- [ ] Implement Scenario 3 test (safety fallback chain)
- [ ] Implement Scenario 4 test (cache staleness detection)
- [ ] Implement Scenario 5 test (packet signing verification)
- [ ] Implement Scenario 6 test (adoption monitoring)
- [ ] Implement Scenario 7 test (round-trip sync)
- [ ] Implement Scenario 8 test (concurrent write rejection - negative)
- [ ] Implement Scenario 9 test (signature verification failure - negative)
- [ ] Implement Scenario 10 test (version migration rollback - negative)
- [ ] Verify all 8 core skills load correctly
- [ ] Update ARCHITECTURE.md Governance & Safety layer
- [ ] Document results in `docs/implementation/agentic-phase4-results.md`

### Acceptance Criteria

- [ ] All 8 Governance & Safety skills have SKILL.md
- [ ] All SKILL.md files comply with MCE limits
- [ ] All skills load in Claude Code
- [ ] Governance dashboard flow works (Scenario 1)
- [ ] Event-driven stale constraint creates issue (Scenario 2)
- [ ] Dashboard review cycle works (Scenario 2B)
- [ ] Safety fallback chain verified (Scenario 3)
- [ ] Cache staleness detected (Scenario 4)
- [ ] Packet signing/verification works (Scenario 5)
- [ ] Adoption patterns tracked (Scenario 6)
- [ ] Round-trip sync verified (Scenario 7)
- [ ] All 11 integration test scenarios pass (8 happy path + 3 negative)

---

## Verification Gate

**Phase 4 Complete when**:

### Research Gate Status
- [ ] RG-2 (Multi-agent coordination): Resolved OR provisional with documentation
- [ ] RG-4 (Constraint decay): Resolved OR provisional with documentation
- [ ] RG-7 (Cryptographic audit): Applied to packet signing implementation

### Implementation Checklist
- [ ] All 32 skills complete (5 Phase 1 + 9 Phase 2 + 10 Phase 3 + 8 Phase 4)
- [ ] Event-driven governance: auto-issue creation for stale constraints
- [ ] Governance skills integrate with constraint-lifecycle
- [ ] Safety skills integrate with existing model configs (fail-closed)
- [ ] Packet signing implemented for context-packet
- [ ] Observability metrics with alert delivery (issue creation)
- [ ] schema_version in all state files
- [ ] Self-documenting skills: All 32 SKILL.md files have "Next Steps" section
- [ ] Integration tests pass (11 scenarios: 8 happy path + 3 negative)
- [ ] ARCHITECTURE.md Governance & Safety layer populated
- [ ] Results documented in `docs/implementation/agentic-phase4-results.md`

---

## Timeline

| Stage | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| Research | RG-4 (if doing sprint) | 0.5-1 day | Optional |
| Stage 1 | governance-state | 3-4 hours | effectiveness-metrics |
| Stage 2 | constraint-reviewer | 3-4 hours | governance-state |
| Stage 3 | index-generator, round-trip-tester | 4-5 hours | governance-state |
| Stage 4 | model-pinner, fallback-checker | 3-4 hours | None (foundational) |
| Stage 5 | cache-validator, adoption-monitor | 3-4 hours | context-packet |
| Stage 6A-D | Review-identified additions (4) | 5-6 hours | Various |
| Stage 6E | Self-documenting skills retrofit (24 files) | 2-3 hours | None |
| Stage 7 | Integration testing | 8-10 hours | All above |

**Total**: 3.5-5.5 days (serial execution, depending on RG-4 research approach)

**Timeline Notes** (per N=2 code review + twin review):
- Stage 6A-D: 4 additions (packet-signing, observability, version-migration, cleanup)
- Stage 6E: Retrofit "Next Steps" to 24 existing skills (batch operation)
- Stage 7 doubled from 4-5h to 8-10h to account for:
  - 10 integration scenarios (7 happy path + 3 negative cases)
  - Setup complexity for governance/safety boundary testing
  - Mock configuration for signed packets, stale caches, concurrent writers
  - Debugging time for cross-skill data flow issues

**Parallelization Opportunities**:

| Parallel Track A | Parallel Track B | Hard Dependency |
|------------------|------------------|-----------------|
| Stage 1 (governance-state) | Stage 4 (model-pinner, fallback) | None |
| Stage 2 (reviewer) | Stage 5 (cache, adoption) | Stage 1 for Stage 2 |
| Stage 3 (index, round-trip) | Stage 6A-D (additions) | Stage 2 for Stage 3 |
| Stage 6E (retrofit) | - | Can run anytime (no deps) |
| Stage 7 (integration) | - | All above |

**Parallel Timeline**: 2.5-3.5 days with two implementers (Stage 7 remains serial)
**Serial Timeline**: 3.5-5.5 days with single implementer (includes RG-4 research if needed)

**Note**: Stage 6E (self-documenting skills retrofit) can be parallelized with any stage since it only modifies existing files without dependencies.

---

## Cross-References

### Specification & Plans
- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Phase 1 Plan**: `../plans/2026-02-13-agentic-skills-phase1-implementation.md`
- **Phase 2 Plan**: `../plans/2026-02-13-agentic-skills-phase2-implementation.md`
- **Phase 3 Plan**: `../plans/2026-02-13-agentic-skills-phase3-implementation.md`
- **Phase 3 Results**: `projects/live-neon/skills/docs/implementation/agentic-phase3-results.md`

### Research
- **RG-7 Complete**: `projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md`
- **RG-2 Output**: `projects/live-neon/neon-soul/docs/research/multi-agent-coordination.md` (to be created)
- **RG-4 Output**: `projects/live-neon/neon-soul/docs/research/constraint-decay-patterns.md` (to be created)

### Related Issues
- **RG-6 Follow-up**: `../issues/2026-02-14-rg6-failure-attribution-research.md`
- **Phase 3 Code Review**: `../issues/2026-02-14-phase3-code-review-findings.md`
- **Phase 3 Twin Review**: `../issues/2026-02-14-phase3-twin-review-findings.md`

### Architecture
- **Skills ARCHITECTURE.md**: `projects/live-neon/skills/ARCHITECTURE.md`

---

## Appendix A: Troubleshooting Guide

### Governance Skill Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Dashboard empty | effectiveness-metrics data | Verify Phase 3 integration |
| Review not triggering | Constraint age calculation | Check created_date field |
| State transition rejected | State machine rules | Verify allowed transition path |

### Safety Skill Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Model pin not applied | Pin level scope | Verify session vs project level |
| Fallback not activating | Fallback chain definition | Check fallback-checker config |
| Cache always stale | TTL configuration | Adjust TTL values |

### Addition Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Signature verification failing | Key management | Regenerate keys, verify algorithm |
| Health metrics missing | Observability integration | Check governance-state config |
| Version migration failed | Schema compatibility | Check migration_history, manual fix |

### Diagnostic Commands

| Purpose | Command |
|---------|---------|
| Verify skill loaded | `/skills list --filter phase4` |
| Check governance state | `/governance-state dashboard` |
| Verify model pin | `/model-pinner verify` |
| Check cache health | `/cache-validator status` |
| View adoption trends | `/adoption-monitor status` |

---

*Plan created 2026-02-14. Implements Phase 4 of Agentic Skills Specification.*
*Status: COMPLETE - implemented 2026-02-14*
