---
name: Skill Distiller (Formula)
version: 0.1.0
description: Skill compression in 400 tokens — math notation the LLM executes directly.
author: Live Neon <lee@liveneon.ai>
homepage: https://github.com/live-neon/skills/tree/main/skill-distiller-formula
repository: live-neon/skills
license: MIT
user-invocable: true
disable-model-invocation: true
emoji: "\U0001F5DC\uFE0F"
tags:
  - compression
  - skills
  - optimization
  - context-window
  - token-reduction
  - math-notation
  - formula
  - openclaw
---

# Skill Distiller (Formula)

> **DEPRECATED**: The main `skill-distiller` now ships in formula notation. Use `/skill-distiller` instead.
> This variant is kept for users who explicitly installed `neon-skill-distiller-formula`.

## Legend

```
S = {TRIGGER, CORE, CONSTRAINT, OUTPUT, EXAMPLE, EDGE, EXPLAIN, VERBOSE}
I(s) ∈ [0,1]        # importance score
P = {yaml.name, yaml.desc, N-count, task-create, checkpoint}  # protected
θ ∈ [0,1]           # threshold (default 0.9)
n ∈ ℕ               # target tokens
```

## Operations

### compress(skill, θ)
```
∀s ∈ skill: type(s) → S, score(s) → I(s)
s ∈ P ⇒ I(s) := max(I(s), 0.85)
keep = {s | I(s) ≥ θ ∨ s ∈ P}
output = (skill[keep], Σ I(keep)/|S|, |skill| - |keep|)
```

### compress_tokens(skill, n)
```
min_tokens = |{s | type(s) ∈ {TRIGGER, CORE}}|
n < min_tokens ⇒ summarize(skill) → n
n ≥ min_tokens ⇒ compress(skill, θ) where |output| ≤ n
```

### oneliner(skill)
```
output = "TRIGGER: " + extract(skill, TRIGGER) +
         "\nACTION: " + extract(skill, CORE) +
         "\nRESULT: " + extract(skill, OUTPUT)
```

### recomp(examples, coverage_target=0.8)
```
scored = [(e, pattern_coverage(e), uniqueness(e)) | e ∈ examples]
selected = top(scored, n=2, by=coverage × uniqueness)
coverage(selected) ≥ 0.8 ⇒ phase1
  output = selected ∪ {trigger(e) → result(e) | e ∈ examples \ selected}
coverage(selected) < 0.8 ⇒ phase2
  output = synthesize(examples) → single_example
```

### token_score(section) — for type ∈ {EXAMPLE, EDGE, EXPLAIN, VERBOSE}
```
∀phrase ∈ section:
  self_info(phrase) = -log(P(phrase|context))
  high_info ⇒ KEEP, low_info ⇒ PRUNE
prune while preserving sentence structure
>50% low_info ⇒ remove entire section
```

## Symbols (MetaGlyph)

| Symbol | Meaning |
|--------|---------|
| `→` | results in, maps to |
| `⇒` | implies, therefore |
| `∈` | element of, in |
| `∀` | for all |
| `¬` | not |
| `∧` | and |
| `∨` | or |
| `:=` | assign |

## Quick Reference

```
/skill-distiller path --threshold=0.9  →  compress(skill, 0.9)
/skill-distiller path --tokens=500     →  compress_tokens(skill, 500)
/skill-distiller path --mode=oneliner  →  oneliner(skill)
```

## Errors

| Condition | Response |
|-----------|----------|
| `skill = ∅` | "No content" |
| `¬∃ yaml.name` | "Add frontmatter" |
| `n < min_tokens` | "Summarizing..." |

---

## Related

> **Use [skill-distiller](../skill-distiller/) instead** — main skill now uses formula notation.

| Variant | Tokens | Functionality |
|---------|--------|---------------|
| [skill-distiller](../skill-distiller/) (main) | ~400 | 89% (formula) |
| [skill-distiller-compressed](../skill-distiller-compressed/) | ~975 | 88% (prose) |
| [skill-distiller-oneliner](../skill-distiller-oneliner/) | ~100 | 72% |
