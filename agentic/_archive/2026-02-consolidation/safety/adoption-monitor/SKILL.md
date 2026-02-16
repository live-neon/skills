---
name: adoption-monitor
version: 1.0.0
description: Monitor system adoption and temporal error patterns
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, safety, adoption, monitoring]
layer: safety
status: active
---

# adoption-monitor

Monitor system adoption and temporal error patterns. Tracks temporal patterns to
distinguish adoption friction (temporary) from systemic issues (permanent).

## Usage

```
/adoption-monitor status
/adoption-monitor constraint <id>
/adoption-monitor anomalies --days <n>
/adoption-monitor trend <metric>
```

## Example

```bash
# Check overall adoption status
/adoption-monitor status

# Analyze a specific constraint's adoption
/adoption-monitor constraint plan-approve-implement
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| constraint-id | Yes (for constraint) | Specific constraint to analyze |
| --days | No | Time range for anomaly detection (default: 7) |
| metric | Yes (for trend) | Metric to analyze (violation-rate, override-rate) |

## Metrics Tracked

- Constraint violation rate over time
- Circuit trip frequency trends
- Override usage patterns
- New constraint adoption curves

## Adoption Phases

| Phase | Duration | Characteristics | Action |
|-------|----------|-----------------|--------|
| LEARNING | Days 1-7 | High violation rate, expected | Monitor |
| STABILIZING | Days 8-21 | Decreasing violations | Track |
| MATURE | Days 22+ | Stable, low violation rate | Maintain |
| PROBLEMATIC | Any | Violations increasing or sustained high | **Escalate** |

**PROBLEMATIC Escalation**: When a constraint enters PROBLEMATIC phase:
1. Auto-create governance alert: `docs/issues/governance-alert-YYYY-MM-DD-problematic-<id>.md`
2. Notify via governance-state event system
3. Recommend human review within 48 hours

## Commands

```
/adoption-monitor status                   # Overall adoption health
/adoption-monitor constraint git-push      # Single constraint adoption
/adoption-monitor anomalies --days 7       # Recent anomalies
/adoption-monitor trend violation-rate     # Trend analysis
```

## Output

**Constraint Adoption**:
```
ADOPTION MONITOR: git-force-push-safety
───────────────────────────────────────

Constraint Age: 14 days
Adoption Phase: STABILIZING

Violation Rate (7-day windows):
  Week 1: 15 violations (expected - learning curve)
  Week 2: 4 violations (improving)

Trend: HEALTHY (82% reduction)

Anomalies: None

Recommendation: Continue monitoring, no intervention needed
```

**System Status**:
```
ADOPTION OVERVIEW
─────────────────

Active Constraints: 12

By Phase:
  LEARNING: 2 (new constraints, monitoring)
  STABILIZING: 3 (improving trends)
  MATURE: 6 (stable, healthy)
  PROBLEMATIC: 1 (requires attention)

Alerts:
  - test-coverage-constraint: Violations increasing (review recommended)

Overall Health: GOOD (92% healthy adoption)
```

**Anomaly Report**:
```
ANOMALY DETECTION (Last 7 Days)
───────────────────────────────

Detected: 2 anomalies

1. test-coverage-constraint
   Type: Violation spike
   Date: 2026-02-12
   Details: 8 violations in 24h (baseline: 1/day)
   Possible cause: New team member, missing onboarding

2. circuit-breaker-trips
   Type: Unusual frequency
   Date: 2026-02-13
   Details: 3 trips in 4 hours
   Possible cause: External API instability
```

## Integration

- **Layer**: Safety
- **Depends on**: effectiveness-metrics
- **Used by**: Governance dashboards, health monitoring

## Alert Fatigue Monitoring

Event-driven systems risk alert fatigue when too many issues are generated.
adoption-monitor tracks issue lifecycle to detect this:

| Metric | Warning Threshold | Description |
|--------|-------------------|-------------|
| time-to-close | >7 days average | Issues taking too long to close |
| open-issues | >10 unresolved | Too many open governance issues |
| ignore-rate | >20% | Issues closed without action |

**Alert Modes**:

| Mode | Behavior | When Used |
|------|----------|-----------|
| per-event | Create issue for each alert | Default (normal operation) |
| digest | Weekly summary issue | When alert fatigue detected |

**Automatic Mode Switching**:
1. If time-to-close trends upward for 3 consecutive weeks → switch to digest mode
2. In digest mode: consolidate week's alerts into single `governance-digest-YYYY-WW.md`
3. Digest includes: all alerts, grouped by type, with aggregate metrics
4. Return to per-event mode when time-to-close drops below threshold

**Digest Mode Command**:
```
/adoption-monitor set-mode digest    # Force digest mode
/adoption-monitor set-mode per-event # Return to per-event mode
/adoption-monitor mode               # Show current mode
```

**Early Warning**: If time-to-close trends upward for 3 consecutive weeks,
auto-switch to digest mode and log: "Alert fatigue detected. Switching to weekly digest."

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Insufficient data | Report confidence level, defer judgment |
| Missing metrics | Warning with data gap notification |
| Anomaly detected | Create alert, don't auto-intervene |
| Trend unclear | Report UNCERTAIN, request more time |

## Acceptance Criteria

- [ ] Tracks temporal patterns accurately
- [ ] Anomaly detection functional
- [ ] Trend analysis accurate
- [ ] Phase classification correct
- [ ] Alerts generated for PROBLEMATIC phase

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to Safety layer table if new skill
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
