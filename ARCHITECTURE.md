# Live Neon Skills Architecture

> **Moved**: This document has been reorganized for token efficiency.
> See [docs/architecture/README.md](docs/architecture/README.md) for the full architecture hub.

## Quick Reference

**7 Consolidated Skills**:

| Skill | Alias | Purpose |
|-------|-------|---------|
| failure-memory | `/fm` | Failure detection, observation recording |
| constraint-engine | `/ce` | Constraint generation, enforcement |
| context-verifier | `/cv` | File hashing, integrity verification |
| review-orchestrator | `/ro` | Twin/cognitive review coordination |
| governance | `/gov` | Constraint lifecycle, state management |
| safety-checks | `/sc` | Model pinning, fallback validation |
| workflow-tools | `/wt` | Loop detection, parallel decisions |

## Key Concepts

**Core Insight**: AI systems learn best from consequences, not instructions.

**Eligibility Formula**: `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2`

**Circuit Breaker**: `CLOSED → (5 violations) → OPEN → (24h) → HALF-OPEN → CLOSED`

## Documentation

| Topic | Location |
|-------|----------|
| Full Architecture | [docs/architecture/README.md](docs/architecture/README.md) |
| CJK Summary | 智:cjk-summary (docs/architecture/README.md) |
| Skill Details | 智:skills |
| Lifecycle | 智:lifecycle |
| ClawHub Integration | 智:clawhub |
| Configuration | 智:config |

## CJK Notation

Use section markers for JIT loading:
- `智:cjk-summary` - Quick reference
- `智:layers` - Three-layer architecture
- `智:skills` - Skill details
- `智:lifecycle` - Failure → Constraint lifecycle
- `智:clawhub` - ClawHub integration
- `智:config` - Configuration

---

*Redirect file. Full content at docs/architecture/README.md (~450 lines with section markers).*
