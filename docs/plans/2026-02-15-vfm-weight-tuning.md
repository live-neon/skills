---
created: 2026-02-15
type: plan
status: backlog
priority: low
prerequisite: N≥10 constraint usage data
deferred_from:
  - ../implementation/agentic-phase5-results.md
  - ../implementation/agentic-phase5b-results.md
related:
  - ../references/clawhub-format-compatibility.md
  - ../../clawhub-skills/proactive-agent-3.1.0/SKILL.md
---

# VFM Weight Tuning Plan

## Summary

Calibrate Value-First Modification (VFM) weights based on real constraint usage data.
Currently using default weights from proactive-agent spec; tuning requires N≥10 observations.

**Trigger**: When `.learnings/` contains ≥10 constraint-related entries
**Duration**: 0.5 day
**Output**: Calibrated VFM weights in `output/constraints/metadata.json`

## Background

VFM Protocol (from proactive-agent@3.1.0) scores changes before implementation:

| Dimension | Default Weight | Question |
|-----------|----------------|----------|
| High Frequency | 3x | Will this be used daily? |
| Failure Reduction | 3x | Does this turn failures into successes? |
| User Burden | 2x | Can human say 1 word instead of explaining? |
| Self Cost | 2x | Does this save tokens/time for future-me? |

**Current state**: Using defaults
**Target state**: Weights calibrated from actual usage patterns

## Prerequisites

Before starting:

- [ ] `.learnings/LEARNINGS.md` contains ≥10 entries
- [ ] At least 5 constraints have been generated via `/ce generate`
- [ ] Usage data available in `output/constraints/`

### Verification

```bash
# Count learning entries
grep -c "^\[LRN-" .learnings/LEARNINGS.md

# Count constraints
ls -1 output/constraints/*.md 2>/dev/null | wc -l

# Check for R/C/D data
grep "R/C/D" .learnings/LEARNINGS.md | head -5
```

## Stage 1: Data Collection

**Duration**: 1 hour
**Goal**: Extract usage patterns from existing data

### Tasks

1. **Export constraint usage metrics**
   ```bash
   /gov state --export metrics.json
   ```

2. **Analyze R/C/D patterns**
   - Which constraints have high R (recurrence)?
   - Which have high C (confirmations)?
   - Which have high D (disconfirmations)?

3. **Correlate with outcomes**
   - Did high-frequency constraints reduce failures?
   - Did user-burden constraints get used?

### Acceptance Criteria

- [ ] Metrics exported to `output/analysis/vfm-data.json`
- [ ] R/C/D distribution documented
- [ ] Outcome correlation noted

## Stage 2: Weight Calculation

**Duration**: 1 hour
**Goal**: Calculate calibrated weights from data

### Tasks

1. **Calculate frequency impact**
   - Constraints with R≥5: What's their failure reduction rate?
   - Adjust High Frequency weight based on correlation

2. **Calculate failure reduction impact**
   - Constraints that prevented re-occurrence: weight higher
   - Constraints that didn't help: weight lower

3. **Calculate user burden impact**
   - Constraints users confirm quickly: higher weight
   - Constraints users skip: lower weight

4. **Propose new weights**
   - Document rationale for each adjustment
   - Keep within reasonable bounds (1x-5x)

### Acceptance Criteria

- [ ] New weights calculated with rationale
- [ ] Weights documented in analysis file
- [ ] No weight outside 1x-5x range

## Stage 3: Implementation

**Duration**: 1 hour
**Goal**: Apply calibrated weights

### Tasks

1. **Update metadata.json**
   ```json
   {
     "vfm_weights": {
       "high_frequency": 3.2,
       "failure_reduction": 2.8,
       "user_burden": 2.1,
       "self_cost": 1.9
     },
     "calibrated": "2026-XX-XX",
     "sample_size": 10
   }
   ```

2. **Update governance skill**
   - `/gov` should read weights from metadata.json
   - Fall back to defaults if not present

3. **Document changes**
   - Add entry to VERSION.md
   - Update ARCHITECTURE.md if needed

### Acceptance Criteria

- [ ] Weights in metadata.json
- [ ] `/gov` reads calibrated weights
- [ ] Documentation updated

## Stage 4: Validation

**Duration**: 30 minutes
**Goal**: Verify calibration improves scoring

### Tasks

1. **Test scoring with new weights**
   ```bash
   /ce check "test constraint" --verbose
   ```

2. **Compare old vs new scores**
   - Run same constraints through both weight sets
   - Verify calibrated weights produce better ranking

3. **Document results**
   - Create results file
   - Note any unexpected outcomes

### Acceptance Criteria

- [ ] Scoring works with new weights
- [ ] Results documented
- [ ] No regressions

## Success Criteria

- [ ] VFM weights calibrated from N≥10 data points
- [ ] Weights stored in metadata.json
- [ ] `/gov` uses calibrated weights
- [ ] Results file created

## Cross-References

- **VFM Protocol**: `clawhub-skills/proactive-agent-3.1.0/SKILL.md` (Self-Improvement Guardrails)
- **R/C/D Counters**: `docs/references/clawhub-format-compatibility.md`
- **Constraint Engine**: `agentic/constraint-engine/SKILL.md`
- **Governance**: `agentic/governance/SKILL.md`

---

*Plan created 2026-02-15. Deferred from Phase 5/5B - requires usage data.*
