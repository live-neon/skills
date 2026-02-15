---
created: 2026-02-13
completed: 2026-02-14
type: plan
status: complete
priority: medium
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-13-agentic-skills-phase2-implementation.md
depends_on:
  - ../plans/2026-02-13-agentic-skills-phase2-implementation.md
related_guides:
  - [multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - ../guides/SEMANTIC_SIMILARITY_GUIDE.md
related_workflows:
  - docs/workflows/twin-review.md
  - docs/workflows/cognitive-review.md
  - docs/workflows/code-review.md
  - docs/workflows/independent-review.md
  - docs/workflows/review.md
reviews:
  - ../reviews/2026-02-13-phase3-plan-codex.md
  - ../reviews/2026-02-13-phase3-plan-gemini.md
  - ../reviews/2026-02-13-phase3-plan-twin-technical.md
  - ../reviews/2026-02-13-phase3-plan-twin-creative.md
---

# Agentic Skills Phase 3: Review & Detection Implementation

<!-- SECTION: cjk-summary -->
**審検層**: Phase 3 implements 10 Review & Detection skills
**Review**: twin-review (双), cognitive-review (認 - Sonnet 4.5 + Opus 4 + Opus 4.1), review-selector (選), staged-quality-gate (門), prompt-normalizer (正), slug-taxonomy (類)
**Detection**: failure-detector (察), topic-tagger (題), evidence-tier (証), effectiveness-metrics (効)
**Flow**: 察→題→証→効 (detect→classify→validate→measure)
<!-- END SECTION: cjk-summary -->

## Summary

### Why This Matters

Phase 2 built the Core Memory layer that transforms failures into constraints. But detecting
failures in the first place—and measuring whether constraints actually work—requires a
separate layer of skills. Without detection, failures go unrecorded. Without metrics,
we can't know if constraints are helping or just adding friction.

Phase 3 builds the **Review & Detection** layer:
- **Review Skills** standardize how AI spawns reviewers (twins, cognitive modes) and ensures
  consistent context across review sessions
- **Detection Skills** identify failure signals from multiple sources and measure constraint
  effectiveness over time

This layer is the sensory system of the agentic memory—it observes, classifies, and measures,
feeding information into the Core Memory skills from Phase 2.

### What We're Building

Implement 10 Review & Detection layer skills. These skills automate review workflows
(currently manual) and provide detection/measurement capabilities that enable the
failure-anchored learning system to be self-improving.

**Specification**: See `../proposals/2026-02-13-agentic-skills-specification.md#phase-3-review--detection-10-skills`

**Phase 2 Results**: See `../implementation/agentic-phase2-results.md`

### How Users Will Interact

**For reviews**:
1. User runs `/review-selector recommend <file>` (or direct `/twin-review`, `/cognitive-review`)
2. System recommends review type based on content, risk level, and topic tags
3. User confirms, skill spawns agents with normalized context (identical prompts)
4. Results collected and presented with findings

**For detection**:
1. Failures detected from signals (test output, user corrections, review findings)
2. `failure-detector` creates candidates with attribution confidence
3. `slug-taxonomy` suggests canonical naming (prevents duplicate observations)
4. `topic-tagger` adds semantic tags
5. Human confirms/disconfirms via observation workflow (C/D counters)

**For metrics**:
1. `effectiveness-metrics` tracks constraint performance automatically
2. User runs `/effectiveness-metrics dashboard` for health overview
3. Alerts surface constraints needing attention (high trips, dormant)

---

## Code Review Findings Addressed

This plan incorporates N=2 external code review findings (Codex + Gemini):

| # | Finding | Severity | Source | Verified | Resolution |
|---|---------|----------|--------|----------|------------|
| 1 | Missing prerequisite gates | Critical | Codex | N=2 ✓ | Added Phase 2 verification gates to Prerequisites |
| 2 | File verification protocol | Critical | Gemini | N=2 ✓ | Added MD5/checksum protocol to twin-review spec |
| 3 | Stage ordering conflict | Important | Codex | N=2 ✓ | Clarified soft dependency, updated parallelization |
| 4 | Workflow mandates incomplete | Important | Both | N=2 ✓ | Added read-only, parallel, same-prompt requirements |
| 5 | MCE threshold inconsistency | Important | Codex | N=2 ✓ | Added threshold table (200 code, 300 docs) |
| 6 | RG-6 unresolved | Important | Both | N=2 ✓ | Selected Option B, added entry/exit criteria |
| 7 | Test coverage thin | Important | Both | N=2 ✓ | Added Scenarios 6 and 7 |
| 8 | Forward dependency | Important | Both | N=2 ✓ | Documented limitation, added data source mapping |
| 9 | Model naming unclear | Important | Gemini | N=2 ✓ | Added workflow name mapping (Opus 3 = Sonnet 4.5) |
| 10 | Data sources unclear | Minor | Codex | N=2 ✓ | Added explicit data source mapping table |
| 11 | Security criteria implicit | Minor | Gemini | N=2 ✓ | Added topic-tagger integration note |

**N=1 Verification**: All N=1 findings verified to N=2 through direct file inspection:
- Finding 1: Verified against spec lines 511-512, 520 (`algorithm:hash`, behavioral tests)
- Finding 5: Verified against twin-review.md lines 155, 194, 807 (≤200 lines MCE)
- Finding 9: Verified against cognitive-review.md line 77 ("Opus 3 (Sonnet 4.5)")

**Reviews**: `../reviews/2026-02-13-phase3-plan-codex.md`, `../reviews/2026-02-13-phase3-plan-gemini.md`

---

## Twin Review Findings Addressed

This plan incorporates N=2 internal twin review findings (Technical + Creative):

| # | Finding | Severity | Source | Verified | Resolution |
|---|---------|----------|--------|----------|------------|
| 1 | Event format specification missing | Important | Technical | N=2 ✓ | Added event schema reference after Data Sources table |
| 2 | Semantic classification ref missing for slug-taxonomy | Important | Technical | N=2 ✓ | Added SEMANTIC_SIMILARITY_GUIDE.md reference |
| 3 | RG-6 acceptance criteria inconsistency | Important | Technical | N=2 ✓ | Aligned phrasing between Stage 5 and Verification Gate |
| 4 | "Opus 3" naming confusion in CJK summary | Important | Creative | N=2 ✓ | Updated to "Sonnet 4.5 + Opus 4 + Opus 4.1" |
| 5 | Timeline estimates may create false confidence | Important | Creative | N=2 ✓ | Added Timeline Risk Factors section |
| 6 | staged-quality-gate missing philosophy | Important | Creative | N=2 ✓ | Enhanced "Problem Being Solved" with Proportionality principle |
| 7 | Missing user journey for first-time users | Important | Creative | N=2 ✓ | Added "How Users Will Interact" section |

**Minor findings also addressed**:
- Stage 7 timeline updated to reflect 7 scenarios (was 5)
- Workflow feedback clarification added (skill invocation vs human-driven)
- Diagnostic commands added to troubleshooting guide
- Concrete command examples added (prompt-normalizer, slug-taxonomy)
- Data flow diagram includes uncertain attribution path
- Parallelization table integrates soft dependency notation

**N=2 Verification**: All findings verified through cross-review inspection:
- Finding 2: Verified topic-tagger (line 630) and failure-detector (line 750) both reference SEMANTIC_SIMILARITY_GUIDE.md
- Finding 3: Verified RG-6 phrasing now consistent between Stage 5 acceptance and Verification Gate
- Finding 4: Verified cognitive-review.md line 77 uses "Opus 3 (Sonnet 4.5)" - CJK summary now matches

**Reviews**: `../reviews/2026-02-13-phase3-plan-twin-technical.md`, `../reviews/2026-02-13-phase3-plan-twin-creative.md`

---

## Prerequisites

### Phase 2 Completion (Specification Gates)

From `../proposals/2026-02-13-agentic-skills-specification.md` lines 516-522:

- [ ] All 14 core skills complete (5 Phase 1 + 9 Phase 2)
- [ ] `algorithm:hash` format implemented in file-verifier
- [ ] Behavioral tests implemented (stubs at `tests/e2e/skill-behavior.test.ts`)
- [ ] Integration test: failure→R=3+eligibility→constraint flow works
- [ ] Integration test: circuit-breaker trips at 5 violations in 30d
- [ ] ARCHITECTURE.md Core Memory layer documented
- [ ] Phase 2 results reviewed and approved

### Integration Verification

- [ ] All Phase 2 integration tests pass (5 scenarios)
- [ ] `npm test` passes with no regressions

**Gate**: Stage 1 MUST NOT begin until all prerequisites are checked. Owner: Human twin.

---

## Research Gates (Phase 3 Blockers)

**Reference**: `../proposals/2026-02-13-agentic-skills-specification.md#research-gates`

Phase 3 has 1 research gate:

| ID | Topic | Status | Affects Stage | Risk if Unresolved |
|----|-------|--------|---------------|-------------------|
| RG-6 | Failure attribution accuracy | ⚠️ PARTIAL | Stage 5 | Failures may be attributed to wrong causes |

### RG-6: Failure Attribution Accuracy

**Current state**: System assumes failures are clearly attributable. Gemini review flagged this.

**Partial research**: See `projects/live-neon/neon-soul/docs/research/wisdom-synthesis-patterns.md`
for two-dimensional evidence classification (source × stance). This provides foundation but
doesn't address multi-causal failures.

**Research needed**:
- Attribution accuracy in complex AI systems
- Multi-causal failure handling (partial attribution)
- Ambiguous failure classification strategies
- Academic: Root cause analysis in complex systems

**Output**: `neon-soul/docs/research/failure-attribution-accuracy.md`

**Acceptance**: Attribution confidence scoring system OR "uncertain attribution" flag design.

### Resolution Options

**Option A: Research Sprint First** (recommended for production)
- Complete RG-6 research before Stage 5 (failure-detector)
- Estimated: 1 day additional
- Output: 1 new research file

**Option B: Provisional Implementation** (recommended for iteration) ← **DEFAULT**
- Proceed with ⚠️ PARTIAL status
- Flag failure-detector as provisional in results
- Implement simple confidence scoring (0.0-1.0) without calibration research
- Create follow-up task for research validation

**Option C: Defer Complex Attribution** (minimal scope)
- Implement failure-detector with single-cause attribution only
- Add `attribution_uncertain: true` flag for ambiguous cases
- Document limitation in SKILL.md

**Recommendation** (N=2 code review): Option B is the default recommendation for Phase 3.
Unlike Phase 2 which had 4 research gates requiring a sprint, Phase 3 has only 1 gate.
Provisional implementation allows Phase 3 to proceed with RG-6 validation as a follow-up task.

### Research Gate Acceptance

- [x] **Research approach selected**: **Option B - Provisional Implementation**
- [ ] **Risk acceptance documented**: failure-detector marked provisional in results
- [ ] **Follow-up tasks created**: Research task for `failure-attribution-accuracy.md`

**Entry Criteria for Provisional Mode**:
- Document assumption: "Single-cause attribution with confidence scoring"
- Add `attribution_method: provisional_single_cause` to failure-detector output
- Flag multi-causal failures with `uncertain: true`

**Exit Criteria for Provisional Mode**:
- RG-6 research complete (`failure-attribution-accuracy.md` created)
- failure-detector updated with calibrated thresholds
- Integration test added for multi-causal attribution

---

## Skills to Implement

### Review Skills (6)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| twin-review | Review | Spawn twin reviewers (technical + creative) | context-packet | review-selector |
| cognitive-review | Review | Spawn cognitive modes (Opus 3/4/4.1 analysis) | context-packet | review-selector |
| review-selector | Review | Choose review type based on context | twin-review, cognitive-review | Workflow skills |
| staged-quality-gate | Review | Incremental quality gates per stage | constraint-enforcer | CI/CD integration |
| prompt-normalizer | Review | Ensure identical context across reviewers | context-packet | twin-review, cognitive-review |
| slug-taxonomy | Review | Manage failure slug naming conventions | failure-tracker | observation-recorder |

### Detection Skills (4)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| failure-detector | Detection | Multi-signal failure detection | context-packet | failure-tracker |
| topic-tagger | Detection | Infer topic tags from paths/content | context-packet | memory-search |
| evidence-tier | Detection | Classify evidence strength (N=1 vs N≥3) | observation-recorder | constraint-generator |
| effectiveness-metrics | Detection | Track constraint effectiveness | circuit-breaker, constraint-lifecycle | governance-state (Phase 4) |

**Data Flow**:
```
failure-detector ──► failure-tracker ──► constraint-generator
       │                    │
       │                    └── (uncertain: true) ──► human_review_required
       ↓
 topic-tagger ──► memory-search
       ↓
 evidence-tier ──► constraint-generator (eligibility boost)
       ↓
effectiveness-metrics ──► governance-state (Phase 4)

twin-review ──► review-selector ──► context output
cognitive-review ──┘
       ↑
prompt-normalizer (ensures identical input)
```

---

## Stage 1: Prompt Normalization (prompt-normalizer, slug-taxonomy)

**Goal**: Foundational skills for consistent context and naming.

### 1A: prompt-normalizer Skill

**Location**: `projects/live-neon/skills/agentic/review/prompt-normalizer/SKILL.md`

Ensure identical context is provided to all reviewers in a multi-reviewer session.
Critical for valid N≥2 reviews where reviewers must see exactly the same input.

**Problem Being Solved**:
When spawning twin reviewers or cognitive modes, each gets its own context window.
If context differs (different file versions, different ordering, missing files), the
reviews aren't truly independent—they're reviewing different things.

**Specification**:
- **Input**: List of files/context to normalize
- **Output**: Frozen context packet with checksums

**Context Normalization Rules**:
1. **File ordering**: Alphabetical by path (deterministic)
2. **File content**: Hash-verified at time of normalization
3. **System prompts**: Stripped of session-specific details (timestamps, random seeds)
4. **Token budget**: Identical allocation across all reviewers

**Commands**:
```
/prompt-normalizer create <file-list>           # Create normalized packet
/prompt-normalizer verify <packet-id>           # Verify all reviewers got same input
/prompt-normalizer diff <packet-a> <packet-b>   # Show differences between packets
```

**Example**:
```
/prompt-normalizer create "src/git/push.ts, tests/push.test.ts"
→ Created packet norm-2026-02-13-001 (2 files, 3,500 tokens)
```

**Output Format**:
```json
{
  "packet_id": "norm-2026-02-13-001",
  "created": "2026-02-13T10:00:00Z",
  "files": [
    {"path": "src/git/push.ts", "hash": "sha256:abc...", "lines": 150},
    {"path": "tests/push.test.ts", "hash": "sha256:def...", "lines": 200}
  ],
  "total_tokens": 3500,
  "system_prompt_hash": "sha256:xyz...",
  "reviewers": ["twin-technical", "twin-creative"]
}
```

**Integration**:
- **Layer**: Review
- **Depends on**: context-packet (for hashing)
- **Used by**: twin-review, cognitive-review

### 1B: slug-taxonomy Skill

**Location**: `projects/live-neon/skills/agentic/review/slug-taxonomy/SKILL.md`

Manage failure slug naming conventions for consistent observation identification.

**Problem Being Solved**:
When failure-tracker records failures, it needs consistent slug naming. Without a
taxonomy, the same failure could be recorded as `git-force-push-issue`,
`force-push-without-confirmation`, and `git-safety-force-push`—three separate
observations for one pattern.

**Specification**:
- **Input**: Failure description
- **Output**: Canonical slug + category + suggested existing matches

**Taxonomy Categories**:
| Category | Prefix | Examples |
|----------|--------|----------|
| Git operations | `git-` | `git-force-push`, `git-unsafe-rebase` |
| Testing | `test-` | `test-skipped`, `test-flaky-ignored` |
| Workflow | `workflow-` | `workflow-plan-skipped`, `workflow-approval-bypassed` |
| Security | `security-` | `security-env-exposed`, `security-key-hardcoded` |
| Documentation | `docs-` | `docs-not-updated`, `docs-stale-reference` |
| Code quality | `quality-` | `quality-error-swallowed`, `quality-magic-number` |

**Commands**:
```
/slug-taxonomy suggest "executed force push without confirmation"
/slug-taxonomy list --category git
/slug-taxonomy merge <old-slug> <new-slug>      # Consolidate duplicates
/slug-taxonomy validate <slug>                   # Check format compliance
```

**Example**:
```
/slug-taxonomy suggest "ran git push --force to main without asking"
→ Suggested: git-force-push-without-confirmation
→ Existing match: git-force-push (0.87 similarity) - merge recommended
```

**Semantic Matching**:
Uses LLM semantic similarity to suggest existing slugs when new failure is recorded.
"Force pushed to main" should match existing `git-force-push-without-confirmation`.
**Reference**: `../guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Integration**:
- **Layer**: Review
- **Depends on**: failure-tracker (for existing slugs)
- **Used by**: observation-recorder, failure-detector

### Acceptance Criteria

- [ ] prompt-normalizer creates frozen context packets
- [ ] File ordering is deterministic (alphabetical)
- [ ] Hash verification ensures identical content
- [ ] Verification shows all reviewers received same input
- [ ] slug-taxonomy suggests canonical slugs
- [ ] Category prefixes enforced
- [ ] Semantic matching finds similar existing slugs
- [ ] Merge command consolidates duplicate observations
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 2: Twin Review Automation (twin-review, cognitive-review)

**Goal**: Automate the spawning of review agents.

### 2A: twin-review Skill

**Location**: `projects/live-neon/skills/agentic/review/twin-review/SKILL.md`

Spawn twin reviewers (technical + creative) for N=2 review coverage.

**Existing Workflow Reference**: `docs/workflows/twin-review.md`

This skill automates what is currently a manual workflow. The existing workflow
documents the twin specializations and review patterns.

**Specification**:
- **Input**: Files to review, review type (plan, code, docs)
- **Output**: Spawned agents with normalized context, collected results

**Twin Specializations** (from existing workflow):
| Twin | Focus | Reviews |
|------|-------|---------|
| Technical | Backend, infra, planning, testing, docs accuracy | Architecture, correctness, edge cases |
| Creative | UX, HTMX, forms, visual, docs clarity | Usability, readability, presentation |

**File Verification Protocol** (N=2 code review - CRITICAL):

From `docs/workflows/twin-review.md` lines 129-149, 382-494:

1. **MD5 checksums required**: All files passed to twins MUST include checksums
2. **Verbose file references**: Path + lines + hash + commit + verified date
3. **Verification command**: `md5 <file> | head -c 8` for quick verification
4. **Twin verification**: Each twin MUST verify MD5 matches before reviewing

**Verification Output** (embedded in context):
```
File Manifest (照:file-reference-protocol):
- src/git/push.ts [187 lines] [md5:a1b2c3d4] [main@abc123] [verified 2026-02-13]
- tests/push.test.ts [234 lines] [md5:e5f6g7h8] [main@abc123] [verified 2026-02-13]
```

**Twin Agent Requirement**:
Before reviewing, each twin MUST output:
```
Verifying file checksums...
✓ src/git/push.ts: md5:a1b2c3d4 (matches)
✓ tests/push.test.ts: md5:e5f6g7h8 (matches)
Proceeding with review.
```

If checksum mismatch: STOP review, report error, request re-normalization.

**Workflow Mandates** (N=2 code review - IMPORTANT):

| Mandate | Source | Enforcement |
|---------|--------|-------------|
| Read-only mode | review.md:28-42 | Twins MUST NOT modify files under review |
| Parallel invocation | twin-review.md:21-49 | Twins MUST spawn in parallel, not sequential |
| Same Prompt Principle | cognitive-review.md:58-68 | Identical prompts to all reviewers |

**Feedback Loop**: Skill invocation does NOT trigger workflow feedback updates (BEFORE/AFTER sections). Feedback loop is for human-driven workflow invocations per `docs/workflows/twin-review.md`.

**Commands**:
```
/twin-review <file-or-plan>                     # Review with both twins
/twin-review <file> --twin technical            # Single twin
/twin-review <plan> --type plan                 # Plan-specific review
/twin-review --collect <session-id>             # Collect spawned results
```

**Output Format**:
```
TWIN REVIEW: docs/plans/example-plan.md
─────────────────────────────────────

Context Normalized: norm-2026-02-13-001
Files: 3 (1,250 tokens)

Spawning reviewers...
  ✓ twin-technical (agent abc123)
  ✓ twin-creative (agent def456)

Results will be collected at:
  /twin-review --collect abc123,def456
```

**Integration**:
- **Layer**: Review
- **Depends on**: prompt-normalizer, context-packet
- **Used by**: review-selector, workflow skills

### 2B: cognitive-review Skill

**Location**: `projects/live-neon/skills/agentic/review/cognitive-review/SKILL.md`

Spawn cognitive modes for specialized analysis (N=3 internal review).

**Existing Workflow Reference**: `docs/workflows/cognitive-review.md`

**Specification**:
- **Input**: Files to review, analysis type
- **Output**: Spawned cognitive agents with collected results

**Cognitive Modes** (N=2 code review - model naming clarification):

| Mode | Model ID | Workflow Name | Perspective |
|------|----------|---------------|-------------|
| Analyst | claude-opus-4 | Opus 4 | "Here's what conflicts" - contradiction detection |
| Transformer | claude-opus-4-1 | Opus 4.1 | "Here's how to restructure" - architecture improvement |
| Operator | claude-sonnet-4-5 | Sonnet 4.5 (also called "Opus 3" in some docs) | "Here's how to implement" - practical execution |

**Note**: The workflow document `cognitive-review.md` uses "Opus 3" to refer to Sonnet 4.5 in some contexts. These are equivalent.

**Commands**:
```
/cognitive-review <file-or-plan>                # All 3 modes
/cognitive-review <file> --mode analyst         # Single mode
/cognitive-review --collect <session-id>        # Collect results
```

**Integration**:
- **Layer**: Review
- **Depends on**: prompt-normalizer, context-packet
- **Used by**: review-selector, workflow skills

### Acceptance Criteria

**twin-review**:
- [ ] Spawns both twin agents in parallel (not sequential)
- [ ] Context normalized before spawning (prompt-normalizer integration)
- [ ] File verification protocol enforced (MD5 checksums in manifest)
- [ ] Each twin verifies checksums before reviewing
- [ ] Read-only mode enforced (twins cannot modify files)
- [ ] Results collectable after completion
- [ ] Review type affects prompt (plan vs code vs docs)

**cognitive-review**:
- [ ] Spawns all 3 modes with identical prompts (Same Prompt Principle)
- [ ] Modes use correct model variants (Opus 4, Opus 4.1, Sonnet 4.5)
- [ ] Results aggregated with source attribution
- [ ] Read-only mode enforced

**Both**:
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 3: Review Orchestration (review-selector, staged-quality-gate)

**Goal**: Intelligent review type selection and incremental quality gates.

### 3A: review-selector Skill

**Location**: `projects/live-neon/skills/agentic/review/review-selector/SKILL.md`

Choose appropriate review type based on context, file types, and risk level.

**Existing Workflow Reference**: `docs/workflows/review.md`

**Problem Being Solved**:
Users shouldn't need to remember which review type to use. The system should
recommend based on what's being reviewed.

**Selection Criteria**:
| Context | Recommended Review | Rationale |
|---------|-------------------|-----------|
| Implementation plan | twin-review | Twins catch different plan issues |
| Architecture change | cognitive-review | Needs conflict + restructure analysis |
| Simple bug fix | code-review (Codex/Gemini) | External validation, fast |
| Critical security change | independent-review (N=5) | Maximum coverage |
| Documentation update | twin-creative only | Focus on clarity |

**Commands**:
```
/review-selector recommend <file>               # Get recommendation
/review-selector recommend <file> --risk high   # Override risk level
/review-selector execute <file>                 # Auto-execute recommended
```

**Output Format**:
```
REVIEW RECOMMENDATION
────────────────────

File: docs/plans/security-migration.md
Type: Implementation Plan
Risk: High (security-related)

Recommended: independent-review (N=5)
  - 3 cognitive modes (internal)
  - 2 external validators (Codex + Gemini)

Rationale:
  - Security-related content detected
  - Plan type benefits from diverse perspectives
  - High-risk warrants maximum review coverage

Execute? /review-selector execute docs/plans/security-migration.md
```

**Security Detection** (N=2 code review - explicit criteria):
Security-related content detection uses `topic-tagger` semantic classification (NOT pattern matching).
The tag `security` with confidence ≥0.7 triggers elevated review recommendations.

**Integration**:
- **Layer**: Review
- **Depends on**: twin-review, cognitive-review
- **Soft dependency**: topic-tagger (for security detection; can use path-based fallback if unavailable)
- **Used by**: Workflow automation

**Note**: topic-tagger (Stage 4) enhances review-selector but is not a hard blocker. If Stage 3
runs before Stage 4, review-selector uses path-based heuristics (e.g., `**/security/**` paths)
as fallback. Full semantic detection requires topic-tagger.

### 3B: staged-quality-gate Skill

**Location**: `projects/live-neon/skills/agentic/review/staged-quality-gate/SKILL.md`

Incremental quality gates applied per implementation stage.

**Problem Being Solved**:
Large plans have multiple stages. Running full review at the end is wasteful—
issues in Stage 1 compound into Stage 5. Staged gates catch problems early,
reducing total rework. Evidence: Big-bang review = 2x token cost (measured 2025-10-20).
**Philosophy**: Proportionality principle—early detection prevents cascading failures.

**Specification**:
- **Input**: Implementation stage number, files changed
- **Output**: Pass/fail with blocking issues

**Gate Levels**:
| Level | Checks | Blocking |
|-------|--------|----------|
| Quick | Lint, format, tests pass | Yes |
| Standard | + constraint violations, MCE compliance | Yes |
| Thorough | + twin-review for high-risk files | Configurable |

**Commands**:
```
/staged-quality-gate check --stage 3            # Check current stage
/staged-quality-gate configure --level thorough # Set gate level
/staged-quality-gate history                    # Show gate results
```

**MCE Thresholds** (N=2 code review - clarification):

| File Type | MCE Limit | Source |
|-----------|-----------|--------|
| SKILL.md (documentation) | ≤300 lines | docs/standards/mce.md |
| Code files (.ts, .go) | ≤200 lines | twin-review.md:153-156 |
| Test files | ≤200 lines | Same as code |
| Implementation plans | No hard limit | Phase 2 precedent (1,387 lines) |

**Output Format**:
```
QUALITY GATE: Stage 3
────────────────────

Level: Standard

Checks:
  ✓ Tests pass (45/45)
  ✓ Lint clean
  ✓ No constraint violations
  ✗ MCE compliance: 2 files exceed limits
    - src/memory/search.ts (342 lines, limit 200)
    - tests/integration.test.ts (315 lines, limit 200)

Status: BLOCKED

Fix MCE violations before proceeding to Stage 4.
```

**Integration**:
- **Layer**: Review
- **Depends on**: constraint-enforcer
- **Used by**: CI/CD, staged implementation workflows

### Acceptance Criteria

- [ ] review-selector recommends based on file type
- [ ] Risk level affects recommendation
- [ ] Security content triggers higher N-count
- [ ] Execute command invokes recommended review
- [ ] staged-quality-gate checks per-stage
- [ ] MCE compliance checked
- [ ] Constraint violations checked
- [ ] Blocking issues prevent stage progression
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 4: Detection Foundation (topic-tagger, evidence-tier)

**Goal**: Classification and evidence strength detection.

### 4A: topic-tagger Skill

**Location**: `projects/live-neon/skills/agentic/detection/topic-tagger/SKILL.md`

Infer topic tags from file paths, content, and context.

**Classification Method**: LLM-based semantic classification (NOT keyword matching)
**Reference**: `../guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Problem Being Solved**:
Constraints and observations need topic tags for filtering. Manual tagging is
inconsistent. Auto-tagging from file paths and content ensures coverage.

**Specification**:
- **Input**: File path, optional content snippet
- **Output**: Topic tags with confidence scores

**Tag Categories**:
| Category | Example Tags | Detection Signals |
|----------|-------------|-------------------|
| Domain | git, database, auth, api | File path, imports, function names |
| Layer | frontend, backend, infra | Directory structure, file extensions |
| Concern | security, performance, reliability | Content analysis, error patterns |
| Workflow | planning, implementing, reviewing | Context from session state |

**Commands**:
```
/topic-tagger tag src/git/push.ts               # Tag single file
/topic-tagger tag-batch docs/constraints/       # Tag directory
/topic-tagger suggest "force push safety"       # Tags for description
```

**Output Format**:
```
TOPIC TAGS: src/git/push.ts
───────────────────────────

Tags (confidence ≥ 0.7):
  - git (0.95)        # path: src/git/*
  - version-control (0.88)  # semantic: git operations
  - safety (0.72)     # content: force, destructive

Suggested additional:
  - backend (0.65)    # below threshold, consider adding
```

**Integration**:
- **Layer**: Detection
- **Depends on**: context-packet
- **Used by**: memory-search, contextual-injection

### 4B: evidence-tier Skill

**Location**: `projects/live-neon/skills/agentic/detection/evidence-tier/SKILL.md`

Classify evidence strength to prioritize constraint generation.

**Problem Being Solved**:
Not all observations are equal. N=1 is weak, N≥3 is strong. Evidence tier
affects eligibility calculations and review prioritization.

**Tier Definitions**:
| Tier | N-Count | Interpretation | Action |
|------|---------|----------------|--------|
| Weak | N=1 | Single occurrence, may be noise | Monitor |
| Emerging | N=2 | Pattern forming, not yet confirmed | Track closely |
| Strong | N≥3 | Validated pattern | Eligible for constraint |
| Established | N≥5 | Well-established pattern | Priority enforcement |

**Commands**:
```
/evidence-tier classify <observation-slug>      # Get tier
/evidence-tier list --tier strong               # List by tier
/evidence-tier promote <observation-slug>       # Manual N+1
```

**Output Format**:
```
EVIDENCE TIER: git-force-push-without-confirmation
──────────────────────────────────────────────────

Current: STRONG (N=5)
  R: 5 (recurrences)
  C: 3 (confirmations)
  D: 0 (disconfirmations)

Source diversity: 3 files, 2 sessions
User diversity: 2 unique users

Constraint eligible: Yes (R≥3, C≥2, sources≥2, users≥2)
Priority: HIGH (N≥5 established)
```

**Integration**:
- **Layer**: Detection
- **Depends on**: observation-recorder
- **Used by**: constraint-generator, review-selector

### Acceptance Criteria

- [ ] topic-tagger infers tags from paths
- [ ] Content analysis adds semantic tags
- [ ] Confidence scores reflect detection quality
- [ ] Batch tagging works on directories
- [ ] evidence-tier classifies correctly
- [ ] Tier thresholds match specification
- [ ] Source and user diversity tracked
- [ ] Constraint eligibility calculated
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 5: Failure Detection (failure-detector)

**Goal**: Multi-signal failure detection to feed failure-tracker.

**Research Gate RG-6**: Failure attribution accuracy is a research gap. See
`../proposals/2026-02-13-agentic-skills-specification.md#rg-6-failure-attribution-accuracy-phase-3`.
This skill may need provisional status if research incomplete.

### failure-detector Skill

**Location**: `projects/live-neon/skills/agentic/detection/failure-detector/SKILL.md`

Detect failures from multiple signals: test failures, user corrections, review findings.

**Classification Method**: LLM-based semantic classification (NOT pattern matching)
**Reference**: `../guides/SEMANTIC_SIMILARITY_GUIDE.md`

**Problem Being Solved**:
failure-tracker records failures, but something needs to detect them first.
This skill monitors multiple signals and converts them to failure observations.

**Specification**:
- **Input**: Signal type + content (test output, user message, review finding)
- **Output**: Failure candidate with attribution and confidence

**Signal Types**:
| Signal | Source | Detection Method |
|--------|--------|------------------|
| Test failure | CI/test output | Parse test framework output |
| User correction | Chat message | Detect correction language |
| Review finding | Review output | Extract critical/important findings |
| Runtime error | Error logs | Parse error stack traces |
| Constraint violation | circuit-breaker | Automatic (already structured) |

**Commands**:
```
/failure-detector analyze <test-output>         # Analyze test failure
/failure-detector scan-session                  # Scan current session
/failure-detector watch --signal test           # Watch for test failures
```

**Attribution Confidence** (RG-6):
```json
{
  "failure": "Force push executed without confirmation",
  "attribution": {
    "primary_cause": "Missing confirmation step in push.ts",
    "confidence": 0.85,
    "alternative_causes": [
      {"cause": "Unclear user request", "confidence": 0.45}
    ],
    "uncertain": false
  }
}
```

If `uncertain: true`, failure-tracker should flag observation for human review.

**Integration**:
- **Layer**: Detection
- **Depends on**: context-packet, slug-taxonomy
- **Used by**: failure-tracker

### Acceptance Criteria

- [ ] Detects test failures from output
- [ ] Detects user corrections from messages
- [ ] Detects review findings from review output
- [ ] Attribution confidence scoring implemented
- [ ] Uncertain attributions flagged
- [ ] Semantic classification (not pattern matching)
- [ ] Integrates with slug-taxonomy for naming
- [ ] Feeds failure-tracker with candidates
- [ ] Tests added to skill-behavior.test.ts
- [ ] RG-6 status documented: provisional with entry/exit criteria (or resolved)

---

## Stage 6: Effectiveness Metrics (effectiveness-metrics)

**Goal**: Measure constraint system effectiveness over time.

### effectiveness-metrics Skill

**Location**: `projects/live-neon/skills/agentic/detection/effectiveness-metrics/SKILL.md`

Track and report constraint effectiveness metrics.

**Problem Being Solved**:
Without metrics, we can't know if the constraint system is working. Are constraints
preventing failures? Are some constraints never triggered (maybe obsolete)?
Are circuits tripping too often (maybe constraint is too strict)?

**Specification**:
- **Input**: Time range, constraint filter
- **Output**: Effectiveness dashboard

**Metrics Tracked**:
| Metric | Description | Good Range |
|--------|-------------|------------|
| Prevention rate | Violations blocked / (blocked + bypassed) | ≥ 0.90 |
| False positive rate | D / (C + D) | ≤ 0.10 |
| Circuit trip rate | Trips / month per constraint | ≤ 0.5 |
| Override rate | Overrides / violations | ≤ 0.05 |
| Dormant constraint count | Active with 0 violations in 90d | Monitor |

**Commands**:
```
/effectiveness-metrics dashboard                 # Full dashboard
/effectiveness-metrics constraint <id>           # Single constraint
/effectiveness-metrics trend --days 30           # Trend over time
/effectiveness-metrics alerts                    # Constraints needing attention
```

**Output Format**:
```
EFFECTIVENESS DASHBOARD
──────────────────────

Period: Last 30 days
Active constraints: 12
Total violations: 47

Overall Health: GOOD

Metrics:
  Prevention rate: 94.2% (target ≥ 90%) ✓
  False positive rate: 6.1% (target ≤ 10%) ✓
  Circuit trip rate: 0.25/month ✓
  Override rate: 2.1% ✓

Alerts:
  ⚠ git-safety-force-push: 3 trips this month (elevated)
  ⚠ code-review-required: 0 violations in 60d (dormant?)

Top performers:
  - plan-approve-implement: 100% prevention, 0 false positives
  - test-before-commit: 98% prevention, 2% false positives
```

**Integration**:
- **Layer**: Detection
- **Depends on**: circuit-breaker, constraint-lifecycle
- **Used by**: governance-state (Phase 4), ARCHITECTURE.md dashboard

**Forward Dependency Limitation** (N=2 code review):

`effectiveness-metrics` outputs are consumed by `governance-state` (Phase 4), which doesn't
exist yet. This is a known limitation for Phase 3.

**Mitigation Strategy**:
1. **Output format stabilized**: Define metrics output schema now, governance-state will consume later
2. **Stub interface**: Create `governance-state.stub.ts` in tests to verify output format
3. **Dashboard output**: Phase 3 provides standalone dashboard; Phase 4 adds governance actions

**What Phase 3 delivers**:
- Metrics collection and calculation ✓
- Dashboard output (human-readable) ✓
- Alerts for anomalies ✓

**What Phase 4 adds**:
- Automated governance actions (retire dormant constraints)
- Policy-based threshold management
- Historical trend analysis for decisions

**Data Sources** (N=2 code review - explicit mapping):

| Metric | Source Skill | Events Consumed | Windowing |
|--------|--------------|-----------------|-----------|
| Prevention rate | circuit-breaker | `violation_blocked`, `violation_bypassed` | 30-day rolling |
| False positive rate | failure-tracker | `observation.c_count`, `observation.d_count` | All-time per constraint |
| Circuit trip rate | circuit-breaker | `circuit_tripped` | 30-day rolling |
| Override rate | emergency-override | `override_created`, `override_used` | 30-day rolling |
| Dormant count | constraint-lifecycle | `constraint.last_violation_date` | 90-day threshold |

**Event Schema Reference**: See `projects/live-neon/skills/agentic/core/circuit-breaker/events.d.ts` for event format definitions. Phase 2 skills emit events conforming to this schema.

### Acceptance Criteria

- [ ] Tracks all specified metrics
- [ ] Dashboard output accurate
- [ ] Per-constraint drill-down works
- [ ] Trend analysis over time
- [ ] Alerts for anomalies (high trips, dormant)
- [ ] Good/warning/bad thresholds configurable
- [ ] Integrates with circuit-breaker for violation data
- [ ] Integrates with constraint-lifecycle for state data
- [ ] Tests added to skill-behavior.test.ts

---

## Stage 7: Integration Testing

**Goal**: Verify Review & Detection layer works with Core Memory layer.

### Integration Test Scenarios

#### Scenario 1: Review Flow

```
1. prompt-normalizer creates frozen context
2. twin-review spawns both twins with same context
3. Both twins produce reviews
4. Results collected and aggregated
5. Findings feed failure-detector
```

#### Scenario 2: Detection → Failure Flow

```
1. Test failure occurs
2. failure-detector identifies failure signal
3. slug-taxonomy suggests canonical slug
4. topic-tagger adds relevant tags
5. failure-tracker creates observation
6. evidence-tier classifies as WEAK (N=1)
```

#### Scenario 3: Evidence Progression

```
1. Same failure detected 3 times (N=3)
2. evidence-tier upgrades to STRONG
3. constraint-generator triggered
4. effectiveness-metrics starts tracking
```

#### Scenario 4: Review Selection

```
1. User requests review of security plan
2. review-selector detects security topic
3. Recommends independent-review (N=5)
4. User confirms, review executes
5. Findings processed through failure-detector
```

#### Scenario 5: Quality Gate

```
1. Implementation stage 3 complete
2. staged-quality-gate runs checks
3. MCE violation detected
4. Stage blocked until fixed
5. Fix applied, gate passes
6. Stage 4 proceeds
```

#### Scenario 6: Slug Deduplication (N=2 code review)

```
1. failure-detector detects "executed git push --force"
2. slug-taxonomy suggests canonical slug
3. Semantic match finds existing "git-force-push-without-confirmation" (0.92 confidence)
4. User prompted: "Merge with existing observation?"
5. If yes: failure-tracker updates existing observation (R+1)
6. If no: new observation created with suggested slug
7. slug-taxonomy validate confirms format compliance
```

#### Scenario 7: RG-6 Uncertain Attribution (N=2 code review)

```
1. failure-detector analyzes complex failure
2. Multiple potential causes identified
3. No single cause has confidence ≥0.7
4. Attribution marked uncertain: true
5. failure-tracker creates observation with human_review_required flag
6. Observation not eligible for auto-constraint (requires human C)
```

### Tasks

- [x] Create integration test file: `tests/e2e/phase3-integration.test.ts`
- [x] Implement Scenario 1 test (review flow with file verification)
- [x] Implement Scenario 2 test (detection → failure with tags)
- [x] Implement Scenario 3 test (evidence progression to constraint)
- [x] Implement Scenario 4 test (review selection with security detection)
- [x] Implement Scenario 5 test (quality gate levels)
- [x] Implement Scenario 6 test (slug deduplication) ← N=2 code review
- [x] Implement Scenario 7 test (RG-6 uncertain attribution) ← N=2 code review
- [x] Verify all 10 skills load correctly
- [x] Update ARCHITECTURE.md Review & Detection layer
- [x] Document results in `docs/implementation/agentic-phase3-results.md`

### Acceptance Criteria

- [x] All 10 Review & Detection skills have SKILL.md
- [x] All SKILL.md files comply with MCE limits (≤300 lines for docs, ≤200 lines for code)
- [x] All skills load in Claude Code
- [x] Review flow works end-to-end with file verification (Scenario 1)
- [x] Detection feeds failure-tracker with tags (Scenario 2)
- [x] Evidence tiers upgrade correctly (Scenario 3)
- [x] Review selection detects security content (Scenario 4)
- [x] Quality gates block on violations (Scenario 5)
- [x] Slug deduplication prevents duplicate observations (Scenario 6)
- [x] Uncertain attributions flagged for human review (Scenario 7)
- [x] All 7 integration test scenarios pass (21 tests)

---

## Verification Gate

**Phase 3 Complete when**:

### Research Gate Status
- [x] RG-6 (Failure attribution): Provisional with entry/exit criteria documented (or resolved)
- [x] If provisional: follow-up task created for `failure-attribution-accuracy.md` research
  - See: `../issues/2026-02-14-rg6-failure-attribution-research.md`

### Implementation Checklist
- [x] All 24 skills complete (5 Phase 1 + 9 Phase 2 + 10 Phase 3)
- [x] Review skills integrate with existing twin-review workflow
- [x] File verification protocol implemented (MD5 checksums)
- [x] Workflow mandates enforced (read-only, parallel, same-prompt)
- [x] Detection skills integrate with failure-tracker
- [x] Metrics skill produces dashboard output with data source mapping
- [x] Integration tests pass (7 scenarios including slug dedup and uncertain attribution)
- [x] ARCHITECTURE.md Review & Detection layer populated
- [x] Results documented in `docs/implementation/agentic-phase3-results.md`

---

## Timeline

| Stage | Description | Duration | Notes |
|-------|-------------|----------|-------|
| Research | RG-6 (if doing sprint) | 0.5-1 day | Optional, can proceed provisional |
| Stage 1 | prompt-normalizer, slug-taxonomy | 2-3 hours | Foundational |
| Stage 2 | twin-review, cognitive-review | 3-4 hours | Agent spawning |
| Stage 3 | review-selector, staged-quality-gate | 3-4 hours | Orchestration |
| Stage 4 | topic-tagger, evidence-tier | 2-3 hours | Classification |
| Stage 5 | failure-detector | 3-4 hours | RG-6 dependent |
| Stage 6 | effectiveness-metrics | 2-3 hours | Dashboard |
| Stage 7 | Integration testing | 4-5 hours | 7 scenarios |

**Total**: 2-3 days (serial execution)

**Parallelization Opportunities** (N=2 code review - corrected dependencies):

| Parallel Track A | Parallel Track B | Hard Dependency | Soft Dependency |
|------------------|------------------|-----------------|-----------------|
| Stage 1 (normalizer, taxonomy) | - | Must complete first | - |
| Stage 2 (twin, cognitive) | Stage 4 (tagger, tier) | None between tracks | - |
| Stage 3 (selector, gate) | Stage 5 (detector) | Stage 2 for Stage 3 | Stage 4 → Stage 3 ⁱ |
| Stage 6 (metrics) | - | Phase 2 integration | - |
| Stage 7 (integration) | - | All above | - |

ⁱ **Soft dependency**: review-selector works without topic-tagger (uses path-based heuristics for security detection). Full semantic detection available after Stage 4 completes.

**Parallel Timeline**: 1.5-2 days with two implementers
**Serial Timeline**: 2-3 days with single implementer

**Timeline Risk Factors**:
- RG-6 provisional mode may require mid-implementation pivots if attribution proves unreliable
- effectiveness-metrics governance-state stub may need iteration to match Phase 4 expectations
- First deployment of file verification protocol (prompt-normalizer) may surface edge cases
- 10 skills is the largest phase yet (vs. 5 in Phase 1, 9 in Phase 2)

---

## Cross-References

### Specification & Plans
- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Phase 1 Plan**: `../plans/2026-02-13-agentic-skills-phase1-implementation.md`
- **Phase 2 Plan**: `../plans/2026-02-13-agentic-skills-phase2-implementation.md`
- **Phase 2 Results**: `../implementation/agentic-phase2-results.md`

### Existing Workflows (to be automated)
- **Twin Review**: `docs/workflows/twin-review.md`
- **Cognitive Review**: `docs/workflows/cognitive-review.md`
- **Code Review**: `docs/workflows/code-review.md`
- **Independent Review**: `docs/workflows/independent-review.md`
- **Review Hub**: `docs/workflows/review.md`

### Guides
- **Architecture Guide**: `[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v5.2)
- **Semantic Similarity Guide**: `../guides/SEMANTIC_SIMILARITY_GUIDE.md`

### Research
- **RG-6 Partial**: `projects/live-neon/neon-soul/docs/research/wisdom-synthesis-patterns.md`
- **RG-6 Output**: `projects/live-neon/neon-soul/docs/research/failure-attribution-accuracy.md` (to be created)

### Architecture
- **Skills ARCHITECTURE.md**: `projects/live-neon/skills/ARCHITECTURE.md`

---

## Appendix A: Troubleshooting Guide

### Review Skill Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Twins receiving different context | prompt-normalizer verification | Use `/prompt-normalizer verify` before review |
| Review results not collecting | Agent IDs | Verify agent IDs passed to `--collect` |
| Wrong review type recommended | review-selector criteria | Check file type detection, override with `--risk` |

### Detection Skill Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Tags not inferred | File path structure | Ensure paths follow convention (src/domain/file.ts) |
| Evidence tier not upgrading | R/C/D counts | Verify human confirmations recorded |
| Failures not detected | Signal type | Check failure-detector supports signal format |
| Metrics dashboard empty | Data availability | Verify circuit-breaker and lifecycle data exists |

### Integration Issues

| Symptom | Check | Resolution |
|---------|-------|------------|
| Quality gate false blocks | MCE threshold | Verify 300-line limit appropriate for file type |
| Slug duplicates appearing | slug-taxonomy | Use `/slug-taxonomy merge` to consolidate |
| Attribution uncertain too often | RG-6 research | May need better multi-cause handling |

### Diagnostic Commands

| Purpose | Command |
|---------|---------|
| Verify skill loaded | `/skills list --filter phase3` |
| Verify context packet | `/prompt-normalizer verify <packet-id>` |
| Check failure-detector logs | `cat projects/live-neon/skills/logs/failure-detector.log` |
| View recent failures | `/failure-detector scan-session` |
| Check slug taxonomy | `/slug-taxonomy list --all` |
| Metrics dashboard | `/effectiveness-metrics dashboard` |

---

*Plan created 2026-02-13. Implements Phase 3 of Agentic Skills Specification.*
*Updated 2026-02-13: Addressed N=2 code review findings (2 critical, 9 important, 2 minor).*
*Updated 2026-02-13: Addressed N=2 twin review findings (7 important, 6 minor).*
*Updated 2026-02-14: Implementation complete. All 10 skills created, 21 integration tests pass.*
*Total review coverage: N=4 (Codex + Gemini + Technical Twin + Creative Twin).*
*Status: COMPLETE*
