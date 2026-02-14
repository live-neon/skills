---
status: Active
observation_file: null
observation_count: 0
last_updated: 2026-02-14
---

# Workflow: Phase Completion

**Status**: Active (N=0)
**Last Updated**: 2026-02-14

## Purpose

Systematic checklist for completing an implementation phase in the agentic skills system.
Prevents agents from getting stuck by providing clear next steps after phase work.

**Problem Solved**: Agents complete phase stages but don't know what to do next, leading to
incomplete documentation, missing cross-references, and orphaned work.

---

## When to Use This Workflow

**Use when**:
- Completing all stages of an implementation phase (e.g., Phase 4 complete)
- Completing a major milestone within a phase
- Before marking a phase as "complete" in plans or results files

**Skip when**:
- Mid-stage work (use stage-level checklists instead)
- Single skill modifications (use SKILL.md "Next Steps" section)
- Documentation-only updates (use documentation-update.md)

---

## Phase Completion Checklist

### 1. Verify All Skills Created

```bash
# Count skills in phase
find agentic -name "SKILL.md" | wc -l

# Verify against plan
grep -c "SKILL.md" docs/plans/*phase{N}*.md

# Check all skills have required sections
for f in agentic/*/SKILL.md agentic/*/*/SKILL.md; do
  echo "=== $f ==="
  grep -E "^## (Usage|Integration|Next Steps)" "$f" | head -5
done
```

- [ ] All planned skills have SKILL.md files
- [ ] All SKILL.md files have "Next Steps" section
- [ ] All SKILL.md files comply with MCE limits (≤200 lines)

### 2. Verify Documentation Updated

- [ ] **ARCHITECTURE.md** - Layer tables updated with new skills
- [ ] **README.md** - Skill tables updated
- [ ] **Dependency links bidirectional** - "Depends on" and "Used by" match

```bash
# Verify dependency bidirectionality
for f in $(find agentic -name "SKILL.md"); do
  skill=$(basename $(dirname $f))
  deps=$(grep -A1 "Depends on" "$f" 2>/dev/null | tail -1)
  echo "$skill: $deps"
done
```

### 3. Verify Tests Pass

```bash
cd tests && npm test
```

- [ ] All existing tests pass
- [ ] New integration tests created (if required by plan)
- [ ] Contract tests validate data flow between skills
- [ ] Performance within target latencies (see specification Performance Requirements)

### 4. Update Results File

Create/update `docs/implementation/agentic-phase{N}-results.md`:

- [ ] Summary of what was implemented
- [ ] Skills implemented (table with line counts)
- [ ] Research gate status (resolved/provisional)
- [ ] Integration test results
- [ ] Files created/modified list
- [ ] Next steps for following phase

### 5. Update Plan Status

In `docs/plans/*phase{N}*.md`:

- [ ] Change frontmatter `status: draft` → `status: complete`
- [ ] Mark all acceptance criteria as checked
- [ ] Add completion date to frontmatter

### 6. Update ARCHITECTURE.md Phase Status

In `ARCHITECTURE.md` phase tracking section:

- [ ] Mark phase complete
- [ ] Update skill counts
- [ ] Add completion date

### 7. Close Loops

Run closing-loops checklist (from main project):

- [ ] No observation placeholders left open
- [ ] No documentation TODOs related to this phase
- [ ] Cross-references all working
- [ ] CJK vocabulary updated (if new notation)

```bash
# Quick check
grep -r "TODO\|PLACEHOLDER\|TBD" docs/ agentic/ | grep -i "phase{N}"
```

### 8. Prepare for Next Phase

- [ ] Read next phase section in specification
- [ ] Identify prerequisites for next phase
- [ ] Note any research gates blocking next phase
- [ ] Create implementation plan for next phase (if proceeding)

---

## Phase Completion Output

After completing this workflow, you should have:

1. **Results file**: `docs/implementation/agentic-phase{N}-results.md`
2. **Updated plan**: Status changed to complete
3. **Updated ARCHITECTURE.md**: Phase marked complete
4. **Passing tests**: All integration scenarios verified
5. **Clean loops**: No orphaned TODOs or placeholders

---

## Handoff to Next Phase

When handing off to next phase (or next agent):

**Document in results file**:
- What was completed
- What research gates remain
- What provisional decisions were made
- Recommended approach for next phase

**Example handoff note**:
```markdown
## Handoff to Phase 5

Phase 4 complete. 8 core skills + 4 additions implemented.

**Provisional decisions** (may need revision):
- RG-2: Single-agent mode enforced (multi-agent deferred)
- RG-4: 90-day cadence with decay signals (arbitrary but mitigated)

**Research gates for Phase 5**:
- RG-5: Semantic similarity calibration (blocks Bridge layer)

**Recommended approach**:
- Start with RG-5 research sprint (0.5 day)
- Then implement Bridge skills in dependency order
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do Instead |
|--------------|----------------|------------|
| Marking phase complete without results file | No record of what was done | Always create results file |
| Skipping test verification | Regressions go unnoticed | Run full test suite |
| Not updating ARCHITECTURE.md | Skills become undiscoverable | Update layer tables |
| Leaving plan status as "draft" | Unclear what's complete | Update to "complete" |
| Not closing loops | Orphaned work accumulates | Run closing-loops checklist |
| No handoff notes | Next agent starts blind | Document provisional decisions |

---

## Integration with Agent Workflows

**For implementer agents**:
1. After completing final stage, run this checklist
2. Report completion status to coordinator/planner
3. Include results file path in completion report

**For coordinator agents**:
1. Verify implementer ran phase-completion
2. Check results file exists and is complete
3. Approve phase OR request missing items
4. Initiate next phase planning

**For planner agents**:
1. Read previous phase results before planning next phase
2. Incorporate handoff notes into new plan
3. Address provisional decisions if research complete

---

## Related Documentation

- **[Documentation Update](documentation-update.md)** - File-level documentation updates
- **[SKILL_TEMPLATE.md](../../agentic/SKILL_TEMPLATE.md)** - Skill template with Next Steps
- **[ARCHITECTURE.md](../../ARCHITECTURE.md)** - System overview, phase tracking
- **[Closing Loops](/docs/workflows/closing-loops.md)** - Main project loop closure

---

*Workflow created 2026-02-14 to prevent agents from getting stuck after phase completion.*
