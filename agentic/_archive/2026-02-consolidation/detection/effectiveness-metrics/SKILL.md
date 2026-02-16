---
name: effectiveness-metrics
version: 1.0.0
description: Tracks and reports constraint effectiveness metrics
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, detection, metrics, dashboard]
layer: detection
status: active
---

# effectiveness-metrics

Tracks and reports constraint effectiveness metrics.
Measures whether constraints are helping or just adding friction.

## Problem Being Solved

Without metrics, we can't know if the constraint system is working. Are constraints
preventing failures? Are some constraints never triggered (maybe obsolete)?
Are circuits tripping too often (maybe constraint is too strict)?

## Usage

```
/effectiveness-metrics dashboard
/effectiveness-metrics constraint <id>
/effectiveness-metrics trend --days <number>
/effectiveness-metrics alerts
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| constraint | No | Specific constraint ID to analyze |
| --days | No (trend) | Number of days for trend (default: 30) |

## Metrics Tracked

| Metric | Description | Good Range |
|--------|-------------|------------|
| Prevention rate | Violations blocked / (blocked + bypassed) | >= 0.90 |
| False positive rate | D / (C + D) | <= 0.10 |
| Circuit trip rate | Trips / month per constraint | <= 0.5 |
| Override rate | Overrides / violations | <= 0.05 |
| Dormant constraint count | Active with 0 violations in 90d | Monitor |

## Data Sources

| Metric | Source Skill | Events Consumed | Windowing |
|--------|--------------|-----------------|-----------|
| Prevention rate | circuit-breaker | `violation_blocked`, `violation_bypassed` | 30-day rolling |
| False positive rate | failure-tracker | `observation.c_count`, `observation.d_count` | All-time per constraint |
| Circuit trip rate | circuit-breaker | `circuit_tripped` | 30-day rolling |
| Override rate | emergency-override | `override_created`, `override_used` | 30-day rolling |
| Dormant count | constraint-lifecycle | `constraint.last_violation_date` | 90-day threshold |
| Tier progression rate | evidence-tier | `tier_upgraded` | 30-day rolling |

**Event Formats** (emitted by Phase 2 skills):

| Event | Source | Fields |
|-------|--------|--------|
| `violation_blocked` | circuit-breaker | `constraint_id`, `timestamp`, `context` |
| `violation_bypassed` | circuit-breaker | `constraint_id`, `timestamp`, `reason` |
| `circuit_tripped` | circuit-breaker | `constraint_id`, `timestamp`, `trigger_count` |
| `override_created` | emergency-override | `constraint_id`, `user`, `reason`, `expires` |
| `override_used` | emergency-override | `override_id`, `constraint_id`, `timestamp` |
| `observation.c_count` | failure-tracker | `slug`, `count`, `last_confirmed` |
| `observation.d_count` | failure-tracker | `slug`, `count`, `last_disconfirmed` |
| `tier_upgraded` | evidence-tier | `slug`, `from_tier`, `to_tier`, `timestamp` |

Updated per N=2 code review (2026-02-14) - removed false events.d.ts reference.
Updated per N=2 twin review (2026-02-14) - added evidence-tier integration.

## Forward Dependency

`effectiveness-metrics` outputs are consumed by `governance-state` (Phase 4), which
doesn't exist yet. This is a known limitation.

**What Phase 3 delivers**:
- Metrics collection and calculation
- Dashboard output (human-readable)
- Alerts for anomalies

**What Phase 4 adds**:
- Automated governance actions (retire dormant constraints)
- Policy-based threshold management
- Historical trend analysis for decisions

## Output

```
EFFECTIVENESS DASHBOARD
-----------------------

Period: Last 30 days
Active constraints: 12
Total violations: 47

Overall Health: GOOD

Metrics:
  Prevention rate: 94.2% (target >= 90%)
  False positive rate: 6.1% (target <= 10%)
  Circuit trip rate: 0.25/month
  Override rate: 2.1%

Alerts:
  git-safety-force-push: 3 trips this month (elevated)
  code-review-required: 0 violations in 60d (dormant?)

Top performers:
  - plan-approve-implement: 100% prevention, 0 false positives
  - test-before-commit: 98% prevention, 2% false positives
```

## Example

```
/effectiveness-metrics constraint git-safety-force-push

CONSTRAINT METRICS: git-safety-force-push
-----------------------------------------

Period: Last 30 days

Violations: 8
  Blocked: 7 (87.5%)
  Bypassed: 1 (12.5%)

Circuit status: CLOSED
  Trips this month: 3 (elevated)
  Last trip: 2026-02-10

Observation: git-force-push-without-confirmation
  R: 12, C: 8, D: 1
  False positive rate: 11.1% (slightly elevated)

Trend: Stable (no significant change)

Recommendation: Consider refining constraint trigger conditions
to reduce false positives while maintaining prevention rate.
```

```
/effectiveness-metrics trend --days 90

TREND ANALYSIS: 90 Days
-----------------------

Prevention rate:
  Day 1-30:  91.2%
  Day 31-60: 93.8%
  Day 61-90: 94.2%
  Trend: Improving (+3.0%)

False positive rate:
  Day 1-30:  8.5%
  Day 31-60: 7.2%
  Day 61-90: 6.1%
  Trend: Improving (-2.4%)

New constraints added: 4
Constraints retired: 1 (docs-readme-format - obsolete)

Overall: System effectiveness improving over time.
```

```
/effectiveness-metrics alerts

EFFECTIVENESS ALERTS
--------------------

HIGH PRIORITY:
  None

MEDIUM PRIORITY:
  1. git-safety-force-push
     Issue: 3 circuit trips in 30 days (threshold: 0.5/month)
     Suggestion: Review trigger sensitivity

  2. code-review-required
     Issue: 0 violations in 60 days
     Suggestion: Verify constraint still relevant or retire

LOW PRIORITY:
  3. test-coverage-minimum
     Issue: False positive rate 9.8% (near threshold)
     Suggestion: Monitor for next 30 days
```

## Integration

- **Layer**: Detection
- **Depends on**: circuit-breaker, constraint-lifecycle
- **Used by**: governance-state (Phase 4), ARCHITECTURE.md dashboard

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No constraints active | Info: "No active constraints. Nothing to measure." |
| Missing event data | Warning: "Incomplete data for <metric>. Using available events." |
| Constraint not found | Error: "Constraint not found: <id>" |
| Invalid time range | Error: "Invalid days value. Use positive integer." |

## Acceptance Criteria

- [ ] Tracks all specified metrics
- [ ] Dashboard output accurate and readable
- [ ] Per-constraint drill-down works
- [ ] Trend analysis over configurable time
- [ ] Alerts for anomalies (high trips, dormant)
- [ ] Good/warning/bad thresholds configurable
- [ ] Integrates with circuit-breaker for violation data
- [ ] Integrates with constraint-lifecycle for state data
- [ ] Forward dependency on governance-state documented
- [ ] Tests added to skill-behavior.test.ts

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
