# Changelog

All notable changes to the agentic skills are documented here.

> **Version Strategy**: This CHANGELOG tracks internal development versions (2.x.x).
> SKILL.md frontmatter shows `version: 1.0.0` which is the ClawHub publication version.
> The first ClawHub release (1.0.0) corresponds to internal version 2.0.1 (post-consolidation + decoupling).

## [2.0.1] - 2026-02-16

### ClawHub Publication Prep

Decoupled all 7 skills from Multiverse-specific dependencies for ClawHub publication
under `leegitw/*` namespace.

#### Decoupling Changes

| Area | Before | After |
|------|--------|-------|
| Model references | Hardcoded `claude-opus-4-5`, `opus4`, etc. | Generic `{provider}-{model}-{version}-{date}` format |
| Config paths | `.claude/` only | `.openclaw/` (primary) + `.claude/` (compatibility) |
| Storage references | S3/AWS-specific | Generic Primary/Secondary/Tertiary |
| Cognitive modes | Hardcoded `opus4`, `opus41`, `sonnet45` | Configurable via YAML |
| Quality gates | Hardcoded `npm test` | Pluggable: npm/go/pytest/cargo |
| Critical patterns | Hardcoded `CLAUDE.md` | Configurable patterns |
| Review cadence | Hardcoded 90 days | Configurable `review_cadence_days` |

#### Added

- ClawHub frontmatter (repository, homepage, license, version, author)
- Installation instructions for each skill (`openclaw install leegitw/[skill]`)
- Dependency installation guidance
- Standalone usage documentation per skill
- Suite README.md with lifecycle diagram and evidence tier explanation
- LICENSE file (MIT)
- Diverse examples beyond git/commit (API, deployment, compliance, performance)

#### Changed

- `homepage`: Points to GitHub org repo (`live-neon/skills`)
- `repository`: Points to ClawHub username (`leegitw/[skill-name]`)
- Configuration precedence documented: `.openclaw/` > `.claude/` > defaults
- Model version format is now provider-agnostic
- `/ro multi` alias added for discoverability (keeps `/ro twin` for compatibility)

#### Documentation

- `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` - Implementation plan (v3)
- Code reviews: Codex + Gemini (N=2)
- Twin reviews: Technical + Creative (N=2)

---

## [2.0.0] - 2026-02-15

### Major: Consolidation (48 → 7 Skills)

The agentic skills were consolidated from 48 granular skills into 7 unified skills,
following the principle: **"When does the agent need this information?"**

#### New Consolidated Skills

| Skill | Alias | Layer | Consolidates |
|-------|-------|-------|--------------|
| **failure-memory** | `/fm` | Core | 10 skills (failure-detector, evidence-tier, topic-tagger, etc.) |
| **constraint-engine** | `/ce` | Core | 7 skills (constraint-generator, constraint-enforcer, circuit-breaker, etc.) |
| **context-verifier** | `/cv` | Foundation | 3 skills (context-packet, prompt-normalizer, severity-tagger) |
| **review-orchestrator** | `/ro` | Review | 5 skills (review-selector, cognitive-review, slug-taxonomy, etc.) |
| **governance** | `/gov` | Governance | 6 skills (governance-state, constraint-reviewer, index-generator, etc.) |
| **safety-checks** | `/sc` | Safety | 4 skills (model-pinner, cache-validator, fallback-checker, adoption-monitor) |
| **workflow-tools** | `/wt` | Extensions | 4 skills (loop-closer, mce-refactorer, hub-subworkflow, etc.) |

#### Archived Skills by Layer

| Layer | Skills | Consolidated Into |
|-------|--------|-------------------|
| core/ | 12 | failure-memory, constraint-engine |
| bridge/ | 5 | (documentation only - ClawHub integration pending) |
| detection/ | 4 | failure-memory |
| extensions/ | 10 | workflow-tools, safety-checks |
| governance/ | 4 | governance |
| review/ | 6 | review-orchestrator, context-verifier |
| safety/ | 4 | safety-checks |

#### Why Consolidation?

1. **Reduced cognitive load**: 7 commands vs 48
2. **Sub-command structure**: Related functions grouped logically
3. **Clearer dependencies**: Layer graph now has 7 nodes instead of 48
4. **Preserved functionality**: All 48 skills' capabilities retained as sub-commands

#### Migration Path

Old commands map to new sub-commands:

```
/failure-detector → /fm detect
/evidence-tier → /fm classify
/constraint-generator → /ce generate
/circuit-breaker → /ce breaker
/context-packet → /cv packet
/review-selector → /ro select
```

Full mapping in `_archive/2026-02-consolidation/README.md`.

### Added

- Sub-command structure for all 7 consolidated skills
- Lifecycle diagram in README.md
- Quick Start guide with 4 essential commands
- Template updates with `## Sub-Commands` section
- Category alignment tests (10 tests passing)

### Changed

- Directory structure simplified (7 skill directories + archive)
- Layer assignments refined (Foundation → Core → Review → Governance → Safety → Extensions)
- CJK notation applied consistently across all skills

### Deprecated

- All 48 pre-consolidation skills moved to `_archive/2026-02-consolidation/`
- Bridge layer skills (ClawHub adapters) in mock mode pending integration

### Documentation

- `docs/patterns/skill-format.md` - Category-specific formats documented
- `docs/plans/2026-02-15-skill-category-alignment.md` - Alignment plan (complete)
- `CONTRIBUTING.md` - Updated with category guidance

---

## [1.0.0] - 2026-02-01

### Initial Release

- 48 granular skills across 7 layers
- Failure → Constraint lifecycle implemented
- R/C/D counter system
- Evidence tiers (弱/中/強)
- Circuit breaker pattern

---

*Changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.*
