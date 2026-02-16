---
created: 2026-02-16
type: issue
status: resolved
priority: low
source: twin-review
reviewers: [twin-technical, twin-creative]
related_plan: docs/plans/2026-02-16-proposal-alignment.md
related_issue: docs/issues/2026-02-16-proposal-alignment-arithmetic-inconsistencies.md
related_reviews:
  - docs/reviews/2026-02-16-proposal-alignment-fixes-twin-technical.md
  - docs/reviews/2026-02-16-proposal-alignment-fixes-twin-creative.md
affected_files:
  - docs/proposals/2026-02-13-agentic-skills-specification.md
---

# Issue: Proposal Alignment Polish Items

## Summary

Twin review (N=2: Technical + Creative) of the proposal alignment implementation
identified 2 important and 6 minor polish items. All findings verified at N=2.
These are suggestions for improvement, not blockers.

## Context

This issue follows the resolution of arithmetic inconsistencies
(`docs/issues/2026-02-16-proposal-alignment-arithmetic-inconsistencies.md`).
The specification is now technically correct; these items improve reader experience.

## Verified Findings (N=2)

### From Technical Twin

| ID | Finding | Location | Severity | Verified |
|----|---------|----------|----------|----------|
| T-M-1 | Frontmatter has `original_count: 47` but no `archived_count: 48` | Frontmatter | Minor | ✅ N=2 |
| T-M-2 | Changelog says "47 skills operational" - historical, correct as-is | Line 1605 | Minor | ✅ N=2 (No change needed) |

### From Creative Twin

| ID | Finding | Location | Severity | Verified |
|----|---------|----------|----------|----------|
| C-I-1 | TL;DR table "Function" column could be more descriptive | Lines 68-76 | Important | ✅ N=2 |
| C-I-2 | Summary starts with "47 skills" after blockquote - consider leading with current state | Lines 113-120 | Important | ✅ N=2 |
| C-M-1 | Inconsistent historical marker styles (blockquote, header, note) | Lines 113, 269, 271, 311 | Minor | ✅ N=2 |
| C-M-2 | Reading Guide missing consolidation section entry | Reading Guide table | Minor | ✅ N=2 |
| C-M-3 | Issue resolution section duplicates plan information | Issue file | Minor | ✅ N=2 |
| C-M-4 | Long changelog (28 lines) could be collapsed | Line 1577+ | Minor | ✅ N=2 |

## Detailed Verification

### T-M-1: Frontmatter Counts

**Current:**
```yaml
consolidated_count: 7
original_count: 47
```

**Suggested:**
```yaml
consolidated_count: 7
original_count: 47
archived_count: 48  # Actual SKILL.md files in archive
```

**Rationale:** Clarifies the 47 (spec design) vs 48 (implementation) discrepancy at the metadata level.

### C-I-2: Summary Section Structure

**Current (after blockquote):**
```
Specification for 47 agentic memory skills for failure-anchored learning...
```

**Suggested:**
```
Originally designed as 47 agentic memory skills, now consolidated to 7.
This specification documents both the original design intent and current state.
```

### C-M-1: Historical Marker Styles

Three different styles used:
1. **Blockquote with "Historical Context"** (line 113)
2. **Header annotation "(Historical - ...)"** (line 269)
3. **Blockquote with "Note"** (lines 271, 311)

**Suggested:** Standardize to one style (recommendation: blockquote with "Historical Context").

### C-M-2: Reading Guide Missing Entry

**Current entries:**
- TL;DR, Strategic Context
- Skill Template, Phase sections
- Design Principles, Layer Overview
- Research Gates
- Deferred Items
- Implementation Status

**Missing:**
- "Understand consolidation" → Post-Phase 7: Consolidation section

## Recommended Fixes

### Fix 1: Add archived_count to frontmatter (~1 min)

```yaml
archived_count: 48
```

### Fix 2: Enhance TL;DR Function descriptions (~5 min)

Expand terse descriptions to be more self-sufficient for readers unfamiliar with the system.

### Fix 3: Revise Summary opening (~3 min)

Lead with current state, then explain historical context.

### Fix 4: Standardize historical markers (~10 min)

Choose one style and apply consistently to all historical sections.

### Fix 5: Add Reading Guide entry (~2 min)

```markdown
| Understand consolidation | Post-Phase 7: Consolidation |
```

### Fix 6: Consider changelog collapse (~5 min)

Use `<details>` tag to collapse historical changelog entries.

## Estimated Effort

~25 minutes total (all items)

## Priority Assessment

**Low priority** - All items are polish/UX improvements. The specification is technically
correct after the arithmetic fixes. These can be addressed opportunistically.

## Cross-References

- **Source Plan:** `docs/plans/2026-02-16-proposal-alignment.md` (status: complete)
- **Previous Issue:** `docs/issues/2026-02-16-proposal-alignment-arithmetic-inconsistencies.md` (status: resolved)
- **Technical Review:** `docs/reviews/2026-02-16-proposal-alignment-fixes-twin-technical.md`
- **Creative Review:** `docs/reviews/2026-02-16-proposal-alignment-fixes-twin-creative.md`
- **Affected File:** `docs/proposals/2026-02-13-agentic-skills-specification.md`

## Acceptance Criteria

- [x] Frontmatter includes `archived_count: 48`
- [x] TL;DR Function descriptions are self-sufficient
- [x] Summary opens with current state
- [x] Historical markers use consistent style
- [x] Reading Guide includes consolidation entry
- [x] Changelog is collapsible (optional)

## Resolution

All items addressed on 2026-02-16:

| Fix | Change | Verified |
|-----|--------|----------|
| Fix 1 | Added `archived_count: 48` to frontmatter | ✅ |
| Fix 2 | Enhanced TL;DR Function descriptions with full sentences | ✅ |
| Fix 3 | Summary now opens with "Current State: 7 consolidated skills..." | ✅ |
| Fix 4 | All 3 historical markers now use "Historical Context" blockquote style | ✅ |
| Fix 5 | Added "Understand consolidation (47 → 7)" row to Reading Guide | ✅ |
| Fix 6 | Wrapped changelog in `<details>` tag for collapsibility | ✅ |

---

*Issue created from N=2 twin review findings. All findings verified at N=2.*
*Resolved: 2026-02-16*
