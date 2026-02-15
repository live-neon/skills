# Live Neon Skills Architecture

This document describes how the skill system works as a coherent whole, focusing on
the agentic memory skills that enable failure-anchored learning.

## Overview

Live Neon skills are organized into two main categories:

1. **PBD Skills** (`pbd/`): Principle-Based Development skills for human developers
2. **Agentic Skills** (`agentic/`): Memory and constraint skills for AI-assisted development

This architecture focuses on the agentic skills, which implement the core insight:
**AI systems learn best from consequences, not instructions**.

## Skill Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      BRIDGE LAYER                                │
│  ClawHub integration: self-improving-agent, proactive-agent     │
│  Skills: learnings-n-counter, feature-request-tracker,          │
│          wal-failure-detector, heartbeat-constraint-check,      │
│          vfm-constraint-scorer                                   │
├─────────────────────────────────────────────────────────────────┤
│                    EXTENSIONS LAYER                              │
│  Observation-backed skills derived from high N-count patterns   │
│  Skills: loop-closer, parallel-decision, threshold-delegator,   │
│          mce-refactorer, hub-subworkflow, pbd-strength-         │
│          classifier, observation-refactoring, constraint-       │
│          versioning, cross-session-safety-check, pattern-       │
│          convergence-detector                                    │
├─────────────────────────────────────────────────────────────────┤
│               GOVERNANCE & SAFETY LAYER                          │
│  Constraint lifecycle management and runtime protection         │
│  Governance: constraint-reviewer, index-generator,              │
│              round-trip-tester, governance-state                │
│  Safety: model-pinner, fallback-checker, cache-validator,       │
│          adoption-monitor                                        │
├─────────────────────────────────────────────────────────────────┤
│              REVIEW & DETECTION LAYER                            │
│  Multi-agent review and pattern recognition                     │
│  Review: twin-review, cognitive-review, review-selector,        │
│          staged-quality-gate, prompt-normalizer, slug-taxonomy  │
│  Detection: failure-detector, topic-tagger, evidence-tier,      │
│             effectiveness-metrics                                │
├─────────────────────────────────────────────────────────────────┤
│                   CORE MEMORY LAYER                              │
│  Observation and constraint lifecycle operations                │
│  Skills: failure-tracker, constraint-generator, observation-    │
│          recorder, memory-search, circuit-breaker, emergency-   │
│          override, constraint-lifecycle, contextual-injection,  │
│          progressive-loader                                      │
├─────────────────────────────────────────────────────────────────┤
│                  FOUNDATION LAYER                                │
│  Low-level primitives with no dependencies                      │
│  Skills: context-packet, file-verifier, constraint-enforcer,    │
│          severity-tagger, positive-framer                       │
└─────────────────────────────────────────────────────────────────┘
```

## Category vs Layer

**Important distinction**:

- **Directory** (e.g., `core/`, `review/`, `detection/`) reflects skill **category**—what the skill does
- **Layer** (Foundation, Core, Review, etc.) reflects skill **dependency**—what it depends on

A skill can be in `detection/` category but still be Foundation layer if it has no dependencies
on other agentic skills. For example, `positive-framer` is in `detection/` (it detects and
transforms negative patterns) but is Foundation layer (no dependencies).

## Foundation Layer (Phase 1)

The foundation layer provides low-level primitives used by all other layers.
These skills have no dependencies on other agentic skills.

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| context-packet | Generate auditable context with file hashes | ✅ Implemented | `agentic/core/context-packet/` |
| file-verifier | Verify file identity via checksum | ✅ Implemented | `agentic/core/file-verifier/` |
| constraint-enforcer | Check actions against constraints | ✅ Implemented | `agentic/core/constraint-enforcer/` |
| severity-tagger | Classify findings (critical/important/minor) | ✅ Implemented | `agentic/review/severity-tagger/` |
| positive-framer | Transform "Don't X" → "Always Y" | ✅ Implemented | `agentic/detection/positive-framer/` |

**Dependencies**: None (foundational)
**Used by**: Core layer, Review layer, Detection layer
**Implemented**: 2026-02-13 (Phase 1)

## Core Memory Layer (Phase 2)

The Core Memory layer implements the failure-anchored learning system: tracking failures,
generating constraints, and managing the observation→constraint lifecycle.

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| failure-tracker | Detect and record failures with R/C/D counters | ✅ Implemented | `agentic/core/failure-tracker/` |
| observation-recorder | Record positive patterns with evidence | ✅ Implemented | `agentic/core/observation-recorder/` |
| constraint-generator | Generate constraints when R≥3, C≥2, sources≥2 | ✅ Implemented | `agentic/core/constraint-generator/` |
| constraint-lifecycle | Manage draft→active→retiring→retired states | ✅ Implemented | `agentic/core/constraint-lifecycle/` |
| circuit-breaker | Track violations, trip at 5 in 30 days | ✅ Implemented | `agentic/core/circuit-breaker/` |
| emergency-override | Temporary bypass with audit trail | ✅ Implemented | `agentic/core/emergency-override/` |
| memory-search | Query observations and constraints | ✅ Implemented | `agentic/core/memory-search/` |
| contextual-injection | Load relevant constraints by patterns/tags | ✅ Implemented | `agentic/core/contextual-injection/` |
| progressive-loader | Defer low-priority document loads | ✅ Implemented | `agentic/core/progressive-loader/` |

**Dependencies**: Foundation layer (context-packet, file-verifier, constraint-enforcer, severity-tagger, positive-framer)
**Used by**: Review & Detection layer, Governance layer, Bridge layer
**Implemented**: 2026-02-13 (Phase 2)

### Core Memory Data Flow

```
failure-tracker → constraint-generator → constraint-lifecycle → constraint-enforcer
                                                    ↓
                                              circuit-breaker → emergency-override
                                                    ↓
progressive-loader → memory-search → contextual-injection → Session context
```

### Eligibility Criteria

For a failure observation to generate a constraint:

| Criterion | Threshold | Purpose |
|-----------|-----------|---------|
| R (recurrence) | ≥3 | Failure has occurred multiple times |
| C (confirmations) | ≥2 | Humans verified it's a real problem |
| unique_users | ≥2 | Multiple people confirmed (reduces bias) |
| sources | ≥2 | Different files/sessions affected |

### Constraint States

| State | Enforcement | Description |
|-------|-------------|-------------|
| draft | NONE | Candidate pending review |
| active | BLOCK | Currently enforced, violations blocked |
| retiring | WARN | 90-day sunset, violations warned |
| retired | NONE | Historical reference only |

### Priority Tiers (Progressive Loading)

| Tier | Load Timing | Criteria |
|------|-------------|----------|
| Critical | Immediately | CRITICAL severity, circuit OPEN, active errors |
| High | After critical | IMPORTANT severity, file matches, violations |
| Medium | On demand | MINOR severity, related observations |
| Low | Deferred | Pattern observations, retired constraints |

## Review & Detection Layer (Phase 3)

The Review & Detection layer automates review workflows and provides pattern recognition
capabilities that feed the Core Memory layer.

### Review Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| prompt-normalizer | Ensure identical context across reviewers | ✅ Implemented | `agentic/review/prompt-normalizer/` |
| slug-taxonomy | Manage failure slug naming conventions | ✅ Implemented | `agentic/review/slug-taxonomy/` |
| twin-review | Spawn twin reviewers with file verification | ✅ Implemented | `agentic/review/twin-review/` |
| cognitive-review | Spawn cognitive modes (Opus 4/4.1/Sonnet 4.5) | ✅ Implemented | `agentic/review/cognitive-review/` |
| review-selector | Choose review type based on context/risk | ✅ Implemented | `agentic/review/review-selector/` |
| staged-quality-gate | Incremental quality gates per stage | ✅ Implemented | `agentic/review/staged-quality-gate/` |

**slug-taxonomy Categories** (Phase 7 decision): 6 standard prefixes are hardcoded:
`git-`, `test-`, `workflow-`, `security-`, `docs-`, `quality-`. Custom categories were
evaluated in Phase 7 but not implemented (no demonstrated need in Phases 1-6). If custom
prefixes become necessary, see Phase 7 plan for extension mechanism options.

### Detection Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| topic-tagger | Infer topic tags from paths/content | ✅ Implemented | `agentic/detection/topic-tagger/` |
| evidence-tier | Classify evidence strength (N=1 vs N≥3) | ✅ Implemented | `agentic/detection/evidence-tier/` |
| failure-detector | Multi-signal failure detection | ⚠️ Provisional | `agentic/detection/failure-detector/` |
| effectiveness-metrics | Track constraint effectiveness | ✅ Implemented | `agentic/detection/effectiveness-metrics/` |

**Note**: failure-detector is marked provisional (RG-6). Uses single-cause attribution with
confidence scoring. Multi-causal failures flagged with `uncertain: true` for human review.

**Dependencies**: Foundation layer, Core Memory layer
**Used by**: Governance layer, Bridge layer
**Implemented**: 2026-02-13 (Phase 3)

### Review & Detection Data Flow

```
failure-detector ──► failure-tracker ──► constraint-generator
       │                    │
       │                    └── (uncertain: true) ──► human_review_required
       ↓
 topic-tagger ──► memory-search
       ↓
 evidence-tier ──► constraint-generator (eligibility boost)
       ↓
effectiveness-metrics ──► governance-state (Phase 4)

twin-review ──► review-selector ──► context output
cognitive-review ──┘
       ↑
prompt-normalizer (ensures identical input)
```

### File Verification Protocol

twin-review enforces SHA-256 checksums on all files passed to reviewers:

1. **SHA-256 checksums required**: All files include checksums in manifest
2. **Verbose file references**: Path + lines + hash + commit + verified date
3. **Twin verification**: Each twin verifies SHA-256 (16-char prefix) before reviewing
4. **Mismatch handling**: STOP review, report error, request re-normalization

*Updated 2026-02-14: Standardized from MD5 to SHA-256 per N=2 code review.*

### Evidence Tiers

| Tier | N-Count | Action |
|------|---------|--------|
| Weak | N=1 | Monitor |
| Emerging | N=2 | Track closely |
| Strong | N≥3 | Check eligibility formula |
| Established | N≥5 | Priority enforcement |

**Eligibility Formula**: `R >= 3 AND C >= 2 AND D/(C+D) < 0.2 AND sources >= 2 AND users >= 2`

*Note: STRONG tier is necessary but not sufficient for constraint eligibility.*

### Effectiveness Metrics

| Metric | Good Range | Description |
|--------|------------|-------------|
| Prevention rate | ≥ 0.90 | Violations blocked / total |
| False positive rate | ≤ 0.10 | D / (C + D) |
| Circuit trip rate | ≤ 0.5/month | Trips per constraint |
| Override rate | ≤ 0.05 | Overrides / violations |

## Governance & Safety Layer (Phase 4)

The Governance & Safety layer manages constraint lifecycle at scale and provides runtime
protection mechanisms. It builds on Review & Detection outputs to enable systematic
governance of the constraint ecosystem.

**Architectural Decision**: Event-driven governance (primary), dashboard (secondary).
Constraints get attention only when needed, not via constant monitoring.

### Governance Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| governance-state | Central state tracking with event-driven alerts | ✅ Implemented | `agentic/governance/governance-state/` |
| constraint-reviewer | Review due constraints with effectiveness metrics | ✅ Implemented | `agentic/governance/constraint-reviewer/` |
| index-generator | Generate INDEX.md from live constraint state | ✅ Implemented | `agentic/governance/index-generator/` |
| round-trip-tester | Verify source↔index synchronization | ✅ Implemented | `agentic/governance/round-trip-tester/` |
| version-migration | Schema versioning and migration for state files | ✅ Implemented | `agentic/governance/version-migration/` |

### Safety Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| model-pinner | Pin model versions for session/project/global | ✅ Implemented | `agentic/safety/model-pinner/` |
| fallback-checker | Verify fallback chains exist for graceful degradation | ✅ Implemented | `agentic/safety/fallback-checker/` |
| cache-validator | Detect stale cached responses | ✅ Implemented | `agentic/safety/cache-validator/` |
| adoption-monitor | Track adoption phases and temporal error patterns | ✅ Implemented | `agentic/safety/adoption-monitor/` |

**Dependencies**: Core Memory layer, Review & Detection layer (especially effectiveness-metrics)
**Used by**: Bridge layer, Extensions layer
**Implemented**: 2026-02-14 (Phase 4)

### Governance Data Flow

```
effectiveness-metrics ──► governance-state ──► Alert (issue file)
       │                        │                    │
       │                        ▼                    ▼
       │                 index-generator      Human reviews
       │                        │
       │                        ▼
       │                   INDEX.md
       │
       └──► constraint-reviewer ──► KEEP/RETIRE decision
                   │
                   ▼
            governance-state (record decision)
```

### Event-Driven Governance

Primary mode: constraints surface for attention via events, not scheduled reviews.

| Event | Trigger | Action |
|-------|---------|--------|
| Stale constraint | 90 days dormant (no violations) | Create issue file |
| High circuit trips | >3/month per constraint | Create issue file |
| High override rate | >5% of violations | Create issue file |
| System idle | <1 constraint/week generated | Create issue file |

**Alert Delivery**: `docs/issues/governance-alert-YYYY-MM-DD-<metric>.md`

### Safety Fallback Chains

| Component | Primary | Fallback 1 | Fallback 2 |
|-----------|---------|------------|------------|
| Model | claude-4-opus | claude-4-sonnet | claude-3.5-sonnet |
| Memory | memory-search | contextual-injection | manual context |
| Constraint | constraint-enforcer | warn-only mode | bypass (logged) |

**Fail-Closed Behavior**: All safety skills fail closed (block operation) when uncertain.
Never silently continue with potentially stale/invalid data.

### Adoption Phases

| Phase | Duration | Characteristics | Action |
|-------|----------|-----------------|--------|
| LEARNING | Days 1-7 | High violation rate, expected | Monitor |
| STABILIZING | Days 8-21 | Decreasing violations | Track |
| MATURE | Days 22+ | Stable, low violation rate | Maintain |
| PROBLEMATIC | Any | Violations increasing or sustained high | Alert |

### Research Gates (RG) Terminology

Research Gates are provisional implementations awaiting research validation.
Each gate has specific exit criteria that must be met before graduation to full implementation.

| Gate | Topic | Status | Exit Criteria |
|------|-------|--------|---------------|
| RG-2 | Multi-agent coordination | Provisional | Coordination strategy implemented, integration tests pass |
| RG-4 | Constraint decay | Provisional | Decay curve calibrated, graduated retirement implemented |
| RG-6 | Failure attribution | Provisional | Multi-causal detection added, confidence thresholds calibrated |
| RG-7 | Cryptographic audit | Applied | Ed25519 signing implemented (Phase 4) |

**Research Gate Files**: `docs/research/RG-<n>-<topic>.md` (created as research progresses)

### Provisional Modes (Research Pending)

| Feature | Research Gate | Current Behavior |
|---------|--------------|------------------|
| Multi-agent coordination | RG-2 | Single-agent mode enforced; concurrent writes rejected |
| Constraint decay | RG-4 | Manual retirement via dashboard |

### Health Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Prevention rate | effectiveness-metrics | <50% (constraint not working) |
| False positive rate | effectiveness-metrics | >10% (too aggressive) |
| Circuit trip rate | circuit-breaker | >3/month per constraint |
| Override rate | emergency-override | >5% of violations |
| Generation velocity | constraint-generator | <1/week (system idle?) |
| Search latency | memory-search | >2s average |

### State File Versioning

All governance state files include schema versioning:

```json
{
  "schema_version": "1.0.0",
  "data": { /* state data */ },
  "migration_history": [
    {"from": "0.9.0", "to": "1.0.0", "date": "2026-02-14", "tool": "version-migration"}
  ]
}
```

**Compatibility Rules**:
- Forward: Auto-migrate on read (v1.0 code reads v1.1 file)
- Backward: Fail with upgrade prompt (v1.0 code rejects v0.9 file)
- Unknown: Fail closed, require manual intervention

## Bridge Layer (Phase 5)

The Bridge layer connects the constraint/observation system to external ClawHub components.
These skills translate internal data formats into interfaces that self-improving-agent,
proactive-agent, and VFM system can consume.

**Architectural Decision**: Mock adapter pattern enables development and testing without
ClawHub dependencies. Skills use interface-first design with dependency injection.

### Bridge Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| learnings-n-counter | Convert N-count progression to learnings for self-improving-agent | ✅ Implemented | `agentic/bridge/learnings-n-counter/` |
| feature-request-tracker | Track feature requests from constraint gaps for proactive-agent | ✅ Implemented | `agentic/bridge/feature-request-tracker/` |
| wal-failure-detector | Detect failure patterns in proactive-agent's WAL | ✅ Implemented | `agentic/bridge/wal-failure-detector/` |
| heartbeat-constraint-check | Periodic constraint health for proactive-agent heartbeat | ✅ Implemented | `agentic/bridge/heartbeat-constraint-check/` |
| vfm-constraint-scorer | Score constraints using VFM methodology | ✅ Implemented | `agentic/bridge/vfm-constraint-scorer/` |

**Dependencies**: Core Memory layer, Review & Detection layer, Governance & Safety layer
**Used by**: ClawHub components (self-improving-agent, proactive-agent, VFM system)
**Implemented**: 2026-02-14 (Phase 5)

### Integration Points

| ClawHub Component | Bridge Skill | Data Flow |
|-------------------|--------------|-----------|
| self-improving-agent | learnings-n-counter | Observations (N≥3) → LearningsExport → Agent learns |
| proactive-agent | feature-request-tracker | Constraint gaps → FeatureRequest → Agent prioritizes |
| proactive-agent | wal-failure-detector | WAL entries → WALFailure → failure-detector |
| proactive-agent | heartbeat-constraint-check | Constraints → HealthCheckSummary → Agent monitors |
| VFM system | vfm-constraint-scorer | Constraints → VFMScore → VFM prioritizes |

### Adapter Pattern

Skills use dependency injection for external component integration:

```typescript
import { getAdapter } from '../adapters';

// Returns MockSelfImprovingAgent (mock) or real adapter (when ClawHub exists)
const agent = getAdapter('self-improving-agent');
await agent.consumeLearnings(learningsExport);
```

**Environment Variable**: `BRIDGE_ADAPTER_MODE`
- `mock` (default): Use mock adapters for testing
- `real`: Use real adapters when ClawHub exists

### Interface Definitions

Located in `agentic/bridge/interfaces/`:

| Interface File | Key Types | Purpose |
|----------------|-----------|---------|
| `self-improving-agent.ts` | `LearningsExport`, `Learning` | Export format for N≥3 learnings |
| `proactive-agent.ts` | `WALEntry`, `HealthAlert`, `HealthCheckSummary` | WAL parsing and health monitoring |
| `vfm-system.ts` | `VFMScore`, `VFMRanking`, `VFMWeights` | Value scoring and ranking |

### Bridge Data Flow

```
observation-recorder ──► learnings-n-counter ──► self-improving-agent
       │
       ▼
constraint-generator ──► feature-request-tracker ──► proactive-agent
                                                          │
proactive-agent WAL ──► wal-failure-detector ─────────────┘
                                                          │
constraint-enforcer ──► heartbeat-constraint-check ───────┘

effectiveness-metrics ──► vfm-constraint-scorer ──► VFM system
```

## Extensions Layer (Phase 6)

The Extensions layer implements observation-backed skills derived from high N-count patterns
and validated workflows. Unlike architecture-driven skills (Phases 1-5), these skills encode
proven workflows and patterns into reusable automation.

**Architectural Decision**: Skills encode battle-tested patterns (N≥3) into CLI tools.
Proactive integration (hooks, watchers) deferred to Phase 7+.

**Implementation Note**: Phase 6 is **specification + contract testing** only. Each skill has:
- SKILL.md specification defining behavior and CLI interface
- Contract tests with mock implementations verifying data contracts
- No runtime CLI wrapper code (deferred to Phase 7+)

The "✅ Implemented" status indicates spec + tests complete. CLI execution requires Phase 7 work.

### Workflow Encoding Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| loop-closer | Detect DEFERRED/PLACEHOLDER/TODO before completion | ✅ Implemented | `agentic/extensions/loop-closer/` |
| parallel-decision | 5-factor framework for parallel vs serial decisions | ✅ Implemented | `agentic/extensions/parallel-decision/` |
| threshold-delegator | Auto-suggest delegation when counts exceed thresholds | ✅ Implemented | `agentic/extensions/threshold-delegator/` |

### MCE Compliance Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| mce-refactorer | Analyze files for MCE compliance, suggest splits | ✅ Implemented | `agentic/extensions/mce-refactorer/` |
| hub-subworkflow | Split large docs into hub + sub-document structure | ✅ Implemented | `agentic/extensions/hub-subworkflow/` |

### Observation Management Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| pbd-strength-classifier | Classify observation strength (weak/medium/strong) | ✅ Implemented | `agentic/extensions/pbd-strength-classifier/` |
| observation-refactoring | Rename/consolidate/promote/archive observations | ✅ Implemented | `agentic/extensions/observation-refactoring/` |

### Constraint Evolution Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| constraint-versioning | Track constraint evolution and N-count progression | ✅ Implemented | `agentic/extensions/constraint-versioning/` |
| cross-session-safety-check | Detect cross-session state interference | ✅ Implemented | `agentic/extensions/cross-session-safety-check/` |

### Pattern Detection Skills

| Skill | Purpose | Status | Location |
|-------|---------|--------|----------|
| pattern-convergence-detector | Monitor N=2 patterns for convergence signals | ✅ Implemented | `agentic/extensions/pattern-convergence-detector/` |

**Dependencies**: May depend on any lower layer; observation data from Core Memory
**Used by**: Human developers via CLI invocation
**Implemented**: 2026-02-15 (Phase 6)

### Source Evidence

| Skill | Source Document | N-Count |
|-------|-----------------|---------|
| loop-closer | docs/workflows/closing-loops.md | N=3 |
| parallel-decision | docs/workflows/parallel-vs-serial-decision.md | N=5 |
| threshold-delegator | docs/patterns/auto-delegate-on-threshold.md | N=3 |
| mce-refactorer | docs/patterns/mce-refactoring.md | N=7 |
| hub-subworkflow | docs/patterns/hub-subworkflow.md | N=5 |
| pbd-strength-classifier | docs/observations/resist-file-proliferation.md | N=11 |
| observation-refactoring | docs/workflows/observation-refactoring.md | N=5 |
| constraint-versioning | docs/observations/configuration-as-code.md | N=9 |
| cross-session-safety-check | docs/observations/plan-approve-implement.md | N=4 |
| pattern-convergence-detector | Multiple N=2→N=3 progressions | N=2+ |

---

## Data Flow

### Failure → Constraint Lifecycle

```
1. DETECT
   └── failure-detector identifies failure signal
       (test failure, user correction, review finding, runtime error)

2. RECORD
   └── failure-tracker creates/updates observation
       └── R (recurrence) counter incremented

3. VERIFY
   └── Human confirms (C+1) or disconfirms (D+1)
       └── Multiple sources required for diversity

4. GENERATE
   └── When R≥3 AND C≥2 AND |sources|≥2:
       └── constraint-generator creates candidate

5. ACTIVATE
   └── constraint-lifecycle transitions: draft → active
       └── 90-day review gates

6. ENFORCE
   └── constraint-enforcer checks actions at runtime
       └── circuit-breaker tracks violations
           └── 5 violations in 30 days → OPEN state
```

### Circuit Breaker States

The circuit breaker protects against repeated constraint violations:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CIRCUIT BREAKER STATES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    5 violations     ┌──────────┐                      │
│  │  CLOSED  │ ─────────────────►  │   OPEN   │                      │
│  │ (normal) │    in 30 days       │ (tripped)│                      │
│  └────┬─────┘                     └────┬─────┘                      │
│       │                                │                             │
│       │ action allowed                 │ action BLOCKED              │
│       │                                │ + human notified            │
│       │                                │                             │
│       │                           ┌────▼─────┐                       │
│       │    cooldown expires       │HALF-OPEN │                       │
│       │◄───────────────────────── │ (testing)│                       │
│       │    (24h) + no violations  └──────────┘                       │
│                                        │                             │
│                                        │ violation in test period    │
│                                        │ → back to OPEN              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**State Definitions**:

| State | Behavior | Entry Condition | Exit Condition |
|-------|----------|-----------------|----------------|
| CLOSED | Normal operation, actions allowed | Initial state, or successful test period | 5 violations in 30 days |
| OPEN | Actions BLOCKED, human notified | 5 violations in rolling 30-day window | 24-hour cooldown expires |
| HALF-OPEN | Testing period, single violation trips back to OPEN | After OPEN cooldown | No violations in 24h → CLOSED |

**Recovery Procedure** (when OPEN):

1. **Notification**: Human receives alert with violation history
2. **Investigation**: Review the 5+ violations to understand root cause
3. **Resolution**: Either fix the underlying issue or adjust the constraint
4. **Manual Reset**: Use `/circuit-breaker reset <constraint-id>` to force CLOSED
5. **Auto-Recovery**: After 24h cooldown, enters HALF-OPEN for testing

**Configuration** (environment variables):

| Variable | Default | Description |
|----------|---------|-------------|
| `CIRCUIT_BREAKER_THRESHOLD` | `5` | Violations before OPEN |
| `CIRCUIT_BREAKER_WINDOW_DAYS` | `30` | Rolling window for counting |
| `CIRCUIT_BREAKER_COOLDOWN_HOURS` | `24` | Cooldown before HALF-OPEN |

**Severity-Tiered Defaults**:

| Severity | Violations | Window | Rationale |
|----------|------------|--------|-----------|
| CRITICAL | 3 | 30 days | High-risk constraints trip early |
| IMPORTANT | 5 | 30 days | Standard threshold (validated) |
| MINOR | 10 | 30 days | Low-risk, more tolerance |

Individual constraints can override these defaults via metadata.

### Threat Model

**What we protect against**:

| Threat | Mitigation |
|--------|------------|
| Accidental file corruption | Hash verification (SHA-256/MD5) |
| Context drift between sessions | Context packets with file hashes |
| Repeated AI mistakes | Failure-to-constraint lifecycle |
| Constraint violation storms | Circuit breaker (5 violations → OPEN) |

**What we do NOT protect against**:

| Threat | Why Not | Mitigation |
|--------|---------|------------|
| Adversarial tampering | ✅ Mitigated | Ed25519 packet signing (Phase 4) |
| Malicious packet injection | ✅ Mitigated | Signed packets verify provenance |
| Compromised constraint source | Trust model assumes honest input | Constraint provenance tracking (future) |
| AI intentionally evading constraints | Pattern matching is gameable | Semantic classification (Phase 2+) |

**Trust assumptions**:
- Constraint sources are honest (human-verified)
- File system is not adversarially manipulated
- AI is confused, not malicious (errors are mistakes, not attacks)

### Context Loading

```
1. SESSION START
   └── contextual-injection loads relevant constraints
       └── Filters by file patterns and tags

2. FILE ACCESS
   └── context-packet generates auditable hashes
       └── file-verifier validates identity

3. CONSTRAINT CHECK
   └── constraint-enforcer returns violations
       └── severity-tagger classifies each
```

---

## ClawHub Integration

### self-improving-agent

The self-improving-agent learns from session patterns:

```
self-improving-agent
        │
        ▼
learnings-n-counter ──► observation-recorder
        │
        ▼
Learns from N-count progression
```

### proactive-agent

The proactive-agent monitors system health:

```
proactive-agent
        │
        ├──► heartbeat-constraint-check
        │            │
        │            ▼
        │    Periodic constraint verification
        │
        └──► wal-failure-detector
                     │
                     ▼
             Write-ahead log monitoring
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTIC_CONSTRAINTS_PATH` | Path to constraints directory | `docs/constraints/` |
| `AGENTIC_OBSERVATIONS_PATH` | Path to observations directory | `docs/observations/` |
| `CIRCUIT_BREAKER_THRESHOLD` | Violations before trip | `5` |
| `CIRCUIT_BREAKER_WINDOW_DAYS` | Rolling window for violations | `30` |

### File Paths

```
project/
├── docs/
│   ├── constraints/
│   │   ├── active/      # Currently enforced
│   │   ├── draft/       # Pending activation
│   │   └── retired/     # No longer enforced
│   └── observations/    # Failure and pattern observations
└── .claude/
    └── skills/
        └── agentic/     # Symlink to skill definitions
```

---

## Guides

Technical guides for skill implementation:

| Guide | Purpose |
|-------|---------|
| [Semantic Similarity](docs/guides/SEMANTIC_SIMILARITY_GUIDE.md) | LLM-based action classification (REQUIRED for safety-critical skills) |

**Two-Stage Matching** (default pattern for balancing accuracy and performance):
1. **Stage 1**: Embedding similarity (<50ms) - fast filter, high recall
2. **Stage 2**: LLM classification (500ms-2s) - accurate decision for candidates

Use single-stage LLM for CRITICAL severity; two-stage for IMPORTANT/MINOR.
See specification Performance Requirements for latency targets by skill category.

## Workflows

| Workflow | Purpose |
|----------|---------|
| [Documentation Update](docs/workflows/documentation-update.md) | Process for updating docs when skills/architecture change |
| [Phase Completion](docs/workflows/phase-completion.md) | Checklist for completing implementation phases |

---

## Extending the System

### Acceptance Criteria Convention

SKILL.md files contain `## Acceptance Criteria` sections with checkboxes.

**Convention by phase**:
- **Phase 1-2 (Foundation, Core)**: Unchecked (`- [ ]`) - specs as immutable documentation
- **Phase 3+ (Review, Governance, Extensions)**: Checked (`- [x]`) - contract-tested skills

**Verification tracking**:
- Results files (`docs/implementation/agentic-phase*-results.md`) document what was verified
- Behavioral tests (`tests/e2e/*.test.ts`) provide automated verification
- For Phase 3+, checked boxes indicate contract tests exist and pass

This reflects the evolution from pure specification (Phase 1-2) to verified implementation (Phase 3+).

### Command Syntax Convention

SKILL.md files use angle-bracket placeholders for command arguments. Use consistent terminology:

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<file>` | Code file path | `/mce-refactorer analyze <file>` |
| `<doc>` | Documentation file path | `/hub-subworkflow analyze <doc>` |
| `<observation>` | Observation file path | `/pbd-strength-classifier assess <observation>` |
| `<path>` | Directory or file path | `/loop-closer check <path>` |
| `<constraint>` | Constraint name/identifier | `/constraint-versioning history <constraint>` |
| `<task>` | Task description | `/parallel-decision evaluate <task>` |

**Guidelines**:
- Use the most specific term applicable (`<observation>` over `<file>` for observation skills)
- Directory-accepting arguments should use `<path>`
- Document the placeholder in the Arguments table

### Adding a New Skill

1. Copy `agentic/SKILL_TEMPLATE.md` to appropriate layer directory
2. Fill in skill specification following template
3. Update this ARCHITECTURE.md:
   - Add skill to layer table
   - Update dependency graph if needed
   - Document new data flows
4. Test skill loads: `/new-skill --help`
5. Add acceptance tests

### Layer Guidelines

| Layer | Dependency Rule |
|-------|-----------------|
| Foundation | No dependencies on other agentic skills |
| Core | May depend on Foundation and other Core skills |
| Review/Detection | May depend on Foundation and Core |
| Governance/Safety | May depend on any lower layer |
| Bridge | May depend on any layer; interfaces with ClawHub |
| Extensions | May depend on any layer; derived from observations |

**Note**: Within the Core Memory layer, skills have a defined dependency flow:
`failure-tracker → constraint-generator → constraint-lifecycle → circuit-breaker → emergency-override`.
This is by design—the failure-anchored learning system requires this pipeline.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-13 | Initial architecture with layer diagram |
| 0.2.0 | 2026-02-13 | Phase 1 complete: 5 Foundation layer skills implemented |
| 0.3.0 | 2026-02-13 | Phase 2 complete: 9 Core Memory layer skills implemented |
| 0.4.0 | 2026-02-14 | Phase 3 complete: 10 Review & Detection layer skills implemented |
| 0.5.0 | 2026-02-14 | Phase 4 complete: 9 Governance & Safety layer skills implemented |
| 0.5.1 | 2026-02-14 | Added severity-tiered circuit breaker defaults, two-stage matching |
| 0.6.0 | 2026-02-14 | Phase 5 complete: 5 Bridge layer skills implemented |
| 0.7.0 | 2026-02-15 | Phase 6 complete: 10 Extensions layer skills implemented |
| 0.8.0 | 2026-02-15 | Phase 7 complete: Architecture finalization, dependency verification, all 47 skills operational |

---

*Architecture complete. 47 skills across 6 layers. See Extending the System for adding new skills.*
