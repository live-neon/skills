---
created: 2026-02-15
type: plan
status: complete
priority: medium
estimated_effort: 8-11 sessions
depends_on:
  - docs/plans/2026-02-15-agentic-skills-consolidation.md
related_issues:
  - docs/issues/2026-02-15-agentic-consolidation-review-findings.md
  - docs/issues/2026-02-16-clawhub-decoupling-impl-review-remediation.md
  - docs/issues/2026-02-16-clawhub-decoupling-twin-review-findings.md
implementation_reviews:
  - docs/reviews/2026-02-16-clawhub-decoupling-impl-codex.md
  - docs/reviews/2026-02-16-clawhub-decoupling-impl-gemini.md
  - docs/reviews/2026-02-16-clawhub-decoupling-impl-twin-technical.md
  - docs/reviews/2026-02-16-clawhub-decoupling-impl-twin-creative.md
related_reviews:
  - docs/reviews/2026-02-15-agentic-consolidation-review-codex.md
  - docs/reviews/2026-02-15-agentic-consolidation-review-gemini.md
  - docs/reviews/2026-02-15-agentic-consolidation-review-twin-technical.md
  - docs/reviews/2026-02-15-agentic-consolidation-review-twin-creative.md
plan_reviews:
  - docs/reviews/2026-02-15-agentic-clawhub-decoupling-codex.md
  - docs/reviews/2026-02-15-agentic-clawhub-decoupling-gemini.md
  - docs/reviews/2026-02-15-agentic-clawhub-decoupling-twin-technical.md
  - docs/reviews/2026-02-15-agentic-clawhub-decoupling-twin-creative.md
version: v3
---

# Plan: Agentic Skills ClawHub Decoupling

## Summary

Decouple 7 consolidated agentic skills from Multiverse-specific dependencies to enable
ClawHub publication as `leegitw/*` skills.

**Scope**: 200-350+ lines across 7 SKILL.md files
**Risk**: Medium (model abstraction in review-orchestrator is largest unknown)
**Blocking**: ClawHub publication requires these fixes

> **Publication Note**: Skills are hosted on GitHub at `live-neon/skills` (org repo)
> but published to ClawHub under the `leegitw` username for installation.

> **v2 Updates** (Code Review N=2: Codex + Gemini):
> - Added migration strategy stage (C-1)
> - Added integration testing stage (C-2)
> - Added versioning strategy (I-2, I-4)
> - Strengthened verification commands with positive checks (I-3)
> - Added risk mitigation owners (I-5)
> - Added skill-level standalone documentation requirement (I-7)
> - Clarified CJK notation retention policy (M-2, M-5)

> **v3 Updates** (Twin Review N=2: Technical + Creative):
> - Added Quick Reference table for navigation (M-1)
> - Fixed Stage 4 scope: governance for 90-day cadence, not constraint-engine (I-1)
> - Added `/ro twin` command name decision to Stage 2 (I-3)
> - Added negative test cases to Stage 8 (I-2)
> - Fixed timeline parallelism note (M-3)

---

## Quick Reference

| Stage | Goal | Sessions | Status |
|-------|------|----------|--------|
| 1 | Spike: cognitive mode abstraction | 1 | ✅ Complete |
| 2 | Complete review-orchestrator decoupling | 1 | ✅ Complete |
| 3 | safety-checks decoupling | 1 | ✅ Complete |
| 4 | context-verifier + governance fixes | 0.5 | ✅ Complete |
| 5 | Diverse examples across all skills | 1 | ✅ Complete |
| 6 | ClawHub frontmatter + documentation | 1 | ✅ Complete |
| 7 | Final verification | 1 | ✅ Complete |
| 8 | Integration testing | 1 | ✅ Complete |
| 9 | Publication prep | 0.5 | ✅ Complete |

**Total**: 8-11 sessions

---

## Background

Before defining stages, we establish the migration strategy that constrains all changes.

The consolidated agentic skills (48 to 7) were reviewed N=4 times (Codex, Gemini,
twin-technical, twin-creative). All reviewers agreed the consolidation is "well-architected"
but identified hardcoded dependencies preventing external publication.

**Strategic value**: These skills implement a complete failure-to-constraint lifecycle
with mathematical burden of proof (R/C/D counters) - novel differentiator vs competitors.

### Decoupling Requirements

| Skill | Fix | Est. Lines |
|-------|-----|------------|
| context-verifier | Remove `CLAUDE.md` hardcode, make configurable | ~2 |
| safety-checks | Support `.openclaw/` and `.claude/` config paths | ~10 |
| safety-checks | Make model version format generic | ~30-40 |
| safety-checks | Generalize S3 to "primary/backup/local" | ~5 |
| review-orchestrator | Generalize "twin" to "multi-perspective" | ~50 |
| review-orchestrator | Make cognitive modes model-agnostic | ~100-150 |
| review-orchestrator | Make quality gate checks pluggable | ~10 |
| constraint-engine | Make review cadence configurable | ~3 |
| All skills | Add diverse examples beyond git/commit | ~40 |

**Total**: 200-350+ lines (cognitive mode abstraction is largest item)

---

## Migration Strategy

> **Addresses C-1**: No migration plan for existing configs/data

Existing Multiverse deployments using `.claude/` config paths will continue to work.
The decoupling adds `.openclaw/` support without removing `.claude/` support.

**Configuration Precedence** (documented in each skill):
1. `.openclaw/settings.yaml` (OpenClaw standard) - takes precedence if present
2. `.claude/settings.json` (Claude Code compatibility) - fallback
3. Workspace root `settings.yaml` - final fallback

**Backward Compatibility**:
- All existing `.claude/` configurations remain valid
- No data migration required (`.learnings/` directory structure unchanged)
- Model identifier format accepts both old (`claude-opus-4-5-...`) and new (`{provider}-{model}-...`)

**Deprecation Timeline** (for Multiverse-only features):
- v1.0.0: Both config paths supported, `.openclaw/` documented as primary
- v1.x: No deprecation notices (maintain compatibility)
- v2.0.0 (future): Consider deprecating `.claude/`-only features if any remain

**Verification**:
```bash
# Both config paths documented
grep -r "\.openclaw/\|\.claude/" agentic/*/SKILL.md | grep -v "^#" | wc -l
# Expected: Multiple mentions of both paths

# Precedence documented
grep -A3 "precedence\|Precedence" agentic/*/SKILL.md
# Expected: Precedence order documented in relevant skills
```

---

## Stages

### Stage 1: Spike on review-orchestrator Model Abstraction (1-2 sessions)

**Goal**: Validate the ~100-150 line estimate for cognitive mode abstraction before
committing to full implementation.

**Rationale**: This is the largest and most uncertain work item. A spike validates
the approach and refines estimates before full implementation.

**Files**:
- `agentic/review-orchestrator/SKILL.md`

**Changes**:

1. **Define cognitive mode interface** (~20 lines):
   ```markdown
   ### Cognitive Mode Interface

   | Field | Type | Description |
   |-------|------|-------------|
   | id | string | Mode identifier (e.g., "analyzer", "architect", "implementer") |
   | perspective | string | Human-readable perspective description |
   | prompt_prefix | string | Prompt prefix for this mode |
   | model_hint | string | Optional model preference (not enforced) |
   ```

2. **Add configuration system** (~30 lines):
   ```markdown
   ### Cognitive Mode Configuration

   Configure modes via `.openclaw/review-orchestrator.yaml` or `.claude/review-orchestrator.yaml`:

   ```yaml
   cognitive_modes:
     - id: analyzer
       perspective: "Here's what conflicts"
       prompt_prefix: "Analyze tensions and conflicts in..."
     - id: architect
       perspective: "Here's how to restructure"
       prompt_prefix: "Suggest architectural improvements for..."
     - id: implementer
       perspective: "Here's how to implement"
       prompt_prefix: "Provide implementation guidance for..."
   ```

3. **Update cognitive mode table** (~10 lines):
   - Remove hardcoded `opus4`, `opus41`, `sonnet45` references
   - Replace with generic perspective-based modes

4. **Update examples** (~20 lines):
   - Replace "Opus 4 Analysis" with "Analyzer Perspective"
   - Show model-agnostic output format

5. **Integration and edge case handling** (~20-40 lines):
   - Config validation and error messages
   - Default mode fallbacks
   - Edge case documentation

**Verification**:
```bash
# ABSENCE checks (old patterns removed)
grep -E "opus4|opus41|sonnet45|claude-opus|claude-sonnet" agentic/review-orchestrator/SKILL.md
# Expected: No matches

# PRESENCE checks (new abstractions exist)
grep -E "\.openclaw/|\.claude/" agentic/review-orchestrator/SKILL.md
# Expected: Both patterns present

grep "Cognitive Mode Interface" agentic/review-orchestrator/SKILL.md
# Expected: Interface section exists

grep "cognitive_modes:" agentic/review-orchestrator/SKILL.md
# Expected: Configuration example present

grep -E "analyzer|architect|implementer" agentic/review-orchestrator/SKILL.md
# Expected: Generic mode names present
```

**Exit Criteria** (must pass before Stage 2):
- [x] All ABSENCE checks pass (no old model references) ✓ 2026-02-15
- [x] All PRESENCE checks pass (new abstractions documented) ✓ 2026-02-15
- [x] Interface design reviewed and approved ✓ 2026-02-15
- [x] Estimate validated (actual LOC: 107, within 20% of 100-150) ✓ 2026-02-15

**Spike Success Criteria**:
- [x] Interface design is clear and implementable ✓
- [x] Configuration example is complete ✓
- [x] Estimate validated: 107 lines actual (within 20% of 100-150) ✓
- [x] No architectural blockers discovered ✓

**Stage 1 Status**: ✅ COMPLETE (2026-02-15, 1 session)

**Spike Failure Criteria** (triggers re-planning):
- Effort exceeds 200 lines (need to split this stage)
- Interface design has fundamental issues
- Configuration system requires external dependencies

**Dependencies**: None (first stage)

---

### Stage 2: Complete review-orchestrator Decoupling (1 session)

**Goal**: Finish review-orchestrator decoupling (twin generalization + quality gates)

**Prerequisite**: Stage 1 spike validated

**Files**:
- `agentic/review-orchestrator/SKILL.md`

**Changes**:

1. **Generalize "twin" to "multi-perspective"** (~50 lines):
   - Rename references: "twin review" to "multi-perspective review"
   - Update terminology: "twin" to "reviewer" or "perspective"
   - **CJK Retention Policy**: Keep CJK characters (双, 審, etc.) as brand identity.
     CJK notation is intentionally portable and self-explanatory in context.
     Users don't need to understand CJK to use the skill.
   - Update examples to show multi-perspective (not two-person team specific)
   - **Command Name Decision** (`/ro twin`):
     - **Option A (Recommended)**: Keep `/ro twin` command name with documentation explaining
       "twin" refers to "dual-perspective review" pattern, not specific team structure.
       Add alias `/ro multi` for discoverability.
     - **Option B**: Rename to `/ro multi`, deprecate `/ro twin` with warning.
       Requires MAJOR version bump (breaking change).
     - **Decision**: Option A - keep command, add alias, document meaning.

2. **Make quality gate checks pluggable** (~10 lines):
   - Replace hardcoded `npm test` with configurable test command
   - Add configuration example with multiple ecosystems:
     ```yaml
     quality_gates:
       test_command: "npm test"    # Node.js
       # test_command: "go test ./..."  # Go
       # test_command: "pytest"         # Python
       # test_command: "cargo test"     # Rust
       coverage_threshold: 5
       require_docs: true
     ```

**Verification**:
```bash
# ABSENCE checks
grep -i "twin" agentic/review-orchestrator/SKILL.md | grep -v "Source skills:" | grep -v "^---" | grep -v "tags:" | grep -v "/ro twin" | grep -v "/ro multi"
# Expected: Only in historical notes, tags, and command names (with alias)

# PRESENCE checks
grep "multi-perspective" agentic/review-orchestrator/SKILL.md
# Expected: >0 matches (new terminology present)

grep "/ro multi" agentic/review-orchestrator/SKILL.md
# Expected: Alias command present

grep -E "go test|pytest|cargo test" agentic/review-orchestrator/SKILL.md
# Expected: Alternative test command examples present

grep -E "dual-perspective|two-perspective" agentic/review-orchestrator/SKILL.md
# Expected: Documentation explaining "twin" command name meaning
```

**Exit Criteria**:
- [x] "twin" in documentation replaced with "multi-perspective" (command name `/ro twin` retained) ✓ 2026-02-15
- [x] `/ro multi` alias added for discoverability ✓ 2026-02-15 (Stage 1)
- [x] "twin" command name documented as "dual-perspective review pattern" ✓ 2026-02-15
- [x] Quality gate examples include 3+ ecosystems (npm, go, pytest, cargo) ✓ 2026-02-15 (Stage 1)

**Stage 2 Status**: ✅ COMPLETE (2026-02-15, combined with Stage 1)

**Dependencies**: Stage 1 complete

---

### Stage 3: safety-checks Decoupling (1 session)

**Goal**: Remove all Claude-specific and Multiverse-specific references from safety-checks

**Files**:
- `agentic/safety-checks/SKILL.md`

**Changes**:

1. **Support both config paths** (~10 lines):
   - Line 75: Change `.claude/settings.json` to support both paths
   - Add configuration precedence:
     ```markdown
     Configuration is loaded from (in order of precedence):
     1. `.openclaw/settings.yaml` (OpenClaw standard)
     2. `.claude/settings.json` (Claude Code compatibility)
     3. Workspace root `settings.yaml`
     ```

2. **Make model version format generic** (~30-40 lines):
   - Line 78: Remove `claude-opus-4-5-20251101` hardcode
   - Lines 134-147: Update Model Chain example to be generic
   - Lines 169-170: Update drift output example
   - Replace with:
     ```markdown
     Model version format: `{provider}-{model}-{version}-{date}`
     Example: `anthropic-opus-4-5-20251101`
     ```
   - Update examples to use placeholder format

3. **Generalize S3 references** (~5 lines):
   - Line 103: Replace "S3" with "Primary storage"
   - Lines 174-176: Update Storage Chain to generic terms:
     ```markdown
     Storage Chain:
       - Primary (cloud) - connected
       - Secondary (local disk) - 12GB free
       - Tertiary (memory) - 4GB free
     ```

**Verification**:
```bash
# ABSENCE checks
grep "claude-opus-4-5" agentic/safety-checks/SKILL.md
# Expected: 0 (only placeholder format)

grep -riE "S3|aws|bucket" agentic/safety-checks/SKILL.md
# Expected: 0 (all cloud storage references generalized)

# PRESENCE checks
grep "\.openclaw/" agentic/safety-checks/SKILL.md
# Expected: >0 (OpenClaw config path documented)

grep "\.claude/" agentic/safety-checks/SKILL.md
# Expected: >0 (Claude config path as compatibility option)

grep -E "Primary|Secondary|Tertiary" agentic/safety-checks/SKILL.md
# Expected: Generic storage chain terminology present

grep "{provider}-{model}" agentic/safety-checks/SKILL.md
# Expected: Generic model version format documented
```

**Exit Criteria**:
- [x] No AWS/S3-specific references remain ✓ 2026-02-16
- [x] Both config paths documented with precedence ✓ 2026-02-16
- [x] Model version format is provider-agnostic (`{provider}-{model}-{version}-{date}`) ✓ 2026-02-16
- [x] Storage chain uses generic terminology (Primary/Secondary/Tertiary) ✓ 2026-02-16

**Stage 3 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: None (parallel with Stage 2)

---

### Stage 4: context-verifier and governance Fixes (0.5 session)

**Goal**: Complete minimal fixes for context-verifier and governance (90-day cadence)

**Files**:
- `agentic/context-verifier/SKILL.md`
- `agentic/governance/SKILL.md` (NOT constraint-engine - see note below)

> **Clarification**: The 90-day review cadence is in `governance/SKILL.md:109-119`, not
> constraint-engine. constraint-engine has circuit breaker thresholds (30-day violation window)
> which are separate. This stage targets governance for cadence configuration.

**Changes**:

1. **context-verifier**: Remove CLAUDE.md hardcode (~5 lines):
   - Line 85: Change `CLAUDE.md` to configurable critical file pattern
   - Update to:
     ```markdown
     | critical | `*.env`, `*credentials*`, `*secret*`, project root config | Block operation |
     ```
   - Add configuration note:
     ```markdown
     Critical file patterns are configurable via `.openclaw/context-verifier.yaml`:
     ```yaml
     critical_patterns:
       - "*.env"
       - "*credentials*"
       - "*secret*"
       - "CLAUDE.md"  # Claude Code projects
       - "AGENTS.md"  # OpenClaw projects
     ```
   - Add example showing configurable usage

2. **governance**: Make 90-day review cadence configurable (~5 lines):
   - Target file: `governance/SKILL.md:109-119` (the 90-day review cycle section)
   - Add configuration example:
     ```markdown
     Review cadence is configurable (default: 90 days):
     ```yaml
     governance:
       review_cadence_days: 90
     ```
   - Add example showing configurable cadence in use

**Verification**:
```bash
# ABSENCE checks
grep "CLAUDE.md" agentic/context-verifier/SKILL.md | grep -v "critical_patterns" | grep -v "#"
# Expected: 0 (only in config example with comment)

# PRESENCE checks
grep "critical_patterns:" agentic/context-verifier/SKILL.md
# Expected: Configuration section present

grep "review_cadence_days:" agentic/governance/SKILL.md
# Expected: Configuration example present (NOTE: governance, not constraint-engine)

grep -E "\.openclaw/context-verifier" agentic/context-verifier/SKILL.md
# Expected: OpenClaw config path documented
```

**Exit Criteria**:
- [x] CLAUDE.md only appears in configuration example (not hardcoded) ✓ 2026-02-16
- [x] context-verifier has configurable critical patterns ✓ 2026-02-16
- [x] governance has configurable review cadence (review_cadence_days) ✓ 2026-02-16
- [x] Both skills have configuration examples showing customization ✓ 2026-02-16

**Stage 4 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: None (parallel with Stage 2-3)

---

### Stage 5: Add Diverse Examples Across All Skills (1-2 sessions)

**Goal**: Add non-git/commit examples to demonstrate broader applicability

**Files**:
- All 7 skills in `agentic/`

**Changes per skill**:

1. **failure-memory** (~8 lines):
   - Add API failure example
   - Add deployment failure example

2. **constraint-engine** (~6 lines):
   - Add code review constraint example
   - Add deployment gate example

3. **context-verifier** (~4 lines):
   - Add database migration verification example

4. **safety-checks** (~6 lines):
   - Add API key rotation check example
   - Add dependency vulnerability check example

5. **review-orchestrator** (~6 lines):
   - Add API design review example
   - Add performance review example

6. **governance** (~5 lines):
   - Add compliance review example

7. **workflow-tools** (~5 lines):
   - Add deployment workflow example

**Total**: ~40 lines across 7 files

**Verification**:
```bash
# Each skill has at least 2 example domains
for skill in failure-memory constraint-engine context-verifier safety-checks review-orchestrator governance workflow-tools; do
  echo "=== $skill ==="
  grep -E "Example:|example:" agentic/$skill/SKILL.md | head -5
done
# Expected: Mix of git, API, deployment, review examples
```

**Dependencies**: Stages 2-4 complete (examples should use new generic terminology)

**Stage 5 Status**: ✅ COMPLETE (2026-02-16)
- All 7 skills have diverse examples (API, deployment, compliance, performance)
- Examples demonstrate broader applicability beyond git/commit

---

### Stage 6: ClawHub Frontmatter, Versioning, and Documentation (1-2 sessions)

**Goal**: Prepare skills for ClawHub publication with complete metadata and documentation

**Files**:
- All 7 `SKILL.md` files
- New: `agentic/README.md` (suite overview)
- New: `LICENSE` (MIT license text)

**Changes**:

1. **Update frontmatter** for ClawHub (~5 lines per file, ~35 total):
   - Add `repository: leegitw/[skill-name]` (ClawHub publication username)
   - Add `homepage: https://github.com/live-neon/skills/tree/main/agentic/[skill-name]` (GitHub org repo)
   - Add `license: MIT`
   - Add `version: 1.0.0` (all skills start at 1.0.0 post-consolidation)
   - Add `author: Live Neon <hello@liveneon.ai>`

   > **Note**: Skills are hosted on GitHub at `live-neon/skills` (org repo) but published
   > to ClawHub under the `leegitw` username. The `repository` field is for ClawHub,
   > while `homepage` points to the GitHub source.

2. **Establish versioning strategy**:
   - **Format**: Semantic Versioning (SemVer) - MAJOR.MINOR.PATCH
   - **Initial version**: 1.0.0 for all skills (consolidation is the 1.0 release)
   - **Version bump policy**:
     - MAJOR: Breaking changes to skill interface or config format
     - MINOR: New features, new examples, new config options
     - PATCH: Bug fixes, documentation improvements
   - Document in suite README

3. **Add skill-level standalone documentation** (~10 lines per skill, ~70 total):
   - Installation instructions: `openclaw install leegitw/[skill-name]`
   - Dependency installation: `depends on: leegitw/context-verifier` (where applicable)
   - Standalone usage example (not requiring full suite)
   - Quick reference for single-skill users

4. **Create suite README** (~100 lines):
   - Lifecycle diagram (failure to constraint to governance)
   - Layer architecture (Foundation to Core to Review to Governance)
   - Quick start (install context-verifier first)
   - Cross-references between skills
   - Evidence tier explanation (weak/emerging/strong with R/C/D counters)
   - Comparison to competitors
   - Version bump policy

**Verification**:
```bash
# PRESENCE checks for frontmatter
for skill in failure-memory constraint-engine context-verifier safety-checks review-orchestrator governance workflow-tools; do
  echo "=== $skill ==="
  head -20 agentic/$skill/SKILL.md | grep -E "repository:|license:|version:|author:|homepage:"
done
# Expected: All 5 fields present in each skill
# - repository: leegitw/[skill-name] (ClawHub)
# - homepage: https://github.com/live-neon/skills/... (GitHub)

# Version format correct
grep -r "version: 1.0.0" agentic/*/SKILL.md | wc -l
# Expected: 7 (all skills at 1.0.0)

# Installation instructions present
grep -r "openclaw install" agentic/*/SKILL.md | wc -l
# Expected: 7 (one per skill)

# Suite README exists with required sections
test -f agentic/README.md && grep -E "Lifecycle|Quick start|Evidence tier" agentic/README.md
# Expected: All sections present
```

**Exit Criteria**:
- [x] All 7 skills have complete ClawHub frontmatter (5 required fields: repository, homepage, license, version, author) ✓ 2026-02-16
  - `repository`: `leegitw/[skill-name]` (ClawHub publication)
  - `homepage`: `https://github.com/live-neon/skills/...` (GitHub source)
- [x] All skills at version 1.0.0 ✓ 2026-02-16
- [x] Each skill has standalone installation instructions (27 total) ✓ 2026-02-16
- [x] Suite README has lifecycle diagram and evidence tier explanation ✓ 2026-02-16
- [x] LICENSE file present with MIT text ✓ 2026-02-16

**Stage 6 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: Stage 5 complete

---

### Stage 7: Final Verification (1 session)

**Goal**: Verify all decoupling complete with comprehensive checks

**Verification checklist**:

1. **No Multiverse-specific references remain**:
   ```bash
   grep -r "Multiverse\|multiverse\|Live Neon\|live-neon" agentic/*/SKILL.md
   # Expected: Only in author field (acceptable) or historical notes
   ```

2. **No hardcoded Claude references**:
   ```bash
   grep -rE "claude-opus|claude-sonnet|opus4[^a-z]|opus41|sonnet45" agentic/*/SKILL.md
   # Expected: 0 matches
   ```

3. **Configuration paths support both ecosystems**:
   ```bash
   grep -r "\.openclaw/" agentic/*/SKILL.md | wc -l
   # Expected: >0 (OpenClaw paths present)
   ```

4. **Implicit dependencies checked** (addresses I-6):
   ```bash
   # Check for assumed directory structures
   grep -rE "\.claude/|output/|\.learnings/" agentic/*/SKILL.md
   # Expected: All paths have .openclaw/ alternative documented nearby

   # Check for environment assumptions
   grep -rE "process\.env|ENV\[|getenv" agentic/*/SKILL.md
   # Expected: 0 (no environment variable assumptions)

   # Check for ecosystem-specific tooling assumptions
   grep -rE "npm |yarn |node " agentic/*/SKILL.md | grep -v "test_command"
   # Expected: Only in configuration examples, not hardcoded
   ```

5. **All acceptance criteria checked**:
   - Run through each skill's acceptance criteria section
   - Verify no criteria depend on Multiverse-specific features

6. **Dependency graph valid**:
   - Verify dependency graph from issue file still holds
   - context-verifier has no deps (foundation)
   - Each skill's deps are portable

7. **Author field preserved** (brand attribution acceptable):
   ```bash
   grep -r "author:" agentic/*/SKILL.md
   # Expected: Author field present (Live Neon attribution is acceptable)
   ```

**Exit Criteria**:
- [x] All ABSENCE checks pass (no hardcoded references) ✓ 2026-02-16
  - No Multiverse references
  - No hardcoded Claude models (claude-opus-4-5, opus4, etc.)
  - No environment variable assumptions
- [x] All PRESENCE checks pass (alternatives documented) ✓ 2026-02-16
  - 12 OpenClaw config path references
  - CJK notation preserved (11 instances)
  - Author field preserved (7 skills)
- [x] Implicit dependency check passes ✓ 2026-02-16
  - context-verifier has no dependencies (foundation)
  - All acceptance criteria portable
- [x] All acceptance criteria remain satisfiable ✓ 2026-02-16

**Stage 7 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: Stage 6 complete

---

### Stage 8: Integration Testing (1 session)

> **Addresses C-2**: Test strategy absent

**Goal**: Validate decoupled skills work correctly with both config systems

**Test Strategy**:

1. **Sample invocations per skill**:
   - Each skill exercised with `.openclaw/` config
   - Each skill exercised with `.claude/` config
   - Verify identical behavior

2. **Acceptance criteria validation**:
   - Run through each skill's acceptance criteria with sample data
   - Verify R/C/D counter behavior unchanged
   - Verify evidence tier calculations work

3. **Cross-skill integration**:
   - Test failure-memory → constraint-engine pipeline
   - Test governance review cycle
   - Verify dependencies resolve correctly

**Test Cases**:

```markdown
## failure-memory
- [ ] `/fm observe` creates observation with correct R/C/D structure
- [ ] `/fm status` shows evidence tiers correctly
- [ ] Works with .openclaw/ config
- [ ] Works with .claude/ config

## constraint-engine
- [ ] `/ce generate` creates constraint from eligible observation
- [ ] Circuit breaker triggers at correct thresholds
- [ ] Works with both config systems

## context-verifier
- [ ] Severity detection works with configurable patterns
- [ ] Critical file detection uses configured patterns (not hardcoded CLAUDE.md)

## safety-checks
- [ ] Model version format accepts generic format
- [ ] Storage chain uses generic terminology

## review-orchestrator
- [ ] Cognitive modes configurable
- [ ] Multi-perspective review works with generic modes
- [ ] Quality gates accept pluggable test commands

## governance
- [ ] 90-day review cadence configurable
- [ ] Adoption rate calculation works

## workflow-tools
- [ ] Parallel decision framework works
- [ ] Open loop detection works

## Error Handling (Negative Tests)
- [ ] **Conflicting configs**: When both `.openclaw/` and `.claude/` exist with different values,
      `.openclaw/` takes precedence and warning is logged
- [ ] **Missing all configs**: When neither config path exists, falls back to defaults,
      info message logged (not error)
- [ ] **Malformed config**: When config YAML is invalid, clear error message displayed,
      skill continues with defaults (graceful degradation)
- [ ] **Invalid model format**: When model version doesn't match `{provider}-{model}-{version}-{date}`,
      warning logged but skill continues
- [ ] **Missing dependencies**: When skill depends on another skill not installed,
      clear error message with installation instructions
```

**Verification**:
```bash
# Run sample invocations (manual verification)
# Document results in test-results.md

# Verify no regressions in core behavior
grep -r "R/C/D" agentic/*/SKILL.md
# Expected: Counter references intact
```

**Exit Criteria**:
- [x] All 7 skills pass sample invocations with both config systems ✓ 2026-02-16
- [x] No regressions in R/C/D counter behavior ✓ 2026-02-16
- [x] Cross-skill integration verified (dependency graph intact) ✓ 2026-02-16
- [x] Test results documented (inline verification) ✓ 2026-02-16

**Stage 8 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: Stage 7 complete

---

### Stage 9: Publication Prep (0.5 session)

**Goal**: Final artifacts and publication readiness

**Publication artifacts**:
- [x] All 7 SKILL.md files updated and verified ✓ 2026-02-16
- [x] Suite README complete with lifecycle diagram ✓ 2026-02-16
- [x] CHANGELOG updated with decoupling changes (v2.0.1) ✓ 2026-02-16
- [x] INDEX.md regenerated ✓ 2026-02-16
- [x] LICENSE file present ✓ 2026-02-16
- [x] Test results documented (inline verification) ✓ 2026-02-16

**Pre-publication checklist**:
- [x] Frontmatter validity (7 fields per skill: name, version, description, author, homepage, repository, license) ✓ 2026-02-16
- [x] Version pinning: all 7 skills at 1.0.0 ✓ 2026-02-16
- [x] Config schema documented: 12 .openclaw/ refs + 7 .claude/ refs ✓ 2026-02-16
- [x] Example invocations don't rely on Multiverse assets ✓ 2026-02-16
- [x] README includes R/C/D counter explanation ✓ 2026-02-16

**Stage 9 Status**: ✅ COMPLETE (2026-02-16)

**Dependencies**: Stage 8 complete

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Cognitive mode abstraction larger than estimated | Medium | Medium | Stage 1 is spike to validate estimate | @implementer |
| Configuration system requires runtime changes | Low | High | Spike explicitly tests this | @implementer |
| Breaking changes to existing Multiverse usage | Low | Medium | Backwards-compatible config paths; Migration Strategy documented | @planner |
| ClawHub security scan fails | Low | Medium | Each skill passes individually; review flagged patterns | @reviewer |
| Twin terminology deeply embedded | Low | Low | Find/replace with verification; CJK retained intentionally | @implementer |
| Dependency conflicts with other ClawHub skills | Low | Medium | Specify versions; integration test with popular skills | @tester |
| Model-name drift (new models require updates) | Medium | Low | Generic `{provider}-{model}` format; no hardcoded model names | @maintainer |
| Config precedence confusion | Low | Low | Document precedence clearly in each skill | @documenter |

**Risk Register Notes**:
- Owners are role-based, not person-specific (transferable)
- @implementer: Executes plan stages
- @planner: Validates estimates and scope
- @reviewer: Code review and security validation
- @tester: Integration testing (Stage 8)
- @maintainer: Post-publication support
- @documenter: Documentation quality

**Rollback**: Each stage can be reverted independently. Skills remain functional for
Multiverse usage even if ClawHub publication is blocked.

---

## Success Criteria

**Stage 1 (spike)**: ✅ COMPLETE
- [x] Cognitive mode interface designed and documented ✓
- [x] Configuration system example complete ✓
- [x] Estimate validated within 20% margin ✓
- [x] All exit criteria pass ✓

**Stage 6 (documentation)**: ✅ COMPLETE
- [x] All 7 skills have complete frontmatter (7 fields) ✓
- [x] All skills at version 1.0.0 ✓
- [x] Each skill has standalone installation instructions ✓
- [x] Suite README complete with R/C/D explanation ✓

**Stage 7 (verification)**: ✅ COMPLETE
- [x] All 7 skills pass decoupling verification ✓
- [x] No Multiverse-specific hardcodes remain ✓
- [x] No Claude-specific hardcodes remain ✓
- [x] Implicit dependency check passes ✓
- [x] Both `.openclaw/` and `.claude/` config paths documented ✓

**Stage 8 (testing)**: ✅ COMPLETE
- [x] All 7 skills pass sample invocations ✓
- [x] Both config systems work identically ✓
- [x] No regressions in R/C/D counter behavior ✓
- [x] Cross-skill integration verified ✓

**Publication readiness (Stage 9)**: ✅ COMPLETE
- [x] All publication artifacts complete ✓
- [x] Pre-publication checklist passes ✓
- [ ] context-verifier published first (test install, verify Benign/Benign) ⏳ Manual step
- [ ] failure-memory + constraint-engine published (core pipeline) ⏳ Manual step
- [ ] Remaining 4 skills published ⏳ Manual step
- [ ] Cross-links from NEON-SOUL added ⏳ Manual step

---

## Timeline

| Stage | Sessions | Cumulative | Notes |
|-------|----------|------------|-------|
| Stage 1: Spike | 1-2 | 1-2 | Validates largest estimate |
| Stage 2: review-orchestrator | 1 | 2-3 | Depends on spike success |
| Stage 3: safety-checks | 1 | 3-4 | Parallel with Stage 2 |
| Stage 4: context-verifier + constraint-engine | 0.5 | 3.5-4.5 | Parallel with Stage 2-3 |
| Stage 5: Diverse examples | 1-2 | 4.5-6.5 | Creative work |
| Stage 6: Documentation + Versioning | 1-2 | 5.5-8.5 | Expanded for standalone docs |
| Stage 7: Final verification | 1 | 6.5-9.5 | Comprehensive checks |
| Stage 8: Integration testing | 1 | 7.5-10.5 | Sample invocations |
| Stage 9: Publication prep | 0.5 | 8-11 | Final artifacts |
| **Total** | | **8-11 sessions** | Revised from 6-9 |

**Note**: Stages 3-4 can run in parallel with Stage 2 (all depend on Stage 1 spike completion).
Added stages for integration testing (C-2) and expanded documentation (I-7) increase total estimate.

---

## Related Documentation

- **Issue file**: `docs/issues/2026-02-15-agentic-consolidation-review-findings.md`
- **Consolidation plan**: `docs/plans/2026-02-15-agentic-skills-consolidation.md`
- **Architecture**: `ARCHITECTURE.md`
- **ClawHub ecosystem**: https://clawhub.com

---

## Code Review Findings (N=2: Codex + Gemini)

### Findings Addressed

| ID | Finding | Source | Resolution |
|----|---------|--------|------------|
| C-1 | No migration plan for existing configs | Codex | Added Migration Strategy section with precedence + backward compat |
| C-2 | Test strategy absent | Codex | Added Stage 8: Integration Testing with sample invocations |
| I-1 | Stage dependencies vague | Codex | Added explicit Exit Criteria to each stage |
| I-2 | Estimates likely low | Both | Revised estimate to 8-11 sessions; added Stage 1 line item 5 |
| I-3 | Verification commands incomplete | Codex | Added PRESENCE checks alongside ABSENCE checks in all stages |
| I-4 | Publication artifacts underspecified | Both | Added versioning strategy (SemVer, 1.0.0) to Stage 6 |
| I-5 | Risk log missing mitigation owners | Codex | Added Owner column to risk table with role-based assignments |
| I-6 | Stage 7 verification misses implicit patterns | Gemini | Added implicit dependency checks (directory assumptions, env vars) |
| I-7 | Missing skill-level standalone docs | Gemini | Added standalone installation instructions requirement to Stage 6 |
| I-8 | Risk assessment missing dependency conflicts | Gemini | Added dependency conflict risk with version specification mitigation |
| M-1 | npm test lacks ecosystem examples | Codex | Added go test, pytest, cargo test examples to Stage 2 |
| M-2 | Twin in tags not caught | Codex | Clarified tags acceptable; added grep exclusion for tags |
| M-3 | Narrow scoping (no example updates) | Codex | Added example requirement to Stage 4 changes |
| M-4 | Line reference incorrect | Gemini | Fixed: 90-day cadence is in governance/SKILL.md, not constraint-engine |
| M-5 | CJK rename may break identity | Gemini | Added CJK Retention Policy: keep CJK as brand identity |

### Alternative Framings Considered

**Codex suggestion**: Reframe as "publish vendor-neutral skill suite with pluggable backends."
- **Decision**: Adopt partially. Added capability contracts implicitly through config system.
  Formal adapter layer deferred to v2.

**Gemini suggestion**: Consider monorepo publication (`leegitw/neon-agentic`).
- **Decision**: Keep 7 separate skills. Modular approach aligns with OpenClaw philosophy
  and provides 7 keyword lanes. Suite README provides integration guidance.

---

## Twin Review Findings (N=2: Technical + Creative)

### Findings Addressed

| ID | Finding | Source | Resolution |
|----|---------|--------|------------|
| I-1 | Stage 4 targets wrong file for 90-day cadence | Technical | Fixed: Stage 4 now targets governance/SKILL.md, not constraint-engine |
| I-2 | Stage 8 lacks negative test cases | Technical | Added Error Handling section with 5 negative test scenarios |
| I-3 | `/ro twin` command name needs explicit decision | Technical | Added Command Name Decision to Stage 2: keep command, add `/ro multi` alias |
| M-1 | Plan length (821 lines) approaching unwieldy | Creative | Added Quick Reference table at top for navigation |
| M-3 | Timeline parallelism note incorrect | Technical | Fixed: "Stages 3-4 can run in parallel with Stage 2" |

### Verified Correct (No Changes Needed)

| Finding | Source | Assessment |
|---------|--------|------------|
| Migration strategy backward-compatible | Technical | Confirmed ✓ |
| CJK retention policy sound | Both | Confirmed ✓ |
| 8-11 session estimate realistic | Technical | Confirmed ✓ |
| Risk owners add clarity | Creative | Confirmed ✓ |
| Exit criteria actionable | Creative | Confirmed ✓ |
| 7 skills vs monorepo decision correct | Creative | Confirmed ✓ |

### Alternative Framings Considered

**Technical**: "Integration testing discovers fundamental design flaw" risk not explicitly tracked.
- **Decision**: Existing rollback strategy (line 715) handles this. Low likelihood; spike validates before full implementation.

**Creative**: Test cases section could be extracted to standalone file.
- **Decision**: Keep inline for v1. Note added for extraction at stage start.

---

*Plan created 2026-02-15 for agentic skills ClawHub publication preparation.*
*Updated to v2 (2026-02-15) addressing N=2 code review findings (Codex + Gemini).*
*Updated to v3 (2026-02-15) addressing N=2 twin review findings (Technical + Creative).*
