# Governance Alert Template

This template is used by `governance-state` when creating alert issue files.

## File Location

`docs/issues/governance-alert-YYYY-MM-DD-<metric>.md`

## Template

```markdown
---
type: governance-alert
metric: <metric-name>
severity: warning | critical
created: <ISO-8601-timestamp>
---

# Governance Alert: <Metric Name> <Exceeded|Warning>

**Metric**: <metric-name>
**Current Value**: <value> (<context>)
**Threshold**: <threshold-description>
**Source**: <source-skill>

## Recommended Action

1. <First action step>
2. <Second action step>
3. <Third action step>

## Related

- Constraint: <constraint-id>
- State file: <path-to-state-file>

---
*For deeper analysis, run `/governance-state dashboard`*
```

## Example: Circuit Trip Rate

```markdown
---
type: governance-alert
metric: circuit-trip-rate
severity: warning
created: 2026-02-14T10:30:00Z
---

# Governance Alert: Circuit Trip Rate Exceeded

**Metric**: circuit-trip-rate
**Current Value**: 5 trips/month (git-force-push-safety)
**Threshold**: >3/month per constraint
**Source**: circuit-breaker

## Recommended Action

1. Review constraint configuration for over-sensitivity
2. Check for legitimate workflow changes triggering trips
3. Consider tuning threshold or constraint parameters

## Related

- Constraint: git-force-push-safety
- Circuit state: `.claude/circuit-state.json`

---
*For deeper analysis, run `/governance-state dashboard`*
```

## Metrics and Thresholds

| Metric | Threshold | Severity |
|--------|-----------|----------|
| circuit-trip-rate | >3/month per constraint | warning |
| override-rate | >5% of violations | warning |
| prevention-rate | <50% | critical |
| false-positive-rate | >10% | warning |
| generation-velocity | <1/week | warning |
| search-latency | >2s average | warning |

## Related

- Skill: `agentic/governance/governance-state/SKILL.md`
- Dashboard: `/governance-state dashboard`
