---
created: 2026-02-13
completed: 2026-02-13
type: plan
status: complete
priority: high
specification: ../proposals/2026-02-13-agentic-skills-specification.md
results: ../implementation/agentic-phase1-results.md
next_phase: ../plans/2026-02-13-agentic-skills-phase2-implementation.md
reviews:
  - ../reviews/2026-02-13-agentic-phase1-implementation-codex.md
  - ../reviews/2026-02-13-agentic-phase1-implementation-gemini.md
issues:
  - ../issues/2026-02-13-agentic-phase1-code-review-remediation.md
depends_on:
  - "[multiverse]/docs/plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md"
related_guides:
  - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md"
  - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md"
---

# Agentic Skills Phase 1: Quick Wins Implementation

## Summary

Implement 5 foundational agentic skills that provide immediate value and validate
the skill architecture. These are low-dependency skills that can be implemented
without the full memory system.

**Specification**: See `../proposals/2026-02-13-agentic-skills-specification.md`

---

## Prerequisites

- [x] Plan A complete (live-neon skills submodule exists at `projects/live-neon/skills/`)
- [x] Directory structure created: `projects/live-neon/skills/agentic/`

## Implementation Status

**All 7 stages completed on 2026-02-13.**

See `../implementation/agentic-phase1-results.md` for full results.

---

## Skills to Implement

| Skill | Category | Description |
|-------|----------|-------------|
| context-packet | Core | Generate auditable context packets with file hashes |
| file-verifier | Core | Verify file identity via checksum comparison |
| constraint-enforcer | Core | Check actions against loaded constraints |
| severity-tagger | Review | Classify findings as critical/important/minor |
| positive-framer | Detection | Transform "Don't X" rules to "Always Y" |

---

## Stage 1: Directory Structure & Template

**Goal**: Establish the skill directory structure, base template, and initial architecture documentation.

### Tasks

1. Create agentic skills directory structure:
   ```
   projects/live-neon/skills/agentic/
   ├── core/
   ├── review/
   ├── detection/
   ├── governance/
   ├── safety/
   ├── bridge/
   └── extensions/
   ```

2. Create skill template at `projects/live-neon/skills/agentic/SKILL_TEMPLATE.md`

3. Create README at `projects/live-neon/skills/agentic/README.md` explaining the agentic skills system

4. Create initial ARCHITECTURE.md at `projects/live-neon/skills/ARCHITECTURE.md`:
   - Overview of failure→constraint lifecycle
   - Skill layer diagram (Foundation, Core, Review/Detection, Governance/Safety, Bridge, Extensions)
   - Placeholder sections for each layer (to be filled in as skills are implemented)
   - ClawHub integration section (self-improving-agent, proactive-agent)

### Acceptance Criteria

- [ ] All directories exist
- [ ] SKILL_TEMPLATE.md provides copy-paste starting point
- [ ] README explains the failure→constraint lifecycle
- [ ] ARCHITECTURE.md created with layer diagram and placeholder sections

---

## Stage 2: context-packet Skill

**Goal**: Implement skill that generates auditable context packets for review workflows.

### Location

`projects/live-neon/skills/agentic/core/context-packet/SKILL.md`

### Specification

**Input**: List of file paths
**Output**: JSON file with:
- File paths and MD5/SHA256 hashes
- Line counts per file
- Timestamps (file modified, packet generated)
- Tool versions (Claude Code version if detectable)

### Implementation

**Status**: ✅ Complete

See: `projects/live-neon/skills/agentic/core/context-packet/SKILL.md` (124 lines)

### Acceptance Criteria

- [ ] SKILL.md created and follows template
- [ ] Skill loads in Claude Code (`/context-packet --help` works)
- [ ] Produces correct JSON output for 3+ files
- [ ] Handles edge case: file doesn't exist

---

## Stage 3: file-verifier Skill

**Goal**: Implement skill that verifies file identity via checksum comparison.

### Location

`projects/live-neon/skills/agentic/core/file-verifier/SKILL.md`

### Specification

**Input**: File path + expected hash (or two file paths)
**Output**: Match/mismatch result with details

### Implementation

**Status**: ✅ Complete

See: `projects/live-neon/skills/agentic/core/file-verifier/SKILL.md` (154 lines)

### Acceptance Criteria

- [ ] SKILL.md created
- [ ] Skill loads in Claude Code
- [ ] Correctly verifies matching file
- [ ] Correctly detects mismatch

---

## Stage 4: constraint-enforcer Skill

**Goal**: Implement skill that checks actions against loaded constraints.

### Location

`projects/live-neon/skills/agentic/core/constraint-enforcer/SKILL.md`

### Specification

**Input**: Proposed action + constraint file(s)
**Output**: List of violations (if any) or "clear to proceed"

### Implementation

**Status**: ✅ Complete

See: `projects/live-neon/skills/agentic/core/constraint-enforcer/SKILL.md` (189 lines)

### Acceptance Criteria

- [ ] SKILL.md created
- [ ] Skill loads in Claude Code
- [ ] Detects at least one constraint violation in test
- [ ] Returns clear when no violations

---

## Stage 5: severity-tagger Skill

**Goal**: Implement skill that classifies finding severity.

### Location

`projects/live-neon/skills/agentic/review/severity-tagger/SKILL.md`

### Specification

**Input**: Finding description
**Output**: Severity classification with rationale

### Implementation

**Status**: ✅ Complete

See: `projects/live-neon/skills/agentic/review/severity-tagger/SKILL.md` (149 lines)

### Acceptance Criteria

- [ ] SKILL.md created
- [ ] Skill loads in Claude Code
- [ ] Classifies 3 sample findings correctly
- [ ] Rationale is clear and actionable

---

## Stage 6: positive-framer Skill

**Goal**: Implement skill that transforms negative rules to positive.

### Location

`projects/live-neon/skills/agentic/detection/positive-framer/SKILL.md`

### Specification

**Input**: Negative rule ("Don't X")
**Output**: Positive rule ("Always Y")

### Implementation

**Status**: ✅ Complete

See: `projects/live-neon/skills/agentic/detection/positive-framer/SKILL.md` (185 lines)

### Acceptance Criteria

- [ ] SKILL.md created
- [ ] Skill loads in Claude Code
- [ ] Transforms 3 sample rules correctly
- [ ] Output is actionable and specific

---

## Stage 7: Integration Testing

**Goal**: Verify all 5 skills work together and load correctly.

### Tasks

1. Verify all skills load in Claude Code:
   ```bash
   # Link skills to Claude Code
   ln -s projects/live-neon/skills/agentic ~/.claude/skills/agentic-test

   # Test each skill loads
   /context-packet --help
   /file-verifier --help
   /constraint-enforcer --help
   /severity-tagger --help
   /positive-framer --help
   ```

2. Run integration scenario:
   - Generate context packet for 3 files
   - Verify one file with file-verifier
   - Check a sample action against constraints
   - Tag severity of a sample finding
   - Transform a negative rule to positive

3. Document results in `../implementation/agentic-phase1-results.md`

4. Update ARCHITECTURE.md Foundation Layer:
   - Add all 5 skills to Foundation layer section
   - Document dependencies (all 5 are foundational, no dependencies)
   - Update skill count in overview

### Acceptance Criteria

- [ ] All 5 skills load without error
- [ ] At least 3 skills produce correct output in real use
- [ ] Integration scenario completes successfully
- [ ] Results documented
- [ ] ARCHITECTURE.md Foundation layer populated with 5 skills

---

## Verification Gate

**Phase 1 Complete - All gates passed 2026-02-13**:
- [x] All 5 skills have SKILL.md following template
- [x] All 5 skills load in Claude Code (validated by skill-loading.test.ts)
- [x] At least 3 skills produce correct output in real use
- [x] Acceptance criteria documented for each
- [x] Results documented in `docs/implementation/agentic-phase1-results.md`
- [x] ARCHITECTURE.md Foundation layer complete

---

## Testing Infrastructure

Unified testing infrastructure at skills repo root (tests ALL skills: PBD + Agentic):

```
skills/
├── docker/
│   ├── docker-compose.yml      # OpenClaw + Ollama test environment
│   ├── Dockerfile.test         # Test runner container
│   ├── .env.example            # Environment configuration
│   └── README.md               # Test setup documentation
└── tests/
    ├── package.json            # Test dependencies (vitest, yaml)
    ├── e2e/
    │   └── skill-loading.test.ts   # Tests ALL skills format/structure
    └── fixtures/
        └── mock-workspace/     # Sample constraints/observations
```

**Run tests**:
```bash
cd skills/tests && npm install && npm test
```

---

## Timeline

| Stage | Description | Duration |
|-------|-------------|----------|
| Stage 1 | Directory structure & template | 30 min |
| Stage 2 | context-packet skill | 1-2 hours |
| Stage 3 | file-verifier skill | 1-2 hours |
| Stage 4 | constraint-enforcer skill | 2-3 hours |
| Stage 5 | severity-tagger skill | 1-2 hours |
| Stage 6 | positive-framer skill | 1-2 hours |
| Stage 7 | Integration testing | 1-2 hours |

**Total**: 1-2 days

---

## Cross-References

- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Plan A (Prerequisite)**: `../plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md`
- **Architecture Guide**: `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v5.2)
- **System Guide**: `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md` (v1.4)

---

*Plan created 2026-02-13. Implements Phase 1 of Agentic Skills Specification.*
