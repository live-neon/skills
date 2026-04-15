# Skill Distiller (Formula)

Math notation variant of skill-distiller (~400 tokens).

Uses legend + mathematical formulas instead of prose. The LLM reads and executes the formulas.

## Installation

```bash
openclaw install neon-skill-distiller-formula
```

## Usage

```bash
/skill-distiller-formula path/to/skill.md
```

## How It Works

The skill defines operations in mathematical notation:

```
## Legend
S = {TRIGGER, CORE, CONSTRAINT, ...}  # section types
I(s) ∈ [0,1]                          # importance score
P = {yaml.name, N-count, ...}         # protected patterns

## Compress
keep = {s | I(s) ≥ θ ∨ s ∈ P}
output = (skill[keep], score, Δtokens)
```

The LLM reads the legend, understands the operations, and executes them on the target skill.

## Related Variants

| Variant | Tokens | Functionality |
|---------|--------|---------------|
| [skill-distiller](../skill-distiller/) | ~2,500 | 91% |
| [skill-distiller-compressed](../skill-distiller-compressed/) | ~975 | 88% |
| **skill-distiller-formula** | ~400 | 89% |
| [skill-distiller-oneliner](../skill-distiller-oneliner/) | ~100 | 72% |

## License

MIT License
