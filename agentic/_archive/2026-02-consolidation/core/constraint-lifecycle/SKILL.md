---
name: constraint-lifecycle
version: 1.0.0
description: Manage constraint state transitions through their lifecycle
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, constraint, lifecycle]
layer: core
status: active
---

# constraint-lifecycle

Manage constraint state machine transitions: draft → active → retiring → retired.
This skill controls when constraints become enforced, handles retirement gracefully,
and maintains a complete audit trail of all state changes.

## State Machine

```
draft ──────► active ──────► retiring ──────► retired
  │             │               │
  │             │               └──► active (reactivate if still needed)
  │             │
  │             └──► retired (emergency-retire, skip retiring period)
  │
  └──► deleted (never activated, removed entirely)

Additional:
  active ──► draft (rollback for faulty constraints)
```

## States

| State | Enforced | Directory | Purpose |
|-------|----------|-----------|---------|
| draft | No | `docs/constraints/draft/` | Pending human review |
| active | Yes (BLOCK) | `docs/constraints/active/` | Currently enforced |
| retiring | Yes (WARN) | `docs/constraints/retiring/` | 90-day sunset period |
| retired | No | `docs/constraints/retired/` | Historical reference |

## Usage

```
/constraint-lifecycle activate <constraint-id>
/constraint-lifecycle retire <constraint-id> [--reason <text>]
/constraint-lifecycle complete-retire <constraint-id>
/constraint-lifecycle emergency-retire <constraint-id> --reason <text>
/constraint-lifecycle reactivate <constraint-id> [--reason <text>]
/constraint-lifecycle rollback <constraint-id> --reason <text>
/constraint-lifecycle delete <constraint-id> [--reason <text>]
/constraint-lifecycle status <constraint-id>
/constraint-lifecycle list [--state <state>]
/constraint-lifecycle audit <constraint-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: activate, retire, complete-retire, emergency-retire, reactivate, rollback, delete, status, list, audit |
| constraint-id | Yes* | Constraint identifier (*not required for list) |
| --reason | Yes* | Explanation for state change (*required for emergency-retire, rollback) |
| --state | No | Filter list by state: draft, active, retiring, retired |
| --force | No | Skip confirmation prompts (use with caution) |

## Example

```bash
# Activate a draft constraint
/constraint-lifecycle activate git-safety-force-push

# Start retirement process
/constraint-lifecycle retire old-naming-convention --reason "No longer relevant"

# Roll back a problematic constraint
/constraint-lifecycle rollback buggy-constraint --reason "Caused false positives"

# View constraint history
/constraint-lifecycle audit git-safety-force-push
```

## Output

**See `EXAMPLES.md` for detailed output examples.**

Brief summaries:

| Command | Output |
|---------|--------|
| `activate` | Shows state change draft→active, file move, enforcement mode |
| `retire` | Shows state change active→retiring, 90-day sunset period |
| `emergency-retire` | Bypasses retiring period, clears circuit state |
| `rollback` | Returns active→draft for re-evaluation |
| `status` | Shows current state, lifecycle dates, circuit status |
| `audit` | Lists all state changes with who/when/why |
| `list` | Shows constraints filtered by state with circuit status |

## State Transitions

### Valid Transitions

| From | To | Command | Reason Required |
|------|-----|---------|-----------------|
| draft | active | `activate` | No (optional) |
| draft | deleted | `delete` | No (optional) |
| active | retiring | `retire` | No (optional) |
| active | retired | `emergency-retire` | **Yes** |
| active | draft | `rollback` | **Yes** |
| retiring | retired | `complete-retire` | No |
| retiring | active | `reactivate` | No (optional) |

### Invalid Transitions

| From | To | Why Invalid |
|------|-----|-------------|
| draft | retiring | Must be activated first |
| retired | active | Must go through draft review |
| deleted | any | Deleted constraints are permanent |

## Retirement Criteria

Constraints may be candidates for retirement when:

| Trigger | Indicator | Action |
|---------|-----------|--------|
| Manual request | Human decision | `retire <id>` |
| High disconfirmation | D > C | Auto-suggest retirement |
| No violations (90 days) | Possibly obsolete | Auto-suggest complete-retire |
| No activity (180 days) | Possibly obsolete | Auto-suggest retirement |

**Note**: All auto-suggestions require human approval. The skill notifies but doesn't
auto-transition without explicit confirmation.

## Retirement Effects

### Retiring State (90-day period)
- Constraint **still enforced** but with reduced severity
- Violations logged as WARN instead of BLOCK
- Gives teams time to adjust workflows
- Can be reactivated if still needed

### Retired State
- Constraint **no longer enforced**
- Kept in `docs/constraints/retired/` for historical reference
- Circuit breaker state cleared
- Active overrides invalidated

## State Synchronization

When constraint state changes, this skill synchronizes dependent files:

### Circuit State (`.circuit-state.json`)
```json
{
  "git-safety-force-push": {
    "state": "CLOSED",
    "violations": [],
    "last_trip": null
  }
}
```

On retirement:
- Clear violation history
- Archive to `.circuit-state-archive.json`

### Overrides (`.overrides.json`)
```json
{
  "git-safety-force-push": {
    "expires": "2026-02-14T00:00:00Z",
    "reason": "Emergency hotfix",
    "approver": "user_twin1"
  }
}
```

On retirement:
- Invalidate active overrides
- Log invalidation in audit trail

## Audit Trail Format

Each state change creates an audit entry in the constraint file:

```markdown
## Changelog

### 2026-02-13T14:30:00Z - activate
- **Who**: user_twin1
- **From**: draft
- **To**: active
- **Reason**: Reviewed and approved

### 2026-02-10T10:30:00Z - create
- **Who**: constraint-generator (auto)
- **From**: (none)
- **To**: draft
- **Reason**: Auto-generated from observation
```

## Integration

- **Layer**: Core
- **Depends on**: constraint-generator (receives draft constraints)
- **Provides to**:
  - constraint-enforcer (provides active constraint list)
  - circuit-breaker (initializes/clears circuit state)
  - contextual-injection (filters by state)
- **Used by**: constraint-reviewer (Phase 4), governance-state (Phase 4)

## Directory Structure

```
docs/constraints/
├── draft/              # Pending review
│   └── <id>.md
├── active/             # Currently enforced
│   └── <id>.md
├── retiring/           # 90-day sunset
│   └── <id>.md
├── retired/            # Historical reference
│   └── <id>.md
├── .circuit-state.json        # Circuit breaker states
├── .circuit-state-archive.json # Archived states
└── .overrides.json             # Active overrides
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <id>" |
| Invalid state transition | Error: "Cannot transition from <from> to <to>" |
| Reason required but missing | Error: "Reason required for <action>" |
| File move fails | Error: "Failed to move constraint file: <details>" |
| State sync fails | Warning: "State sync failed for <file>, manual update needed" |
| Already in target state | Info: "Constraint already in <state> state" |

## Rollback Workflow

If an activated constraint causes problems:

1. **Identify**: Determine the constraint causing issues
2. **Rollback**: `constraint-lifecycle rollback <id> --reason "..."`
3. **Review**: Examine the constraint scope and evidence
4. **Refine**: Update the constraint file to fix the issue
5. **Reactivate**: `constraint-lifecycle activate <id>`

The rollback preserves:
- Link to source observation
- Original audit trail
- R/C/D counts for re-evaluation

## Acceptance Criteria

- [x] All state transitions work correctly (draft→active→retiring→retired)
- [x] Files moved to appropriate directories
- [x] Audit trail maintained (who, when, why)
- [x] Emergency retire bypasses 90-day period
- [x] Rollback moves active → draft with audit
- [x] State synchronization updates circuit-state and overrides files
- [x] Status command shows full history
- [x] List command filters by state
- [x] Reactivate moves retiring → active
- [x] Delete permanently removes draft constraints

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
