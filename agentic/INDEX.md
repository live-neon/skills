# Agentic Skills Index

> Auto-generated skill registry. Last updated: 2026-02-16.

## Active Skills (7)

All skills at version **1.0.0** for ClawHub publication.

### Foundation Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [context-verifier](context-verifier/SKILL.md) | `/cv` | 1.0.0 | None | `openclaw install leegitw/context-verifier` |

### Core Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [failure-memory](failure-memory/SKILL.md) | `/fm` | 1.0.0 | context-verifier | `openclaw install leegitw/failure-memory` |
| [constraint-engine](constraint-engine/SKILL.md) | `/ce` | 1.0.0 | failure-memory | `openclaw install leegitw/constraint-engine` |

### Safety Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [safety-checks](safety-checks/SKILL.md) | `/sc` | 1.0.0 | constraint-engine | `openclaw install leegitw/safety-checks` |

### Review Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [review-orchestrator](review-orchestrator/SKILL.md) | `/ro` | 1.0.0 | failure-memory, context-verifier | `openclaw install leegitw/review-orchestrator` |

### Governance Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [governance](governance/SKILL.md) | `/gov` | 1.0.0 | constraint-engine, failure-memory | `openclaw install leegitw/governance` |

### Extensions Layer

| Skill | Alias | Version | Dependencies | Installation |
|-------|-------|---------|--------------|--------------|
| [workflow-tools](workflow-tools/SKILL.md) | `/wt` | 1.0.0 | failure-memory, constraint-engine | `openclaw install leegitw/workflow-tools` |

## Quick Install (Full Suite)

```bash
# 1. Foundation (install first - no dependencies)
openclaw install leegitw/context-verifier

# 2. Core (install in order)
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine

# 3. Additional layers (any order)
openclaw install leegitw/safety-checks
openclaw install leegitw/review-orchestrator
openclaw install leegitw/governance
openclaw install leegitw/workflow-tools
```

## Dependency Graph

```
context-verifier (Foundation)
        │
        ▼
  failure-memory (Core)
        │
   ┌────┼────┐
   │    │    │
   ▼    │    ▼
review- │  constraint-engine (Core)
orch.   │         │
        │    ┌────┼────┐
        │    │    │    │
        ▼    ▼    ▼    ▼
    governance safety workflow-
              -checks  tools
```

## Quick Command Reference

| Command | Description |
|---------|-------------|
| `/fm observe` | Record observation with R/C/D counters |
| `/fm status` | Show observation summary by evidence tier |
| `/fm search "query"` | Search failure memory |
| `/ce generate OBS-ID` | Generate constraint from observation |
| `/ce check "action"` | Check action against constraints |
| `/ce breaker status` | Check circuit breaker state |
| `/cv hash file.go` | Generate file hash |
| `/cv verify file.go` | Verify file integrity |
| `/cv packet` | Create context packet with critical files |
| `/ro twin src/` | Multi-perspective review (technical + creative) |
| `/ro multi src/` | Alias for `/ro twin` |
| `/ro cognitive file.go` | Cognitive mode review |
| `/gov state` | Show governance state |
| `/gov review` | Show constraints due for review |
| `/sc model` | Check model version pinning |
| `/sc session` | Check cross-session state |
| `/sc cache` | Check cache staleness |
| `/wt loops` | Find open loops (TODO, FIXME, etc.) |
| `/wt parallel` | Analyze parallel/serial decision |
| `/wt mce` | Analyze file for MCE compliance |

## Configuration

All skills support dual configuration paths:

| Precedence | Path | Description |
|------------|------|-------------|
| 1 (highest) | `.openclaw/[skill].yaml` | OpenClaw standard |
| 2 | `.claude/[skill].yaml` | Claude Code compatibility |
| 3 (lowest) | Built-in defaults | Fallback |

## Archive (48 Pre-Consolidation Skills)

See `_archive/2026-02-consolidation/` for archived skills.

| Layer | Archived Skills | Consolidated Into |
|-------|-----------------|-------------------|
| core/ | 12 | failure-memory, constraint-engine |
| bridge/ | 5 | (pending ClawHub integration) |
| detection/ | 4 | failure-memory |
| extensions/ | 10 | workflow-tools, safety-checks |
| governance/ | 4 | governance |
| review/ | 6 | review-orchestrator, context-verifier |
| safety/ | 4 | safety-checks |

## Metadata

| Property | Value |
|----------|-------|
| Total Active Skills | 7 |
| Total Archived Skills | 45+ |
| Layers | 6 (Foundation, Core, Safety, Review, Governance, Extensions) |
| Consolidation Date | 2026-02-15 |
| ClawHub Publication Prep | 2026-02-16 |
| Format Version | 2.0.1 |

---

*Index updated 2026-02-16. Run `/gov index` to regenerate.*
