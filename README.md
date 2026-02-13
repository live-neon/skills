# Live Neon Skills

OpenClaw/Claude Code skills for AI-assisted development.

## Installation

```bash
# Clone to your Claude Code skills directory
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

## Available Skills

### PBD (Principle-Based Development)

| Skill | Description |
|-------|-------------|
| [essence-distiller](pbd/essence-distiller/) | User-friendly principle extraction |
| [pbe-extractor](pbd/pbe-extractor/) | Technical principle extraction |
| [pattern-finder](pbd/pattern-finder/) | Compare two extractions |
| [core-refinery](pbd/core-refinery/) | Synthesize N>=3 extractions |
| [golden-master](pbd/golden-master/) | Track source/derived provenance |
| [principle-comparator](pbd/principle-comparator/) | Compare principles |
| [principle-synthesizer](pbd/principle-synthesizer/) | Synthesize principles |

## Usage

After installation, invoke skills in Claude Code:

```
/essence-distiller [content]
/pbe-extractor [content]
```

## Philosophy

- **Open methodology** — Give away the "how"
- **Provenance-first** — Track where ideas come from
- **Community-driven** — Accept contributions

## Publishing Skills

Want to add or update skills? See [docs/workflows/skill-publish.md](docs/workflows/skill-publish.md).

For optional ClawHub publishing, copy [.env.example](.env.example) to `.env` and add your token.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

---

*Built by twins in Alaska.*
