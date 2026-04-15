---
name: skill-distiller-oneliner
version: 0.1.0
description: Compress skills while preserving functionality (one-liner reference)
user-invocable: true
emoji: "\U0001F5DC\uFE0F"
tags: [compression, skills, optimization, openclaw]
---

# Skill Distiller (One-Liner)

**TRIGGER**: User asks to compress, distill, or reduce a skill's context usage

**ACTION**: Parse skill into sections (TRIGGER/INSTRUCTION/EXAMPLE/etc), score importance via LLM, remove low-value sections while preserving protected patterns (YAML name/description, N-count tracking, task creation)

**RESULT**: Compressed skill markdown with functionality score (0-100%), token reduction stats, and list of removed/kept sections
