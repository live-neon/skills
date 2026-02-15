---
created: 2026-02-13
type: issue
scope: internal
status: resolved
priority: high
resolved: 2026-02-13
related_observations: []
related_reviews:
  - ../reviews/2026-02-13-agentic-guides-round2-claude-opus-4.1.md
  - ../reviews/2026-02-13-agentic-guides-round2-deepseek-v3.1.md
  - ../reviews/2026-02-13-agentic-guides-round2-deepseek-v3.2.md
  - ../reviews/2026-02-13-agentic-guides-round2-gemini-3-pro.md
  - ../reviews/2026-02-13-agentic-guides-round2-gpt-5.2-pro.md
  - ../reviews/2026-02-13-agentic-guides-round2-qwen3-max.md
  - ../reviews/2026-02-13-agentic-guides-round2-synthesis.md
related_plan: null
supersedes: ../issues/2026-02-13-agentic-guides-round1-review-remediation.md
---

# Issue: Agentic Coding System Guides — Round 2 Review Remediation

## Problem

Six AI agents reviewed the updated Agentic Coding System guides (Architecture v5.1, System Guide v1.3) in Round 2. While consensus remains highly positive (9/10, 8.5/10, 85% production-ready), several precision and consistency issues need addressing before finalization.

**Files to Update:**
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md` (v1.3 → v1.4)
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (v5.1 → v5.2)
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_ADDENDUM.md` (update schemas)

## Impact

- **Terminology confusion**: $N$ overloaded across 3 meanings causes implementation drift
- **Internal contradictions**: Constraint count limits (>50 vs max 10) unreconciled
- **Underspecified components**: Circuit breaker lacks precise state machine
- **Adoption friction**: CLI tooling needed Day 1, not Phase 2

---

## Reviewer Summary

| Reviewer | Rating | Key Focus |
|----------|--------|-----------|
| Gemini 3 Pro | **9/10** | Gold Standard, operational friction risk |
| Claude Opus 4.1 | **8.5/10** | Production-ready, needs adoption roadmap |
| DeepSeek V3.2 | **85%** | Strong foundations, needs locking/recovery |
| Qwen 3 Max | — | Sophisticated, MCP integration potential |
| GPT 5.2 Pro | — | Strong but terminology collisions |
| DeepSeek V3.1 | — | Over-engineered (contrarian view) |

**Consensus**: 5/6 rate production-ready. 1/6 (DeepSeek V3.1) advocates simplification.

---

## Findings by Recurrence (N-count)

### N=6 (Universal Validation — No Action Needed)

| Strength | Status |
|----------|--------|
| Files-as-Memory philosophy | Validated |
| N=3 threshold with human approval | Validated |
| Multi-agent architecture (Scout/Observer/Twins/Historian/Enforcer) | Validated |

---

### N≥4 (Strong Consensus — Must Address)

#### 1. $N$ Terminology Overload
**N=4** (GPT 5.2 Pro, Claude Opus 4.1, Gemini 3 Pro, DeepSeek V3.2)

**Problem:** $N$ used for three different concepts:
1. Failure recurrence loop: $N=1,2,3$ = "this happened X times"
2. Dual-counter design: confirmations $N$ and disconfirmations $D$
3. Confidence formula inputs

**Resolution:**
Rename and formalize counters throughout both documents:
- $R$ = recurrence count (raw occurrences of a failure pattern)
- $C$ = confirmations (human-verified "yes, this matches")
- $D$ = disconfirmations (human-verified "no, false positive")

Update constraint candidate trigger:
- Candidate at $R \geq 3$ AND $C \geq 2$ (example)
- Confidence uses $(C, D)$, not $R$

**Affected Sections:**
- Architecture §9 (N-Count Model)
- Architecture §10 (Constraint Generation)
- Addendum §5 (N-Count Implementation)

---

#### 2. Source Classification / Anti-Echo-Chamber (Enhancement)
**N=5** (GPT 5.2 Pro, Claude Opus 4.1, Gemini 3 Pro, Qwen 3 Max, DeepSeek V3.2)

**Problem:** Already added in v5.1, but implementation details need expansion:
- How does system automatically classify sources?
- What prevents agents from misrepresenting source?
- Add `source_actor` dimension for audits

**Resolution:**
Expand Source Classification section:
```markdown
### Source Actor Tracking
- `actor: {agent_id | human_id | tool_name}`
- `source_type: {self | curated | external}`
```

Add classification heuristics:
- Self: observation created by same agent that made the mistake
- Curated: observation from internal team member or selected external source
- External: observation from independent reviewer or CI/CD failure

---

#### 3. Circuit Breaker Precision
**N=5** (GPT 5.2 Pro, Gemini 3 Pro, DeepSeek V3.2, Claude Opus 4.1, DeepSeek V3.1)

**Problem:** State machine underspecified:
- What counts as a violation (automatic, human-confirmed, or both)?
- Over what time window? (Rolling 30 days? Since last transition?)
- What exactly is "successes ≥ 3"?

**Resolution:**
Add deterministic state machine to Architecture §11:
```markdown
### Circuit Breaker State Machine

**Inputs:**
- `violation_event(timestamp, constraint_id, actor)`
- `success_event(timestamp, constraint_id, actor)`

**Windowing:** Rolling 30-day window OR since last transition (configurable)

**Transitions:**
- CLOSED → OPEN: violations in window ≥ 5
- OPEN → HALF_OPEN: explicit human action `reviewed=true`
- HALF_OPEN → CLOSED: successes since entering HALF_OPEN ≥ 3
- HALF_OPEN → OPEN: violations since entering HALF_OPEN ≥ 1
```

---

### N=3 (Consensus — Should Address)

#### 4. Constraint Count Conflicts
**N=3** (GPT 5.2 Pro, Claude Opus 4.1, Qwen 3 Max)

**Problem:** Architecture says ">50 constraints warn" but Guide says "max 10 active."

**Resolution:**
Define three distinct counts:
- $|C_\text{total}|$ = all constraints ever created
- $|C_\text{active}|$ = constraints not retired (still valid)
- $|C_\text{injected}|$ = constraints injected into CLAUDE.md per run

Thresholds:
- $|C_\text{total}| > 50$ → archive/merge suggestions
- $|C_\text{injected}| \leq 10$ → keep context lean

**Affected Sections:**
- Architecture §10 (warning signs)
- Guide §7 (pitfalls)

---

#### 5. N=3 vs Anti-Echo-Chamber Conflict
**N=3** (GPT 5.2 Pro, Claude Opus 4.1, Gemini 3 Pro)

**Problem:** Two rules conflict:
- "At N=3, generate constraint candidate"
- "Require ≥2 different sources before N=3 constraint generation"

What happens with 3 self-sourced failures?

**Resolution:**
Clarify combined rule:
> "When recurrence $R=3$, generate a **constraint candidate**, but it is **not eligible for activation** until it satisfies: $|\text{unique\_sources}| \geq 2$."

Or alternatively:
> "Only generate a candidate when $R \geq 3$ AND source diversity condition holds."

Document chosen approach in Architecture §9.

---

#### 6. `infer(files)` Not Deterministic
**N=3** (GPT 5.2 Pro, Gemini 3 Pro, Qwen 3 Max)

**Problem:** Contextual injection relies on undefined `infer(files)` function.

**Resolution:**
Make deterministic:
- From directory names (e.g., `/internal/web/` → `web` domain)
- From file extensions (e.g., `*.go` → `go` tag)
- From explicit metadata in file headers

Add to Addendum:
```go
// CANONICAL: File context inference
func inferContext(files []string) []string {
    tags := make(map[string]bool)
    for _, f := range files {
        // Directory-based
        if strings.Contains(f, "/web/") { tags["web"] = true }
        if strings.Contains(f, "/api/") { tags["api"] = true }
        // Extension-based
        if strings.HasSuffix(f, ".go") { tags["go"] = true }
        if strings.HasSuffix(f, ".html") { tags["html"] = true }
    }
    return mapKeys(tags)
}
```

Add unit test corpus: given file sets → expected tags.

---

#### 7. Operational Friction / CLI Tooling
**N=3** (Gemini 3 Pro, Claude Opus 4.1, DeepSeek V3.1)

**Problem:** Manual file creation in Crawl phase is high friction.

**Resolution:**
Shift CLI tooling to Day 1:
```bash
./agent log-failure "Optimized prematurely" --file src/main.go --line 20
```

Update maturity model:
- **Crawl**: Manual + CLI logging (not just manual)
- **Walk**: Semi-automated N-count tracking
- **Run**: Full automation with observer
- **Fly**: Proactive constraint suggestions

Add to Guide §5 (Quick Start):
```markdown
### Day 1 Commands
- `./agent log-failure "<description>" --file <path>` - Record failure
- `./agent list-failures` - View pending observations
- `./agent approve <id>` - Confirm observation
```

---

#### 8. Subagent Instruction Drift
**N=3** (Gemini 3 Pro, Qwen 3 Max, GPT 5.2 Pro)

**Problem:** CLI prompts may diverge from agent definition files.

**Resolution:**
- Template agent definitions into Task prompts programmatically
- Add recommended Task prompt template to Guide §3

```markdown
### Recommended Task Prompt Template

When invoking subagents via Task tool:
1. Include agent definition file content (not just reference)
2. Specify input files explicitly
3. Specify output location explicitly
4. Include hash of agent definition for verification

Example:
```
You are Scout Agent. [Include full scout.md content]
Input: {files}
Output: Write to output/context/{topic}.md
Definition Hash: {sha256(scout.md)}
```
```

---

### N=2 (Should Address)

#### 9. Tie-Breaker Protocol for Twins
**N=2** (Gemini 3 Pro, Claude Opus 4.1)

**Problem:** Guide mentions "Healthy disagreement (60-90%)" but no resolution mechanics.

**Resolution:**
Add tie-breaker matrix to Guide §2:

| Conflict Type | Winner |
|---------------|--------|
| Security | Highest Severity Wins |
| Style/UX | Creative Twin Wins |
| Architecture/Performance | Technical Twin Wins |
| Unclear | Human Maintainer Decides |

---

#### 10. Context Budgeting
**N=2** (Gemini 3 Pro, DeepSeek V3.2)

**Problem:** No guidance on context window limits.

**Resolution:**
Add to Architecture §7 (Memory Layer):
```markdown
### Context Budget Management

**Token Thresholds:**
- CLAUDE.md + ACTIVE.generated.md + Context Summary < 20k tokens
- Performance degrades above this threshold

**Pruning Strategy (Least Recently Triggered):**
1. Track `last_triggered` timestamp per constraint
2. When budget exceeded, evict constraints not triggered in 90 days
3. Evicted constraints remain in archive, not deleted
```

---

#### 11. Privacy/PII Guidance
**N=2** (GPT 5.2 Pro, DeepSeek V3.2)

**Problem:** Failure files may accidentally capture secrets or PII.

**Resolution:**
Add to Architecture §6 (Failure Observation):
```markdown
### Privacy Rules for Failure Files

**Never include:**
- API keys, tokens, credentials
- Customer data or PII
- Internal incident details that aren't public

**Instead:**
- Redact sensitive values: `API_KEY=<redacted>`
- Link to secure incident system for details
- Describe pattern without exposing specifics
```

---

#### 12. Disconfirmation Definition
**N=2** (GPT 5.2 Pro, Gemini 3 Pro)

**Problem:** "Disconfirmation" not clearly defined. What triggers increment of $D$?

**Resolution:**
Add to Architecture §9:
```markdown
### Disconfirmation Triggers

Increment $D$ (disconfirmation counter) when:
1. Human says "this was not the same failure pattern"
2. Constraint prevented an action incorrectly (false positive enforcement)
3. External reviewer disputes the classification

$D$ is monotonic — once incremented, never decremented.
```

---

### N=1 → Verified N=2 (Promoted)

#### 13. File Naming Cross-Reference Drift
**N=1** (GPT 5.2 Pro) → **Verified: Valid (N=2)**

**Problem:** Guide references `AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` but Architecture doc title is "Agentic Coding System Architecture."

**Verification:** Checked files — naming is inconsistent across references.

**Resolution:**
Standardize to:
- `AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md` (with _GUIDE suffix)
- `AGENTIC_CODING_SYSTEM_ARCHITECTURE_ADDENDUM.md`
- `AGENTIC_CODING_SYSTEM_GUIDE.md`

Update all cross-references in both documents.

---

#### 14. Constraint Sharding
**N=1** (Gemini 3 Pro) → **Verified: Valid (N=2)**

**Problem:** All active constraints in single `ACTIVE.generated.md`. At N>100 constraints, context window bloat.

**Verification:** Valid scaling concern. DeepSeek V3.2 also mentioned contextual filtering.

**Resolution:**
Implement constraint sharding by domain:
- `active.testing.md`
- `active.security.md`
- `active.performance.md`

Agents load only relevant shards based on `infer(files)` context.

---

#### 15. Glossary of Terms
**N=1** (GPT 5.2 Pro) → **Verified: Valid (N=2)**

**Problem:** Terms used inconsistently: observation, failure, constraint, candidate, active, injected, violation, success.

**Verification:** Multiple reviewers noted terminology issues.

**Resolution:**
Add glossary to Architecture §1 or Appendix:

| Term | Definition |
|------|------------|
| **Observation** | Raw data about an event (not yet classified) |
| **Failure** | Confirmed negative pattern (observation that recurred) |
| **Constraint** | Rule derived from failure pattern |
| **Candidate** | Proposed constraint awaiting human approval |
| **Active** | Approved constraint, not retired |
| **Injected** | Active constraint loaded into agent context |
| **Violation** | Agent action that conflicts with active constraint |
| **Success** | Agent action that complies with constraint |

---

#### 16. Agent Blind Spots Documentation
**N=1** (Gemini 3 Pro) → **Verified: Valid (N=2)**

**Problem:** No documentation of what agents cannot observe.

**Verification:** Valid — managing expectations is important.

**Resolution:**
Add "Known Limitations" to each agent definition in Guide §3:

```markdown
### Scout Agent Limitations
- Cannot read binary files or images
- Cannot execute code to observe runtime behavior
- Cannot access external URLs without WebFetch tool
- Context limited to files explicitly loaded
```

---

### N=1 (Single Reviewer — Lower Priority)

#### 17. Adoption Roadmap with Weekly Milestones
**N=1** (Claude Opus 4.1)

Add specific week-by-week adoption checklist with success metrics.

**Status:** Valid enhancement, lower priority. Consider for v2.0.

---

#### 18. MCP Integration as Constraint Server
**N=1** (Qwen 3 Max)

Implement constraints as MCP tools for dynamic loading.

**Status:** Valid architecture option, lower priority. Consider for Phase 3.

---

#### 19. Knowledge Graph Hybrid Storage
**N=1** (DeepSeek V3.2)

Add Neo4j or similar for relationship tracking between failures.

**Status:** Valid for scale, lower priority. Consider when >1000 observations.

---

#### 20. Ripgrep-Based Memory Alternative
**N=1** (DeepSeek V3.1 — Contrarian)

Replace markdown memory with session JSONL + ripgrep.

**Status:** Conflicts with files-as-memory philosophy. Document as trade-off, don't implement.

**Resolution:**
Add to Architecture §7:
```markdown
### Alternative: Session-Based Memory

Some systems use JSONL session logs with ripgrep for recall:
```bash
rg -o ".{0,60}authentication.{0,60}" session.jsonl | head -20
```

**Trade-off:** Lower friction but less human-readable. This architecture
prioritizes debuggability over operational simplicity.
```

---

## Resolution

All items addressed in v5.2 (Architecture Guide) and v1.4 (System Guide).

### Phase 1: Critical Terminology & Conflicts ✅
- [x] #1: Renamed $N$ to $R$/$C$/$D$ throughout both documents + Addendum
- [x] #4: Defined constraint count tiers (total/active/injected) in Glossary
- [x] #5: Reconciled R=3 generation with source diversity requirement
- [x] #13: Standardized file naming cross-references

### Phase 2: Operational Precision ✅
- [x] #3: Added circuit breaker state machine specification with transitions table
- [x] #6: Defined `infer(files)` as deterministic function with code in Addendum
- [x] #7: Added Day 1 CLI tooling to Quick Start and Maturity Model
- [x] #8: Added Task prompt template for subagents

### Phase 3: Documentation Enhancements ✅
- [x] #2: Expanded Source Classification with actor tracking
- [x] #9: Added tie-breaker protocol for twin conflicts
- [x] #10: Added context budgeting section with token thresholds
- [x] #12: Defined disconfirmation triggers

### Phase 4: Polish ✅
- [x] #11: Added privacy/PII guidance for failure files
- [x] #14: Documented constraint sharding strategy
- [x] #15: Added glossary of terms (observation, failure, constraint, etc.)
- [x] #16: Documented agent blind spots/limitations
- [x] #20: Documented ripgrep alternative as trade-off

### Deferred (v2.0)
- [ ] #17: Adoption roadmap with weekly milestones
- [ ] #18: MCP constraint server integration
- [ ] #19: Knowledge graph hybrid storage

---

## Workaround

Guides are production-usable as-is with these clarifications:
- Treat $N$ as recurrence count in all contexts
- Use 10 as injected constraint limit, 50 as total warning threshold
- Circuit breaker: manual reset for now (no automation)
- CLI logging: create files manually until tooling added

---

## Cross-References

**Source Reviews:**
- `../reviews/2026-02-13-agentic-guides-round2-claude-opus-4.1.md`
- `../reviews/2026-02-13-agentic-guides-round2-deepseek-v3.1.md`
- `../reviews/2026-02-13-agentic-guides-round2-deepseek-v3.2.md`
- `../reviews/2026-02-13-agentic-guides-round2-gemini-3-pro.md`
- `../reviews/2026-02-13-agentic-guides-round2-gpt-5.2-pro.md`
- `../reviews/2026-02-13-agentic-guides-round2-qwen3-max.md`

**Synthesis:**
- `../reviews/2026-02-13-agentic-guides-round2-synthesis.md`

**Affected Files:**
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md`
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md`
- `artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_ADDENDUM.md`

**Previous Round:**
- `../issues/2026-02-13-agentic-guides-round1-review-remediation.md` (resolved)

**Related Projects:**
- `projects/essence-router/../proposals/2026-02-13-agentic-system-forward-port.md` (forward-port proposal)

---

**Maintained collaboratively by twins in Alaska.**
