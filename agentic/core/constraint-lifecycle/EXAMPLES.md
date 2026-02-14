# constraint-lifecycle Examples

Detailed output examples for all constraint-lifecycle commands.

## Activate Constraint

```
/constraint-lifecycle activate git-safety-force-push

ACTIVATED: git-safety-force-push
──────────────────────────────────

Previous State: draft
Current State:  active

File moved:
  FROM: docs/constraints/draft/git-safety-force-push.md
  TO:   docs/constraints/active/git-safety-force-push.md

Enforcement:
  - Severity: CRITICAL
  - Mode: BLOCK (violations will prevent action)
  - Circuit breaker: Initialized (threshold: 5/30 days)

Audit Entry:
  Who: user_twin1
  When: 2026-02-13T14:30:00Z
  Action: activate
  Reason: Reviewed and approved

Next: Constraint is now enforced. Violations will be tracked.
```

## Retire Constraint

```
/constraint-lifecycle retire git-safety-force-push --reason "Superseded by new policy"

RETIRING: git-safety-force-push
────────────────────────────────

Previous State: active
Current State:  retiring

File moved:
  FROM: docs/constraints/active/git-safety-force-push.md
  TO:   docs/constraints/retiring/git-safety-force-push.md

Retirement Period:
  - Started: 2026-02-13
  - Ends: 2026-05-14 (90 days)
  - Mode: WARN (violations logged, not blocked)

Audit Entry:
  Who: user_twin1
  When: 2026-02-13T15:00:00Z
  Action: retire
  Reason: Superseded by new policy

Next: After 90 days, use '/constraint-lifecycle complete-retire git-safety-force-push'
      to move to retired state.
```

## Emergency Retire

```
/constraint-lifecycle emergency-retire test-before-commit --reason "Causing false positives in CI"

EMERGENCY RETIRED: test-before-commit
──────────────────────────────────────

Previous State: active
Current State:  retired (bypassed retiring period)

File moved:
  FROM: docs/constraints/active/test-before-commit.md
  TO:   docs/constraints/retired/test-before-commit.md

Emergency Flag: TRUE
  - Constraint immediately stopped enforcement
  - Circuit breaker state cleared
  - Active overrides invalidated

Audit Entry:
  Who: user_twin1
  When: 2026-02-13T16:00:00Z
  Action: emergency-retire
  Reason: Causing false positives in CI
  Emergency: true

⚠️  This action bypassed the 90-day retirement period.
    Document the reason thoroughly for future reference.
```

## Rollback Constraint

```
/constraint-lifecycle rollback security-credential-check --reason "Blocking legitimate API key rotation"

ROLLED BACK: security-credential-check
───────────────────────────────────────

Previous State: active
Current State:  draft

File moved:
  FROM: docs/constraints/active/security-credential-check.md
  TO:   docs/constraints/draft/security-credential-check.md

Rollback Details:
  - Constraint no longer enforced
  - Circuit breaker state cleared
  - Preserved link to source observation for re-evaluation

Audit Entry:
  Who: user_twin1
  When: 2026-02-13T17:00:00Z
  Action: rollback
  Reason: Blocking legitimate API key rotation

Next: Review and refine constraint scope, then reactivate with:
      /constraint-lifecycle activate security-credential-check
```

## Status

```
/constraint-lifecycle status git-safety-force-push

CONSTRAINT STATUS: git-safety-force-push
─────────────────────────────────────────

Current State: active
Severity: CRITICAL
Intent: destructive

Location: docs/constraints/active/git-safety-force-push.md

Lifecycle:
  Created:   2026-02-10 (auto-generated from observation)
  Activated: 2026-02-11
  Duration:  2 days active

Source:
  Observation: docs/observations/failures/git-force-push-without-confirmation.md
  R count: 5
  C count: 3

Circuit Breaker:
  State: CLOSED
  Violations: 1 in last 30 days
  Threshold: 5/30 days

Recent Activity:
  - 2026-02-13: Violation logged (session: abc123)
  - 2026-02-11: Activated by user_twin1
  - 2026-02-10: Generated from observation
```

## Audit Trail

```
/constraint-lifecycle audit git-safety-force-push

AUDIT TRAIL: git-safety-force-push
───────────────────────────────────

Entry 1:
  When: 2026-02-10T10:30:00Z
  Who: constraint-generator (auto)
  Action: create
  State: → draft
  Reason: Auto-generated from observation git-force-push-without-confirmation

Entry 2:
  When: 2026-02-11T09:00:00Z
  Who: user_twin1
  Action: activate
  State: draft → active
  Reason: Reviewed and approved constraint scope

Entry 3:
  When: 2026-02-13T14:00:00Z
  Who: circuit-breaker
  Action: violation
  Details: Attempted force push in session def456
  Resolution: Action blocked, user notified

Total: 3 audit entries
```

## List Constraints

```
/constraint-lifecycle list --state active

ACTIVE CONSTRAINTS (5):
───────────────────────

  1. git-safety-force-push
     Severity: CRITICAL
     Active since: 2026-02-11
     Circuit: CLOSED (1/5 violations)

  2. git-safety-destructive-ops
     Severity: CRITICAL
     Active since: 2026-02-08
     Circuit: CLOSED (0/5 violations)

  3. workflow-plan-approval
     Severity: IMPORTANT
     Active since: 2026-02-05
     Circuit: CLOSED (2/5 violations)

  4. test-before-commit
     Severity: IMPORTANT
     Active since: 2026-02-01
     Circuit: HALF-OPEN (testing after cooldown)

  5. quality-error-handling
     Severity: MINOR
     Active since: 2026-01-28
     Circuit: CLOSED (0/5 violations)
```
