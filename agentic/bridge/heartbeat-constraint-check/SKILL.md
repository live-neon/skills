---
name: heartbeat-constraint-check
version: 1.0.0
description: Periodic constraint health verification as part of proactive-agent heartbeat
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, bridge, heartbeat, health, proactive]
layer: bridge
status: active
---

# heartbeat-constraint-check

Perform periodic constraint health verification as part of proactive-agent's heartbeat.
This skill runs shallow health checks on active constraints to detect drift or
staleness before they cause issues.

## Problem Being Solved

Constraints can become stale or drift from code changes without triggering violations.
governance-state handles deep reviews (90-day cadence), but heartbeat-constraint-check
provides frequent shallow checks to catch issues early.

## Usage

```
/heartbeat-constraint-check verify                 # Check all active constraints
/heartbeat-constraint-check verify --quick         # Quick check (sampling)
/heartbeat-constraint-check verify <constraint-id> # Check specific constraint
/heartbeat-constraint-check status                 # Health summary
/heartbeat-constraint-check schedule               # Show check schedule
```

## Example

```bash
# Run quick health check on constraints
/heartbeat-constraint-check verify --quick

# Check a specific constraint's health
/heartbeat-constraint-check verify plan-approve-implement
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: verify, status, schedule |
| constraint-id | No | Specific constraint to check (for verify) |
| --quick | No | Sample 20% of constraints for faster check |
| --severity | No | Filter alerts by severity: critical, warning, info |
| --export | No | Export health report as JSON |

## Health Checks

| Check | Frequency | Criteria | On Failure |
|-------|-----------|----------|------------|
| File existence | Every heartbeat | Constraint YAML file exists | CRITICAL |
| Schema validity | Every heartbeat | YAML parses without errors | CRITICAL |
| Scope relevance | Daily | At least one scope file exists | WARNING |
| Effectiveness | Weekly | Prevention rate > 50% | WARNING |

## Health Status Levels

| Status | Meaning | Alert |
|--------|---------|-------|
| healthy | All checks pass | None |
| warning | Scope or effectiveness issue | WARNING alert |
| critical | File missing or invalid schema | CRITICAL alert |

## Output

### Verify All Constraints

```
/heartbeat-constraint-check verify

CONSTRAINT HEALTH CHECK
=======================

Constraints checked: 15
Execution time: 245ms

Health Summary:
  Healthy:  12 (80%)
  Warning:   2 (13%)
  Critical:  1 (7%)

Issues Found:

[CRITICAL] obsolete-api-constraint
  Problem: Constraint file not found
  Path: constraints/obsolete-api-constraint.yaml
  Action: Remove from registry or restore file

[WARNING] legacy-auth-check
  Problem: Scope drift detected
  Missing files: src/auth/legacy-handler.ts (deleted 2026-02-10)
  Action: Update scope or retire constraint

[WARNING] test-coverage-minimum
  Problem: Effectiveness below threshold
  Prevention rate: 42% (threshold: 50%)
  Action: Review trigger conditions or retire

Next check: 2026-02-14T16:00:00Z (in 5 minutes)
```

### Quick Check (Sampling)

```
/heartbeat-constraint-check verify --quick

QUICK HEALTH CHECK (20% sample)
===============================

Constraints sampled: 3 of 15
Execution time: 52ms

Sampled constraints:
  - git-safety-protocol: healthy
  - plan-approve-implement: healthy
  - legacy-auth-check: WARNING (scope drift)

Quick check complete. For full check: /heartbeat-constraint-check verify
```

### Check Specific Constraint

```
/heartbeat-constraint-check verify plan-approve-implement

CONSTRAINT HEALTH: plan-approve-implement
=========================================

Overall status: HEALTHY

Checks:
  [PASS] File exists: constraints/plan-approve-implement.yaml
  [PASS] Schema valid: All required fields present
  [PASS] Scope relevant: 3/3 scope files exist
  [PASS] Effectiveness: 94% prevention rate (threshold: 50%)

Details:
  Last violation: 2026-02-12T14:30:00Z
  Last review: 2026-02-01T10:00:00Z
  Days until next review: 76

No action required.
```

### Health Status Summary

```
/heartbeat-constraint-check status

HEALTH STATUS SUMMARY
=====================

Last check: 2026-02-14T15:55:00Z
Next check: 2026-02-14T16:00:00Z

Trend (last 7 days):
  Day     | Healthy | Warning | Critical
  --------|---------|---------|----------
  Feb 14  |   12    |    2    |    1
  Feb 13  |   13    |    1    |    1
  Feb 12  |   14    |    1    |    0
  Feb 11  |   14    |    1    |    0
  Feb 10  |   14    |    1    |    0
  Feb 09  |   14    |    1    |    0
  Feb 08  |   15    |    0    |    0

Issues by type:
  - File missing: 1 constraint
  - Scope drift: 1 constraint
  - Low effectiveness: 1 constraint

Recommendations:
  1. Investigate obsolete-api-constraint (critical)
  2. Review legacy-auth-check scope (warning)
```

### Show Schedule

```
/heartbeat-constraint-check schedule

CHECK SCHEDULE
==============

Heartbeat interval: 5 minutes

Check frequencies:
  - File existence: Every heartbeat
  - Schema validity: Every heartbeat
  - Scope relevance: Daily (00:00 UTC)
  - Effectiveness: Weekly (Sunday 00:00 UTC)

Next scheduled checks:
  - Heartbeat: 2026-02-14T16:00:00Z (in 5 minutes)
  - Daily scope: 2026-02-15T00:00:00Z (in 8 hours)
  - Weekly effectiveness: 2026-02-16T00:00:00Z (in 32 hours)

Configuration: HEARTBEAT_INTERVAL=5m (env variable)
```

## Proactive-Agent Integration

Heartbeat configuration for proactive-agent:

| Setting | Value | Description |
|---------|-------|-------------|
| interval | 5m | Check frequency (configurable) |
| check_type | shallow | Heartbeat uses shallow checks |
| command | /heartbeat-constraint-check verify --quick | Default command |
| alert_levels | critical, warning | Send alerts for these |

Environment variable `HEARTBEAT_INTERVAL` controls frequency (default: 5m).

## Integration

- **Layer**: Bridge
- **Depends on**: constraint-enforcer, governance-state
- **Used by**: proactive-agent

## Adapter Pattern

This skill uses the bridge adapter pattern for proactive-agent integration:

```typescript
import { getAdapter } from '../adapters';

const agent = getAdapter('proactive-agent');
await agent.sendHealthSummary({
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  execution_time_ms: 245,
  counts: { total: 15, healthy: 12, warning: 2, critical: 1 },
  constraints: healthResults,
  next_check: nextCheckTimestamp
});
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No constraints found | Info: "No active constraints to check" |
| Constraint not found | Error: "Constraint not found: <id>" |
| governance-state unavailable | Warning: "Cannot check effectiveness. Using cached data." |
| Invalid severity filter | Error: "Invalid severity. Use: critical, warning, info" |

## Acceptance Criteria

- [x] Performs file existence checks
- [x] Performs schema validity checks
- [x] Detects scope drift (missing scope files)
- [x] Detects low effectiveness (below 50% threshold)
- [x] Quick check samples 20% of constraints
- [x] Produces alerts for warning/critical issues
- [x] Shows health trend over time
- [x] Mock adapter integration works
- [x] SKILL.md compliant with MCE limits (< 200 lines body)

## Next Steps

See [Bridge README](../README.md) for layer overview and workflows.

**Verification**: `cd tests && npm test -- --grep "heartbeat-constraint-check"`
