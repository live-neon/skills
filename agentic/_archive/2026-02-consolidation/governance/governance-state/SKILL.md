---
name: governance-state
version: 1.0.0
description: Central state tracking for constraint lifecycle with event-driven governance
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, governance, state-machine, constraints]
layer: governance
status: active
---

# governance-state

Central state tracking for constraint lifecycle. This is the brain of the governance
layer - it knows the state of every constraint and coordinates transitions.

**Architectural Decision**: Event-driven governance (primary), dashboard (secondary).
Constraints get attention only when needed, not via constant monitoring.

## Problem Being Solved

Constraints exist in states (draft, active, retiring, retired) but nothing tracks
the overall distribution or triggers reviews. governance-state provides the central
authority for constraint state.

## Usage

```
/governance-state dashboard
/governance-state query --state <state>
/governance-state approve <id>
/governance-state reject <id> [--force]
/governance-state recover <id>
/governance-state transition <id> <state>
/governance-state confirm <id>
/governance-state history <id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| dashboard | - | Show state distribution and health summary |
| query | - | List constraints by state |
| approve | Yes (id) | Transition draft -> active |
| reject | Yes (id) | Soft-delete draft (7-day recovery, --force for permanent) |
| recover | Yes (id) | Restore soft-deleted within 7-day window |
| transition | Yes (id, state) | Manual state transition |
| confirm | Yes (id) | Transition retiring -> retired |
| history | Yes (id) | Show state transition history |

## State Machine

```
     +---------+
     |  draft  | --(approved)-> active
     +----+----+                  |
          |                       |
     (rejected)             (90-day review)
          |                       |
          v                       v
     +---------+            +----------+
     | deleted |            | retiring |
     +---------+            +----+-----+
                                 |
                            (confirmed)
                                 |
                                 v
                            +---------+
                            | retired |
                            +---------+
```

**Deletion Safeguard**: `reject` performs soft-delete by default with 7-day recovery.
Use `--force` for permanent deletion. `recover` restores within window.

## Output

```
GOVERNANCE STATE DASHBOARD
--------------------------

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
  git-force-push: active -> retiring (2026-02-10)
  test-coverage: draft -> active (2026-02-08)
```

## Multi-Agent Coordination (RG-2 Provisional)

**Status**: RG-2 research pending. Single-agent mode enforced.

**Lock File Location**: `.claude/governance-state.lock`

**Lock File Format**:
```json
{
  "agent_id": "agent-abc123",
  "acquired_at": "2026-02-14T10:30:00Z",
  "expires_at": "2026-02-14T10:35:00Z",
  "resource": "governance-state"
}
```

**Behavior**:
- Reject concurrent write attempts: "Concurrent modification detected. Retry or use --force"
- Version field in state file for conflict detection
- Lock file with agent ID and timestamp for debugging
- **Lock TTL**: 5 minutes default; auto-expires to prevent deadlock from crashed agents
- **Heartbeat**: Agent holding lock must refresh every 60 seconds to extend TTL
- No automatic retry (fail-fast to surface coordination issues)

**Deadlock Prevention**: If an agent crashes while holding a lock, the lock expires after
5 minutes. Other agents check `expires_at` before assuming deadlock.

**TTL Trade-off**: Shorter TTL = faster crash detection but more heartbeat overhead.
Current 5-minute TTL with 60-second heartbeat balances detection speed (max 5 min wait)
with low overhead (~5 heartbeats per lock). For high-frequency operations, consider
2-minute TTL with 30-second heartbeat.

**Exit Criteria**: RG-2 research complete, coordination strategy implemented.

## Observability Integration (Phase 4)

**Health Metrics**:

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Prevention rate | effectiveness-metrics | <50% (constraint not working) |
| False positive rate | effectiveness-metrics | >10% (too aggressive) |
| Circuit trip rate | circuit-breaker | >3/month per constraint |
| Override rate | emergency-override | >5% of violations |
| Generation velocity | constraint-generator | <1/week (system idle?) |
| Search latency | memory-search | >2s average |

**Alert Delivery** (event-driven primary):
1. When threshold exceeded, auto-create issue file:
   `docs/issues/governance-alert-YYYY-MM-DD-<metric>.md`
2. Issue includes: metric name, current value, threshold, recommended action
3. Dashboard also shows active alerts (secondary, for deep-dive sessions)

**Alert File Template**: See `docs/templates/governance-alert-template.md` for full format.
Alert files include: metric name, current value, threshold, recommended action, related
constraints, and link to dashboard mode.

*All alerts end with: "For deeper analysis, run `/governance-state dashboard`"*

## Example

```
/governance-state query --state active

ACTIVE CONSTRAINTS
------------------

| ID | Name | Age | Prevention | FP Rate |
|----|------|-----|------------|---------|
| 1 | git-force-push-safety | 94d | 91.7% | 8.3% |
| 2 | test-before-commit | 45d | 98.2% | 1.2% |
| 3 | code-review-required | 120d | 85.0% | 5.0% |

Total: 3 active constraints
```

## Integration

- **Layer**: Governance
- **Depends on**: constraint-lifecycle, effectiveness-metrics
- **Used by**: constraint-reviewer, index-generator, adoption-monitor

## Cleanup/Maintenance Commands

```
/governance-state archive-observations --older-than 180d
/governance-state bulk-retire --dormant-days 90 --dry-run
/governance-state bulk-retire --dormant-days 90 --confirm
/governance-state cleanup-archived --delete-after 365d
```

**Safe by Default**: All destructive operations require `--confirm` or `--force`.

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint <id> not found" |
| Invalid transition | Error: "Cannot transition from <current> to <target>" |
| Concurrent modification | Error: "Concurrent modification detected. Version mismatch." |
| Recovery window expired | Error: "Recovery window expired (7 days). Use --force to confirm." |

## Acceptance Criteria

- [ ] State dashboard shows distribution (secondary mode)
- [ ] State queries filter correctly by state
- [ ] Transitions validate allowed paths
- [ ] History tracks all transitions with timestamps
- [ ] Consumes effectiveness-metrics data
- [ ] RG-2 provisional mode enforced (single-agent)
- [ ] Soft-delete with 7-day recovery works
- [ ] Bulk operations require explicit confirmation
- [ ] Tests added to skill-behavior.test.ts

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to Governance layer table if new skill
2. **Update upstream skills** - Add this skill to their "Used by" lists
3. **Update downstream skills** - Verify "Depends on" lists are current
4. **Run verification** - `cd tests && npm test`
5. **Check closing loops** - See `docs/workflows/phase-completion.md`

**If part of a phase implementation**:
- Mark stage complete in implementation plan
- Proceed to next stage OR run phase-completion workflow
- Update `docs/implementation/agentic-phase4-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
