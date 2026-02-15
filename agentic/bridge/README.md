# Bridge Layer

The Bridge layer connects the constraint/observation system to external ClawHub components.
Skills in this layer translate internal data formats to external APIs using the adapter pattern.

## Glossary

| Term | Definition |
|------|------------|
| **ClawHub** | External agent orchestration system (not yet implemented). Bridge skills prepare data for future ClawHub integration. |
| **self-improving-agent** | ClawHub component that learns from patterns to improve agent behavior over time. |
| **proactive-agent** | ClawHub component that monitors system health and takes preventive actions. |
| **VFM** | Value Function Model - methodology for scoring constraint effectiveness using weighted metrics. |
| **WAL** | Write-Ahead Log - sequential log of agent actions used for failure detection and recovery. |
| **N-count** | Recurrence count for observations. N>=3 indicates validated patterns suitable for learning export. |

## Skills Overview

| Skill | Purpose | Integrates With |
|-------|---------|-----------------|
| [learnings-n-counter](learnings-n-counter/SKILL.md) | Export N>=3 observations as learnings | self-improving-agent |
| [feature-request-tracker](feature-request-tracker/SKILL.md) | Track feature gaps from constraints | proactive-agent |
| [wal-failure-detector](wal-failure-detector/SKILL.md) | Detect failure patterns in WAL | proactive-agent |
| [heartbeat-constraint-check](heartbeat-constraint-check/SKILL.md) | Periodic constraint health checks | proactive-agent |
| [vfm-constraint-scorer](vfm-constraint-scorer/SKILL.md) | Score constraints using VFM formula | VFM system |

## Data Flow

```
Observations (N>=3)  ─────►  learnings-n-counter  ─────►  self-improving-agent
                                                              │
Constraint Gaps      ─────►  feature-request-tracker ─────►   │
                                                              ▼
WAL Entries          ─────►  wal-failure-detector   ─────►  proactive-agent
                                                              │
Constraint State     ─────►  heartbeat-constraint-check ──►   │
                                                              │
Constraint Metrics   ─────►  vfm-constraint-scorer  ─────►  VFM system
```

## Adapter Pattern

All bridge skills use the adapter pattern for ClawHub integration:

```typescript
import { getAdapter } from './adapters';

// Environment: BRIDGE_ADAPTER_MODE=mock (default) or real
const agent = getAdapter('proactive-agent');
await agent.sendAlert(alertData);
```

- **mock mode**: Uses local mock adapters for testing (default)
- **real mode**: Uses real ClawHub adapters (when implemented)

## When to Use Each Skill

| If you want to... | Use this skill |
|-------------------|----------------|
| Export validated learnings for agent training | `learnings-n-counter` |
| Track feature requests from constraint gaps | `feature-request-tracker` |
| Detect failure patterns in agent actions | `wal-failure-detector` |
| Monitor constraint health between reviews | `heartbeat-constraint-check` |
| Prioritize constraints by value | `vfm-constraint-scorer` |

## Interface Versioning

Each interface exports a version constant (e.g., `SELF_IMPROVING_INTERFACE_VERSION = '1.0.0'`).

**Versioning strategy** (Phase 5b):
- **Major**: Breaking changes to interface shape
- **Minor**: Additions that maintain backward compatibility
- **Patch**: Documentation or comment updates

---

*Bridge Layer - Phase 5 of Agentic Skills*
