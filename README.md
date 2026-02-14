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

```bash
# Clone to your Claude Code skills directory
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

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

| Skill | Layer | Description |
|-------|-------|-------------|
| [context-packet](agentic/core/context-packet/) | Foundation | Generate auditable context with file hashes |
| [file-verifier](agentic/core/file-verifier/) | Foundation | Verify file identity via checksum |
| [constraint-enforcer](agentic/core/constraint-enforcer/) | Foundation | Check actions against constraints |
| [severity-tagger](agentic/review/severity-tagger/) | Foundation | Classify findings (critical/important/minor) |
| [positive-framer](agentic/detection/positive-framer/) | Foundation | Transform "Don't X" → "Always Y" |

**Phase 1 complete** — See [docs/implementation/agentic-phase1-results.md](docs/implementation/agentic-phase1-results.md) for details.

## Usage

After installation, invoke skills in Claude Code:

```
/essence-distiller [content]
/pbe-extractor [content]
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for how skills work together, including:
- Skill layer diagram (Foundation → Core → Review/Detection → Governance/Safety → Bridge)
- Failure → Constraint lifecycle
- ClawHub integration points

## Guides

Technical guides for skill implementation:

| Guide | Description |
|-------|-------------|
| [Semantic Similarity](docs/guides/SEMANTIC_SIMILARITY_GUIDE.md) | LLM-based action classification (required for safety-critical skills) |

## Workflows

| Workflow | Description |
|----------|-------------|
| [Documentation Update](docs/workflows/documentation-update.md) | Process for updating docs when skills/architecture change |

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
