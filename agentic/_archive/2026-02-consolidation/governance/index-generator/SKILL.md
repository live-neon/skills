---
name: index-generator
version: 1.0.0
description: Generate INDEX.md dashboards for constraint and observation visibility
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, governance, dashboard, index]
layer: governance
status: active
---

# index-generator

Generate INDEX.md dashboards for constraint/observation visibility. These dashboards
provide navigable overviews of the system state for human review.

## Problem Being Solved

With dozens of constraints and observations, humans need dashboards. INDEX.md files
provide navigable overviews of the system state with health alerts and quick links.

## Usage

```
/index-generator generate <directory>
/index-generator refresh
/index-generator schedule --cron "<expression>"
```

## Example

```bash
# Generate index for constraints directory
/index-generator generate constraints/

# Refresh all indexes
/index-generator refresh
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| generate | Yes (dir) | Generate index for directory (constraints/ or observations/) |
| refresh | - | Regenerate all indexes |
| schedule | No | Set up scheduled regeneration (cron expression) |
| --strict | No | Fail on parse errors instead of skipping (for CI/CD) |

## Generated Sections

Each INDEX.md includes:
- Constraint/observation summary by state
- Recent activity timeline
- Health alerts
- Quick links to individual files

## Output

Generated `docs/constraints/INDEX.md`:

```markdown
# Constraints Index

Generated: 2026-02-14T10:00:00Z

## Summary

| State | Count | Health |
|-------|-------|--------|
| active | 12 | 10 healthy, 2 alerts |
| retiring | 2 | - |
| draft | 3 | - |

## Active Constraints

| Constraint | Age | Prevention | FP Rate | Status |
|------------|-----|------------|---------|--------|
| git-force-push-safety | 94d | 91.7% | 8.3% | Due for review |
| test-before-commit | 45d | 98.2% | 1.2% | Healthy |

## Alerts

- git-force-push-safety: Due for 90-day review
- code-review-required: Dormant (0 violations in 60d)

## Recent Activity

- 2026-02-10: git-force-push transitioned to retiring
- 2026-02-08: test-coverage activated
```

## Observation Index

Generated `docs/observations/INDEX.md`:

```markdown
# Observations Index

Generated: 2026-02-14T10:00:00Z

## Summary by Tier

| Tier | Count | Status |
|------|-------|--------|
| Established (N>=5) | 8 | Check eligibility |
| Strong (N>=3) | 12 | Ready for constraints |
| Emerging (N=2) | 15 | Track closely |
| Weak (N=1) | 23 | Monitor |

## Recent Observations

| Observation | N-Count | Topic | Last Updated |
|-------------|---------|-------|--------------|
| git-hook-bypass | N=5 | git, safety | 2026-02-13 |
| test-coverage-gap | N=3 | testing | 2026-02-12 |
```

## Integration

- **Layer**: Governance
- **Depends on**: governance-state, constraint-reviewer
- **Used by**: Human navigation, CI/CD dashboards

## Failure Modes

| Condition | Default Behavior | With --strict |
|-----------|------------------|---------------|
| Directory not found | Error: "Directory not found: <path>" | Same |
| No constraints found | Warning: "No constraints found. Empty index generated." | Same |
| Parse error | Warning: "Failed to parse <file>. Skipping." | **Error + exit 1** |

**--strict Mode**: For CI/CD pipelines, use `--strict` to fail on any parse error.
This catches constraint file corruption early rather than silently excluding files.

## Acceptance Criteria

- [ ] Creates valid markdown INDEX.md
- [ ] Constraint index shows state distribution
- [ ] Observation index shows tier distribution
- [ ] Health alerts included for due reviews and dormant constraints
- [ ] Recent activity timeline functional
- [ ] Scheduled regeneration configurable
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
