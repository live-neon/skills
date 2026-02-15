---
name: constraint-versioning
version: 1.0.0
description: Track constraint evolution and N-count progression history
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, constraints, versioning, evolution]
layer: extensions
status: active
source: docs/observations/configuration-as-code-type-safety.md
n_count: 9
---

# constraint-versioning

Track constraint evolution over time. Show N-count progression journey
from N=1 initial observation to validated constraint.

## Problem Being Solved

Constraints evolve but history is lost:
- No record of N=1 origin story
- Context diversity across versions not tracked
- Pattern maturity unclear without progression data
- Lessons from evolution not captured

## Usage

```
/constraint-versioning history <constraint>    # Show version history
/constraint-versioning journey <observation>   # N=1 to N=X progression
/constraint-versioning timeline                # All constraints timeline
```

## Example

```bash
# View constraint evolution history
/constraint-versioning history git-commit-format

# See observation's journey to constraint
/constraint-versioning journey api-timeout-handling.md

# Timeline of all constraints
/constraint-versioning timeline
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: history, journey, timeline |
| target | Yes (history/journey) | Constraint name or observation path |
| --from | No | Start date for timeline |
| --to | No | End date for timeline |
| --verbose | No | Show full context for each version |

## Output

### Constraint History

```
/constraint-versioning history git-commit-format

CONSTRAINT HISTORY
==================

Constraint: git-commit-format
Current Version: 2.3
Status: Active

Version Timeline:
-----------------

v1.0 (2025-09-15)
  N=1: Initial observation
  Context: PR review caught inconsistent messages
  Change: Defined basic format rules

v1.1 (2025-10-03)
  N=2: Refinement
  Context: Team discussion on scope prefixes
  Change: Added scope prefix convention

v2.0 (2025-11-20)
  N=5: Major validation
  Context: CI integration discovered edge cases
  Change: Added body requirements, breaking change format

v2.3 (2026-01-15)
  N=9: Current
  Context: Cross-team adoption
  Change: Added co-author guidelines

Context Diversity: 4 distinct contexts (PR review, team discussion, CI, cross-team)
```

### Journey View

```
/constraint-versioning journey api-timeout-handling.md

N-COUNT JOURNEY
===============

Observation: api-timeout-handling.md
Current N: 5

Timeline:
---------

N=1 (2025-12-01)
  Context: Production incident
  Discovery: API calls hanging without timeout

N=2 (2025-12-15)
  Context: Code review
  Validation: Same pattern in different service

N=3 (2026-01-10)
  Context: Performance audit
  Validation: Third occurrence, now a pattern

N=4 (2026-01-25)
  Context: New developer onboarding
  Validation: Pattern taught explicitly

N=5 (2026-02-05)
  Context: Architecture review
  Status: Ready for constraint promotion

Journey Duration: 66 days
Contexts: 5 distinct (production, review, audit, onboarding, architecture)
```

### Timeline

```
/constraint-versioning timeline --from 2026-01

CONSTRAINT TIMELINE
===================

2026-01-10: api-timeout-handling reached N=3 (constraint candidate)
2026-01-15: git-commit-format updated to v2.3 (N=9)
2026-01-25: error-boundary-patterns reached N=4
2026-02-01: mce-compliance promoted to constraint
2026-02-05: api-timeout-handling reached N=5 (ready for promotion)

Active Constraints: 12
Pending Promotions: 3
```

## Version Record Format

```yaml
version: "2.0"
n_count: 5
date: "2025-11-20"
context: "CI integration"
change_summary: "Added body requirements"
breaking_changes: true
```

## Integration

- **Layer**: Extensions
- **Depends on**: pbd-strength-classifier (for N-count)
- **Used by**: Monthly constraint reviews, documentation

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <name>" |
| No version history | Info: "No version history recorded" |
| Observation not linked | Warning: "Observation has no constraint link" |

## When NOT to Use

- **Draft constraints**: Version only active/stable constraints
- **Minor wording changes**: Not every edit needs a version bump
- **Rollback scenarios**: Use git history for emergency rollbacks
- **Cross-project constraints**: Version independently per project
- **Retired constraints**: Archive instead of continuing to version

Use constraint-versioning for significant constraint evolution, not minor edits.

## Acceptance Criteria

- [x] Records version history with timestamps
- [x] Shows N-count progression journey
- [x] Tracks context diversity across versions
- [x] Provides timeline view of all constraints
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

View constraint evolution:
```bash
/constraint-versioning history <constraint>
```

**Verification**: `cd tests && npm test -- -t "constraint-versioning"`
