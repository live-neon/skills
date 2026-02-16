---
created: 2026-02-15
type: pattern
status: validated
evidence_count: 14
related:
  - agentic/SKILL_TEMPLATE.md
  - pbd/SKILL_TEMPLATE.md
---

# Pattern: Category-Specific Skill Formats

## Summary

Skills in this repository follow **category-specific formats** rather than a single unified format.
This is intentional: Agentic and PBD skills serve different purposes and audiences.

## Evidence (N=14)

- 7 Agentic skills following consistent agentic format
- 7 PBD skills following consistent PBD format
- Pattern validated through consolidation (2026-02-15)

## The Two Categories

| Aspect | Agentic Skills | PBD Skills |
|--------|----------------|------------|
| **Purpose** | System infrastructure | User-facing analysis |
| **Audience** | AI-to-AI communication | AI-to-human communication |
| **Invocation** | Auto-triggered or explicit | User-invoked |
| **Tone** | Technical, structural | Warm, conversational |
| **State** | Manages workspace files | Stateless extraction |

## Format Comparison

### Frontmatter

| Field | Agentic | PBD | Why Different |
|-------|---------|-----|---------------|
| `name` | `lowercase-with-dashes` | `Title Case` | PBD is user-facing |
| `author` | ✅ "Live Neon" | ❌ Omitted | PBD uses "Obviously Not" footer |
| `layer` | ✅ Required | ❌ N/A | Agentic has dependency graph |
| `status` | ✅ Required | ❌ N/A | Agentic has lifecycle states |
| `alias` | ✅ e.g., `/fm` | ❌ (use full name) | Agentic uses short aliases; PBD uses `/skill-name` |
| `user-invocable` | ❌ N/A | ✅ Required | PBD explicitly user-facing |
| `emoji` | ❌ N/A | ✅ Required | PBD uses visual identity |

### Required Sections

| Section | Agentic | PBD Equivalent |
|---------|---------|----------------|
| Usage | Command syntax | When to Use |
| Arguments | Formal table | What I Need From You |
| Output | Format examples | What You'll Get |
| Integration | Layer dependencies | Related Skills |
| Failure Modes | Error conditions | What I Can't Do |
| Acceptance Criteria | ✅ Testable | ❌ Omitted (conversational) |
| Agent Identity | ❌ N/A | ✅ Required (defines tone) |
| Required Disclaimer | ❌ N/A | ✅ Required (epistemic humility) |

## When to Use Which Format

### Use Agentic Format When:

- Skill manages workspace state (files, counters)
- Skill is auto-triggered by system events
- Skill has dependencies on other skills
- Skill participates in failure→constraint lifecycle
- Output is structured for machine consumption

**Examples**: failure-memory, constraint-engine, context-verifier

### Use PBD Format When:

- Skill is explicitly invoked by user
- Skill performs stateless analysis
- User experience and tone matter
- Output should be human-readable first
- Skill has epistemic limitations to disclaim

**Examples**: essence-distiller, pattern-finder, core-refinery

## Creating New Skills

### For New Agentic Skill:

1. Copy `agentic/SKILL_TEMPLATE.md`
2. Assign to appropriate layer (Foundation→Core→Review→Governance→Safety→Bridge→Extensions)
3. Define Integration section (depends on / used by)
4. Add to `ARCHITECTURE.md` layer table
5. Create acceptance criteria tests

### For New PBD Skill:

1. Copy `pbd/SKILL_TEMPLATE.md`
2. Define Agent Identity (role, tone, boundaries)
3. Create voice pair if technical counterpart exists
4. Add Required Disclaimer
5. Add to `pbd/README.md` skills table

## Anti-Pattern: Forcing Unification

**Don't** try to create a single SKILL.md format that works for both categories.

Why:
- **Different purposes** → different required fields
- **Different audiences** → different section styles
- **Forced unification** → neither category served well
- **Complexity** → excessive optional fields

The categories are intentionally different. Embrace the difference.

## Version History

| Date | Change |
|------|--------|
| 2026-02-15 | Pattern documented after consolidation (N=14 evidence) |

---

*Pattern established during agentic skills consolidation. See `docs/implementation/agentic-consolidation-results.md`.*
