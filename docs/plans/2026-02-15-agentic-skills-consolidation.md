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

### Alternatives Considered

Before consolidation, we evaluated these alternatives:

| Alternative | Description | Why Not Chosen |
|-------------|-------------|----------------|
| **Dynamic skill loading** | Meta-skill loads 3-5 relevant skills per task via semantic routing | Adds routing complexity; current skills lack semantic metadata for effective routing; requires new infrastructure |
| **Tier-based loading** | Foundation always loaded, others context-dependent | Still ~3,000 chars for Foundation+Core; doesn't solve "paper architecture" (no hooks) |
| **Add hooks without consolidation** | Keep 48 skills, add hooks to critical ones | 48 SKILL.md files still too granular; doesn't address artificial separation (e.g., `positive-framer` as standalone) |
| **Prioritize runtime for critical skills only** | Implement runtime for 5-10 most-used skills | Leaves 38+ skills as "paper"; doesn't reduce prompt overhead |

**Why consolidation wins**: It addresses all three problems simultaneously:
1. Token overhead (7,000 → 1,600 chars)
2. No automation (adding hooks is easier with 8 skills)
3. Paper architecture (fewer skills to implement runtime for)

**Trade-off acknowledged**: Consolidation loses per-skill versioning flexibility. See "Versioning Strategy" below.

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

1. **Sub-command versioning**: Track version per sub-command in SKILL.md frontmatter
2. **Feature flags**: Critical sub-commands can have enable/disable flags
3. **Deprecation path**: Sub-commands follow draft→active→retiring→retired lifecycle
4. **Rollback scope**: If sub-command breaks, disable it via flag rather than rolling back entire skill

Example frontmatter:
```yaml
name: failure-memory
version: 1.0.0
sub_commands:
  detect: { version: 1.0.0, status: active }
  record: { version: 1.0.0, status: active }
  search: { version: 1.0.0, status: active }
  classify: { version: 1.0.0, status: active }
  status: { version: 1.0.0, status: active }
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

| Skill | Reason Deferred | Capability Lost | Manual Workaround | Sunset Criteria |
|-------|-----------------|-----------------|-------------------|-----------------|
| hub-subworkflow | No ClawHub integration yet | Automated subworkflow spawning | Manual subagent invocation | Reconsider when ClawHub live |
| pbd-strength-classifier | Redundant with evidence-tier | N/A (covered by `/failure-memory classify`) | N/A | Permanent removal OK |
| observation-refactoring | Manual is fine | Auto-refactoring of observations | Manual editing | Reconsider if N≥10 requests |
| constraint-versioning | Premature | Per-constraint versioning | Use sub-command versioning | Reconsider after 6 months |
| threshold-delegator | No multi-user yet | User-specific thresholds | Single threshold for all | Reconsider when multi-user |
| pattern-convergence-detector | Low N-count | Auto-detect converging patterns | Manual pattern review | Reconsider if N≥5 requests |

**Note**: `cross-session-safety-check` is merged into `safety-checks` (Stage 2.3), not deferred.

---

## Stage 5: Hooks and Automation

**Duration**: 1.5-2 days
**Goal**: Wire skills into OpenClaw's hook system
**Prerequisite**: Create `HOOKS.md` specification before implementation

### 5.0 Hook Specification (REQUIRED FIRST)

Before implementing hooks, create `agentic/HOOKS.md` specifying:

| Aspect | Requirement |
|--------|-------------|
| **Error handling** | Hook failure → log error, continue (non-blocking) OR block operation (blocking) |
| **Timeout** | Max 500ms for `post-tool-use`, 200ms for `pre-action`, 5s for `heartbeat` |
| **Execution order** | `pre-action` runs before file write; `post-tool-use` runs after tool completes |
| **State sharing** | Hooks communicate via files in `output/hooks/`, not shared memory |
| **Failure surfacing** | Hook errors logged to `output/hooks/errors.log`, surfaced in next `heartbeat` |
| **Atomicity** | Hooks must be idempotent; partial execution → retry safe |

**Blocking vs Non-blocking**:
- `pre-action.sh` (constraint check): **Blocking** - can prevent file write if circuit OPEN
- `post-tool-use.sh` (failure detect): **Non-blocking** - failure detection doesn't block next tool
- `heartbeat.sh` (health export): **Non-blocking** - runs on schedule, doesn't block operations

### 5.1 Create Hook Scripts

```
agentic/
├── HOOKS.md                     # Hook specification (create first!)
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
- `PostToolUse` → failure-memory detect (non-blocking, 500ms timeout)
- `PreFileWrite` → constraint-engine check (blocking, 200ms timeout)
- `Heartbeat` → clawhub-bridge heartbeat (non-blocking, 5s timeout)

### 5.3 Hook Testing

Each hook requires:
- Unit test with mock inputs
- Integration test with OpenClaw hook runner
- Timeout verification test
- Error handling test (what happens on failure?)

### 5.4 HEARTBEAT.md Integration

Add to workspace HEARTBEAT.md:
```markdown
## Constraint Health (via clawhub-bridge)
- [ ] Any constraints approaching 90-day review?
- [ ] Any circuit breakers tripped?
- [ ] Any N≥3 patterns needing constraint generation?
- [ ] Any hook errors in last 24h? (check output/hooks/errors.log)
```

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
```bash
# Create archive with clear dating
mkdir -p agentic/_archive/2026-02-consolidation

# Move with git history preservation (use git mv)
git mv agentic/core/* agentic/_archive/2026-02-consolidation/
git mv agentic/review/* agentic/_archive/2026-02-consolidation/
git mv agentic/detection/* agentic/_archive/2026-02-consolidation/
git mv agentic/governance/* agentic/_archive/2026-02-consolidation/
git mv agentic/safety/* agentic/_archive/2026-02-consolidation/
git mv agentic/extensions/* agentic/_archive/2026-02-consolidation/

# Keep bridge adapters (code, not SKILL.md) - move to new location
git mv agentic/bridge/adapters agentic/clawhub-bridge/adapters
git mv agentic/bridge/interfaces agentic/clawhub-bridge/interfaces
```

**Archive README**:
Create `agentic/_archive/2026-02-consolidation/README.md`:
```markdown
# Archived Skills (2026-02-15)

These 48 granular skills were consolidated into 8 skills.
See ../ARCHITECTURE.md for current skill structure.

**Purpose**: Reference and rollback only. Do not load these skills.
**Rollback**: If consolidation fails, restore from this archive.
```

### 6.2 Test Migration Strategy

**Goal**: Maintain coverage while reducing test count (534 → ~100).

**Step 1: Coverage baseline**
```bash
# Before any test changes, capture coverage
npm run test:coverage > coverage-before.txt
# Record: lines covered, branches covered, functions covered
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
npm run test:coverage > coverage-after.txt
diff coverage-before.txt coverage-after.txt
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
├── clawhub-bridge.test.ts    # 10-12 tests
├── workflow-tools.test.ts    # 6-8 tests
├── hooks/                    # New hook tests
│   ├── post-tool-use.test.ts
│   ├── pre-action.test.ts
│   └── heartbeat.test.ts
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
| Stage 1 | 2-3 days | Core skills: failure-memory, constraint-engine, context-verifier |
| Stage 2 | 1-1.5 days | Support skills: review-orchestrator, governance, safety-checks |
| Stage 3 | 0.5-1 day | Bridge: clawhub-bridge |
| Stage 4 | 0.5 day | Extensions: workflow-tools |
| Stage 5 | 1.5-2 days | HOOKS.md spec + hook implementation + testing |
| Stage 6 | 1-1.5 days | Archive migration + test migration with coverage verification |
| Stage 7 | 0.5-1 day | Project documentation update (per workflow) |

**Total**: 7.5-10.5 days (realistic estimate)

**Buffer**: Add 2-3 days for unexpected issues (hook debugging, coverage gaps, path breakage).

**Adjusted total with buffer**: 10-14 days

---

## Success Criteria

- [ ] 8 consolidated SKILL.md files (down from 48)
- [ ] Prompt overhead reduced to ~1,600 chars (from ~7,000)
- [ ] `agentic/HOOKS.md` specification created and approved
- [ ] 3 hook scripts wired into OpenClaw with tests
- [ ] Core lifecycle works: failure → record → eligible → constraint → enforce
- [ ] ClawHub bridge exports to self-improving-agent
- [ ] Test coverage maintained (<5% delta from baseline)
- [ ] `tests/MIGRATION.md` documents 534→~100 test mapping
- [ ] No broken import references (verified via grep)
- [ ] Documentation updated per workflow (ARCHITECTURE, READMEs, dependency links)
- [ ] Results file created: `docs/implementation/agentic-consolidation-results.md`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lost functionality in merge | Medium | High | Merge strategy (above), sub-command independence testing |
| Hook integration issues | High | Medium | HOOKS.md spec required first, individual hook testing, timeout verification |
| Import path breakage | High | Medium | Reference update checklist (Stage 6.1), verify before archive |
| Test coverage loss | Medium | High | Coverage baseline before, coverage map, <5% delta target |
| Sub-command versioning gaps | Medium | Medium | Feature flags, sub-command versioning in frontmatter |
| Hook timing/ordering issues | Medium | Medium | Explicit execution order in HOOKS.md, integration tests |
| ClawHub API mismatch | Low | Medium | Validate interfaces in Stage 3 |
| Deferred feature regression | Low | Medium | Document capabilities lost, sunset criteria, manual workarounds |
| Phase 5B coordination failure | Low | Medium | Explicit handoff checklist in Phase 5B plan |

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
- **Code reviews** (N=2):
  - `../reviews/2026-02-15-agentic-skills-consolidation-plan-codex.md`
  - `../reviews/2026-02-15-agentic-skills-consolidation-plan-gemini.md`
- **Feedback source**: Internal review (over-engineering concerns)

---

*Plan created 2026-02-15. Consolidation addresses over-engineering while preserving ClawHub integration.*
*Updated 2026-02-15: Addressed N=2 code review findings (Codex + Gemini) - added merge strategy, hook specification, test migration, realistic timeline, expanded risk assessment.*
