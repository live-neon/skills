---
name: progressive-loader
version: 1.0.0
description: Defer loading of low-priority documentation to reduce context usage
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, context, loading, progressive]
---

# progressive-loader

Defer loading of low-priority documentation to reduce context usage. This skill
categorizes documents by priority and creates a staged loading plan that loads
critical documents immediately while deferring lower-priority content.

## Usage

```
/progressive-loader plan <directories...>
/progressive-loader load-next
/progressive-loader load-tier <tier>
/progressive-loader status
/progressive-loader defer <path>
/progressive-loader prioritize <path>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: plan, load-next, load-tier, status, defer, prioritize |
| directories | Yes* | Directories to scan (*for plan only) |
| tier | Yes* | Tier to load: critical, high, medium, low (*for load-tier only) |
| path | Yes* | Document path (*for defer/prioritize only) |
| --max-tokens | No | Maximum tokens per tier (default: 2000) |
| --dry-run | No | Preview plan without loading |

## Priority Tiers

| Tier | Load Timing | Criteria |
|------|-------------|----------|
| **Critical** | Immediately | Safety constraints (CRITICAL severity), active error context, circuit OPEN |
| **High** | After critical | File-matched constraints, session violations, IMPORTANT severity |
| **Medium** | On demand | Related observations (R≥2), historical patterns, MINOR severity |
| **Low** | Deferred | Reference docs, examples, retired constraints, pattern observations |

## Output

### Create Loading Plan

```
/progressive-loader plan docs/constraints/ docs/observations/

PROGRESSIVE LOADING PLAN
────────────────────────

Scanned: 2 directories, 25 documents

Tier: Critical (load immediately)
  Estimated: ~1,200 tokens
  Documents:
    1. docs/constraints/active/git-safety-force-push.md [CRITICAL]
       Reason: CRITICAL severity
    2. docs/constraints/active/git-safety-destructive-ops.md [CRITICAL]
       Reason: CRITICAL severity
    3. docs/constraints/active/security-credential-handling.md [CRITICAL]
       Reason: CRITICAL severity

Tier: High (load after critical)
  Estimated: ~1,800 tokens
  Documents:
    4. docs/constraints/active/test-before-commit.md [IMPORTANT]
       Reason: IMPORTANT severity
    5. docs/constraints/active/plan-approve-implement.md [IMPORTANT]
       Reason: IMPORTANT severity
    6. docs/observations/failures/git-force-push-without-confirmation.md
       Reason: R=5, related to active constraint

Tier: Medium (load on demand)
  Estimated: ~2,400 tokens
  Documents:
    7. docs/constraints/active/quality-error-handling.md [MINOR]
       Reason: MINOR severity
    8. docs/observations/failures/tests-skipped-before-commit.md
       Reason: R=4, potential constraint
    ... (5 more)

Tier: Low (deferred)
  Estimated: ~3,500 tokens
  Documents:
    13. docs/constraints/retired/old-naming-convention.md
        Reason: retired constraint
    14. docs/observations/patterns/successful-tdd-workflow.md
        Reason: pattern observation (not actionable)
    ... (11 more)

Summary:
  Total: 25 documents (~8,900 tokens)
  Immediate: 3 documents (~1,200 tokens)
  Ready to load Critical tier.
```

### Load Next Tier

```
/progressive-loader load-next

LOADING TIER: High
──────────────────

Loading 3 documents (~1,800 tokens):

  1. ✓ docs/constraints/active/test-before-commit.md (450 tokens)
  2. ✓ docs/constraints/active/plan-approve-implement.md (520 tokens)
  3. ✓ docs/observations/failures/git-force-push-without-confirmation.md (380 tokens)

Loaded: 3 documents (1,350 tokens actual)

Next tier: Medium (7 documents, ~2,400 tokens)
Use '/progressive-loader load-next' to continue.
```

### Load Specific Tier

```
/progressive-loader load-tier medium

LOADING TIER: Medium
────────────────────

Loading 7 documents (~2,400 tokens):

  1. ✓ docs/constraints/active/quality-error-handling.md (280 tokens)
  2. ✓ docs/observations/failures/tests-skipped-before-commit.md (420 tokens)
  ... (5 more)

Loaded: 7 documents (2,180 tokens actual)

Remaining: Low tier (14 documents, ~3,500 tokens)
```

### Status

```
/progressive-loader status

LOADING STATUS
──────────────

Plan created: 2026-02-13T10:30:00Z
Total documents: 25

Tier Status:
  Critical: ✓ Loaded (3 documents, 1,200 tokens)
  High:     ✓ Loaded (3 documents, 1,350 tokens)
  Medium:   ○ Ready (7 documents, ~2,400 tokens)
  Low:      ○ Deferred (12 documents, ~3,500 tokens)

Loaded: 6 documents (2,550 tokens)
Remaining: 19 documents (~5,900 tokens)

Context budget: 50% used (estimated)

Manual Overrides:
  Prioritized: 1 (moved to High)
  Deferred: 2 (moved to Low)
```

### Defer Document

```
/progressive-loader defer docs/constraints/active/quality-error-handling.md

DOCUMENT DEFERRED
─────────────────

Path: docs/constraints/active/quality-error-handling.md
Previous tier: Medium
New tier: Low

Document will not be loaded unless explicitly requested or
'/progressive-loader load-tier low' is called.
```

### Prioritize Document

```
/progressive-loader prioritize docs/observations/patterns/successful-tdd-workflow.md

DOCUMENT PRIORITIZED
────────────────────

Path: docs/observations/patterns/successful-tdd-workflow.md
Previous tier: Low
New tier: High

Document will be loaded with next '/progressive-loader load-next' call.
```

## Priority Assignment Rules

### Severity Mapping

| Constraint Severity | Default Tier |
|---------------------|--------------|
| CRITICAL | Critical |
| IMPORTANT | High |
| MINOR | Medium |

### Boost Factors

| Factor | Effect |
|--------|--------|
| File pattern match | +1 tier |
| Session violation | +1 tier |
| Circuit OPEN | → Critical |
| Pattern observation | → Low (always) |
| Retired constraint | → Low (always) |

### Examples

```
git-safety-force-push (CRITICAL) + file match → Critical (stays)
test-before-commit (IMPORTANT) + violation → Critical (boosted)
quality-error-handling (MINOR) + no match → Medium (stays)
successful-tdd-workflow (pattern) → Low (always)
```

## Token Estimation

Documents are scanned for approximate token count:

```
tokens ≈ (characters / 4) + (code_blocks * 50) + (frontmatter_fields * 10)
```

This is an estimate; actual tokens may vary by ~20%.

## Context Budget

The loader tracks cumulative token usage:

```
/progressive-loader status

Context budget:
  Estimated capacity: 10,000 tokens (configurable)
  Currently loaded: 2,550 tokens (25%)
  Planned critical: 1,200 tokens (12%)
  Planned high: 1,350 tokens (14%)
  Available: 4,900 tokens (49%)
```

## Integration

- **Layer**: Core
- **Depends on**: None (foundational loading)
- **Used by**: Session initialization, contextual-injection

## Integration with contextual-injection

```
1. contextual-injection determines relevant constraints
2. progressive-loader creates loading plan
3. Critical tier loaded immediately
4. Higher tiers loaded as context permits
5. Low tier deferred unless explicitly needed
```

## State File

Loading state persisted in session:

```json
{
  "plan_created": "2026-02-13T10:30:00Z",
  "tiers": {
    "critical": {
      "documents": ["path1.md", "path2.md"],
      "loaded": true,
      "tokens": 1200
    },
    "high": {
      "documents": ["path3.md"],
      "loaded": false,
      "tokens": 520
    }
  },
  "overrides": {
    "prioritized": ["path4.md"],
    "deferred": ["path5.md"]
  }
}
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Directory not found | Error: "Directory not found: <path>" |
| Empty directory | Info: "No documents found in <path>" |
| Token budget exceeded | Warning: "Budget exceeded, loading critical only" |
| Document read error | Warning: "Could not read <path>, skipping" |
| Invalid tier | Error: "Invalid tier: <tier>" |

## Acceptance Criteria

- [x] Creates prioritized loading plan
- [x] Loads tiers progressively
- [x] Severity maps to default tier
- [x] Boost factors adjust priority
- [x] Pattern observations always Low
- [x] Retired constraints always Low
- [x] Token estimation works
- [x] Manual defer/prioritize works
- [x] Status tracks loading progress
- [x] Integrates with contextual-injection

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
