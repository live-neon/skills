---
name: constraint-enforcer
version: 1.0.0
description: Check proposed actions against loaded constraints
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, safety]
---

# constraint-enforcer

Check proposed actions against active constraints. Returns violations if any
constraints would be breached. This is the runtime enforcement layer of the
agentic memory system.

## Usage

```
/constraint-enforcer "<action>" [--constraints <path>]
/constraint-enforcer --check-file <file-path>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes* | Description of proposed action (quoted) |
| --constraints | No | Path to constraints directory (default: docs/constraints/active/) |
| --check-file | No | Check constraints relevant to a specific file |
| --severity | No | Filter by minimum severity: critical, important, minor (default: all) |
| --format | No | Output format: text, json (default: text) |

## Output

### No Violations

```
CLEAR: No constraint violations detected

Checked: 15 active constraints
Action: "refactor the authentication module"
Relevant constraints: 3 (git-safety, plan-approve-implement, code-review-required)
```

### Violations Found

```
VIOLATIONS FOUND: 2

1. [CRITICAL] git-safety-protocol
   Action: "git reset --hard origin/main"
   Constraint: "Never execute destructive git operations without explicit confirmation"
   Source: docs/observations/2025-11-11-git-destructive-operations.md (N=5)
   Resolution: Present alternatives to user, request explicit approval

2. [IMPORTANT] plan-approve-implement
   Action: "implement the changes from the review"
   Constraint: "Wait for explicit human approval before implementing review findings"
   Source: docs/observations/plan-approve-implement-violation.md (N=4)
   Resolution: Present findings, ask "Ready to proceed?", wait for "yes"

---
Summary: 2 violations (1 critical, 1 important)
Recommendation: BLOCK - resolve critical violations before proceeding
```

### File-Specific Check

```
/constraint-enforcer --check-file src/handlers/auth.go

Constraints applicable to src/handlers/auth.go:

  [CRITICAL] csrf-token-required
    Pattern: handlers/*.go
    Constraint: "All form handlers must validate CSRF tokens"

  [IMPORTANT] error-handling-required
    Pattern: **/*.go
    Constraint: "All database operations must have error handling"

Total: 2 constraints apply to this file
```

## Example

```
/constraint-enforcer "delete the feature branch without asking user"

VIOLATIONS FOUND: 1

1. [CRITICAL] git-safety-protocol
   Action: "delete the feature branch without asking user"
   Constraint: "Never execute destructive git operations without explicit confirmation"
   Source: docs/observations/2025-11-11-git-destructive-operations.md (N=5)
   Resolution: Ask user for confirmation before deleting branch
```

## Integration

- **Layer**: Foundation
- **Depends on**: None (foundational skill)
- **Used by**: circuit-breaker (wraps this skill), all workflow skills

## Constraint File Format

Constraints are stored in `docs/constraints/active/` as markdown:

```markdown
---
id: git-safety-protocol
severity: critical
status: active
patterns: ["*.git*", "git *"]
created: 2025-11-11
source: docs/observations/2025-11-11-git-destructive-operations.md
r_count: 5
c_count: 3
---

# Git Safety Protocol

Never execute destructive git operations without explicit confirmation.

## Trigger Patterns

- `git reset`
- `git push --force`
- `git branch -D`
- `git clean`

## Required Actions

1. Present consequences to user
2. Offer alternatives
3. Request explicit "yes" confirmation
4. Log the decision
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraints path not found | Warning: "Constraints directory not found, no checks performed" |
| Invalid constraint file | Warning: "Skipping invalid constraint: filename" |
| No action provided | Error: "Action description required" |
| Empty action string | Error: "Action description cannot be empty" |

## Severity Levels

| Level | Meaning | Recommendation |
|-------|---------|----------------|
| CRITICAL | Safety violation, data loss risk | BLOCK - must resolve |
| IMPORTANT | Correctness issue, workflow violation | WARN - should resolve |
| MINOR | Style issue, optimization | INFO - consider resolving |

## Acceptance Criteria

- [ ] Loads constraints from specified path
- [ ] Correctly identifies matching violations
- [ ] Returns CLEAR result when no violations
- [ ] Severity classification (critical/important/minor) works
- [ ] File pattern matching works for --check-file
- [ ] JSON output format valid
- [ ] Multiple violations properly aggregated
