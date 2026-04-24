# Live Neon Skills

OpenClaw/Claude Code skills for AI-assisted development.

## The Problem

AI assistants make the same mistakes repeatedly because they don't learn from failures.
They can be told "don't do X" but have no memory to enforce it. Instructions alone
aren't enough—they're forgotten between sessions, ignored under pressure, and easily
bypassed through rephrasing.

## The Solution

Live Neon Skills provide **failure-anchored learning**—a system where AI mistakes
become constraints that prevent recurrence. When a failure happens enough times (R≥3)
and is verified by humans (C≥2), it automatically becomes an enforced rule.

```
Failure detected → Observation created → Human verified → Constraint generated → Runtime enforced
```

These skills make AI assistants self-correcting. See [agentic/README.md](agentic/README.md)
for the full failure-to-constraint lifecycle.

## Installation

**ClawHub (recommended)**:
```bash
# Install individual skills via OpenClaw
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine
# See agentic/README.md for full installation order

# Skill-distiller uses neon- prefix (base slug was taken)
openclaw install neon-skill-distiller
```

**Manual (Claude Code users)**:
```bash
# Clone to your Claude Code skills directory
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon

# Or symlink specific skills
ln -s /path/to/skills/skill-distiller ~/.claude/skills/skill-distiller
```

## Getting Started

**Which skill should I start with?**

| Goal | Start With | Then Add |
|------|------------|----------|
| **Extract principles from text** | `essence-distiller` | `pattern-finder` for comparison |
| **Prevent AI from repeating mistakes** | `context-verifier` | `failure-memory` → `constraint-engine` |
| **Full failure-to-constraint lifecycle** | Install in order below | - |

**Recommended installation order for agentic skills**:
```bash
# 1. Foundation (no dependencies)
openclaw install leegitw/context-verifier

# 2. Core (builds on foundation)
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine

# 3. Extended (builds on core)
openclaw install leegitw/safety-checks
openclaw install leegitw/review-orchestrator
openclaw install leegitw/governance
openclaw install leegitw/workflow-tools
```

**PBD skills** work standalone — install any one to start extracting principles.

## Available Skills

### PBD (Principle-Based Development)

Skills for extracting and synthesizing invariant principles from text.

| Skill | Description |
|-------|-------------|
| [essence-distiller](pbd/essence-distiller/) | User-friendly principle extraction |
| [pbe-extractor](pbd/pbe-extractor/) | Technical principle extraction |
| [pattern-finder](pbd/pattern-finder/) | Compare two extractions |
| [core-refinery](pbd/core-refinery/) | Synthesize N>=3 extractions |
| [golden-master](pbd/golden-master/) | Track source/derived provenance |
| [principle-comparator](pbd/principle-comparator/) | Compare principles |
| [principle-synthesizer](pbd/principle-synthesizer/) | Synthesize principles |

### Agentic (Failure-Anchored Learning)

Skills for failure detection, constraint enforcement, and memory operations. See [agentic/README.md](agentic/README.md) for the full lifecycle.

| Skill | Alias | Layer | Description |
|-------|-------|-------|-------------|
| failure-memory | `/fm` | Core | Failure tracking, observations, pattern detection |
| constraint-engine | `/ce` | Core | Constraint generation, enforcement, circuit breaker |
| context-verifier | `/cv` | Foundation | File hashes, integrity verification |
| review-orchestrator | `/ro` | Review | Twin and cognitive review coordination |
| governance | `/gov` | Governance | Constraint lifecycle, state management |
| safety-checks | `/sc` | Safety | Model pinning, fallbacks, session state |
| workflow-tools | `/wt` | Extensions | Loop detection, parallel decisions, MCE |

**Consolidated architecture** — 7 skills (from 48 granular). See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

### Utility (Meta-Skills)

Skills for operating on other skills.

| Skill | Tokens | Description |
|-------|--------|-------------|
| [skill-distiller](skill-distiller/) | ~400 | Default (formula notation, 89% functionality) |
| [compressed](skill-distiller/compressed/) | ~975 | Prose variant (88% functionality) |
| [oneliner](skill-distiller/oneliner/) | ~100 | Quick reference (72% functionality) |

Full reference: `skill-distiller/SKILL.reference.md` (~2,500 tokens, 91%)

**Install**: `openclaw install neon-skill-distiller`

**Manual**:
```bash
ln -s /path/to/skills/skill-distiller ~/.claude/skills/skill-distiller
```

### Creative (Synthesis & Artifact Generation)

Skills for transforming technical work into creative artifacts for reflection and knowledge transfer.

| Skill | Alias | Description |
|-------|-------|-------------|
| [insight-song](creative/insight-song/) | `/song` | Create original Suno-ready songs from insights |
| [song-remix](creative/song-remix/) | `/remix` | Transform existing songs (Twin Remix method) |
| [visual-concept](creative/visual-concept/) | `/vc` | Transform insights into visual concept guides |
| [ted-talk](creative/ted-talk/) | `/ted` | Transform insights into full TED talks |
| [side-quests](creative/side-quests/) | `/sq` | **Combo**: song + visual + TED talk |

## Usage

After installation, invoke skills in Claude Code:

```
/essence-distiller [content]
/pbe-extractor [content]
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for how skills work together, including:
- Skill layer diagram (Foundation → Core → Review/Detection → Governance/Safety)
- Failure → Constraint lifecycle
- ClawHub integration points

## ClawHub Integration

These skills integrate with ClawHub skills via shared workspace files:

| ClawHub Skill | Integration | What We Provide |
|---------------|-------------|-----------------|
| `self-improving-agent` | Reads our learnings | `.learnings/LEARNINGS.md`, `.learnings/ERRORS.md` |
| `proactive-agent` | Reads our constraints | `output/constraints/`, `SESSION-STATE.md` |
| `VFM system` | Reads constraint metadata | `output/constraints/metadata.json` |

**File format compatibility**: See [output/VERSION.md](output/VERSION.md) for version pinning.

**Workspace structure**:
```
.learnings/                  # self-improving-agent format
├── LEARNINGS.md             # [LRN-YYYYMMDD-XXX] corrections
├── ERRORS.md                # [ERR-YYYYMMDD-XXX] failures
└── FEATURE_REQUESTS.md      # [FEAT-YYYYMMDD-XXX] requests

output/
├── constraints/             # Constraint storage
├── context-packets/         # File hash packets
└── hooks/                   # Hook execution logs
```

## Guides

Technical guides for skill implementation:

| Guide | Description |
|-------|-------------|
| [Semantic Similarity](docs/guides/SEMANTIC_SIMILARITY_GUIDE.md) | LLM-based action classification (required for safety-critical skills) |
| [Core Memory Walkthrough](docs/guides/CORE_MEMORY_WALKTHROUGH.md) | Core memory layer implementation guide |

## Workflows

| Workflow | Description |
|----------|-------------|
| [Creating a New Skill](docs/workflows/creating-new-skill.md) | Complete skill creation from validation to publication |
| [Skill Publishing](docs/workflows/skill-publish.md) | Publishing workflow with security compliance |
| [Documentation Update](docs/workflows/documentation-update.md) | Process for updating docs when skills/architecture change |
| [Phase Completion](docs/workflows/phase-completion.md) | Checklist for completing implementation phases |
| [Batch File Modification](docs/workflows/batch-file-modification.md) | Bulk file changes with verification |

## Documentation

Implementation history and specifications:

| Directory | Description |
|-----------|-------------|
| [docs/](docs/README.md) | Documentation index |
| [docs/patterns/](docs/patterns/) | Validated patterns (N≥3 evidence) |
| [docs/proposals/](docs/proposals/) | Specifications and proposals |
| [docs/plans/](docs/plans/) | Implementation plans (phases 1-7) |
| [docs/research/](docs/research/) | External research (hooks, learning theory, industry patterns) |
| [docs/issues/](docs/issues/) | Review findings and issues |
| [docs/reviews/](docs/reviews/) | Code and twin reviews |
| [docs/implementation/](docs/implementation/) | Phase results |

## Testing

Unified test infrastructure for all skills. See [tests/README.md](tests/README.md) for full documentation.

```bash
cd tests && npm install && npm test
```

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (PBD + Agentic) |
| `npm run test:pbd` | Run PBD skill tests only |
| `npm run test:agentic` | Run Agentic skill tests only |

Docker-based testing with OpenClaw: see [docker/README.md](docker/README.md).

## Philosophy

- **Open methodology** — Give away the "how"
- **Provenance-first** — Track where ideas come from
- **Failure-anchored** — Learn from consequences, not instructions
- **Community-driven** — Accept contributions

## Publishing Skills

Want to add or update skills? See [docs/workflows/skill-publish.md](docs/workflows/skill-publish.md).

For optional ClawHub publishing, copy [.env.example](.env.example) to `.env` and add your token.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Related Projects

- **[NEON-SOUL](https://github.com/live-neon/neon-soul)** - Soul synthesis using these PBD skills for principle extraction and compression.
- **[Obviously-Not/patent-skills](https://github.com/Obviously-Not/patent-skills)** - Proprietary patent-specific skills (code-patent-scanner, patent-validator). PBD skills were migrated from there to this open-source repo.

## License

MIT License - see [LICENSE](LICENSE)

---

*Built by twins in Alaska.*

---

## Part of Live Neon

This is a submodule of [live-neon](https://github.com/live-neon/live-neon), the umbrella repository for AI agent infrastructure.

| Related | Link |
|---------|------|
| **Architecture** | [docs/vision/README.md](../docs/vision/README.md) |
| **automation** | Uses skills in agentic workflows |
| **garden** | Validates skill-extracted patterns via N-count |
| **go-pbd** | PBD skills wrap the go-pbd CLI |
