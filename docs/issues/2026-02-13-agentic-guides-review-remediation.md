---
created: 2026-02-13
type: issue
scope: internal
status: resolved
priority: high
related_observations: []
related_reviews:
  - ../reviews/2026-02-13-agentic-guides-review-deepseek-v3.2.md
  - ../reviews/2026-02-13-agentic-guides-review-deepseek-v3.1.md
  - ../reviews/2026-02-13-agentic-guides-review-qwen3-max.md
  - ../reviews/2026-02-13-agentic-guides-review-claude-opus-4.1.md
  - ../reviews/2026-02-13-agentic-guides-review-gpt-5.2-pro.md
  - ../reviews/2026-02-13-agentic-guides-review-gemini-3-pro.md
  - ../reviews/2026-02-13-agentic-guides-review-synthesis.md
related_plan: null
related_research:
  - projects/essence-router/../plans/2026-02-12-domain-based-architecture.md
---

# Issue: Agentic Coding System Guides — Review Remediation

## Problem

Six external reviewers (DeepSeek v3.2, DeepSeek v3.1, Qwen 3 Max, Claude Opus 4.1, GPT 5.2 Pro, Gemini 3 Pro) evaluated the Agentic Coding System guides. While consensus rating was exceptional (~9.4/10), multiple technical issues and enhancement opportunities were identified.

**Files affected:**
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md` (v1.1)
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v4.2)

## Impact

- **Spec/implementation conflicts** could cause confusion for implementers
- **Merge conflict risk** affects team collaboration
- **Missing governance details** leave operational questions unanswered
- **Scale concerns** are unaddressed for production use

---

## Findings by Priority

### P0: Critical (Must Fix)

#### 1. Spec/Implementation Mismatch on Constraint Approval

**N=3** (GPT 5.2 Pro, Gemini 3 Pro, DeepSeek v3.2)

**Problem:** Architecture Guide Section 17 states "Human review gate before injection" but the code example auto-injects at N=3:
```go
if existing.Status.N == 3 && existing.ConstraintID == "" {
    constraint := o.GenerateConstraint(existing)
    o.InjectConstraint(constraint)  // Auto-injection without approval!
}
```

**Resolution:** Update code example to generate constraint candidate at N=3, require `acknowledged: true` before CLAUDE.md injection. Add `automation constraints approve C001` command pattern.

---

#### 2. Data Model Duplication

**N=2** (GPT 5.2 Pro + verified)

**Problem:** `FailureObservation` struct is defined twice in Architecture Guide with different fields:
- First definition (Section 4): Embedded `Observation`, includes `ConstraintID`
- Second definition (Section 11): Different composition, includes `RootCause`, `Acknowledged`

**Resolution:** Consolidate to single canonical definition. Add `schema_version` to frontmatter for migration support.

---

#### 3. CLAUDE.md Merge Conflict Risk

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Direct modification of CLAUDE.md by automation will cause merge conflicts in team settings with parallel branches.

**Resolution:** Use generated include file with deterministic markers:
```markdown
## Constraints
<!-- BEGIN GENERATED CONSTRAINTS -->
... contents from docs/constraints/ACTIVE.generated.md ...
<!-- END GENERATED CONSTRAINTS -->
```

---

### P1: Important (Should Fix)

#### 4. Circuit Breaker Pattern for Constraints

**N=3** (DeepSeek v3.2, DeepSeek v3.1, Claude Opus 4.1)

**Problem:** Repeated constraint violations can waste resources. No mechanism to pause enforcement after sustained failures.

**Resolution:** Add circuit breaker to constraint system:
- Track violations in time window (e.g., 5 violations in 24 hours)
- Trip breaker → require manual review before resuming enforcement
- States: CLOSED (normal) → OPEN (tripped) → HALF_OPEN (testing)

---

#### 5. Contextual Constraint Injection

**N=2** (Gemini 3 Pro, DeepSeek v3.2)

**Problem:** 52 constraints/year = 2,000-3,000 tokens permanently consumed ("alignment tax"). All constraints injected regardless of relevance to current work.

**Resolution:** Add `FilePattern` or `TopicTag` to Constraint struct. Only inject constraints matching current context (via `git diff` or file list). Use Scout agent to determine active constraints per context.

---

#### 6. Emergency Override Protocol

**N=2** (DeepSeek v3.1, Claude Opus 4.1)

**Problem:** No escape hatch when constraints block critical work.

**Resolution:** Add EmergencyOverride struct:
```go
type EmergencyOverride struct {
    ConstraintID   string
    Reason         string
    ApprovedBy     string        // Minimum 1 steward
    Duration       time.Duration // Max 7 days
    PostIncidentReview bool      // Auto-flag for review
}
```

---

#### 7. Constraint Lifecycle State Machine

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Constraint lifecycle details are incomplete. No clear state machine or governance roles.

**Resolution:** Add "Constraint Governance" section:
- State machine: `draft` → `active` → `retiring` → `retired`
- Roles: maintainer (can approve), reviewer (can dispute)
- Audit log for all transitions

---

#### 8. N-Count vs Disconfirmation Logic Separation

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Stability calculation conflates "event delta" with "count monotonicity":
```go
if history[i].Delta >= 0 { // Treats 0 as "no decrease"
    monotonic++
}
```
Will behave oddly with negative deltas (disconfirmations).

**Resolution:**
- Keep N-count monotonic for confirmations (G-counter style)
- Track disconfirmations in separate counter
- Define stability on confidence time series, not raw event deltas

---

#### 9. Failure Detection False Positive Handling

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Signals like "had to revert" and "wasted time" will misfire (sarcasm, unrelated discussion, "revert" for non-failure reasons).

**Resolution:** Add evidence tier for failures:
- `failure_detect_confidence` (0–1)
- `evidence_links` (commit hashes, PRs, profiler outputs)
- Require stronger evidence before N-count increment toward N=3

---

#### 10. Failure Pattern Matching Brittleness

**N=2** (GPT 5.2 Pro + verified)

**Problem:** `FindSimilar(failure.Pattern, 0.8)` assumes Pattern strings are comparable. String matching is too brittle.

**Resolution:**
- Use stable `failure_slug` taxonomy (human-labeled)
- Detector proposes slug, human confirms for new slugs
- Keep unconfirmed slugs as "unclassified" until reviewed

---

#### 11. Rule vs Lesson vs Guidance Conflation

**N=2** (GPT 5.2 Pro + verified)

**Problem:** `Rule` field is set to `failure.Lesson`. Lessons contain nuance; rules should be crisp and checkable.

**Resolution:** Separate fields:
- `rule`: short, enforceable (e.g., "Profile before optimizing")
- `guidance`: longer, explanatory
- `exceptions`: structured list (formalize existing markdown pattern)

---

#### 12. Performance at Scale Guidance

**N=2** (Claude Opus 4.1, Gemini 3 Pro)

**Problem:** No guidance for 10,000+ observations. What happens to index rebuild times, query performance, archival?

**Resolution:** Add "Scaling Considerations" section:
- Index rebuild time expectations
- Query performance degradation points
- Archival strategies for old observations (e.g., move to `docs/observations/archive/`)
- Sharding approaches if needed

---

#### 13. Enforcer Hook Integration Clarity

**N=2** (Gemini 3 Pro + verified)

**Problem:** Architecture mentions `EnforceHook (Pre-action check)` but doesn't explain how it hooks into Claude. Is it MCP middleware? Git pre-commit hook?

**Resolution:** Clarify implementation approach. Recommendation from Gemini: Implement as MCP middleware wrapping filesystem tools, checking constraints before `fs.write` passes to OS.

---

#### 14. Scout → Constraint Ranking Link

**N=2** (Gemini 3 Pro + verified)

**Problem:** Scout gathers context but lacks ranking logic to fetch relevant failure patterns.

**Resolution:** Add logic layer: "Given Query X, fetch top 5 relevant Failure Patterns" using semantic similarity or tag matching.

---

### P2: Enhancement (Nice to Have)

#### 15. Model Pinning Mode vs ID Mapping

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Guide mixes "mode names" (analyst, operator) with "pinned IDs" (claude-sonnet-4-5-20251022). Unclear how they relate.

**Resolution:** Add convention:
- `mode=analyst` maps to pinned ID in config file (e.g., `automation/models.yaml`)
- Guide references mode; CLI resolves to pinned model ID
- Prevents guide staleness when IDs change

---

#### 16. Soften "97% Fewer Prompts" Claim

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Quantitative claim in Guide Section 5.2 is fragile without measurement logs.

**Resolution:** Soften to "significantly fewer" or add note about measurement source.

---

#### 17. Subagent vs Symlink Autoloading Clarification

**N=2** (GPT 5.2 Pro + verified)

**Problem:** Guide says subagents don't read agent definition files, but symlink autoloading section could read like "agents auto-load specs."

**Resolution:** Add clarifying sentence: "Auto-loading applies to the *main agent runtime*, not Task-spawned subagents."

---

#### 18. Version Changelog Block

**N=2** (GPT 5.2 Pro, Gemini 3 Pro)

**Problem:** Architecture references "V4.1 integrates failure-anchored memory" but doc is v4.2. No changelog to track differences.

**Resolution:** Add changelog section to both guides:
```markdown
## Changelog
- **v4.2** (2026-02-12): Cross-references to System Guide, MP19 addition
- **v4.1** (2025-12-13): Failure-anchored memory integration
- **v4.0** (2025-12-XX): Initial architecture
```

---

#### 19. MCP Server for Memory Access

**N=3** (Gemini 3 Pro, Qwen 3 Max, DeepSeek v3.2)

**Problem:** No programmatic access to memory system from external tools.

**Resolution:** Consider `agentic-memory-mcp` server:
- Tool: `record_failure(pattern, cost)`
- Tool: `check_constraints(action_description)`
- Resource: `memory://constraints/active`

---

#### 20. Context Packet Artifact

**N=2** (GPT 5.2 Pro + verified)

**Problem:** "Same Context" principle (MP2/MP3) lacks concrete auditable artifact.

**Resolution:** Create `output/context/packet.json` containing:
- List of files, hashes, line counts
- Prompt template ID/version
- Timestamp and tool versions

---

#### 21. Constraint Effectiveness Metrics

**N=2** (DeepSeek v3.1 + verified)

**Problem:** No metrics to validate whether constraints are working.

**Resolution:** Add metrics section:
- Violation reduction rate (before/after constraint)
- Time to resolution
- Constraint retirement rate

---

#### 22. Round-Trip Guarantee Test

**N=1** (GPT 5.2 Pro) — Enhancement

**Problem:** Go structs and markdown both claimed as truth. Could conflict.

**Resolution:** Add round-trip test: parse markdown → struct → render markdown → diff should be empty (modulo timestamps).

---

#### 23. .gitignore Examples for Derived Artifacts

**N=1** (Claude Opus 4.1) — Enhancement

**Problem:** No examples of what to gitignore for derived artifacts.

**Resolution:** Add `.gitignore` snippet:
```
# Derived artifacts (regenerable)
automation_data/
output/vectors/
docs/constraints/ACTIVE.generated.md
```

---

#### 24. Positive Constraint Framing (Pink Elephant Problem)

**N=1** (Domain-Based Architecture research) — Enhancement

**Problem:** Constraints phrased negatively ("Don't commit without running tests") may be less effective due to LLM limitations:

1. **Negation processing weakness**: LLMs handle negative instructions poorly (the "Pink Elephant" problem—telling someone "don't think of a pink elephant" makes them think of it)
2. **Embedding clustering**: Vector embeddings cluster on surface patterns, not semantic intent. "Don't commit without tests" embeds near "commit without tests"
3. **Anti-pattern priming**: Negative constraints may actually prime the unwanted behavior during retrieval

**Resolution:** Add constraint phrasing guidance to Architecture Guide Section 17:
- **Positive framing required**: "Always run tests before committing" not "Don't commit without tests"
- **Action-oriented**: Start with verb describing desired behavior
- **Template**: `[ALWAYS/BEFORE/AFTER] [desired action] [context]`

**Source:** Research from `projects/essence-router/../plans/2026-02-12-domain-based-architecture.md` Section 8.4 (Positive Reframing Pattern).

---

## Proposed Solution

### Phase 1: Critical Fixes (Week 1-2)
1. Fix spec/implementation mismatch on constraint approval
2. Consolidate FailureObservation struct definition
3. Implement generated include file for CLAUDE.md constraints

### Phase 2: Important Fixes (Week 3-4)
4. Add circuit breaker pattern
5. Implement contextual constraint injection
6. Add emergency override protocol
7. Define constraint lifecycle state machine
8. Separate N-count from disconfirmation tracking
9. Add failure detection confidence tiers
10. Implement failure slug taxonomy

### Phase 3: Enhancements (Week 5-6)
11. Separate rule/guidance/exceptions fields
12. Add scaling considerations section
13. Clarify enforcer hook integration
14. Add Scout → Constraint ranking
15-24. Documentation and tooling enhancements (includes positive constraint framing)

## Workaround

The guides are usable as-is. The issues are implementation details, not architectural flaws. Teams should:
- Manually approve constraints before injection (don't rely on auto-injection)
- Use separate constraint files to avoid CLAUDE.md conflicts
- Start with manual failure tracking to validate the core thesis

## Resolution

**Resolved**: 2026-02-13

All 24 findings addressed across three phases:

### Phase 1: P0 Critical (Items 1-3)
1. ✅ **Spec/Implementation Mismatch**: Updated code to generate constraint CANDIDATE at N=3, require `acknowledged: true` before injection
2. ✅ **Data Model Duplication**: Consolidated FailureObservation struct, added schema_version, noted canonical definition location
3. ✅ **CLAUDE.md Merge Conflict Risk**: Implemented generated include file pattern with `<!-- BEGIN/END GENERATED CONSTRAINTS -->` markers

### Phase 2: P1 Important (Items 4-14)
4. ✅ **Circuit Breaker Pattern**: Added CircuitBreaker with CLOSED/OPEN/HALF_OPEN states, 5 violations/24h threshold
5. ✅ **Contextual Constraint Injection**: Added FilePatterns and TopicTags to Constraint struct with context matching
6. ✅ **Emergency Override Protocol**: Added EmergencyOverride struct with 7-day max, post-incident review flag
7. ✅ **Constraint Lifecycle State Machine**: Added draft→active→retiring→retired states, governance roles, audit log
8. ✅ **N-Count vs Disconfirmation**: Separated counters (N monotonic, disconfirmations separate), confidence on time series
9. ✅ **Failure Detection Confidence**: Added evidence tiers (Hard/Medium/Soft), require stronger evidence for N=3
10. ✅ **Failure Slug Taxonomy**: Replaced FindSimilar with stable slug taxonomy, human confirmation for new slugs
11. ✅ **Rule/Guidance/Exceptions**: Separated fields in Constraint struct, added positiveFrame() function
12. ✅ **Scaling Considerations**: Added Appendix G with archival strategy, sharding approaches, performance thresholds
13. ✅ **Enforcer Hook Clarity**: Documented integration options (MCP middleware recommended), added hook examples
14. ✅ **Scout → Constraint Ranking**: Added ScoutRanker with relevance scoring (tags, files, semantic, recency)

### Phase 3: P2 Enhancement (Items 15-24)
15. ✅ **Model Pinning Convention**: Added mode-to-ID mapping with models.yaml pattern
16. ✅ **Softened 97% Claim**: Changed to "significantly reducing approval prompts"
17. ✅ **Subagent Autoloading Clarification**: Added note that auto-loading applies to main runtime only
18. ✅ **Version Changelog**: Added changelog to both guides (System Guide v1.2, Architecture Guide v4.3)
19. ✅ **MCP Server Documentation**: Documented in Enforcer Hook section (agentic-memory-mcp)
20. ✅ **Context Packet Artifact**: Added ContextPacket struct and output/context/packet.json spec
21. ✅ **Constraint Effectiveness Metrics**: Added metrics section with reduction rate, dashboard output
22. ✅ **Round-Trip Guarantee Test**: Added test patterns for markdown↔struct consistency
23. ✅ **.gitignore Examples**: Added recommended .gitignore in Appendix A
24. ✅ **Positive Constraint Framing**: Implemented positiveFrame(), added Anti-Pattern warning

**Files Modified**:
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v4.2 → v4.3)
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md` (v1.1 → v1.2)

---

## Cross-References

- **Synthesis**: `../reviews/2026-02-13-agentic-guides-review-synthesis.md`
- **Individual Reviews**: `../reviews/2026-02-13-agentic-guides-review-*.md` (6 files)
- **Guides**:
  - `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md`
  - `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md`
- **Research Sources**:
  - `projects/essence-router/../plans/2026-02-12-domain-based-architecture.md` (Positive Reframing, Item #24)
