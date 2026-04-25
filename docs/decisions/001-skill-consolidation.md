# ADR 001: Skill Consolidation (48 to 7)

**Status**: Accepted
**Date**: 2026-02-15
**Deciders**: Lee, Claude

## Context

The agentic skills system initially had 48 granular skills across 6 layers. Each skill was narrowly focused (e.g., separate skills for failure detection, observation recording, memory search).

**Problems with 48 skills:**
- Token overhead: 48 skills x ~150 chars = ~7,000 chars in context
- Runtime automation complexity: Adding hooks to 48 skills is prohibitive
- Context fragmentation: Related operations scattered across multiple skills

## Decision

Consolidate 48 skills into 7 unified skills based on the principle: **"When does the agent need this information?"**

**Consolidation mapping:**

| New Skill | Consolidates | Count |
|-----------|--------------|-------|
| context-verifier | context-packet, file-verifier | 2 |
| failure-memory | failure-tracker, observation-recorder, memory-search, topic-tagger, failure-detector, evidence-tier, effectiveness-metrics, pattern-convergence-detector, positive-framer, contextual-injection | 10 |
| constraint-engine | constraint-generator, constraint-lifecycle, constraint-enforcer, circuit-breaker, emergency-override, severity-tagger, progressive-loader | 7 |
| review-orchestrator | twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer, slug-taxonomy | 6 |
| governance | governance-state, constraint-reviewer, index-generator, round-trip-tester, version-migration | 5 |
| safety-checks | model-pinner, fallback-checker, cache-validator, adoption-monitor, cross-session-safety-check | 5 |
| workflow-tools | loop-closer, parallel-decision, threshold-delegator, mce-refactorer, hub-subworkflow, observation-refactoring, constraint-versioning | 7 |

**Total**: 48 → 7 skills

## Consequences

### Positive
- Token efficiency: ~7,000 chars → ~1,400 chars (5x reduction)
- Runtime automation: Adding hooks to 7 skills is tractable
- Context coherence: Related operations grouped by invocation context
- Simpler mental model for users

### Negative
- Sub-command proliferation: Each skill now has 4-7 sub-commands
- Larger SKILL.md files per skill
- Less granular permission control

### Neutral
- Contract tests remain valid (mock implementations unchanged)
- CLI interface changes (e.g., `/failure-tracker record` → `/fm record`)

## Related

- [Architecture README](../architecture/README.md) - Layer diagram and skill details
- Phase 5B implementation plan - ClawHub compatibility verification
