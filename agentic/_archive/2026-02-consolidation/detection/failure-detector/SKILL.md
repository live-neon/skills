---
name: failure-detector
version: 1.0.0
description: Multi-signal failure detection to feed failure-tracker
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, detection, failure, attribution]
layer: detection
status: active
rg6_status: provisional
---

# failure-detector

Detects failures from multiple signals: test failures, user corrections, review findings.
Converts signals into failure observations for the failure-tracker.

**Classification Method**: LLM-based semantic classification (NOT pattern matching)
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

## Research Gate Status

**RG-6: Failure Attribution Accuracy** - PROVISIONAL

This skill implements provisional single-cause attribution with confidence scoring.
Multi-causal failures are flagged with `uncertain: true` for human review.

**Entry Criteria Met**:
- Assumption documented: "Single-cause attribution with confidence scoring"
- Output includes `attribution_method: provisional_single_cause`
- Multi-causal failures flagged with `uncertain: true`

**Exit Criteria** (for graduation from provisional):
- RG-6 research complete (`failure-attribution-accuracy.md` created)
- Calibrated thresholds based on research
- Integration test for multi-causal attribution

## Problem Being Solved

failure-tracker records failures, but something needs to detect them first.
This skill monitors multiple signals and converts them to failure observations.

## Usage

```
/failure-detector analyze <test-output>
/failure-detector scan-session
/failure-detector watch --signal <test|correction|review|error>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| test-output | Yes (analyze) | Path to test output or inline output |
| --signal | No (watch) | Signal type to watch for |

## Signal Types

| Signal | Source | Detection Method |
|--------|--------|------------------|
| Test failure | CI/test output | Parse test framework output |
| User correction | Chat message | Detect correction language |
| Review finding | Review output | Extract critical/important findings |
| Runtime error | Error logs | Parse error stack traces |
| Constraint violation | circuit-breaker | Automatic (already structured) |

## Attribution Confidence

Attribution uses confidence scoring (0.0-1.0):

```json
{
  "failure": "Force push executed without confirmation",
  "attribution": {
    "primary_cause": "Missing confirmation step in push.ts",
    "confidence": 0.85,
    "alternative_causes": [
      {"cause": "Unclear user request", "confidence": 0.45}
    ],
    "uncertain": false,
    "attribution_method": "provisional_single_cause"
  }
}
```

**Uncertainty Threshold**: If no single cause has confidence >= 0.7, mark `uncertain: true`.
Uncertain attributions require human review before constraint generation.

## Output

```
FAILURE DETECTED
----------------

Signal: Test failure
Source: npm test output

Failure: "Test 'push.test.ts' failed: Expected confirmation prompt"

Attribution:
  Primary cause: Missing confirmation step in push.ts (0.85)
  Alternative: Test expectation incorrect (0.32)
  Uncertain: No

Suggested slug: test-missing-confirmation-prompt
Tags: git, testing, safety

Action: Create observation? /failure-tracker create <slug>
```

## Example

```
/failure-detector scan-session

SESSION SCAN
------------

Signals analyzed: 12
Failures detected: 2

1. User correction (message #45)
   "No, that's wrong - you should ask before force pushing"

   Attribution:
     Primary: git-force-push-without-confirmation (0.91)
     Uncertain: No

   Suggested action: /failure-tracker create git-force-push-without-confirmation

2. Review finding (twin-review output)
   "[Critical] Plan missing rollback procedure"

   Attribution:
     Primary: workflow-plan-missing-rollback (0.78)
     Uncertain: No

   Suggested action: /failure-tracker create workflow-plan-missing-rollback

Uncertain attributions: 0
```

```
/failure-detector analyze "Error: ENOENT: no such file or directory"

FAILURE ANALYSIS
----------------

Signal: Runtime error
Content: "Error: ENOENT: no such file or directory"

Attribution:
  Primary: File path incorrect (0.52)
  Alternative: File deleted unexpectedly (0.48)
  Alternative: Permission issue (0.31)
  Uncertain: YES (no cause >= 0.7)

This failure requires human review for accurate attribution.
Flag: human_review_required

Suggested slugs:
  - quality-file-not-found (generic)
  - quality-path-error (if path issue)

Action: Manual review required before creating observation.
```

## Integration

- **Layer**: Detection
- **Depends on**: context-packet, slug-taxonomy
- **Used by**: failure-tracker

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No signals found | Info: "No failure signals detected in input." |
| Unparseable output | Warning: "Could not parse <format>. Raw signal stored." |
| All causes low confidence | Flag: `uncertain: true`, require human review |
| slug-taxonomy unavailable | Warning: "Using generic slug. Taxonomy unavailable." |

## Acceptance Criteria

- [ ] Detects test failures from output
- [ ] Detects user corrections from messages
- [ ] Detects review findings from review output
- [ ] Attribution confidence scoring implemented (0.0-1.0)
- [ ] Uncertain attributions flagged (`uncertain: true`)
- [ ] Semantic classification (not pattern matching)
- [ ] Integrates with slug-taxonomy for naming
- [ ] Feeds failure-tracker with candidates
- [ ] RG-6 provisional status documented
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
