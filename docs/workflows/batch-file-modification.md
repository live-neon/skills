---
status: Pilot
observation_file: null
observation_count: 1
last_updated: 2026-02-14
source_plan: docs/plans/2026-02-14-skill-frontmatter-audit.md
---

# Workflow: Batch File Modification

**Status**: Pilot (N=1)
**Last Updated**: 2026-02-14

## Purpose

Systematic process for modifying multiple files in a coordinated batch operation.
Ensures consistency, verification, and proper commit sequencing for changes that
span many files.

**Principles Applied**: Template-First, Staged Execution, Verification at Each Stage

**Source**: Derived from the skill frontmatter audit (N=1) which modified 33 SKILL.md
files to add `layer` and `status` frontmatter fields.

---

## When to Use This Workflow

**Use when:**
- Modifying 10+ files with similar changes
- Adding new fields/sections to existing file format
- Migrating file formats or structures
- Auditing files for compliance with new standards
- Changes span a submodule (requires commit sequencing)

**Skip when:**
- Single file modification
- Changes are unrelated (no pattern)
- Files have significantly different structures
- Quick fix that doesn't need verification

---

## Workflow Stages

### Stage 0: Template First (Prerequisite)

**Purpose**: Ensure any template files are updated BEFORE modifying existing files.
This prevents new files created during the batch operation from being non-compliant.

**Steps**:
1. Identify template files (e.g., `SKILL_TEMPLATE.md`, `*.template`)
2. Update templates with new fields/structure
3. Verify template has required changes
4. Commit template change separately (if submodule)

**Example verification**:
```bash
grep -E "^field_name:" path/to/TEMPLATE.md
# Expected: Field present with valid values
```

**Why template-first matters**: Without this, new files created during the audit
would lack the new fields, creating immediate drift.

---

### Stage 1-N: Batch by Logical Grouping

**Purpose**: Process files in logical groups rather than all at once. This provides:
- Incremental verification points
- Ability to catch errors early
- Cleaner commit history (optional)

**Grouping strategies**:
| Strategy | When to Use | Example |
|----------|-------------|---------|
| By directory | Files organized by type | core/, review/, detection/ |
| By dependency | Lower layers first | foundation → core → review |
| By risk level | Safe changes first | metadata → behavior |
| By file type | Similar structures together | *.md, *.yaml, *.json |

**Per-group steps**:
1. List files in group explicitly
2. Define exact change to make
3. Apply changes
4. Run group verification
5. Proceed to next group OR fix errors

**Example (from frontmatter audit)**:
```bash
# Stage 1: Foundation layer (5 files)
# Changes: Add layer: foundation, status: active after tags line

# Verification:
grep -l "layer: foundation" agentic/*/SKILL.md | wc -l
# Expected: 5
```

---

### Stage Final: Comprehensive Verification

**Purpose**: Verify all changes were applied correctly across all groups.

**Verification checklist**:
- [ ] Count matches expected total
- [ ] No files missing the change
- [ ] No duplicate or malformed entries
- [ ] Tests pass (if applicable)
- [ ] Related documentation updated

**Example verification script**:
```bash
# Count by category
for category in cat1 cat2 cat3; do
  count=$(grep -l "field: $category" path/*.md | wc -l)
  echo "$category: $count"
done
# Expected: cat1=X, cat2=Y, cat3=Z, Total=N

# Find missing files
for f in $(find path -name "*.md"); do
  if ! grep -q "^field:" "$f"; then
    echo "MISSING: $f"
  fi
done
# Expected: No output
```

---

### Submodule Workflow (If Applicable)

**When files are in a submodule**:

1. **Complete Stage 0** → Commit template to submodule
2. **Complete Stages 1-N** → Commit batch changes to submodule
3. **Complete Final Verification** → Confirm all changes correct
4. **Update parent repo** → Update submodule reference
5. **Push together** → Both repos updated atomically

**Rollback**: If issues arise mid-execution, `git reset --hard` to pre-audit commit
in submodule. Parent repo submodule reference unchanged until final update.

---

## Plan Template

When creating a batch modification plan, include:

```markdown
## Summary
- Scope: N files in path/
- Risk: Low/Medium/High
- Blocking: What this blocks/is blocked by

## Background
- Why this change is needed
- What fields/structure being added/modified

## File Mapping
| Directory | Category | Count |
|-----------|----------|-------|
| path/a/ | type-a | X |
| path/b/ | type-b | Y |
| **Total** | | **N** |

## Stages
### Stage 0: Template Update
### Stage 1: [Group 1 Name] (X files)
### Stage 2: [Group 2 Name] (Y files)
...
### Stage Final: Verification

## Acceptance Criteria
- [ ] Template updated
- [ ] All N files have field
- [ ] Counts match expected
- [ ] Tests pass

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

## Verification Commands
[Exact commands to verify each stage]
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do Instead |
|--------------|----------------|------------|
| Modify all files at once | No verification points, hard to debug | Stage by logical grouping |
| Skip template update | New files drift immediately | Template-first (Stage 0) |
| No per-stage verification | Errors compound across stages | Verify after each stage |
| Commit everything together | Hard to rollback partially | Commit per stage or logical batch |
| Glob patterns without testing | May miss or double-count files | Test glob on sample first |
| Shell-specific syntax | Fails on different shells | Use portable commands (find vs glob) |

---

## Examples

### Example 1: Frontmatter Audit (N=1 - Source)

**Scope**: 33 SKILL.md files across 6 directories
**Change**: Add `layer` and `status` fields to frontmatter

**Stages**:
- Stage 0: Update SKILL_TEMPLATE.md
- Stage 1: Foundation layer (5 files)
- Stage 2: Core layer (9 files)
- Stage 3: Review layer (6 files)
- Stage 4: Detection layer (4 files)
- Stage 5: Governance layer (5 files)
- Stage 6: Safety layer (4 files)
- Stage 7: Final verification

**Result**: All 33 files updated, template compliant, tests passing.

**Source plan**: `docs/plans/2026-02-14-skill-frontmatter-audit.md` (multiverse repo)

---

## Observations & Feedback

**Observation file**: Not yet created (lazy creation)
**Status**: N=1 observations from frontmatter audit

**Key learnings from N=1**:
1. Template-first (Stage 0) was critical - caught by N=2 plan review
2. Per-stage verification caught glob pattern issues (bash vs zsh)
3. Logical grouping (by layer) made verification counts meaningful
4. Working directory note essential for verification commands
5. Timeline estimates should include 30% buffer

---

## Related Documentation

- **Documentation Update**: `docs/workflows/documentation-update.md` - Post-modification propagation
- **Phase Completion**: `docs/workflows/phase-completion.md` - If batch mod is part of phase
- **Creating Workflows**: `docs/workflows/creating-new-workflow.md` (multiverse repo) - Workflow lifecycle

---

*Workflow created 2026-02-14 from frontmatter audit plan (N=1).*
*Status: Pilot - awaiting N=2 and N=3 usage to validate pattern.*
