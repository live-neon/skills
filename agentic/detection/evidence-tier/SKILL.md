---
name: evidence-tier
version: 1.0.0
description: Classifies evidence strength to prioritize constraint generation
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, detection, evidence, classification]
---

# evidence-tier

Classifies evidence strength to prioritize constraint generation.
Not all observations are equal—N=1 is weak, N>=3 is strong.

## Problem Being Solved

Not all observations are equal. N=1 is weak, N>=3 is strong. Evidence tier
affects eligibility calculations and review prioritization. Without tiers,
all failures are treated equally regardless of recurrence.

## Usage

```
/evidence-tier classify <observation-slug>
/evidence-tier list [--tier <weak|emerging|strong|established>]
/evidence-tier promote <observation-slug>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| observation-slug | Yes (classify/promote) | Slug of observation to classify/promote |
| --tier | No (list) | Filter by tier |

## Tier Definitions

| Tier | N-Count | Interpretation | Action |
|------|---------|----------------|--------|
| Weak | N=1 | Single occurrence, may be noise | Monitor |
| Emerging | N=2 | Pattern forming, not yet confirmed | Track closely |
| Strong | N>=3 | Validated pattern | Check eligibility formula |
| Established | N>=5 | Well-established pattern | Priority enforcement |

**Note**: Reaching STRONG tier is necessary but not sufficient for constraint eligibility.
See Eligibility Formula below for full requirements.

## R/C/D Counters

Evidence strength considers more than raw count:

| Counter | Meaning | Effect on Tier |
|---------|---------|----------------|
| R (Recurrence) | Times failure observed | Primary tier driver |
| C (Confirmations) | Human confirmations | Increases confidence |
| D (Disconfirmations) | Human rejections | Decreases confidence |

**Eligibility Formula** (ALL conditions required):
```
R >= 3              # Recurrence threshold (STRONG tier)
AND C >= 2          # Confirmation threshold
AND D/(C+D) < 0.2   # Disconfirmation ratio below 20%
AND sources >= 2    # Source diversity (files/sessions)
AND users >= 2      # User diversity (unique confirmers)
```

Updated per N=2 code review (2026-02-14) to reconcile tier table, formula, and examples.

## Output

```
EVIDENCE TIER: git-force-push-without-confirmation
--------------------------------------------------

Current: STRONG (N=5)
  R: 5 (recurrences)
  C: 3 (confirmations)
  D: 0 (disconfirmations)

Source diversity: 3 files, 2 sessions
User diversity: 2 unique users

Constraint eligible: Yes (R>=3, C>=2, sources>=2, users>=2)
Priority: HIGH (N>=5 established)
```

## Example

```
/evidence-tier classify git-force-push

EVIDENCE TIER: git-force-push
-----------------------------

Current: EMERGING (N=2)
  R: 2 (recurrences)
  C: 1 (confirmations)
  D: 0 (disconfirmations)

Source diversity: 2 files, 1 session
User diversity: 1 unique user

Constraint eligible: No
  - Missing: R>=3 (need 1 more recurrence)
  - Missing: C>=2 (need 1 more confirmation)
  - Missing: users>=2 (need 1 more unique user)

Next recurrence will upgrade to: STRONG
```

```
/evidence-tier list --tier strong

STRONG TIER OBSERVATIONS
------------------------

1. git-force-push-without-confirmation
   R: 5, C: 3, D: 0
   Constraint: Yes (active)

2. test-skipped-without-reason
   R: 4, C: 2, D: 1
   Constraint: Yes (active)

3. workflow-approval-bypassed
   R: 3, C: 2, D: 0
   Constraint: No (pending generation)

Total: 3 strong observations
Constraint-eligible: 3
With active constraints: 2
```

```
/evidence-tier promote git-force-push

MANUAL PROMOTION: git-force-push
--------------------------------

Previous tier: EMERGING (N=2)
New tier: STRONG (N=3)

R counter: 2 -> 3 (manually incremented)

Note: Manual promotion should be used sparingly.
Prefer natural recurrence detection for accurate evidence.

Constraint eligibility: Still requires C>=2
```

## Integration

- **Layer**: Detection
- **Depends on**: observation-recorder
- **Used by**: constraint-generator, review-selector

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Observation not found | Error: "Observation not found: <slug>" |
| Already at max tier | Warning: "Already ESTABLISHED tier. No promotion needed." |
| Invalid tier filter | Error: "Invalid tier: <tier>. Use: weak, emerging, strong, established" |

## Acceptance Criteria

- [ ] Classifies observations into correct tiers
- [ ] Tier thresholds match specification (N=1, N=2, N>=3, N>=5)
- [ ] R/C/D counters tracked and displayed
- [ ] Source and user diversity tracked
- [ ] Constraint eligibility calculated correctly
- [ ] List command filters by tier
- [ ] Promote command increments R counter
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
