---
created: 2026-02-15
type: issue
scope: internal
status: resolved
priority: medium
related_plan: "[multiverse]/docs/plans/2026-02-15-skills-documentation-migration.md"
related_reviews:
  - ../reviews/2026-02-15-skills-doc-migration-twin-technical.md
  - ../reviews/2026-02-15-skills-doc-migration-twin-creative.md
related_issues:
  - 2026-02-15-skills-doc-migration-impl-review-findings.md
---

# Issue: Skills Documentation Migration Twin Review Findings (N=2)

## Summary

Twin review (N=2: Technical + Creative) of the skills documentation migration implementation
identified consistency and clarity issues. The migration successfully moved all 60 files with
proper submodule handling, but several documentation standardization items remain.

**Core Finding**: Migration execution was correct, but documentation consistency needs cleanup.

## Findings by Severity

### Critical (1)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| C-1 | Skill count inconsistency (47 vs 48) | Creative | N=2 | Resolved |

**Details**: Documentation uses both "47 skills" and "48 skills" inconsistently:
- "48 skills": README.md:60, ARCHITECTURE.md:58
- "47 skills": ARCHITECTURE.md:863,867, specification:250,265,1038,1135,1280,1341,1500,1507

**Root cause**: `pattern-convergence-detector` was added late (47→48) but not all references updated.

**Files requiring update**:
- `ARCHITECTURE.md` lines 863, 867
- `docs/proposals/2026-02-13-agentic-skills-specification.md` lines 250, 265, 1038, 1135, 1280, 1341, 1500, 1507
- `docs/plans/2026-02-15-agentic-skills-phase7-implementation.md` multiple references

### Important (4)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| I-1 | 25 full-path references in plan files | Technical | N=2 | Resolved |
| I-2 | Mixed path conventions in Phase 1 plan frontmatter | Technical | N=2 | Resolved |
| I-3 | `(multiverse)` parenthetical instead of `[multiverse]` prefix | Creative | N=2 | Resolved |
| I-4 | "Operational" term ambiguity | Creative | N=2 | Resolved |

**I-1 Details**: Plan files contain `projects/live-neon/skills/docs/...` paths that should be relative:
```
# Current (incorrect from within skills/docs/plans/):
results: projects/live-neon/skills/docs/implementation/agentic-phase1-results.md

# Should be:
results: ../implementation/agentic-phase1-results.md
```
Files affected: All 7 plan files (25 total occurrences)

**I-2 Details**: Phase 1 plan has inconsistent frontmatter (lines 7-19):
```yaml
specification: ../proposals/...  # relative (correct)
results: projects/live-neon/skills/docs/...  # full path (incorrect)
depends_on:
  - ../plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md  # phantom (file not migrated)
related_guides:
  - artifacts/guides/...  # unmarked external reference
```
The `depends_on` file does not exist in skills (verified via glob search).

**I-3 Details**: `agentic/README.md` lines 111-112 use parenthetical style:
```markdown
# Current:
- **Specification**: See `docs/proposals/...` (multiverse)

# Should be:
- **Specification**: See `[multiverse]/docs/proposals/...`
```

**I-4 Details**: "Operational" used without definition. Multiple reviews flagged this:
- Technical twin: "claiming operational status may be premature"
- Creative twin: "unclear if 'operational' means CLI executable or specified + tested"

### Minor (3)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| M-1 | License inconsistency (MIT vs Apache 2.0) | Creative | N=2 | Resolved |
| M-2 | Missing "New here?" callout in docs/README.md | Creative | N=2 | Deferred |
| M-3 | `related_guides` paths unmarked as external | Technical | N=2 | Resolved |

**M-1 Details**: LICENSE file is MIT, but agentic/README.md:131 says "Apache 2.0".

**M-2 Details**: docs/README.md lacks newcomer guidance callout at top.

**M-3 Details**: `related_guides` in plan files reference `artifacts/guides/...` without `[multiverse]` marker.

## Disposition Matrix

| Finding | Disposition | Rationale |
|---------|-------------|-----------|
| C-1 | **Address (standardize to 48)** | Count accuracy affects documentation credibility |
| I-1 | **Address (convert to relative)** | Consistency with submodule self-containment principle |
| I-2 | **Address (fix frontmatter)** | Mark phantom refs as `[multiverse]`, convert paths |
| I-3 | **Address (use prefix)** | Consistency with established `[multiverse]` convention |
| I-4 | **Address (add definition)** | Clarity for newcomers, resolves repeated review flags |
| M-1 | **Address (fix to MIT)** | Accuracy required |
| M-2 | **Defer** | Nice-to-have, not blocking |
| M-3 | **Address (mark external)** | Consistency with external reference convention |

## Recommended Actions

### Batch 1: Skill Count Standardization (C-1)

```bash
# Find all "47 skills" references
grep -rn "47 skills" --include="*.md" .

# Update to "48 skills" in:
# - ARCHITECTURE.md (2 occurrences: lines 863, 867)
# - docs/proposals/2026-02-13-agentic-skills-specification.md (8 occurrences)
# - docs/plans/2026-02-15-agentic-skills-phase7-implementation.md (6 occurrences)
```

### Batch 2: Plan File Path Standardization (I-1, I-2, M-3)

1. Convert full paths to relative in all 7 plan files:
   - `projects/live-neon/skills/docs/implementation/...` → `../implementation/...`
   - `projects/live-neon/skills/docs/guides/...` → `../guides/...`

2. Fix Phase 1 plan frontmatter:
   ```yaml
   results: ../implementation/agentic-phase1-results.md
   depends_on:
     - "[multiverse]/docs/plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md"
   related_guides:
     - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md"
     - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md"
   ```

### Batch 3: External Reference Convention (I-3)

Update `agentic/README.md` lines 111-112:
```markdown
- **Specification**: See `[multiverse]/docs/proposals/2026-02-13-agentic-skills-specification.md`
- **Guides**: See `[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_*.md`
```

### Batch 4: Clarity Improvements (I-4, M-1)

1. Add "Operational" definition to ARCHITECTURE.md Implementation Status:
   ```markdown
   **What "Operational" means**:
   - SKILL.md specification complete
   - Contract tests passing
   - Entry in ARCHITECTURE.md with layer placement
   - Does NOT imply runtime CLI wrapper exists
   ```

2. Fix license in agentic/README.md:131:
   ```markdown
   MIT License - See [LICENSE](../LICENSE) in repository root.
   ```

## Verification

After fixes:
```bash
# Check skill count consistency
grep -rn "47 skills" --include="*.md" . | wc -l
# Expected: 0

# Check no full paths remain in plans
grep -rn "projects/live-neon/skills/docs/" docs/plans/
# Expected: No output

# Check parenthetical style removed
grep -rn "(multiverse)" --include="*.md" .
# Expected: No output

# Check license consistency
grep -rn "Apache 2.0" --include="README.md" .
# Expected: No output
```

## Cross-References

- **Plan**: [Skills Documentation Migration]([multiverse]/docs/plans/2026-02-15-skills-documentation-migration.md)
- **Code Review Issue**: [Implementation Review Findings](2026-02-15-skills-doc-migration-impl-review-findings.md)
- **Reviews**:
  - Twin Technical: (inline in this session)
  - Twin Creative: (inline in this session)

---

*Issue created from N=2 twin review (Technical + Creative) of migration implementation.*
*All N=1 findings verified to N=2 through codebase inspection.*
