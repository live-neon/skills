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
│  Skills: constraint-versioning, pbd-strength-classifier,        │
│          cross-session-safety-check, pattern-convergence-       │
│          detector                                                │
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

*Section to be populated after Phase 2 implementation.*

## Review & Detection Layer (Phase 3)

*Section to be populated after Phase 3 implementation.*

## Governance & Safety Layer (Phase 4)

*Section to be populated after Phase 4 implementation.*

## Bridge Layer (Phase 5)

*Section to be populated after Phase 5 implementation.*

## Extensions Layer (Phase 6)

*Section to be populated after Phase 6 implementation.*

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

### Threat Model

**What we protect against**:

| Threat | Mitigation |
|--------|------------|
| Accidental file corruption | Hash verification (SHA-256/MD5) |
| Context drift between sessions | Context packets with file hashes |
| Repeated AI mistakes | Failure-to-constraint lifecycle |
| Constraint violation storms | Circuit breaker (5 violations → OPEN) |

**What we do NOT protect against**:

| Threat | Why Not | Future Mitigation |
|--------|---------|-------------------|
| Adversarial tampering | Packets are unsigned JSON | Signing (Phase 3 governance) |
| Malicious packet injection | No authentication | Signed packets + chain of custody |
| Compromised constraint source | Trust model assumes honest input | Constraint provenance tracking |
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

## Workflows

| Workflow | Purpose |
|----------|---------|
| [Documentation Update](docs/workflows/documentation-update.md) | Process for updating docs when skills/architecture change |

---

## Extending the System

### Acceptance Criteria Convention

SKILL.md files contain `## Acceptance Criteria` sections with unchecked checkboxes (`- [ ]`).
These document the expected behavior but are NOT updated when verified.

**Verification tracking**:
- Results file (`docs/implementation/agentic-phase1-results.md`) documents what was verified
- Behavioral tests (`tests/e2e/skill-behavior.test.ts`) provide automated verification
- Checkboxes remain as documentation of expected behavior

This separation keeps SKILL.md files as immutable specifications.

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
| Core | May depend on Foundation only |
| Review/Detection | May depend on Foundation and Core |
| Governance/Safety | May depend on any lower layer |
| Bridge | May depend on any layer; interfaces with ClawHub |
| Extensions | May depend on any layer; derived from observations |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-13 | Initial architecture with layer diagram |
| 0.2.0 | 2026-02-13 | Phase 1 complete: 5 Foundation layer skills implemented |

---

*Architecture maintained as skills are implemented. Each phase updates relevant sections.*
