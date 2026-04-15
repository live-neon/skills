---
name: skill-distiller
version: 0.1.0
description: Compress skills while preserving functionality. Reduces context window usage by identifying and removing low-importance sections.
homepage: https://github.com/live-neon/skills/tree/main/skill-distiller
user-invocable: true
emoji: "\U0001F5DC\uFE0F"
tags:
  - compression
  - skills
  - optimization
  - context
  - openclaw
---

# Skill Distiller

## Agent Identity

**Role**: Help users compress verbose skills to reduce context window usage
**Understands**: Skills are verbose for human clarity but costly for context; compression is a trade-off
**Approach**: Identify section types, score importance, remove/shorten low-value sections
**Boundaries**: Preserve functionality, report what was removed, never hide trade-offs
**Tone**: Technical, precise, transparent about trade-offs

**Data handling**: This skill operates within your agent's trust boundary. All analysis uses your agent's configured model. No external APIs beyond your agent's LLM provider.

## When to Use

Activate this skill when the user asks:
- "Compress this skill"
- "Make this skill smaller"
- "Distill this skill to X tokens"
- "What can I remove from this skill?"
- "Reduce skill context usage"

---

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--mode` | `threshold` | Compression mode: threshold, tokens, oneliner |
| `--threshold` | `0.9` | Functionality preservation target (0.0-1.0) |
| `--tokens` | - | Target token count (for tokens mode) |
| `--provider` | `auto` | LLM provider: auto, ollama, gemini, openai |
| `--model` | - | Specific model (e.g., llama3.2, gemini-2.0-flash) |
| `--with-ci` | `false` | Calculate confidence interval (3x LLM calls, v2) |
| `--verbose` | `false` | Show section-by-section analysis |
| `--dry-run` | `false` | Analyze without outputting compressed skill |
| `--debug-stages` | `false` | Show intermediate stage outputs |

**Provider auto-detection** (in order):
1. Check `ollama` availability via `ollama list`
2. Check `GEMINI_API_KEY` environment variable
3. Check `OPENAI_API_KEY` environment variable
4. Error if none available

---

## Process

### 1. Provider Detection

```
IF ollama available → use ollama (local, fast)
ELIF GEMINI_API_KEY set → use gemini
ELIF OPENAI_API_KEY set → use openai
ELSE → Error: "No LLM provider available. Run 'ollama serve' for local inference, or set GEMINI_API_KEY for cloud."
```

### 2. Parse Skill

Parse input skill into sections:
- **Frontmatter** (YAML header with name, description)
- **Headers** (##, ### sections)
- **Code blocks** (examples, output format)
- **Lists** (triggers, constraints)
- **Prose** (explanations)

### 3. Classify Sections

Classify each section using LLM:

| Type | Importance | Compressible? |
|------|------------|---------------|
| TRIGGER | 1.0 (required) | No |
| CORE_INSTRUCTION | 1.0 (required) | No |
| CONSTRAINT | 0.9 | Partially |
| OUTPUT_FORMAT | 0.8 | Partially |
| ADVISORY_PATTERN | 0.7 | Yes, with warning |
| EXAMPLE | 0.5 | Yes (reduce count) |
| EDGE_CASE | 0.4 | Yes (summarize) |
| EXPLANATION | 0.3 | Yes (remove) |
| VERBOSE_DETAIL | 0.2 | Yes (remove first) |

**Protected patterns** (boost to 0.85+):
- YAML `name`/`description` (REQUIRED BY SPEC)
- Task creation references
- N-count tracking (N=1, N=2, N≥3)
- Checkpoint/state recovery
- BEFORE/AFTER markers

### 4. Apply Compression

**Threshold Mode** (default):
1. Sort sections by importance (descending)
2. Include sections until functionality target reached
3. Generate compressed markdown

**Token-Target Mode**:
1. Calculate minimum tokens (triggers + core)
2. If target < minimum: attempt LLM summarization
3. Add sections by importance until target

**One-Liner Mode**:
1. Extract trigger conditions
2. Extract core action
3. Extract expected result
4. Format as 3-line summary

### 5. Measure Functionality

LLM evaluates preservation:
```
Original: [full skill]
Compressed: [compressed skill]

Score 0-100: What percentage of capabilities are preserved?

Consider:
- Can all original triggers still activate?
- Are all core actions still specified?
- Are critical constraints preserved?
- Would an agent behave the same way?
```

### 6. Output Result

Return compressed skill with metadata.

---

## Output

### Standard Output

```
Functionality preserved: 90% (uncalibrated - first 5 compressions build baseline)
Tokens: 2000 → 1800 (10% reduction)
Classification confidence: 0.87 (mean across sections)

Removed: 3 examples, 2 edge cases
Kept: all triggers, core instructions, constraints

[Compressed skill markdown follows...]
```

### Verbose Output (`--verbose`)

```
Section Analysis:
  ## When to Use: TRIGGER (1.0, confidence: 0.95) → KEPT
  ## Process: CORE_INSTRUCTION (1.0, confidence: 0.92) → KEPT
  ## Examples: EXAMPLE (0.5, confidence: 0.88) → REMOVED (3 items)
  ## Edge Cases: EDGE_CASE (0.4, confidence: 0.85) → SUMMARIZED

Protected patterns found: none
Advisory patterns found: parallel-decision → removed (no score penalty)

[Compressed skill markdown follows...]
```

### One-Liner Output

```
TRIGGER: [activation conditions]
ACTION: [core behavior]
RESULT: [expected output]
```

---

## Compression Modes

### Mode 1: Threshold (Default)

Preserve X% of functionality, compress as much as possible.

```bash
/skill-distiller path/to/skill.md --threshold=0.9
```

**Why 0.9 default**: Skill functionality is normally distributed across sections. Wide tails mean some "low importance" sections occasionally carry critical value for edge cases. At 0.9, you preserve more of the tail while still achieving meaningful compression (typically 10-20% token reduction).

### Mode 2: Token Target

Compress to exact token budget.

```bash
/skill-distiller path/to/skill.md --tokens=500
```

**Token estimation**: Uses 4 chars/token heuristic. Accuracy: +/-20% vs actual provider tokenization. For precise limits, verify with provider's tokenizer.

### Mode 3: One-Liner

Extreme compression for quick reference.

```bash
/skill-distiller path/to/skill.md --mode=oneliner
```

Produces 3-line summary: TRIGGER/ACTION/RESULT

---

## Protected Patterns

These patterns **must be preserved** even if they look verbose:

| Pattern | Why Protected |
|---------|---------------|
| YAML `name`/`description` | REQUIRED by Agent Skills spec |
| Task creation | Compaction resilience |
| N-count tracking | Observation workflow |
| Checkpoint/state | State recovery |
| BEFORE/AFTER | Self-calibration |

If a protected pattern is removed, the functionality score is penalized (-10% per pattern) and flagged explicitly in output.

---

## Advisory Patterns

These patterns improve efficiency but aren't required:

| Pattern | Impact if Removed |
|---------|-------------------|
| Parallel/serial decision | Suboptimal execution order |
| Performance hints | Slower but functional |
| Caching guidance | Works but inefficient |

Advisory patterns removed are **warned** but don't penalize the functionality score.

---

## Calibration

### First Run (N=0)

```
Functionality preserved: 90% (uncalibrated - first 5 compressions build baseline)
```

No historical data exists. Estimate uses LLM-only scoring.

### After 5+ Compressions

```
Functionality preserved: 88% +/- 4% (calibrated, N=12)
```

Historical data narrows confidence interval.

### Feedback Recording

To improve calibration, report actual outcomes:
```bash
/skill-distiller feedback --id=c1 --actual=85 --outcome="worked"
```

---

## Self-Compression

This skill can compress itself (meta-recursive).

**Guardrails**:
- **Higher threshold**: Require 95% functionality (not 90%)
- **Recursion check**: Detect self-referential compression
- **Preserve original**: Output to SKILL.compressed.md, never overwrite
- **Manual verification**: Require human approval

**Why 0.95 threshold**: The distiller must remain fully functional to distill other skills. Capability loss compounds (0.95 x 0.95 = 0.90 at next level).

---

## Error Handling

| Error | Recovery Hint |
|-------|---------------|
| No content | Provide a valid SKILL.md file path or pipe content via stdin |
| No frontmatter | Add `---` block with `name` and `description` |
| No trigger section | Add '## When to Use' for best results |
| Token target impossible | Use --mode=oneliner for extreme compression |
| LLM unavailable | Run 'ollama serve' for local, or set GEMINI_API_KEY |
| Already minimal | No compression possible at threshold Y |

---

## Related

- [skill-compression-support.md](../go-pbd/docs/plans/2026-04-14-skill-compression-support.md) - CLI-based compression (Option B)
- [Agent Skills Spec](https://agentskills.io/specification) - Required fields, size constraints
