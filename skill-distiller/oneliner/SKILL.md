---
name: Skill Distiller (One-Liner)
version: 0.2.0
description: Skill compression reminder in 100 tokens — just trigger, action, result.
author: Live Neon <lee@liveneon.ai>
homepage: https://github.com/live-neon/skills/tree/main/skill-distiller/oneliner
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
  - quick-reference
  - minimal
  - openclaw
---

# Skill Distiller (One-Liner)

Minimal reference variant (~100 tokens, 72% functionality). Full reference: `../SKILL.reference.md`.

**TRIGGER**: User asks to compress, distill, or reduce a skill's context usage

**ACTION**: Parse skill into sections (TRIGGER/INSTRUCTION/EXAMPLE/etc), score importance via LLM, remove low-value sections while preserving protected patterns (YAML name/description, N-count tracking, task creation)

**RESULT**: Compressed skill markdown with functionality score (0-100%), token reduction stats, and list of removed/kept sections

---

## Related

| Variant | Tokens | Functionality |
|---------|--------|---------------|
| [skill-distiller](../) (main) | ~400 | 89% (formula) |
| [compressed](../compressed/) | ~975 | 88% (prose) |
| **oneliner** (this) | ~100 | 72% |

Full reference: [SKILL.reference.md](../SKILL.reference.md) (~2,500 tokens)
