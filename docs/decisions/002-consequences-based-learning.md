# ADR 002: Consequences-Based Learning

**Status**: Accepted
**Date**: 2026-02-16
**Deciders**: Lee, Claude

## Context

Traditional AI instruction approaches rely on static rules: "Always validate inputs", "Never use deprecated APIs". These instructions are often forgotten between sessions, have no feedback mechanism, and don't adapt to actual usage patterns.

**Problems with instruction-based approaches:**
- Instructions forgotten across sessions
- No objective evidence of effectiveness
- Rules don't adapt to actual failures
- "Don't do X" provides no learning signal

## Decision

Adopt **consequences-based learning** as the core philosophy: AI systems learn best from consequences, not instructions.

**Key mechanisms:**

1. **R/C/D Counters**:
   - R (Recurrence): How many times pattern observed
   - C (Confirmations): Human-verified as valid
   - D (Denials): Human-verified as false positive

2. **Eligibility Threshold**: `R>=3 AND C>=2 AND D/(C+D)<0.2 AND sources>=2`
   - Pattern must recur (not one-off)
   - Human must confirm validity
   - False positive rate must be low
   - Multiple independent sources

3. **Evidence Tiers**:
   - N=1: Weak (single observation)
   - N=2: Emerging (pattern forming)
   - N>=3: Strong (team-validated)

4. **Failure-Anchored Recording**:
   - Observations originate from actual failures
   - Evidence tier increases with validation
   - Constraints emerge from proven patterns

## Consequences

### Positive
- Memory persists across sessions (file-based `.learnings/`)
- Math provides objective thresholds (no subjective judgment)
- Rules emerge from actual failures (not theoretical concerns)
- Agents learn from outcomes (feedback loop closed)
- External research validation (RLVR, self-improving agents)

### Negative
- Requires initial failure to learn (no proactive prevention)
- Human verification bottleneck for C++ increments
- More complex than static rule files

### Neutral
- Requires workspace persistence (`.learnings/`, `output/`)
- Compatible with ClawHub skill conventions

## Related

- [Architecture README](../architecture/README.md) - Full system design
- [Consequences-Based Learning Research](../research/2026-02-16-consequences-based-learning-llm-research.md) - External validation
- [ADR 001: Skill Consolidation](001-skill-consolidation.md) - 48->7 consolidation
