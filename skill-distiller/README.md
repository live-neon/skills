# Skill Distiller

Compress skills while preserving functionality. Reduces context window usage by removing low-importance sections (examples, explanations) while keeping triggers and core instructions.

**This skill practices what it preaches** — the main `SKILL.md` ships in formula notation (~400 tokens, 89% functionality). Full human-readable version available in `SKILL.reference.md`.

## Skill Variants

| Variant | Command | Tokens | Functionality | Use When |
|---------|---------|--------|---------------|----------|
| **Main** | `/skill-distiller` | ~400 | 89% | Default — formula notation, self-compressed |
| **Compressed** | `/skill-distiller-compressed` | ~975 | 88% | Prose variant, more readable |
| **One-liner** | `/skill-distiller-oneliner` | ~100 | 72% | Quick reference only |
| **Reference** | `SKILL.reference.md` | ~2,500 | 91% | Full docs, human reading |

**Note**: `skill-distiller-formula` is now redundant — the main skill uses formula notation by default.

## Quick Start (30 seconds)

1. **Install**: `openclaw install neon-skill-distiller`
2. **Run**: `/skill-distiller path/to/skill.md`
3. **See output**: Compressed skill + what was removed

**Example**:
```
$ /skill-distiller my-skill/SKILL.md --threshold=0.9

Functionality preserved: 90% (uncalibrated)
Tokens: 2000 -> 1800 (10% reduction)
Removed: 3 examples, 2 edge cases
Kept: all triggers, core instructions, constraints

[Compressed skill output follows...]
```

## Installation

**ClawHub (recommended)**:
```bash
openclaw install neon-skill-distiller
```

**Manual (Claude Code users)**:
```bash
# Clone to your Claude Code skills directory
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

## Invocation Methods

| Method | Command | Context |
|--------|---------|---------|
| **Slash command** | `/skill-distiller path/to/skill.md` | Claude Code, Cursor, any Agent Skills-compatible tool |
| **Piped** | `cat skill.md \| /skill-distiller` | Stdin input |

## Usage

```bash
# Threshold mode (preserve 90% functionality, default)
/skill-distiller path/to/skill.md --threshold=0.9

# Aggressive compression (80% - use when context is tight)
/skill-distiller path/to/skill.md --threshold=0.8

# Token target mode
/skill-distiller path/to/skill.md --tokens=500

# One-liner mode
/skill-distiller path/to/skill.md --mode=oneliner

# Dry run (analyze without outputting compressed skill)
/skill-distiller path/to/skill.md --dry-run

# Verbose output (show section-by-section analysis)
/skill-distiller path/to/skill.md --verbose
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--mode` | `threshold` | Compression mode: threshold, tokens, oneliner |
| `--threshold` | `0.9` | Functionality target (0.0-1.0) |
| `--tokens` | - | Target token count |
| `--provider` | `auto` | LLM provider: ollama, gemini, openai |
| `--verbose` | `false` | Show section-by-section analysis |
| `--dry-run` | `false` | Analyze without outputting compressed skill |
| `--with-ci` | `false` | Calculate confidence interval — **planned, not yet implemented** |

## Compression Modes

### Threshold Mode (Default)

Preserve X% of functionality, compress as much as possible.

```bash
/skill-distiller skill.md --threshold=0.9
```

**Why 0.9 default**: Skill functionality is normally distributed. Wide tails mean some "low importance" sections occasionally carry critical value. At 0.9, you preserve more of the tail while still achieving 10-20% token reduction.

### Token Target Mode

Compress to exact token budget.

```bash
/skill-distiller skill.md --tokens=500
```

**Token estimation**: Uses 4 chars/token heuristic. Accuracy: +/-20% vs actual provider tokenization.

### One-Liner Mode

Extreme compression for quick reference.

```bash
/skill-distiller skill.md --mode=oneliner
```

Output format:
```
TRIGGER: [activation conditions]
ACTION: [core behavior]
RESULT: [expected output]
```

### Formula Mode (default)

The main skill uses formula notation — legend + math that the LLM executes directly.

**Benefits**:
- ~400 tokens (vs ~975 for compressed prose)
- Mathematically precise — no ambiguity
- Executable — formula IS the algorithm

See `SKILL.md` for the formula, `SKILL.reference.md` for full prose documentation.

## Protected Patterns

These patterns are **never removed** even if they look verbose:

| Pattern | Why Protected |
|---------|---------------|
| YAML `name`/`description` | REQUIRED by Agent Skills spec |
| Task creation | Compaction resilience |
| N-count tracking | Observation workflow |
| Checkpoint/state | State recovery |

If a protected pattern is removed, the functionality score is penalized (-10% per pattern).

## Calibration

The skill learns from usage:

- **First run (N=0)**: Uses LLM-only scoring, wide confidence interval
- **After 5+ compressions**: Historical data narrows confidence interval

To improve calibration, report actual outcomes:
```bash
/skill-distiller feedback --id=c1 --actual=85 --outcome="worked"
```

## Related

- [Agent Skills Spec](https://agentskills.io/specification) - Required fields, size constraints
- [skill-distiller-llm.md](../../go-pbd/docs/plans/2026-04-14-skill-distiller-llm.md) - Implementation plan (Complete)
- [skill-compression-support.md](../../go-pbd/docs/plans/2026-04-14-skill-compression-support.md) - CLI-based compression (Option B, Draft)

## Files & Variants

| Directory | Purpose | ClawHub |
|-----------|---------|---------|
| `skill-distiller/` | Main skill (formula, ~400 tokens) | `neon-skill-distiller` |
| `skill-distiller-compressed/` | Prose variant (~975 tokens) | `neon-skill-distiller-compressed` |
| `skill-distiller-oneliner/` | Quick reference (~100 tokens) | `neon-skill-distiller-oneliner` |

**Note**: `skill-distiller-formula/` is deprecated — main skill now uses formula notation.

**Local Files**:
| File | Purpose |
|------|---------|
| `SKILL.md` | Formula-compressed skill (~400 tokens) |
| `SKILL.reference.md` | Full human-readable version (~2,500 tokens) |
| `test_integration.sh` | Ollama-based integration tests |
| `testdata/` | Test fixtures |
| `.learnings/skill-distiller/calibration.jsonl` | Compression calibration data |

## License

MIT License
