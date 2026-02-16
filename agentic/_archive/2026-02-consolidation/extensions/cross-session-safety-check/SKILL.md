---
name: cross-session-safety-check
version: 1.0.0
description: Verify state consistency and detect cross-session interference
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, safety, sessions, state]
layer: extensions
status: active
source: docs/observations/plan-approve-implement-workflow-violation.md
n_count: 4
---

# cross-session-safety-check

Verify state consistency between sessions. Detect cross-session interference,
stale state, and concurrent modification risks.

## Problem Being Solved

Sessions can interfere with each other:
- File modified in another session (stale state)
- Concurrent work on same files (merge conflicts)
- Plan state drifted since last session
- Assumptions from prior session no longer valid

## Usage

```
/cross-session-safety-check verify    # Check current state
/cross-session-safety-check history   # View session history
/cross-session-safety-check conflicts # Detect potential conflicts
```

## Example

```bash
# Check before starting work
/cross-session-safety-check verify

# Review recent session history
/cross-session-safety-check history

# Find potential conflicts
/cross-session-safety-check conflicts
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: verify, history, conflicts |
| --scope | No | Limit check: files, plans, all (default: all) |
| --session | No | Compare against specific session |
| --verbose | No | Show full state details |

## Conflict Types

| Type | Detection | Risk Level |
|------|-----------|------------|
| Concurrent modification | Same file modified by multiple sessions | High |
| Stale state | File changed since last sync | Medium |
| Plan drift | Plan modified in another session | Medium |
| Context staleness | >24h since last session | Low |

## Output

### Verify State

```
/cross-session-safety-check verify

STATE VERIFICATION
==================

Current Session: session-2026-02-15-001
User: twin1
Domain: backend

File State:
-----------
  src/api/handlers.ts
    Last modified: 2026-02-14T12:00:00Z (by twin2)
    WARNING: Modified since your last session
    Recommendation: git pull before editing

  src/api/routes.ts
    Last modified: 2026-02-14T09:30:00Z (by twin1)
    OK: You were the last modifier

Plan State:
-----------
  docs/plans/current-sprint.md
    Last modified: 2026-02-14T16:00:00Z
    OK: No changes since your last session

Uncommitted Changes:
--------------------
  None detected

Summary:
  1 WARNING: Stale file state detected
  Recommendation: Run 'git pull' before starting
```

### Session History

```
/cross-session-safety-check history

SESSION HISTORY
===============

Recent Sessions (last 7 days):

1. session-2026-02-14-002
   User: twin2
   Domain: backend
   Duration: 3.5 hours
   Files: src/api/handlers.ts, src/api/middleware.ts
   Commits: 2

2. session-2026-02-14-001
   User: twin1
   Domain: backend
   Duration: 3.5 hours
   Files: src/api/handlers.ts, src/api/routes.ts
   Commits: 2

3. session-2026-02-13-001
   User: twin1
   Domain: documentation
   Duration: 2 hours
   Files: docs/workflows/plan.md
   Commits: 1

Cross-Session File Overlap:
  src/api/handlers.ts - Modified by both twins (potential conflict)
```

### Conflict Detection

```
/cross-session-safety-check conflicts

POTENTIAL CONFLICTS
===================

HIGH RISK:
----------
1. src/api/handlers.ts
   Modified: session-2026-02-14-001 (twin1)
   Modified: session-2026-02-14-002 (twin2)
   Gap: 1 hour between modifications
   Status: May need merge

MEDIUM RISK:
------------
1. docs/plans/current-sprint.md
   Last session: session-2026-02-13-001
   Age: 48 hours
   Status: Review for plan drift

NO CONFLICTS:
-------------
- tests/api.test.ts (single owner)
- src/utils/helpers.ts (unchanged)

Recommendation:
  1. Pull latest changes: git pull origin main
  2. Review handlers.ts for merge conflicts
  3. Check sprint plan for updates
```

## State Snapshot Format

```json
{
  "session_id": "session-2026-02-15-001",
  "started_at": "2026-02-15T09:00:00Z",
  "user": "twin1",
  "branch": "feature/api-update",
  "files_modified": ["src/api/handlers.ts"],
  "uncommitted_changes": false
}
```

## Integration

- **Layer**: Extensions
- **Depends on**: None (reads git state)
- **Used by**: Session start workflow, pre-commit checks

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No git repo | Error: "Not in a git repository" |
| No session history | Info: "No prior sessions recorded" |
| Remote unreachable | Warning: "Cannot check remote state" |

## When NOT to Use

- **Solo development**: No cross-session conflicts when working alone
- **Fresh branches**: New branches have no session history to check
- **Read-only sessions**: Research/exploration doesn't create conflicts
- **Automated pipelines**: CI/CD has its own conflict resolution
- **Post-merge**: After successful merge, history check is redundant

Use cross-session-safety-check at session start when resuming collaborative work.

## Acceptance Criteria

- [x] Detects stale session state
- [x] Identifies historical cross-session incidents
- [x] Warns about concurrent modification risks
- [x] Provides actionable recommendations
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Check before starting work:
```bash
/cross-session-safety-check verify
```

**Verification**: `cd tests && npm test -- -t "cross-session-safety-check"`
