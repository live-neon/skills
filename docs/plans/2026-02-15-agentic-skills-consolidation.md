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

Consolidate 48 granular skills into 8 cohesive skills based on the principle:
**"When does the agent need this information?"**

Skills that are always relevant at the same moment belong in the same SKILL.md.

**Current**: 48 skills, ~7,000 chars prompt overhead, zero hooks/scripts
**Target**: 8 skills, ~1,600 chars prompt overhead, hooks for automation

---

## Why Consolidate

### The Problem

1. **Token overhead**: 48 skills × ~150 chars = ~7,000 chars injected per session
2. **No automation**: Zero `scripts/` directories - relies on agent "remembering"
3. **Paper architecture**: 48 SKILL.md specs, but no runtime hooks
4. **Artificial granularity**: `positive-framer` as its own skill is like a separate npm package for `toLowerCase()`

### The Insight

The brother's feedback nailed it:

> "You have the *what* (47 well-designed specs) but not the *how* (hooks, scripts, and automation that make it happen without the agent needing to remember)."

### What to Preserve

The design decisions are solid - they just don't need 48 separate skills:

- R/C/D counter model (Recurrence, Confirmations, Disconfirmations)
- Eligibility criteria (R≥3, C≥2, sources≥2, users≥2)
- Severity-tiered circuit breaker (CRITICAL: 3/30d, IMPORTANT: 5/30d)
- Event-driven governance over dashboards
- Golden master pattern
- Bridge layer for ClawHub integration

---

## Consolidation Map

### Current → Consolidated

```
48 Skills                           8 Skills
─────────────────────────────────────────────────────────────
Foundation (5)  ─┬─► context-verifier
Core Memory (9) ─┼─► failure-memory
                 └─► constraint-engine

Review (6)      ───► review-orchestrator

Detection (4)   ───► (merged into failure-memory)

Governance (5)  ─┬─► governance
Safety (4)      ─┴─► safety-checks

Bridge (5)      ───► clawhub-bridge

Extensions (10) ───► workflow-tools (3 kept, 7 deferred)
```

---

## Stage 1: Core Skills (MVP)

**Duration**: 1-2 days
**Goal**: 3 consolidated skills that handle 80% of use cases

### 1.1 failure-memory

**Merges**: failure-tracker, failure-detector, observation-recorder, evidence-tier, memory-search, topic-tagger, slug-taxonomy, effectiveness-metrics (8 skills → 1)

**When needed**: Something went wrong - detect, classify, record, search

**Sub-commands**:
```
/failure-memory detect   # Multi-signal failure detection
/failure-memory record   # Create/update observation with R/C/D
/failure-memory search   # Query observations by pattern/tag
/failure-memory classify # Assign evidence tier (N=1/2/3+)
/failure-memory status   # Show pending eligibility, recent failures
```

**Hooks** (NEW):
```bash
# scripts/post-tool-use.sh - fires on PostToolUse
# Detects: test failures, user corrections, API errors
# Auto-records failures without agent needing to remember
```

**Key content from merged skills**:
- R/C/D counter logic (from failure-tracker)
- Evidence tiers: Weak (N=1), Emerging (N=2), Strong (N≥3) (from evidence-tier)
- Slug taxonomy: git-*, test-*, workflow-*, security-*, docs-*, quality-* (from slug-taxonomy)
- Effectiveness metrics: prevention rate, false positive rate (from effectiveness-metrics)

### 1.2 constraint-engine

**Merges**: constraint-generator, constraint-enforcer, constraint-lifecycle, contextual-injection, positive-framer, circuit-breaker, emergency-override (7 skills → 1)

**When needed**: About to take action OR pattern hit threshold

**Sub-commands**:
```
/constraint-engine check     # Pre-action constraint check
/constraint-engine generate  # Create constraint from eligible pattern
/constraint-engine status    # Show active constraints, circuit state
/constraint-engine override  # Temporary bypass with audit trail
/constraint-engine lifecycle # Manage draft→active→retiring→retired
```

**Hooks** (NEW):
```bash
# scripts/pre-action.sh - fires before file modifications
# Checks relevant constraints, blocks if circuit OPEN
# Logs all checks for audit trail
```

**Key content from merged skills**:
- Eligibility formula: R≥3 AND C≥2 AND D/(C+D)<0.2 AND sources≥2 (from constraint-generator)
- Positive framing: "Don't X" → "Always Y" (from positive-framer)
- Circuit breaker thresholds: CRITICAL 3/30d, IMPORTANT 5/30d, MINOR 10/30d (from circuit-breaker)
- States: draft → active → retiring → retired (from constraint-lifecycle)

### 1.3 context-verifier

**Merges**: context-packet, file-verifier, severity-tagger (3 skills → 1)

**When needed**: Preparing context for review or verification

**Sub-commands**:
```
/context-verifier hash   # Generate SHA-256 checksums for files
/context-verifier verify # Verify file against stored hash
/context-verifier tag    # Classify severity (critical/important/minor)
/context-verifier packet # Generate full context packet with hashes
```

**Key content from merged skills**:
- SHA-256 checksums (from file-verifier)
- Context packet format with file hashes (from context-packet)
- Severity classification rubric (from severity-tagger)

---

## Stage 2: Review and Governance

**Duration**: 0.5-1 day
**Goal**: 3 supporting skills for periodic operations

### 2.1 review-orchestrator

**Merges**: twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer (5 skills → 1)

**When needed**: Code review requested

**Sub-commands**:
```
/review-orchestrator select   # Choose review type by context/risk
/review-orchestrator twin     # Spawn technical + creative twins
/review-orchestrator cognitive # Spawn Opus 4/4.1/Sonnet 4.5 modes
/review-orchestrator gate     # Quality gate for staged work
```

### 2.2 governance

**Merges**: governance-state, constraint-reviewer, index-generator, round-trip-tester, version-migration, adoption-monitor (6 skills → 1)

**When needed**: Periodic housekeeping, constraint maintenance

**Sub-commands**:
```
/governance state   # Central state with event-driven alerts
/governance review  # Review due constraints
/governance index   # Generate INDEX.md
/governance verify  # Round-trip synchronization test
/governance migrate # Schema version migration
```

### 2.3 safety-checks

**Merges**: model-pinner, fallback-checker, cache-validator, cross-session-safety-check (4 skills → 1)

**When needed**: Pre-flight safety verification

**Sub-commands**:
```
/safety-checks model    # Verify model version pinning
/safety-checks fallback # Verify fallback chains exist
/safety-checks cache    # Detect stale cached responses
/safety-checks session  # Detect cross-session state interference
```

---

## Stage 3: ClawHub Bridge

**Duration**: 0.5 day
**Goal**: 1 consolidated bridge skill for ClawHub integration

### 3.1 clawhub-bridge

**Merges**: learnings-n-counter, feature-request-tracker, wal-failure-detector, heartbeat-constraint-check, vfm-constraint-scorer (5 skills → 1)

**When needed**: Exporting data to ClawHub agents

**Sub-commands**:
```
/clawhub-bridge learnings  # Export N≥3 learnings → self-improving-agent
/clawhub-bridge features   # Export constraint gaps → proactive-agent
/clawhub-bridge wal        # Parse WAL failures → failure-detector
/clawhub-bridge heartbeat  # Health check → proactive-agent heartbeat
/clawhub-bridge vfm        # Score constraints → VFM system
```

**Note**: This skill provides the integration layer. The actual adapters (real vs mock) are in `agentic/bridge/adapters/`. Phase 5B will implement real adapters.

---

## Stage 4: Workflow Tools

**Duration**: 0.5 day
**Goal**: 1 consolidated extensions skill with proven patterns only

### 4.1 workflow-tools

**Keeps**: loop-closer, parallel-decision, mce-refactorer (3 of 10)

**Sub-commands**:
```
/workflow-tools loops    # Detect DEFERRED/PLACEHOLDER/TODO
/workflow-tools parallel # 5-factor parallel vs serial decision
/workflow-tools mce      # Check MCE compliance, suggest splits
```

**Deferred** (no proven need yet):
- hub-subworkflow
- pbd-strength-classifier (redundant with evidence-tier)
- observation-refactoring (manual is fine)
- constraint-versioning (premature)
- threshold-delegator
- cross-session-safety-check (merged into safety-checks)
- pattern-convergence-detector

---

## Stage 5: Hooks and Automation

**Duration**: 1 day
**Goal**: Wire skills into OpenClaw's hook system

### 5.1 Create Hook Scripts

```
agentic/
├── failure-memory/
│   ├── SKILL.md
│   └── scripts/
│       └── post-tool-use.sh    # Auto-detect failures
├── constraint-engine/
│   ├── SKILL.md
│   └── scripts/
│       └── pre-action.sh       # Pre-flight constraint check
└── clawhub-bridge/
    ├── SKILL.md
    └── scripts/
        └── heartbeat.sh        # Periodic health export
```

### 5.2 Hook Integration

OpenClaw hook points:
- `PostToolUse` → failure-memory detect
- `PreFileWrite` → constraint-engine check
- `Heartbeat` → clawhub-bridge heartbeat

### 5.3 HEARTBEAT.md Integration

Add to workspace HEARTBEAT.md:
```markdown
## Constraint Health (via clawhub-bridge)
- [ ] Any constraints approaching 90-day review?
- [ ] Any circuit breakers tripped?
- [ ] Any N≥3 patterns needing constraint generation?
```

---

## Stage 6: Documentation and Cleanup

**Duration**: 0.5 day
**Goal**: Update all references, archive old skills

### 6.1 Update ARCHITECTURE.md

- Replace 6-layer diagram with 4-tier model
- Update skill inventory tables
- Document hook integration

### 6.2 Archive Old Skills

```bash
# Move granular skills to archive
mkdir -p agentic/_archive
mv agentic/core/* agentic/_archive/
mv agentic/review/* agentic/_archive/
mv agentic/detection/* agentic/_archive/
mv agentic/governance/* agentic/_archive/
mv agentic/safety/* agentic/_archive/
mv agentic/extensions/* agentic/_archive/

# Keep bridge adapters (code, not SKILL.md)
mv agentic/bridge/adapters agentic/clawhub-bridge/adapters
mv agentic/bridge/interfaces agentic/clawhub-bridge/interfaces
```

### 6.3 Update Test Suite

- Consolidate 534 contract tests into ~100 focused tests
- Add integration tests for hooks
- Add E2E test for failure→constraint lifecycle

---

## Stage 7: Project Documentation Update

**Duration**: 0.5 day
**Goal**: Systematic documentation update following `docs/workflows/documentation-update.md`
**Workflow**: [Documentation Update Workflow](../workflows/documentation-update.md)

### 7.1 Follow Documentation Hierarchy

Per the workflow, updates flow from authoritative sources down:

1. **SKILL.md files** (8 new consolidated skills)
   - Frontmatter, usage, arguments, integration sections
   - Dependency documentation (Depends on / Used by)
   - Failure modes for each consolidated skill

2. **ARCHITECTURE.md**
   - Replace 6-layer diagram with consolidated 4-tier model (from Stage 6.1)
   - Update skill inventory tables (8 skills, not 48)
   - Document hook integration points
   - Update Guides section if needed

3. **README.md** (root)
   - Update skill tables (8 consolidated skills)
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
# Expected: All show 8

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

- [ ] ARCHITECTURE.md layer tables current (8 skills)
- [ ] README.md skill tables current (8 skills)
- [ ] Dependency links bidirectional
- [ ] Tests passing
- [ ] Phase results file created: `docs/implementation/agentic-consolidation-results.md`

---

## Timeline

| Stage | Duration | Description |
|-------|----------|-------------|
| Stage 1 | 1-2 days | Core skills: failure-memory, constraint-engine, context-verifier |
| Stage 2 | 0.5-1 day | Support skills: review-orchestrator, governance, safety-checks |
| Stage 3 | 0.5 day | Bridge: clawhub-bridge |
| Stage 4 | 0.5 day | Extensions: workflow-tools |
| Stage 5 | 1 day | Hooks and automation |
| Stage 6 | 0.5 day | Archive old skills, update test suite |
| Stage 7 | 0.5 day | Project documentation update (per workflow) |

**Total**: 4.5-6 days

---

## Success Criteria

- [ ] 8 consolidated SKILL.md files (down from 48)
- [ ] Prompt overhead reduced to ~1,600 chars (from ~7,000)
- [ ] 3 hook scripts wired into OpenClaw
- [ ] Core lifecycle works: failure → record → eligible → constraint → enforce
- [ ] ClawHub bridge exports to self-improving-agent
- [ ] Tests pass (consolidated from 534 to ~100)
- [ ] Documentation updated per workflow (ARCHITECTURE, READMEs, dependency links)
- [ ] Results file created: `docs/implementation/agentic-consolidation-results.md`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lost functionality in merge | Medium | Medium | Archive old skills, incremental consolidation |
| Hook integration issues | Medium | Medium | Test hooks individually before full integration |
| ClawHub API mismatch | Low | Medium | Validate interfaces in Stage 3 |

---

## What Changes for Phase 5B

After consolidation, Phase 5B (ClawHub integration) becomes simpler:

**Before**: 5 bridge skills to integrate
**After**: 1 `clawhub-bridge` skill with 5 sub-commands

The adapter code stays the same - only the SKILL.md organization changes.

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
- **Feedback source**: Internal review (over-engineering concerns)

---

*Plan created 2026-02-15. Consolidation addresses over-engineering while preserving ClawHub integration.*
