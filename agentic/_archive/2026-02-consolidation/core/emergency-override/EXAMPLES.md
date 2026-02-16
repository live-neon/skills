# emergency-override Examples

Detailed output examples for all emergency-override commands.

## Create Override (Request Phase)

```
/emergency-override create git-safety-force-push --reason "Emergency hotfix"

EMERGENCY OVERRIDE REQUEST
──────────────────────────

Constraint: git-safety-force-push
Severity:   CRITICAL
Reason:     Emergency hotfix
Duration:   1 hour (expires 2026-02-13T11:30:00Z)
Single-use: Yes (consumed after one bypass)

⚠️  This will allow ONE bypass of a CRITICAL safety constraint.

┌─────────────────────────────────────────────────────────────┐
│ To approve, type this exact code: X7K9M2                    │
│ (This code is randomly generated and cannot be predicted)   │
│                                                             │
│ Type 'DENY' to reject this request.                         │
│ Request expires in 5 minutes.                               │
└─────────────────────────────────────────────────────────────┘
```

## Create Override (Approved)

```
> X7K9M2

OVERRIDE APPROVED
─────────────────

Override ID: override-2026-02-13-001
Constraint:  git-safety-force-push
Expires:     2026-02-13T11:30:00Z (in 1 hour)
Single-use:  Yes

The next action matching this constraint will be allowed.
Override will be consumed after use.

Audit Entry:
  Who: human_terminal
  When: 2026-02-13T10:30:00Z
  Method: challenge_response
  Token: X7K9M2 (verified)
```

## Create Override (Denied)

```
> DENY

OVERRIDE DENIED
───────────────

Request for git-safety-force-push override was denied.
No changes made.

Audit Entry:
  Who: human_terminal
  When: 2026-02-13T10:30:15Z
  Action: deny
  Reason: User typed DENY
```

## Create Override (Timeout)

```
OVERRIDE REQUEST TIMEOUT
────────────────────────

No response received within 5 minutes.
Request automatically denied.

Audit Entry:
  Who: system
  When: 2026-02-13T10:35:00Z
  Action: timeout
  Reason: No response in 300 seconds
```

## List Active Overrides

```
/emergency-override list --active

ACTIVE OVERRIDES (2)
────────────────────

1. override-2026-02-13-001
   Constraint: git-safety-force-push
   Reason: Emergency hotfix
   Created: 2026-02-13T10:30:00Z
   Expires: 2026-02-13T11:30:00Z (in 45m)
   Used: No

2. override-2026-02-13-002
   Constraint: test-before-commit
   Reason: CI broken, need to ship urgent fix
   Created: 2026-02-13T10:45:00Z
   Expires: 2026-02-13T12:45:00Z (in 2h)
   Used: No
```

## Revoke Override

```
/emergency-override revoke override-2026-02-13-001

OVERRIDE REVOKED
────────────────

Override ID: override-2026-02-13-001
Constraint:  git-safety-force-push
Status:      Revoked (was active, unused)

The override can no longer be used.

Audit Entry:
  Who: user_twin1
  When: 2026-02-13T10:50:00Z
  Action: revoke
  Reason: No longer needed
```

## History

```
/emergency-override history --days 7

OVERRIDE HISTORY (Last 7 days)
──────────────────────────────

1. override-2026-02-13-001 [REVOKED]
   Constraint: git-safety-force-push
   Created: 2026-02-13T10:30:00Z
   Revoked: 2026-02-13T10:50:00Z
   Used: No

2. override-2026-02-12-003 [USED]
   Constraint: workflow-plan-approval
   Created: 2026-02-12T15:00:00Z
   Expired: 2026-02-12T16:00:00Z
   Used: Yes (2026-02-12T15:15:00Z)
   Action: "Implemented Stage 3 without full plan approval"

3. override-2026-02-10-001 [EXPIRED]
   Constraint: test-before-commit
   Created: 2026-02-10T09:00:00Z
   Expired: 2026-02-10T10:00:00Z
   Used: No (expired unused)

Summary: 3 overrides (1 used, 1 revoked, 1 expired unused)
```
