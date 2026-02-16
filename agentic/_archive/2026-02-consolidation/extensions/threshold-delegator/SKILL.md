---
name: threshold-delegator
version: 1.0.0
description: Auto-suggest delegation when issue counts exceed thresholds
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, delegation, threshold, workflow]
layer: extensions
status: active
source: docs/patterns/auto-delegate-on-threshold.md
n_count: 3
---

# threshold-delegator

Track issue and finding counts during work. When counts exceed configurable
thresholds, suggest delegation to appropriate agents.

## Problem Being Solved

During complex work, issue counts can grow unmanageable:
- Code review findings accumulate beyond reasonable fix scope
- Bug triage lists grow too large for single session
- Documentation gaps compound during implementation

Without thresholds, teams attempt to handle everything in one session,
leading to context overload and quality degradation.

## Usage

```
/threshold-delegator check                        # Check current counts
/threshold-delegator configure --threshold 15     # Set threshold
/threshold-delegator suggest                      # Get delegation suggestion
/threshold-delegator reset                        # Reset counts
```

## Example

```bash
# During code review, check if findings exceed threshold
/threshold-delegator check

# Configure custom threshold
/threshold-delegator configure --threshold 10

# Get delegation suggestion when overwhelmed
/threshold-delegator suggest
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: check, configure, suggest, reset |
| --threshold | No | Set count threshold (default: 10) |
| --category | No | Filter by category: findings, bugs, docs, all |

## Default Thresholds

| Category | Default | Trigger Action |
|----------|---------|----------------|
| Code review findings | 10 | Delegate to implementer |
| Bug reports | 15 | Delegate to planner |
| Documentation gaps | 8 | Delegate to docs agent |
| Test failures | 10 | Delegate to test fixer |

## Output

### Check Counts

```
/threshold-delegator check

CURRENT COUNTS
==============

Category          Count  Threshold  Status
-----------------------------------------
Review findings      7        10    OK
Bug reports          3        15    OK
Documentation gaps   9         8    EXCEEDED
Test failures        2        10    OK

Status: 1 category exceeds threshold

Recommendation: Run /threshold-delegator suggest
```

### Threshold Exceeded

```
/threshold-delegator check

CURRENT COUNTS
==============

Category          Count  Threshold  Status
-----------------------------------------
Review findings     12        10    EXCEEDED
Bug reports          5        15    OK
Documentation gaps   4         8    OK
Test failures        8        10    OK

WARNING: Review findings exceed threshold (12 > 10)

Suggested action:
  Delegate remaining findings to @implementer
  Focus on critical/blocking issues only

Run: /threshold-delegator suggest for detailed guidance
```

### Delegation Suggestion

```
/threshold-delegator suggest

DELEGATION RECOMMENDATION
=========================

Exceeds threshold: Review findings (12 > 10)

Suggested delegation:
  Agent: @implementer
  Reason: Code review findings best handled by implementation agent

  Handoff items (sorted by priority):
    1. [Critical] Missing error handling in auth.ts
    2. [Critical] SQL injection risk in query.ts
    3. [Important] Inefficient loop in processor.ts
    ... and 9 more

  Keep for current session:
    - Items 1-3 (critical, blocking issues)

  Delegate to @implementer:
    - Items 4-12 (important, can be batched)

Draft handoff message:
  "@implementer Please address these 9 code review findings:
   - Inefficient loop in processor.ts (line 45)
   - Missing validation in input.ts (line 23)
   ..."
```

### Configure Threshold

```
/threshold-delegator configure --threshold 15

THRESHOLD UPDATED
=================

Category: Review findings
Previous threshold: 10
New threshold: 15

Current count: 12
Status: Now within threshold
```

## Agent Mapping

| Category | Suggested Agent | Rationale |
|----------|-----------------|-----------|
| Code review findings | @implementer | Code changes needed |
| Bug reports | @planner | Requires triage and prioritization |
| Documentation gaps | @docs-agent | Documentation specialist |
| Test failures | @implementer | Test fixes are code changes |
| Plan issues | @planner | Planning specialist |

## Integration

- **Layer**: Extensions
- **Depends on**: None (standalone)
- **Used by**: Code review workflows, triage sessions

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No counts tracked | Info: "No items tracked. Start by adding items." |
| Invalid threshold | Error: "Threshold must be positive integer" |
| Unknown category | Error: "Unknown category: <name>" |

## When NOT to Use

- **Small sessions**: <5 items don't warrant threshold tracking
- **Solo work**: No delegation targets available
- **Blocking issues**: Critical items must be resolved, not delegated
- **Learning sessions**: Delegate defeats the learning purpose
- **Final reviews**: Last pass should complete, not delegate

Use threshold-delegator when item counts accumulate beyond manageable scope.

## Acceptance Criteria

- [x] Tracks counts across categories
- [x] Triggers suggestion at configured threshold
- [x] Suggests appropriate agent (planner for plans, implementer for code)
- [x] Configure command updates thresholds
- [x] Reset command clears counts
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

During review or triage:
```bash
/threshold-delegator check
```

**Verification**: `cd tests && npm test -- --grep "threshold-delegator"`
