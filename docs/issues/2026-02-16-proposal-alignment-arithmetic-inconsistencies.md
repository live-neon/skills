---
created: 2026-02-16
type: issue
status: resolved
priority: medium
source: code-review
reviewers: [codex-gpt51, gemini-25pro]
related_plan: docs/plans/2026-02-16-proposal-alignment.md
related_reviews:
  - docs/reviews/2026-02-16-proposal-alignment-impl-codex.md
  - docs/reviews/2026-02-16-proposal-alignment-impl-gemini.md
affected_files:
  - docs/proposals/2026-02-13-agentic-skills-specification.md
follow_up_issue: docs/issues/2026-02-16-proposal-alignment-polish.md
---

# Issue: Proposal Alignment Arithmetic Inconsistencies

## Summary

Code review (N=2: Codex + Gemini) of the proposal alignment implementation identified
8 important findings related to arithmetic inconsistencies and missing historical markers.
All findings verified at N=2.

## Problem

The proposal alignment plan successfully added consolidation documentation, but:
1. Historical sections lack "(Historical)" markers, confusing readers
2. Skill counts are inconsistent across different sections (41 vs 46 vs 47 vs 48)
3. Layer counts in "Original Design" don't match archive reality

## Verified Findings (N=2)

### From Codex Review

| ID | Finding | Location | Verified |
|----|---------|----------|----------|
| C-I-1 | Summary says "47 agentic memory skills" without historical marker | Lines 111-116 | ✅ N=2 |
| C-I-2 | "Skill Tiers (47 skills)" header presents 47 as current | Lines 264-279 | ✅ N=2 |
| C-I-3 | Success Criteria section - addressed in implementation | Lines 1385+ | ✅ Already fixed |
| C-I-4 | Stage 8 verification didn't check historical sections | Process gap | ✅ N=2 |

### From Gemini Review

| ID | Finding | Location | Verified |
|----|---------|----------|----------|
| G-I-1 | TL;DR table sums to 41, not 47/48 (missing bridge, removed) | Lines 66-80 | ✅ N=2 |
| G-I-2 | safety-checks count: "4" at line 74, "3" at line 1192 | Lines 74, 1192 | ✅ N=2 |
| G-I-3 | Mapping table sums to 46, not 48 (missing 2 skills) | Lines 1185-1196 | ✅ N=2 |
| G-I-4 | Original Design layer counts don't match archive | Lines 335-345 | ✅ N=2 |

## Detailed Verification

### G-I-1: TL;DR Table Arithmetic

**Current table sums to 41:**
```
context-verifier:    3
failure-memory:     10
constraint-engine:   9
review-orchestrator: 5
governance:          6
safety-checks:       4
workflow-tools:      4
─────────────────────
Total:              41
```

**Missing from table:**
- Bridge layer → documentation (5 skills)
- Removed skill (pbd-strength-classifier) (1 skill)
- 48th skill added during implementation (1 skill)

**Expected:** 41 + 5 + 1 + 1 = 48

### G-I-2: safety-checks Count Contradiction

- **Line 74 (TL;DR):** "4 safety skills"
- **Line 1192 (Mapping):** "safety-checks | 3 | Safety"

**Archive verification:**
```bash
ls agentic/_archive/2026-02-consolidation/safety/ | wc -l
# Output: 4
```

**Resolution:** Line 1192 should say "4", not "3"

### G-I-4: Original Design vs Archive Reality

**Specification says (lines 335-345):**
```
├── core/           # 14 skills
├── review/         # 6 skills
├── detection/      # 4 skills
├── governance/     # 4 skills
├── safety/         # 4 skills
└── bridge/         # 5 skills
```

**Archive actually contains:**
```
core:       12
review:      7
detection:   5
governance:  5
safety:      4
bridge:      8
extensions: 10
─────────────
Total:      51 directories (48 SKILL.md files)
```

**Note:** Some directories may be empty or contain shared files. The 48 SKILL.md count is authoritative.

## Recommended Fixes

### Fix 1: Add Historical Markers (~5 min)

Add "(Historical - Pre-Consolidation)" to:
- Line 111: Summary section header
- Line 264: "Skill Tiers (47 skills)" → "Skill Tiers (47 skills - Historical)"

### Fix 2: Correct safety-checks Count (~2 min)

Change line 1192 from:
```
| safety-checks | 3 | Safety |
```
To:
```
| safety-checks | 4 | Safety |
```

### Fix 3: Add Missing Skills to TL;DR Table (~5 min)

Add footnote or rows explaining:
- Bridge skills (5) became documentation
- 1 skill removed (pbd-strength-classifier)
- Note: Table shows 7 consolidated skills from 41 merged sources + 5 bridge + 1 removed + 1 added = 48

### Fix 4: Reconcile Original Design Counts (~10 min)

Either:
A) Update spec to match archive reality, OR
B) Add note explaining the discrepancy (counts evolved during implementation)

**Recommended:** Option B - preserve historical design intent, note actual counts differ

## Estimated Effort

~20-30 minutes total

## Cross-References

- **Source Plan:** `docs/plans/2026-02-16-proposal-alignment.md` (status: complete)
- **Codex Review:** `docs/reviews/2026-02-16-proposal-alignment-impl-codex.md`
- **Gemini Review:** `docs/reviews/2026-02-16-proposal-alignment-impl-gemini.md`
- **Affected File:** `docs/proposals/2026-02-13-agentic-skills-specification.md`

## Acceptance Criteria

- [x] All sections with "47 skills" have historical context
- [x] safety-checks count is consistent (4)
- [x] TL;DR table arithmetic is explained or corrected
- [x] Original Design counts have explanatory note
- [x] No reader confusion between historical (47/48) and current (7) skill counts

## Resolution

All items addressed on 2026-02-16:

| Fix | Change | Location |
|-----|--------|----------|
| Fix 1a | Added "Historical Context" blockquote | Summary section |
| Fix 1b | Renamed header + added note | "Skill Tiers (Historical - 47 Skills Pre-Consolidation)" |
| Fix 2 | Changed 3 → 4 | Mapping table safety-checks row |
| Fix 3 | Added arithmetic footnote | TL;DR table |
| Fix 4 | Added spec vs archive note | Original Design section |
| Fix 5 | Added 47 vs 48 footnote | Mapping table |

---

*Issue created from N=2 code review findings. All findings verified at N=2.*
*Resolved: 2026-02-16*
