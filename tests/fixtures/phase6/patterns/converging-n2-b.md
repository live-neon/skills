---
slug: api-retry-exhaustion
status: active
n_count: 2
r_count: 2
c_count: 1
d_count: 0
category: api
root_cause: missing-timeout-config
---

# API Retry Exhaustion (N=2)

Fixture for testing pattern-convergence-detector - Pattern B.

## Root Cause

Missing or insufficient timeout configuration leads to retry exhaustion.

## Occurrences

1. **2026-02-05**: Retries exhausted waiting for slow service
2. **2026-02-12**: Circuit breaker not triggered due to long timeouts

## Related Patterns

- Shares root cause with: api-timeout-handling
- Category: api error handling

## Convergence Signal

This N=2 pattern shares the same root_cause (`missing-timeout-config`)
as `api-timeout-handling`. Together they suggest a unified `api-resilience`
constraint is needed.

## Cluster Membership

Both patterns belong to cluster: `api-resilience-patterns`
