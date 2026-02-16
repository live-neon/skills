---
created: 2026-02-15
type: plan
status: complete
priority: medium
prerequisite: None (foundational alignment)
related:
  - ../patterns/skill-format.md
  - ../../agentic/SKILL_TEMPLATE.md
  - ../../pbd/SKILL_TEMPLATE.md
related_issue: ../issues/2026-02-15-skill-category-alignment-code-review-findings.md
related_reviews:
  - ../reviews/2026-02-15-skill-category-alignment-codex.md
  - ../reviews/2026-02-15-skill-category-alignment-gemini.md
---

# Skill Category Alignment Plan

## Summary

Ensure consistent alignment between PBD and Agentic skill categories while maintaining
intentional format differences. Establishes validation, contributor guidance, and
automated consistency checks.

**Trigger**: Immediate (foundational improvement)
**Duration**: 0.5 day
**Output**: Validation tests, contributor guidance, CI checks

## Background

The skills repository has two distinct skill categories:

| Category | Purpose | Skills | Template |
|----------|---------|--------|----------|
| **Agentic** | System infrastructure (AI-to-AI) | 7 | `agentic/SKILL_TEMPLATE.md` |
| **PBD** | User-facing analysis (AI-to-human) | 7 | `pbd/SKILL_TEMPLATE.md` |

These categories use **intentionally different formats** (documented in `docs/patterns/skill-format.md`):

- **Agentic**: Technical sections (Usage, Arguments, Integration, Failure Modes)
- **PBD**: Conversational sections (Agent Identity, When to Use, What I Can't Do)

**Problem**: No automated validation ensures skills follow their category's template.

**Solution**: Add validation tests and contributor guidance without forcing format unification.

## Current State (Updated 2026-02-15)

| Aspect | Agentic | PBD |
|--------|---------|-----|
| README.md | ✅ | ✅ |
| SKILL_TEMPLATE.md | ✅ | ✅ |
| Frontmatter validation | ✅ (name, version, description, author, layer, alias) | ✅ (name, version, description, user-invocable, emoji) |
| Section validation | ✅ (7 required sections) | ✅ (3 required sections) |
| Cross-references | ✅ (README mentions PBD) | ✅ (README mentions Agentic) |

## Stage 1: Frontmatter Schema Definition

**Duration**: 30 minutes
**Goal**: Define required frontmatter fields per category
**Status**: ✅ COMPLETE (documented in pattern file)

### Schema Location (M-1 clarification)

Schemas are documented as **Markdown tables** in `docs/patterns/skill-format.md`.
TypeScript interfaces below are illustrative only - the pattern file is authoritative.

### Tasks

1. **Agentic frontmatter schema** (documented in pattern file)
   ```typescript
   // Illustrative - see docs/patterns/skill-format.md for authoritative schema
   interface AgenticFrontmatter {
     name: string;        // Required: lowercase-with-dashes
     version: string;     // Required: semver
     description: string; // Required
     author: string;      // Required: "Live Neon"
     homepage: string;    // Required
     tags: string[];      // Required: must include "agentic"
     layer: string;       // Required: foundation|core|review|governance|safety|bridge|extensions
     status: string;      // Required: active|deprecated|removed
     alias: string;       // Required: /xx short form (all skills have aliases)
   }
   ```

2. **PBD frontmatter schema** (documented in pattern file)
   ```typescript
   // Illustrative - see docs/patterns/skill-format.md for authoritative schema
   interface PBDFrontmatter {
     name: string;           // Required: Title Case
     version: string;        // Required: semver
     description: string;    // Required
     homepage: string;       // Required
     'user-invocable': boolean; // Required: true
     emoji: string;          // Required: single emoji
     tags: string[];         // Required: must include "openclaw"
   }
   ```

3. **Schema location**: `docs/patterns/skill-format.md` (Markdown tables)

### Acceptance Criteria

- [x] Agentic schema documented (pattern file tables)
- [x] PBD schema documented (pattern file tables)
- [x] Pattern file is authoritative source

## Stage 2: Section Validation Tests

**Duration**: 1 hour
**Goal**: Add tests that validate required sections per category
**Status**: ✅ COMPLETE (implemented 2026-02-15)

### Tasks

1. **Update existing test file** (NOT create new file)
   - Modified `tests/e2e/skill-loading.test.ts`
   - Added section validation to existing test structure

2. **Agentic section validation** (audited from actual skills)
   ```typescript
   const requiredSections = [
     '## Usage',
     '## Sub-Commands',
     '## Arguments',
     '## Integration',
     '## Failure Modes',
     '## Next Steps',
     '## Acceptance Criteria',
   ];
   ```

3. **PBD section validation** (audited from actual skills)
   ```typescript
   const requiredSections = [
     '## Agent Identity',
     '## When to Use',
     '## Related Skills',
   ];
   ```

4. **Run and verify tests pass**
   ```bash
   cd tests && npm test  # 10 tests passing
   ```

### Acceptance Criteria

- [x] Existing test file updated (not new file)
- [x] Agentic section validation passes
- [x] PBD section validation passes
- [x] Tests integrated into `npm test`

## Stage 3: Cross-Reference Validation

**Duration**: 30 minutes
**Goal**: Ensure cross-references between categories are correct
**Status**: ✅ COMPLETE (verified 2026-02-15)

### Tasks

1. **Validate README cross-references** (manual verification)
   - Agentic README references PBD ✓ (line 3)
   - PBD README references Agentic ✓ (line 3, line 145)
   - Root README lists both categories ✓

2. **Integration section validation**
   - Deferred: Parsing "Used by"/"Depends on" adds complexity without clear benefit
   - README cross-references provide sufficient category awareness
   - Individual skill dependencies tracked in ARCHITECTURE.md

### Acceptance Criteria

- [x] README cross-references validated
- [x] Both READMEs mention the other category
- [x] Root README lists both categories

## Stage 4: Contributor Guidance

**Duration**: 30 minutes
**Goal**: Document guidance for contributors adding new skills

### Tasks

1. **Update CONTRIBUTING.md** (or create if missing)
   Add section:
   ```markdown
   ## Adding New Skills

   ### Choosing a Category

   | Choose Agentic if... | Choose PBD if... |
   |---------------------|------------------|
   | Skill manages workspace state | Skill is stateless analysis |
   | Auto-triggered by events | Explicitly user-invoked |
   | Technical output format | Human-readable output |
   | Has layer dependencies | No dependencies |

   ### Using Templates

   1. Copy the appropriate template:
      - Agentic: `agentic/SKILL_TEMPLATE.md`
      - PBD: `pbd/SKILL_TEMPLATE.md`

   2. Fill in all required sections

   3. Run validation: `cd tests && npm test`
   ```

2. **Add decision tree to pattern file**
   - Flowchart for choosing category
   - Link from CONTRIBUTING.md

3. **Update READMEs with template references**
   - Each category README links to its template

### Acceptance Criteria

- [x] CONTRIBUTING.md updated
- [x] Decision tree documented
- [x] READMEs link to templates

## Stage 5: Validation Script

**Status**: ❌ REMOVED (per code review I-3)

**Rationale**: Bash script would duplicate vitest validation logic, creating drift risk.
All validation is now in `tests/e2e/skill-loading.test.ts`. Use `npm test` for validation.

**Alternative**: If CI-specific validation is needed later, create a thin wrapper:
```bash
#!/bin/bash
cd tests && npm test
```

## Success Criteria

- [x] Frontmatter schemas documented in pattern file
- [x] Section validation tests passing (10 tests)
- [x] Cross-reference validation complete (README checks)
- [x] Contributor guidance in CONTRIBUTING.md (Stage 4 complete)
- [x] Validation via `npm test` (bash script removed per I-3)

## Files Created/Modified

| File | Action | Status |
|------|--------|--------|
| `tests/e2e/skill-loading.test.ts` | Modified (section + frontmatter validation) | ✅ Done |
| `docs/patterns/skill-format.md` | Already has schemas (Markdown tables) | ✅ Done |
| `CONTRIBUTING.md` | Update (guidance) | ✅ Done |
| `pbd/README.md` | Created (parity with agentic) | ✅ Done |
| `pbd/SKILL_TEMPLATE.md` | Created (contributor template) | ✅ Done |

## Anti-Patterns to Avoid

| Anti-Pattern | Why Wrong | Do Instead |
|--------------|-----------|------------|
| Force unified format | Categories serve different purposes | Validate each against its own template |
| Skip PBD validation | PBD was added later, may drift | Test both equally |
| Hardcode section names | Sections may evolve | Use constants/config |
| Ignore frontmatter types | Type mismatches cause runtime issues | Validate types strictly |

## Cross-References

- **Pattern Documentation**: `docs/patterns/skill-format.md`
- **Agentic Template**: `agentic/SKILL_TEMPLATE.md`
- **PBD Template**: `pbd/SKILL_TEMPLATE.md`
- **Current Tests**: `tests/e2e/skill-loading.test.ts`
- **Documentation Update Workflow**: `docs/workflows/documentation-update.md`

---

*Plan created 2026-02-15. Addresses alignment between Agentic and PBD skill categories.*
