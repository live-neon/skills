---
created: 2026-02-13
type: proposal
status: superseded
superseded_by: ../proposals/2026-02-13-agentic-skills-specification.md
related_guides:
  - artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_GUIDE.md
related_plans:
  - ../plans/2026-02-13-public-skills-repo-migration.md
related_proposals:
  - projects/obviously-not/writer/docs/proposals/2026-02-13-ycombinator-open-methodology-approach.md
brands:
  live-neon: liveneon.ai (open source, AI identity/skills)
  obviously-not: obviouslynot.ai (proprietary, patent tools)
target_repo: projects/live-neon/skills (public submodule → live-neon/skills)
external_skills:
  - projects/live-neon/neon-soul/skills (soul synthesis - product marketing)
  - projects/obviously-not/patent-skills (patent-specific - stays private)
---

# Proposal: OpenClaw Skills for Agentic Coding System

> **SUPERSEDED**: This exploration document has been superseded by
> [`../proposals/2026-02-13-agentic-skills-specification.md`](./2026-02-13-agentic-skills-specification.md).
> Use the specification for implementation. This document is retained for historical context
> and detailed SKILL.md examples.

## Summary

This proposal identifies features from the Agentic Coding System guides that could be implemented as OpenClaw skills, enabling the failure-anchored memory system to work across any OpenClaw-enabled environment.

**Skill Inventory**: 37 skills across 8 tiers + bridges:
- **Tiers 1-4**: Core memory, review orchestration, constraint management, supporting tools (16 skills)
- **Tiers 5-8**: Review selection, detection/classification, governance/audit, model safety (16 skills)
- **Bridge skills**: 5 skills connecting to self-improving-agent and proactive-agent

**Implementation**: 5-phase roadmap from quick wins to advanced governance.

**Foundation**: Builds on two top ClawHub skills:
- [self-improving-agent](https://clawhub.ai/pskoett/self-improving-agent) - Learning capture and categorization
- [proactive-agent](https://clawhub.ai/halthelobster/proactive-agent) - Context persistence, proactivity, security

Our skills add: N-count automation, constraint generation, and consequence-bearing enforcement.

---

## Foundation: self-improving-agent Integration

The [self-improving-agent](https://clawhub.ai/pskoett/self-improving-agent) skill by pskoett is one of ClawHub's most downloaded skills. Our agentic system **extends and enhances** this foundation rather than replacing it.

### Architectural Alignment

| Aspect | self-improving-agent | Our Enhancement |
|--------|---------------------|-----------------|
| **Memory structure** | `.learnings/LEARNINGS.md`, `ERRORS.md` | Same structure, adds `CONSTRAINTS.md` |
| **Entry IDs** | `LRN-YYYYMMDD-XXX`, `ERR-*` | Same format, adds `C001-*` for constraints |
| **Promotion** | Manual to CLAUDE.md, AGENTS.md | **Auto-promotion at N=3** with approval gate |
| **Status tracking** | pending → resolved → promoted | **N=1 → N=2 → N=3 → constraint** |
| **Recurring detection** | Manual "See Also" links | **Automatic N-count threshold** |
| **Hook integration** | `PostToolUse` error detection | Same hooks, adds constraint checking |

### What self-improving-agent Does Well

1. **Learning capture** - Simple format for logging learnings, errors, feature requests
2. **Multi-agent support** - Works with Claude Code, Codex, Copilot, OpenClaw
3. **Error detection hook** - Pattern matching on command output
4. **Skill extraction** - Meta-feature to generate new skills from learnings
5. **Area tagging** - frontend, backend, infra, tests, docs, config

### What Our System Adds

1. **Automatic N-count** - No manual "See Also" linking; system tracks recurrence
2. **Constraint generation at N=3** - Failures automatically become enforceable rules
3. **Confidence scoring** - Statistical methodology (N-weight + diversity + stability)
4. **Circuit breaker** - Per-constraint protection against repeated violations
5. **Contextual injection** - Only load relevant constraints (reduces token overhead)
6. **Emergency override** - Escape hatch with audit trail (max 7 days)
7. **Governance lifecycle** - draft → active → retiring → retired state machine

### Integration Strategy

**Layer 1: Install self-improving-agent** (learning capture)
```bash
clawdhub install self-improving-agent
```

**Layer 2: Add our enhancement skills** (consequence-bearing)
```bash
clawdhub install agentic-n-counter        # Automatic N-count tracking
clawdhub install agentic-constraint-gen   # Generate constraints at N=3
clawdhub install agentic-enforcer         # Check actions against constraints
clawdhub install agentic-circuit-breaker  # Prevent violation loops
```

**Layer 3: Hook integration** (shared hooks)
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [
        {"type": "command", "command": "./skills/self-improvement/scripts/error-detector.sh"},
        {"type": "command", "command": "./skills/agentic-enforcer/scripts/check-constraints.sh"}
      ]
    }]
  }
}
```

---

## Foundation: proactive-agent Integration

The [proactive-agent](https://clawhub.ai/halthelobster/proactive-agent) skill by halthelobster (part of the Hal Stack) solves **context persistence** and **proactivity** - problems our system doesn't address.

### Architectural Alignment

| Aspect | proactive-agent | Our Enhancement |
|--------|-----------------|-----------------|
| **Context persistence** | WAL Protocol, Working Buffer | Integrate with failure detection |
| **Pattern tracking** | "Propose automation at 3+ occurrences" | **Formalize as N-count** |
| **Self-improvement** | VFM Protocol (value scoring) | **Constraint approval gate** |
| **Rule storage** | Manual AGENTS.md updates | **Auto-generate constraints** |
| **Enforcement** | Guidelines only | **Constraint checking + circuit breaker** |

### What proactive-agent Does Well

1. **WAL Protocol** - Write-Ahead Logging captures corrections/decisions BEFORE responding
2. **Working Buffer** - Survives compaction (logs exchanges after 60% context)
3. **Compaction Recovery** - Step-by-step recovery from context loss
4. **Heartbeat System** - Periodic self-improvement checks
5. **Security Hardening** - Skill vetting, injection defense, context leakage prevention
6. **Relentless Resourcefulness** - Try 10 approaches before asking for help
7. **ADL/VFM Protocols** - Safe evolution guardrails

### What Our System Adds to proactive-agent

1. **Formal N-count** - Replace "track in notes, check at 3+" with automatic N-count tracking
2. **Auto-constraint generation** - When N=3, generate constraint (not just AGENTS.md note)
3. **Enforcement** - Check actions against constraints before execution
4. **Circuit breaker** - Prevent repeated constraint violations
5. **Emergency override** - Escape hatch with audit trail

### Key Protocol Synergies

**WAL Protocol + Failure Detection:**
```
proactive-agent WAL triggers:
- ✏️ Corrections: "It's X, not Y"
- 📋 Decisions: "Let's do X"
- 📝 Draft changes

Our failure triggers (same signals!):
- "that was wrong"
- "had to revert"
- "wasted time"

Integration: WAL corrections → failure observation candidates
```

**VFM Protocol ≈ Constraint Approval:**
```
proactive-agent VFM scoring:
- High Frequency: 3x weight
- Failure Reduction: 3x weight
- Threshold: weighted score < 50 → reject

Our constraint approval:
- N≥3 required
- Human acknowledgment gate
- Evidence tier (Hard/Medium/Soft)

Integration: VFM score informs constraint priority
```

**Pattern Recognition Loop → N-count:**
```
proactive-agent: "Track repeated requests in notes/areas/recurring-patterns.md.
                 Propose automation at 3+ occurrences."

Our system: Automatic N-count with threshold actions:
- N=1: Record
- N=2: Pattern forming
- N=3: Generate constraint

Integration: Replace manual tracking with automatic N-count
```

### Combined Architecture

```
~/.openclaw/workspace/
├── SESSION-STATE.md       # proactive-agent WAL target
├── memory/
│   └── working-buffer.md  # proactive-agent danger zone log
├── AGENTS.md              # proactive-agent operating rules
├── SOUL.md                # proactive-agent identity
├── HEARTBEAT.md           # proactive-agent periodic checks
├── .learnings/            # self-improving-agent capture
│   ├── LEARNINGS.md
│   ├── ERRORS.md
│   └── FEATURE_REQUESTS.md
└── .agentic/              # Our consequence system
    ├── failures/          # Failure observations with N-count
    ├── constraints/       # Generated constraints
    └── state/
        ├── circuit-state.json
        └── n-count-index.json  # Links to .learnings/ entries
```

### The Three-Layer Stack

```
Layer 3: proactive-agent
├── Context persistence (WAL, Working Buffer)
├── Proactivity (Heartbeat, Reverse Prompting)
├── Security (Injection defense, skill vetting)
└── Recovery (Compaction recovery protocol)
         │
         ▼ feeds context to
Layer 2: self-improving-agent
├── Learning capture (LEARNINGS.md, ERRORS.md)
├── Categorization (correction, knowledge_gap, best_practice)
├── Area tagging (frontend, backend, infra)
└── Promotion triggers ("See Also" links)
         │
         ▼ triggers
Layer 1: Our Agentic System
├── Automatic N-count (from "See Also" + WAL corrections)
├── Constraint generation (at N=3)
├── Enforcement (constraint checking)
└── Governance (circuit breaker, emergency override)
```

### Integration Points

**Heartbeat → Constraint Review:**
```markdown
# Add to HEARTBEAT.md

## 📊 Constraint Health Check
- [ ] Check `.agentic/constraints/` — any pending approvals?
- [ ] Check circuit breakers — any tripped?
- [ ] Check N-count index — any approaching N=3?
- [ ] Review constraint effectiveness metrics
```

**WAL Protocol → Failure Detection:**
```bash
# Hook: When WAL captures correction, evaluate for failure
if [[ "$WAL_TYPE" == "correction" ]]; then
    agentic evaluate-failure --from-wal "$WAL_ENTRY"
fi
```

**VFM Score → Constraint Priority:**
```go
type ConstraintCandidate struct {
    // ... existing fields
    VFMScore    float64  // From proactive-agent scoring
    Priority    string   // Derived: VFM > 70 = high, > 50 = medium, else low
}
```

---

### Migration from self-improving-agent

Existing `.learnings/` files are compatible:

```bash
# Convert ERRORS.md entries to failure observations with N-count
agentic migrate-learnings .learnings/ERRORS.md --output docs/failures/

# Convert promoted learnings to formal constraints
agentic migrate-learnings .learnings/LEARNINGS.md --status=promoted --output docs/constraints/
```

### Combined Memory Structure

```
~/.openclaw/workspace/
├── AGENTS.md              # Workflows (self-improving-agent)
├── SOUL.md                # Principles (self-improving-agent)
├── TOOLS.md               # Tool gotchas (self-improving-agent)
├── .learnings/            # Learning capture (self-improving-agent)
│   ├── LEARNINGS.md
│   ├── ERRORS.md
│   └── FEATURE_REQUESTS.md
└── .agentic/              # Consequence system (our skills)
    ├── failures/          # Failure observations with N-count
    ├── constraints/       # Generated constraints
    ├── overrides/         # Emergency overrides
    └── state/
        └── circuit-state.json
```

---

## OpenClaw Background

### What is OpenClaw?

OpenClaw is an open-source personal AI agent platform with 68,000+ GitHub stars, created by PSPDFKit founder Peter Steinberger. It functions as a self-hosted agent runtime that connects various platforms to an AI agent capable of executing real-world tasks.

Key characteristics:
- Open source, self-hosted
- Skills marketplace (ClawHub) with 3,000+ skills
- 100,000+ active installations
- Workspace-based file system for persistence

### Skills Format

```yaml
---
name: skill-name
description: Brief description for triggering
tools: Bash, Read, Write  # Required permissions
---

# Skill Instructions

When user asks for X, do Y using Z tool.
```

**Location**: `~/.openclaw/workspace/skills/<skill>/SKILL.md`

**Structure**:
```
~/.openclaw/workspace/skills/<skill>/
├── SKILL.md              # Core configuration (required)
├── scripts/              # Executable code (optional)
└── references/           # Supplementary docs (optional)
```

### Key Constraints

- Skills are stateless between invocations
- Use `references/` folder for persistent state
- Descriptions determine when skills are auto-triggered
- Single-line YAML frontmatter only
- `{baseDir}` variable references skill folder path

---

## Potential Skills from Agentic Coding System

### Tier 1: High Value (Core Memory System)

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **failure-tracker** | Arch 11-12 | Detect failures from reverts, retries, time anomalies. Track N-count. | Medium |
| **constraint-generator** | Arch 12 | At N=3, generate constraint candidate with positive framing | Medium |
| **constraint-enforcer** | Arch 12 | Check proposed actions against active constraints, warn on violations | Low |
| **observation-recorder** | Arch 9-10 | Record patterns with confidence scoring, track N-count | Medium |
| **memory-search** | Arch 8 | Query observations/failures/constraints with relevance ranking | Medium |

### Tier 2: Review Orchestration

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **twin-review** | System 1.3 | Spawn technical + creative reviewers with identical context | High |
| **context-packet** | Arch (Scout) | Generate packet.json with file hashes, line counts for auditing | Low |
| **file-verifier** | System 5.2 | Verify file identity before operations (hash + line count) | Low |
| **cognitive-review** | System 1.4 | Spawn N=3 cognitive modes (operator, analyst, transformer) | High |

### Tier 3: Constraint Management

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **circuit-breaker** | Arch 12 | Track violations, trip after threshold, require manual review | Medium |
| **emergency-override** | Arch 12 | Temporary constraint bypass with audit trail, max 7 days | Low |
| **constraint-lifecycle** | Arch 12 | Manage draft→active→retiring→retired transitions | Medium |
| **contextual-injection** | Arch 12 | Only inject constraints matching current file context | Medium |

### Tier 4: Supporting Tools

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **progressive-loader** | System 4.2 | Load CJK summary → section → full guide progressively | Low |
| **slug-taxonomy** | Arch 11 | Propose failure slugs, request human confirmation for new ones | Low |
| **effectiveness-metrics** | Arch 15 | Calculate constraint effectiveness (violation reduction rate) | Low |

### Tier 5: Review Selection & Quality Gates

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **review-selector** | System 1.6 | Decision tree for choosing review type (twin/code/cognitive/independent) | Low |
| **severity-tagger** | System 1.5 | Tag findings with Critical/Important/Minor severity and action requirements | Low |
| **staged-quality-gate** | System 2.1 | Manage incremental QG-Code gates between implementation stages | Medium |
| **prompt-normalizer** | System 1.2 | Ensure all reviewers receive identical context and prompts | Low |

### Tier 6: Detection & Classification

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **failure-detector** | Arch 11 | Multi-signal failure detection (reverts, retries, markers, time anomalies) | Medium |
| **positive-framer** | Arch 12 | Convert negative rules to positive framing (avoid Pink Elephant problem) | Low |
| **topic-tagger** | Arch 12 | Infer topic tags from file paths for contextual constraint matching | Low |
| **evidence-tier** | Arch 11 | Classify failure evidence as Hard/Medium/Soft with confidence scoring | Low |

### Tier 7: Governance & Audit

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **constraint-reviewer** | Arch 12 | 90-day constraint review gate - retire or keep based on relevance | Low |
| **index-generator** | Arch 8 | Auto-generate INDEX.md dashboards for observations/failures/constraints | Low |
| **round-trip-tester** | Arch 5 | Validate Go struct ↔ Markdown file synchronization | Medium |
| **governance-state** | Arch 12 | Track constraint state machine (draft→active→retiring→retired) | Medium |

### Tier 8: Model & Tool Safety

| Skill | Source | Description | Complexity |
|-------|--------|-------------|------------|
| **model-pinner** | System 5.3 | Pin explicit model versions for reproducibility, warn on unpinned calls | Low |
| **fallback-checker** | System 5.1 | Document and verify fallback strategies for external tools | Low |
| **cache-validator** | System 5.4 | Validate cached API responses for testing, flag stale caches | Low |
| **adoption-monitor** | System 5.5 | Temporal error handling - fail fast during adoption, graceful once established | Low |

---

## Example SKILL.md Implementations

### 1. failure-tracker

```yaml
---
name: failure-tracker
description: Track coding failures from reverts, retries, and time anomalies. Records failure observations with N-count for pattern detection. Use when user mentions mistakes, wasted time, or asks to track a failure.
tools: Bash, Read, Write
---

# Failure Tracker Skill

When user indicates a failure occurred (reverted code, wasted time, made mistake):

1. **Detect failure signals**:
   - Git reverts: Check `git log --oneline -10` for revert commits
   - Explicit statements: "that was wrong", "had to revert", "wasted time"
   - Time anomalies: Task took much longer than expected

2. **Classify with evidence tier**:
   - Hard (0.95): Git revert commit exists
   - Medium (0.7): Explicit statement with context
   - Soft (0.3): Signal words only (may be sarcasm)

3. **Check existing failures** in `{baseDir}/references/failures/`:
   - Find similar pattern by slug
   - If exists: increment N-count, add consequence
   - If new: create failure observation file

4. **At N=3**: Notify user that constraint generation is recommended

Output format: Markdown summary with failure ID, N-count, and consequences.
```

### 2. constraint-enforcer

```yaml
---
name: constraint-enforcer
description: Check proposed code changes against active constraints. Use before making significant modifications to warn about potential violations.
tools: Read, Bash
---

# Constraint Enforcer Skill

Before significant code changes, check against active constraints:

1. **Load active constraints** from `{baseDir}/references/constraints/`

2. **Get current context**:
   - Files being modified (from git diff or user statement)
   - Infer topic tags from file paths

3. **Filter by context**:
   - Match FilePatterns (e.g., "internal/db/*")
   - Match TopicTags (e.g., "database", "performance")

4. **Check for violations**:
   - Compare proposed action against constraint rules
   - Consider exceptions list

5. **Report**:
   - If violation: "⚠️ Constraint C001: Always profile before optimizing"
   - If clear: "✅ No constraint violations detected"

Note: Warn but don't block. Human decides whether to proceed.
```

### 3. observation-recorder

```yaml
---
name: observation-recorder
description: Record successful patterns as observations with confidence scoring and N-count tracking. Use when user notices a pattern worth remembering or asks to record an observation.
tools: Read, Write
---

# Observation Recorder Skill

When user identifies a pattern worth tracking:

1. **Extract pattern details**:
   - What was observed
   - In what context
   - What evidence supports it

2. **Check existing observations** in `{baseDir}/references/observations/`:
   - Search by slug/keywords
   - If exists: increment N-count (existing.N++), add context
   - If new: create with N=1, initial confidence 0.3

3. **Calculate confidence**:
   - N-weight: 1 - 1/(N+1)
   - Diversity: unique contexts count
   - Stability: trend of confirmations

4. **Generate observation file**:
   ```markdown
   ---
   type: observation
   slug: pattern-name
   status: N=X
   confidence: 0.XX
   ---
   # Pattern: [Name]
   ...
   ```

5. **At N=3**: Notify that pattern is confirmed, consider promotion.
```

### 4. context-packet

```yaml
---
name: context-packet
description: Generate auditable context packet with file hashes and line counts. Use before multi-reviewer workflows to ensure identical context.
tools: Bash, Write
---

# Context Packet Generator

Generate `output/context/packet.json` for context verification:

1. **Identify files** in current work context (from git diff or specified list)

2. **For each file**:
   ```bash
   wc -l "$file" | awk '{print $1}'
   shasum -a 256 "$file" | awk '{print $1}'
   ```

3. **Build packet**:
   ```json
   {
     "id": "ctx-YYYY-MM-DD-HHMM",
     "timestamp": "ISO8601",
     "topic": "[from user]",
     "files": [
       {"path": "...", "hash": "...", "line_count": N}
     ],
     "content_hash": "[combined hash]"
   }
   ```

4. **Write to** `output/context/packet.json`

Use this packet to verify all reviewers receive identical context.
```

### 5. memory-search

```yaml
---
name: memory-search
description: Search observations, failures, and constraints by keyword, slug, or semantic similarity. Use when user asks about past patterns, failures, or active constraints.
tools: Bash, Read
---

# Memory Search Skill

When user queries the memory system:

1. **Parse query** for:
   - Keywords (e.g., "optimization", "auth")
   - Type filter (observations, failures, constraints)
   - Status filter (active, N>=3, etc.)

2. **Search directories**:
   - `{baseDir}/references/observations/`
   - `{baseDir}/references/failures/`
   - `{baseDir}/references/constraints/`

3. **Rank results by relevance**:
   - Tag match: +0.4
   - File pattern match: +0.3
   - Keyword in content: +0.2
   - Recency (last 30 days): +0.1

4. **Return top 5 results** with:
   - File path
   - Status/N-count
   - Relevance score
   - Brief summary

Output format: Markdown table sorted by relevance.
```

### 6. circuit-breaker

```yaml
---
name: circuit-breaker
description: Track constraint violations and trip circuit breaker after threshold. Use to check circuit breaker status or manually trip/reset.
tools: Read, Write
---

# Circuit Breaker Skill

Manage constraint circuit breakers:

## Check Status
When user asks about circuit breaker status:
1. Read `{baseDir}/references/constraints/circuit-state.json`
2. Report state for each constraint (CLOSED, OPEN, HALF_OPEN)

## Record Violation
When constraint violation reported:
1. Load violation history from `circuit-state.json`
2. Add timestamped violation
3. Check threshold: 5 violations in 24 hours
4. If exceeded: Trip to OPEN state, notify user

## Manual Controls
- "Trip circuit breaker for C001": Set state to OPEN
- "Reset circuit breaker for C001": Set state to CLOSED, clear history

State file format:
```json
{
  "C001": {
    "state": "CLOSED",
    "violations": [{"timestamp": "...", "context": "..."}],
    "tripped_at": null
  }
}
```
```

### 7. emergency-override

```yaml
---
name: emergency-override
description: Create temporary constraint bypass with audit trail. Max 7 days. Use when constraint blocks critical work.
tools: Read, Write
---

# Emergency Override Skill

Create audited temporary override:

1. **Validate request**:
   - Constraint ID exists
   - Duration <= 7 days
   - Reason provided

2. **Create override file** in `{baseDir}/references/overrides/`:
   ```markdown
   ---
   type: emergency-override
   constraint: C001
   reason: "[user provided]"
   created: YYYY-MM-DDTHH:MM:SSZ
   expires: YYYY-MM-DDTHH:MM:SSZ
   post_incident_review: true
   ---
   ```

3. **Notify**:
   - "⚠️ Override created for C001"
   - "Expires: [date]"
   - "Post-incident review required"

4. **Check expiry** when queried:
   - If expired: Mark revoked, remind about review
   - If active: Report remaining time
```

### 8. review-selector

```yaml
---
name: review-selector
description: Choose the right review type based on validation needs. Use when deciding how to review code, plans, or documentation.
tools: Read
---

# Review Selector Skill

Help user choose the appropriate review type:

## Decision Tree

When user asks "how should I review this?" or needs review guidance:

1. **Check validation needs**:
   - External validation needed? (cross-architecture, external perspectives)
   - What's the stakes level? (routine, important, critical)
   - What's the scope? (single stage, all stages, high-stakes decision)

2. **Apply decision tree**:
   ```
   Per-stage review? → twin-review (N=2 internal, ~$0.20)
   Final/external review? →
     ├── Cross-architecture only → code-review (N=2 external CLI, ~$0.30)
     ├── Perspective diversity → cognitive-review (N=3 internal, ~$0.50)
     └── High-stakes/ADR → independent-review (N=5 full team, ~$1.00)
   ```

3. **Return recommendation** with:
   - Recommended review type
   - Reviewers involved
   - Approximate cost
   - Rationale for choice

## Review Type Summary

| Type | Reviewers | Cost | Use When |
|------|-----------|------|----------|
| twin-review | N=2 twins | ~$0.20 | Per-stage QG-Code |
| code-review | N=2 external | ~$0.30 | Cross-architecture validation |
| cognitive-review | N=3 modes | ~$0.50 | Perspective diversity |
| independent-review | N=5 team | ~$1.00 | High-stakes, ADRs |
```

### 9. severity-tagger

```yaml
---
name: severity-tagger
description: Tag review findings with consistent severity levels. Use when organizing review output or triaging issues.
tools: Read, Write
---

# Severity Tagger Skill

Apply consistent three-tier severity to review findings:

## Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Blocks proceeding | MUST fix before next stage |
| **Important** | Should fix | FIX during implementation |
| **Minor** | Nice to have | SUGGESTION - can defer |

## When user provides findings

1. **Analyze each finding** for impact:
   - Blocks functionality? → Critical
   - Degrades quality? → Important
   - Improves polish? → Minor

2. **Format output**:
   ```markdown
   ### Critical (MUST fix before proceeding)
   - [file:line] [issue description]

   ### Important (FIX during implementation)
   - [file:line] [issue description]

   ### Minor (SUGGESTION - can defer)
   - [file:line] [issue description]
   ```

3. **Provide summary**: "X critical, Y important, Z minor findings"

## Severity Guidelines

- Security vulnerabilities → Always Critical
- Missing tests for new code → Important
- Code style/formatting → Minor
- Logic errors → Critical or Important based on scope
- Documentation gaps → Important or Minor based on complexity
```

### 10. positive-framer

```yaml
---
name: positive-framer
description: Convert negative constraint rules to positive framing. Use when generating constraints to avoid LLM instruction issues.
tools: Read, Write
---

# Positive Framer Skill

Convert negative rules to positive equivalents:

## The Pink Elephant Problem

LLMs struggle with negation. "Don't think of a pink elephant" makes you think of pink elephants. Same with constraints: "Don't optimize without profiling" still anchors on "optimize without profiling."

## Transformation Rules

When user provides a negative rule:

1. **Identify negative pattern**:
   - "don't", "never", "avoid", "shouldn't", "without"

2. **Transform to positive**:
   | Negative | Positive |
   |----------|----------|
   | "Don't commit without tests" | "Always run tests before committing" |
   | "Never optimize without profiling" | "Always profile before optimizing" |
   | "Avoid premature abstraction" | "Wait for N=3 patterns before abstracting" |
   | "Don't modify code you haven't read" | "Always read code before modifying it" |
   | "Never use --no-verify" | "Always let hooks run before committing" |

3. **Output**:
   - Original (negative): [input]
   - Transformed (positive): [output]
   - Rationale: [why the positive version is clearer]

## Validation

After transformation, verify:
- Rule is actionable (tells what TO do)
- No negation words remain
- Meaning is preserved
```

### 11. topic-tagger

```yaml
---
name: topic-tagger
description: Infer topic tags from file paths for contextual constraint matching. Use when filtering constraints by relevance.
tools: Bash, Read
---

# Topic Tagger Skill

Infer topic tags from file paths for contextual matching:

## Tag Inference Rules

When user provides file paths:

1. **Parse paths** and extract topic signals:
   ```
   internal/db/* → database
   internal/auth/* → auth
   internal/api/* → api
   handlers/*.go → api
   *_test.go → testing
   cmd/* → cli
   migrations/* → database, migrations
   docs/* → documentation
   ```

2. **Build tag set** (deduplicated):
   ```json
   {
     "files": ["internal/db/query.go", "internal/db/migrations/001.sql"],
     "tags": ["database", "migrations"]
   }
   ```

3. **Match against constraints**:
   - Load constraints from `{baseDir}/references/constraints/`
   - Filter where `topic_tags` intersects with inferred tags
   - Return relevant constraints only

## Example Output

```markdown
## Inferred Tags for Context
Files: internal/db/query.go, internal/db/migrations/001.sql
Tags: database, migrations

## Matching Constraints
- C003: Always backup before migrations (tags: database, migrations)
- C007: Profile queries before optimization (tags: database, performance)
```
```

### 12. index-generator

```yaml
---
name: index-generator
description: Auto-generate INDEX.md dashboards for observations, failures, or constraints. Use to create navigable summaries.
tools: Bash, Read, Write
---

# Index Generator Skill

Generate INDEX.md dashboards for memory directories:

## When user requests index generation

1. **Scan directory** for markdown files:
   ```bash
   ls {baseDir}/references/observations/*.md
   ls {baseDir}/references/failures/*.md
   ls {baseDir}/references/constraints/*.md
   ```

2. **Extract frontmatter** from each file:
   - Status (N-count)
   - Created/Updated dates
   - Tags/Patterns
   - Related constraints

3. **Generate INDEX.md**:

   For observations:
   ```markdown
   # Observations Index

   Generated: YYYY-MM-DD

   ## By Status
   | Observation | N-Count | Confidence | Last Updated |
   |-------------|---------|------------|--------------|
   | config-as-code | N=5 | 0.85 | 2026-02-10 |
   | auth-retry | N=3 | 0.72 | 2026-02-08 |

   ## Recent (Last 7 Days)
   - [config-as-code](./config-as-code.md) - Updated 2026-02-10
   ```

   For failures:
   ```markdown
   # Failures Index

   ## Pending Constraints (N≥3, not yet generated)
   | Failure | N-Count | Pattern | Action |
   |---------|---------|---------|--------|

   ## Active Tracking
   | Failure | N-Count | Constraint | Status |
   |---------|---------|------------|--------|
   | eager-optimization | N=3 | C001 | Injected |
   ```

4. **Write to** `{baseDir}/references/[type]/INDEX.md`
```

### 13. model-pinner

```yaml
---
name: model-pinner
description: Pin explicit model versions for reproducibility. Use when invoking external AI models via CLI.
tools: Bash
---

# Model Pinner Skill

Ensure model versions are explicitly pinned:

## When user invokes external model

1. **Check for unpinned invocation**:
   ```bash
   # Unpinned (bad)
   codex exec "Review this code"
   gemini "Analyze this"

   # Pinned (good)
   codex exec -m gpt-5.1-codex-max "Review this code"
   gemini -m gemini-2.5-pro "Analyze this"
   ```

2. **If unpinned, warn and suggest**:
   ```
   ⚠️ Unpinned model invocation detected.

   CLI tools may update default models silently.
   For reproducibility, pin explicit version:

   Instead of: codex exec "Review this code"
   Use: codex exec -m gpt-5.1-codex-max "Review this code"
   ```

3. **Track pinning in context**:
   - Record pinned versions used in session
   - Note if model becomes unavailable (404 errors)

## Model Version Reference

| CLI | Current Pinned Version | Flag |
|-----|----------------------|------|
| codex | gpt-5.1-codex-max | -m |
| gemini | gemini-2.5-pro | -m |
| claude | claude-opus-4-5-20251101 | --model |

## Why This Matters

Real failures observed:
- gemini-3-pro-preview → 404 (model deprecated)
- o1-pro → unavailable (capacity issues)

Pinning prevents silent behavior changes.
```

### 14. staged-quality-gate

```yaml
---
name: staged-quality-gate
description: Manage incremental quality gates between implementation stages. Use after completing a development stage.
tools: Read, Write
---

# Staged Quality Gate Skill

Enforce incremental review after each implementation stage:

## Quality Gate Pattern

```
Stage 1 → QG-Code (/twin-review)
Stage 2 → QG-Code (/twin-review)
Stage 3 → QG-Code (/twin-review)
...
All Stages Complete → QG-Final (/code-review)
```

## When user completes a stage

1. **Identify stage completion**:
   - User says "Stage N complete" or "finished stage N"
   - Check for uncommitted changes

2. **Trigger quality gate**:
   ```markdown
   ## Quality Gate: Stage N Complete

   **Recommended**: Run /twin-review before proceeding to Stage N+1

   Evidence: Incremental review catches issues early.
   - Batch review (all stages at end): ~80,000 tokens rework
   - Incremental review (per stage): ~40,000-60,000 tokens
   - **Cost penalty for deferral: ~2x**
   ```

3. **Track gate status** in `{baseDir}/references/state/quality-gates.json`:
   ```json
   {
     "plan": "feature-xyz",
     "gates": {
       "stage-1": {"status": "passed", "review": "twin-review-2026-02-13"},
       "stage-2": {"status": "pending"},
       "final": {"status": "not-started"}
     }
   }
   ```

4. **Block or warn on stage skip**:
   - If user tries to start Stage N+1 without Stage N gate:
   - "⚠️ Stage N quality gate not passed. Run /twin-review first?"
```

### 15. learnings-n-counter (Bridge Skill)

```yaml
---
name: learnings-n-counter
description: Bridge self-improving-agent to consequence system. Monitors .learnings/ files for "See Also" links and converts them to formal N-count tracking. Use when integrating with existing self-improving-agent installations.
tools: Bash, Read, Write
---

# Learnings N-Counter Bridge Skill

Bridge self-improving-agent's informal recurrence tracking to formal N-count:

## Automatic N-Count from "See Also" Links

When scanning `.learnings/` files:

1. **Parse entries** for `See Also:` metadata:
   ```bash
   grep -A1 "See Also:" .learnings/*.md
   ```

2. **Build recurrence graph**:
   ```
   ERR-20260210-001 ← See Also ← ERR-20260212-003
   ERR-20260210-001 ← See Also ← ERR-20260213-007
   # ERR-20260210-001 has N=3 (itself + 2 references)
   ```

3. **Calculate N-count** for each root entry:
   - Count incoming "See Also" links
   - N = 1 + count(references)

4. **Check N=3 threshold**:
   ```markdown
   ## N=3 Threshold Reached

   Entry: ERR-20260210-001 (eager-optimization)
   N-count: 3 (2 related entries)

   Related entries:
   - ERR-20260212-003: "Optimized auth without measuring"
   - ERR-20260213-007: "Added caching prematurely"

   **Action**: Generate constraint candidate?
   - [Yes] → Create `.agentic/constraints/C001-draft.md`
   - [No] → Mark as reviewed, skip constraint
   ```

5. **Sync to failure observations**:
   ```bash
   # Create/update .agentic/failures/ from .learnings/ERRORS.md
   agentic sync-learnings --source .learnings/ERRORS.md
   ```

## Manual N-Count Bump

When user says "this keeps happening" or "recurring issue":

1. Search for similar entries
2. Add "See Also" link if not present
3. Recalculate N-count
4. Trigger N=3 check if threshold reached

## Output Format

```markdown
## Learnings N-Count Summary

| Root Entry | Pattern | N-Count | Status |
|------------|---------|---------|--------|
| ERR-20260210-001 | eager-optimization | N=3 | **THRESHOLD** |
| ERR-20260205-002 | missing-tests | N=2 | tracking |
| LRN-20260208-001 | config-pattern | N=4 | promoted |

### Constraint Candidates (N≥3)
- ERR-20260210-001: "Always profile before optimizing"
```
```

### 16. feature-request-tracker

```yaml
---
name: feature-request-tracker
description: Track feature requests from self-improving-agent's FEATURE_REQUESTS.md. Identifies recurring requests that should become skills or capabilities.
tools: Read, Write
---

# Feature Request Tracker Skill

Track and prioritize feature requests from self-improving-agent:

## Scan Feature Requests

When user asks about feature requests or "what capabilities are missing":

1. **Load** `.learnings/FEATURE_REQUESTS.md`

2. **Parse entries** and extract:
   - Capability requested
   - Frequency (first_time, recurring)
   - Complexity estimate
   - Related features

3. **Group by capability**:
   ```markdown
   ## Feature Request Summary

   ### Recurring Requests (implement these)
   | Capability | Occurrences | Complexity | Action |
   |------------|-------------|------------|--------|
   | Auto-test generation | 3 | medium | Create skill |
   | Diagram generation | 2 | complex | Evaluate |

   ### One-Time Requests
   | Capability | Complexity | User Context |
   |------------|------------|--------------|
   | PDF parsing | medium | Contract review |
   ```

4. **Suggest skill extraction** for recurring (2+) requests:
   ```
   FEAT-20260210-001 appears 3 times. Consider:
   - Extract as new skill: `auto-test-gen`
   - Add to existing skill capabilities
   - Document as known limitation
   ```

## N-Count for Feature Requests

Apply same N-count logic:
- N=1: Log request
- N=2: Pattern forming, evaluate priority
- N=3: **Create skill candidate**

## Skill Candidate Template

At N=3, generate skill scaffold:
```bash
./scripts/extract-skill.sh <capability-name> --from-feature-requests
```
```

### 17. wal-failure-detector (proactive-agent Bridge)

```yaml
---
name: wal-failure-detector
description: Bridge proactive-agent's WAL Protocol to failure detection. Evaluates WAL corrections for failure patterns. Use when integrating with proactive-agent installations.
tools: Read, Write
---

# WAL Failure Detector Bridge Skill

Convert proactive-agent WAL corrections to failure candidates:

## WAL Trigger Types → Failure Signals

| WAL Type | Failure Signal? | Action |
|----------|-----------------|--------|
| ✏️ Correction ("It's X, not Y") | **Yes** | Create failure candidate |
| 📋 Decision ("Let's do X") | No | Skip |
| 📝 Draft changes | Maybe | Check if reverting previous |
| 📍 Proper nouns | No | Skip |
| 🎨 Preferences | No | Skip |

## When WAL Correction Detected

1. **Parse SESSION-STATE.md** for recent WAL entries:
   ```bash
   grep -A3 "Correction:" SESSION-STATE.md | tail -20
   ```

2. **Extract correction pattern**:
   ```
   WAL: "Theme: blue (not red)"
   Pattern: incorrect-assumption
   Context: UI theming
   ```

3. **Check for existing failure**:
   - Search `.agentic/failures/` for similar pattern
   - If found: Increment N-count
   - If not: Create new failure observation

4. **Link to WAL source**:
   ```markdown
   ## Evidence
   - Source: WAL correction
   - SESSION-STATE.md entry: [timestamp]
   - Original assumption: "red theme"
   - Correction: "blue theme"
   ```

## Integration with proactive-agent

Add to HEARTBEAT.md:
```markdown
## 🔍 WAL → Failure Analysis
- [ ] Review SESSION-STATE.md corrections since last heartbeat
- [ ] Run: `agentic evaluate-wal-corrections`
- [ ] Check N-count index for patterns approaching N=3
```
```

### 18. heartbeat-constraint-check (proactive-agent Bridge)

```yaml
---
name: heartbeat-constraint-check
description: Add constraint health checks to proactive-agent's heartbeat system. Monitors constraint status, circuit breakers, and pending approvals.
tools: Read, Write
---

# Heartbeat Constraint Check Bridge Skill

Extend proactive-agent's HEARTBEAT.md with constraint monitoring:

## Add to Heartbeat Checklist

When configuring heartbeats, add this section:

```markdown
## 📊 Constraint Health Check

### Pending Approvals
- [ ] Check `.agentic/constraints/` for `status: draft`
- [ ] List constraints awaiting human approval
- [ ] Alert if any pending > 7 days

### Circuit Breaker Status
- [ ] Read `.agentic/state/circuit-state.json`
- [ ] Report any OPEN or HALF_OPEN circuits
- [ ] Recommend action for tripped breakers

### N-Count Watch
- [ ] Check failures approaching N=3
- [ ] Preview upcoming constraint candidates
- [ ] Estimate token impact of pending constraints

### Effectiveness Metrics
- [ ] Calculate violation rate per constraint
- [ ] Flag constraints with >50% violation rate
- [ ] Recommend retirement for ineffective constraints
```

## Heartbeat Integration Script

```bash
#!/bin/bash
# heartbeat-constraints.sh - Run during proactive-agent heartbeat

echo "## Constraint Health Report"
echo "Generated: $(date -Iseconds)"
echo ""

# Pending approvals
pending=$(find .agentic/constraints -name "*.md" -exec grep -l "status: draft" {} \;)
if [ -n "$pending" ]; then
    echo "### ⚠️ Pending Approvals"
    echo "$pending" | while read f; do
        echo "- $(basename $f .md)"
    done
fi

# Circuit breakers
if [ -f ".agentic/state/circuit-state.json" ]; then
    open_circuits=$(jq -r 'to_entries[] | select(.value.state == "OPEN") | .key' .agentic/state/circuit-state.json)
    if [ -n "$open_circuits" ]; then
        echo "### 🔴 Tripped Circuit Breakers"
        echo "$open_circuits"
    fi
fi

# N-count watch
echo "### 📈 N-Count Status"
find .agentic/failures -name "*.md" -exec grep -H "^status: N=" {} \; | \
    sed 's/.*\/\(.*\)\.md:status: /- \1: /' | sort -t= -k2 -rn | head -5
```

## Proactive Surprise: Constraint Insights

During "Proactive Surprise Check", consider:
- Any constraint patterns that could be automated?
- Recurring violations suggesting systemic issue?
- Constraints that could be relaxed (no violations in 90 days)?
```

### 19. vfm-constraint-scorer (proactive-agent Bridge)

```yaml
---
name: vfm-constraint-scorer
description: Apply proactive-agent's VFM (Value-First Modification) scoring to constraint candidates. Helps prioritize which constraints to approve.
tools: Read, Write
---

# VFM Constraint Scorer Bridge Skill

Apply proactive-agent's VFM Protocol to constraint approval:

## VFM Scoring for Constraints

| Dimension | Weight | Question for Constraints |
|-----------|--------|--------------------------|
| High Frequency | 3x | Will this constraint apply to daily work? |
| Failure Reduction | 3x | Does this prevent a costly mistake? |
| Token Cost | 2x | How many tokens does enforcement add? |
| Maintenance Cost | 1x | How often will this need updating? |

## Scoring Formula

```
VFM Score = (Frequency × 3) + (Failure_Cost × 3) - (Token_Cost × 2) - (Maintenance × 1)

Threshold:
- VFM ≥ 70: High priority, approve quickly
- VFM 50-69: Medium priority, standard review
- VFM < 50: Low priority, consider rejecting
```

## When Scoring a Constraint Candidate

1. **Load failure observation** that triggered N=3
2. **Calculate VFM dimensions**:
   ```markdown
   ### VFM Analysis: C007-always-run-tests

   | Dimension | Score (0-100) | Rationale |
   |-----------|---------------|-----------|
   | Frequency | 90 | Applies to every code change |
   | Failure Cost | 80 | Average 2 hours wasted per occurrence |
   | Token Cost | 30 | ~50 tokens per injection |
   | Maintenance | 20 | Stable rule, rarely needs update |

   **VFM Score**: (90×3) + (80×3) - (30×2) - (20×1) = 270 + 240 - 60 - 20 = **430**
   **Priority**: HIGH (approve immediately)
   ```

3. **Add to constraint frontmatter**:
   ```yaml
   vfm_score: 430
   vfm_priority: high
   vfm_calculated: 2026-02-13
   ```

## Integration with Approval Workflow

Before approving constraint:
1. Run VFM scoring
2. If VFM < 50, flag for discussion
3. Include VFM score in approval decision
4. Track VFM accuracy over time (did high-VFM constraints actually help?)
```

---

## Implementation Roadmap

### Phase 0: Foundation (Pre-requisite)

Install foundation skills:
```bash
clawdhub install proactive-agent        # Context persistence, security
clawdhub install self-improving-agent   # Learning capture
```

Then add bridge skills:
1. **learnings-n-counter** - Convert "See Also" links to formal N-count
2. **feature-request-tracker** - Track recurring capability requests
3. **wal-failure-detector** - Convert WAL corrections to failure candidates
4. **heartbeat-constraint-check** - Add constraint monitoring to heartbeats
5. **vfm-constraint-scorer** - Apply VFM scoring to constraint approval

### Phase 1: Quick Wins (Week 1)

3. **context-packet** - Simple, immediately useful
4. **file-verifier** - Prevents common errors
5. **constraint-enforcer** - High visibility, low complexity
6. **severity-tagger** - Standardize review output
7. **positive-framer** - Better constraint quality

### Phase 2: Core Memory (Weeks 2-3)

6. **failure-tracker** - Central to failure-anchored memory
7. **observation-recorder** - Complements failure tracking
8. **memory-search** - Makes memory system queryable
9. **index-generator** - Navigable dashboards (NEW)
10. **topic-tagger** - Contextual constraint matching (NEW)

### Phase 3: Constraint Management (Weeks 4-5)

11. **constraint-generator** - Completes the N=3 workflow
12. **circuit-breaker** - Prevents resource waste
13. **emergency-override** - Escape hatch for blocking constraints
14. **constraint-reviewer** - 90-day governance (NEW)

### Phase 4: Review Orchestration (Weeks 6-7)

15. **review-selector** - Decision tree for review type (NEW)
16. **staged-quality-gate** - Incremental QG-Code gates (NEW)
17. **twin-review** - Multi-agent orchestration
18. **cognitive-review** - Model switching

### Phase 5: Advanced Governance (Weeks 8+)

19. **constraint-lifecycle** - Full governance
20. **model-pinner** - Reproducibility safety (NEW)
21. **fallback-checker** - Tool resilience (NEW)
22. **round-trip-tester** - Schema synchronization (NEW)

---

## Architecture Alignment

### Files-as-Memory

The Agentic architecture's "files are memory" principle aligns perfectly with OpenClaw's workspace model:

| Agentic Concept | OpenClaw Implementation |
|-----------------|------------------------|
| `docs/observations/` | `{baseDir}/references/observations/` |
| `docs/failures/` | `{baseDir}/references/failures/` |
| `docs/constraints/` | `{baseDir}/references/constraints/` |
| `output/context/` | `{baseDir}/references/context/` |

### State Management

OpenClaw skills are stateless between invocations. The Agentic system's file-based state (observations, failures, constraints as markdown) provides natural persistence:

```
~/.openclaw/workspace/skills/agentic-memory/
├── SKILL.md
└── references/
    ├── observations/
    │   ├── INDEX.md
    │   └── *.md
    ├── failures/
    │   ├── INDEX.md
    │   └── *.md
    ├── constraints/
    │   ├── INDEX.md
    │   ├── ACTIVE.generated.md
    │   └── *.md
    └── state/
        └── circuit-state.json
```

### Tool Permissions

Most memory skills need minimal permissions:

| Skill | Tools Required |
|-------|---------------|
| failure-tracker | Bash, Read, Write |
| constraint-enforcer | Read, Bash |
| observation-recorder | Read, Write |
| memory-search | Bash, Read |
| context-packet | Bash, Write |

---

## Key Considerations

### 1. Description Quality

OpenClaw uses descriptions to decide when to invoke skills. Be specific:

**Good**: "Track coding failures from reverts, retries, and time anomalies. Use when user mentions mistakes, wasted time, or asks to track a failure."

**Bad**: "Failure tracking skill"

### 2. Positive Framing

Per the Agentic guides' Pink Elephant research, constraint rules should use positive framing:

- "Always profile before optimizing" (good)
- "Don't optimize without profiling" (bad)

### 3. Evidence Tiers

Failure detection should use confidence tiers to reduce false positives:

| Tier | Confidence | Example |
|------|------------|---------|
| Hard | 0.95 | Git revert commit exists |
| Medium | 0.7 | Explicit statement with context |
| Soft | 0.3 | Signal words only |

### 4. N-Count Thresholds

Follow the Agentic system's N-count semantics:

| N | Meaning | Action |
|---|---------|--------|
| 1 | First occurrence | Record, don't overreact |
| 2 | Pattern forming | Increase vigilance |
| 3 | Confirmed pattern | Generate constraint candidate |
| 5+ | Established | Consider tooling/automation |

---

## Security Considerations

Palo Alto Networks has warned that OpenClaw presents risks from:
- Access to private data
- Exposure to untrusted content
- Ability to perform external communications while retaining memory

**Mitigations for Agentic skills**:
- Keep constraint/observation files in workspace only
- Don't expose to external networks
- Audit trail for all constraint changes
- Human approval gate for constraint injection

---

## References

- [OpenClaw Official Documentation](https://docs.openclaw.ai/tools/skills)
- [OpenClaw GitHub Repository](https://github.com/openclaw/openclaw)
- [OpenClaw Custom Skill Tutorial](https://eastondev.com/blog/en/posts/ai/20260205-openclaw-skill-tutorial/)
- [BankrBot OpenClaw Skills Library](https://github.com/BankrBot/openclaw-skills)
- [Creating Custom Skills Guide](https://openclaw.dog/docs/tools/creating-skills/)
- [DigitalOcean: What is OpenClaw](https://www.digitalocean.com/resources/articles/what-is-openclaw)

---

## Fork Strategy Analysis

Based on analysis from 6 external AI reviewers, three integration approaches were identified:

### Option 1: Skill-Based Integration (Recommended Start)

```
your-system/
├── openclaw-skills/
│   ├── failure-memory-plugin/
│   ├── constraint-enforcer-plugin/
│   └── observation-tracker-plugin/
└── your-core-go-system/     ← Standalone
```

**Pros**: Modular, easier updates, participates in OpenClaw ecosystem, leverages ClawHub distribution
**Cons**: Less tight integration, performance overhead from inter-process communication

### Option 2: Deep Fork (Replace Memory System)

```
openclaw-fork/
├── src/
│   ├── memory/              ← Replace with Agentic system
│   │   ├── failure-tracker.ts
│   │   ├── constraint-engine.ts
│   │   └── n-count-scorer.ts
│   ├── gateway/             ← Keep OpenClaw core
│   └── agents/              ← Keep OpenClaw agents
```

**Pros**: Complete control, integrated experience, unified architecture
**Cons**: Maintenance burden, diverges from upstream, misses security patches

### Option 3: Bridge Architecture (gRPC/REST)

```go
// Agentic system exposes gRPC API
service AgenticMemory {
    rpc RecordFailure(Failure) returns (Constraint);
    rpc CheckConstraints(Action) returns (Violations);
    rpc GetObservations(Query) returns (Observations);
}

// OpenClaw TypeScript client
const memoryClient = new AgenticMemoryClient('localhost:50051');
```

**Pros**: Language independence, clear separation, independent evolution
**Cons**: Operational complexity, network latency, memory duplication

### Recommended Approach: Phased Hybrid

**Phase 1 (Weeks 1-4)**: Skill-based integration to validate value
**Phase 2 (Weeks 5-8)**: Bidirectional memory bridge if skills prove valuable
**Phase 3 (If needed)**: Selective fork of memory layer only, keeping gateway

---

## Mutual Value Exchange

### What OpenClaw Gains from Agentic System

| Gap in OpenClaw | Agentic System Solution |
|-----------------|------------------------|
| No consequence-bearing memory | Failure-anchored memory with N-count |
| Agents repeat same mistakes | Constraint generation from patterns |
| Basic tool policy engine | Context-aware constraint enforcement |
| Single-session learning | Cross-session pattern tracking |
| Autonomous without accountability | Human approval gates |

### What Agentic System Gains from OpenClaw

| Gap in Agentic System | OpenClaw Solution |
|----------------------|-------------------|
| CLI-only interface | 16+ messaging channels (Slack, Discord, etc.) |
| Custom agent coordination | Battle-tested gateway pattern |
| Limited distribution | 145k+ stars, ClawHub marketplace |
| Go-only implementation | TypeScript ecosystem, plugin system |
| Manual orchestration | Unified agent execution engine |

---

## Integration Flow Example

Example: User sends message via Slack to combined system:

```
1. User → Slack → OpenClaw Gateway (port 18789)
2. Gateway → Scout skill (Agentic)
   ├── Reads current task context
   ├── Queries failures/ and constraints/
   └── Generates ContextPacket with relevant history
3. Gateway → Agent (Claude) with ContextPacket
4. Agent proposes action → Enforcer skill (Agentic)
   ├── Checks against active constraints
   └── Returns violations or clearance
5. If violation: Agent revises plan
   If clear: Gateway executes action
6. On session end → Observer skill (Agentic)
   ├── Analyzes session for failures
   ├── Creates FailureObservation if detected
   └── Increments N-count for existing patterns
7. At N=3 → Constraint Generator skill triggered
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Failure detection accuracy** | >85% precision | Manual review of detected failures |
| **Constraint effectiveness** | >60% reduction in repeated failures | Pre/post constraint analysis |
| **Performance impact** | <10% latency increase | Gateway response times |
| **Skill adoption** | >5% of OpenClaw installs using skill | ClawHub installation metrics |
| **False positive rate** | <5% | Human override frequency |

---

## Next Steps

1. **Validate format**: Create one skill (context-packet) and test in OpenClaw
2. **Iterate on descriptions**: Tune trigger phrases based on real usage
3. **Build core memory**: Implement failure-tracker + observation-recorder
4. **Test integration**: Verify files persist correctly across invocations
5. **Publish to ClawHub**: Share with community once validated

---

## Sources

Integration analysis synthesized from 6 external AI reviewer assessments:
- Claude Opus 4.1: Gateway pattern, Foundry pattern, channel abstraction
- Qwen 3 Max: Gateway-centric integration, detailed flow example
- DeepSeek v3.1: Skill-based approach, phased timeline, success metrics
- DeepSeek v3.2: Bridge architecture options, bidirectional memory sync
- GPT 5.2 Pro: Implementation mapping, sidecar architecture
- Gemini 3 Pro: Fork strategy, phased implementation

See `../reviews/2026-02-13-agentic-guides-review-*.md` for full review content.

---

## Repository Structure

Skills from this proposal will be implemented in a **public git submodule** at `projects/live-neon/skills/` (→ `live-neon/skills` on GitHub).

### Brand Architecture

```
multiverse/projects/
├── live-neon/                    # liveneon.ai brand (open source)
│   ├── neon-soul/                # Soul synthesis product
│   │   └── skills/               # Product marketing (2 skills)
│   └── skills/                   # Public submodule (44 skills)
└── obviously-not/                # obviouslynot.ai brand (proprietary)
    ├── writer/                   # Patent processor
    └── patent-skills/            # Patent-specific (4 skills)
```

### What Goes Where

| Category | Repository | Public? | Count |
|----------|------------|---------|-------|
| **PBD extraction** | `live-neon/skills/pbd/` | ✅ Yes | 7 |
| **Agentic memory** | `live-neon/skills/agentic/` | ✅ Yes | 37 |
| **Soul synthesis** | `live-neon/neon-soul/skills/` | ✅ Yes | 2 |
| **Patent-specific** | `obviously-not/patent-skills/` | ❌ No | 4 |

### Directory Structure

```
projects/live-neon/skills/            # Public submodule → live-neon/skills
├── pbd/                              # Principle-Based Design (7 skills)
│   ├── essence-distiller/
│   ├── pbe-extractor/
│   └── ...
└── agentic/                          # Failure-anchored memory (37 skills)
    ├── core/                         # Tier 1-4 (14 skills)
    ├── review/                       # Review orchestration (6 skills)
    ├── detection/                    # Detection & classification (4 skills)
    ├── governance/                   # Governance & audit (4 skills)
    ├── safety/                       # Model & tool safety (4 skills)
    └── bridge/                       # Integration skills (5 skills)
```

### Cross-References

Skills in external repos that use the same patterns:

**Soul Synthesis** (live-neon/neon-soul/skills/):
- `neon-soul` — Developer voice, ClawHub SEO
- `consciousness-soul-identity` — Agent voice, ClawHub SEO

**Patent Tools** (obviously-not/patent-skills/):
- `code-patent-scanner` — Scan codebases for innovations
- `code-patent-validator` — Validate claims against code
- `patent-scanner` — General patent discovery
- `patent-validator` — Patent claim validation

### Implementation Plan

See `../plans/2026-02-13-public-skills-repo-migration.md` for:
- 7-stage migration with live-neon brand structure
- README templates for skills/, pbd/, agentic/
- Verification checklist
- Rollback plan

### YCombinator Alignment

This structure supports the open methodology approach:
- **Live Neon** (liveneon.ai) = Open methodology (give away the "how")
- **Obviously Not** (obviouslynot.ai) = Proprietary tools (monetize execution)
- **Soul skills** = Product marketing (drive neon-soul adoption)

See `projects/obviously-not/writer/docs/proposals/2026-02-13-ycombinator-open-methodology-approach.md` for strategy details.

---

*Proposal drafted 2026-02-13. Updated with fork strategy analysis from Round 1 reviews and repository structure.*
