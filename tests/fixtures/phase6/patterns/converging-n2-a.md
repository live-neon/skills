---
slug: api-timeout-handling
status: active
n_count: 2
r_count: 2
c_count: 1
d_count: 0
category: api
root_cause: missing-timeout-config
---

# API Timeout Handling (N=2)

Fixture for testing pattern-convergence-detector - Pattern A.

## Root Cause

Missing or insufficient timeout configuration in API calls.

## Occurrences

1. **2026-02-01**: External API call hung for 5 minutes
2. **2026-02-10**: Database query timed out on large dataset

## Related Patterns

- Shares root cause with: api-retry-exhaustion
- Category: api error handling

## Convergence Signal

This N=2 pattern may be converging with `api-retry-exhaustion` toward
a unified `api-resilience` constraint.
