---
status: Active
observation_file: null
observation_count: 1
last_updated: 2026-02-20
---

# Workflow: Documentation Update

**Status**: Active (N=1)
**Last Updated**: 2026-02-16

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
- Adding/updating workflows (docs/workflows/)
- Adding/updating research (docs/research/) that affects skill design
- Updating ARCHITECTURE.md (layers, data flow, circuit breaker)
- Modifying test infrastructure
- Changing SKILL_TEMPLATE.md
- **Updating security compliance requirements** (affects creating-new-skill.md, skill-publish.md)

**Skip when:**
- Internal implementation details (no public interface change)
- Test-only changes that don't affect test README
- Research notes that don't affect skills (pure external documentation)

---

## Documentation Hierarchy

Updates flow from authoritative sources down:

```
agentic/*/SKILL.md                    # Skill definitions (authoritative for each skill)
        ↓
ARCHITECTURE.md                        # System overview (layers, data flow, circuit breaker)
        ↓
docs/proposals/                        # Specifications and architectural proposals
        ↓
docs/plans/                            # Implementation plans for each phase
        ↓
docs/guides/                           # Technical guides (semantic similarity, etc.)
        ↓
docs/research/                         # External research (validates architecture decisions)
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
        ↓
docs/issues/                           # Review findings and remediation tracking
        ↓
docs/reviews/                          # Code review and twin review outputs
```

**Document purposes**:
- **SKILL.md**: Authoritative skill specification (usage, arguments, output, failure modes)
- **ARCHITECTURE.md**: System reference (layers, data flow, threat model, circuit breaker)
- **Proposals**: Design specifications and architectural intent (authoritative for design decisions, must be updated when implementation diverges)
- **Plans**: Implementation blueprints (historical record of how features were built)
- **Guides**: Deep technical documentation (semantic similarity, etc.)
- **Research**: External validation of architecture decisions (hooks, learning theory, industry patterns)
- **SKILL_TEMPLATE.md**: Starting point for new skills
- **agentic/README.md**: Failure-to-constraint lifecycle, counter terminology
- **README.md**: Newcomer entry point (problem/solution, installation)
- **tests/README.md**: Testing philosophy, commands, coverage

**Rule**: SKILL.md files are authoritative for individual skills. ARCHITECTURE.md is
authoritative for system behavior. Proposals are authoritative for design intent but
must be updated when major implementation changes occur (e.g., consolidation, restructuring).
Guides provide deep technical reference.

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
| **New workflow** | docs/workflows/, docs/README.md (workflows section), README.md (workflows section) |
| **New research** | docs/research/, docs/README.md (research section), README.md (documentation table), cross-references in related workflows |
| **Security compliance update** | **skill-security-compliance.md (authoritative)**, creating-new-skill.md, skill-publish.md, SKILL_TEMPLATE.md, affected SKILL.md files |
| **Template update** | SKILL_TEMPLATE.md, possibly existing SKILL.md files |
| **Test infrastructure** | tests/README.md, package.json |
| **Phase completion** | docs/implementation/, ARCHITECTURE.md (phase status) |
| **Proposal/specification update** | docs/proposals/, ARCHITECTURE.md (if structure changed) |
| **Major architecture change** | docs/proposals/ (alignment audit), ARCHITECTURE.md, affected SKILL.md files |

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
| `docs/research/*.md` | External research, cross-references to workflows and architecture |
| `docs/workflows/*.md` | Purpose, triggers, steps, cross-references |
| `docs/standards/skill-security-compliance.md` | **Authoritative** security requirements for ClawHub publication |
| `docs/workflows/creating-new-skill.md` | References skill-security-compliance.md (not duplicating) |
| `docs/workflows/skill-publish.md` | References skill-security-compliance.md (not duplicating) |
| `docs/standards/CJK_VOCABULARY.md` | Skill aliases, sub-commands, math notation (agent-facing) |
| `agentic/SKILL_TEMPLATE.md` | Layer guidance, required sections, dependency fields |
| `agentic/README.md` | Lifecycle diagram, counters, layers |
| `README.md` | Problem/solution, skill tables, guides, workflows, testing, documentation dirs |
| `docs/README.md` | Workflows section, research section, navigation index |
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

### 9. Security Compliance Drift

**Wrong**: Updating security requirements in creating-new-skill.md or skill-publish.md directly
**Right**: Update `docs/standards/skill-security-compliance.md` (authoritative source); workflows reference it

**Architecture**:
- `docs/standards/skill-security-compliance.md` - **Authoritative** security requirements
- `docs/workflows/creating-new-skill.md` - References skill-security-compliance.md (Phase 4)
- `docs/workflows/skill-publish.md` - References skill-security-compliance.md (Security Scan Compliance)
- `agentic/SKILL_TEMPLATE.md` - Frontmatter example (must match standard)
- `pbd/SKILL_TEMPLATE.md` - Frontmatter example (must match standard)

### 10. Letting Proposals Drift from Implementation

**Wrong**: Completing major restructuring (e.g., consolidation) without updating specification
**Right**: Run alignment audit after major changes, update specification to reflect reality

**Pattern** (from memory-garden Plan 010):
1. After major architecture change → Run "Stage 0: Alignment Audit"
2. Document divergences in a table (specification says X, reality is Y)
3. Update specification to reflect current implementation
4. Add `last_aligned` date to frontmatter for staleness detection

**Example**: Consolidation reduced 48 skills to 7, but specification still said 47 skills.
Solution: Add "Post-Phase 7: Consolidation" section, update TL;DR, implementation location.

**Reference**: `docs/plans/2026-02-16-proposal-alignment.md` (alignment audit pattern)

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

# Security compliance sync check (both should mention same required fields)
echo "=== Security compliance sync ==="
echo "creating-new-skill.md mentions:"
grep -E "disable-model-invocation|config_paths|workspace_paths" docs/workflows/creating-new-skill.md | wc -l
echo "skill-publish.md mentions:"
grep -E "disable-model-invocation|config_paths|workspace_paths" docs/workflows/skill-publish.md | wc -l
# Both counts should be similar (documents cover same requirements)
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

### Example: Adding a New Workflow

**Files updated** (in order):
1. `docs/workflows/NEW_WORKFLOW.md` - Created workflow document
2. `docs/README.md` - Added to Workflows section table
3. `README.md` - Added to Workflows section table
4. `docs/workflows/documentation-update.md` - Added to Related Documentation (this file)
5. Relevant files - Added cross-references (CONTRIBUTING.md, other workflows)

**Verification**:
```bash
grep "NEW_WORKFLOW" docs/README.md README.md  # Both should match
grep "docs/workflows/NEW_WORKFLOW" .  # Cross-references present
```

### Example: Adding New Research

**Files updated** (in order):
1. `docs/research/YYYY-MM-DD-topic-research.md` - Created research document
2. `docs/README.md` - Added to Research section table
3. `README.md` - Added to Documentation directories table
4. `docs/workflows/creating-new-skill.md` - Added cross-reference (if affects skill design)
5. Relevant workflows - Added cross-references to Research section

**Verification**:
```bash
grep "topic-research" docs/README.md README.md  # Both should reference it
grep "docs/research/.*topic" docs/workflows/  # Cross-references in workflows
```

### Example: Adding New Security Compliance Requirement

**Files updated** (in order):
1. `docs/standards/skill-security-compliance.md` - **Authoritative source** - add requirement here first
2. `agentic/SKILL_TEMPLATE.md` - Update frontmatter example to match
3. `pbd/SKILL_TEMPLATE.md` - Update frontmatter example to match
4. Affected `SKILL.md` files - Apply new requirement

> **Note**: `creating-new-skill.md` and `skill-publish.md` reference the standard and typically
> don't need updates unless the reference sections need restructuring.

**Verification**:
```bash
# Authoritative standard should have the new requirement
grep "NEW_REQUIREMENT" docs/standards/skill-security-compliance.md
# Templates should include new field
grep "NEW_REQUIREMENT" agentic/SKILL_TEMPLATE.md pbd/SKILL_TEMPLATE.md
# Workflows should reference the standard (not duplicate content)
grep "skill-security-compliance.md" docs/workflows/skill-publish.md docs/workflows/creating-new-skill.md
```

### Example: Updating Proposals After Major Architecture Change

**Trigger**: Consolidation reduced 48 skills to 7, but specification still described 47 skills.

**Pattern** (Stage 0 Alignment Audit from memory-garden):
1. Create divergence table (spec says X, reality is Y)
2. Update specification frontmatter with `last_aligned` date
3. Update TL;DR with current skill count
4. Add section documenting the change (e.g., "Post-Phase 7: Consolidation")
5. Update implementation location, success criteria, timeline
6. Verify original proposal correctly references updated specification

**Files updated** (in order):
1. `docs/proposals/2026-02-13-agentic-skills-specification.md` - TL;DR, consolidation section, implementation location, success criteria, timeline
2. `docs/proposals/2026-02-13-openclaw-skills-for-agentic-system.md` - Note consolidation in superseded notice
3. `ARCHITECTURE.md` - Verify skill counts match

**Verification**:
```bash
# Specification shows correct skill count
grep "consolidated_count:" docs/proposals/2026-02-13-agentic-skills-specification.md
# Consolidation section exists
grep "Post-Phase 7: Consolidation" docs/proposals/2026-02-13-agentic-skills-specification.md
# last_aligned date present
grep "last_aligned:" docs/proposals/2026-02-13-agentic-skills-specification.md
```

**Reference**: `docs/plans/2026-02-16-proposal-alignment.md`

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
| Security compliance drift | Inconsistent requirements | Update skill-security-compliance.md (authoritative) |
| Proposal drift | Spec contradicts reality | Run alignment audit after major changes |

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
- **[Creating a New Skill](creating-new-skill.md)** - Complete skill creation workflow
- **[Skill Publishing](skill-publish.md)** - Publishing workflow with security compliance
- **[Semantic Similarity Guide](../guides/SEMANTIC_SIMILARITY_GUIDE.md)** - LLM-based matching
- **[CJK Vocabulary](../standards/CJK_VOCABULARY.md)** - Skill aliases, sub-commands, math notation
- **[Security Compliance](../standards/skill-security-compliance.md)** - Authoritative ClawHub security requirements
- **[SKILL_TEMPLATE.md](../../agentic/SKILL_TEMPLATE.md)** - New skill template
- **[Phase Completion](phase-completion.md)** - Phase completion checklist
- **[Phase 1 Results](../implementation/agentic-phase1-results.md)** - Implementation status
- **[Tests README](../../tests/README.md)** - Testing documentation
- **Closing Loops** - See multiverse `docs/workflows/closing-loops.md` (external to skills submodule)

### Research Documents

- **[Consequences-Based Learning](../research/2026-02-16-consequences-based-learning-llm-research.md)** - R/C/D counters, RLVR, self-improving agents
- **[OpenClaw/ClawHub Hooks](../research/2026-02-15-openclaw-clawhub-hooks-research.md)** - Three hook systems, SKILL.md format
- **[Soft Hook Enforcement](../research/2026-02-15-soft-hook-enforcement-patterns.md)** - Three-Layer Model, HEARTBEAT verification

### Proposal Alignment

- **[Proposal Alignment Plan](../plans/2026-02-16-proposal-alignment.md)** - Stage 0 alignment audit pattern
- **Pattern Source**: memory-garden/docs/plans/010-architecture-documentation-hub.md (cross-project reference)

---

*Workflow created 2026-02-13 to support standalone skills project documentation.*
*Updated 2026-02-14: Added Next Steps section and phase-completion reference.*
*Updated 2026-02-16: Added research documents to scope and examples.*
*Updated 2026-02-16: Added proposal alignment guidance (pattern from memory-garden Plan 010).*
