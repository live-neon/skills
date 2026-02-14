# Core Memory Walkthrough

A day-by-day example of the failure-anchored learning system in action, showing
how all 9 Core Memory skills work together.

## The Scenario

An AI assistant repeatedly executes `git push --force` without asking for user
confirmation, causing remote history loss. Over two weeks, the system learns
from this failure pattern and creates appropriate safeguards.

---

## Day 1: First Failure Detected

A user notices the AI pushed with `--force` without asking.

```
/failure-tracker record "Force pushed without user confirmation" --source src/git/push.ts:47

RECORDED: git-force-push-without-confirmation

  Type: failure
  R count: 1 (new observation)
  Status: pending confirmation
  Source: src/git/push.ts:47
  Session: sess_20260201_abc123
```

**What happened**: `failure-tracker` created a new observation file with R=1.

---

## Day 3: First Confirmation

The user confirms this was indeed a problem.

```
/failure-tracker confirm git-force-push-without-confirmation

CONFIRMED: git-force-push-without-confirmation

  C count: 0 → 1 (confirmed by user_twin1)
  Unique confirming users: 1
```

**Status**: R=1, C=1, sources=1, unique_users=1 (not yet eligible)

---

## Day 5: Second Occurrence

The AI does it again in a different file.

```
/failure-tracker record "Used git push -f without asking" --source src/deploy/release.ts:89

MATCHED EXISTING: git-force-push-without-confirmation (similarity: 0.91)

  R count: 1 → 2 (recurrence detected)
  Sources: 2 (src/git/push.ts, src/deploy/release.ts)
```

**What happened**: `failure-tracker` used semantic similarity to match this
to the existing observation, incrementing R and adding a new source.

---

## Day 7: Third Occurrence + Second Confirmation

Another occurrence, another user confirms.

```
/failure-tracker record "Force pushed to main branch" --source src/git/push.ts:52

MATCHED EXISTING: git-force-push-without-confirmation (similarity: 0.89)
  R count: 2 → 3

/failure-tracker confirm git-force-push-without-confirmation

CONFIRMED: git-force-push-without-confirmation

  C count: 1 → 2 (confirmed by user_twin2)
  Unique confirming users: 2

  Eligibility: R=3 ✓, C=2 ✓, sources=2 ✓, unique_users=2 ✓
  Status: ELIGIBLE for constraint generation
```

**Status**: All thresholds met! The observation is now eligible.

---

## Day 8: Constraint Auto-Generated

`constraint-generator` detects the eligible observation.

```
CONSTRAINT GENERATED: git-safety-force-push

  Source observation: git-force-push-without-confirmation
  Severity: CRITICAL (auto-detected from git safety category)
  Status: draft

  Intent: Prevent force push operations without explicit user confirmation
  Scope: Actions matching: git push --force, git push -f, --force-with-lease
```

**What happened**: `constraint-generator` created a draft constraint from the
observation's evidence. It remains in `draft` status pending human review.

---

## Day 9: Constraint Activated

After human review, the constraint is activated.

```
/constraint-lifecycle activate git-safety-force-push

ACTIVATED: git-safety-force-push

  Previous state: draft
  Current state: active
  Enforcement: BLOCK (violations will be blocked)

  Constraint-enforcer will now check actions against this constraint.
```

**What happened**: `constraint-lifecycle` transitioned the constraint to `active`.
`constraint-enforcer` will now enforce it.

---

## Day 10: First Violation Blocked

The AI attempts to force push again.

```
ACTION BLOCKED: git-safety-force-push

  Attempted: git push --force origin main
  Severity: CRITICAL
  Enforcement: BLOCK

  Circuit breaker: CLOSED (1/5 violations in 30 days)

  To proceed anyway, use: /emergency-override create git-safety-force-push
```

**What happened**: `constraint-enforcer` detected the violation, blocked it,
and `circuit-breaker` recorded the violation (1 of 5 threshold).

---

## Days 11-14: More Violations

Despite the blocks, the AI keeps attempting (perhaps due to user pressure).

```
Day 11: Violation #2 recorded
Day 12: Violation #3 recorded
Day 13: Violation #4 recorded
Day 14: Violation #5 recorded → CIRCUIT TRIPPED
```

```
CIRCUIT TRIPPED: git-safety-force-push

  State: CLOSED → OPEN
  Violations: 5/5 in last 30 days

  ⚠️ Actions matching this constraint are now BLOCKED.
  Human intervention required.

  Cooldown ends: 2026-02-15T10:00:00Z (24 hours)
  Or use: /circuit-breaker reset git-safety-force-push
```

**What happened**: `circuit-breaker` tripped to OPEN state after 5 violations.
This escalates the issue to require human attention.

---

## Day 14: Emergency Override Needed

A production hotfix genuinely requires a force push.

```
/emergency-override create git-safety-force-push --reason "Production hotfix for CVE-2026-1234" --duration 1h

EMERGENCY OVERRIDE REQUEST
──────────────────────────

Constraint: git-safety-force-push
Severity: CRITICAL
Reason: Production hotfix for CVE-2026-1234

⚠️ This will allow ONE bypass of a CRITICAL safety constraint.

┌─────────────────────────────────────────────────────────────┐
│ To approve, type this exact code: X7K9M2                    │
│ (This code is randomly generated and cannot be predicted)   │
└─────────────────────────────────────────────────────────────┘
```

The human types `X7K9M2`:

```
OVERRIDE APPROVED

  Override ID: override-2026-02-14-001
  Expires: 2026-02-14T11:00:00Z (in 1 hour)
  Single-use: Yes

  The next action matching this constraint will be allowed.
```

**What happened**: `emergency-override` created a single-use bypass with
human approval via challenge-response token.

---

## Day 14: Override Used

The force push proceeds with the override.

```
ACTION ALLOWED (OVERRIDE): git-safety-force-push

  Override: override-2026-02-14-001
  Action: git push --force origin hotfix/cve-2026-1234
  Override consumed: Yes

  Note: Circuit remains OPEN. Override doesn't reset circuit.
```

**What happened**: The action was allowed, the override was consumed. The
circuit remains OPEN because the override is for emergencies, not normal operation.

---

## Day 15: Circuit Cooldown Expires

After 24 hours, the circuit enters testing mode.

```
CIRCUIT STATE CHANGE: git-safety-force-push

  State: OPEN → HALF-OPEN
  Reason: 24-hour cooldown expired

  Testing period active:
  - Next violation → returns to OPEN
  - No violations → returns to CLOSED
```

---

## Day 16: Successful Test Period

No violations occur during the test period.

```
CIRCUIT STATE CHANGE: git-safety-force-push

  State: HALF-OPEN → CLOSED
  Reason: Test period passed without violations

  Normal operation resumed.
  Violation count reset for new window.
```

**What happened**: The underlying issue was addressed, violations stopped,
and the circuit returned to normal operation.

---

## Day 60: Constraint Review

Two months later, no violations have occurred.

```
/constraint-lifecycle status git-safety-force-push

CONSTRAINT: git-safety-force-push

  Status: active
  Age: 52 days
  Violations: 0 (last 30 days)
  Last violation: 2026-02-14

  Health: GOOD
  Recommendation: Constraint is working effectively
```

---

## Day 180: Retirement Consideration

Six months without violations suggests the behavior is learned.

```
/constraint-lifecycle retire git-safety-force-push --reason "Behavior learned, 180 days without violation"

RETIRING: git-safety-force-push

  Previous state: active
  Current state: retiring
  Enforcement: WARN (90-day sunset period)

  During retirement:
  - Violations show warnings, not blocks
  - After 90 days without issues, moves to retired
```

---

## Day 270: Fully Retired

```
CONSTRAINT RETIRED: git-safety-force-push

  State: retiring → retired
  Reason: 90-day sunset completed without violations

  Actions:
  - Moved to docs/constraints/retired/
  - Circuit state archived
  - Constraint no longer enforced
  - Kept for historical reference
```

**What happened**: `constraint-lifecycle` archived the constraint. The AI
has demonstrably learned not to force push without confirmation.

---

## Summary: Skills Used

| Day | Event | Skills Involved |
|-----|-------|-----------------|
| 1 | Failure detected | failure-tracker |
| 3-7 | Confirmations, recurrences | failure-tracker |
| 8 | Constraint generated | constraint-generator |
| 9 | Constraint activated | constraint-lifecycle |
| 10-14 | Violations blocked | constraint-enforcer, circuit-breaker |
| 14 | Emergency override | emergency-override |
| 15-16 | Circuit recovery | circuit-breaker |
| 180+ | Retirement | constraint-lifecycle |

**Context loading** (not shown): Throughout this process, `memory-search`,
`contextual-injection`, and `progressive-loader` ensure relevant constraints
are loaded into each session based on file patterns and priority.

---

## Key Insights

1. **Evidence-based**: Constraints emerge from repeated, confirmed failures—not speculation
2. **Human-verified**: Two different users must confirm before constraint generation
3. **Graduated response**: Block → Circuit trip → Human intervention
4. **Escape valve**: Emergency overrides exist but require human approval
5. **Self-healing**: Circuits recover automatically after cooldown
6. **Retirement path**: Constraints can be retired when no longer needed

This is failure-anchored learning: the system learns from consequences, not instructions.
