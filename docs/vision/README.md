# Skills Vision

**Purpose**: Strategic direction for Live Neon skills ecosystem.
**Time Horizon**: Medium-term (6-12 months)
**Last Updated**: 2026-04-24

**Related**: [Root README](../../README.md) (implementation) | [Architecture](../architecture/README.md)

---

## The One-Liner

> **AI that learns from mistakes, not just instructions.**

Skills provide failure-anchored learning — a system where AI mistakes become constraints that prevent recurrence.

---

## The Problem

AI assistants make the same mistakes repeatedly because they don't learn from failures. They can be told "don't do X" but have no memory to enforce it. Instructions alone aren't enough — they're forgotten between sessions, ignored under pressure, and easily bypassed through rephrasing.

---

## The Solution

When a failure happens enough times (R>=3) and is verified by humans (C>=2), it automatically becomes an enforced rule:

```
Failure detected → Observation created → Human verified → Constraint generated → Runtime enforced
```

---

## Skill Categories

| Category | Purpose |
|----------|---------|
| Agentic | Memory and constraint skills for AI-assisted development |
| PBD | Principle-Based Development skills for human developers |
| Creative | Content generation and ideation skills |

---

## Goals

- **Self-correcting AI**: Mistakes become constraints automatically
- **Human-in-the-loop**: Verification before enforcement
- **Cross-project learning**: Patterns benefit all projects
- **ClawHub distribution**: Skills installable via `openclaw install`

---

## Non-Goals

- **Not a framework**: Skills are standalone, not a runtime
- **Not fully autonomous**: Human verification required
- **Not model-specific**: Skills work across LLM providers

---

## Success Criteria

- [ ] R>=3 failures automatically generate constraints
- [ ] C>=2 human verification before enforcement
- [ ] Circuit breaker prevents runaway failures
- [ ] Skills installable via ClawHub

---

## Related

- [Architecture](../architecture/README.md) — Three-layer skill architecture
- [ADR 002: Consequences-Based Learning](../decisions/002-consequences-based-learning.md)
- [Umbrella Vision](../../../docs/vision/README.md)
