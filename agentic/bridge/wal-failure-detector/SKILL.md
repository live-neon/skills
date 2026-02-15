---
name: wal-failure-detector
version: 1.0.0
description: Detect failure patterns in proactive-agent's write-ahead log
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, bridge, wal, failures, proactive]
layer: bridge
status: active
---

# wal-failure-detector

Detect failure patterns in proactive-agent's write-ahead log (WAL). The WAL contains
a stream of agent actions—this skill scans for failure signatures and feeds them
to failure-detector for processing.

## Problem Being Solved

proactive-agent writes actions to a WAL before execution. Failed actions leave
signatures in the log that can indicate systemic issues. Without scanning,
these patterns go unnoticed until they cause visible failures.

## Usage

```
/wal-failure-detector scan                         # Scan default WAL
/wal-failure-detector scan --path <wal-file>       # Scan specific WAL
/wal-failure-detector scan --since 24h             # Recent entries only
/wal-failure-detector patterns                     # Show detected patterns
/wal-failure-detector feed                         # Feed to failure-detector
```

## Example

```bash
# Scan WAL for recent failures
/wal-failure-detector scan --since 24h

# Feed detected patterns to failure-detector
/wal-failure-detector feed
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: scan, patterns, feed |
| --path | No | Path to WAL file (default: agent WAL location) |
| --since | No | Time filter: 1h, 24h, 7d, 30d (default: all) |
| --verbose | No | Show all entries, not just failures |
| --dry-run | No | Preview feed without updating failure-detector |

## WAL Format

The WAL uses pipe-delimited format (one entry per line):

```
TIMESTAMP|STATUS|RETRY_COUNT|ACTION|METADATA
```

| Field | Type | Description |
|-------|------|-------------|
| TIMESTAMP | ISO 8601 | Entry timestamp |
| STATUS | Enum | PENDING, SUCCESS, ROLLBACK, TIMEOUT, CONFLICT |
| RETRY_COUNT | Integer | Number of retry attempts |
| ACTION | String | Command or action description |
| METADATA | JSON | Optional context (branch, endpoint, path, etc.) |

## Failure Signatures

| Signature | Indicates | WAL Status | Criteria | Action |
|-----------|-----------|------------|----------|--------|
| ROLLBACK | Action failed and rolled back | ROLLBACK | status = ROLLBACK | Feed to failure-detector |
| RETRY_EXCEEDED | Excessive retries | SUCCESS/any | retry_count > 3 | Feed to failure-detector |
| TIMEOUT | Action timed out | TIMEOUT | status = TIMEOUT | Feed to failure-detector |
| CONFLICT | Concurrent modification | CONFLICT | status = CONFLICT | Log for coordination analysis |

## Output

### Scan WAL

```
/wal-failure-detector scan --path tests/fixtures/sample-wal.log

WAL SCAN RESULTS
================

File: tests/fixtures/sample-wal.log
Entries: 12
Timeframe: 2026-02-14T09:00:00Z to 2026-02-14T09:11:00Z

Failures detected: 5

1. [ROLLBACK] Line 3
   Action: git push --force
   Constraint: git-force-push
   Status: Already tracked

2. [TIMEOUT] Line 5
   Action: curl -X POST https://slow-api.example.com/webhook
   Context: endpoint=/webhook, timeout_ms=30000
   Status: NEW - not in failure-detector

3. [CONFLICT] Line 9
   Action: echo "content" > shared-state.json
   Context: concurrent_modification
   Status: NEW - coordination issue

4. [RETRY_EXCEEDED] Line 10
   Action: fetch https://flaky-service.example.com/data
   Retries: 3
   Status: NEW - service reliability issue

5. [ROLLBACK] Line 11
   Action: rm -rf important-files/
   Constraint: destructive-operation
   Status: Already tracked

Summary:
  - Already tracked: 2
  - New failures: 3

Feed new patterns: /wal-failure-detector feed
```

### Show Patterns

```
/wal-failure-detector patterns

DETECTED FAILURE PATTERNS
=========================

ROLLBACK patterns (2):
  - git-force-push: Prevented dangerous force pushes
  - destructive-operation: Prevented destructive file operations

TIMEOUT patterns (2):
  - slow-api-webhook: External API timeout (30s threshold)
  - large-file-processing: Python script timeout on large files

RETRY_EXCEEDED patterns (1):
  - flaky-service-fetch: Service returned 503, required 3 retries

CONFLICT patterns (1):
  - shared-state-conflict: Concurrent modification of shared-state.json

Total patterns: 6
Already in failure-detector: 2
New patterns: 4
```

### Feed to Failure-Detector

```
/wal-failure-detector feed

FEEDING TO FAILURE-DETECTOR
===========================

Processing 3 new failures...

1. slow-api-webhook (TIMEOUT)
   -> Created observation: api-timeout-webhook
   -> Suggested constraint: api-timeout-handling

2. shared-state-conflict (CONFLICT)
   -> Created observation: concurrent-state-modification
   -> Note: May require coordination pattern, not constraint

3. flaky-service-fetch (RETRY_EXCEEDED)
   -> Created observation: service-reliability-fetch
   -> Suggested constraint: retry-circuit-breaker

Fed: 3 patterns
Skipped: 2 (already tracked)

Next steps:
  - Review observations: /failure-tracker list --recent
  - Check constraint candidates: /constraint-generator candidates
```

## Pattern-to-Observation Mapping

| WAL Signature | Observation Type | Constraint Eligible |
|---------------|------------------|---------------------|
| ROLLBACK | failure | Yes (prevented violation) |
| TIMEOUT | failure | Yes (timeout handling needed) |
| RETRY_EXCEEDED | failure | Yes (reliability issue) |
| CONFLICT | pattern | No (coordination, not constraint) |

CONFLICT patterns are logged but not fed to failure-detector for constraint generation,
as they typically require coordination solutions rather than constraints.

## Integration

- **Layer**: Bridge
- **Depends on**: failure-detector, proactive-agent WAL
- **Used by**: proactive-agent

## Adapter Pattern

This skill uses the bridge adapter pattern for proactive-agent integration:

```typescript
import { getAdapter } from '../adapters';

const agent = getAdapter('proactive-agent');
await agent.sendAlert({
  constraint_id: 'wal-failure-detected',
  severity: 'warning',
  message: '3 new failure patterns detected in WAL',
  action: 'Review with /wal-failure-detector patterns',
  timestamp: new Date().toISOString()
});
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| WAL file not found | Error: "WAL file not found: <path>" |
| Invalid WAL format | Error: "Invalid WAL format at line <n>: <reason>" |
| No failures found | Info: "No failure signatures detected in WAL" |
| failure-detector unavailable | Warning: "Cannot feed patterns. failure-detector not responding" |
| Invalid time filter | Error: "Invalid --since value. Use: 1h, 24h, 7d, 30d" |

## Acceptance Criteria

- [x] Scans WAL files and parses entries correctly
- [x] Detects ROLLBACK, RETRY_EXCEEDED, TIMEOUT, CONFLICT signatures
- [x] Feeds new patterns to failure-detector
- [x] Skips already-tracked failures
- [x] Handles CONFLICT as coordination issue (not constraint candidate)
- [x] --since filter works correctly
- [x] Mock adapter integration works
- [x] SKILL.md compliant with MCE limits (< 200 lines body)

## Next Steps

See [Bridge README](../README.md) for layer overview and workflows.

**Verification**: `cd tests && npm test -- --grep "wal-failure-detector"`
