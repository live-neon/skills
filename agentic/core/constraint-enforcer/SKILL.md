---
name: constraint-enforcer
version: 1.0.0
description: Check proposed actions against loaded constraints
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, safety]
---

# constraint-enforcer

Check proposed actions against active constraints using LLM-based semantic classification.
Returns violations if any constraints would be breached. This is the runtime enforcement
layer of the agentic memory system.

## Semantic Classification

This skill uses **LLM-based semantic similarity** for action classification, NOT pattern
matching. Pattern matching (string/glob/regex) is prohibited as it can be trivially evaded
through aliases, synonyms, or rephrasing.

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach, implementation patterns, and testing strategies.

**How it works**:
1. Parse the proposed action description
2. For each active constraint, use LLM to assess semantic similarity
3. Classify action intent (destructive, modifying, read-only, etc.)
4. Match intent against constraint scope (what actions the constraint covers)
5. Return violations with confidence scores

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
| --allow-missing-constraints | No | Allow running when constraints directory is missing (default: error) |

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

1. [CRITICAL] git-safety-protocol (confidence: 0.95)
   Action: "git reset --hard origin/main"
   Intent: destructive (resets working directory, discards uncommitted changes)
   Constraint: "Never execute destructive git operations without explicit confirmation"
   Source: docs/observations/2025-11-11-git-destructive-operations.md (N=5)
   Resolution: Present alternatives to user, request explicit approval

2. [IMPORTANT] plan-approve-implement (confidence: 0.87)
   Action: "implement the changes from the review"
   Intent: modifying (will change code based on review findings)
   Constraint: "Wait for explicit human approval before implementing review findings"
   Source: docs/observations/plan-approve-implement-violation.md (N=4)
   Resolution: Present findings, ask "Ready to proceed?", wait for "yes"

---
Summary: 2 violations (1 critical, 1 important)
Semantic analysis: LLM classified action intents, matched against constraint scopes
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

1. [CRITICAL] git-safety-protocol (confidence: 0.92)
   Action: "delete the feature branch without asking user"
   Intent: destructive (branch deletion cannot be easily undone)
   Semantic match: "delete branch" → constraint scope "destroy git branches"
   Constraint: "Never execute destructive git operations without explicit confirmation"
   Source: docs/observations/2025-11-11-git-destructive-operations.md (N=5)
   Resolution: Ask user for confirmation before deleting branch
```

Note: The LLM understands that "delete the feature branch" semantically matches the
constraint's scope of "actions that destroy git branches," regardless of whether
the exact command (`git branch -D`) appears in the action description.

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
scope: "Actions that modify or destroy git history, branches, or working directory state"
intent: destructive
created: 2025-11-11
source: docs/observations/2025-11-11-git-destructive-operations.md
r_count: 5
c_count: 3
---

# Git Safety Protocol

Never execute destructive git operations without explicit confirmation.

## Semantic Scope

Actions that match this constraint include (but are not limited to):
- Resetting commits or HEAD position
- Force pushing (overwrites remote history)
- Deleting branches
- Cleaning untracked files
- Any action that cannot be easily undone

The LLM evaluates action INTENT, not surface commands. "git push -f" and
"git push --force" are semantically identical. "rm -rf .git" and "git init"
both destroy git state.

## Required Actions

1. Present consequences to user
2. Offer alternatives
3. Request explicit "yes" confirmation
4. Log the decision
```

**Key fields**:
- `scope`: Natural language description of what actions the constraint covers
- `intent`: Action classification (destructive, modifying, read-only, external, etc.)

**NOT supported** (pattern matching is prohibited):
- `patterns`: ["*.git*", "git *"] — DO NOT USE
- Regex or glob matching on action strings

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraints path not found | Error: "Constraints directory not found. Use --allow-missing-constraints to bypass." |
| Invalid constraint file | Warning: "Skipping invalid constraint: filename" |
| No action provided | Error: "Action description required" |
| Empty action string | Error: "Action description cannot be empty" |

**Fail-Closed Design**: Missing constraints directory is an error by default. This prevents
silent safety bypass from misconfiguration. Use `--allow-missing-constraints` only when
intentionally running without constraints (e.g., initial setup).

## Semantic Classification Details

The LLM evaluates action semantics, not surface patterns:

| Action A | Action B | Semantic Match? |
|----------|----------|-----------------|
| "git push --force" | "git push -f" | YES (identical intent) |
| "git reset --hard" | "reset to last commit" | YES (same effect) |
| "rm -rf /path" | "delete everything in path" | YES (same effect) |
| "git push origin main" | "git push --force" | NO (different intent) |

**Intent Classification**:

| Intent | Description | Example Actions |
|--------|-------------|-----------------|
| destructive | Cannot be easily undone | force push, reset --hard, rm -rf |
| modifying | Changes state but recoverable | edit file, create branch |
| read-only | No side effects | git status, cat file |
| external | Affects systems outside repo | push, deploy, publish |

**Confidence Scoring**:

Each violation includes a confidence score (0.0-1.0):
- `>= 0.9`: High confidence match
- `0.7-0.9`: Likely match, may need review
- `< 0.7`: Low confidence, reported as potential match

## Severity Levels

| Level | Meaning | Recommendation |
|-------|---------|----------------|
| CRITICAL | Safety violation, data loss risk | BLOCK - must resolve |
| IMPORTANT | Correctness issue, workflow violation | WARN - should resolve |
| MINOR | Style issue, optimization | INFO - consider resolving |

## Acceptance Criteria

- [ ] Loads constraints from specified path
- [ ] Uses LLM semantic similarity for action-constraint matching (NOT patterns)
- [ ] Correctly identifies semantically equivalent actions (e.g., "git push -f" = "force push")
- [ ] Returns CLEAR result when no violations
- [ ] Severity classification (critical/important/minor) works
- [ ] Confidence scores included with each violation
- [ ] Intent classification (destructive/modifying/read-only/external) accurate
- [ ] JSON output format valid
- [ ] Multiple violations properly aggregated
