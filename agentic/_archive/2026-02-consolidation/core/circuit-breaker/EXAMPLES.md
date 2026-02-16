# circuit-breaker Examples

Detailed output examples for all circuit-breaker commands.

## Status (All Circuits)

```
/circuit-breaker status --all

CIRCUIT BREAKER STATUS
──────────────────────

CLOSED (3):
  git-safety-force-push      0/5 violations (30 days)
  workflow-plan-approval     2/5 violations (30 days)
  quality-error-handling     1/5 violations (30 days)

OPEN (1):
  git-safety-destructive-ops 5/5 violations (TRIPPED 2026-02-12)
    ⚠️ Actions blocked until human reset or 24h cooldown
    Cooldown ends: 2026-02-13T14:30:00Z

HALF-OPEN (1):
  test-before-commit         Testing after cooldown
    Next violation → OPEN
    Success → CLOSED

Summary: 5 circuits (3 closed, 1 open, 1 half-open)
```

## Status (Single Circuit)

```
/circuit-breaker status git-safety-force-push

CIRCUIT: git-safety-force-push
──────────────────────────────

State: CLOSED
Violations: 2/5 (in 30-day window)
Threshold: 5 violations in 30 days
Cooldown: 24 hours

Configuration:
  violation_threshold: 5 (default)
  window_days: 30 (default)
  cooldown_hours: 24 (default)
  dedup_seconds: 300 (default)

Recent Violations (last 30 days):
  1. 2026-02-12T10:30:00Z - "git push --force origin main"
  2. 2026-02-08T15:45:00Z - "force push to feature branch"

Next trip at: 3 more violations
```

## Check (Before Action)

```
/circuit-breaker check git-safety-force-push

CIRCUIT CHECK: git-safety-force-push
────────────────────────────────────

State: CLOSED
Result: ALLOWED

Current: 2/5 violations
If violated: 3/5 (still under threshold)

Proceed with caution.
```

## Check (Circuit Open)

```
/circuit-breaker check git-safety-destructive-ops

CIRCUIT CHECK: git-safety-destructive-ops
──────────────────────────────────────────

State: OPEN
Result: BLOCKED

⚠️ This circuit has tripped.

Violation count: 5/5 in last 30 days
Tripped at: 2026-02-12T14:30:00Z
Cooldown ends: 2026-02-13T14:30:00Z (in 4h 30m)

Options:
  1. Wait for cooldown to expire (enters HALF-OPEN)
  2. Use '/circuit-breaker reset git-safety-destructive-ops' for immediate reset
  3. Use '/emergency-override' for one-time bypass with audit
```

## Record Violation

```
/circuit-breaker record git-safety-force-push --action "git push --force origin main"

VIOLATION RECORDED: git-safety-force-push
─────────────────────────────────────────

Timestamp: 2026-02-13T10:30:00Z
Action: "git push --force origin main"

State: CLOSED → CLOSED
Violations: 2/5 → 3/5

Warning: 2 more violations will trip this circuit.
```

## Record Violation (Trip)

```
/circuit-breaker record git-safety-force-push --action "git push -f origin main"

VIOLATION RECORDED: git-safety-force-push
─────────────────────────────────────────

Timestamp: 2026-02-13T11:00:00Z
Action: "git push -f origin main"

⚠️ CIRCUIT TRIPPED

State: CLOSED → OPEN
Violations: 4/5 → 5/5

The circuit breaker has tripped. Actions matching this constraint
are now BLOCKED until:
  - 24-hour cooldown expires (2026-02-14T11:00:00Z)
  - Manual reset via '/circuit-breaker reset'
  - Emergency override via '/emergency-override'

Human notification sent.
```

## Reset Circuit

```
/circuit-breaker reset git-safety-force-push --reason "Issue resolved after code review"

CIRCUIT RESET: git-safety-force-push
────────────────────────────────────

Previous State: OPEN
Current State: CLOSED

Violations cleared from window.
Audit entry created.

Audit:
  Who: user_twin1
  When: 2026-02-13T12:00:00Z
  Action: manual_reset
  Reason: Issue resolved after code review
  Previous violations: 5
```

## History

```
/circuit-breaker history git-safety-force-push --days 60

VIOLATION HISTORY: git-safety-force-push
────────────────────────────────────────

Last 60 days:

  2026-02-13T11:00:00Z - "git push -f origin main" [TRIPPED]
  2026-02-13T10:30:00Z - "git push --force origin main"
  2026-02-12T15:00:00Z - "force push after rebase"
  2026-02-10T09:00:00Z - "git push --force-with-lease"
  2026-02-08T14:00:00Z - "force push to feature branch"
  ------- (outside 30-day window) -------
  2026-01-20T10:00:00Z - "git push -f origin hotfix"
  2026-01-15T16:00:00Z - "force push to main"

Total: 7 violations (5 in window, 2 outside)
Trips: 1 (2026-02-13)
Resets: 0
```
