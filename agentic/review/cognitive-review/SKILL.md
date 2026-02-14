---
name: cognitive-review
version: 1.0.0
description: Spawns cognitive modes (Opus 4/4.1/Sonnet 4.5) for specialized N=3 analysis
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, cognitive, analysis]
---

# cognitive-review

Spawns cognitive modes for specialized analysis (N=3 internal review).
Each mode brings a different analytical perspective to the same content.

**Existing Workflow Reference**: `docs/workflows/cognitive-review.md`

## Problem Being Solved

Different analytical perspectives catch different issues. A single reviewer
may miss architectural conflicts or implementation gaps. Cognitive modes
provide systematic coverage: conflict detection, restructuring, and execution.

## Usage

```
/cognitive-review <file-or-plan>
/cognitive-review <file> --mode <analyst|transformer|operator>
/cognitive-review --collect <session-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file-or-plan | Yes | Path to file or plan to review |
| --mode | No | Single mode (default: all 3) |
| --collect | No | Collect results from session |

## Cognitive Modes

| Mode | Model ID | Workflow Name | Perspective |
|------|----------|---------------|-------------|
| Analyst | claude-opus-4 | Opus 4 | "Here's what conflicts" - contradiction detection |
| Transformer | claude-opus-4-1 | Opus 4.1 | "Here's how to restructure" - architecture improvement |
| Operator | claude-sonnet-4-5 | Sonnet 4.5 (also "Opus 3") | "Here's how to implement" - practical execution |

**Note**: The workflow document `cognitive-review.md` uses "Opus 3" to refer to
Sonnet 4.5 in some contexts. These are equivalent.

## Same Prompt Principle (CRITICAL)

From `docs/workflows/cognitive-review.md` lines 58-68:

All agents receive the **identical prompt** - no custom prompts per agent.
The differentiation comes from the model's inherent perspective, not prompt variation.

This ensures:
- Valid comparison across modes
- No bias introduced by prompt differences
- Reproducible results

## Workflow Mandates

| Mandate | Source | Enforcement |
|---------|--------|-------------|
| Same Prompt Principle | cognitive-review.md:58-68 | Identical prompts to all modes |
| Read-only mode | review.md:28-42 | Modes MUST NOT modify files |
| Scout manifest flow | cognitive-review.md:88-106 | Context file is a manifest |

## Output

```
COGNITIVE REVIEW: src/auth/login.ts
-----------------------------------

Context Normalized: norm-2026-02-13-003
Files: 2 (2,100 tokens)
Prompt Hash: sha256:abc123 (identical for all modes)

Spawning cognitive modes...
  Analyst (claude-opus-4) - SPAWNED
  Transformer (claude-opus-4-1) - SPAWNED
  Operator (claude-sonnet-4-5) - SPAWNED

Results will be collected at:
  /cognitive-review --collect analyst-001,transformer-002,operator-003
```

## Example

```
/cognitive-review docs/plans/2026-02-13-auth-migration.md

COGNITIVE REVIEW: docs/plans/2026-02-13-auth-migration.md
---------------------------------------------------------

Context Normalized: norm-2026-02-13-015
Files: 1 (1,450 tokens)
Prompt Hash: sha256:def456

Spawning cognitive modes...
  Analyst (claude-opus-4) - SPAWNED
  Transformer (claude-opus-4-1) - SPAWNED
  Operator (claude-sonnet-4-5) - SPAWNED

Status: RUNNING
Estimated completion: 8-12 minutes

Collect results: /cognitive-review --collect a-015,t-015,o-015
```

```
/cognitive-review --collect a-015,t-015,o-015

COGNITIVE REVIEW RESULTS
------------------------

## Analyst (Opus 4) - "What conflicts"

Findings:
1. [Important] Migration timeline conflicts with Q2 deadline
2. [Minor] Session handling inconsistent between steps 3 and 5

## Transformer (Opus 4.1) - "How to restructure"

Findings:
1. [Important] Consider parallel migration tracks for auth providers
2. [Minor] Database schema could be simplified

## Operator (Sonnet 4.5) - "How to implement"

Findings:
1. [Important] Step 4 needs rollback procedure
2. [Minor] Test coverage plan should include edge cases

---
Summary: 3 Important, 3 Minor across 3 modes
Prompt verification: All modes received identical prompt (sha256:def456)
```

## Integration

- **Layer**: Review
- **Depends on**: prompt-normalizer, context-packet
- **Used by**: review-selector, workflow skills

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Mode unavailable | Error: "Model <model-id> unavailable. Check API access." |
| Prompt mismatch | Error: "Prompt hash mismatch. Same Prompt Principle violated." |
| Context too large | Error: "Context exceeds token budget. Reduce scope." |

## Acceptance Criteria

- [ ] Spawns all 3 modes with identical prompts (Same Prompt Principle)
- [ ] Modes use correct model variants (Opus 4, Opus 4.1, Sonnet 4.5)
- [ ] Prompt hash verified across all modes
- [ ] Results aggregated with source attribution
- [ ] Read-only mode enforced
- [ ] Single mode option works
- [ ] Results collection aggregates findings
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
