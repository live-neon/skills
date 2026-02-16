---
created: 2026-02-15
type: plan
status: draft
priority: high
specification: ../proposals/2026-02-13-agentic-skills-specification.md
architecture: ../../ARCHITECTURE.md
blocks:
  - 2026-02-15-agentic-skills-phase5b-implementation.md
related_issues:
  - ../issues/2026-02-15-skills-doc-migration-twin-review-findings.md
---

# Agentic Skills Consolidation Plan

## Summary

Systematically consolidate 48 granular skills based on the principle:
**"When does the agent need this information?"**

Skills that are always relevant at the same moment belong in the same SKILL.md.

**Current**: 48 skills, ~7,000 chars prompt overhead, zero hooks/scripts
**Target**: 7 consolidated skills + integration docs, ~1,400 chars overhead, Next Steps soft hooks (Claude Code hooks deferred)

**Note**: The target is systematic consolidation, not a fixed number. The current groupings yield 7 skills (bridge layer becomes documentation rather than a skill), but future iterations may adjust based on actual usage patterns.

---

## Day in the Life (After Consolidation)

A typical failure-to-constraint workflow after consolidation:

```
Scenario: You made a mistake that broke tests

1. [Agent detects error pattern in output]
   Agent follows Next Steps: "Error detected → /fm detect"
   → Failure recorded with R=1

2. [You make same mistake twice more over next few sessions]
   Agent follows Next Steps: "Check eligibility: R≥3 ∧ C≥2"
   → R=3, eligibility threshold reached

3. /constraint-engine generate
   → "Always run lint before commit" constraint proposed
   → constraint-engine lifecycle: draft

4. [You approve the constraint]
   → constraint-engine lifecycle: active

5. [Next session, you try to commit without lint]
   Agent follows Next Steps: "Before file changes → /ce check"
   → CHECK FAILS: "Always run lint before commit"
   → You run lint, then commit succeeds

6. [Periodic heartbeat - agent reads HEARTBEAT.md]
   → Reviews constraint health, R/C/D status
   → proactive-agent (ClawHub) reads our constraint metadata
```

**How it works**: The agent follows "Next Steps" instructions embedded in each skill. This is the same pattern used by proactive-agent (pure behavioral protocols, no programmatic hooks). Future releases may add Claude Code hooks for automatic triggering.

---

## Philosophy Alignment

This consolidation aligns with compass principles:

| Principle | Application |
|-----------|-------------|
| **比 Proportionality** | 48 skills was over-engineered; consolidation right-sizes |
| **長 Long-View** | Adding hooks now prevents "paper architecture" debt |
| **誠 Honesty** | Acknowledgment that 48 specs lacked runtime automation |
| **証 Evidence** | Triggered by internal review (N=1, validated by twin review) |
| **省 Reflection** | The consolidation itself is reflection on prior over-engineering |

---

## Why Consolidate

### The Problem

1. **Token overhead**: 48 skills × ~150 chars = ~7,000 chars injected per session
2. **No automation**: Zero `scripts/` directories - relies on agent "remembering"
3. **Paper architecture**: 48 SKILL.md specs, but no runtime hooks
4. **Artificial granularity**: `positive-framer` as its own skill is like a separate npm package for `toLowerCase()`

### The Insight

Internal team review (2026-02-14) identified the core issue:

> "You have the *what* (47 well-designed specs) but not the *how* (hooks, scripts, and automation that make it happen without the agent needing to remember)."

This feedback triggered the consolidation planning - the 48-skill architecture was well-designed but lacked runtime automation.

### What to Preserve

The design decisions are solid - they just don't need 48 separate skills:

- R/C/D counter model (Recurrence, Confirmations, Disconfirmations)
- Eligibility criteria (R≥3, C≥2, D/(C+D)<0.2, sources≥2)
- Severity-tiered circuit breaker (CRITICAL: 3/30d, IMPORTANT: 5/30d)
- Event-driven governance over dashboards
- Golden master pattern
- Bridge layer for ClawHub integration

### Three-Layer Architecture

Based on ClawHub skill patterns (self-improving-agent v1.0.5, proactive-agent v3.1.0):

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: AUTOMATION (Future)              │
│  Claude Code hooks - deferred to future release              │
│  OpenClaw Gateway hooks (agent:bootstrap) - optional         │
├─────────────────────────────────────────────────────────────┤
│                    LAYER 2: WORKSPACE                        │
│  Persistent files (.learnings/, output/, SESSION-STATE.md)  │
│  Shared with ClawHub skills, survives compaction            │
├─────────────────────────────────────────────────────────────┤
│                    LAYER 1: SKILL (SKILL.md) ← INITIAL FOCUS │
│  Instructions + Next Steps (portable soft hooks)            │
│  Works everywhere, regardless of hook support               │
└─────────────────────────────────────────────────────────────┘
```

**Initial release strategy**: Focus on Layer 1 (Next Steps) and Layer 2 (Workspace files). This matches proactive-agent's approach - pure behavioral protocols, no programmatic hooks.

**Key insight**: Skills must work as text instructions. Hook automation is an enhancement, not a requirement.

**Research**: See `docs/research/2026-02-15-openclaw-clawhub-hooks-research.md` for detailed analysis.

### Alternatives Considered

Before consolidation, we evaluated these alternatives:

| Alternative | Description | Why Not Chosen |
|-------------|-------------|----------------|
| **Dynamic skill loading** | Meta-skill loads 3-5 relevant skills per task via semantic routing | Adds routing complexity; current skills lack semantic metadata for effective routing; requires new infrastructure |
| **Tier-based loading** | Foundation always loaded, others context-dependent | Still ~3,000 chars for Foundation+Core; doesn't solve "paper architecture" (no hooks) |
| **Add hooks without consolidation** | Keep 48 skills, add hooks to critical ones | 48 SKILL.md files still too granular; doesn't address artificial separation (e.g., `positive-framer` as standalone) |
| **Prioritize runtime for critical skills only** | Implement runtime for 5-10 most-used skills | Leaves 38+ skills as "paper"; doesn't reduce prompt overhead |

**Why consolidation wins**: It addresses all three problems simultaneously:
1. Token overhead (7,000 → ~1,400 chars)
2. No automation (adding hooks is easier with 7 skills)
3. Paper architecture (fewer skills to implement runtime for)

**Trade-off acknowledged**: Consolidation loses per-skill versioning flexibility. See "Versioning Strategy" below.

---

## Consolidation Map

**Naming convention**: Skill names use suffixes like `-memory`, `-engine`, `-verifier` based on function. See [Naming Rationale](#naming-rationale) below for the full pattern.

### Current → Consolidated

```
48 Skills                           7 Skills + Documentation
─────────────────────────────────────────────────────────────
Foundation (5)  ─┬─► context-verifier (3 skills)
Core Memory (9) ─┼─► failure-memory (10 skills)
                 └─► constraint-engine (9 skills)

Review (6)      ───► review-orchestrator (5 skills)

Detection (4)   ───► (merged into failure-memory)

Governance (5)  ─┬─► governance (6 skills)
Safety (4)      ─┴─► safety-checks (4 skills)

Bridge (5)      ───► (documentation, not skill - see Stage 3)

Extensions (10) ───► workflow-tools (4 skills, 1 removed as redundant)
```

**Total**: 48 skills → 7 consolidated skills + ClawHub integration docs
**Removed**: pbd-strength-classifier (redundant with `/failure-memory classify`)

**Detailed source mapping** (clarifies which old skills map to which consolidated skill):

| Consolidated Skill | Source Layer(s) | Source Skills |
|--------------------|-----------------|---------------|
| `context-verifier` | Foundation (3 of 5) | context-packet, file-verifier, severity-tagger |
| `failure-memory` | Core (4) + Detection (4) + Foundation (2) | failure-tracker, observation-recorder, memory-search, topic-tagger + failure-detector, evidence-tier, effectiveness-metrics, pattern-convergence-detector + positive-framer, contextual-injection |
| `constraint-engine` | Core (5) + Foundation (0) | constraint-generator, circuit-breaker, emergency-override, constraint-lifecycle, constraint-versioning + (none from Foundation) |
| `review-orchestrator` | Review (5) | twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer |
| `governance` | Governance (5) + Safety (1) | constraint-reviewer, index-generator, round-trip-tester, governance-state, slug-taxonomy + adoption-monitor |
| `safety-checks` | Safety (3) | model-pinner, fallback-checker, cache-validator |
| `workflow-tools` | Extensions (4 of 5) | loop-closer, MCE, parallel-decision, subworkflow-spawner |
| *(documentation)* | Bridge (5) | learnings-n-counter, feature-request-tracker, wal-failure-detector, heartbeat-constraint-check, vfm-constraint-scorer |
| *(removed)* | Extensions (1) | pbd-strength-classifier (redundant with `/fm classify`) |

### Naming Rationale

Consolidated skill names follow a pattern based on their primary function:

| Suffix | Meaning | Examples |
|--------|---------|----------|
| `-memory` | **Storage/recall systems** - persist and retrieve data | `failure-memory` stores failures |
| `-engine` | **Processing systems** - transform inputs to outputs | `constraint-engine` processes constraints |
| `-verifier` | **Validation systems** - check correctness | `context-verifier` validates file hashes |
| `-orchestrator` | **Coordination systems** - spawn and manage sub-agents | `review-orchestrator` manages twin reviews |
| `-tools` | **Utility collections** - grouped helper functions | `workflow-tools` bundles loop-closer, MCE, etc. |
| `-checks` | **Verification suites** - multiple related checks | `safety-checks` bundles model, fallback, cache |
| (none) | **Domain concepts** - self-explanatory | `governance` manages state and reviews |

This naming convention helps developers predict where functionality lives without consulting documentation.

---

## Merge Strategy

Consolidation is NOT file concatenation. Each consolidated skill requires:

### Logic Reconciliation

For each consolidated skill:

1. **Identify shared concepts** - e.g., R/C/D counters used by multiple source skills
2. **Resolve conflicts** - e.g., if two skills define "eligibility" differently, choose one or create unified definition
3. **Define sub-command boundaries** - each sub-command owns distinct functionality
4. **Preserve execution order** - if skill A must run before skill B, encode this in sub-command flow

### Unified Eligibility Criteria

Where source skills have different eligibility criteria:

| Source Skill | Original Criteria | Consolidated Location |
|--------------|-------------------|----------------------|
| constraint-generator | R≥3, C≥2, D/(C+D)<0.2, sources≥2 | `/constraint-engine generate` |
| evidence-tier | N=1/2/3+ thresholds | `/failure-memory classify` |
| circuit-breaker | CRITICAL 3/30d, IMPORTANT 5/30d | `/constraint-engine status` |

**Rule**: Each sub-command inherits criteria from its primary source skill. Cross-cutting criteria (like R/C/D) are defined once in the consolidated SKILL.md and referenced by sub-commands.

### Sub-Command Independence

Each sub-command must be:
- **Independently testable** - can run in isolation with mock inputs
- **Independently documentable** - has its own usage, arguments, output in SKILL.md
- **Loosely coupled** - calls other sub-commands via explicit interface, not shared state

### Versioning Strategy

Loss of per-skill versioning is a trade-off. Mitigation:

1. **Skill-level versioning**: Start with skill-level versioning only (e.g., `failure-memory: 1.0.0`)
2. **Feature flags**: Critical sub-commands can have enable/disable flags if needed
3. **Deprecation path**: Sub-commands follow draft→active→retiring→retired lifecycle
4. **Rollback scope**: If sub-command breaks, disable it via flag rather than rolling back entire skill

**Implementation details**:
- **Version storage**: SKILL.md frontmatter `version: 1.0.0` (semantic versioning)
- **Feature flag storage**: SKILL.md frontmatter `flags: { detect: true, converge: false }`
- **First rollback procedure**: Before versioning infrastructure exists, rollback = restore from `_archive/`:
  ```bash
  # Emergency rollback (if consolidated skill breaks before v1.1.0)
  git mv agentic/failure-memory agentic/_broken/failure-memory-v1.0.0
  git mv agentic/_archive/2026-02-consolidation/core/failure-tracker agentic/core/
  # Then fix and re-consolidate
  ```

**Note**: Add sub-command versioning only after a rollback event (N≥1) demonstrates the need. This avoids premature complexity.

---

## Notation Reference (記法)

**CJK Vocabulary**: `docs/standards/CJK_VOCABULARY.md` (skill aliases, sub-commands, math notation)

---

## Quick Navigation (速引)

| Intent | Command | Logic | Trigger |
|--------|---------|-------|---------|
| fail detected | `/fm detect` | fail∈{test,user,API}→record | Next Steps |
| record failure | `/fm record` | pattern→obs, R++∨C++∨D++ | Next Steps |
| find failures | `/fm search` | query(pattern∨tag)→obs[] | Explicit |
| classify tier | `/fm classify` | obs→N∈{1:弱,2:中,≥3:強} | Explicit |
| merge obs | `/fm refactor` | obs[]→restructure | Explicit |
| find patterns | `/fm converge` | similarity≥0.8→pattern | Explicit |
| pre-action check | `/ce check` | constraints→pass✓∨block✗ | Next Steps |
| create constraint | `/ce generate` | R≥3∧C≥2→constraint | Next Steps |
| bypass constraint | `/ce override` | temp_bypass + audit | Explicit |
| constraint state | `/ce lifecycle` | draft→active→retiring→retired | Explicit |
| file unchanged? | `/cv verify` | file×hash→match✓∨mismatch✗ | Explicit |
| get checksum | `/cv hash` | file→SHA256 | Explicit |
| twin review | `/ro twin` | spawn(tech,creative)→findings | Explicit |
| cognitive review | `/ro cognitive` | spawn(opus4,41,sonnet45) | Explicit |
| gov state | `/gov state` | central_state + alerts | HEARTBEAT |
| due constraints | `/gov review` | constraints.due→queue | HEARTBEAT |
| model pinned? | `/sc model` | version→pinned✓∨drift✗ | HEARTBEAT |
| session clean? | `/sc session` | state→clean✓∨interference✗ | HEARTBEAT |
| open loops? | `/wt loops` | scan(TODO∨DEFERRED)→[] | Explicit |
| parallel decision | `/wt parallel` | 5因子→serial∨parallel | Explicit |
| spawn subworkflow | `/wt subworkflow` | task→clawhub.skill | Explicit |

---

## Stage 1: Core Skills (MVP)

**Duration**: 2-3 days
**Goal**: 3 consolidated skills that handle 80% of use cases

**Staging location**: Create all new consolidated skills in `agentic/_staging/` (e.g., `agentic/_staging/failure-memory/SKILL.md`). Stage 6 will archive old skills, then move consolidated skills to final location. This avoids naming conflicts.

**Note**: Initial release targets ClawHub/OpenClaw only. OpenClaw uses Gateway lifecycle hooks (`agent:bootstrap`), not Claude Code tool-loop hooks (`PostToolUse`). Our skills use **"Next Steps" soft hooks** - text instructions that work in any agent. Future releases may add Claude Code hook support for Claude Code/Codex users.

### 1.1 failure-memory (記憶)

**Merges**: 10 skills → 1 | **Trigger**: 失敗発生 (failure occurred)

**Sub-commands**:
```
/fm detect   # 検出 | fail∈{test,user,API}→record | auto via ⚡
/fm record   # 記録 | pattern→obs | R++∨C++∨D++
/fm search   # 索引 | query(pattern∨tag∨slug)→obs[]
/fm classify # 分類 | obs→tier∈{N=1:弱,N=2:中,N≥3:強}
/fm status   # 状態 | eligible:R≥3∧C≥2 | recent:30d
/fm refactor # 整理 | obs[]→merge∨split∨restructure
/fm converge # 収束 | pattern[]→detect(similarity≥0.8)
```

**Detection Triggers** (自動検出 - agent scans for these patterns):

| Pattern | Source | Action |
|---------|--------|--------|
| `test.exit_code != 0` | PostToolUse | `/fm detect test` |
| "Actually...", "No, that's wrong" | User message | `/fm record correction` |
| "I meant...", "Not X, Y" | User message | `/fm record correction` |
| API 4xx/5xx response | PostToolUse | `/fm detect api` |
| "error:", "failed", "Exception" | Tool output | `/fm detect error` |

**Core logic**:
- R/C/D: Recurrence++ | Confirmation++ | Disconfirmation++
- Tier: N=1→弱(weak) | N=2→中(emerging) | N≥3→強(strong)
- Slug: git-*|test-*|workflow-*|security-*|docs-*|quality-*
- Metrics: prevention_rate, false_positive_rate

**Next Steps** (実行後 - soft hooks):

| Condition | Action |
|-----------|--------|
| R incremented | Check eligibility: R≥3 ∧ C≥2 → notify user |
| R≥3 ∧ C≥2 | Suggest `/ce generate` for constraint |
| Pattern recurring | Link with `See Also`, bump priority |
| Always | Update `.learnings/ERRORS.md` or `.learnings/LEARNINGS.md` |

### 1.2 constraint-engine (制約)

**Merges**: 9 skills → 1 | **Trigger**: 行動前∨閾値到達 (pre-action ∨ threshold)

**Sub-commands**:
```
/ce check     # 検査 | action→constraints[]→pass∨block
/ce generate  # 生成 | eligible(obs)→constraint | R≥3∧C≥2∧D/(C+D)<0.2∧src≥2
/ce status    # 状態 | active[]|circuit∈{CLOSED,OPEN,HALF}
/ce override  # 上書 | constraint→bypass(temp) | audit.log++
/ce lifecycle # 周期 | state∈{draft→active→retiring→retired}
/ce version   # 版本 | constraint→v++ | history.preserve
/ce threshold # 閾値 | user∨context→custom_threshold
```

**Core logic**:
- Eligible: R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2
- Frame: "Don't X"→"Always Y" (positive reframe)
- Circuit: CRITICAL→3/30d | IMPORTANT→5/30d | MINOR→10/30d
- States: draft→active→retiring→retired

**Next Steps** (実行後 - soft hooks):

| Condition | Action |
|-----------|--------|
| Constraint generated | Add to `output/constraints/draft/`, notify user |
| Constraint activated | Move to `output/constraints/active/` |
| Action blocked | Log to `output/hooks/blocked.log`, explain why |
| Circuit OPEN | Surface to user with recovery guidance |
| Override used | Audit log entry, temporary bypass only |

### 1.3 context-verifier (検証)

**Merges**: 3 skills → 1 | **Trigger**: 明示呼出 (explicit invocation)

**Sub-commands**:
```
/cv hash   # 哈希 | file→SHA256(content)
/cv verify # 検証 | file×hash→match✓∨mismatch✗
/cv tag    # 標記 | file→severity∈{critical,important,minor}
/cv packet # 包装 | files[]→{path,hash,severity,timestamp}[]
```

**Core logic**:
- Hash: SHA-256 checksums
- Packet: {files[], hashes[], severities[], metadata}
- Severity: critical→block | important→warn | minor→info

**Next Steps** (実行後 - soft hooks):

| Condition | Action |
|-----------|--------|
| Hash mismatch | Alert user, suggest re-read of file |
| Critical file changed | Block operation, require verification |
| Packet created | Store in `output/context-packets/` for audit |

---

## Stage 2: Review and Governance

**Duration**: 0.5-1 day
**Goal**: 3 supporting skills for periodic operations

### 2.1 review-orchestrator (審査)

**Merges**: 5 skills → 1 | **Trigger**: レビュー要求 (review requested)

**Sub-commands**:
```
/ro select   # 選択 | context×risk→type∈{twin,cognitive,code}
/ro twin     # 双子 | spawn(technical,creative)→findings[]
/ro cognitive # 認知 | spawn(opus4,opus41,sonnet45)→analysis[]
/ro gate     # 門番 | staged_work→pass✓∨block✗
```

### 2.2 governance (治理)

**Merges**: 6 skills → 1 | **Trigger**: 定期保守 (periodic maintenance)

**Sub-commands**:
```
/gov state   # 状態 | central_state | event→alert
/gov review  # 審査 | constraints.due→review_queue
/gov index   # 索引 | skills[]→INDEX.md
/gov verify  # 検証 | round_trip(source↔compiled)→sync✓∨drift✗
/gov migrate # 移行 | schema.v(n)→schema.v(n+1)
```

### 2.3 safety-checks (安全)

**Merges**: 4 skills → 1 | **Trigger**: 事前検証 (pre-flight)

**Sub-commands**:
```
/sc model    # 機種 | model.version→pinned✓∨drift✗
/sc fallback # 代替 | chain.exists→safe✓∨missing✗
/sc cache    # 快取 | response.age>TTL→stale✗
/sc session  # 会話 | cross_session.state→clean✓∨interference✗
```

---

## Stage 3: ClawHub Integration

**Duration**: 0.5 day
**Goal**: Document how our skills complement ClawHub skills

### 3.1 ClawHub Compatibility (Documentation, Not Skill)

**What is ClawHub?**: ClawHub is a skill registry (3,000+ skills). It's not a coordination platform or remote service - skills from ClawHub are installed locally alongside yours.

**Key insight**: The original "clawhub-bridge" framing was confused. We don't "export to" ClawHub agents - we share workspace files with locally-installed ClawHub skills.

**Merges**: learnings-n-counter, feature-request-tracker, wal-failure-detector, heartbeat-constraint-check, vfm-constraint-scorer (5 skills → documentation)

**ClawHub skills that complement ours**:
- `self-improving-agent`: Reads our `.learnings/` files to improve future behavior
- `proactive-agent`: Reads our `output/constraints/` to detect gaps and suggest improvements
- `VFM system`: Reads constraint metadata to score value-for-money

**What we provide** (via workspace files, not API):

Aligned with ClawHub skill expectations (self-improving-agent, proactive-agent):

```
.learnings/                      # self-improving-agent format (top level, shared)
├── LEARNINGS.md                 # [LRN-YYYYMMDD-XXX] corrections, gaps, best practices
├── ERRORS.md                    # [ERR-YYYYMMDD-XXX] command failures, exceptions
└── FEATURE_REQUESTS.md          # [FEAT-YYYYMMDD-XXX] user-requested capabilities

output/                          # Our additional workspace files
├── SESSION-STATE.md             # proactive-agent WAL target (active working memory)
├── constraints/
│   ├── draft/                   # Pending constraints
│   ├── active/                  # Enforced constraints
│   ├── retired/                 # Historical constraints
│   └── metadata.json            # VFM scoring data for proactive-agent
├── context-packets/             # File hash packets for audit
└── hooks/
    ├── errors.log               # Hook execution errors
    └── blocked.log              # Actions blocked by constraints
```

**File format compatibility**:
- `.learnings/` uses self-improving-agent's `[TYPE-YYYYMMDD-XXX]` ID scheme
- `SESSION-STATE.md` follows proactive-agent's WAL Protocol format
- `constraints/metadata.json` includes VFM scoring fields for proactive-agent consumption

**Version pinning**: File formats are based on:
- `self-improving-agent@1.0.5` (`.learnings/` structure)
- `proactive-agent@3.1.0` (WAL Protocol, VFM scoring)

If these skills release breaking changes, our file formats may need migration. Document format version in `output/VERSION.md`:
```markdown
# Workspace File Format Versions
- .learnings/: self-improving-agent@1.0.5 compatible
- SESSION-STATE.md: proactive-agent@3.1.0 WAL Protocol
- constraints/metadata.json: proactive-agent@3.1.0 VFM schema
```

**Stage 3 Deliverables Checklist**:
- [x] Create `output/VERSION.md` with file format versions
- [x] Add "ClawHub Integration" section to `README.md`:
  - Which ClawHub skills complement ours (self-improving-agent, proactive-agent)
  - What workspace files we expose (`.learnings/`, `output/constraints/`, `SESSION-STATE.md`)
  - What workspace files we read from them (if any)
- [x] Add "ClawHub Integration" section to `ARCHITECTURE.md`:
  - Workspace file structure diagram
  - File format specifications with version pinning
- [ ] Verify file format compatibility by testing with locally-installed ClawHub skills (deferred - requires local install)

**Note**: This replaces the original "clawhub-bridge skill" concept. The 5 source skills become documentation about file formats and integration points, not a consolidated skill. Adjust skill count: **8 → 7 consolidated skills**.

---

## Stage 4: Workflow Tools

**Duration**: 0.5 day
**Goal**: 1 consolidated extensions skill

### 4.1 workflow-tools (工具)

**Merges**: 4 skills → 1 | **Trigger**: 明示呼出 (explicit invocation)

**Sub-commands**:
```
/wt loops      # 循環 | scan(DEFERRED∨PLACEHOLDER∨TODO)→openloop[]
/wt parallel   # 並列 | 5因子(team,coupling,interface,pattern,integration)→serial∨parallel
/wt mce        # 極限 | file.lines>200→split_suggestions[]
/wt subworkflow # 副流 | task→spawn(clawhub.skill)
```

**Removed**: `pbd-strength-classifier` (redundant: ⊂ `/fm classify`)

**Note**: `cross-session-safety-check` → `/sc session`

---

## Stage 5: HEARTBEAT.md and Future Hook Planning

**Duration**: 0.5 day
**Goal**: Create HEARTBEAT.md for periodic checks; document future Claude Code hook support

**Note**: Initial ClawHub/OpenClaw release uses "Next Steps" soft hooks only. OpenClaw Gateway hooks (`agent:bootstrap`) could inject reminders but don't provide per-tool automation. Claude Code hooks (`PostToolUse`, `PreToolUse`) are deferred to future release.

### 5.1 HEARTBEAT.md Creation

**Note**: HEARTBEAT.md does not currently exist. Create it at project root during this stage.

Create workspace HEARTBEAT.md (based on proactive-agent pattern):
```markdown
# HEARTBEAT.md - Periodic Self-Improvement

Checks grouped by priority. Complete P1 every session, P2 weekly, P3 monthly.

## P1: Critical (Every Session)

### Soft Hook Verification
Verify "Next Steps" are being followed - soft hooks can fail silently:
- [ ] Check `.learnings/ERRORS.md` has entries from recent sessions (if errors occurred)
- [ ] Check `output/hooks/blocked.log` shows constraint checks happening
- [ ] If any missing: Review "Next Steps" sections, clarify trigger patterns

### Constraint Enforcement
- [ ] Any circuit breakers tripped? → `/ce status`
- [ ] Any actions blocked? → Review `output/hooks/blocked.log`

## P2: Important (Weekly)

### Failure Memory
- [ ] Any unprocessed failures? → `/fm search status:pending`
- [ ] Any patterns with R≥3 ∧ C≥2? → Eligible for constraint → `/ce generate`
- [ ] Check `output/constraints/` updated when thresholds reached

### Memory Maintenance
- [ ] Distill learnings from daily notes to MEMORY.md
- [ ] Clear resolved items from .learnings/

## P3: Periodic (Monthly)

### Constraint Health
- [ ] Any constraints approaching 90-day review? → `/gov review`
- [ ] Any N≥3 patterns needing constraint generation? → `/fm status`

### Security
- [ ] Scan for injection attempts in recent inputs
- [ ] Verify behavioral integrity (following SOUL.md)
```

**Soft hook reliability note**: "Next Steps" are text instructions that agents may not follow consistently. The HEARTBEAT verification section above detects silent failures by checking workspace file timestamps and contents. If soft hooks are not being followed, consider:
1. Clarifying trigger patterns in the skill's "Next Steps" table
2. Adding explicit reminders in HEARTBEAT.md
3. (Future) Implementing Claude Code hooks for automatic triggering

### 5.2 Future: Claude Code Hook Support (Deferred)

**Not in initial release**. Document for future implementation:

When adding Claude Code/Codex support, skills can include hooks via:

1. **SKILL.md frontmatter** (like `planning-with-files`):
```yaml
hooks:
  PostToolUse:
    - matcher: "Bash"
      command: "scripts/post-tool-use.sh"
  PreToolUse:
    - matcher: "Write|Edit"
      command: "scripts/pre-action.sh"
```

2. **Separate scripts/** directory with hook implementations

**Hook behaviors to implement**:
- `post-tool-use.sh`: Detect failures on tool exit, prompt `/fm detect`
- `pre-action.sh`: Check constraints before file write, block if circuit OPEN

**Reference skills**: self-improving-agent, planning-with-files

---

## Stage 6: Archive and Test Migration

**Duration**: 1-1.5 days
**Goal**: Archive old skills, migrate tests with coverage preservation

### 6.1 Archive Strategy

**Goal**: Preserve for reference and rollback, not active use.

**Before archiving**:
1. Generate reference update checklist:
   ```bash
   # Find all imports/references to skills being archived
   grep -r "agentic/core/" . --include="*.md" --include="*.ts" > refs-to-update.txt
   grep -r "agentic/review/" . --include="*.md" --include="*.ts" >> refs-to-update.txt
   # ... etc for each directory
   ```
2. Update each reference to point to consolidated skill OR archived location
3. Verify no broken references remain

**Archive execution**:

**Workflow order** (avoids naming conflicts):
1. Stages 1-4 create new consolidated skills in staging location: `agentic/_staging/`
2. Stage 6 archives OLD layer directories to `agentic/_archive/`
3. After archive: Move consolidated skills from staging to final `agentic/` location

This order prevents conflicts (e.g., old `agentic/governance/` layer vs new `governance` skill).

```bash
# Create archive with clear dating
mkdir -p agentic/_archive/2026-02-consolidation

# Move OLD layer directories with git history preservation
git mv agentic/core agentic/_archive/2026-02-consolidation/core
git mv agentic/review agentic/_archive/2026-02-consolidation/review
git mv agentic/detection agentic/_archive/2026-02-consolidation/detection
git mv agentic/safety agentic/_archive/2026-02-consolidation/safety
git mv agentic/extensions agentic/_archive/2026-02-consolidation/extensions
git mv agentic/bridge agentic/_archive/2026-02-consolidation/bridge
# Note: old agentic/governance/ layer archived (contains granular skills)

# Move consolidated skills from staging to final location
git mv agentic/_staging/* agentic/
rm -rf agentic/_staging  # rmdir fails if hidden files exist

# Final structure:
# agentic/
# ├── failure-memory/SKILL.md
# ├── constraint-engine/SKILL.md
# ├── context-verifier/SKILL.md
# ├── review-orchestrator/SKILL.md
# ├── governance/SKILL.md        ← NEW consolidated skill
# ├── safety-checks/SKILL.md
# ├── workflow-tools/SKILL.md
# └── _archive/2026-02-consolidation/
#     ├── core/                   ← OLD layer
#     ├── governance/             ← OLD layer (granular skills)
#     └── ...
```

**Archive README**:
Create `agentic/_archive/2026-02-consolidation/README.md`:
```markdown
# Archived Skills (2026-02-15)

These 48 granular skills were consolidated into 7 skills + integration docs.
See ../ARCHITECTURE.md for current skill structure.

**Purpose**: Reference and rollback only. Do not load these skills.
**Rollback**: If consolidation fails, restore from this archive.
```

### 6.1.1 Post-Archive Verification

**Critical**: After archive, verify no stale references remain:

```bash
# Verify no references to archived paths (excluding archive itself)
# Generate patterns dynamically from archived directories
ARCHIVED_DIRS="core review detection safety extensions bridge"
> stale-refs.txt  # Clear file

for dir in $ARCHIVED_DIRS; do
  grep -r "agentic/$dir/" . --include="*.md" --include="*.ts" 2>/dev/null | \
    grep -v "_archive" >> stale-refs.txt
done

# Also check for old governance layer (not new governance skill)
# Old: agentic/governance/constraint-reviewer/, agentic/governance/index-generator/, etc.
grep -r "agentic/governance/[a-z]" . --include="*.md" --include="*.ts" 2>/dev/null | \
  grep -v "_archive" | grep -v "agentic/governance/SKILL.md" >> stale-refs.txt

# Expected: stale-refs.txt should be empty (0 results)
wc -l stale-refs.txt
# If non-zero: fix references before proceeding
```

**Do not proceed to Stage 6.2 until stale-refs.txt is empty.**

### 6.2 Test Migration Strategy

**Goal**: Maintain coverage while reducing test count (534 → ~100).

**Test count baseline source**: 534 is an estimate based on:
- 48 skills × ~10 tests per skill average = ~480 tests
- +54 integration/e2e tests (estimated)
- **Actual count**: Run `find tests -name "*.test.ts" -exec grep -c "it(" {} + | awk -F: '{sum+=$2} END {print sum}'` to get exact baseline before starting migration. Update this plan with actual number.

**Step 1: Coverage baseline**

| Aspect | Specification |
|--------|---------------|
| **Tool** | `c8` (Node.js native coverage, V8-based) |
| **Metric** | Branch coverage (primary), line coverage (secondary) |
| **Baseline command** | `npx c8 --reporter=json npm test > coverage-before.json` |
| **Acceptance threshold** | Branch coverage delta ≤ 5% |

**Why c8**: Native V8 coverage (no instrumentation), faster than nyc, works with ESM modules.

```bash
# Before any test changes, capture coverage
npx c8 --reporter=json npm test
# c8 outputs to coverage/coverage-final.json by default
cp coverage/coverage-final.json coverage-before.json

# Extract metrics for comparison
cat coverage-before.json | jq '.total.branches.pct, .total.lines.pct'
```

**Step 2: Test categorization**

| Category | Action | Example |
|----------|--------|---------|
| **Core logic tests** | Keep, adapt to consolidated skill | R/C/D counter tests |
| **Sub-command boundary tests** | Keep, one per sub-command | `/failure-memory detect` input/output |
| **Integration tests** | Keep, update paths | Failure→constraint lifecycle |
| **Redundant tests** | Remove | Tests for same logic in multiple skills |
| **Granular edge cases** | Consolidate | 5 tests for same edge case → 1 test |

**Step 3: Test migration map**

Create `tests/MIGRATION.md` documenting:
```markdown
| Old Test File | Old Test Count | New Location | New Test Count | Coverage Delta |
|---------------|----------------|--------------|----------------|----------------|
| failure-tracker.test.ts | 45 | failure-memory.test.ts | 12 | 0% (same coverage) |
| failure-detector.test.ts | 38 | failure-memory.test.ts | 8 | 0% |
| ... | ... | ... | ... | ... |
```

**Step 4: Coverage verification**
```bash
# After migration, verify coverage maintained
npx c8 --reporter=json npm test
cp coverage/coverage-final.json coverage-after.json

# Compare metrics
echo "Before:" && cat coverage-before.json | jq '.total.branches.pct, .total.lines.pct'
echo "After:" && cat coverage-after.json | jq '.total.branches.pct, .total.lines.pct'
# Delta should be <5% (acceptable loss from removed redundancy)
```

### 6.3 New Test Structure

```
tests/
├── MIGRATION.md              # Test migration map (created in 6.2)
├── failure-memory.test.ts    # 20-25 tests (from 8 source skills)
├── constraint-engine.test.ts # 15-20 tests (from 7 source skills)
├── context-verifier.test.ts  # 8-10 tests (from 3 source skills)
├── review-orchestrator.test.ts # 10-12 tests
├── governance.test.ts        # 12-15 tests
├── safety-checks.test.ts     # 8-10 tests
├── workflow-tools.test.ts    # 6-8 tests
├── clawhub-integration.test.ts # 5-8 tests (file format validation, not skill tests)
├── heartbeat.test.ts         # 3-5 tests (HEARTBEAT.md checklist validation)
└── e2e/
    └── failure-to-constraint.e2e.ts  # Full lifecycle test
```

**Target**: ~100 tests total, same or better coverage

---

## Stage 7: Project Documentation Update

**Duration**: 0.5 day
**Goal**: Systematic documentation update following `docs/workflows/documentation-update.md`
**Workflow**: [Documentation Update Workflow](../workflows/documentation-update.md)

### 7.1 Follow Documentation Hierarchy

Per the workflow, updates flow from authoritative sources down:

1. **SKILL.md files** (7 new consolidated skills)
   - Frontmatter, usage, arguments, integration sections
   - Dependency documentation (Depends on / Used by)
   - Failure modes for each consolidated skill

2. **ARCHITECTURE.md**
   - Replace 6-layer diagram with consolidated 4-tier model (from Stage 6.1)
   - Update skill inventory tables (7 skills, not 48)
   - Document hook integration points
   - Add ClawHub integration section (workspace file formats)
   - Update Guides section if needed

3. **README.md** (root)
   - Update skill tables (7 consolidated skills)
   - Add ClawHub compatibility section
   - Update "The Problem / The Solution" if consolidation changes messaging

4. **agentic/README.md**
   - Update lifecycle diagram for consolidated skills
   - Update ClawHub Integration section

5. **tests/README.md**
   - Update test commands for consolidated test suite
   - Update coverage section

### 7.2 Verify Bidirectional Dependencies

For each consolidated skill, ensure:
- "Depends on" lists all upstream skills
- Upstream skills' "Used by" lists this skill
- No layer violations (dependencies flow upward only)

### 7.3 Run Verification Checks

```bash
# Skill count consistency
echo "README skill count:"
grep -c "agentic/" README.md
echo "ARCHITECTURE skill count:"
grep -c "Implemented" ARCHITECTURE.md
echo "Actual skills:"
find agentic -name "SKILL.md" | wc -l
# Expected: All show 7

# No stale external references
grep -r "neon-soul/skills/neon-soul" . 2>/dev/null
# Expected: No results

# Dependency bidirectionality spot check
for f in $(find agentic -name "SKILL.md" -not -path "*/_archive/*"); do
  skill=$(basename $(dirname $f))
  echo "=== $skill ==="
  grep -A1 "Depends on" "$f" 2>/dev/null | head -2
  grep -A1 "Used by" "$f" 2>/dev/null | head -2
done

# All tests pass
cd tests && npm test
```

### 7.4 Close the Loop

- [x] ARCHITECTURE.md layer tables current (7 skills)
- [x] README.md skill tables current (7 skills)
- [x] ClawHub integration documented
- [x] Dependency links bidirectional
- [x] Tests passing (534 tests)
- [x] Phase results file created: `docs/implementation/agentic-consolidation-results.md`

---

## Timeline

| Stage | Duration | Description |
|-------|----------|-------------|
| Stage 1 | 2-3 days | Core skills: failure-memory, constraint-engine, context-verifier (Next Steps only) |
| Stage 2 | 1-1.5 days | Support skills: review-orchestrator, governance, safety-checks |
| Stage 3 | 0.5 day | ClawHub integration documentation (not a skill) |
| Stage 4 | 0.5 day | Extensions: workflow-tools |
| Stage 5 | 0.5 day | HEARTBEAT.md creation + future hook planning (simplified) |
| Stage 6 | 1-1.5 days | Archive migration + test migration with coverage verification |
| Stage 7 | 0.5-1 day | Project documentation update (per workflow) |

### Stage Dependencies

```
Stage 1: Core skills (Next Steps provide immediate value)
    │
    └─► Stages 2-4: Can run sequentially
        │
        └─► Stage 5: HEARTBEAT.md (simple, no blocking gate)
            │
            └─► Stage 6: Archive + test migration
                │
                └─► Stage 7: Documentation update
```

**Total**: 6-8.5 days (realistic estimate)

**Buffer**: Add 1-2 days for unexpected issues (coverage gaps, path breakage).

**Adjusted total with buffer**: 8-12 days

**Note**: Timeline reduced from 10-14 days because Claude Code hook implementation is deferred.

---

## Success Criteria

- [x] 7 consolidated SKILL.md files (down from 48) + ClawHub integration docs
- [x] Prompt overhead reduced to ~1,400 chars (from ~7,000)
- [x] Each skill has "Next Steps" soft hooks (portable, works in any agent)
- [x] Core lifecycle works: failure → record → eligible → constraint → enforce (via Next Steps)
- [x] HEARTBEAT.md created with periodic check patterns
- [x] ClawHub integration documented (workspace file formats for self-improving-agent, proactive-agent)
- [x] Test coverage maintained (<5% branch coverage delta from baseline) - baseline: 534 tests
- [x] `tests/MIGRATION.md` documents 534→~100 test mapping
- [x] No broken import references (verified via grep)
- [x] Documentation updated per workflow (ARCHITECTURE, READMEs, dependency links)
- [x] Results file created: `docs/implementation/agentic-consolidation-results.md`
- [x] Future Claude Code hook support documented (deferred in plan)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lost functionality in merge | Medium | High | Merge strategy (above), sub-command independence testing |
| Import path breakage | High | Medium | Reference update checklist (Stage 6.1), verify before archive |
| Test coverage loss | Medium | High | Coverage baseline before, coverage map, <5% delta target |
| Sub-command versioning gaps | Medium | Medium | Feature flags, sub-command versioning in frontmatter |
| Next Steps not followed by agent | Medium | Medium | Clear trigger patterns, test with multiple agents |
| ClawHub file format mismatch | Low | Medium | Document workspace file formats in Stage 3, validate with ClawHub skills |
| Phase 5B coordination failure | Low | Medium | Explicit handoff checklist in Phase 5B plan |

**Removed risks** (no longer applicable):
- Hook integration issues (deferred to future release)
- Hook timing/ordering issues (deferred to future release)

---

## Rollback Procedure

If consolidation causes production issues, restore granular skills from archive:

**Full rollback** (all consolidated skills broken):
```bash
# 1. Move broken consolidated skills aside
mkdir -p agentic/_broken/$(date +%Y%m%d)
git mv agentic/failure-memory agentic/_broken/$(date +%Y%m%d)/
git mv agentic/constraint-engine agentic/_broken/$(date +%Y%m%d)/
# ... repeat for each broken skill

# 2. Restore from archive
git mv agentic/_archive/2026-02-consolidation/* agentic/
rm -rf agentic/_archive/2026-02-consolidation  # rmdir fails if hidden files exist

# 3. Update references back to granular paths
# (reverse of Stage 6.1 reference updates)

# 4. Commit with explanation
git commit -m "rollback: restore granular skills, consolidation caused [issue]"
```

**Partial rollback** (single skill broken):
```bash
# Move broken skill aside
git mv agentic/failure-memory agentic/_broken/failure-memory-v1.0.0

# Restore relevant source skills only
git mv agentic/_archive/2026-02-consolidation/core/failure-tracker agentic/core/
git mv agentic/_archive/2026-02-consolidation/core/failure-detector agentic/core/
git mv agentic/_archive/2026-02-consolidation/detection/* agentic/detection/

# Fix, then re-consolidate
```

**Decision criteria**: Rollback if >2 critical bugs within 48 hours of deployment.

---

## What Changes for Phase 5B

After consolidation, Phase 5B (ClawHub integration) becomes simpler:

**Before**: 5 bridge skills to integrate
**After**: Documentation explaining workspace file formats

The adapter code concept was flawed - ClawHub skills are installed locally and read shared workspace files (.learnings/, output/constraints/, etc.), not called via API. Phase 5B becomes:
1. Finalize workspace file formats
2. Document how self-improving-agent and proactive-agent consume our files
3. Test with locally-installed ClawHub skills

---

## Out of Scope

- Publishing skills to ClawHub registry (separate plan)
- New skill development
- Multi-agent coordination (RG-2 research)
- Self-improving-agent reimplementation (use existing)

---

## Cross-References

- **Current architecture**: `../../ARCHITECTURE.md`
- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Phase 5B plan** (blocked by this): `2026-02-15-agentic-skills-phase5b-implementation.md`
- **Phase 5 results**: `../implementation/agentic-phase5-results.md`
- **Twin review findings**: `../issues/2026-02-15-skills-doc-migration-twin-review-findings.md`
- **Documentation update workflow**: `../workflows/documentation-update.md`
- **ClawHub research**: `../research/2026-02-15-openclaw-clawhub-hooks-research.md`
- **CJK vocabulary**: `../standards/CJK_VOCABULARY.md`
- **Code reviews - Plan** (N=4, 2 rounds):
  - Round 1: `../reviews/2026-02-15-agentic-skills-consolidation-plan-codex.md`
  - Round 1: `../reviews/2026-02-15-agentic-skills-consolidation-plan-gemini.md`
  - Round 2: See changelog (findings integrated, no separate files)
- **Code reviews - Implementation** (N=2):
  - `../reviews/2026-02-15-consolidation-implementation-codex.md`
  - `../reviews/2026-02-15-consolidation-implementation-gemini.md`
  - Issue: `../issues/2026-02-15-consolidation-implementation-code-review-findings.md`
- **Twin reviews** (N=4, 2 rounds):
  - Round 1: `../reviews/2026-02-15-agentic-skills-consolidation-plan-twin-technical.md`
  - Round 1: `../reviews/2026-02-15-agentic-skills-consolidation-plan-twin-creative.md`
  - Round 2: `../reviews/2026-02-15-agentic-skills-consolidation-plan-twin-technical-r2.md`
  - Round 2: `../reviews/2026-02-15-agentic-skills-consolidation-plan-twin-creative-r2.md`
- **Feedback source**: Internal review (over-engineering concerns)

---

## Changelog

*Plan created 2026-02-15.*

| Date | Review Round | Key Changes |
|------|--------------|-------------|
| 2026-02-15 | Code Review R1 (N=2) | Merge strategy, test migration, timeline 8-12d, risk assessment |
| 2026-02-15 | Twin Review R1 (N=2) | Day-in-the-life, philosophy alignment, quick navigation, HEARTBEAT.md |
| 2026-02-15 | Internal Feedback | ClawHub reframe (bridge→docs, 8→7 skills), CJK notation |
| 2026-02-15 | ClawHub Research | Three-Layer Architecture, Next Steps soft hooks, workspace alignment |
| 2026-02-15 | Hook Clarification | Three hook systems, OpenClaw-only initial release, Stage 5 simplified |
| 2026-02-15 | Consistency Fixes | Skill count 7, `.learnings/` top-level, staging workflow |
| 2026-02-15 | Code Review R2 (N=2) | Test structure fixes, versioning details, soft hook verification, rollback procedure |
| 2026-02-15 | Twin Review R2 (N=2) | Eligibility criteria, source mapping table, Stage 3 checklist, HEARTBEAT priority groups |
| 2026-02-15 | Implementation | Stages 1-5, 7 complete. 7 SKILL.md files, workspace structure, HEARTBEAT.md, docs updated |
| 2026-02-15 | Code Review Impl (N=2) | Codex + Gemini review of implementation. 2 critical, 6 important findings |
| 2026-02-15 | Code Review Fixes | All findings addressed. MD5/SHA-1 removed, counts reconciled, deps fixed |
| 2026-02-15 | Stage 6 Complete | Old skills archived, consolidated skills promoted, tests updated |

**Total reviews**: N=10 (4 plan reviews + 4 twin reviews + 2 implementation reviews)
**Implementation**: All stages complete. Consolidation shipped.
