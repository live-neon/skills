---
name: Skill Distiller (One-Liner)
version: 0.1.0
description: Skill compression reminder in 100 tokens — just trigger, action, result.
author: Live Neon <lee@liveneon.ai>
homepage: https://github.com/live-neon/skills/tree/main/skill-distiller-oneliner
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

**TRIGGER**: User asks to compress, distill, or reduce a skill's context usage

**ACTION**: Parse skill into sections (TRIGGER/INSTRUCTION/EXAMPLE/etc), score importance via LLM, remove low-value sections while preserving protected patterns (YAML name/description, N-count tracking, task creation)

**RESULT**: Compressed skill markdown with functionality score (0-100%), token reduction stats, and list of removed/kept sections

---

## Related

- [skill-distiller](../skill-distiller/) — Full variant (~2,500 tokens)
- [skill-distiller-compressed](../skill-distiller-compressed/) — Prose variant (~975 tokens)
- [skill-distiller-formula](../skill-distiller-formula/) — Math notation (~400 tokens)
