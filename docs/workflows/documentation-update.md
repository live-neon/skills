---
status: Draft
observation_file: null
observation_count: 0
last_updated: 2026-02-13
---

# Workflow: Documentation Update

**Status**: Draft (N=0)
**Last Updated**: 2026-02-13

## Purpose

Systematic process for updating Live Neon Skills documentation when skills, architecture,
or guides change.

**Principles Applied**: Single Source of Truth, Documentation as Code

---

## When to Use This Workflow

**Trigger when:**
- Adding new skills (SKILL.md files)
- Modifying existing skill behavior or arguments
- Changing layer structure or dependencies
- Adding/updating guides (docs/guides/)
- Updating ARCHITECTURE.md (layers, data flow, circuit breaker)
- Modifying test infrastructure
- Changing SKILL_TEMPLATE.md

**Skip when:**
- Internal implementation details (no public interface change)
- Test-only changes that don't affect test README
- Research notes that don't affect skills

---

## Documentation Hierarchy

Updates flow from authoritative sources down:

```
agentic/*/SKILL.md                    # Skill definitions (authoritative for each skill)
        ↓
ARCHITECTURE.md                        # System overview (layers, data flow, circuit breaker)
        ↓
docs/guides/                           # Technical guides (semantic similarity, etc.)
        ↓
agentic/SKILL_TEMPLATE.md             # Template for new skills
        ↓
agentic/README.md                      # Lifecycle diagram, counter terminology
        ↓
README.md                              # Problem/solution, installation, skill tables
        ↓
tests/README.md                        # Testing philosophy, commands
        ↓
docs/implementation/                   # Phase results, acceptance verification
```

**Document purposes**:
- **SKILL.md**: Authoritative skill specification (usage, arguments, output, failure modes)
- **ARCHITECTURE.md**: System reference (layers, data flow, threat model, circuit breaker)
- **Guides**: Deep technical documentation (semantic similarity, etc.)
- **SKILL_TEMPLATE.md**: Starting point for new skills
- **agentic/README.md**: Failure-to-constraint lifecycle, counter terminology
- **README.md**: Newcomer entry point (problem/solution, installation)
- **tests/README.md**: Testing philosophy, commands, coverage

**Rule**: SKILL.md files are authoritative for individual skills. ARCHITECTURE.md is
authoritative for system behavior. Guides provide deep technical reference.

---

## Steps

### Step 1: Identify Scope of Change

Classify the change:

| Type | Files Affected |
|------|----------------|
| **New skill** | SKILL.md, ARCHITECTURE.md (layer table), README.md (skill table), tests/ |
| **Skill modification** | SKILL.md only (unless arguments/output change significantly) |
| **Layer change** | ARCHITECTURE.md, affected SKILL.md files, README.md |
| **New guide** | docs/guides/, ARCHITECTURE.md (guides section), README.md (guides section) |
| **Template update** | SKILL_TEMPLATE.md, possibly existing SKILL.md files |
| **Test infrastructure** | tests/README.md, package.json |
| **Phase completion** | docs/implementation/, ARCHITECTURE.md (phase status) |

### Step 2: Update SKILL.md (if skill changed)

Individual skill documentation:

- [ ] Frontmatter (name, version, description, tags, **layer**, **status**)
- [ ] Usage section with correct arguments
- [ ] Arguments table with defaults
- [ ] Output examples with realistic format
- [ ] Integration section (layer, dependencies, used by)
- [ ] Failure modes table
- [ ] Acceptance criteria

**Semantic classification check**: If skill involves action classification, ensure it
references `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` and uses LLM-based matching.

**Dependency documentation** (critical for AI agent discoverability):

The Integration section must document skill dependencies accurately:

```markdown
## Integration

- **Layer**: Core (or appropriate layer)
- **Depends on**: context-packet, file-verifier (upstream skills)
- **Used by**: constraint-lifecycle, twin-review (downstream skills)
```

| Field | Purpose | Example |
|-------|---------|---------|
| **Depends on** | Skills this skill calls or requires | `context-packet, file-verifier` |
| **Used by** | Skills that call or require this skill | `constraint-lifecycle, twin-review` |

**Why this matters**: AI agents traverse these links to understand skill relationships.
Without accurate dependency documentation, agents cannot:
- Load required upstream skills before using a skill
- Understand which downstream skills are affected by changes
- Navigate the skill graph for context gathering

**Verification**: When adding/modifying dependencies:
1. Update the current skill's "Depends on" list
2. Update each upstream skill's "Used by" list (bidirectional linking)
3. Verify layer rules are respected (see ARCHITECTURE.md layer guidelines)

### Step 3: Update ARCHITECTURE.md (if system changed)

System-level documentation:

- [ ] Skill Layers diagram (if new layer or skill)
- [ ] Foundation/Core/Review/Detection/etc. layer tables
- [ ] Category vs Layer section (if confusion possible)
- [ ] Data Flow diagrams (failure→constraint lifecycle)
- [ ] Circuit Breaker States (if behavior changed)
- [ ] Threat Model (if security considerations changed)
- [ ] Guides section (if new guide added)
- [ ] Extending the System section (if template changed)

### Step 4: Update Guides (if deep technical content)

Technical reference documentation:

- [ ] Create new guide in docs/guides/ following guide-generation workflow
- [ ] Update ARCHITECTURE.md Guides table
- [ ] Update README.md Guides section
- [ ] Cross-reference from relevant SKILL.md files

### Step 5: Update README.md

Root project overview:

- [ ] The Problem / The Solution sections (if philosophy changed)
- [ ] Agentic skills table (if new skill added)
- [ ] PBD skills table (if PBD skill changed)
- [ ] Guides section (if new guide added)
- [ ] Testing section (if test infrastructure changed)

### Step 6: Update agentic/README.md (if lifecycle changed)

Agentic-specific documentation:

- [ ] Failure → Constraint lifecycle diagram
- [ ] Skill Layers table
- [ ] Counter Terminology table (R/C/D)
- [ ] ClawHub Integration section

### Step 7: Update tests/README.md (if testing changed)

Test documentation:

- [ ] Test Commands table
- [ ] Test Structure diagram
- [ ] Testing Documentation-Only Skills section
- [ ] What's Tested section
- [ ] Current Coverage

### Step 8: Verify Consistency

Run verification checks:

```bash
# Check all SKILL.md files have required sections
for f in agentic/*/SKILL.md agentic/*/*/SKILL.md; do
  echo "=== $f ==="
  grep -E "^## (Usage|Arguments|Integration|Failure Modes)" "$f" | head -5
done

# Check version consistency
grep -r "version:" agentic/*/SKILL.md agentic/*/*/SKILL.md | head -20

# Check for stale external references
grep -r "neon-soul/skills/neon-soul" . 2>/dev/null
# Expected: No results (should reference local guides)

# Verify skill count matches
echo "Skills in ARCHITECTURE.md:"
grep -c "Implemented" ARCHITECTURE.md
echo "Actual SKILL.md files:"
find agentic -name "SKILL.md" | wc -l

# Verify dependency bidirectionality (spot check)
# For each "Depends on: X", X's "Used by" should list this skill
echo "=== Dependency links ==="
for f in $(find agentic -name "SKILL.md"); do
  skill=$(basename $(dirname $f))
  deps=$(grep -A1 "Depends on" "$f" 2>/dev/null | tail -1 | tr -d '- ')
  usedby=$(grep -A1 "Used by" "$f" 2>/dev/null | tail -1 | tr -d '- ')
  if [ -n "$deps" ] && [ "$deps" != "None (foundational)" ]; then
    echo "$skill depends on: $deps"
  fi
  if [ -n "$usedby" ]; then
    echo "$skill used by: $usedby"
  fi
done

# Run tests
cd tests && npm test
```

---

## Checklist Files

| File | What to Check |
|------|---------------|
| `agentic/*/SKILL.md` | Frontmatter, usage, arguments, integration (deps!), failure modes |
| `agentic/*/*/SKILL.md` | Same as above (nested structure) |
| `ARCHITECTURE.md` | Layer tables, data flow, circuit breaker, threat model, guides |
| `docs/guides/*.md` | Technical accuracy, cross-references |
| `agentic/SKILL_TEMPLATE.md` | Layer guidance, required sections, dependency fields |
| `agentic/README.md` | Lifecycle diagram, counters, layers |
| `README.md` | Problem/solution, skill tables, guides, testing |
| `tests/README.md` | Commands, philosophy, coverage |
| `tests/package.json` | Test scripts, dependencies |
| `docs/implementation/*.md` | Phase results, acceptance criteria |

**Dependency Checklist** (when modifying skill dependencies):

| Check | Action |
|-------|--------|
| "Depends on" updated | List all upstream skills |
| "Used by" updated in upstream skills | Bidirectional linking |
| Layer rules respected | No downward dependencies |
| ARCHITECTURE.md layer table | Reflect actual dependencies |

---

## Common Mistakes

### 1. Forgetting ARCHITECTURE.md Layer Table

**Wrong**: Adding skill to directory but not ARCHITECTURE.md layer table
**Right**: Every skill must appear in ARCHITECTURE.md layer table with status

### 2. External References Instead of Local Guides

**Wrong**: Referencing `neon-soul/SKILL.md` for semantic similarity
**Right**: Reference `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` (local)

### 3. Inconsistent Skill Tables

**Wrong**: Skill in agentic/ but missing from README.md skill table
**Right**: All skills appear in both ARCHITECTURE.md and README.md

### 4. Missing Semantic Classification Check

**Wrong**: New skill uses pattern matching for action classification
**Right**: All action classification uses LLM semantic similarity (see guide)

### 5. Forgetting Test Updates

**Wrong**: Adding skill but not updating test expectations
**Right**: `skill-loading.test.ts` should discover new skill automatically, verify it does

### 6. Stale Acceptance Criteria

**Wrong**: Checking boxes in SKILL.md after verification
**Right**: Leave unchecked (convention); track in docs/implementation/ instead

### 7. One-Way Dependency Links

**Wrong**: Adding skill X to "Depends on" but not updating X's "Used by"
**Right**: Always update both directions (bidirectional linking)

**Example**:
```
# When adding circuit-breaker that depends on constraint-enforcer:

# In circuit-breaker/SKILL.md:
- **Depends on**: constraint-enforcer  ✓

# ALSO update constraint-enforcer/SKILL.md:
- **Used by**: circuit-breaker  ✓ (add to existing list)
```

### 8. Layer Violation in Dependencies

**Wrong**: Core layer skill depending on Review layer skill
**Right**: Dependencies flow upward only (Foundation → Core → Review/Detection → etc.)

---

## Verification

After updates, verify:

```bash
# All tests pass
cd tests && npm test

# No external references to neon-soul for semantic matching
grep -r "neon-soul.*SKILL.md" agentic/ docs/ 2>/dev/null
# Expected: No results

# Skill count consistency
echo "README skill count:"
grep -c "agentic/" README.md
echo "ARCHITECTURE skill count:"
grep -c "Implemented" ARCHITECTURE.md
echo "Actual skills:"
find agentic -name "SKILL.md" | wc -l

# All SKILL.md have required frontmatter
for f in $(find agentic -name "SKILL.md"); do
  if ! grep -q "^name:" "$f"; then
    echo "Missing name: $f"
  fi
done
```

---

## Examples

### Example: Adding a New Foundation Layer Skill

**Files updated** (in order):
1. `agentic/core/new-skill/SKILL.md` - Created skill specification
2. `ARCHITECTURE.md` - Added to Foundation Layer table
3. `README.md` - Added to Agentic skills table
4. `tests/` - Verified skill-loading.test.ts discovers it

**Verification**:
```bash
npm test  # Should show skill count increased
grep "new-skill" ARCHITECTURE.md README.md  # Both should match
```

### Example: Adding a New Guide

**Files updated** (in order):
1. `docs/guides/NEW_GUIDE.md` - Created following guide-generation workflow
2. `ARCHITECTURE.md` - Added to Guides section table
3. `README.md` - Added to Guides section table
4. Relevant `SKILL.md` files - Added cross-references

**Verification**:
```bash
grep "NEW_GUIDE" ARCHITECTURE.md README.md  # Both should match
grep "docs/guides/NEW_GUIDE" agentic/  # Skills should reference it
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do Instead |
|--------------|----------------|------------|
| Pattern matching for actions | Trivially evaded | Use semantic classification (see guide) |
| External neon-soul references | Breaks standalone | Reference local docs/guides/ |
| Skill without ARCHITECTURE entry | Undiscoverable | Update layer table |
| Checking SKILL.md acceptance boxes | Convention violation | Track in docs/implementation/ |
| Guide without cross-references | Isolated knowledge | Link from ARCHITECTURE + README |
| Tests without philosophy section | Unclear testing approach | Explain structure vs behavior |
| One-way dependency links | Breaks AI traversal | Update both "Depends on" and "Used by" |
| Layer-violating dependencies | Breaks architecture | Dependencies flow upward only |
| Missing dependency docs | AI can't discover context | Always document Integration section |

---

## Next Steps (After Documentation Update)

After completing documentation updates, **close the loop**:

1. **Run closing-loops checklist** (from main project):
   - Check for observation placeholders
   - Check for documentation TODOs
   - Verify cross-references working

2. **If completing a phase**:
   - Follow `docs/workflows/phase-completion.md`
   - Update `docs/implementation/agentic-phase{N}-results.md`
   - Mark phase complete in implementation plan

3. **If creating/modifying skills**:
   - Each SKILL.md has "Next Steps" section - follow it
   - Update bidirectional dependency links
   - Run verification scripts

4. **Commit changes**:
   - Group related documentation updates
   - Include verification results in commit message

**Anti-pattern**: Completing documentation but not closing the loop. Always check:
- [ ] ARCHITECTURE.md layer tables current
- [ ] README.md skill tables current
- [ ] Dependency links bidirectional
- [ ] Tests passing
- [ ] Phase results file updated (if phase work)

---

## Related Documentation

- **[ARCHITECTURE.md](../../ARCHITECTURE.md)** - System overview, layer tables
- **[Semantic Similarity Guide](../guides/SEMANTIC_SIMILARITY_GUIDE.md)** - LLM-based matching
- **[SKILL_TEMPLATE.md](../../agentic/SKILL_TEMPLATE.md)** - New skill template
- **[Phase Completion](phase-completion.md)** - Phase completion checklist
- **[Phase 1 Results](../implementation/agentic-phase1-results.md)** - Implementation status
- **[Tests README](../../tests/README.md)** - Testing documentation
- **[Closing Loops](/docs/workflows/closing-loops.md)** - Main project loop closure workflow

---

*Workflow created 2026-02-13 to support standalone skills project documentation.*
*Updated 2026-02-14: Added Next Steps section and phase-completion reference.*
