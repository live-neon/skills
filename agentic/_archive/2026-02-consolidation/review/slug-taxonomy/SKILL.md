---
name: slug-taxonomy
version: 1.0.0
description: Manages failure slug naming conventions for consistent observation identification
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, taxonomy, naming]
layer: review
status: active
---

# slug-taxonomy

Manages failure slug naming conventions for consistent observation identification.
Prevents duplicate observations by suggesting canonical slugs and detecting semantic matches.

## Problem Being Solved

When failure-tracker records failures, it needs consistent slug naming. Without a
taxonomy, the same failure could be recorded as `git-force-push-issue`,
`force-push-without-confirmation`, and `git-safety-force-push`—three separate
observations for one pattern.

## Usage

```
/slug-taxonomy suggest "<failure-description>"
/slug-taxonomy list [--category <category>]
/slug-taxonomy merge <old-slug> <new-slug>
/slug-taxonomy validate <slug>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| failure-description | Yes (suggest) | Natural language description of failure |
| category | No (list) | Filter by category prefix |
| old-slug | Yes (merge) | Slug to deprecate |
| new-slug | Yes (merge) | Slug to merge into |
| slug | Yes (validate) | Slug to validate format |

## Taxonomy Categories

| Category | Prefix | Examples |
|----------|--------|----------|
| Git operations | `git-` | `git-force-push`, `git-unsafe-rebase` |
| Testing | `test-` | `test-skipped`, `test-flaky-ignored` |
| Workflow | `workflow-` | `workflow-plan-skipped`, `workflow-approval-bypassed` |
| Security | `security-` | `security-env-exposed`, `security-key-hardcoded` |
| Documentation | `docs-` | `docs-not-updated`, `docs-stale-reference` |
| Code quality | `quality-` | `quality-error-swallowed`, `quality-magic-number` |

**Design Decision (Phase 7)**: Category prefixes are intentionally limited to 6 standard
categories. Custom categories (e.g., `infra-`, `api-`, `performance-`) were considered
but not implemented because:
1. No custom prefix requests during 6 phases of implementation
2. Existing categories cover all observed failure patterns
3. Adding extensibility adds complexity without demonstrated need (YAGNI)

If custom prefixes become necessary, the extension mechanism options are documented in
the Phase 7 plan. For now, observations that don't fit existing categories should use
`quality-` (general code issues) or `workflow-` (process issues).

## Semantic Matching

Uses LLM semantic similarity to suggest existing slugs when new failure is recorded.
"Force pushed to main" should match existing `git-force-push-without-confirmation`.

**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Classification Method**: LLM-based semantic classification (NOT keyword/pattern matching)

## Output

```
SLUG SUGGESTION
---------------
Input: "executed force push without confirmation"

Suggested slug: git-force-push-without-confirmation
Category: git-
Format: valid

Existing matches (semantic similarity >= 0.7):
  - git-force-push (0.87) - MERGE RECOMMENDED
  - git-unsafe-push (0.72)

Action: Use existing slug or create new?
```

## Example

```
/slug-taxonomy suggest "ran git push --force to main without asking"

SLUG SUGGESTION
---------------
Input: "ran git push --force to main without asking"

Suggested slug: git-force-push-without-confirmation
Category: git-
Format: valid

Existing matches:
  - git-force-push (0.87 similarity) - MERGE RECOMMENDED

Recommendation: Merge with existing observation git-force-push
Command: /slug-taxonomy merge git-force-push-without-confirmation git-force-push
```

```
/slug-taxonomy validate "my-custom-slug"

VALIDATION: my-custom-slug
--------------------------
Format: INVALID
Reason: Missing category prefix

Valid prefixes: git-, test-, workflow-, security-, docs-, quality-
Suggested: quality-my-custom-slug (if code quality related)
```

```
/slug-taxonomy merge old-slug new-slug

MERGE COMPLETE
--------------
Deprecated: old-slug
Merged into: new-slug
Observations updated: 3
R count transferred: +3 to new-slug
```

## Integration

- **Layer**: Review
- **Depends on**: failure-tracker (for existing slugs)
- **Used by**: observation-recorder, failure-detector

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid prefix | Error: "Invalid category prefix. Use: git-, test-, workflow-, security-, docs-, quality-" |
| Slug not found (merge) | Error: "Slug not found: <slug>. Cannot merge non-existent slug." |
| Circular merge | Error: "Cannot merge slug into itself." |
| Empty description | Error: "Failure description required for suggestion." |

## Acceptance Criteria

- [ ] Suggests canonical slugs from descriptions
- [ ] Category prefixes enforced on all slugs
- [ ] Semantic matching finds similar existing slugs (threshold >= 0.7)
- [ ] Merge command consolidates duplicate observations
- [ ] R/C/D counts transferred during merge
- [ ] Validate command checks format compliance
- [ ] List command filters by category
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
