---
name: learnings-n-counter
version: 1.0.0
description: Convert observation N-count progression into learnings for self-improving-agent
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, bridge, learnings, n-count, self-improving]
layer: bridge
status: active
---

# learnings-n-counter

Convert observation N-count progression into learnings for self-improving-agent.
This skill bridges the observation system to ClawHub's learning loop.

## Problem Being Solved

self-improving-agent needs to learn from patterns discovered by the constraint system.
Observations with high N-counts represent validated learnings, but the agent can't
access them directly. learnings-n-counter translates N-count progression into a
format self-improving-agent can consume.

## Usage

```
/learnings-n-counter summarize                     # All learnings N>=3
/learnings-n-counter summarize --min-n 5           # High-confidence learnings
/learnings-n-counter summarize --category safety   # Category filter
/learnings-n-counter progression <observation-id>  # N=1->N=X journey
/learnings-n-counter export --format json          # Export for agent consumption
```

## Example

```bash
# List high-confidence learnings (N>=5)
/learnings-n-counter summarize --min-n 5

# See how an observation evolved from N=1 to N=8
/learnings-n-counter progression plan-approve-workflow-required
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: summarize, progression, export |
| observation-id | Yes* | Observation identifier (*for progression only) |
| --min-n | No | Minimum N-count threshold (default: 3) |
| --category | No | Filter by category (safety, efficiency, process, etc.) |
| --format | No | Export format: json, yaml (default: json) |
| --since | No | Time filter: 7d, 30d, 90d, all (default: all) |

## N-Count Conversion from Related Links

**Verification** (N=2): 156 out of 179 observations (87%) contain "## Related" sections
linking related observations. This is sufficient coverage for the feature.

**Mechanism**:
1. Parses observation files for "## Related" sections
2. Counts unique linked observations as evidence of N-count validity
3. Cross-references links to detect circular references (which inflate N-count artificially)
4. Exports validated N-counts excluding circular references

**Validation Logic**: An observation with N=5 that links to 3 other observations, where
2 of those link back, has stronger evidence than an isolated N=5 observation.

## Output

### Summarize Learnings

```
/learnings-n-counter summarize --min-n 3

LEARNINGS SUMMARY (N>=3)
========================

High Confidence (N>=5):
  1. plan-approve-workflow-required
     N: 8 | Category: process
     Summary: Multi-step tasks require explicit approval between phases
     Linked constraint: plan-approve-implement (prevention: 94%)
     Related observations: 4

  2. context-loading-timing
     N: 6 | Category: efficiency
     Summary: Load context files at session start, not mid-task
     Linked constraint: early-context-load (prevention: 91%)
     Related observations: 3

Medium Confidence (N=3-4):
  3. semantic-matching-threshold
     N: 4 | Category: technical
     Summary: 0.85 threshold balances precision vs recall for matches
     Linked constraint: semantic-similarity-config
     Related observations: 2

  4. git-hook-escalation
     N: 3 | Category: safety
     Summary: Hook failures should escalate to planner, not bypass
     Linked constraint: git-safety-protocol (prevention: 98%)
     Related observations: 2

Total: 12 learnings (4 high, 8 medium)
Export: /learnings-n-counter export --format json
```

### Progression Journey

```
/learnings-n-counter progression plan-approve-workflow-required

PROGRESSION: plan-approve-workflow-required
==========================================

N=1 (2025-11-15):
  Source: Session where plan was implemented without approval
  Event: User feedback "I wanted to review before changes"

N=2 (2025-11-22):
  Source: Code review missed approval step
  Event: Similar feedback, pattern recognized

N=3 (2025-12-01):
  Source: Constraint generated from observations
  Event: Promoted to constraint "plan-approve-implement"

N=5 (2025-12-15):
  Source: Multiple sessions confirmed pattern
  Event: Prevention rate measured at 91%

N=8 (2026-02-10):
  Source: Cross-session validation
  Event: Prevention rate improved to 94%

Constraint link: plan-approve-implement
Prevention rate: 94%
Status: HIGH confidence learning
```

### Export for Agent

```
/learnings-n-counter export --format json

{
  "version": "1.0.0",
  "exported_at": "2026-02-14T15:30:00Z",
  "min_n_count": 3,
  "total_count": 12,
  "learnings": [
    {
      "id": "plan-approve-workflow-required",
      "observation_id": "obs-plan-approve-001",
      "n_count": 8,
      "summary": "Multi-step tasks require explicit approval between phases",
      "category": "process",
      "constraint_id": "plan-approve-implement",
      "prevention_rate": 0.94,
      "related_observations": [
        "obs-plan-approve-002",
        "obs-plan-approve-003",
        "obs-context-timing-001",
        "obs-workflow-pause-001"
      ]
    }
  ]
}

Exported to: .exports/learnings-2026-02-14.json
Ready for self-improving-agent consumption.
```

## Confidence Levels

| Level | N-Count Range | Meaning |
|-------|---------------|---------|
| High | N >= 5 | Strongly validated learning |
| Medium | N = 3-4 | Validated learning |
| Low | N = 1-2 | Not exported (insufficient evidence) |

## Circular Reference Detection

When counting related links, circular references are detected and excluded:

```
Observation A -> links to B
Observation B -> links to A  (circular: excluded from A's count)
Observation B -> links to C  (not circular: included)
```

This prevents artificial N-count inflation through mutual linking.

## Integration

- **Layer**: Bridge
- **Depends on**: observation-recorder, memory-search
- **Used by**: self-improving-agent (via mock adapter until ClawHub exists)

## Adapter Pattern

This skill uses the bridge adapter pattern for self-improving-agent integration:

```typescript
import { getAdapter } from '../adapters';

const agent = getAdapter('self-improving-agent');
await agent.consumeLearnings(learningsExport);
```

Environment variable `BRIDGE_ADAPTER_MODE` controls adapter selection:
- `mock` (default): Uses MockSelfImprovingAgent for testing
- `real`: Uses real adapter when ClawHub exists

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No observations found | Info: "No observations found with N >= <min_n>" |
| Invalid observation ID | Error: "Observation not found: <id>" |
| Invalid category | Warning: "Unknown category: <cat>. Showing all." |
| Export write fails | Error: "Failed to write export: <reason>" |
| No Related sections | Warning: "Observation has no Related links. N-count based on sources only." |

## Acceptance Criteria

- [x] Returns observations with N >= specified threshold
- [x] progression command shows N=1 -> N=X journey with dates
- [x] export produces valid JSON matching LearningsExport interface
- [x] Category filtering works correctly
- [x] Timeframe filtering works correctly
- [x] Circular reference detection prevents inflated counts
- [x] Mock adapter integration works
- [x] SKILL.md compliant with MCE limits (< 200 lines body)

## Next Steps

See [Bridge README](../README.md) for layer overview and workflows.

**Verification**: `cd tests && npm test -- --grep "learnings-n-counter"`
