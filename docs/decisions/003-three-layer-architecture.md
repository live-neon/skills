# ADR 003: Three-Layer Architecture

**Status**: Accepted
**Date**: 2026-02-16
**Deciders**: Lee, Claude

## Context

Skills need to work across different environments: some have Claude Code hooks support, others don't. Some have OpenClaw Gateway, others are pure CLI. The system needs to be portable while allowing progressive enhancement.

**Problem**: How to design skills that work everywhere but can leverage automation when available?

## Decision

Adopt a **three-layer architecture** with progressive enhancement:

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: AUTOMATION (Future) - Claude Code hooks        │
├─────────────────────────────────────────────────────────┤
│ LAYER 2: WORKSPACE - .learnings/, output/, HEARTBEAT.md │
├─────────────────────────────────────────────────────────┤
│ LAYER 1: SKILL.md - Instructions + Next Steps (ACTIVE)  │
└─────────────────────────────────────────────────────────┘
```

**Layer descriptions:**

1. **Layer 1 (SKILL.md)**: Pure behavioral protocols via "Next Steps" soft hooks
   - Works everywhere, no runtime dependencies
   - Instructions + suggested actions
   - Portable across any LLM environment

2. **Layer 2 (Workspace)**: Persistent file-based state
   - `.learnings/` directory for observations
   - `output/constraints/` for active constraints
   - `HEARTBEAT.md` for periodic maintenance
   - Compatible with ClawHub skill conventions

3. **Layer 3 (Automation)**: Runtime hooks (deferred)
   - Claude Code hooks when supported
   - OpenClaw Gateway integration
   - Programmatic constraint checking

**Current focus**: Layers 1 and 2 only. Layer 3 deferred to future release.

## Consequences

### Positive
- **Portability**: Layer 1 works in any environment
- **Progressive enhancement**: Add automation when available
- **ClawHub compatibility**: Layer 2 matches existing skill formats
- **No runtime dependencies**: Skills work without code execution
- **Clear upgrade path**: Layer 3 adds automation without rewriting 1 & 2

### Negative
- Layer 1 relies on LLM following "Next Steps" (soft enforcement only)
- Layer 3 deferred means no automated constraint checking yet
- Some duplication between behavioral and programmatic approaches

### Neutral
- Matches proactive-agent's pure behavioral protocol approach
- Similar architecture to self-improving-agent skill

## Related

- [Architecture README](../architecture/README.md) - Layer details and diagrams
- [ADR 001: Skill Consolidation](001-skill-consolidation.md) - 7 skill system
- [ADR 002: Consequences-Based Learning](002-consequences-based-learning.md) - Learning philosophy
