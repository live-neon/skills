---
created: 2026-02-13
type: proposal
status: approved
priority: medium
depends_on:
  - "[multiverse]/docs/plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md"
implementation_plans:
  - ../plans/2026-02-13-agentic-skills-phase1-implementation.md
  - ../plans/2026-02-13-agentic-skills-phase2-implementation.md
  - ../plans/2026-02-13-agentic-skills-phase3-implementation.md
  - ../plans/2026-02-14-agentic-skills-phase4-implementation.md
  - ../plans/2026-02-14-agentic-skills-phase5-implementation.md
  - ../plans/2026-02-15-agentic-skills-phase6-implementation.md
  - ../plans/2026-02-15-agentic-skills-phase7-implementation.md
consolidation_plan: ../plans/2026-02-15-agentic-skills-consolidation.md
decoupling_plan: ../plans/2026-02-15-agentic-clawhub-decoupling.md
publication_plan: ../plans/2026-02-16-agentic-clawhub-publication.md
implementation_status: consolidated
consolidated_count: 7
original_count: 47
archived_count: 48
last_aligned: 2026-02-16
related_proposals:
  - ../proposals/2026-02-13-openclaw-skills-for-agentic-system.md
related_reviews:
  - ../reviews/2026-02-13-public-skills-migration-codex.md
  - ../reviews/2026-02-13-public-skills-migration-gemini.md
  - ../reviews/2026-02-15-agentic-skills-implementation-codex.md
  - ../reviews/2026-02-15-agentic-skills-implementation-gemini.md
  - ../reviews/2026-02-15-agentic-skills-impl-twin-technical.md
  - ../reviews/2026-02-15-agentic-skills-impl-twin-creative.md
related_issues:
  - ../issues/2026-02-13-phase2-code-review-remediation.md
  - ../issues/2026-02-13-phase2-twin-review-remediation.md
  - ../issues/2026-02-14-phase3-code-review-findings.md
  - ../issues/2026-02-14-phase3-twin-review-findings.md
  - "[multiverse]/docs/issues/2026-02-14-rg6-failure-attribution-research.md"
  - "[multiverse]/docs/issues/2026-02-14-frontmatter-audit-impl-review-findings.md"
  - "[multiverse]/docs/issues/2026-02-14-frontmatter-audit-twin-review-findings.md"
  - ../issues/2026-02-14-phase5-code-review-findings.md
  - ../issues/2026-02-14-phase5-twin-review-findings.md
  - ../issues/2026-02-15-phase6-code-review-findings.md
  - ../issues/2026-02-15-phase6-twin-review-findings.md
  - ../issues/2026-02-15-phase7-plan-code-review-findings.md
  - ../issues/2026-02-15-phase7-plan-twin-review-findings.md
  - ../issues/2026-02-15-agentic-skills-implementation-review-findings.md
  - ../issues/2026-02-15-agentic-skills-impl-twin-review-findings.md
related_observations:
  - "[multiverse]/docs/observations/golden-master-cross-project-knowledge.md"
  - "[multiverse]/docs/observations/configuration-as-code-type-safety.md"
  - "[multiverse]/docs/observations/2025-11-11-git-destructive-operations-without-confirmation.md"
  - "[multiverse]/docs/observations/plan-approve-implement-workflow-violation.md"
  - "[multiverse]/docs/observations/2025-11-09-resist-file-proliferation.md"
brands:
  live-neon: liveneon.ai (open source, AI identity/skills)
---

# Agentic Skills Specification

## TL;DR

**What**: AI memory skills for failure-anchored learning.

**Original design**: 47 skills across 6 layers.
**Consolidated implementation**: 7 skills after internal review identified over-engineering (2026-02-15).

| Consolidated Skill | Merged From | Function |
|--------------------|-------------|----------|
| context-verifier | 3 foundation skills | Verifies file integrity via MD5 hashes, detects unauthorized changes |
| failure-memory | 10 core/detection skills | Records failures with R/C/D counters, detects recurring patterns |
| constraint-engine | 9 core skills | Generates constraints from failures, enforces at runtime, circuit breaker |
| review-orchestrator | 5 review skills | Coordinates multi-perspective reviews (technical, creative, external) |
| governance | 6 governance skills | Manages skill lifecycle, triggers 90-day reviews, tracks adoption |
| safety-checks | 4 safety skills | Validates model configs, enforces pinning, provides fallback handling |
| workflow-tools | 4 extension skills | Detects infinite loops, evaluates parallel vs serial, suggests MCE splits |

*Table shows 41 merged skills. Full accounting: 41 merged + 5 bridge (→ documentation) + 1 removed + 1 added during impl = 48 archived.*

**Core insight**: AI learns from consequences, not instructions. Failures become constraints.

**Lifecycle**: Failure detected → R≥3 recurrences → C≥2 human confirmations → Constraint generated → Runtime enforced

**Key requirements** (unchanged):
- Semantic classification (LLM-based), NOT pattern matching
- R/C/D counters: Recurrence (auto), Confirmations (human), Disconfirmations (false positives)
- Circuit breaker: Severity-tiered (CRITICAL: 3/30d, IMPORTANT: 5/30d, MINOR: 10/30d)

**Implementation**: `projects/live-neon/skills/agentic/` (golden master, consolidated structure)

---

## Reading Guide

This specification is 1,400+ lines. Use this table to navigate:

| If you need to... | Read sections... |
|-------------------|------------------|
| Understand the core concept | TL;DR, Strategic Context |
| Understand consolidation (47 → 7) | Post-Phase 7: Consolidation |
| Implement a specific skill | Skill Template (Phase 1), relevant Phase section |
| Understand the 6-layer architecture | Design Principles, Layer Overview |
| Check research status | Research Gates |
| Review what's deferred | Phase X "Deferred Items" tables |
| See implementation status | Implementation Status notes in each phase |

**New to agentic skills?** Start with TL;DR → Strategic Context → Design Principles.

**Adding a skill?** See Phase 1 Skill Template + relevant layer's Phase section.

---

## Summary

**Current State**: 7 consolidated skills for failure-anchored learning, developed in
`projects/live-neon/skills/agentic/` (golden master location).

> **Historical Context**: Originally designed as 47 skills (37 proposal + 10 extensions),
> consolidated to 7 on 2026-02-15 after internal review identified over-engineering.
> This specification preserves the original design for historical reference.

**Golden Master Pattern** (observation N=4): `projects/live-neon/skills` is the single
source of truth. No temporary copies elsewhere. See
`docs/observations/golden-master-cross-project-knowledge.md`.

*Note: "N=4" here refers to observation recurrence count, not failure tracking. For failure tracking, see R/C/D terminology in Architecture Guide v5.2.*

---

## Strategic Context

While Plan A gives away the methodology (PBD skills), this specification defines the
infrastructure that makes the methodology work at scale. These 47 agentic memory
skills embody Live Neon's core insight: **AI systems learn best from consequences,
not instructions**.

Each skill in this system participates in a failure-to-constraint lifecycle that
makes mistakes useful rather than shameful. This is how Live Neon "practices what
it preaches" — systematically learning from failures to prevent their recurrence.

The skills are open-sourced to invite contribution while establishing Live Neon
as the authority on failure-anchored learning for AI-assisted development.

---

## Design Principles

**Research foundation**: See `projects/live-neon/neon-soul/docs/research/hierarchical-principles-architecture.md`
for the reusable soul schema (5 axioms + 11 principles + priority hierarchy + meta-pattern) that
informs constraint organization, severity classification, and the priority hierarchy
(誠>正>安>助>効: Honesty > Correctness > Safety > Helpfulness > Efficiency).

### Semantic Classification Over Pattern Matching

**REQUIRED**: All agentic skills MUST use LLM-based semantic similarity for matching
and classification. Pattern matching (string/glob/regex) is prohibited for safety-critical
operations.

**Implementation Status** (2026-02-15): Semantic classification is **scaffolded but not yet implemented**.
- Tier 3 LLM tests exist in `tests/e2e/skill-behavior.test.ts` but are skipped by default
- Current implementation uses fixture-based matching as placeholder
- Phase 8 will implement actual LLM-based semantic classification
- See `../issues/2026-02-15-agentic-skills-implementation-review-findings.md` (C-3)

**Why**: Pattern matching is trivially evaded through aliases, synonyms, or rephrasing.
`git push --force` and `git push -f` are semantically identical but pattern-distinct.

**Guide**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Research**: See `projects/live-neon/neon-soul/docs/research/compression-native-souls.md`
for academic foundations on LLM semantic similarity, including LLMLingua (20x compression
with 1.5% performance loss) and MetaGlyph (62-81% token reduction with 98% operator fidelity).

The guide documents the correct approach:
- **LLM semantic similarity** for action/constraint matching
- **Intent classification** (destructive/modifying/read-only/external)
- **Confidence scoring** (0.0-1.0) with graduated response
- **Semantic scope** definitions instead of pattern lists

### Two-Stage Matching (Default Pattern)

**Recommended approach** for balancing accuracy with performance:

| Stage | Method | Latency | Purpose |
|-------|--------|---------|---------|
| Stage 1 | Embedding similarity | <50ms | Fast filter, high recall |
| Stage 2 | LLM classification | 500ms-2s | Accurate decision, high precision |

**When to use each approach**:

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| CRITICAL severity | Single-stage LLM | Accuracy paramount; latency acceptable |
| IMPORTANT severity | Two-stage | Balance accuracy and performance |
| MINOR severity | Two-stage or embedding-only | Performance priority; false negatives tolerable |
| High-frequency paths | Embedding-only with sampling | Latency critical; spot-check with LLM |

**Implementation**: Stage 1 filters to candidates with embedding similarity >0.6.
Stage 2 applies LLM classification to candidates, or auto-accepts if Stage 1 score >0.9.

This pattern implements RG-3 findings while meeting Performance Requirements

**Application to Agentic Skills**:

| Skill | Pattern Matching ❌ | Semantic Classification ✅ |
|-------|---------------------|---------------------------|
| constraint-enforcer | Glob patterns on action strings | LLM classifies action intent |
| failure-detector | Regex on error messages | LLM identifies failure semantics |
| topic-tagger | Keyword lists | LLM infers topic from context |
| severity-tagger | Rule-based severity | LLM assesses impact and risk |

**Exception**: File path matching (globs for `--constraints docs/constraints/*.md`) is
acceptable for file selection, but NOT for analyzing content or intent.

**Validation**: Phase 1 code review (N=2) identified this as a critical architectural
gap. See `../issues/2026-02-13-agentic-phase1-code-review-remediation.md`.

---

## Review Findings Addressed

This plan incorporates N=2 external review findings:

| Finding | Resolution |
|---------|------------|
| Conflated goals create risk | **Decoupled** - This is separate from Plan A |
| 37 skills lack acceptance criteria | **Added** - Each tier has clear criteria |
| 2-3 hours unrealistic for 5 skills | **Fixed** - Realistic timeline per tier |
| Agentic skills are "aspirational" | **Acknowledged** - Phased implementation |

---

## Observation Evidence

This plan is strengthened by high N-count observations from `docs/observations/`:

| Observation | N-Count | Validates Skills | Key Insight |
|-------------|---------|------------------|-------------|
| [Configuration-as-Code](../observations/configuration-as-code-type-safety.md) | **N=9** | constraint-generator, contextual-injection | Type-safe configs > stringly-typed; compile-time > runtime validation |
| [Destructive Git Ops](../observations/2025-11-11-git-destructive-operations-without-confirmation.md) | **N=5** | circuit-breaker, emergency-override | 5-violation threshold validated; requires confirmation before destructive actions |
| [Golden Master](../observations/golden-master-cross-project-knowledge.md) | **N=4** | file-verifier, constraint-enforcer | Single source of truth with checksum tracking for derived works |
| [Plan-Approve-Implement Violation](../observations/plan-approve-implement-workflow-violation.md) | **N=4** | constraint-enforcer, failure-detector | AI prioritizes instruction completion over workflow stage integrity |
| [Resist File Proliferation](../observations/2025-11-09-resist-file-proliferation.md) | **N=11** | effectiveness-metrics, observation-recorder | 91% prevention rate after pattern integration; anti-patterns detectable |
| [Hub-Subworkflow Pattern](../observations/workflow-hub-subworkflow-pattern.md) | **N=5** | observation-refactoring, hub-subworkflow | Hub + sub-workflow structure for maintainable documentation |
| [MCE Refactoring Pattern](../patterns/mce-refactoring.md) | **N=7** | mce-refactorer | Split strategies by file type; decision tree for compliance |
| [Auto-Delegate on Threshold](../patterns/auto-delegate-on-threshold.md) | **N=3** | threshold-delegator | Auto-suggest delegation when issue count exceeds threshold |

**Observation-Validated Thresholds**:
- **Circuit breaker**: 5 violations in 30-day window (from Destructive Git Ops N=5 incident history)
- **Eligibility criteria**: R≥3 validated by Configuration-as-Code progression (N=1→N=9 journey)
- **Source diversity**: |sources|≥2 enforced by Plan-Approve-Implement (cross-session incidents)

**Severity-Tiered Circuit Breaker Defaults**:

Per RG-1 recommendation for per-constraint configurability, different severities use
different thresholds:

| Severity | Violations | Window | Rationale |
|----------|------------|--------|-----------|
| CRITICAL | 3 | 30 days | High-risk constraints trip early; fewer chances |
| IMPORTANT | 5 | 30 days | Standard threshold (validated by N=5 observation) |
| MINOR | 10 | 30 days | Low-risk constraints; more tolerance before tripping |

**Override**: Individual constraints can specify custom thresholds in their metadata.
The defaults apply when no override is specified.

---

## Skill Tiers (47 Skills)

> **Historical Context**: These 47 skills were consolidated to 7 on 2026-02-15.
> See TL;DR and "Post-Phase 7: Consolidation" section for current state.

From `../proposals/2026-02-13-openclaw-skills-for-agentic-system.md` + observation analysis:

| Tier | Category | Count | Priority | Source |
|------|----------|-------|----------|--------|
| 1-4 | Core Memory | 14 | High | Proposal |
| 5 | Review Selection | 6 | Medium | Proposal |
| 6 | Detection | 4 | Medium | Proposal |
| 7 | Governance | 4 | Low | Proposal |
| 8 | Safety | 4 | Medium | Proposal |
| Bridge | Integration | 5 | Low | Proposal |
| Extensions | Observation-Backed | 10 | Medium | Analysis |
| **Docs** | **ARCHITECTURE.md** | **0** | **High** | **Required** |

**Total**: 47 skills + architecture documentation

### MoSCoW Prioritization

Skills are prioritized for minimum viable system (MVP) planning:

| Priority | Meaning | Count | Description |
|----------|---------|-------|-------------|
| **Must** | Required for MVP | 14 | Phase 1-2 core skills |
| **Should** | High value, not blocking | 18 | Phase 3-4 skills |
| **Could** | Nice to have | 10 | Phase 5-6 extensions |
| **Won't** | Deferred/future | 5 | Phase 6 lowest priority |

**MVP Cut-Line**: Phase 1-2 (14 skills) provides a complete failure→constraint lifecycle.
The system delivers value at this point. Phases 3-7 add refinement and scale.

---

## Implementation Location

**Location**: `projects/live-neon/skills/agentic/` (golden master)

### Original Design (Pre-Consolidation)

> **Historical Context**: These counts reflect the original specification design.
> Actual implementation counts differed slightly. Archive contains 48 SKILL.md files
> (authoritative count). Extensions layer (10 skills) not shown below.

```
projects/live-neon/skills/agentic/
├── core/           # 14 skills (spec design)
├── review/         # 6 skills (spec design)
├── detection/      # 4 skills (spec design)
├── governance/     # 4 skills (spec design)
├── safety/         # 4 skills (spec design)
└── bridge/         # 5 skills (spec design)
```

### Current Structure (Post-Consolidation)

```
projects/live-neon/skills/agentic/
├── context-verifier/    # Foundation: file integrity, hashing
├── failure-memory/      # Core: pattern detection, R/C/D tracking
├── constraint-engine/   # Core: generation, enforcement, circuit breaker
├── review-orchestrator/ # Review: multi-perspective coordination
├── governance/          # Governance: lifecycle, periodic reviews
├── safety-checks/       # Safety: model pinning, fallbacks
├── workflow-tools/      # Extensions: loops, parallel, MCE
├── _archive/            # Archived 48 original skills (reference only)
├── CHANGELOG.md
├── INDEX.md
├── LICENSE
├── README.md
└── SKILL_TEMPLATE.md
```

**Note**: Original 48 skills archived at `agentic/_archive/2026-02-consolidation/` for reference and rollback.

**Prerequisite**: Plan A must be complete (submodule at `projects/live-neon/skills/` exists).

**Why golden master**: Single source of truth. No temporary copies, no migration
step. Skills are developed, tested, and published from the same location. This
follows the golden master pattern (N=4) from
`docs/observations/golden-master-cross-project-knowledge.md`.

### Self-Documenting Skills Pattern

**Requirement**: Each SKILL.md must include a "Next Steps" section that guides agents
to subsequent actions after creating/modifying the skill.

**Rationale**: Agents completing skill work often get stuck without clear guidance on
what to do next. Self-documenting skills prevent orphaned work and ensure loop closure.

**SKILL.md must include**:
- **Next Steps section**: What to do after creating/modifying this skill
- **Related workflows**: Links to documentation-update and phase-completion workflows
- **Integration section**: Bidirectional dependency links (Depends on / Used by)

**Supporting workflows** (in `projects/live-neon/skills/docs/workflows/`):
- `documentation-update.md` - File-level documentation updates
- `phase-completion.md` - Phase completion checklist

**Template**: See `agentic/SKILL_TEMPLATE.md` for the required structure.

---

## Unified Testing Infrastructure

All skills (PBD + Agentic) share unified testing infrastructure at the skills repo root:

```
projects/live-neon/skills/
├── docker/
│   ├── docker-compose.yml      # OpenClaw + Ollama test environment
│   ├── Dockerfile.test         # Test runner container
│   ├── .env.example            # Environment configuration
│   └── README.md               # Test setup documentation
└── tests/
    ├── package.json            # Test dependencies (vitest, yaml)
    ├── e2e/
    │   └── skill-loading.test.ts   # Tests ALL skills format/structure
    └── fixtures/
        └── mock-workspace/     # Sample constraints/observations
```

**Test Categories**:
- `npm test` - Run all skill tests
- `npm run test:pbd` - Run PBD skill tests only
- `npm run test:agentic` - Run agentic skill tests only
- `npm run test:real-llm` - Run with real LLM (requires USE_REAL_LLM=true)

**Docker Testing**:
```bash
cd docker
cp .env.example .env
docker compose up -d              # Start OpenClaw + Ollama
docker compose --profile test up  # Run test suite
```

**Why unified**: Both PBD and agentic skills use the same SKILL.md format and
load through the same mechanism. Unified testing ensures consistent validation
across all skill categories.

---

## Performance Requirements

Cumulative overhead from semantic classification + constraint enforcement + circuit breaker
checks must not meaningfully degrade developer experience. Target latencies by skill category:

| Category | Target Latency | Rationale |
|----------|----------------|-----------|
| Foundation | <100ms | Called on every action; must feel instant |
| Core Memory | <500ms | Background operations; slight delay acceptable |
| Review | <2s | User-initiated; explicit wait acceptable |
| Detection | <1s | Semi-real-time feedback; noticeable but not blocking |
| Governance | <2s | Periodic/event-driven; not in hot path |
| Safety | <200ms | Pre-action checks; must not block workflow |
| Bridge | <1s | Integration overhead; depends on external systems |
| Extensions | <1s | Varies by skill; default to reasonable |

**Measurement**: Add performance assertions to verification gates. Skills exceeding
targets require optimization or architectural review.

**Two-Stage Optimization**: For skills requiring semantic classification, use two-stage
matching (see Design Principles) to keep median latency low while handling edge cases.

---

## Research Gates

Research gates identify topics requiring external validation before implementation. Unlike verification gates (implementation checkpoints), research gates are knowledge prerequisites.

### Research Gate Status

| ID | Topic | Phase Blocks | Status | Research Location |
|----|-------|--------------|--------|-------------------|
| RG-1 | Circuit breaker parameters | Phase 2 | ✅ DONE | circuit-breaker-patterns.md |
| RG-2 | Multi-agent constraint coordination | Phase 4 | ❌ GAP | None |
| RG-3 | Semantic similarity thresholds | Phase 2 | ✅ DONE | semantic-similarity-thresholds.md |
| RG-4 | Constraint decay/obsolescence | Phase 4 | ❌ GAP | None |
| RG-5 | Human confirmation bias | Phase 2 | ✅ DONE | human-confirmation-bias.md |
| RG-6 | Failure attribution accuracy | Phase 3 | ⚠️ PARTIAL | wisdom-synthesis-patterns.md |
| RG-7 | Cryptographic audit chains | Phase 4 | ✅ DONE | cryptographic-audit-chains.md |
| RG-8 | LLM behavioral test patterns | Phase 2 | ✅ DONE | llm-behavioral-testing.md |

### RG-1: Circuit Breaker Parameters (Phase 2) ✅ RESOLVED

**Research**: `projects/live-neon/neon-soul/docs/research/circuit-breaker-patterns.md`

**Key findings**:
- 5-violation threshold validated (matches industry 50% failure rate standard)
- 30-day window appropriate for human-AI workflows (adapted from industry seconds/minutes)
- Recommendations: Add configurability per-constraint, extend deduplication to 5 minutes,
  require human acknowledgment in HALF-OPEN state (not just successful action)

---

### RG-2: Multi-Agent Constraint Coordination (Phase 4)

**Current state**: Plan reviews identified race conditions in shared state files. No coordination strategy.

**Research needed**:
- Consensus algorithms for AI agent coordination (Raft, Paxos adaptations)
- Conflict resolution in multi-agent memory systems
- Optimistic vs pessimistic locking for constraint state
- Academic: Multi-agent reinforcement learning constraint satisfaction

**Output**: `neon-soul/docs/research/multi-agent-coordination.md`

**Acceptance**: Documented coordination strategy with trade-offs analysis.

---

### RG-3: Semantic Similarity Thresholds (Phase 2) ✅ RESOLVED

**Research**: `projects/live-neon/neon-soul/docs/research/semantic-similarity-thresholds.md`

**Key findings**:
- Tiered thresholds by severity: CRITICAL≥0.85, IMPORTANT≥0.80, MINOR≥0.70
- Human review ranges: CRITICAL 0.70-0.85, IMPORTANT 0.65-0.80, MINOR 0.55-0.70
- Two-stage matching: fast embedding filter + deep LLM classification
- Semantic scope definitions instead of pattern lists

---

### RG-4: Constraint Decay and Obsolescence (Phase 4)

**Current state**: retiring→retired lifecycle exists but no decay detection.

**Research needed**:
- Temporal decay patterns for software constraints
- Automatic obsolescence detection (code drift, unused constraints)
- Optimal review cadence (90-day is arbitrary)
- Academic: Technical debt accumulation and decay patterns

**Output**: `neon-soul/docs/research/constraint-decay-patterns.md`

**Acceptance**: Evidence-based decay detection algorithm OR validated 90-day cadence.

---

### RG-5: Human Confirmation Bias (Phase 2) ✅ RESOLVED

**Research**: `projects/live-neon/neon-soul/docs/research/human-confirmation-bias.md`

**Key findings**:
- Identified biases: undercorrection (pro-AI users), overcorrection (skeptics), engagement decay
- Multi-user requirement: `c_unique_users_min: 2` (C from different users, not just 2 from same)
- Engagement tracking: minimum viewing time, decision time as quality signal
- Weighted confirmations based on engagement and calibration accuracy

---

### RG-6: Failure Attribution Accuracy (Phase 3)

**Current state**: System assumes failures are clearly attributable. Gemini review flagged this.

**Research needed**:
- Attribution accuracy in complex AI systems
- Multi-causal failure handling (partial attribution)
- Ambiguous failure classification strategies
- Academic: Root cause analysis in complex systems

**Output**: `neon-soul/docs/research/failure-attribution-accuracy.md` (extends wisdom-synthesis-patterns.md)

**Acceptance**: Attribution confidence scoring system OR "uncertain attribution" flag design.

#### RG-6 Provisional Implementation (Phase 3 Unblock)

Since RG-6 is PARTIAL and blocks Phase 3, define explicit fallback behavior:

**Attribution Confidence Threshold**:
- ≥0.7 = **Attributed**: Failure counted toward R counter automatically
- 0.4-0.7 = **Uncertain**: Logged but requires human review before R increment
- <0.4 = **Unattributable**: Logged for research; excluded from R counter

**Degraded Mode Behavior**:
When attribution is uncertain (0.4-0.7):
1. Create observation with `attribution_confidence` field
2. Flag as `requires_human_review: true`
3. Do NOT auto-increment R counter
4. Surface in `/failure-tracker review` queue for human decision

**Schema Addition** (observation files):
```yaml
attribution:
  confidence: 0.65
  method: "semantic_similarity"
  requires_human_review: true
  primary_cause: "constraint-x"
  secondary_causes: ["constraint-y"]  # For multi-causal failures
```

**Phase 3 Implementation**: failure-detector and evidence-tier use this provisional
design. Full RG-6 research may refine thresholds and methods post-Phase 3.

---

### RG-7: Cryptographic Audit Chains (Phase 4) ✅

**Current state**: Research complete at `neon-soul/docs/research/cryptographic-audit-chains.md`.

**Application**: Packet signing for context-packet authenticity (deferred from Phase 1).

**Next step**: Reference this research in Phase 4 implementation plan.

---

### RG-8: LLM Behavioral Test Patterns (Phase 2) ✅ RESOLVED

**Research**: `projects/live-neon/neon-soul/docs/research/llm-behavioral-testing.md`

**Key findings**:
- Three-tier testing: Tier 1 (structural, always), Tier 2 (fixtures, always), Tier 3 (live LLM, conditional)
- Range assertions (`> 0.7`) not exact (`=== 0.85`) for confidence scores
- LLM-as-judge for semantic correctness evaluation
- Vitest helpers: `describeWithLLM`, `itWithLLM` conditional on USE_REAL_LLM env var

---

### Research Gate Integration

**Phase 2 blockers**: ✅ ALL RESOLVED (RG-1, RG-3, RG-5, RG-8)
- Research sprint completed 2026-02-13
- Phase 2 implementation can proceed

**Phase 3 blockers**: RG-6 (1 research topic, ⚠️ PARTIAL)

**Phase 4 blockers**: RG-2, RG-4 (2 research topics remaining, RG-7 already complete)

---

## Phase 1: Quick Wins (5 skills)

**Duration**: 1-2 days
**Prerequisites**: None (can start immediately)

### Skills

| Skill | Tier | Description | Acceptance Criteria |
|-------|------|-------------|---------------------|
| context-packet | Core | Generate auditable context | Outputs JSON with files, hashes, timestamps |
| file-verifier | Core | Verify file identity | Compares MD5/SHA256, returns match/mismatch |
| constraint-enforcer | Core | Check actions against constraints | Loads constraints, returns violations |
| severity-tagger | Review | Tag finding severity | Classifies as critical/important/minor |
| positive-framer | Detection | Convert negative to positive rules | "Don't X" → "Always Y" transformation |

### Implementation Steps

For each skill:

1. Create directory structure:
   ```bash
   mkdir -p agentic/core/context-packet
   ```

2. Create SKILL.md from template:
   ```markdown
   ---
   name: context-packet
   version: 1.0.0
   description: Generate auditable context packets
   author: Live Neon
   homepage: https://github.com/live-neon/skills
   ---

   # context-packet

   Generate auditable context packets for review workflows.

   ## Usage

   ```
   /context-packet [file-list]
   ```

   ## Output

   JSON file with:
   - File paths and MD5 hashes
   - Line counts
   - Timestamps
   - Tool versions

   ## Example

   [Include concrete example]
   ```

3. Test skill loads in Claude Code:
   ```bash
   # Add to skills path
   ln -s $(pwd)/agentic ~/.claude/skills/agentic-test

   # Invoke in Claude Code
   /context-packet README.md
   ```

4. Document acceptance test result

### Verification Gate

**Do NOT proceed to Phase 2 until**:
- [ ] All 5 skills have SKILL.md
- [ ] All 5 skills load in Claude Code
- [ ] At least 3 skills produce correct output in real use
- [ ] Acceptance criteria documented for each

---

## Phase 2: Core Memory (9 remaining core skills)

**Duration**: 3-5 days
**Prerequisites**: Phase 1 complete

### Skills

| Skill | Description | Acceptance Criteria | MoSCoW |
|-------|-------------|---------------------|--------|
| failure-tracker | Detect and record failures | Creates observation file with R/C/D counters | Must |
| constraint-generator | Generate constraints when eligible | Outputs constraint candidate when R≥3, C≥2, sources≥2 | Must |
| observation-recorder | Record positive patterns | Creates observation with evidence | Must |
| memory-search | Query the memory system | Returns relevant observations/constraints | Must |
| circuit-breaker | Prevent violation loops | Tracks violations, trips at threshold | Must |
| emergency-override | Temporary bypass with audit | Creates override record with expiry | Must |
| constraint-lifecycle | Manage constraint states | Transitions draft→active→retiring→retired | Must |
| contextual-injection | Load relevant constraints | Filters by file patterns/tags | Must |
| progressive-loader | Load docs progressively | Defers low-priority loads | Must |

### Implementation Notes

- **failure-tracker** and **observation-recorder** are inverse operations
- **constraint-generator** triggers when eligibility met: R≥3 AND C≥2 AND |sources|≥2
- **circuit-breaker** wraps constraint-enforcer (per-constraint, 30-day window)
- **memory-search** queries both observations and constraints

**Observation-Backed Implementation Details**:

| Skill | Observation Evidence | Implementation Insight |
|-------|---------------------|------------------------|
| failure-tracker | Configuration-as-Code (N=9) shows N=1→N=9 progression | Track progression metadata: dates, sources, contexts |
| constraint-generator | Same observation: N=9 with 9 distinct contexts | Only generate when contexts are genuinely diverse |
| circuit-breaker | Destructive Git Ops (N=5) had 5 incidents over months | Use 30-day rolling window, not all-time counter |
| emergency-override | Same observation: explicit confirmation pattern | Require human approval, create audit trail, set expiry. **Research**: See `neon-soul/docs/research/chat-interaction-patterns.md` Section 2.3 (Governor Pattern) |
| contextual-injection | Plan-Approve-Implement (N=4) showed workflow context matters | Inject workflow-stage-aware constraints |

**Counter terminology** (per Architecture Guide v5.2):
- $R$ = recurrence count (auto-detected occurrences)
- $C$ = confirmations (human-verified)
- $D$ = disconfirmations (human-verified false positives)

**Research**: See `projects/live-neon/neon-soul/docs/research/wisdom-synthesis-patterns.md`
for two-dimensional evidence classification (source × stance) and the anti-echo-chamber
rule requiring external OR questioning evidence for axiom promotion.

### Deferred Items from Phase 1 Code Review

These items were identified during Phase 1 code review and deferred to Phase 2:

| Item | Source | Description |
|------|--------|-------------|
| `algorithm:hash` format | file-verifier review | Support explicit algorithm prefix (e.g., `sha256:abc123`) instead of length-based auto-detection |
| Behavioral test implementation | skill-loading.test.ts review | Implement actual behavioral tests (stubs created at `tests/e2e/skill-behavior.test.ts`) |

### Verification Gate

**Do NOT proceed to Phase 3 until**:
- [ ] All 14 core skills complete (Phase 1 + Phase 2)
- [ ] Integration test: failure→R=3+eligibility→constraint flow works
- [ ] Integration test: circuit-breaker trips correctly (5 violations in 30d window)
- [ ] `algorithm:hash` format implemented in file-verifier
- [ ] Behavioral tests implemented (not just stubs)

### Research Gate Dependencies

**Phase 2 requires resolution of**:
- [ ] **RG-1** (Circuit breaker): Validate 5/30-day threshold OR accept provisional status
- [ ] **RG-3** (Semantic similarity): Define confidence thresholds for constraint matching
- [ ] **RG-5** (Human confirmation bias): Identify bias risks in C/D counter design
- [ ] **RG-8** (LLM behavioral testing): Establish test methodology before behavioral tests

**Proceed with ⚠️ PARTIAL**: Implementation flagged as provisional, revisit after research complete.
**Proceed with ❌ GAP**: Requires explicit risk acceptance documented in implementation plan.

---

## Phase 3: Review & Detection (10 skills)

**Duration**: 2-3 days
**Prerequisites**: Phase 2 core skills complete

### Review Skills (6)

| Skill | Description | MoSCoW |
|-------|-------------|--------|
| twin-review | Spawn twin reviewers | Should |
| cognitive-review | Spawn cognitive modes | Should |
| review-selector | Choose review type based on context | Should |
| staged-quality-gate | Incremental QG gates | Should |
| prompt-normalizer | Ensure identical context | Should |
| slug-taxonomy | Manage failure slugs | Should |

### Detection Skills (4)

| Skill | Description | MoSCoW |
|-------|-------------|--------|
| failure-detector | Multi-signal failure detection | Should |
| topic-tagger | Infer topic tags from paths | Should |
| evidence-tier | Classify evidence strength | Should |
| effectiveness-metrics | Track constraint effectiveness | Should |

### Verification Gate

- [ ] Review skills integrate with existing twin-review workflow
- [ ] Detection skills integrate with failure-tracker
- [ ] Metrics skill produces dashboard output

### Deferred Items from Phase 3 Code Review

| Item | Source | Description |
|------|--------|-------------|
| Real integration tests | contracts test review | Current tests are CONTRACT TESTS (validate data flow with mocks). Long-term: add integration tests that invoke real skill implementations. |
| Model naming monitoring | O2 observation (N=1) | "Opus 3" alias for Sonnet 4.5 in cognitive-review. Monitor for confusion; consider standardizing if N≥3. |

### Deferred Items from Phase 3 Twin Review

| Item | Source | Description |
|------|--------|-------------|
| Test file splitting | Finding 3 | Test file is 747 lines (3.7x MCE limit). Documented as accepted technical debt. Consider splitting in Phase 6: `phase3-review-contracts.test.ts`, `phase3-detection-contracts.test.ts`, `phase3-attribution-contracts.test.ts`. |
| Custom category prefixes | Finding 6 (N=2) | slug-taxonomy has 6 hardcoded category prefixes. Extension mechanism planned for Phase 6 to support custom categories (e.g., `infra-`, `api-`, `performance-`). |
| Quick Start sections | O1 observation (N=1) | Skills document commands but no "Getting Started" for newcomers. Enhancement suggestion for Phase 4+. |
| Skill discovery docs | O2 observation (N=1) | No documented `/skills list` command. Consider adding to ARCHITECTURE.md. |
| Test scenario comments | O4 observation (N=1) | Scenarios 6-7 have less explanatory comments than scenarios 1-5. Part of potential test file refactoring. |

### Research Gate Dependencies

**Phase 3 requires resolution of**:
- [ ] **RG-6** (Failure attribution): Define attribution confidence scoring OR uncertain flag

---

## Phase 4: Governance & Safety (8 skills)

**Duration**: 2-3 days
**Prerequisites**: Phase 3 complete

### Architectural Decision: Event-Driven over Dashboard-Driven

**Context**: For a 2-person team, ceremony-heavy approaches (periodic manual reviews, dashboards requiring daily attention) become burdensome and are often abandoned or rubber-stamped.

**Decision**: Governance skills use **event-driven** mode as primary, with dashboards available for deep-dives:

| Aspect | Event-Driven (Primary) | Dashboard (Secondary) |
|--------|------------------------|----------------------|
| Constraint staleness | Auto-retire after 90 days dormant; create issue | Manual `/governance-state dashboard` |
| Alerts | Write to `docs/issues/governance-alert-*.md` | Display in dashboard |
| User action | Respond to issues in existing workflow | Explicit command invocation |
| Philosophy | Invisible until failure | Visible on demand |

**Rationale**: Meets developers where they work (issue tracker, CI/CD) rather than creating parallel dashboard world. Constraints should feel like code (automated, silent, event-driven) not corporate policy (ceremonial, dashboard-driven, role-based).

### Governance Skills (4)

| Skill | Description | MoSCoW |
|-------|-------------|--------|
| constraint-reviewer | 90-day review gate | Should |
| index-generator | Generate INDEX.md dashboards | Should |
| round-trip-tester | Validate struct↔markdown sync | Should |
| governance-state | Track constraint state machine | Should |

### Deferred Items from Phase 1 Code Review

| Item | Source | Description |
|------|--------|-------------|
| Packet signing | context-packet/file-verifier review | Sign context packets for authenticity verification (currently unsigned JSON). Addresses threat model gap: malicious actor can rewrite packet and file hashes together. |

### Deferred Items from Phase 2 Twin Review

| Item | Source | Description |
|------|--------|-------------|
| Observability/Metrics specification | Twin Review Finding 8 (N=1) | Add skill for monitoring system health: circuit breaker trip rates, override approval/denial rates, constraint generation velocity, memory search latency. Consider dashboard output format. |
| Cleanup/Maintenance commands | Twin Review Finding 9 (N=1) | Add skill for managing file accumulation: archive old observations, bulk retirement of outdated constraints, index rebuild scheduling. Consider as sub-skill of governance-state. |
| Version migration strategy | Twin Review Finding 10 (N=1) | Add `schema_version` field to state files (`.circuit-state.json`, `.overrides.json`) and document migration procedures when schema changes (v1.0.0 → v1.1.0). |

### Safety Skills (4)

| Skill | Description | MoSCoW |
|-------|-------------|--------|
| model-pinner | Pin model versions | Should |
| fallback-checker | Verify fallback strategies | Should |
| cache-validator | Validate cached responses | Should |
| adoption-monitor | Temporal error handling | Should |

### Deferred Items from Phase 4 Code Review

| Item | Source | Description |
|------|--------|-------------|
| RG-X terminology in ARCHITECTURE.md | Finding 19 (N=1) | Add Research Gates section to ARCHITECTURE.md defining RG (Research Gate) terminology and linking to research files. Improves clarity for new team members. |
| Fallback viability testing | Finding 18 (N=1) | Add `/fallback-checker verify <component>` command for shallow availability checks (e.g., low-cost API call to confirm endpoint availability). |
| Markdown complexity limitation | Finding 20 (N=1) | Document limitation in round-trip-tester: complex constraints with conditional logic may need structured format with markdown as high-level documentation only. |

### Deferred Items from Phase 4 Twin Review

| Item | Source | Description |
|------|--------|-------------|
| Semantic diff analysis for refactor detection | Finding 9 (N=1) | constraint-reviewer's drift calculation uses commit message prefixes ("refactor", "style", "chore"). Future enhancement: semantic diff analysis to detect refactoring patterns regardless of commit message. |
| Meta-governance consideration | Philosophy Assessment | Creative twin noted "consider meta-governance for future phases" - governance of the governance system itself. Low priority, consider for Phase 7 or beyond. |
| Alert fatigue digest mode | Finding 1 (N=2) | Implemented in adoption-monitor. Monitor effectiveness of automatic per-event→digest mode switching. Consider tuning thresholds based on real usage data. |

### Verification Gate

- [ ] Event-driven governance: auto-issue creation for stale/alerting constraints
- [ ] Governance skills integrate with constraint-lifecycle
- [ ] Safety skills integrate with existing model configs (fail-closed defaults)
- [ ] Packet signing implemented for context-packet (addresses authenticity gap)
- [ ] Observability skill provides system health metrics with alert delivery (deferred from Phase 2)
- [ ] Maintenance skill handles cleanup operations (deferred from Phase 2)
- [ ] State files include schema_version field (deferred from Phase 2)

### Research Gate Dependencies

**Phase 4 requires resolution of**:
- [ ] **RG-2** (Multi-agent coordination): Define coordination strategy before governance-state
- [ ] **RG-4** (Constraint decay): Validate 90-day review cadence OR evidence-based alternative
- [x] **RG-7** (Cryptographic audit): Research complete - apply to packet signing implementation

---

## Phase 5: Bridge Skills (5 skills)

**Duration**: 1-2 days
**Prerequisites**: Phase 4 complete

### Bridge Skills

Integration with existing ClawHub skills:

| Skill | Integrates With | MoSCoW |
|-------|-----------------|--------|
| learnings-n-counter | self-improving-agent | Could |
| feature-request-tracker | proactive-agent | Could |
| wal-failure-detector | proactive-agent WAL | Could |
| heartbeat-constraint-check | proactive-agent heartbeat | Could |
| vfm-constraint-scorer | VFM scoring system | Could |

### Verification Gate

- [x] Bridge skills work with foundation skills installed (contract tests validate data flow)
- [x] N-count conversion from "Related" links works (87% of observations have Related sections)

### Deferred Items from Phase 5 Implementation

| Item | Source | Description |
|------|--------|-------------|
| Real ClawHub integration (Phase 5b) | Code Review | Contract tests pass with mock adapters, but real integration awaits ClawHub availability. Bridge skills use mock adapter pattern for seamless transition. |
| VFM weight tuning | Code Review | Tune VFM weights (prevention 0.4, precision 0.3, usage 0.2, severity 0.1) based on correlation with human-perceived constraint value after N≥10 usage. |
| Real WAL format | Code Review | Replace mock WAL format (pipe-delimited) with actual proactive-agent WAL format when available. Current format enables testing; real format may differ. |
| Circular reference detection | learnings-n-counter | Detect and exclude circular references in Related links that artificially inflate N-counts. Implemented as validation logic in learnings-n-counter. |

### Deferred Items from Phase 5 Code Review (N=2)

| Item | Source | Description |
|------|--------|-------------|
| Singleton pattern parallel test support | Finding 6 (N=1) | Module-level singleton adapters persist across tests. Current serial test execution works correctly with `resetAdapters()` cleanup. Parallel test support deferred to Phase 5b. |
| Test file mock refactoring | Finding 11 (N=2) | 400+ lines of mock implementations in `phase5-bridge-contracts.test.ts`. Refactor to `tests/mocks/` directory as Phase 6 maintenance task. Also flagged in Twin Review Finding 11. |
| Real adapter logging abstraction | Finding 16 (N=1) | Mock adapters use `console.warn` directly. Real adapters (Phase 5b) will implement proper logging abstraction when ClawHub integration occurs. |

### Deferred Items from Phase 5 Twin Review (N=2)

| Item | Source | Description |
|------|--------|-------------|
| heartbeat vs governance-state overlap | Finding 15 (N=1) | Creative twin questioned whether heartbeat-constraint-check could be a mode of governance-state. Valid design consideration for future refactoring. Current architecture is sound; revisit when governance-state matures. |

---

## Phase 6: Observation-Backed Extensions (10 skills)

**Duration**: 2-3 days
**Prerequisites**: Phase 2 complete (core memory operational)
**Rationale**: These skills emerged from observation analysis and fill gaps identified in practice.

### Dependency Notes

Most Phase 6 skills operate in **degraded mode** without Phase 4:

| Skill | Phase 4 Dependency | Degraded Mode |
|-------|-------------------|---------------|
| constraint-versioning | None | Full functionality |
| pbd-strength-classifier | None | Full functionality |
| cross-session-safety-check | None | Full functionality |
| pattern-convergence-detector | governance-state (optional) | Works without centralized state; local detection only |
| observation-refactoring | governance-state (optional) | Works without locking; manual conflict resolution |
| loop-closer | None | Full functionality |
| parallel-decision | None | Full functionality |
| threshold-delegator | None | Full functionality |
| mce-refactorer | None | Full functionality |
| hub-subworkflow | None | Full functionality |

**Bottom line**: Phase 6 can proceed after Phase 2. Skills with optional Phase 4 dependencies
gain enhanced coordination when Phase 4 is available but function standalone.

### Skills

| Skill | Source Observation | Description | MoSCoW |
|-------|-------------------|-------------|--------|
| constraint-versioning | Configuration-as-Code (N=9) | Track constraint evolution over time | Could |
| pbd-strength-classifier | Resist File Proliferation (N=11) | Classify observation strength for constraint candidacy | Could |
| cross-session-safety-check | Plan-Approve-Implement (N=4) | Verify state consistency between sessions | Could |
| pattern-convergence-detector | Multiple N=2→N=3 observations | Detect when N=2 patterns are converging to N=3 | Won't |
| observation-refactoring | Hub-Subworkflow Pattern (N=5) | Maintain observation health via rename/consolidate/promote/archive | Won't |
| loop-closer | Closing Loops workflow | Detect open placeholders, deferred observations, incomplete docs | Could |
| parallel-decision | Parallel vs Serial (並) workflow | 5-factor decision framework for parallel vs serial execution | Won't |
| threshold-delegator | Auto-Delegate Pattern (N=3) | Auto-suggest delegation when issue count exceeds threshold | Won't |
| mce-refactorer | MCE Refactoring Pattern (N=7) | Guide code file splitting when size limits exceeded | Could |
| hub-subworkflow | Hub-Subworkflow Pattern (N=5) | Split large docs into hub + sub-documents | Won't |

**Acceptance Criteria** (moved for table width):
- constraint-versioning: Records version history, shows N=1→N=9 progression
- pbd-strength-classifier: Distinguishes weak (N=1-2) from strong (N≥3) evidence
- cross-session-safety-check: Detects cross-session interference patterns
- pattern-convergence-detector: Alerts when 2+ N=2 observations share similar root cause
- observation-refactoring: Detects 4 operation candidates, respects F=2 protection
- loop-closer: Finds DEFERRED/PLACEHOLDER markers, unclosed TODOs
- parallel-decision: Evaluates coupling, interfaces, patterns; recommends approach
- threshold-delegator: Tracks counts, suggests delegation at >N threshold
- mce-refactorer: Suggests split strategy by file type; delegates to hub-subworkflow for docs
- hub-subworkflow: Suggests hub structure for docs >300 lines or with 2+ modes

### Implementation Notes

These skills address gaps discovered through observation analysis:

1. **constraint-versioning**: The Configuration-as-Code observation shows how a single pattern evolved through 9 distinct contexts. This history is valuable for understanding constraint maturity.

2. **pbd-strength-classifier**: With N=11 on Resist File Proliferation, we have strong evidence that observation strength matters. This skill provides objective classification.

3. **cross-session-safety-check**: Plan-Approve-Implement violations occurred across sessions (Dec 11, 12, 14, 22). Detecting cross-session patterns prevents repeated violations.

4. **pattern-convergence-detector**: Multiple observations sit at N=2 waiting for N=3. Proactively detecting convergence accelerates pattern promotion.

5. **observation-refactoring**: The hub-subworkflow pattern (N=5) provides a battle-tested workflow for maintaining observation health. First execution found 100% false positive rate with keyword clustering, leading to v1.5 improvements (developer recognition trigger). Source: `docs/workflows/observation-refactoring.md`.

6. **loop-closer**: Prevents "forgot to update" failures by detecting open loops before marking work complete. Scans for DEFERRED/PLACEHOLDER observations, unclosed TODOs, and missing documentation updates. Source: `docs/workflows/closing-loops.md`.

7. **parallel-decision**: The 5-factor decision framework (team size, coupling, interfaces, patterns, integration) prevents parallel execution failures. Wrong parallelization decisions lead to wasted effort, merge conflicts, and coordination overhead. Source: `docs/workflows/parallel-vs-serial-decision.md`.

8. **threshold-delegator**: Automatic delegation suggestions when issue counts exceed thresholds (e.g., >10 MCE header failures → suggest planner). Eliminates cognitive load of "should I fix serially or delegate?" decisions. Source: `docs/patterns/auto-delegate-on-threshold.md`.

9. **mce-refactorer**: Guides code file splitting using proven strategies (template type split, workflow stage split, responsibility separation). N=7 validated pattern with documented strategies for test files, production code, and research code. For documentation files, delegates to `hub-subworkflow` skill. Source: `docs/patterns/mce-refactoring.md`.

10. **hub-subworkflow**: Splits large documentation files into hub (navigation + overview, ~100-150 lines) and sub-documents (focused content, ~100-200 lines each). N=5 validated across plan workflows, session workflows, automation/agentic architecture, and observation-refactoring. Source: `docs/patterns/hub-subworkflow.md`.

### Verification Gate

- [ ] constraint-versioning tracks at least one observation's N=1→N=3+ journey
- [ ] pbd-strength-classifier correctly classifies 5+ existing observations
- [ ] cross-session-safety-check detects at least one historical cross-session incident
- [ ] pattern-convergence-detector identifies at least 2 converging N=2 patterns
- [ ] observation-refactoring identifies rename/consolidate/promote/archive candidates correctly
- [ ] loop-closer detects at least 3 types of open loops (DEFERRED, PLACEHOLDER, TODO)
- [ ] parallel-decision evaluates all 5 criteria and produces recommendation
- [ ] threshold-delegator triggers suggestion when configured threshold exceeded
- [ ] mce-refactorer suggests appropriate split strategy based on file type
- [ ] hub-subworkflow suggests hub + sub-document structure for large docs

### Deferred Items from Phase 6 Code Review (N=2)

| Item | Source | Description |
|------|--------|-------------|
| N-count evidence verification | A-3 (Gemini) | Mechanism to verify N-count evidence is accurate (future work, Phase 7+). |

*Note: All other code review findings (I-1 through I-4, M-1 through M-7) were resolved on 2026-02-15.*

### Deferred Items from Phase 6 Twin Review (N=2)

| Item | Source | Description | Phase 7 Status |
|------|--------|-------------|----------------|
| Test file MCE compliance | I-1 (Both twins) | Phase 6 test files range 411-608 lines (exceed 300-line guidance). Accept as contract-test pattern: inline mocks naturally increase file size. | Accepted as pattern |
| Stage 7 incomplete tasks | I-2 (Technical) | Custom category prefixes for slug-taxonomy and skill dependency graph updates deferred to Phase 7. | Addressed (Option C, 12-skill sample) |
| "When NOT to use" sections | M-1 (Creative) | All 10 extension SKILL.md files lack "When NOT to use" sections. Enhancement for Phase 7. | Partial (2/10 skills) |
| pbd-strength-classifier rename | M-3 (Creative) | Consider renaming to `observation-strength-classifier` to avoid PBD jargon. Team decision required. | Keep current name |
| ARCHITECTURE.md Phase 6 density | M-4 (Creative) | Phase 6 section tables could be condensed. Optional optimization. | Keep current structure |
| Mock DRY refactoring | M-5 (Technical) | Shared parsing utilities (e.g., `parseFrontmatter()`) duplicated across test files. Extract to `tests/mocks/mock-utils.ts` in Phase 7. | Deferred (future) |

### Deferred Items from Phase 7 (Future Work)

| Item | Source | Description | Recommendation |
|------|--------|-------------|----------------|
| Mock DRY refactoring | Stage 3 | Extract shared `parseFrontmatter()` variants to `tests/mocks/mock-utils.ts`. Different frontmatter types require different interfaces. | When test file count exceeds 10 |
| ~~"When NOT to use" sections~~ | ~~Stage 4~~ | ~~8 remaining extension skills lack "When NOT to use" sections.~~ | **Resolved** - All 10 extension skills now have this section |
| N-count evidence verification | Phase 6 A-3 | Automated mechanism to verify N-count claims match actual evidence in observations. | Future tooling sprint |

### Deferred Items from Implementation Review (N=2 Code Review)

| Item | Source | Description | Target |
|------|--------|-------------|--------|
| API schema validation | I-4 (Codex) | Validate mock adapter interfaces match real ClawHub APIs when it exists. Prevents interface drift. | Phase 5b |
| Lock recovery strategy | I-5 (Codex) | Single-agent governance lock (5-min TTL) has no recovery for crashed agents. Document recovery flow. | RG-2 research |
| Lock state observability | M-4 (Codex) | No metrics/logging for governance lock state. Add when multi-agent coordination implemented. | RG-2 research |

### Deferred Items from Implementation Review (N=2 Twin Review)

| Item | Source | Description | Target |
|------|--------|-------------|--------|
| Dependency version pinning | M-3 (Technical) | SKILL.md "Depends on" sections don't specify versions. Add when runtime exists with semantic versioning. | Phase 8+ |
| Foundation skill consolidation | I-2 (Technical) | 5 Foundation skills scattered across 3 directories (core/, review/, detection/). Consider consolidating to foundation/ directory. | Phase 8+ |
| Core Memory SKILL.md splitting | I-1 (Technical) | 7 Core Memory SKILL.md files exceed MCE (322-379 lines). Consider SKILL.md + EXAMPLES.md pattern during runtime implementation. | Phase 8+ |

---

## Phase 7: Architecture Documentation

**Duration**: 1 day
**Prerequisites**: All previous phases complete
**Output**: `projects/live-neon/skills/ARCHITECTURE.md`

### Purpose

Document how all 48 skills work together as a coherent system. This is the
"owner's manual" for the agentic skills infrastructure.

### ARCHITECTURE.md Contents

```markdown
# Agentic Skills Architecture

## Overview

[High-level description of the failure→constraint lifecycle]

## Skill Layers

```
┌─────────────────────────────────────────────────────┐
│                   Bridge Layer                       │
│  (ClawHub integration: self-improving, proactive)   │
├─────────────────────────────────────────────────────┤
│              Extensions Layer                        │
│  (Observation-backed: versioning, convergence)      │
├─────────────────────────────────────────────────────┤
│         Governance & Safety Layer                    │
│  (90-day reviews, model pinning, fallbacks)         │
├─────────────────────────────────────────────────────┤
│          Review & Detection Layer                    │
│  (twin-review, failure-detector, metrics)           │
├─────────────────────────────────────────────────────┤
│              Core Memory Layer                       │
│  (failure-tracker, constraint-generator, circuit-   │
│   breaker, observation-recorder)                    │
├─────────────────────────────────────────────────────┤
│             Foundation Layer                         │
│  (context-packet, file-verifier, constraint-        │
│   enforcer, severity-tagger, positive-framer)       │
└─────────────────────────────────────────────────────┘
```

## Skill Dependency Graph

[Mermaid or ASCII diagram showing which skills depend on others]

## Data Flow

### Failure → Constraint Lifecycle
1. failure-detector identifies failure signal
2. failure-tracker creates/updates observation (R+1)
3. Human confirms (C+1) or disconfirms (D+1)
4. When R≥3, C≥2, sources≥2: constraint-generator creates candidate
5. constraint-lifecycle transitions: draft → active
6. constraint-enforcer checks actions against active constraints
7. circuit-breaker tracks violations (5 in 30d → OPEN)

### ClawHub Integration
- learnings-n-counter ↔ self-improving-agent
- feature-request-tracker ↔ proactive-agent
- heartbeat-constraint-check ↔ proactive-agent heartbeat

## Configuration

[Environment variables, file paths, thresholds]

## Extending the System

[How to add new skills following the patterns]
```

### Verification Gate

- [ ] ARCHITECTURE.md created at `projects/live-neon/skills/ARCHITECTURE.md`
- [ ] All 6 skill layers documented
- [ ] Dependency graph accurate (verified against skill Integration sections)
- [ ] Data flow matches Architecture Guide v5.2
- [ ] ClawHub integration points documented

---

## Post-Phase 7: Consolidation

**Date**: 2026-02-15
**Plan**: `../plans/2026-02-15-agentic-skills-consolidation.md`

### Why Consolidate

Internal review (2026-02-14) identified:
1. **Token overhead**: 48 skills × ~150 chars = ~7,000 chars injected per session
2. **No automation**: Zero `scripts/` directories - relied on agent "remembering"
3. **Paper architecture**: 48 SKILL.md specs, but no runtime hooks
4. **Artificial granularity**: e.g., `positive-framer` as its own skill

### Consolidation Result

| Before | After |
|--------|-------|
| 48 skills | 7 consolidated skills |
| 6 layers + bridge + extensions | Flat structure |
| ~7,000 chars overhead | ~1,400 chars overhead |
| Zero hooks | Next Steps soft hooks |

### What Was Preserved

- R/C/D counter model
- Eligibility criteria (R≥3, C≥2, D/(C+D)<0.2, sources≥2)
- Severity-tiered circuit breaker
- Event-driven governance
- Golden master pattern
- Bridge layer (as documentation, not skill)

### Skill Mapping

| Consolidated Skill | Source Skills Count | Source Layers |
|--------------------|---------------------|---------------|
| context-verifier | 3 | Foundation |
| failure-memory | 10 | Core + Detection + Foundation |
| constraint-engine | 9 | Core |
| review-orchestrator | 5 | Review |
| governance | 6 | Governance + Safety (adoption-monitor) |
| safety-checks | 4 | Safety |
| workflow-tools | 4 | Extensions |
| *(documentation)* | 5 | Bridge |
| *(removed)* | 1 | Extensions (pbd-strength-classifier, redundant) |

*Table totals 47. Archive contains 48 SKILL.md files (1 skill added during Phase 6 implementation).*

### Post-Consolidation Work

- **Decoupling** (2026-02-15): `../plans/2026-02-15-agentic-clawhub-decoupling.md`
  - Removed Multiverse-specific dependencies
  - Added OpenClaw config path support
  - Made cognitive modes model-agnostic

- **ClawHub Publication** (2026-02-16): `../plans/2026-02-16-agentic-clawhub-publication.md`
  - Publishing 7 agentic + 7 PBD skills
  - Security compliance (disable-model-invocation, data handling)
  - Rate limit handling (15-min delays)

---

## Per-Phase Documentation Requirement

**Each phase implementation plan MUST include**:

1. **Update ARCHITECTURE.md** with newly implemented skills:
   - Add to appropriate layer section
   - Update dependency graph
   - Document any new data flows

2. **Verify cross-references**:
   - Each skill's "Integration" section matches ARCHITECTURE.md
   - No orphan skills (every skill either depends on or is used by another)

This ensures ARCHITECTURE.md stays current as skills are implemented, rather than
becoming stale documentation written once and forgotten.

---

## Skill Lifecycle Management

Skills, like constraints, have a lifecycle. With 48 skills, some may not work out as designed.

### Skill States

| State | Description | Visibility |
|-------|-------------|------------|
| **active** | Normal operation | Listed in skill registry |
| **deprecated** | Superseded or problematic; still functional | Listed with warning |
| **removed** | No longer available | Unlisted; invocation returns error |

### Deprecation Process

1. **Identify**: Skill is underperforming, superseded, or harmful
2. **Document**: Add deprecation notice to SKILL.md frontmatter:
   ```yaml
   deprecated: true
   deprecated_date: 2026-03-15
   deprecated_reason: "Superseded by skill-name-v2"
   replacement: skill-name-v2  # Optional
   ```
3. **Notify**: Skill invocation prints deprecation warning
4. **Grace period**: 30 days minimum before removal
5. **Remove**: Delete skill directory; add to `REMOVED_SKILLS.md` log

### SKILL.md Frontmatter Addition

Add to skill template:
```yaml
status: active  # active | deprecated | removed
deprecated: false
deprecated_date: null
deprecated_reason: null
replacement: null
```

### Removal Criteria

Remove skill after:
- 30+ days deprecated AND
- Zero invocations in last 14 days AND
- Replacement available (if applicable)

---

## Skill Frontmatter Audit Deferred Items

The skill frontmatter audit (2026-02-14) added `layer` and `status` fields to all 33 SKILL.md
files and SKILL_TEMPLATE.md. The following items were identified for future work:

### From Twin Review (N=2)

| Item | Source | Description | Priority |
|------|--------|-------------|----------|
| Plan length exception patterns | Finding 1 | Document when plan length exceptions (>400 lines) are justified. Create observation when pattern recurs (N≥3). | Low |
| Shell compatibility guidance | Finding 3 | Verification scripts should use `find` instead of glob patterns for cross-shell compatibility (bash vs zsh). Add to verification standards when formalizing. | Low |
| Layer count CI validation | Finding 4 | Add CI check to skills submodule validating layer distribution (expected: foundation=5, core=9, review=6, detection=4, governance=5, safety=4). | Medium |

### Implementation Artifacts

- **Plan**: `../plans/2026-02-14-skill-frontmatter-audit.md` (status: complete)
- **Template update**: `projects/live-neon/skills/agentic/SKILL_TEMPLATE.md` (layer/status fields + comment style note)
- **Workflow created**: `projects/live-neon/skills/docs/workflows/batch-file-modification.md` (Pilot N=1)
- **Code review findings**: `../issues/2026-02-14-frontmatter-audit-impl-review-findings.md` (closed, 4 non-issues)
- **Twin review findings**: `../issues/2026-02-14-frontmatter-audit-twin-review-findings.md` (closed, 2 completed, 3 deferred)

---

## Skill Template

**Implementation Examples**: See `../proposals/2026-02-13-openclaw-skills-for-agentic-system.md`
for 19 detailed SKILL.md implementations (failure-tracker, constraint-enforcer, observation-recorder,
circuit-breaker, etc.) that can be used as templates.

**Research**: See `projects/live-neon/neon-soul/docs/research/openclaw-soul-architecture.md` for
the four-section structure (Core Truths, Boundaries, Vibe, Continuity) and SoulCraft seven-dimension
framework. See `openclaw-soul-templates-practical-cases.md` for 10 production-ready templates with
pattern analysis (NEVER statements, failure modes).

```markdown
---
name: skill-name
version: 1.0.0
description: One-line description
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core]
layer: core  # foundation | core | review | detection | governance | safety | bridge | extensions
status: active  # active | deprecated | removed
---

# skill-name

Brief description of what this skill does.

## Usage

```
/skill-name [arguments]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| arg1 | Yes | Description |
| arg2 | No | Description (default: value) |

## Output

Description of what the skill outputs.

## Example

```
/skill-name example-arg

[Expected output]
```

## Integration

- **Depends on**: [list of skills this depends on]
- **Used by**: [list of skills that use this]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

---

## Timeline

### Original Implementation (Phases 1-7)

| Phase | Duration | Skills | Status |
|-------|----------|--------|--------|
| Phase 1: Quick Wins | 1-2 days | 5 | ✅ Complete |
| Phase 2: Core Memory | 3-5 days | 9 | ✅ Complete |
| Phase 3: Review & Detection | 2-3 days | 10 | ✅ Complete |
| Phase 4: Governance & Safety | 2-3 days | 8 | ✅ Complete |
| Phase 5: Bridge | 1-2 days | 5 | ✅ Complete |
| Phase 6: Extensions | 2-3 days | 10 | ✅ Complete |
| Phase 7: Architecture | 1 day | 0 | ✅ Complete |

**Original subtotal**: 12-20 days

### Post-Phase 7 Work

| Phase | Duration | Scope | Status |
|-------|----------|-------|--------|
| Consolidation | 6-8.5 days | 48 → 7 skills | ✅ Complete |
| Decoupling | ~3-4 days (8-11 sessions) | Remove Multiverse deps | ✅ Complete |
| ClawHub Publication | ~1 day (2-3 sessions) | 14 skills to ClawHub | ⏳ In Progress |

**Post-Phase 7 subtotal**: ~10-14 days

**Note on units**: "Sessions" refers to focused work sessions (~2-4 hours each).
Post-Phase 7 work used session-based tracking due to intermittent availability.

---

## Success Criteria

### Original Phases (Pre-Consolidation)

Phases 1-7 were completed as designed, implementing 47 individual skills.
See implementation results in `docs/implementation/agentic-phase*-results.md`.

### Consolidation (2026-02-15)

After Phase 7 completion, internal review identified over-engineering.
Consolidation reduced 48 skills to 7 while preserving all core functionality.

**Evidence**: See `docs/implementation/agentic-consolidation-results.md` and
`docs/plans/2026-02-15-agentic-skills-consolidation.md` (status: complete).

- [x] 7 consolidated skills operational (down from 48)
- [x] Prompt overhead reduced (~7,000 → ~1,400 chars)
- [x] Next Steps soft hooks in all skills
- [x] Core lifecycle works: failure → record → eligible → constraint → enforce
- [x] HEARTBEAT.md created for periodic checks
- [x] Test coverage maintained (<5% delta)
- [x] Documentation updated (ARCHITECTURE.md, READMEs)

### Decoupling (2026-02-15)

**Evidence**: See `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (status: complete).

- [x] All 7 skills decoupled from Multiverse dependencies
- [x] Both `.openclaw/` and `.claude/` config paths supported
- [x] Cognitive modes model-agnostic
- [x] No hardcoded model references

### ClawHub Publication (2026-02-16 - In Progress)

**Evidence**: See `docs/plans/2026-02-16-agentic-clawhub-publication.md` (status: in-progress).

- [x] Phase 1: CLI setup and authentication
- [x] Phase 2: context-verifier published (v1.0.1)
- [ ] Phase 3: Core pipeline (failure-memory, constraint-engine)
- [ ] Phase 4: Extended suite (4 remaining skills)
- [x] Phase 5: Security compliance (all 14 skills)
- [ ] Phase 6: PBD skills publication
- [ ] Phase 7: Cross-linking

---

## Relationship to Plan A

```
Plan A (Brand Restructure)
         │
         ▼
   Public repo created
   (projects/live-neon/skills/)
         │
         ▼
This Specification
         │
         ▼
   Implementation Plans
   (Phase 1, 2, 3...)
         │
         ▼
   Skills developed directly
   in golden master location
```

**Key point**: This specification depends on Plan A. Skills are developed directly in the
golden master location (`projects/live-neon/skills/agentic/`). Implementation plans
break down the work into phases.

---

## Cross-References

### Implementation Plans
- **Phase 1 (Quick Wins)**: `../plans/2026-02-13-agentic-skills-phase1-implementation.md` (5 skills) ✅ Complete
- **Phase 2 (Core Memory)**: `../plans/2026-02-13-agentic-skills-phase2-implementation.md` (9 skills) ✅ Complete
- **Phase 3 (Review & Detection)**: `../plans/2026-02-13-agentic-skills-phase3-implementation.md` (10 skills) ✅ Complete
- **Phase 4 (Governance & Safety)**: `../plans/2026-02-14-agentic-skills-phase4-implementation.md` (9 skills) ✅ Complete
- **Phase 5 (Bridge)**: `../plans/2026-02-14-agentic-skills-phase5-implementation.md` (5 skills) ✅ Complete
- **Phase 6 (Extensions)**: `../plans/2026-02-15-agentic-skills-phase6-implementation.md` (10 skills) ✅ Complete
- **Phase 7 (Architecture)**: `../plans/2026-02-15-agentic-skills-phase7-implementation.md` (0 skills, finalization) ✅ Complete

### Related Plans & Proposals
- **Plan A (Brand Restructure)**: `../plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md`
- **Original Combined Plan**: `../plans/2026-02-13-public-skills-repo-migration.md` (superseded)
- **OpenClaw Proposal**: `../proposals/2026-02-13-openclaw-skills-for-agentic-system.md`

### Guides
- **Agentic Architecture Guide**: `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v5.2)
- **Agentic System Guide**: `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md` (v1.4)

### Observation Evidence (High N-Count)
- **Configuration-as-Code** (N=9): `docs/observations/configuration-as-code-type-safety.md` - Constraint progression model
- **Destructive Git Ops** (N=5): `docs/observations/2025-11-11-git-destructive-operations-without-confirmation.md` - Circuit breaker thresholds
- **Golden Master** (N=4): `docs/observations/golden-master-cross-project-knowledge.md` - File verification patterns
- **Plan-Approve-Implement** (N=4): `docs/observations/plan-approve-implement-workflow-violation.md` - Workflow constraint enforcement
- **Resist File Proliferation** (N=11): `docs/observations/2025-11-09-resist-file-proliferation.md` - Anti-pattern detection metrics
- **Hub-Subworkflow Pattern** (N=5): `docs/observations/workflow-hub-subworkflow-pattern.md` - Observation refactoring workflow structure
- **MCE Refactoring** (N=7): `docs/patterns/mce-refactoring.md` - File splitting strategies by type
- **Auto-Delegate** (N=3): `docs/patterns/auto-delegate-on-threshold.md` - Threshold-based delegation

### Source Workflows
- **Observation Refactoring**: `docs/workflows/observation-refactoring.md` - Source for observation-refactoring skill (hub workflow)
- **Observation Consolidation**: `docs/workflows/observation-consolidation.md` - Sub-workflow for consolidation operations
- **Closing Loops**: `docs/workflows/closing-loops.md` - Source for loop-closer skill
- **Parallel vs Serial Decision**: `docs/workflows/parallel-vs-serial-decision.md` - Source for parallel-decision skill (5-factor framework)

### Source Patterns
- **MCE Refactoring**: `docs/patterns/mce-refactoring.md` - Source for mce-refactorer skill (N=7)
- **Auto-Delegate on Threshold**: `docs/patterns/auto-delegate-on-threshold.md` - Source for threshold-delegator skill (N=3)
- **Hub-Subworkflow**: `docs/patterns/hub-subworkflow.md` - Source for hub-subworkflow skill (N=5)

### Research (Neon-Soul)

Foundation research from `projects/live-neon/neon-soul/docs/research/`:

| Research File | Relevance to Specification |
|---------------|---------------------------|
| `chat-interaction-patterns.md` | **Human approval mechanisms**: Five-stage handoff (Request→Refinement→Approval→Execution→Acknowledgment), Governor pattern (preview, confirm, audit), explicit approval phrases with "(human)" marker. Directly applicable to emergency-override skill (Section 2.2-2.5, N=2 validated). |
| `wisdom-synthesis-patterns.md` | **Evidence classification**: Two-dimensional model (source × stance), anti-echo-chamber rule requiring external OR questioning evidence for promotion. Validates R/C/D counter design and eligibility criteria. |
| `hierarchical-principles-architecture.md` | **Soul schema**: 5 axioms + 11 principles + priority hierarchy + meta-pattern. CJK compression (誤容・尊護・徳匠・果重・言創). Applicable to constraint organization and severity classification. |
| `compression-native-souls.md` | **Semantic compression research**: 41 sources including LLMLingua (20x compression, 1.5% loss), MetaGlyph (62-81% token reduction). Academic foundation for semantic classification over pattern matching. |
| `openclaw-soul-architecture.md` | **Soul document structure**: Four sections (Core Truths, Boundaries, Vibe, Continuity), SoulCraft seven-dimension framework. Applicable to SKILL.md template design. |
| `openclaw-soul-templates-practical-cases.md` | **Production templates**: 10 ready-to-use SOUL.md templates with NEVER statements (10/10) and failure modes (10/10). Pattern analysis for constraint template design. |
| `openclaw-self-learning-agent.md` | **Evolution lifecycle**: Tiered update frequency (Fast/Medium/Full), content-driven thresholds. Applicable to constraint-lifecycle state machine and progressive-loader priorities. |
| `optimal-axiom-count.md` | **Cognitive limits**: Research on 5±2 optimal axiom count. Validates the 5-axiom architecture and constraint grouping limits. |
| `compression-baseline.md` | **Compression benchmarks**: 1339:1 compression ratio achieved. Baseline metrics for context-packet optimization. |
| `cryptographic-audit-chains.md` | **Packet signing**: Cryptographic audit chain patterns. Applicable to context-packet signing (RG-7 complete). |

### Research Completed (Phase 2 Sprint)

| Research Gate | File | Status | Key Finding |
|---------------|------|--------|-------------|
| RG-1 | `circuit-breaker-patterns.md` | ✅ DONE | 5/30-day validated; add configurability, 5-min dedup |
| RG-3 | `semantic-similarity-thresholds.md` | ✅ DONE | Tiered: CRITICAL≥0.85, IMPORTANT≥0.80, MINOR≥0.70 |
| RG-5 | `human-confirmation-bias.md` | ✅ DONE | Multi-user requirement (c_unique_users_min: 2) |
| RG-8 | `llm-behavioral-testing.md` | ✅ DONE | Three-tier: structural/fixture/live LLM |

### Research Gaps (Still Needed)

| Research Gate | Proposed File | Priority |
|---------------|---------------|----------|
| RG-2 | `multi-agent-coordination.md` | Medium (Phase 4) |
| RG-4 | `constraint-decay-patterns.md` | Medium (Phase 4) |
| RG-6 | `failure-attribution-accuracy.md` | Medium (Phase 3) |

**Phase 2 research sprint complete** (2026-02-13). Phase 2 implementation can now proceed.

---

## Glossary

| Term | Definition |
|------|------------|
| **ClawHub** | Skill registry and distribution platform for OpenClaw-compatible AI skills |
| **VFM** | Value Function Model - scoring system for evaluating skill/constraint effectiveness |
| **R/C/D Counters** | Recurrence (auto-detected), Confirmations (human-verified), Disconfirmations (false positives) |
| **Research Gate (RG)** | Knowledge prerequisite requiring external validation before implementation |
| **Verification Gate** | Implementation checkpoint confirming phase completion criteria |
| **MCE** | Minimal Complete Example - file size limit (≤200 lines) for cognitive load management |
| **Golden Master** | Single source of truth pattern - one authoritative location for artifacts |
| **Circuit Breaker** | Safety mechanism that trips after threshold violations, requiring human intervention |
| **Semantic Classification** | LLM-based intent/meaning analysis (vs pattern matching on strings) |
| **Two-Stage Matching** | Fast embedding filter + deep LLM classification for ambiguous cases |
| **Fail-Closed** | Default to safe/restrictive behavior when uncertain |
| **Event-Driven Governance** | Governance via automated alerts/issues rather than manual dashboard review |

---

<details>
<summary><strong>Changelog</strong> (click to expand)</summary>

**Note**: High update frequency on 2026-02-13/14 reflects active implementation
phases (Phase 1-4 completed rapidly). This is a living specification that evolves with
implementation learnings. Status "approved" indicates architectural direction is stable;
details continue to be refined.

*Specification created 2026-02-13. Split from original combined plan per N=2 review recommendations.*
*Updated 2026-02-13: Aligned terminology with Architecture Guide v5.2 (R/C/D counters, eligibility criteria).*
*Updated 2026-02-13: Added observation evidence (5 high N-count observations), Phase 6 extension skills (4 new), observation-backed implementation details.*
*Updated 2026-02-13: Moved from docs/plans/ to docs/proposals/ - this is a specification, implementation plans are separate.*
*Updated 2026-02-13: Added unified testing infrastructure section. Phase 1 marked complete with test validation.*
*Updated 2026-02-13: Added Design Principles section - semantic classification over pattern matching (from N=2 code review).*
*Updated 2026-02-13: Added deferred items from Phase 1 code review - `algorithm:hash` format (Phase 2), behavioral tests (Phase 2), packet signing (Phase 4).*
*Updated 2026-02-13: Added inline research references from neon-soul (9 research files) - human approval patterns, evidence classification, semantic compression, soul architecture.*
*Updated 2026-02-13: Added Research Gates section (8 gates) identifying external research needed before implementation - circuit breakers, multi-agent coordination, semantic thresholds, constraint decay, human bias, failure attribution, cryptographic audit, LLM testing.*
*Updated 2026-02-13: Completed Phase 2 research sprint (Option A) - RG-1, RG-3, RG-5, RG-8 all resolved. Phase 2 implementation can proceed.*
*Updated 2026-02-13: Added observation-refactoring skill to Phase 6 Extensions (hub-subworkflow N=5). Total: 42 skills.*
*Updated 2026-02-13: Added deferred items from Phase 2 Twin Review (N=2) - observability/metrics, cleanup/maintenance, version migration. Cross-referenced remediation issues.*
*Updated 2026-02-13: Added 4 workflow/pattern-backed skills to Phase 6 Extensions: loop-closer, parallel-decision, threshold-delegator, mce-refactorer. Total: 46 skills.*
*Updated 2026-02-13: Added hub-subworkflow skill (N=5) to Phase 6 Extensions. mce-refactorer now delegates to hub-subworkflow for documentation files. Total: 47 skills.*
*Updated 2026-02-14: Added deferred items from Phase 3 code review (real integration tests, model naming monitoring) and twin review (test file splitting, custom category prefixes, Quick Start sections, skill discovery docs, test scenario comments). Cross-referenced Phase 3 review issues.*
*Updated 2026-02-14: Addressed external review feedback - added Glossary, Performance Requirements, Two-Stage Matching pattern, severity-tiered circuit breaker defaults, RG-6 provisional implementation, MoSCoW prioritization, Phase 6 dependency notes, Skill Lifecycle Management, `layer` field to template.*
*Updated 2026-02-14: Added Skill Frontmatter Audit Deferred Items section - layer count CI validation, shell compatibility guidance, plan length patterns. Added frontmatter audit issues to related_issues.*
*Updated 2026-02-14: Added Phase 5 deferred items from code review (singleton parallel testing, test mock refactoring, logging abstraction) and twin review (heartbeat/governance-state overlap). Added Phase 5 issues to related_issues.*
*Updated 2026-02-15: Marked Phases 2, 3, 4, 5 as complete in Success Criteria. All 37 original skills implemented. Phase 5b (ClawHub integration) and Phase 6 (extensions) remain.*
*Updated 2026-02-15: Added Phase 6 deferred items from code review (N-count evidence verification) and twin review (test file MCE, Stage 7 tasks, "When NOT to use" sections, pbd-strength-classifier rename, mock DRY refactoring). Added Phase 6 issues to related_issues.*
*Updated 2026-02-15: Marked Phases 6 and 7 as complete in Success Criteria. All 47 skills operational (specification + contract tests). Added Phase 7 deferred items (mock DRY, "When NOT to use" sections, N-count evidence verification).*
*Updated 2026-02-15: Added implementation review findings from N=2 code review (Codex + Gemini). Key finding: "paper architecture" - specs complete but zero runtime. Semantic classification unimplemented. See ../issues/2026-02-15-agentic-skills-implementation-review-findings.md.*
*Updated 2026-02-15: Added deferred items from N=2 twin review (Technical + Creative). Items: dependency version pinning (Phase 8+), Foundation skill consolidation (Phase 8+), Core Memory SKILL.md splitting (Phase 8+). Marked "When NOT to use" sections as resolved (all 10 extension skills complete). Added Reading Guide section. See ../issues/2026-02-15-agentic-skills-impl-twin-review-findings.md.*

</details>
