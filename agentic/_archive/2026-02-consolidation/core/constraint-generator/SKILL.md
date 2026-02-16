---
name: constraint-generator
version: 1.0.0
description: Generate constraint candidates from eligible failure observations
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, constraint]
layer: core
status: active
---

# constraint-generator

Automatically generate constraint candidates from failure observations that meet
eligibility criteria. This skill transforms validated failure patterns into
enforceable constraints that prevent recurrence.

## Semantic Classification

This skill uses **LLM-based semantic similarity** for related failure detection,
NOT pattern matching. Two failures with different wording but the same root cause
should be recognized as related and potentially consolidated.

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach.

## Usage

```
/constraint-generator scan [--eligible-only]
/constraint-generator generate <observation-slug>
/constraint-generator preview <observation-slug>
/constraint-generator status
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: scan, generate, preview, status |
| observation-slug | Yes* | Observation to generate from (*for generate/preview) |
| --eligible-only | No | Only show observations meeting eligibility criteria |
| --dry-run | No | Preview constraint without creating file |
| --skip-severity | No | Skip severity-tagger integration (use default: IMPORTANT) |
| --skip-framing | No | Skip positive-framer transformation |

## Example

```bash
# Scan for eligible observations
/constraint-generator scan --eligible-only

# Preview a constraint without creating
/constraint-generator preview git-force-push-without-confirmation

# Generate a constraint from eligible observation
/constraint-generator generate git-force-push-without-confirmation
```

## Eligibility Criteria

An observation is eligible for constraint generation when ALL criteria are met:

| Criterion | Requirement | Purpose |
|-----------|-------------|---------|
| Type | `type: failure` | Only failures become constraints (not patterns) |
| Recurrence (R) | R ≥ 3 | Pattern must repeat to warrant enforcement |
| Confirmations (C) | C ≥ 2 | Human validation required |
| Unique Users | c_unique_users ≥ 2 | Prevents individual bias (from RG-5) |
| Sources | sources ≥ 2 | Must occur in different contexts |

**Constraint Gate**: Pattern observations (`type: pattern`) are **never** eligible,
regardless of their R/C counts. This is a hard-coded exclusion—the single `type`
field is the source of truth for constraint eligibility.

## Output

**See `EXAMPLES.md` for detailed output examples.**

Brief summaries:

| Command | Output |
|---------|--------|
| `scan` | Lists eligible and ineligible observations with reasons |
| `preview` | Shows proposed constraint with frontmatter, scope, actions |
| `generate` | Creates draft constraint file, shows processing applied |
| `status` | Shows scan totals, eligibility summary, recent activity |

## Constraint File Format

Generated constraints are stored in `docs/constraints/draft/`:

```markdown
---
id: git-safety-force-push
severity: CRITICAL
status: draft
scope: "Actions that force-push to remote repositories or overwrite remote history"
intent: destructive
created: 2026-02-13
source_observation: docs/observations/failures/git-force-push-without-confirmation.md
r_count: 5
c_count: 3
c_unique_users: 2
auto_generated: true
generator_version: 1.0.0
---

# Git Safety: Force Push

Always request explicit user confirmation before executing force push operations.

## Semantic Scope

Actions matching this constraint include:
- Force pushing to any remote branch (git push --force, git push -f)
- Overwriting remote history with local changes
- Using --force-with-lease without understanding implications
- Any operation that could lose commits on remote

The LLM evaluates action INTENT, not surface commands. "git push -f" and
"git push --force" are semantically identical. The constraint matches based
on the effect (overwriting remote history), not the specific command syntax.

## Required Actions

1. Present consequences to user (commits will be overwritten)
2. List affected commits that will be lost on remote
3. Request explicit "yes" confirmation with reason
4. Log the decision and reason to audit trail

## Evidence

Generated from failure observation with:
- 5 recurrences across 3 sources
- 3 human confirmations from 2 unique users
- 0 disconfirmations

See source observation for detailed evidence:
docs/observations/failures/git-force-push-without-confirmation.md

## Changelog

- 2026-02-13: Auto-generated from observation (draft)
```

## Integration

- **Layer**: Core
- **Depends on**:
  - failure-tracker (reads observations)
  - severity-tagger (classifies constraint severity)
  - positive-framer (transforms negative rules to positive guidance)
- **Used by**: constraint-lifecycle (manages generated constraints)

## Directory Structure

```
docs/
├── observations/
│   └── failures/           # Source observations
│       └── <slug>.md
└── constraints/
    ├── draft/              # Generated constraints (pending review)
    │   └── <id>.md
    ├── active/             # Enforced constraints
    │   └── <id>.md
    ├── retiring/           # Sunset period
    │   └── <id>.md
    └── retired/            # Historical reference
        └── <id>.md
```

## Generation Process

When generating a constraint:

1. **Validate Eligibility**: Check R≥3, C≥2, sources≥2, c_unique_users≥2, type=failure
2. **Extract Root Cause**: Analyze failure description and evidence
3. **Classify Severity**: Call severity-tagger on the failure pattern
4. **Frame Positively**: Call positive-framer to create actionable guidance
5. **Generate Scope**: Create semantic scope from failure evidence
6. **Write Constraint**: Create markdown file in `docs/constraints/draft/`
7. **Update Observation**: Add `constraint_generated` field to source observation

## Constraint ID Generation

Constraint IDs are derived from observation slugs with category prefixes:

| Failure Type | Prefix | Example |
|-------------|--------|---------|
| Git operations | git-safety- | git-safety-force-push |
| Testing | test- | test-before-commit |
| Workflow | workflow- | workflow-plan-approval |
| Security | security- | security-credential-handling |
| Code quality | quality- | quality-error-handling |

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Observation not found | Error: "Observation not found: <slug>" |
| Observation not eligible | Error: "Not eligible: R=X (need ≥3), C=Y (need ≥2)" |
| Pattern observation | Error: "Pattern observations cannot generate constraints" |
| Constraint already exists | Warning: "Constraint already exists for this observation" |
| severity-tagger unavailable | Uses default IMPORTANT, logs warning |
| positive-framer unavailable | Uses original wording, logs warning |
| Draft directory not writable | Error: "Cannot write to constraints directory" |

## Semantic Scope Generation

The semantic scope describes what actions match the constraint. It's generated
from failure evidence using LLM analysis:

1. **Extract Actions**: Pull action descriptions from each occurrence
2. **Identify Commonality**: Find the semantic thread connecting failures
3. **Generalize Scope**: Create scope that covers similar future actions
4. **Add Examples**: Include specific examples from evidence

Example scope generation:

```
Occurrences:
  1. "Executed git push --force origin main"
  2. "Used git push -f to overwrite feature branch"
  3. "Ran git push --force-with-lease without checking"

Generated Scope:
  "Actions that force-push to remote repositories or overwrite remote history"

Examples derived:
  - git push --force
  - git push -f
  - git push --force-with-lease
  - Overwriting remote history
```

## Rollback

If a constraint is generated incorrectly:

1. Delete the draft constraint file
2. Remove `constraint_generated` field from source observation
3. Optionally disconfirm (D+1) the observation if it was a false positive

## Acceptance Criteria

- [x] Scans observations for eligibility
- [x] Only generates when R≥3 AND C≥2 AND sources≥2 AND c_unique_users≥2
- [x] Filters out pattern observations (type: pattern)
- [x] Creates draft constraint with correct format
- [x] Uses severity-tagger to assign severity
- [x] Uses positive-framer for rule transformation
- [x] Links back to source observation
- [x] Updates observation with constraint_generated field
- [x] Generates semantic scope from failure evidence
- [x] Handles missing dependencies gracefully (fallback defaults)

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
