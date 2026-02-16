# Agentic Memory Skills

> Part of [Live Neon Skills](../README.md) — see root README for installation and PBD skills.

Skills for failure-anchored learning and constraint enforcement. These skills implement
the core insight that **AI systems learn best from consequences, not instructions**.

## Quick Start

New to agentic skills? Try these 4 commands:

```bash
# 1. Search for past failures related to your work
/fm search --query "deployment"

# 2. Check if any constraints apply to your current action
/ce check "git commit without tests"

# 3. Verify a file hasn't changed since last review
/cv verify --file src/handler.go

# 4. Run a twin review on your changes
/ro twin src/handlers/
```

**Next steps**: See [Consolidated Skills](#consolidated-skills-7) for full command reference,
or [ARCHITECTURE.md](../ARCHITECTURE.md) for system design.

## The Failure → Constraint Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAILURE DETECTED                              │
│  (test failure, user correction, review finding, runtime error) │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 OBSERVATION CREATED                              │
│  /fm detect creates/updates observation file                     │
│  R (recurrence) counter incremented                              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 HUMAN VERIFICATION                               │
│  Confirm (C+1) or Disconfirm (D+1)                               │
│  Multiple sources required for diversity                         │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              ELIGIBILITY CHECK                                   │
│  R ≥ 3 AND C ≥ 2 AND D/(C+D) < 0.2 AND sources ≥ 2              │
│  /ce generate creates candidate if eligible                      │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONSTRAINT LIFECYCLE                                │
│  draft → active → (optional: retiring → retired)                 │
│  90-day review gates                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              RUNTIME ENFORCEMENT                                 │
│  /ce check validates actions against constraints                 │
│  circuit-breaker tracks violations (5 in 30d → OPEN)            │
└─────────────────────────────────────────────────────────────────┘
```

## Consolidated Skills (7)

| Skill | Alias | Layer | Purpose |
|-------|-------|-------|---------|
| **failure-memory** | `/fm` | Core | Failure detection, observation recording, pattern search |
| **constraint-engine** | `/ce` | Core | Constraint generation, enforcement, circuit breaker |
| **context-verifier** | `/cv` | Foundation | File hashing, integrity verification, context packets |
| **review-orchestrator** | `/ro` | Review | Twin/cognitive review coordination, quality gates |
| **governance** | `/gov` | Governance | Constraint lifecycle, 90-day reviews, state management |
| **safety-checks** | `/sc` | Safety | Model pinning, fallback validation, cache checks |
| **workflow-tools** | `/wt` | Extensions | Loop detection, parallel decisions, MCE analysis |

## Directory Structure

```
agentic/
├── README.md              # This file
├── SKILL_TEMPLATE.md      # Template for new skills
├── failure-memory/        # /fm - Core memory operations
├── constraint-engine/     # /ce - Constraint enforcement
├── context-verifier/      # /cv - File integrity
├── review-orchestrator/   # /ro - Review workflows
├── governance/            # /gov - Lifecycle management
├── safety-checks/         # /sc - Runtime safety
├── workflow-tools/        # /wt - Utility tools
└── _archive/              # Archived pre-consolidation skills
    └── 2026-02-consolidation/
```

## Counter Terminology

| Counter | Meaning | Updated By |
|---------|---------|------------|
| **R** (Recurrence) | Auto-detected occurrences | `/fm detect` |
| **C** (Confirmations) | Human-verified true positives | `/fm record C` |
| **D** (Disconfirmations) | Human-verified false positives | `/fm record D` |

## Quick Reference

| Task | Command |
|------|---------|
| Detect failure | `/fm detect test` |
| Record observation | `/fm record "pattern description"` |
| Search memory | `/fm search "query"` |
| Check eligibility | `/fm status --eligible` |
| Generate constraint | `/ce generate OBS-ID` |
| Check action | `/ce check "git commit"` |
| Verify file | `/cv hash src/main.go` |
| Run twin review | `/ro twin src/handlers/` |
| Check governance | `/gov state` |
| Safety check | `/sc model` |
| Find open loops | `/wt loops` |

## ClawHub Integration

These skills are compatible with ClawHub ecosystem skills:

- **self-improving-agent@1.0.5**: `.learnings/` file format
- **proactive-agent@3.1.0**: WAL protocol, VFM scoring

See `output/VERSION.md` for format compatibility details.

## Getting Started

1. Install the skills:
   ```bash
   ln -s /path/to/skills/agentic ~/.claude/skills/agentic
   ```

2. Invoke a skill:
   ```
   /fm detect test
   /ce status
   /cv hash src/main.go
   ```

3. See skill documentation:
   ```
   cat agentic/failure-memory/SKILL.md
   ```

## Documentation

- **Architecture**: See `ARCHITECTURE.md` in parent directory
- **Consolidation Results**: See `docs/implementation/agentic-consolidation-results.md`
- **Workspace Files**: See `output/VERSION.md` for format versions
- **CJK Vocabulary**: See `docs/standards/CJK_VOCABULARY.md`

## Archive

Pre-consolidation skills (48 granular skills) are preserved in `_archive/2026-02-consolidation/`
for reference. These are no longer active and should not be used.

## License

MIT License - See [LICENSE](../LICENSE) in repository root.
