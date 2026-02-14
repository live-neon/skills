# Agentic Memory Skills

Skills for failure-anchored learning and constraint enforcement. These skills implement
the core insight that **AI systems learn best from consequences, not instructions**.

## The Failure → Constraint Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAILURE DETECTED                              │
│  (test failure, user correction, review finding, runtime error) │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 OBSERVATION CREATED                              │
│  failure-tracker creates/updates observation file                │
│  R (recurrence) counter incremented                              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 HUMAN VERIFICATION                               │
│  Confirm (C+1) or Disconfirm (D+1)                               │
│  Multiple sources required for diversity                         │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              ELIGIBILITY CHECK                                   │
│  R ≥ 3 AND C ≥ 2 AND |unique_sources| ≥ 2                       │
│  constraint-generator creates candidate if eligible              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONSTRAINT LIFECYCLE                                │
│  draft → active → (optional: retiring → retired)                 │
│  90-day review gates                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              RUNTIME ENFORCEMENT                                 │
│  constraint-enforcer checks actions                              │
│  circuit-breaker tracks violations (5 in 30d → OPEN)            │
└─────────────────────────────────────────────────────────────────┘
```

## Skill Layers

| Layer | Purpose | Skills |
|-------|---------|--------|
| **Foundation** | Low-level primitives | context-packet, file-verifier, constraint-enforcer, severity-tagger, positive-framer |
| **Core** | Memory operations | failure-tracker, constraint-generator, observation-recorder, memory-search, circuit-breaker, emergency-override, constraint-lifecycle, contextual-injection, progressive-loader |
| **Review** | Multi-agent review | twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer, slug-taxonomy |
| **Detection** | Pattern recognition | failure-detector, topic-tagger, evidence-tier, effectiveness-metrics |
| **Governance** | Constraint management | constraint-reviewer, index-generator, round-trip-tester, governance-state |
| **Safety** | Runtime protection | model-pinner, fallback-checker, cache-validator, adoption-monitor |
| **Bridge** | ClawHub integration | learnings-n-counter, feature-request-tracker, wal-failure-detector, heartbeat-constraint-check, vfm-constraint-scorer |
| **Extensions** | Observation-backed | constraint-versioning, pbd-strength-classifier, cross-session-safety-check, pattern-convergence-detector |

## Directory Structure

```
agentic/
├── README.md           # This file
├── SKILL_TEMPLATE.md   # Template for new skills
├── core/               # Core memory skills
├── review/             # Review workflow skills
├── detection/          # Pattern detection skills
├── governance/         # Constraint lifecycle skills
├── safety/             # Runtime safety skills
├── bridge/             # ClawHub integration skills
└── extensions/         # Observation-backed skills
```

## Counter Terminology

| Counter | Meaning | Updated By |
|---------|---------|------------|
| **R** (Recurrence) | Auto-detected occurrences | failure-tracker |
| **C** (Confirmations) | Human-verified true positives | Human via CLI |
| **D** (Disconfirmations) | Human-verified false positives | Human via CLI |

## ClawHub Integration

These skills integrate with existing ClawHub skills:

- **self-improving-agent**: Learns from session patterns via `learnings-n-counter`
- **proactive-agent**: Monitors system health via `heartbeat-constraint-check` and `wal-failure-detector`

## Getting Started

1. Install the skills:
   ```bash
   ln -s /path/to/skills/agentic ~/.claude/skills/agentic
   ```

2. Invoke a skill:
   ```
   /context-packet src/main.go src/handlers.go
   ```

3. See skill documentation:
   ```
   /skill-name --help
   ```

## Documentation

- **Architecture**: See `ARCHITECTURE.md` in parent directory for system overview
- **Phase 1 Results**: See `docs/implementation/agentic-phase1-results.md` for implementation status
- **Specification**: See `docs/proposals/2026-02-13-agentic-skills-specification.md` (multiverse)
- **Guides**: See `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_*.md` (multiverse)

## Testing

Unified test infrastructure at skills repo root:

```bash
# Run all skill tests (PBD + Agentic)
cd tests && npm install && npm test

# Docker-based testing with OpenClaw
cd docker && docker compose up -d
docker compose --profile test up
```

See `docker/README.md` and `tests/e2e/skill-loading.test.ts` for details.

## License

Apache 2.0 - See LICENSE in repository root.
