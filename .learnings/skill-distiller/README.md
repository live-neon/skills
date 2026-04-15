# Skill Distiller Calibration

Stores calibration data for skill-distiller functionality estimates.

## Files

| File | Purpose |
|------|---------|
| `calibration.jsonl` | Compression results with expected/actual outcomes |

## Schema

Each JSONL entry contains:

```json
{
  "id": "c1",                           // Unique entry ID
  "timestamp": "2026-04-14T22:00:00Z",  // When compression ran
  "skill": "essence-distiller",         // Skill that was compressed
  "mode": "threshold",                  // Compression mode used
  "threshold": 0.9,                     // Threshold value (if applicable)
  "input_tokens": 1800,                 // Estimated tokens before
  "output_tokens": 1100,                // Estimated tokens after
  "reduction_pct": 39,                  // Percentage reduction
  "sections_total": 14,                 // Total sections identified
  "sections_kept": 9,                   // Sections preserved
  "sections_removed": 5,                // Sections removed
  "classification_confidence_mean": 0.90, // Mean LLM confidence
  "functionality_score": 90,            // Estimated functionality preserved
  "protected_patterns_found": ["n-count"],
  "protected_patterns_preserved": ["n-count"],
  "advisory_patterns_found": [],
  "advisory_patterns_removed": [],
  "expected": {"functionality": 90},    // What we predicted
  "actual": null                        // User feedback (null until reported)
}
```

## Recording Feedback

After using a compressed skill, report actual outcome:

```
/skill-distiller feedback --id=c1 --actual=85 --outcome="worked"
```

This updates the entry's `actual` field for calibration improvement.

## File Rotation

- Max entries: 1000
- When exceeded: oldest 100 entries truncated
- N-count tracked per (skill, mode) pair

## Calibration Status

| N-count | Meaning |
|---------|---------|
| N < 5 | Uncalibrated (estimates are LLM-only) |
| N = 5-10 | Building baseline |
| N > 10 | Calibrated (historical data informs estimates) |

## Related

- `$SKILLS/skill-distiller/SKILL.md` - Skill specification
- `$PBD/docs/plans/2026-04-14-skill-distiller-llm.md` - Implementation plan
