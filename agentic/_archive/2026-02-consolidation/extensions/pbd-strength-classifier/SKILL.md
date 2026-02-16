---
name: pbd-strength-classifier
version: 1.0.0
description: Classify observation strength and identify constraint candidates
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, observations, pbd, classification]
layer: extensions
status: active
source: docs/observations/2025-11-09-resist-file-proliferation.md
n_count: 11
---

# pbd-strength-classifier

Classify observation strength based on N-count and R/C/D counters. Identify
observations ready for constraint promotion.

## Problem Being Solved

Observations accumulate without systematic strength assessment:
- N=1 observations treated same as N=5+ validated patterns
- Constraint candidates not identified proactively
- No clear criteria for promotion readiness
- Manual review required to assess evidence quality

## Usage

```
/pbd-strength-classifier assess <observation>    # Classify single observation
/pbd-strength-classifier list --strength strong  # List by strength level
/pbd-strength-classifier candidates              # Show constraint candidates
```

## Example

```bash
# Assess an observation's strength
/pbd-strength-classifier assess docs/observations/api-timeout-handling.md

# Find all strong observations
/pbd-strength-classifier list --strength strong

# See constraint-ready observations
/pbd-strength-classifier candidates
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: assess, list, candidates |
| observation | Yes (for assess) | Path to observation file |
| --strength | No | Filter: weak, medium, strong |
| --verbose | No | Show detailed R/C/D counters |

## Strength Classification

| Strength | N-Count | Description |
|----------|---------|-------------|
| Weak | N=1-2 | Insufficient evidence, needs more occurrences |
| Medium | N=3-4 | Validated pattern, constraint candidate |
| Strong | N>=5 | Strongly validated, ready for promotion |

## Constraint Candidacy Criteria

An observation is a constraint candidate if:
- R >= 3 (at least 3 occurrences)
- C >= 2 (at least 2 confirmations)
- Sources >= 2 (evidence from multiple contexts)
- D = 0 (no disconfirmations) OR D < R/2

## Output

### Assess Single Observation

```
/pbd-strength-classifier assess docs/observations/api-timeout.md

STRENGTH ASSESSMENT
===================

File: docs/observations/api-timeout.md
Slug: api-timeout-handling

Counters:
  N-count: 5 (occurrences)
  R-count: 5 (recognitions)
  C-count: 4 (confirmations)
  D-count: 0 (disconfirmations)

Strength: STRONG

Constraint Candidacy: ELIGIBLE
  [x] R >= 3 (5 >= 3)
  [x] C >= 2 (4 >= 2)
  [x] Multiple sources
  [x] D < R/2 (0 < 2.5)

Recommendation: Ready for constraint promotion
```

### List by Strength

```
/pbd-strength-classifier list --strength medium

OBSERVATIONS BY STRENGTH
========================

Filter: Medium (N=3-4)

1. test-flakiness-patterns.md
   N=3, R=3, C=2, D=0
   Status: Constraint candidate

2. cache-invalidation-timing.md
   N=4, R=4, C=3, D=0
   Status: Constraint candidate

Total: 2 medium-strength observations
```

### Constraint Candidates

```
/pbd-strength-classifier candidates

CONSTRAINT CANDIDATES
=====================

Ready for promotion (meets all criteria):

1. api-timeout-handling.md
   N=5, R=5, C=4, D=0
   Recommendation: Promote to constraint

2. error-boundary-patterns.md
   N=4, R=4, C=3, D=0
   Recommendation: Ready when N=5

Near-ready (missing 1 criterion):

3. logging-consistency.md
   N=3, R=3, C=1, D=0
   Missing: C >= 2 (needs 1 more confirmation)
```

## Integration

- **Layer**: Extensions
- **Depends on**: None (reads observation frontmatter)
- **Used by**: observation-refactoring, monthly reviews

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "Observation not found: <path>" |
| Missing frontmatter | Warning: "No frontmatter, cannot classify" |
| Invalid N-count | Error: "Invalid n_count value" |

## When NOT to Use

- **New observations**: N=1 observations are definitionally weak; no assessment needed
- **Manual reviews**: Human judgment needed for context-dependent decisions
- **Constraint promotion**: Use constraint-generator for actual promotion logic
- **Cross-project patterns**: Strength varies by context; not transferable
- **Archived observations**: Historical context more important than current strength

Use pbd-strength-classifier for periodic observation triage and candidate identification.

## Acceptance Criteria

- [x] Correctly classifies weak/medium/strong
- [x] Identifies constraint candidates (R>=3, C>=2)
- [x] Lists observations by strength level
- [x] Parses observation frontmatter
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Assess observation strength:
```bash
/pbd-strength-classifier assess <observation>
```

**Verification**: `cd tests && npm test -- -t "pbd-strength-classifier"`
