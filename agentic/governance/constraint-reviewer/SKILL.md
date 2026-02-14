---
name: constraint-reviewer
version: 1.0.0
description: 90-day review gate for active constraints with event-driven governance
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, governance, review, constraints]
layer: governance
status: active
---

# constraint-reviewer

Implements the 90-day review gate for active constraints. Event-driven governance
means constraints get attention only when needed - no dashboard monitoring required.

**Architectural Decision**: Event-driven (primary), dashboard (secondary).

## Problem Being Solved

Constraints can become stale - the codebase evolves, patterns change, what was once
a critical rule may now be obsolete. Without periodic review, constraints accumulate
like technical debt.

## Usage

```
/constraint-reviewer check <id>
/constraint-reviewer due
/constraint-reviewer schedule
/constraint-reviewer keep <id>
/constraint-reviewer decide <id> <keep|modify|retire>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| check | Yes (id) | Manual review trigger for specific constraint |
| due | - | List constraints due for review (dashboard mode) |
| schedule | - | Show review schedule |
| keep | Yes (id) | Preserve constraint, reset 90-day timer |
| decide | Yes (id, action) | Record review decision (keep/modify/retire) |

## Event-Driven Mode (Primary)

**Workflow**:
1. Constraint reaches 90-day mark AND is dormant (0 violations)
2. Auto-create issue: `docs/issues/governance-alert-YYYY-MM-DD-stale-<id>.md`
3. Issue contains: metrics summary, recommended action, commands
4. Developer responds in normal workflow:
   - `/constraint-reviewer keep <id>` - preserve, reset timer
   - Close issue without action - auto-retire after 7 days
5. No dashboard monitoring required - attention pulled only when needed

## Dashboard Mode (Secondary)

For periodic deep-dives, use `/constraint-reviewer due`:

```
CONSTRAINTS DUE FOR REVIEW
--------------------------

| ID | Name | Age | Violations (90d) | Drift Score |
|----|------|-----|------------------|-------------|
| 1 | git-force-push-safety | 94d | 12 | 0.15 (LOW) |
| 2 | code-review-required | 120d | 0 | 0.45 (MEDIUM) |

Commands:
  /constraint-reviewer check <id>   # Detailed review
  /constraint-reviewer keep <id>    # Preserve and reset
```

## Review Evidence

```
CONSTRAINT REVIEW: git-force-push-safety
----------------------------------------

Age: 94 days (due for review)
State: active

Metrics (last 90 days):
  Violations: 12
  Prevention rate: 91.7%
  False positive rate: 8.3%
  Circuit trips: 2

Source Drift Analysis:
  Files referencing: 3 (unchanged)
  Related code changes: 7 commits
  Breaking changes: 0
  Drift score: 0.15 (LOW)

Recommendation: KEEP (healthy metrics, no drift)

Options:
  1. KEEP active (no changes)
  2. MODIFY (update constraint)
  3. RETIRE (mark obsolete)

Decision: /constraint-reviewer decide git-force-push-safety <1|2|3>
```

## Source Drift Calculation

- Track files mentioned in constraint scope
- Use `git log --since=<created_date>` for commit count
- Detect breaking changes via commit message patterns (BREAKING, !, major:)
- Drift score = (commits × weight) / (age_days × files)

**Weight Calculation**:
- `breaking_weight` = 3.0 for breaking changes (BREAKING, !, major:)
- `refactoring_weight` = 0.2 for maintenance commits (refactor, style, chore, format)
- `normal_weight` = 1.0 for all other commits

**Edge Case Handling**:
- If `files = 0` (constraint references no files): return 1.0 (maximum drift)
- If `age_days = 0` (same-day creation): use 1 day minimum

**Drift Thresholds**:

| Score | Level | Action |
|-------|-------|--------|
| < 0.25 | LOW | No action needed |
| 0.25 - 0.75 | MEDIUM | Flag for review |
| > 0.75 | HIGH | Priority review, consider retirement |

**Refactoring Note**: Large refactors may touch many files without changing behavior.
The 0.2 weight for refactoring commits reduces false positive reviews.

**Known Limitation**: Refactor detection relies on conventional commit prefixes
(refactor, style, chore, format). Commits that are actually refactors but don't
use these prefixes won't be detected. Future enhancement: semantic diff analysis
to detect refactoring patterns regardless of commit message.

## Review Cadence (RG-4 Provisional)

**Status**: RG-4 research pending. 90-day cadence is provisional.

**Why 90 Days?**: Initial default based on quarterly review pattern. Different constraint
types may need different cadences:

| Constraint Type | Suggested Cadence | Rationale |
|-----------------|-------------------|-----------|
| Security/safety | 60 days | Higher risk, more frequent review |
| Code quality | 90 days | Standard quarterly review |
| Style/formatting | 120 days | Lower risk, less frequent |

**Decay Signals** (early warning):
- Dormant >60 days: Flag for early review consideration
- High drift score: Prioritize review
- False positive rate >15%: Trigger immediate review

**Exit Criteria** (RG-4 graduation):
- [ ] RG-4 research complete (`constraint-decay-patterns.md` created)
- [ ] Evaluate constraint-type-aware cadences
- [ ] Document rationale for chosen default cadence
- [ ] Calibrated cadence based on empirical data

## Integration

- **Layer**: Governance
- **Depends on**: governance-state, effectiveness-metrics
- **Used by**: index-generator (review status)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint <id> not found" |
| Already retired | Error: "Constraint <id> already retired" |
| Invalid decision | Error: "Invalid decision. Use: keep, modify, retire" |
| Metrics unavailable | Warning: "Metrics unavailable. Review based on drift only." |

## Acceptance Criteria

- [ ] Event-driven: Auto-creates issue for dormant constraints (primary)
- [ ] Event-driven: `/constraint-reviewer keep <id>` preserves and resets timer
- [ ] Dashboard: Due constraints listed correctly (secondary)
- [ ] Review evidence includes metrics from effectiveness-metrics
- [ ] Source drift analysis functional with LOW/MEDIUM/HIGH thresholds
- [ ] Decision recorded in governance-state
- [ ] RG-4 provisional status documented
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
