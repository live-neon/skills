---
name: vfm-constraint-scorer
version: 1.0.0
description: Score constraints using VFM methodology for prioritization decisions
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, bridge, vfm, scoring, prioritization]
layer: bridge
status: active
---

# vfm-constraint-scorer

Score constraints using VFM (Value Function Model) methodology. This skill translates
constraint effectiveness metrics into value scores that VFM can use for prioritization
decisions.

> **Terminology**: See [Bridge README](../README.md) for glossary of terms (VFM, prevention_rate, precision, etc.).

## Problem Being Solved

VFM needs to prioritize which constraints matter most. Raw metrics (prevention rate,
false positive rate) don't translate directly to value. vfm-constraint-scorer
applies VFM's value function to produce scores that enable prioritization.

## Usage

```
/vfm-constraint-scorer score <constraint-id>       # Score single constraint
/vfm-constraint-scorer score-all                   # Score all active constraints
/vfm-constraint-scorer rank                        # Rank by value score
/vfm-constraint-scorer rank --top 10               # Top N constraints
/vfm-constraint-scorer explain <constraint-id>     # Explain score components
/vfm-constraint-scorer export                      # Export for VFM system
```

## Example

```bash
# Score a constraint and see its value breakdown
/vfm-constraint-scorer score plan-approve-implement

# Rank all constraints by value score
/vfm-constraint-scorer rank --top 5
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: score, score-all, rank, explain, export |
| constraint-id | Yes* | Constraint to score (*for score, explain) |
| --top | No | Limit ranking output (default: all) |
| --state | No | Filter by state: draft, active, retiring, retired |
| --format | No | Export format: json, yaml (default: json) |

## Value Function

```
value_score = (prevention_rate × 0.4) + (precision × 0.3) + (usage × 0.2) + (severity × 0.1)
```

| Component | Calculation | Range |
|-----------|-------------|-------|
| prevention_rate | violations_prevented / total_attempted | 0.0-1.0 |
| precision | 1 - false_positive_rate | 0.0-1.0 |
| usage_frequency | normalized enforcement count | 0.0-1.0 |
| severity_weight | CRITICAL=1.0, IMPORTANT=0.7, MINOR=0.4 | 0.4-1.0 |

## Weight Rationale (Initial Calibration)

| Weight | Component | Rationale |
|--------|-----------|-----------|
| 0.4 | prevention_rate | Primary purpose of constraints is preventing violations; highest weight |
| 0.3 | precision | False positives erode trust; second highest to avoid alert fatigue |
| 0.2 | usage_frequency | Frequently-used constraints provide more value; moderate weight |
| 0.1 | severity_weight | Severity is input context, not outcome; lowest weight |

**Total**: 0.4 + 0.3 + 0.2 + 0.1 = 1.0 (normalized)

> **Note**: These are initial calibration weights. Tune based on correlation with
> human-perceived value after N>=10 usage data collection.

## Score Quality Labels

| Label | Score Range | Meaning |
|-------|-------------|---------|
| High | >= 0.75 | Excellent constraint performance |
| Medium | 0.50-0.74 | Adequate performance |
| Low | < 0.50 | Consider retirement or improvement |

## Output

### Score Single Constraint

```
/vfm-constraint-scorer score plan-approve-implement

CONSTRAINT SCORE: plan-approve-implement
========================================

Constraint: plan-approve-implement
ID: cst-plan-001
State: active

Value Score: 0.898 (HIGH)

Components:
  Prevention rate:  0.94  × 0.4 = 0.376
  Precision:        0.96  × 0.3 = 0.288
  Usage frequency:  0.82  × 0.2 = 0.164
  Severity weight:  0.70  × 0.1 = 0.070  (IMPORTANT = 0.7)
                              ──────────
  Total:                       0.898

Percentile: 95th (top 5% of constraints)

Recommendation: Maintain - high-performing constraint
```

### Score All Constraints

```
/vfm-constraint-scorer score-all

SCORING ALL CONSTRAINTS
=======================

Scoring 15 active constraints...

Results:
  High quality:   8 (53%)
  Medium quality: 5 (33%)
  Low quality:    2 (13%)

Top 5:
  1. plan-approve-implement    0.898 (HIGH)
  2. git-safety-protocol       0.823 (HIGH)
  3. test-before-commit        0.812 (HIGH)
  4. context-loading-timing    0.791 (HIGH)
  5. semantic-similarity       0.778 (HIGH)

Bottom 2 (review recommended):
  14. legacy-auth-check        0.423 (LOW)
  15. obsolete-api-check       0.312 (LOW)

Full ranking: /vfm-constraint-scorer rank
Export: /vfm-constraint-scorer export
```

### Rank Constraints

```
/vfm-constraint-scorer rank --top 5

CONSTRAINT RANKING
==================

| Rank | Constraint               | Score | Percentile |
|------|--------------------------|-------|------------|
| 1    | plan-approve-implement   | 0.898 |   95th     |
| 2    | git-safety-protocol      | 0.823 |   92nd     |
| 3    | test-before-commit       | 0.812 |   88th     |
| ...  | (12 more constraints)    |       |            |

Scored: 15 constraints | Export: /vfm-constraint-scorer export
```

### Explain Score

```
/vfm-constraint-scorer explain plan-approve-implement

SCORE EXPLANATION: plan-approve-implement
=========================================

Final Score: 0.898 | Quality: HIGH | Percentile: 95th

Component Breakdown:
  PREVENTION (0.4): 0.94 × 0.4 = 0.376 (42%) - 94% violations prevented
  PRECISION  (0.3): 0.96 × 0.3 = 0.288 (32%) - 4% false positive rate
  USAGE      (0.2): 0.82 × 0.2 = 0.164 (18%) - enforced in 82% of sessions
  SEVERITY   (0.1): 0.70 × 0.1 = 0.070 (8%)  - IMPORTANT severity

Recommendation: Maintain - this constraint provides strong value.
```

### Export for VFM System

```
/vfm-constraint-scorer export

{
  "version": "1.0.0",
  "timestamp": "2026-02-14T16:30:00Z",
  "weights": { "prevention": 0.4, "precision": 0.3, "usage": 0.2, "severity": 0.1 },
  "total_scored": 15,
  "rankings": [{
    "constraint_id": "cst-plan-001",
    "constraint_name": "plan-approve-implement",
    "value_score": 0.898,
    "quality": "high",
    "percentile": 95,
    "recommendation": "Maintain - high-performing constraint"
  }]
}

Exported to: .exports/vfm-ranking-2026-02-14.json
```

## Weight Configuration

Weights are configurable via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| VFM_WEIGHT_PREVENTION | 0.4 | Prevention rate weight |
| VFM_WEIGHT_PRECISION | 0.3 | Precision weight |
| VFM_WEIGHT_USAGE | 0.2 | Usage frequency weight |
| VFM_WEIGHT_SEVERITY | 0.1 | Severity weight |

**Constraint**: Weights must sum to 1.0. Invalid configurations fall back to defaults.

## Integration

- **Layer**: Bridge
- **Depends on**: effectiveness-metrics, governance-state
- **Used by**: VFM system (via mock adapter until ClawHub exists)

## Adapter Pattern

This skill uses the bridge adapter pattern for VFM system integration:

```typescript
import { getAdapter } from '../adapters';

const vfm = getAdapter('vfm-system');
await vfm.submitRanking({
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  weights: currentWeights,
  total_scored: rankings.length,
  rankings: rankings
});
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <id>" |
| No active constraints | Info: "No active constraints to score" |
| Missing metrics | Warning: "Incomplete metrics for <id>. Using available data." |
| Invalid weights | Warning: "Invalid weights (sum != 1.0). Using defaults." |
| Export write fails | Error: "Failed to write export: <reason>" |

**Error Example**:
```
/vfm-constraint-scorer score nonexistent-constraint
ERROR: Constraint not found: nonexistent-constraint
```

## Acceptance Criteria

- [x] Calculates value scores using VFM formula
- [x] Applies correct component weights
- [x] Ranks constraints by value score
- [x] Explains score components clearly
- [x] Exports in VFM-compatible JSON format
- [x] Supports custom weight configuration
- [x] Mock adapter integration works
- [x] SKILL.md compliant with MCE limits (< 200 lines body)

## Next Steps

See [Bridge README](../README.md) for layer overview and workflows.

**Verification**: `cd tests && npm test -- --grep "vfm-constraint-scorer"`
