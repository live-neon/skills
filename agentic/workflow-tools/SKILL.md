---
name: workflow-tools
version: 1.0.0
description: Utility tools for workflow management, parallel decisions, and MCE refactoring
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, workflow, tools, parallel, mce, loops]
layer: extensions
status: active
alias: wt
---

# workflow-tools (工具)

Unified skill for workflow utilities including open loop detection, parallel/serial
decision framework, MCE file analysis, and subworkflow spawning. Consolidates 4 skills.

**Trigger**: 明示呼出 (explicit invocation)

**Source skills**: loop-closer, parallel-decision, MCE (minimal-context-engineering), subworkflow-spawner

**Removed**: pbd-strength-classifier (redundant with `/fm classify`)

## Usage

```
/wt <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/wt loops` | 循環 | scan(DEFERRED∨PLACEHOLDER∨TODO)→openloop[] | Explicit |
| `/wt parallel` | 並列 | 5因子→serial∨parallel | Explicit |
| `/wt mce` | 極限 | file.lines>200→split_suggestions[] | Explicit |
| `/wt subworkflow` | 副流 | task→spawn(clawhub.skill) | Explicit |

## Arguments

### /wt loops

| Argument | Required | Description |
|----------|----------|-------------|
| path | No | Directory to scan (default: current) |
| --pattern | No | Custom patterns to detect (comma-separated) |
| --exclude | No | Paths to exclude (comma-separated) |

### /wt parallel

| Argument | Required | Description |
|----------|----------|-------------|
| task | Yes | Description of task to evaluate |
| --factors | No | Specific factors to evaluate (default: all 5) |

### /wt mce

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes | File to analyze |
| --threshold | No | Line threshold (default: 200) |
| --suggest | No | Generate split suggestions |

### /wt subworkflow

| Argument | Required | Description |
|----------|----------|-------------|
| task | Yes | Task description |
| --skill | No | Specific ClawHub skill to use |
| --background | No | Run in background |

## Core Logic

### Open Loop Detection

Scans for unclosed work items:

| Pattern | Type | Example |
|---------|------|---------|
| `DEFERRED:` | Postponed work | `// DEFERRED: handle edge case` |
| `PLACEHOLDER:` | Temporary code | `// PLACEHOLDER: implement auth` |
| `TODO:` | Task marker | `// TODO: add error handling` |
| `FIXME:` | Bug marker | `// FIXME: race condition` |
| `HACK:` | Technical debt | `// HACK: workaround for bug` |
| `XXX:` | Attention needed | `// XXX: review this logic` |

### Parallel vs Serial Decision Framework

Five factors determine parallel suitability:

| Factor | Question | Parallel If | Serial If |
|--------|----------|-------------|-----------|
| **Team** | Can different people work on parts? | Independent parts | Shared expertise needed |
| **Coupling** | How connected are the tasks? | Loose coupling | Tight coupling |
| **Interface** | Are boundaries clear? | Well-defined | Fluid/evolving |
| **Pattern** | Is approach consistent? | Divergent exploration | Convergent refinement |
| **Integration** | How complex is merging? | Simple merge | Complex coordination |

Decision matrix:

| Factors favoring parallel | Recommendation |
|---------------------------|----------------|
| 5/5 | Strongly parallel |
| 4/5 | Parallel with coordination checkpoints |
| 3/5 | Consider case-by-case |
| 2/5 | Serial with parallel sub-tasks |
| 0-1/5 | Serial |

### MCE (Minimal Context Engineering)

File size thresholds for context efficiency:

| Lines | Status | Action |
|-------|--------|--------|
| ≤200 | ✓ MCE compliant | No action needed |
| 201-300 | ⚠ Approaching limit | Consider refactoring |
| >300 | ✗ Exceeds MCE | Split recommended |

Split suggestions based on:
- Function/method boundaries
- Logical groupings
- Import dependencies
- Test coverage boundaries

### Subworkflow Spawning

Delegate tasks to specialized ClawHub skills:

```
Task → Skill Selection → Spawn → Monitor → Collect Results
```

Available skill categories:
- `research-*`: Investigation and analysis
- `generate-*`: Content generation
- `validate-*`: Verification and testing
- `transform-*`: Data transformation

## Output

### /wt loops output

```
[OPEN LOOPS DETECTED]
Scanned: ./src
Files checked: 47

Open loops found (12):

High Priority (FIXME, XXX):
  src/auth/handler.go:45  FIXME: race condition in token refresh
  src/api/client.go:123   XXX: review error handling

Medium Priority (TODO):
  src/handlers/user.go:78  TODO: add input validation
  src/db/queries.go:234    TODO: optimize query
  src/utils/hash.go:12     TODO: add caching

Low Priority (DEFERRED, PLACEHOLDER):
  src/config/loader.go:89  DEFERRED: support YAML config
  src/templates/email.go:34 PLACEHOLDER: email templates
  ...

Summary: 2 high, 5 medium, 5 low priority loops
Action: Address high priority loops before release.
```

### /wt parallel output

```
[PARALLEL VS SERIAL ANALYSIS]
Task: "Implement authentication and authorization"

Factor Analysis:

1. Team (独立性):
   ✓ Parallel - Auth and authz can be assigned separately

2. Coupling (結合度):
   ✗ Serial - Authz depends on auth tokens

3. Interface (境界):
   ✓ Parallel - Clear token interface between them

4. Pattern (手法):
   ✓ Parallel - Both follow established patterns

5. Integration (統合):
   ✗ Serial - Token format must match exactly

Score: 3/5 factors favor parallel

Recommendation: SERIAL with parallel sub-tasks
Rationale: Core dependency between auth and authz, but sub-components
           within each can be developed in parallel.

Suggested approach:
1. Define token interface (serial, required first)
2. Implement auth + authz (parallel, once interface stable)
3. Integration testing (serial, final step)
```

### /wt mce output

```
[MCE ANALYSIS]
File: src/handlers/user.go
Lines: 347

Status: ✗ EXCEEDS MCE THRESHOLD (200 lines)

Complexity Analysis:
  Functions: 12
  Avg function length: 29 lines
  Max function length: 67 lines (HandleUserUpdate)
  Import groups: 4

Split Suggestions:

1. Extract CRUD handlers (lines 45-180):
   → src/handlers/user_crud.go (~135 lines)
   - CreateUser, GetUser, UpdateUser, DeleteUser

2. Extract validation (lines 181-250):
   → src/handlers/user_validation.go (~70 lines)
   - ValidateUserInput, ValidateEmail, ValidatePassword

3. Keep orchestration (remaining):
   → src/handlers/user.go (~142 lines)
   - Handler setup, middleware, routing

After split: 3 files, all ≤200 lines ✓
```

### /wt subworkflow output

```
[SUBWORKFLOW SPAWNED]
Task: "Research competitor authentication implementations"
Skill: research-web-analysis
Status: Running in background

Job ID: SW-20260215-001
Monitor: /wt subworkflow --status SW-20260215-001

Expected completion: ~5 minutes
Results will be written to: output/subworkflows/SW-20260215-001/
```

## Integration

- **Layer**: Extensions
- **Depends on**: failure-memory (for loop context), constraint-engine (for enforcement context)
- **Used by**: governance (for loop detection), review-orchestrator (for parallel decisions)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid sub-command | List available sub-commands |
| File not found | Error: "File not found: {path}" |
| No patterns found | Info: "No open loops detected" |
| Skill not available | Error: "Skill not found: {skill}" |

## Next Steps

After invoking this skill:

| Condition | Action |
|-----------|--------|
| Loops found | Prioritize and address high-priority loops |
| Parallel recommended | Create parallel work streams |
| MCE exceeded | Apply split suggestions |
| Subworkflow complete | Review and integrate results |

## Workspace Files

This skill reads/writes:

```
output/
├── loops/
│   └── scan-YYYY-MM-DD.md    # Loop scan results
├── parallel-decisions/
│   └── task-YYYY-MM-DD.md    # Decision records
├── mce-analysis/
│   └── file-YYYY-MM-DD.md    # MCE analysis results
└── subworkflows/
    └── SW-YYYYMMDD-XXX/      # Subworkflow outputs
        ├── status.json
        └── results.md
```

## Acceptance Criteria

- [ ] `/wt loops` detects all standard loop patterns
- [ ] `/wt loops` categorizes by priority (high/medium/low)
- [ ] `/wt parallel` evaluates all 5 factors
- [ ] `/wt parallel` provides clear recommendation with rationale
- [ ] `/wt mce` identifies files exceeding threshold
- [ ] `/wt mce --suggest` generates actionable split suggestions
- [ ] `/wt subworkflow` spawns ClawHub skills correctly
- [ ] `/wt subworkflow` supports background execution
- [ ] Results written to workspace files

---

*Consolidated from 4 skills as part of agentic skills consolidation (2026-02-15).*
