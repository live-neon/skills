---
name: pattern-convergence-detector
version: 1.0.0
description: Monitor N=2 observations for convergence toward unified patterns
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, patterns, convergence, detection]
layer: extensions
status: active
source: Multiple N=2 to N=3 progressions observed
n_count: 2
---

# pattern-convergence-detector

Monitor N=2 observations for convergence signals. Detect when multiple N=2
observations share similar root causes, accelerating pattern identification.

## Problem Being Solved

Related patterns evolve separately without recognition:
- Two N=2 observations describe same underlying issue
- Root cause shared but not explicitly connected
- Pattern promotion delayed waiting for individual N=3
- Unified constraints not identified early

## Usage

```
/pattern-convergence-detector scan                  # Find converging patterns
/pattern-convergence-detector watch <observation>   # Monitor specific pattern
/pattern-convergence-detector clusters              # Show pattern clusters
```

## Example

```bash
# Scan for converging patterns
/pattern-convergence-detector scan

# Watch a specific N=2 pattern
/pattern-convergence-detector watch api-timeout-handling.md

# View all pattern clusters
/pattern-convergence-detector clusters
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: scan, watch, clusters |
| observation | Yes (for watch) | Path to observation |
| --category | No | Filter by category (api, auth, etc.) |
| --min-similarity | No | Minimum similarity threshold (0.5-1.0) |

## Convergence Signals

| Signal | Weight | Detection Method |
|--------|--------|------------------|
| Same root_cause | High | Frontmatter match |
| Same category | Medium | Frontmatter match |
| Similar keywords | Low | Content analysis |
| Related patterns | Medium | "Related" section links |

## Output

### Scan Results

```
/pattern-convergence-detector scan

CONVERGENCE SCAN
================

Converging Clusters Found: 1

Cluster 1: api-resilience
----------------------------
Pattern A: api-timeout-handling (N=2)
  Root cause: missing-timeout-config
  Category: api

Pattern B: api-retry-exhaustion (N=2)
  Root cause: missing-timeout-config
  Category: api

Convergence Signals:
  [HIGH] Same root_cause: missing-timeout-config
  [MEDIUM] Same category: api
  [MEDIUM] Explicit relation in "Related Patterns"

Combined N-count: 4 (effective)
Recommendation: Consider unifying into "api-resilience" constraint

No other converging patterns detected.
```

### Watch Pattern

```
/pattern-convergence-detector watch api-timeout-handling.md

PATTERN WATCH
=============

Observation: api-timeout-handling.md
N-count: 2
Root cause: missing-timeout-config

Potential Convergences:
-----------------------
1. api-retry-exhaustion.md (HIGH match)
   Shared: root_cause, category
   Combined N: 4

2. circuit-breaker-missing.md (MEDIUM match)
   Shared: category
   Combined N: 3

Recommendation:
  Consider consolidation with api-retry-exhaustion
  Would create N=4 pattern ready for constraint
```

### Clusters View

```
/pattern-convergence-detector clusters

PATTERN CLUSTERS
================

Cluster: api-resilience
  Members: api-timeout-handling, api-retry-exhaustion
  Root cause: missing-timeout-config
  Combined N: 4
  Status: Candidate for consolidation

Cluster: auth-session
  Members: session-expiry-handling, token-refresh-timing
  Root cause: session-lifecycle-gap
  Combined N: 3
  Status: Watch for N=4

Unclustered N=2 Patterns:
  - db-connection-pooling (no similar patterns found)
  - logging-format-inconsistency (no similar patterns found)

Summary:
  2 active clusters
  4 patterns in clusters
  2 patterns unclustered
```

## Clustering Algorithm

1. Extract root_cause and category from N=2 observations
2. Group by exact root_cause match (high confidence)
3. Group by category + keyword overlap (medium confidence)
4. Calculate combined N-count for clusters
5. Flag clusters with combined N >= 3 as consolidation candidates

## Integration

- **Layer**: Extensions
- **Depends on**: pbd-strength-classifier (for N-count)
- **Used by**: observation-refactoring consolidation

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No N=2 observations | Info: "No N=2 patterns found" |
| Missing root_cause | Warning: "Pattern missing root_cause" |
| Invalid observation | Error: "Observation not found" |

## Acceptance Criteria

- [x] Scans for converging N=2 patterns
- [x] Groups by shared root_cause
- [x] Calculates combined N-count
- [x] Provides consolidation recommendations
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Scan for converging patterns:
```bash
/pattern-convergence-detector scan
```

**Verification**: `cd tests && npm test -- -t "pattern-convergence-detector"`
