# Skills Documentation

Documentation for the Live Neon Skills project.

> **Note**: This is a navigation index for documentation. For system architecture,
> see [ARCHITECTURE.md](../ARCHITECTURE.md).

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `guides/` | Technical deep-dives (semantic similarity, core memory walkthrough) |
| `implementation/` | Phase results and acceptance verification |
| `issues/` | Review findings and remediation tracking |
| `patterns/` | Validated patterns (N≥3 evidence) |
| `plans/` | Implementation plans for each phase |
| `proposals/` | Specifications and architectural proposals |
| `research/` | External research on hooks, learning theory, and industry patterns |
| `reviews/` | Code review and twin review outputs |
| `standards/` | Authoritative standards (CJK vocabulary, security compliance) |
| `templates/` | Reusable templates (governance alerts) |
| `workflows/` | Process documentation (skill creation, publishing, documentation updates) |

## Key Documents

- **[Specification](proposals/2026-02-13-agentic-skills-specification.md)** - Main agentic skills specification
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture (layers, data flow, skills inventory)
- **[Phase Results](implementation/)** - Implementation status by phase
- **[Skill Format Pattern](patterns/skill-format.md)** - Why Agentic and PBD use different formats

## Quick Navigation

### By Phase

| Phase | Plan | Results | Description |
|-------|------|---------|-------------|
| Phase 1 | [Plan](plans/2026-02-13-agentic-skills-phase1-implementation.md) | [Results](implementation/agentic-phase1-results.md) | Foundation layer |
| Phase 2 | [Plan](plans/2026-02-13-agentic-skills-phase2-implementation.md) | [Results](implementation/agentic-phase2-results.md) | Core layer |
| Phase 3 | [Plan](plans/2026-02-13-agentic-skills-phase3-implementation.md) | [Results](implementation/agentic-phase3-results.md) | Governance layer |
| Phase 4 | [Plan](plans/2026-02-14-agentic-skills-phase4-implementation.md) | [Results](implementation/agentic-phase4-results.md) | Safety layer |
| Phase 5 | [Plan](plans/2026-02-14-agentic-skills-phase5-implementation.md) | [Results](implementation/agentic-phase5-results.md) | Bridge layer |
| Phase 5B | [Plan](plans/2026-02-15-agentic-skills-phase5b-implementation.md) | [Results](implementation/agentic-phase5b-results.md) | ClawHub compatibility |
| Phase 6 | [Plan](plans/2026-02-15-agentic-skills-phase6-implementation.md) | [Results](implementation/agentic-phase6-results.md) | Extensions layer |
| Phase 7 | [Plan](plans/2026-02-15-agentic-skills-phase7-implementation.md) | [Results](implementation/agentic-phase7-results.md) | Architecture finalization |
| Consolidation | [Plan](plans/2026-02-15-agentic-skills-consolidation.md) | [Results](implementation/agentic-consolidation-results.md) | 48 → 7 skills |

### Workflows

| Workflow | Purpose |
|----------|---------|
| [Creating a New Skill](workflows/creating-new-skill.md) | Complete skill creation from validation to publication |
| [Skill Publishing](workflows/skill-publish.md) | Publishing workflow with security compliance |
| [Documentation Update](workflows/documentation-update.md) | Process for updating docs when skills/architecture change |
| [Phase Completion](workflows/phase-completion.md) | Phase completion checklist |
| [Batch File Modification](workflows/batch-file-modification.md) | Bulk file changes with verification |

### Standards

| Standard | Purpose |
|----------|---------|
| [CJK Vocabulary](standards/CJK_VOCABULARY.md) | Skill aliases, sub-commands, math notation (agent-facing) |
| [Security Compliance](standards/skill-security-compliance.md) | **Authoritative** ClawHub security requirements |

### Research

| Document | Purpose |
|----------|---------|
| [Consequences-Based Learning](research/2026-02-16-consequences-based-learning-llm-research.md) | External validation of R/C/D counters, RLVR, self-improving agents |
| [OpenClaw/ClawHub Hooks](research/2026-02-15-openclaw-clawhub-hooks-research.md) | Three hook systems, SKILL.md format, case studies |
| [Soft Hook Enforcement](research/2026-02-15-soft-hook-enforcement-patterns.md) | Three-Layer Model, HEARTBEAT verification, compliance patterns |

### Backlog

Future work with explicit triggers: [BACKLOG.md](plans/BACKLOG.md)

## See Also

- **[Skills README](../README.md)** - Project overview and quick start
- **[Agentic README](../agentic/README.md)** - Agentic skills layer overview
- **[PBD README](../pbd/README.md)** - PBD skills layer overview
- **[Tests README](../tests/README.md)** - Testing documentation

---

*Documentation migrated 2026-02-15 from multiverse/docs/ for submodule cohesion.*
