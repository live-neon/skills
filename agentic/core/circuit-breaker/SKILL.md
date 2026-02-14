---
name: circuit-breaker
version: 1.0.0
description: Track constraint violations and trip when threshold exceeded
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, safety, circuit-breaker]
layer: core
status: active
---

# circuit-breaker

Track constraint violations and trip when threshold exceeded. Prevents violation loops
by blocking actions after repeated violations, requiring human intervention to reset.
Each constraint has its own independent circuit breaker.

## State Machine

```
CLOSED ──────► OPEN ──────► HALF-OPEN ──────► CLOSED
   │             │              │                │
   │ 5 violations│ 24h cooldown │ success        │
   │ in 30 days  │ expires      │ (no violation) │
   │             │              │                │
   │             └──────────────┼───► OPEN       │
   │                            │ (1 violation)  │
   └────────────────────────────┴────────────────┘
```

## States

| State | Behavior | Transition To |
|-------|----------|---------------|
| CLOSED | Normal operation, violations tracked | OPEN (threshold exceeded) |
| OPEN | Actions blocked, human notified | HALF-OPEN (after 24h cooldown) |
| HALF-OPEN | Testing period, 1 violation → OPEN | CLOSED (success) or OPEN (violation) |

**HALF-OPEN Violation Behavior**: A violation during HALF-OPEN:
1. Triggers immediate transition to OPEN
2. Counts as a new violation in the rolling window
3. Resets the 24-hour cooldown timer

This is intentional—if the underlying issue isn't fixed, the circuit should
remain sensitive to violations.

## Thresholds

**Default Configuration** (validated by RG-1 research):

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Violation threshold | 5 | Matches industry 50% failure rate over minimum window |
| Window duration | 30 days | Human-AI patterns emerge over days, not seconds |
| Cooldown duration | 24 hours | Allows human investigation (industry: 10-60s) |
| Half-open violations | 1 | Conservative—single failure returns to OPEN |
| Deduplication window | 300 seconds | Prevents rapid-retry from counting as multiple |

**Research Validation**: See `neon-soul/docs/research/circuit-breaker-patterns.md` (RG-1).
Thresholds align with Resilience4j and Hystrix patterns, adapted for human-AI workflows.

## Usage

```
/circuit-breaker status [--all]
/circuit-breaker status <constraint-id>
/circuit-breaker check <constraint-id>
/circuit-breaker record <constraint-id> --action "<action>"
/circuit-breaker reset <constraint-id> [--reason <text>]
/circuit-breaker history <constraint-id> [--days <n>]
/circuit-breaker config <constraint-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: status, check, record, reset, history, config |
| constraint-id | Yes* | Constraint identifier (*not required for status --all) |
| --action | Yes* | Description of violating action (*for record only) |
| --reason | No | Explanation for manual reset |
| --all | No | Show all circuit states |
| --days | No | Limit history to N days (default: 30) |

## Example

```bash
# Check if an action would be blocked
/circuit-breaker check git-safety-force-push

# Record a violation
/circuit-breaker record git-safety-force-push --action "git push --force"

# View all circuit states
/circuit-breaker status --all

# Reset a tripped circuit after investigation
/circuit-breaker reset git-safety-force-push --reason "Root cause fixed"
```

## Output

**See `EXAMPLES.md` for detailed output examples.**

Brief summaries:

| Command | Output |
|---------|--------|
| `status --all` | Groups circuits by state (CLOSED/OPEN/HALF-OPEN) with violation counts |
| `status <id>` | Shows state, violations, configuration, recent activity |
| `check <id>` | Returns ALLOWED or BLOCKED with reasoning |
| `record` | Confirms violation recorded, warns if approaching threshold |
| `reset` | Shows state change OPEN→CLOSED, audit entry |
| `history` | Lists all violations with timestamps, marks window boundary |

## Per-Constraint Configuration

Each constraint can override default thresholds in its frontmatter:

```yaml
---
id: git-safety-force-push
severity: CRITICAL
circuit_breaker:
  violation_threshold: 3   # More sensitive for critical safety
  window_days: 14          # Shorter window
  cooldown_hours: 48       # Longer investigation time
  dedup_seconds: 600       # 10-minute deduplication
---
```

**When to customize**:
- CRITICAL constraints: Lower threshold, shorter window
- Noisy constraints: Higher threshold, longer deduplication
- Investigation-heavy: Longer cooldown

## Rolling Window

The 30-day window is a rolling window, not calendar-based:

```
Today: 2026-02-13

Window: 2026-01-14 to 2026-02-13 (30 days)

Violations in window: counted toward threshold
Violations outside window: kept for history, not counted
```

## Deduplication

Violations within the deduplication window (default: 300 seconds) count as one:

```
10:00:00 - "git push --force" → Violation #1
10:02:00 - "git push --force" → Deduplicated (same window)
10:06:00 - "git push -f"      → Violation #2 (new window)
```

**Why 300 seconds**: Allows time for user to read error, think, and retry without
being penalized for honest "try again to confirm" behavior.

## State File

Circuit states are stored in `docs/constraints/.circuit-state.json`:

```json
{
  "git-safety-force-push": {
    "state": "CLOSED",
    "violations": [
      {
        "timestamp": "2026-02-12T10:30:00Z",
        "action": "git push --force origin main",
        "session": "sess_abc123"
      },
      {
        "timestamp": "2026-02-08T15:45:00Z",
        "action": "force push to feature branch",
        "session": "sess_def456"
      }
    ],
    "last_trip": null,
    "last_reset": "2026-02-01T00:00:00Z",
    "config": {
      "violation_threshold": 5,
      "window_days": 30,
      "cooldown_hours": 24,
      "dedup_seconds": 300
    }
  }
}
```

## Archive File

When a constraint is retired, its circuit-breaker state is archived to preserve history:

```json
{
  "git-safety-force-push": {
    "archived": "2026-02-13T10:00:00Z",
    "final_state": "CLOSED",
    "total_violations": 12,
    "total_trips": 2,
    "lifetime_days": 45,
    "violations": [ ... ],
    "trip_history": [
      { "tripped": "2026-02-10T14:30:00Z", "reset": "2026-02-11T14:30:00Z", "method": "cooldown" },
      { "tripped": "2026-02-05T09:00:00Z", "reset": "2026-02-05T15:00:00Z", "method": "manual" }
    ]
  }
}
```

**Archive location**: `docs/constraints/.circuit-state-archive.json`

**Triggered by**: constraint-lifecycle when transitioning to `retired` state.

## Atomic File Updates

State file updates use atomic write-and-rename pattern to prevent corruption:

1. Write to `.circuit-state.json.tmp`
2. Rename to `.circuit-state.json` (atomic on POSIX)
3. For concurrent access: retry with exponential backoff

## Concurrent State Transitions

**Implementation Requirement** (from N=2 code review):

When implementing state transitions, ensure atomicity to prevent race conditions:

1. **Read-Modify-Write**: Use compare-and-swap semantics
   - Read current state and version
   - Calculate new state
   - Write only if version unchanged, else retry

2. **Violation Counting**: Lock during increment
   - Multiple concurrent violations must all be counted
   - Circuit must trip if threshold is exceeded

3. **Testing**: Include race condition tests
   - Simulate concurrent violations
   - Verify circuit trips at correct threshold

**Reference**: `docs/issues/2026-02-13-phase2-code-review-remediation.md` Finding 6

## Integration

- **Layer**: Core
- **Depends on**: constraint-lifecycle (receives active constraints)
- **Wraps**: constraint-enforcer (checks circuit before enforcement)
- **Used by**: emergency-override (can bypass tripped circuits)

## Constraint-Enforcer Integration

When constraint-enforcer detects a violation, it calls circuit-breaker:

```
User action → constraint-enforcer → violation detected
                    ↓
              circuit-breaker.check()
                    ↓
              If OPEN: block + notify
              If CLOSED/HALF-OPEN: allow + record
                    ↓
              circuit-breaker.record()
                    ↓
              If threshold: trip + notify
```

## Notification

When a circuit trips, the skill:
1. Logs to audit trail
2. Displays prominent warning to user
3. Blocks subsequent matching actions
4. Includes resolution options in output

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <id>" |
| State file corrupt | Recreate with empty state, log warning |
| State file locked | Retry with backoff (3 attempts) |
| Invalid state transition | Error: "Invalid transition from <state>" |
| Config parse error | Use defaults, log warning |

## Acceptance Criteria

- [x] Tracks violations per constraint
- [x] Trips to OPEN after 5 violations in 30 days
- [x] OPEN state blocks actions and notifies human
- [x] HALF-OPEN state after 24h cooldown
- [x] Manual reset works
- [x] Rolling 30-day window (not all-time)
- [x] Per-constraint configuration override
- [x] Deduplication prevents rapid-retry penalty (300s default)
- [x] Atomic file updates prevent corruption
- [x] History command shows full violation log
- [x] Integration with constraint-enforcer

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
- Update `docs/implementation/agentic-phase4-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
