---
name: staged-quality-gate
version: 1.0.0
description: Incremental quality gates applied per implementation stage
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, quality, gates]
---

# staged-quality-gate

Incremental quality gates applied per implementation stage.
Catches issues early before they compound into later stages.

## Problem Being Solved

Large plans have multiple stages. Running full review at the end is wasteful—
issues in Stage 1 compound into Stage 5. Staged gates catch problems early,
reducing total rework. Evidence: Big-bang review = 2x token cost (measured 2025-10-20).

**Philosophy**: Proportionality principle—early detection prevents cascading failures.

## Usage

```
/staged-quality-gate check --stage <number>
/staged-quality-gate configure --level <quick|standard|thorough>
/staged-quality-gate history
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| --stage | Yes (check) | Stage number to check |
| --level | Yes (configure) | Gate level to set |
| history | No | Show gate results history |

## Gate Levels

| Level | Checks | Blocking |
|-------|--------|----------|
| Quick | Lint, format, tests pass | Yes |
| Standard | + constraint violations, MCE compliance | Yes |
| Thorough | + twin-review for high-risk files | Configurable |

## MCE Thresholds

| File Type | MCE Limit | Source |
|-----------|-----------|--------|
| SKILL.md (documentation) | <= 300 lines | docs/standards/mce.md |
| Code files (.ts, .go) | <= 200 lines | twin-review.md:153-156 |
| Test files | <= 200 lines | Same as code |
| Implementation plans | No hard limit | Phase 2 precedent |

## Output

```
QUALITY GATE: Stage 3
---------------------

Level: Standard

Checks:
  Tests pass (45/45)
  Lint clean
  No constraint violations
  MCE compliance: 2 files exceed limits
    - src/memory/search.ts (342 lines, limit 200)
    - tests/integration.test.ts (315 lines, limit 200)

Status: BLOCKED

Fix MCE violations before proceeding to Stage 4.
```

## Example

```
/staged-quality-gate check --stage 2

QUALITY GATE: Stage 2
---------------------

Level: Standard

Checks:
  Tests pass (23/23)
  Lint clean
  No constraint violations
  MCE compliance: All files within limits

Status: PASSED

Proceed to Stage 3.
```

```
/staged-quality-gate configure --level thorough

CONFIGURATION UPDATED
---------------------

Gate Level: Thorough

Checks enabled:
  - Lint and format
  - Tests pass
  - Constraint violations
  - MCE compliance
  - Twin-review for high-risk files (NEW)

Blocking behavior:
  - All checks blocking except twin-review (configurable)

Note: Thorough level increases review time but catches more issues.
```

```
/staged-quality-gate history

GATE HISTORY
------------

Stage 1: PASSED (Quick) - 2026-02-13 10:15
  - All checks green

Stage 2: BLOCKED -> PASSED (Standard) - 2026-02-13 11:30
  - Initially blocked: MCE violation in utils.ts
  - Fixed: Split into utils.ts + helpers.ts
  - Re-check: PASSED

Stage 3: IN PROGRESS
```

## Integration

- **Layer**: Review
- **Depends on**: constraint-enforcer
- **Used by**: CI/CD, staged implementation workflows

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid stage number | Error: "Stage <n> not found in current plan." |
| No plan active | Error: "No active plan. Create plan first." |
| Tests failing | BLOCKED: "Tests failing: <count> failures. Fix before proceeding." |
| MCE violation | BLOCKED: "MCE violation: <file> exceeds <limit> lines." |

## Acceptance Criteria

- [ ] Checks per-stage (not entire plan)
- [ ] MCE compliance checked with correct thresholds
- [ ] Constraint violations detected
- [ ] Blocking issues prevent stage progression
- [ ] Non-blocking issues reported as warnings
- [ ] History tracks all gate results
- [ ] Level configuration persists
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
