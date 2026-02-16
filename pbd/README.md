# Principle-Based Design (PBD) Skills

> Part of [Live Neon Skills](../README.md) — see root README for installation and Agentic skills.

Skills for extracting, comparing, and synthesizing principles from content. These skills implement
the core insight that **understanding shows in compression that preserves meaning**.

## Quick Start

New to PBD skills? Try this workflow:

```bash
# 1. Extract principles from content
/essence-distiller "paste your content here"

# 2. Compare two extractions to find patterns
/pattern-finder extraction1.json extraction2.json

# 3. Synthesize 3+ extractions into golden masters
/core-refinery extraction1.json extraction2.json extraction3.json
```

**Next steps**: See [Skills (7)](#skills-7) for full reference,
or [The N-Count System](#the-n-count-system) for validation methodology.

## The Extraction → Synthesis Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT PROVIDED                              │
│  (documentation, methodology, philosophy, notes, transcripts)    │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EXTRACTION (N=1)                                 │
│  essence-distiller or pbe-extractor                              │
│  Content → Principles with confidence levels                     │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COMPARISON (N=2)                                 │
│  pattern-finder or principle-comparator                          │
│  Two extractions → Shared patterns, unique principles            │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SYNTHESIS (N≥3)                                  │
│  core-refinery                                                   │
│  3+ extractions → Invariants and Golden Masters                  │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 TRACKING                                         │
│  golden-master                                                   │
│  Manage source/derived relationships                             │
└─────────────────────────────────────────────────────────────────┘
```

## Skills (7)

| Skill | Emoji | Purpose | Voice |
|-------|-------|---------|-------|
| **essence-distiller** | ✨ | Extract principles from content | Warm, conversational |
| **pbe-extractor** | 📊 | Extract principles with detailed metrics | Technical, precise |
| **pattern-finder** | 🧭 | Find shared patterns in two sources | Curious, detective-like |
| **principle-comparator** | ⚖️ | Compare with detailed alignment analysis | Technical, precise |
| **core-refinery** | 🔥 | Synthesize 3+ sources into invariants | Warm, synthesis-focused |
| **golden-master** | 👑 | Track source/derived relationships | Authoritative |
| **principle-synthesizer** | 🧬 | Alternative synthesis with different approach | Technical, precise |

### Voice Pairs

Some skills have two voices for the same operation:

| Operation | Warm Voice | Technical Voice |
|-----------|------------|-----------------|
| **Extraction** | essence-distiller | pbe-extractor |
| **Comparison** | pattern-finder | principle-comparator |

Use warm voice for discovery and exploration. Use technical voice for documentation and automation.

## Directory Structure

```
pbd/
├── README.md              # This file
├── SKILL_TEMPLATE.md      # Template for new skills
├── essence-distiller/     # Warm extraction
├── pbe-extractor/         # Technical extraction
├── pattern-finder/        # Warm comparison
├── principle-comparator/  # Technical comparison
├── core-refinery/         # Synthesis (N≥3)
├── golden-master/         # Relationship tracking
└── principle-synthesizer/ # Alternative synthesis
```

## The N-Count System

| Level | What It Means | Action |
|-------|---------------|--------|
| **N=1** | Single source | Interesting but unvalidated |
| **N=2** | Two sources agree | Validated pattern! |
| **N≥3** | Three+ sources | Candidate for Golden Master |

**Why this matters**: N=1 is an observation. N=2 is validation. N≥3 is an invariant.

## Quick Reference

| Task | Command |
|------|---------|
| Extract principles | `/essence-distiller "content"` |
| Extract with metrics | `/pbe-extractor "content"` |
| Find shared patterns | `/pattern-finder A B` |
| Compare with details | `/principle-comparator A B` |
| Synthesize invariants | `/core-refinery A B C` |
| Track relationships | `/golden-master register P1` |

## Required Disclaimer

PBD skills extract patterns from content, not verified truth. Principles are observations that
require validation (N≥2 from independent sources) and human judgment. A clearly stated principle
is extractable, not necessarily correct.

## Getting Started

1. Install the skills:
   ```bash
   ln -s /path/to/skills/pbd ~/.claude/skills/pbd
   ```

2. Invoke a skill:
   ```
   /essence-distiller "paste content here"
   /pattern-finder extraction1 extraction2
   ```

3. See skill documentation:
   ```
   cat pbd/essence-distiller/SKILL.md
   ```

## Documentation

- **Architecture**: See `ARCHITECTURE.md` in parent directory
- **Agentic Skills**: See `agentic/README.md` for system infrastructure skills

## License

MIT License - See [LICENSE](../LICENSE) in repository root.

---

*Built by Obviously Not — Tools for thought, not conclusions.*
