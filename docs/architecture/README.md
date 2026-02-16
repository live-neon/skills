<!--
Version: 1.0 (Section Markers + CJK Summary)
Last Updated: 2026-02-15
Purpose: Agentic skills architecture with token-optimized CJK summary
Target sections: 8 major sections
-->

<!-- SECTION: cjk-summary -->
# 智 Agentic Skills Architecture

**核**: Failure-anchored learning system. 7 consolidated skills enabling AI to learn from consequences.

## Quick Reference

**原則**: AI systems learn best from consequences, not instructions.

**7 Skills** (consolidated from 48):
| Skill | Alias | Layer | Purpose |
|-------|-------|-------|---------|
| failure-memory | `/fm` | Core | Failure detection, observation recording |
| constraint-engine | `/ce` | Core | Constraint generation, enforcement |
| context-verifier | `/cv` | Foundation | File hashing, integrity verification |
| review-orchestrator | `/ro` | Review | Twin/cognitive review coordination |
| governance | `/gov` | Governance | Constraint lifecycle, state management |
| safety-checks | `/sc` | Safety | Model pinning, fallback validation |
| workflow-tools | `/wt` | Extensions | Loop detection, parallel decisions |

## Three-Layer Architecture

```
┌───────────────────────────────────────────────────────────┐
│ LAYER 3: AUTOMATION (Future) - Claude Code hooks          │
├───────────────────────────────────────────────────────────┤
│ LAYER 2: WORKSPACE - .learnings/, output/, HEARTBEAT.md  │
├───────────────────────────────────────────────────────────┤
│ LAYER 1: SKILL.md - Instructions + Next Steps (ACTIVE)   │
└───────────────────────────────────────────────────────────┘
```

## Data Flow (Failure → Constraint)

```
1. /fm detect → identifies failure signal
2. /fm record → creates observation (R++)
3. Human verify → C++ or D++
4. Eligibility: R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2
5. /ce generate → creates constraint
6. /ce check → runtime enforcement
```

## Circuit Breaker

```
CLOSED → (5 violations/30d) → OPEN → (24h cooldown) → HALF-OPEN → CLOSED
```

| Severity | Threshold | Rationale |
|----------|-----------|-----------|
| CRITICAL | 3 | High-risk constraints trip early |
| IMPORTANT | 5 | Standard threshold |
| MINOR | 10 | Low-risk, more tolerance |

## ClawHub Integration

| Skill | Format | What We Provide |
|-------|--------|-----------------|
| self-improving-agent@1.0.5 | `.learnings/` | LEARNINGS.md, ERRORS.md |
| proactive-agent@3.1.0 | `output/constraints/` | Constraint files, HEARTBEAT.md |

## Key Paths

```
.learnings/           # Observations (self-improving-agent format)
output/constraints/   # Active constraints
output/VERSION.md     # Format compatibility
HEARTBEAT.md          # Periodic verification
```

**関連**:
- 智:layers → Skill layer details
- 智:lifecycle → Constraint lifecycle
- 智:clawhub → ClawHub integration
- 智:config → Configuration

<!-- END SECTION: cjk-summary -->

---

<!-- SECTION: overview -->
## Overview

Live Neon skills are organized into two main categories:

1. **PBD Skills** (`pbd/`): Principle-Based Development skills for human developers
2. **Agentic Skills** (`agentic/`): Memory and constraint skills for AI-assisted development

This architecture focuses on the agentic skills, which implement the core insight:
**AI systems learn best from consequences, not instructions**.

### Implementation Status

**Current State**: 7 Consolidated Skills + ClawHub Integration Docs

Skills were consolidated on 2026-02-15 from 48 granular specifications to 7 unified skills.
The consolidation follows the principle: **"When does the agent need this information?"**

| Component | Status | Description |
|-----------|--------|-------------|
| SKILL.md files | Complete | 7 consolidated skill specifications with CLI interfaces |
| Contract tests | Complete | ~100 tests validating data contracts |
| Workspace files | Complete | `.learnings/`, `output/` directories following ClawHub format |
| Next Steps soft hooks | Complete | Behavioral triggers in SKILL.md (no runtime code) |
| Claude Code hooks | Deferred | Future release will add programmatic automation |

**What "Implemented" means**:
- ✅ Consolidated SKILL.md specification exists
- ✅ Contract tests pass against mock implementations
- ✅ Sub-commands grouped by invocation context
- ✅ Next Steps provide soft hook behavioral triggers
- ✅ Workspace files follow ClawHub skill conventions
- ❌ No runtime CLI wrapper (Layer 3 automation deferred)

**Why consolidation**:
1. **Token efficiency**: 48 skills × ~150 chars = ~7,000 chars → 7 skills × ~200 chars = ~1,400 chars
2. **Runtime automation**: Adding hooks is easier with 7 skills than 48
3. **Context coherence**: Related operations grouped by when agent needs them

### Getting Started

**New to agentic skills?** Follow this path:

1. **Understand the core insight**: Read Overview - AI learns from consequences, not instructions
2. **Learn the lifecycle**: See Data Flow - the 6-step Failure → Constraint process
3. **Explore the 7 skills**: Review Skill Details - the unified skill system
4. **Run tests**: `cd tests && npm test` - see skills in action

**Quick reference**:
- 7 consolidated skills
- ~100 contract tests (all passing)
- HEARTBEAT.md for periodic maintenance checks
- Specification at `docs/proposals/2026-02-13-agentic-skills-specification.md`

**Skill aliases**: `/fm` (failure-memory), `/ce` (constraint-engine), `/cv` (context-verifier),
`/ro` (review-orchestrator), `/gov` (governance), `/sc` (safety-checks), `/wt` (workflow-tools)

<!-- END SECTION: overview -->

---

<!-- SECTION: layers -->
## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 3: AUTOMATION (Future)                   │
│  Claude Code hooks - deferred to future release                 │
│  OpenClaw Gateway hooks (agent:bootstrap) - optional            │
├─────────────────────────────────────────────────────────────────┤
│                   LAYER 2: WORKSPACE                             │
│  Persistent files (.learnings/, output/, SESSION-STATE.md)      │
│  Shared with ClawHub skills, survives compaction                │
├─────────────────────────────────────────────────────────────────┤
│                   LAYER 1: SKILL (SKILL.md) ← ACTIVE             │
│  Instructions + Next Steps (portable soft hooks)                │
│  Works everywhere, regardless of hook support                   │
└─────────────────────────────────────────────────────────────────┘
```

**Current release**: Focus on Layer 1 (Next Steps) and Layer 2 (Workspace files).
This matches proactive-agent's approach - pure behavioral protocols, no programmatic hooks.

### Skill Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXTENSIONS                                  │
│  workflow-tools (/wt)                                           │
│  Loop detection, parallel decisions, MCE compliance             │
├─────────────────────────────────────────────────────────────────┤
│                GOVERNANCE & SAFETY                               │
│  governance (/gov)     │  safety-checks (/sc)                   │
│  State, review, index  │  Model pin, fallback, cache, session   │
├─────────────────────────────────────────────────────────────────┤
│                      REVIEW                                      │
│  review-orchestrator (/ro)                                       │
│  Twin/cognitive review selection and coordination               │
├─────────────────────────────────────────────────────────────────┤
│                       CORE                                       │
│  failure-memory (/fm)  │  constraint-engine (/ce)               │
│  Detect, record,       │  Check, generate, lifecycle,           │
│  search, classify      │  circuit breaker, override             │
├─────────────────────────────────────────────────────────────────┤
│                    FOUNDATION                                    │
│  context-verifier (/cv)                                          │
│  File hashes, integrity verification, context packets           │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Guidelines

| Layer | Dependency Rule |
|-------|-----------------|
| Foundation | No dependencies on other agentic skills |
| Core | May depend on Foundation skills |
| Review | May depend on Foundation and Core |
| Governance/Safety | May depend on any lower layer |
| Extensions | May depend on any layer |

**Core dependency flow**: `/fm` → `/ce` → `/gov` → `/sc`

<!-- END SECTION: layers -->

---

<!-- SECTION: skills -->
## Skill Details

### context-verifier (Foundation)

**Alias**: `/cv` | **Layer**: Foundation | **Location**: `agentic/context-verifier/`

Consolidates: context-packet, file-verifier

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/cv hash` | 哈希 | Generate SHA-256 file hashes |
| `/cv verify` | 検証 | Check file integrity against stored hashes |
| `/cv tag` | 標識 | Tag files with metadata |
| `/cv packet` | 包装 | Generate context packets for review |

**Dependencies**: None (foundational)
**Used by**: All other skills for file integrity verification

### failure-memory (Core)

**Alias**: `/fm` | **Layer**: Core | **Location**: `agentic/failure-memory/`

Consolidates: failure-tracker, observation-recorder, memory-search, topic-tagger, failure-detector, evidence-tier, effectiveness-metrics, pattern-convergence-detector, positive-framer, contextual-injection

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/fm detect` | 検出 | Detect failure pattern from tool output or user message |
| `/fm record` | 記録 | Record observation, increment R/C/D counter |
| `/fm search` | 索引 | Query observations by pattern, tag, or slug |
| `/fm classify` | 分類 | Classify evidence tier (N=1:weak, N=2:emerging, N≥3:strong) |
| `/fm status` | 状態 | Show eligible observations (R≥3 ∧ C≥2) |
| `/fm refactor` | 整理 | Merge, split, or restructure observations |
| `/fm converge` | 収束 | Detect converging patterns (similarity≥0.8) |

**Dependencies**: context-verifier
**Used by**: constraint-engine, governance

### constraint-engine (Core)

**Alias**: `/ce` | **Layer**: Core | **Location**: `agentic/constraint-engine/`

Consolidates: constraint-generator, constraint-lifecycle, constraint-enforcer, circuit-breaker, emergency-override, severity-tagger, progressive-loader

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/ce check` | 確認 | Check action against active constraints |
| `/ce generate` | 生成 | Generate constraint from eligible observation |
| `/ce status` | 状態 | Show circuit breaker state, active constraints |
| `/ce override` | 迂回 | Emergency bypass with audit trail |
| `/ce lifecycle` | 遷移 | Transition constraint state (draft→active→retiring→retired) |
| `/ce version` | 版本 | Track constraint evolution and versioning |
| `/ce threshold` | 閾値 | Configure severity-tiered circuit breaker thresholds |

**Dependencies**: context-verifier, failure-memory
**Used by**: governance, safety-checks

### review-orchestrator (Review)

**Alias**: `/ro` | **Layer**: Review | **Location**: `agentic/review-orchestrator/`

Consolidates: twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer, slug-taxonomy

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/ro select` | 選択 | Choose review type based on context/risk |
| `/ro twin` | 双方 | Spawn twin reviewers (technical + creative) |
| `/ro cognitive` | 認知 | Spawn cognitive modes (Opus 4/4.1/Sonnet 4.5) |
| `/ro gate` | 門番 | Apply staged quality gates |

**Dependencies**: context-verifier, failure-memory
**Used by**: governance

### governance (Governance)

**Alias**: `/gov` | **Layer**: Governance | **Location**: `agentic/governance/`

Consolidates: governance-state, constraint-reviewer, index-generator, round-trip-tester, version-migration

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/gov state` | 状態 | Central state tracking with event-driven alerts |
| `/gov review` | 審査 | Review constraints approaching 90-day review |
| `/gov index` | 索引 | Generate INDEX.md from live constraint state |
| `/gov verify` | 検証 | Verify source↔index synchronization |
| `/gov migrate` | 移行 | Schema versioning and migration |

**Dependencies**: constraint-engine, failure-memory
**Used by**: safety-checks

### safety-checks (Safety)

**Alias**: `/sc` | **Layer**: Safety | **Location**: `agentic/safety-checks/`

Consolidates: model-pinner, fallback-checker, cache-validator, adoption-monitor, cross-session-safety-check

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/sc model` | 機種 | Pin model versions for session/project/global |
| `/sc fallback` | 後備 | Verify fallback chains for graceful degradation |
| `/sc cache` | 快取 | Detect stale cached responses |
| `/sc session` | 会話 | Cross-session state interference detection |

**Dependencies**: context-verifier, constraint-engine
**Used by**: workflow-tools

### workflow-tools (Extensions)

**Alias**: `/wt` | **Layer**: Extensions | **Location**: `agentic/workflow-tools/`

Consolidates: loop-closer, parallel-decision, threshold-delegator, mce-refactorer, hub-subworkflow, observation-refactoring, constraint-versioning

| Sub-command | CJK | Purpose |
|-------------|-----|---------|
| `/wt loops` | 循環 | Scan for DEFERRED/PLACEHOLDER/TODO before completion |
| `/wt parallel` | 並列 | 5-factor framework for parallel vs serial decisions |
| `/wt mce` | 極限 | Analyze files for MCE compliance (>200 lines → split) |
| `/wt subworkflow` | 副流 | Spawn sub-workflows to external ClawHub skills |

**Dependencies**: context-verifier, safety-checks
**Used by**: Human developers via explicit invocation

<!-- END SECTION: skills -->

---

<!-- SECTION: lifecycle -->
## Data Flow

### Failure → Constraint Lifecycle

```
1. DETECT
   └── /fm detect identifies failure signal
       (test failure, user correction, review finding, runtime error)

2. RECORD
   └── /fm record creates/updates observation
       └── R (recurrence) counter incremented

3. VERIFY
   └── Human confirms (C+1) or disconfirms (D+1)
       └── Multiple sources required for diversity

4. GENERATE
   └── When R≥3 AND C≥2 AND D/(C+D)<0.2 AND sources≥2:
       └── /ce generate creates constraint candidate

5. ACTIVATE
   └── /ce lifecycle transitions: draft → active
       └── 90-day review gates (/gov review)

6. ENFORCE
   └── /ce check verifies actions at runtime
       └── /ce status tracks circuit breaker
           └── Severity-tiered thresholds (CRITICAL: 3, IMPORTANT: 5, MINOR: 10)
```

### Reference Data

#### Eligibility Criteria

| Criterion | Threshold | Purpose |
|-----------|-----------|---------|
| R (recurrence) | ≥3 | Failure has occurred multiple times |
| C (confirmations) | ≥2 | Humans verified it's a real problem |
| D/(C+D) | <0.2 | False positive rate below 20% |
| sources | ≥2 | Different files/sessions affected |

**Formula**: `R >= 3 AND C >= 2 AND D/(C+D) < 0.2 AND sources >= 2`

#### Constraint States

| State | Enforcement | Description |
|-------|-------------|-------------|
| draft | NONE | Candidate pending review |
| active | BLOCK | Currently enforced, violations blocked |
| retiring | WARN | 90-day sunset, violations warned |
| retired | NONE | Historical reference only |

#### Evidence Tiers

| Tier | N-Count | CJK | Action |
|------|---------|-----|--------|
| Weak | N=1 | 弱 | Monitor |
| Emerging | N=2 | 中 | Track closely |
| Strong | N≥3 | 強 | Check eligibility |
| Established | N≥5 | 確 | Priority enforcement |

### Circuit Breaker States

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CIRCUIT BREAKER STATES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    5 violations     ┌──────────┐                      │
│  │  CLOSED  │ ─────────────────►  │   OPEN   │                      │
│  │ (normal) │    in 30 days       │ (tripped)│                      │
│  └────┬─────┘                     └────┬─────┘                      │
│       │                                │                             │
│       │ action allowed                 │ action BLOCKED              │
│       │                                │ + human notified            │
│       │                                │                             │
│       │                           ┌────▼─────┐                       │
│       │    cooldown expires       │HALF-OPEN │                       │
│       │◄───────────────────────── │ (testing)│                       │
│       │    (24h) + no violations  └──────────┘                       │
│                                        │                             │
│                                        │ violation in test period    │
│                                        │ → back to OPEN              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**State Definitions**:

| State | Behavior | Entry Condition | Exit Condition |
|-------|----------|-----------------|----------------|
| CLOSED | Normal operation | Initial state | 5 violations in 30 days |
| OPEN | Actions BLOCKED | 5 violations | 24-hour cooldown |
| HALF-OPEN | Testing period | After cooldown | No violations in 24h → CLOSED |

**Severity-Tiered Defaults**:

| Severity | Violations | Window | Rationale |
|----------|------------|--------|-----------|
| CRITICAL | 3 | 30 days | High-risk constraints trip early |
| IMPORTANT | 5 | 30 days | Standard threshold (validated) |
| MINOR | 10 | 30 days | Low-risk, more tolerance |

### Context Loading

```
1. SESSION START
   └── /fm search loads relevant observations
       └── Filters by file patterns and tags

2. FILE ACCESS
   └── /cv hash generates auditable checksums
       └── /cv verify validates identity

3. CONSTRAINT CHECK
   └── /ce check returns violations
       └── /ce status shows circuit breaker state
```

<!-- END SECTION: lifecycle -->

---

<!-- SECTION: clawhub -->
## ClawHub Integration

These skills integrate with ClawHub skills via shared workspace files.

### Workspace File Structure

```
project/
├── .learnings/                  # self-improving-agent@1.0.5 format
│   ├── LEARNINGS.md             # [LRN-YYYYMMDD-XXX] corrections
│   ├── ERRORS.md                # [ERR-YYYYMMDD-XXX] failures
│   └── FEATURE_REQUESTS.md      # [FEAT-YYYYMMDD-XXX] requests
│
├── output/
│   ├── VERSION.md               # File format version pinning
│   ├── constraints/             # Constraint storage
│   │   ├── active/              # Currently enforced
│   │   ├── draft/               # Pending activation
│   │   └── retired/             # No longer enforced
│   ├── context-packets/         # File hash packets
│   └── hooks/                   # Hook execution logs
│
└── HEARTBEAT.md                 # Periodic self-improvement checks
```

### Integration Points

| ClawHub Skill | What We Provide | Format |
|---------------|-----------------|--------|
| self-improving-agent | `.learnings/LEARNINGS.md`, `.learnings/ERRORS.md` | self-improving-agent@1.0.5 |
| proactive-agent | `output/constraints/`, `HEARTBEAT.md` | proactive-agent@3.1.0 |
| VFM system | `output/constraints/metadata.json` | VFM@1.0 |

### Data Flow

```
/fm record ──► .learnings/LEARNINGS.md ──► self-improving-agent
     │
     ▼
/ce generate ──► output/constraints/ ──► proactive-agent
     │
     └──► HEARTBEAT.md (periodic verification)
```

**File format version pinning**: See `output/VERSION.md` for compatibility requirements.

<!-- END SECTION: clawhub -->

---

<!-- SECTION: config -->
## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTIC_CONSTRAINTS_PATH` | Path to constraints directory | `output/constraints/` |
| `AGENTIC_OBSERVATIONS_PATH` | Path to observations directory | `.learnings/` |
| `CIRCUIT_BREAKER_THRESHOLD` | Violations before trip | `5` |
| `CIRCUIT_BREAKER_WINDOW_DAYS` | Rolling window for violations | `30` |

### File Paths

```
project/
├── .learnings/          # Observations (self-improving-agent format)
├── output/
│   ├── constraints/     # Constraint storage
│   └── context-packets/ # File verification packets
├── HEARTBEAT.md         # Periodic checks
└── .claude/
    └── skills/
        └── liveneon/    # Symlink to skill definitions
```

<!-- END SECTION: config -->

---

<!-- SECTION: threat-model -->
## Threat Model

**What we protect against**:

| Threat | Mitigation |
|--------|------------|
| Accidental file corruption | Hash verification (SHA-256) |
| Context drift between sessions | Context packets with file hashes |
| Repeated AI mistakes | Failure-to-constraint lifecycle |
| Constraint violation storms | Circuit breaker (5 violations → OPEN) |

**What we do NOT protect against**:

| Threat | Why Not | Mitigation |
|--------|---------|------------|
| Adversarial tampering | ✅ Mitigated | Ed25519 packet signing (Phase 4) |
| Malicious packet injection | ✅ Mitigated | Signed packets verify provenance |
| Compromised constraint source | Trust model assumes honest input | Constraint provenance tracking (future) |
| AI intentionally evading constraints | Pattern matching is gameable | Semantic classification (Phase 2+) |

**Trust assumptions**:
- Constraint sources are honest (human-verified)
- File system is not adversarially manipulated
- AI is confused, not malicious (errors are mistakes, not attacks)

<!-- END SECTION: threat-model -->

---

<!-- SECTION: guides -->
## Guides

Technical guides for skill implementation:

| Guide | Purpose |
|-------|---------|
| [Semantic Similarity](docs/guides/SEMANTIC_SIMILARITY_GUIDE.md) | LLM-based action classification |
| [CJK Vocabulary](docs/standards/CJK_VOCABULARY.md) | Skill aliases, sub-commands |

**Two-Stage Matching** (default pattern):
1. **Stage 1**: Embedding similarity (<50ms) - fast filter, high recall
2. **Stage 2**: LLM classification (500ms-2s) - accurate decision for candidates

Use single-stage LLM for CRITICAL severity; two-stage for IMPORTANT/MINOR.

<!-- END SECTION: guides -->

---

<!-- SECTION: extending -->
## Extending the System

### Acceptance Criteria Convention

SKILL.md files contain `## Acceptance Criteria` sections with checkboxes.

**Post-consolidation**: All 7 skills use unchecked boxes (`- [ ]`) since they are specification-first.
Contract tests validate behavior; checkboxes remain unchecked until runtime implementation (deferred).

### Command Syntax Convention

SKILL.md files use angle-bracket placeholders for command arguments:

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<file>` | Code file path | `/wt mce <file>` |
| `<observation>` | Observation ID | `/fm classify <observation>` |
| `<constraint>` | Constraint ID | `/ce lifecycle <constraint>` |
| `<query>` | Search query | `/fm search <query>` |

### Adding Sub-Commands

To add a sub-command to an existing skill:

1. Add entry to sub-command table in SKILL.md
2. Document arguments in Arguments section
3. Add to Next Steps table if auto-invoked
4. Update acceptance criteria
5. Add contract test

<!-- END SECTION: extending -->

---

<!-- SECTION: version-history -->
## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-13 | Initial architecture with layer diagram |
| 0.2.0 | 2026-02-13 | Phase 1 complete: 5 Foundation layer skills |
| 0.3.0 | 2026-02-13 | Phase 2 complete: 9 Core Memory layer skills |
| 0.4.0 | 2026-02-14 | Phase 3 complete: 10 Review & Detection layer skills |
| 0.5.0 | 2026-02-14 | Phase 4 complete: 9 Governance & Safety layer skills |
| 0.6.0 | 2026-02-14 | Phase 5 complete: 5 Bridge layer skills |
| 0.7.0 | 2026-02-15 | Phase 6 complete: 10 Extensions layer skills |
| 0.8.0 | 2026-02-15 | Phase 7 complete: All 48 skills operational |
| **1.0.0** | **2026-02-15** | **Consolidation: 48 skills → 7 consolidated skills** |
| **1.1.0** | **2026-02-15** | **Architecture hub pattern applied** |
| **1.2.0** | **2026-02-15** | **Phase 5B: ClawHub compatibility verified** |

<!-- END SECTION: version-history -->

---

*Architecture: 7 consolidated skills with CJK summary and section markers for JIT loading.*
