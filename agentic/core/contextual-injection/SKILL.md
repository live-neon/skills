---
name: contextual-injection
version: 1.0.0
description: Load relevant constraints based on current working context
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, context, injection]
---

# contextual-injection

Load relevant constraints into session context based on current working files,
workflow stage, domain tags, and historical violations. This skill determines
which constraints should be active for the current session.

## Semantic Classification

This skill uses **LLM-based semantic similarity** for tag and domain matching.
A constraint tagged "version-control" should match context involving "git" or
"source code management". File patterns use glob matching (acceptable for
file selection).

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach.

## Usage

```
/contextual-injection load [--files <patterns>] [--stage <stage>] [--domain <domain>]
/contextual-injection status
/contextual-injection list-injected
/contextual-injection clear
/contextual-injection add <constraint-id>
/contextual-injection remove <constraint-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: load, status, list-injected, clear, add, remove |
| --files | No | File patterns to match (glob syntax) |
| --stage | No | Workflow stage: planning, implementing, reviewing, testing |
| --domain | No | Domain context: git, testing, workflow, security, etc. |
| --max | No | Maximum constraints to inject (default: 10) |
| --priority | No | Minimum priority: critical, high, medium, low |
| constraint-id | Yes* | Constraint ID (*for add/remove only) |

## Example

```bash
# Load constraints for current context
/contextual-injection load --files "src/git/*.ts" --stage implementing

# View injection status
/contextual-injection status

# Manually add a constraint
/contextual-injection add security-credential-handling

# Clear and reload
/contextual-injection clear
```

## Output

### Load Context

```
/contextual-injection load --files "src/git/*.ts" --stage implementing

CONTEXT INJECTION
─────────────────

Session Context:
  Files: src/git/*.ts
  Stage: implementing
  Domain: git (inferred)

Injecting 4 constraints:

1. git-safety-force-push [CRITICAL]
   Match: file pattern "src/git/*.ts"
   Priority: Critical

2. git-safety-destructive-ops [CRITICAL]
   Match: file pattern "src/git/*.ts"
   Priority: Critical

3. test-before-commit [IMPORTANT]
   Match: workflow stage "implementing"
   Priority: High

4. plan-approve-implement [IMPORTANT]
   Match: domain "git", stage "implementing"
   Priority: High

Not injected (lower priority):
  - quality-error-handling [MINOR] - below threshold
  - code-review-required [IMPORTANT] - stage mismatch (reviewing only)

Summary: 4 constraints injected (2 critical, 2 important)
```

### Status

```
/contextual-injection status

INJECTION STATUS
────────────────

Current Session:
  Files: src/git/*.ts, src/deploy/*.ts
  Stage: implementing
  Domain: git

Active Constraints (5):
  1. git-safety-force-push [CRITICAL] - file match
  2. git-safety-destructive-ops [CRITICAL] - file match
  3. test-before-commit [IMPORTANT] - stage match
  4. plan-approve-implement [IMPORTANT] - domain match
  5. security-credential-handling [CRITICAL] - manual add

Recent Violations (this session):
  - git-safety-force-push: 1 violation (blocked)

Constraint States:
  Circuit CLOSED: 4
  Circuit OPEN: 1 (git-safety-force-push)
```

### List Injected

```
/contextual-injection list-injected

INJECTED CONSTRAINTS (5)
────────────────────────

Priority Critical (2):
  1. git-safety-force-push
     Match: file pattern src/git/*.ts
     Circuit: OPEN (5/5 violations)

  2. git-safety-destructive-ops
     Match: file pattern src/git/*.ts
     Circuit: CLOSED (0/5 violations)

Priority High (2):
  3. test-before-commit
     Match: workflow stage implementing
     Circuit: CLOSED (1/5 violations)

  4. plan-approve-implement
     Match: domain git
     Circuit: CLOSED (0/5 violations)

Manual (1):
  5. security-credential-handling
     Added: manually via /contextual-injection add
     Circuit: CLOSED (0/5 violations)
```

### Manual Add/Remove

```
/contextual-injection add security-api-keys

CONSTRAINT ADDED
────────────────

Constraint: security-api-keys
Severity: CRITICAL
Status: active

Added to session context (manual override).
Will remain until session end or explicit removal.
```

```
/contextual-injection remove test-before-commit

CONSTRAINT REMOVED
──────────────────

Constraint: test-before-commit
Removed from session context.

Note: May be re-injected if context changes and matches.
```

## Matching Criteria

Constraints are matched and prioritized by these criteria:

| Criterion | Method | Priority Boost |
|-----------|--------|----------------|
| File pattern | Glob matching | +2 if match |
| Workflow stage | Exact match | +1 if match |
| Domain tags | Semantic similarity | +1 if >0.80 |
| Session violations | History check | +2 if violated |
| Severity | Direct mapping | CRITICAL=3, IMPORTANT=2, MINOR=1 |

## Priority Calculation

```
priority = severity_base + file_match_boost + stage_boost + domain_boost + violation_boost

Where:
  severity_base: CRITICAL=3, IMPORTANT=2, MINOR=1
  file_match_boost: 2 if file pattern matches current files
  stage_boost: 1 if workflow stage matches
  domain_boost: 1 if domain tag similarity >0.80
  violation_boost: 2 if violated in current session
```

## Priority Thresholds

| Priority Level | Score | Included By Default |
|----------------|-------|---------------------|
| Critical | 5+ | Always |
| High | 3-4 | Always |
| Medium | 2 | If space permits |
| Low | 1 | Only if explicitly requested |

## Workflow Stages

| Stage | Description | Typical Constraints |
|-------|-------------|---------------------|
| planning | Creating implementation plans | plan-approve-implement |
| implementing | Writing code | test-before-commit, code quality |
| reviewing | Code review | code-review-required |
| testing | Running tests | test coverage, quality gates |

## Domain Inference

Domain is inferred from file patterns if not specified:

| File Pattern | Inferred Domain |
|--------------|-----------------|
| `src/git/*`, `*.git*` | git |
| `*test*`, `*spec*` | testing |
| `*.sql`, `*database*` | database |
| `*auth*`, `*security*` | security |
| `*deploy*`, `*ci*` | deployment |

## Context Persistence

Context persists within a session:
- File patterns accumulated as files are opened
- Workflow stage updated on explicit change
- Manual additions persist until removal or session end
- Violations tracked for session duration

## Integration

- **Layer**: Core
- **Depends on**: memory-search, constraint-lifecycle
- **Used by**: Session initialization, workflow skills

## Integration with memory-search

```
1. Receive context (files, stage, domain)
2. Query memory-search with context filters
3. Calculate priority for each result
4. Sort by priority, apply max limit
5. Return injection list
```

## Integration with constraint-enforcer

When constraints are injected:
```
1. constraint-enforcer receives injected constraint list
2. Each action checked against injected constraints
3. Violations logged and reported
4. Circuit breaker states tracked per constraint
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No matching constraints | Info: "No constraints match current context" |
| memory-search unavailable | Warning: inject manual constraints only |
| Invalid file pattern | Error: "Invalid glob pattern: <pattern>" |
| Unknown workflow stage | Warning: "Unknown stage, using default matching" |
| Constraint not found | Error: "Constraint not found: <id>" |

## Acceptance Criteria

- [x] Matches constraints by file patterns
- [x] Matches constraints by workflow stage
- [x] Matches constraints by domain tags (semantic)
- [x] Calculates priority from multiple factors
- [x] Respects maximum injection limit
- [x] Supports manual add/remove
- [x] Tracks session context persistence
- [x] Integrates with memory-search
- [x] Reports injection status

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
