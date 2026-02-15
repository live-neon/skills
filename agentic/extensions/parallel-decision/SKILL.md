---
name: parallel-decision
version: 1.0.0
description: 5-factor framework for parallel vs serial execution decisions
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, parallel, decision, workflow]
layer: extensions
status: active
source: docs/workflows/parallel-vs-serial-decision.md
n_count: 5
---

# parallel-decision

Evaluate whether tasks should run in parallel or serial using a 5-factor
framework. Provides scored recommendations with reasoning.

## Problem Being Solved

Developers often choose parallel or serial execution intuitively, leading to:
- Inefficient serial execution when parallel is safe
- Bugs from parallel execution when order matters
- Inconsistent decision-making across team

## Usage

```
/parallel-decision evaluate <task>     # Full 5-factor evaluation
/parallel-decision quick <task>        # Quick recommendation only
/parallel-decision factors             # Show the 5-factor framework
```

## Example

```bash
# Evaluate a task
/parallel-decision evaluate "Run tests for 3 independent modules"

# Quick check
/parallel-decision quick "Update database and then run migrations"
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: evaluate, quick, factors |
| task | Yes (for evaluate/quick) | Task description to evaluate |
| --context | No | Additional context for evaluation |

## The 5-Factor Framework

| Factor | Question | Parallel If | Serial If |
|--------|----------|-------------|-----------|
| **Dependencies** | Do tasks share state or data? | No shared state | Shared state exists |
| **Ordering** | Does order affect outcome? | Order independent | Order matters |
| **Resources** | Can resources handle concurrent load? | Sufficient capacity | Resource constrained |
| **Isolation** | Are failures isolated? | Failures don't cascade | Failures cascade |
| **Complexity** | Is coordination simple? | Simple coordination | Complex coordination |

## Output

### Full Evaluation

```
/parallel-decision evaluate "Run tests for auth, api, and ui modules"

PARALLEL VS SERIAL EVALUATION
=============================

Task: Run tests for auth, api, and ui modules

Factor Analysis:
  1. Dependencies:    PARALLEL  (No shared state between modules)
  2. Ordering:        PARALLEL  (Test order doesn't affect results)
  3. Resources:       PARALLEL  (CI has capacity for 3 parallel jobs)
  4. Isolation:       PARALLEL  (Module failures are independent)
  5. Complexity:      PARALLEL  (Simple test aggregation)

Score: 5/5 PARALLEL factors

RECOMMENDATION: PARALLEL
Confidence: High

Reasoning:
  - All 5 factors favor parallel execution
  - Independent test modules with no shared state
  - Failures in one module don't affect others

Implementation:
  npm test --parallel
  # Or: run auth, api, ui tests concurrently
```

### Serial Recommendation

```
/parallel-decision evaluate "Create database schema then seed data"

PARALLEL VS SERIAL EVALUATION
=============================

Task: Create database schema then seed data

Factor Analysis:
  1. Dependencies:    SERIAL    (Seed depends on schema existence)
  2. Ordering:        SERIAL    (Schema must exist before seeding)
  3. Resources:       PARALLEL  (DB can handle concurrent operations)
  4. Isolation:       SERIAL    (Seed failure depends on schema)
  5. Complexity:      SERIAL    (Requires sequencing)

Score: 1/5 PARALLEL factors

RECOMMENDATION: SERIAL
Confidence: High

Reasoning:
  - Strong dependency between tasks
  - Schema creation is prerequisite for seeding
  - Order is critical for correctness

Implementation:
  npm run db:create && npm run db:seed
```

### Factors Reference

```
/parallel-decision factors

THE 5-FACTOR FRAMEWORK
======================

Use these 5 factors to decide between parallel and serial execution:

1. DEPENDENCIES
   - Parallel: Tasks operate on independent data
   - Serial: Tasks share state or modify same resources

2. ORDERING
   - Parallel: Results are order-independent
   - Serial: Task B depends on Task A's output

3. RESOURCES
   - Parallel: System can handle concurrent load
   - Serial: Resources are constrained (CPU, memory, connections)

4. ISOLATION
   - Parallel: Failures in one task don't affect others
   - Serial: Failure in one task should stop the chain

5. COMPLEXITY
   - Parallel: Coordination is simple (wait for all)
   - Serial: Complex coordination (retries, rollbacks)

SCORING:
  - 4-5 parallel factors: Recommend PARALLEL
  - 2-3 parallel factors: Context-dependent (evaluate carefully)
  - 0-1 parallel factors: Recommend SERIAL
```

## Integration

- **Layer**: Extensions
- **Depends on**: None (standalone)
- **Used by**: Plan creation, task decomposition

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Missing task description | Error: "Task description required" |
| Ambiguous context | Warning: "Low confidence - provide more context" |

## When NOT to Use

- **Single atomic tasks**: No decomposition needed, evaluation is overhead
- **Obvious sequential dependencies**: "A then B" patterns don't need framework analysis
- **Latency-critical paths**: When simplicity matters more than throughput
- **Already-established patterns**: Team has strong consensus on execution model
- **Trivial operations**: Sub-second tasks where parallel overhead exceeds benefit

Use the 5-factor framework when the decision is non-obvious or when documenting
rationale for team reference.

## Acceptance Criteria

- [x] Evaluates all 5 factors
- [x] Produces SERIAL/PARALLEL recommendation
- [x] Explains reasoning with factor scores
- [x] Quick mode provides fast recommendation
- [x] Factors command shows framework reference
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Use before task decomposition:
```bash
/parallel-decision evaluate "<your task>"
```

**Verification**: `cd tests && npm test -- --grep "parallel-decision"`
