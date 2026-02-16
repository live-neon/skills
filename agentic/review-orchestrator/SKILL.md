---
name: review-orchestrator
version: 1.0.0
description: Multi-perspective review coordination with configurable cognitive modes
author: Live Neon <contact@liveneon.dev>
homepage: https://github.com/live-neon/skills/tree/main/agentic/review-orchestrator
repository: leegitw/review-orchestrator
license: MIT
tags: [agentic, review, twin, cognitive, orchestration, multi-perspective]
layer: review
status: active
alias: ro
---

# review-orchestrator (審査)

Unified skill for selecting review types, spawning multi-perspective and cognitive review agents,
and managing quality gates. Consolidates 5 granular skills into a single review system.

**Trigger**: レビュー要求 (review requested)

**Source skills**: twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer

## Installation

```bash
openclaw install leegitw/review-orchestrator
```

**Dependencies**:
- `leegitw/failure-memory` (for context)
- `leegitw/context-verifier` (for file verification)

```bash
# Install with dependencies
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
openclaw install leegitw/review-orchestrator
```

**Standalone usage**: Review orchestration works independently for multi-perspective reviews.
Integration with failure-memory enables automatic observation recording from review findings.

## Usage

```
/ro <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/ro select` | 選択 | context×risk→type∈{twin,cognitive,code} | Explicit |
| `/ro twin` | 双子 | spawn(technical,creative)→findings[] | Explicit |
| `/ro cognitive` | 認知 | spawn(modes[])→analysis[] | Explicit |
| `/ro multi` | 双視 | alias for `/ro twin` (multi-perspective review) | Explicit |
| `/ro gate` | 門番 | staged_work→pass✓∨block✗ | Explicit |

## Arguments

### /ro select

| Argument | Required | Description |
|----------|----------|-------------|
| context | Yes | Description of work to review |
| --risk | No | Risk level: `low`, `medium`, `high` (auto-detected if omitted) |

### /ro twin

| Argument | Required | Description |
|----------|----------|-------------|
| target | Yes | File path(s) or topic to review |
| --technical-only | No | Skip creative perspective |
| --creative-only | No | Skip technical perspective |

### /ro cognitive

| Argument | Required | Description |
|----------|----------|-------------|
| target | Yes | File path(s) or topic to review |
| --modes | No | Cognitive modes: `analyzer`, `architect`, `implementer` (default: all) |

### /ro multi

Alias for `/ro twin`. The name "twin" refers to the dual-perspective review pattern
(technical + creative), not a specific team structure. `/ro multi` is provided for
discoverability by users unfamiliar with the "twin" terminology.

### /ro gate

| Argument | Required | Description |
|----------|----------|-------------|
| stage | Yes | Stage name or number to gate |
| --strict | No | Require all checks pass (default: true) |
| --allow-minor | No | Allow minor issues to pass |

## Core Logic

### Review Type Selection

| Context | Risk | Recommended Review |
|---------|------|-------------------|
| Implementation | Low | `/ro twin --technical-only` |
| Implementation | Medium | `/ro twin` (both perspectives) |
| Implementation | High | `/ro twin` + `/ro cognitive` |
| Architecture | Any | `/ro cognitive` |
| Documentation | Any | `/ro twin --creative-only` |
| Security | Any | `/ro cognitive` + external review |

### Multi-Perspective Review

| Perspective | Focus | CJK |
|-------------|-------|-----|
| Technical | Architecture, standards, patterns, security | 技術 |
| Creative | UX, communication, philosophy alignment | 創造 |

### Cognitive Modes

Cognitive modes provide different analytical perspectives. Modes are configurable;
defaults shown below.

| Mode | Perspective | Focus | CJK |
|------|-------------|-------|-----|
| analyzer | "Here's what conflicts" | Tensions, trade-offs, contradictions | 審碼 |
| architect | "Here's how to restructure" | Architecture, patterns, organization | 審構 |
| implementer | "Here's how to implement" | Concrete steps, complexity, path forward | 審実 |

> **Note**: Mode names are perspective-based, not model-specific. The underlying model
> used for each mode is configurable (see Configuration section below).

## Configuration

Configuration is loaded from (in order of precedence):
1. `.openclaw/review-orchestrator.yaml` (OpenClaw standard)
2. `.claude/review-orchestrator.yaml` (Claude Code compatibility)
3. Defaults (built-in)

### Cognitive Mode Interface

Each cognitive mode implements this interface:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Mode identifier (e.g., "analyzer", "architect") |
| perspective | string | Yes | Human-readable perspective description |
| prompt_prefix | string | Yes | Prompt prefix for this mode's analysis |
| model_hint | string | No | Optional model preference (not enforced) |

### Cognitive Mode Configuration

```yaml
# .openclaw/review-orchestrator.yaml
cognitive_modes:
  - id: analyzer
    perspective: "Here's what conflicts"
    prompt_prefix: "Analyze tensions, trade-offs, and conflicts in..."
    model_hint: "prefer analytical model"
  - id: architect
    perspective: "Here's how to restructure"
    prompt_prefix: "Suggest architectural improvements for..."
    model_hint: "prefer architectural model"
  - id: implementer
    perspective: "Here's how to implement"
    prompt_prefix: "Provide implementation guidance for..."
    model_hint: "prefer practical model"
```

### Quality Gate Configuration

```yaml
# .openclaw/review-orchestrator.yaml
quality_gates:
  test_command: "npm test"    # Node.js (default)
  # test_command: "go test ./..."  # Go
  # test_command: "pytest"         # Python
  # test_command: "cargo test"     # Rust
  coverage_threshold: 5       # Max allowed coverage drop (%)
  require_docs: true          # Require documentation updates
```

### Quality Gate Checks

| Check | Condition | Severity |
|-------|-----------|----------|
| Tests pass | `{test_command}` exit 0 | Critical |
| Coverage maintained | delta ≤ `{coverage_threshold}`% | Important |
| No critical findings | review.critical == 0 | Critical |
| Docs updated | changed files have docs (if `require_docs`) | Minor |

> Checks use configured values from `quality_gates` section. Defaults: test_command=`npm test`,
> coverage_threshold=5, require_docs=true.

## Output

### /ro select output

```
[REVIEW SELECTION]
Context: "Refactoring authentication handler"
Risk: Medium (auto-detected: changes auth code)

Recommended: /ro twin
Rationale: Medium-risk implementation benefits from both technical and creative perspectives.

Alternative: /ro cognitive (for deeper architectural analysis)
```

### /ro twin output

```
[MULTI-PERSPECTIVE REVIEW INITIATED]
Target: src/handlers/auth.go
Perspectives: technical, creative

--- Technical Perspective Findings ---
Severity: important
- I-1: Missing error handling on line 45
- I-2: Consider extracting validation logic

Severity: minor
- M-1: Inconsistent naming convention

--- Creative Perspective Findings ---
Severity: minor
- M-1: Error messages could be more user-friendly
- M-2: Consider adding debug logging for operators

Verdict: Approved with conditions
```

### /ro cognitive output

```
[COGNITIVE REVIEW INITIATED]
Target: docs/architecture/auth-flow.md
Modes: analyzer, architect, implementer

--- Analyzer Perspective (Conflicts) ---
- Tension between security and usability in token refresh
- Trade-off: session duration vs re-auth frequency

--- Architect Perspective (Restructure) ---
- Suggested: Extract token service from handler
- Benefit: Cleaner separation of concerns

--- Implementer Perspective (Implement) ---
- Implementation path: 3 stages
- Estimated complexity: Medium

Verdict: Approved
```

### /ro gate output (pass)

```
[QUALITY GATE: Stage 2]
Status: ✓ PASSED

Checks:
- ✓ Tests pass (exit 0)
- ✓ Coverage maintained (delta: -1.2%)
- ✓ No critical findings
- ✓ Documentation updated

Proceed to Stage 3.
```

### /ro gate output (block)

```
[QUALITY GATE: Stage 2]
Status: ✗ BLOCKED

Checks:
- ✓ Tests pass
- ✗ Coverage dropped (delta: -8.3%, threshold: 5%)
- ✓ No critical findings
- ✗ Documentation not updated

Action required before proceeding:
1. Add tests to restore coverage
2. Update docs/handlers/README.md
```

### Example: API Design Review

```
/ro cognitive api/openapi.yaml --modes analyzer,architect
[COGNITIVE REVIEW INITIATED]
Target: api/openapi.yaml
Modes: analyzer, architect

--- Analyzer Perspective (Conflicts) ---
- Tension: Versioning strategy (URL vs header) inconsistent across endpoints
- Trade-off: Pagination style (cursor vs offset) mixed usage

--- Architect Perspective (Restructure) ---
- Suggested: Standardize on cursor pagination for large collections
- Benefit: Consistent client SDK, better performance at scale

Verdict: Approved with conditions
```

### Example: Performance Review

```
/ro twin src/handlers/search.go --technical-only
[MULTI-PERSPECTIVE REVIEW INITIATED]
Target: src/handlers/search.go
Perspectives: technical

--- Technical Perspective Findings ---
Severity: important
- I-1: N+1 query pattern on line 78 (database calls in loop)
- I-2: Missing index on search_terms table

Severity: minor
- M-1: Consider caching frequent searches (>100 req/min)

Verdict: Approved with conditions
```

## Integration

- **Layer**: Review
- **Depends on**: failure-memory (for context), context-verifier (for file verification)
- **Used by**: governance (for constraint reviews)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid sub-command | List available sub-commands |
| Target not found | Error: "Target not found: {path}" |
| Agent spawn failed | Retry once, then report failure |
| Gate check failed | Block with specific remediation steps |

## Next Steps

After invoking this skill:

| Condition | Action |
|-----------|--------|
| Review complete | Write findings to `docs/reviews/` |
| Gate passed | Proceed to next stage |
| Gate blocked | Address findings, re-run gate |
| Critical findings | Create observation via `/fm record` |

## Workspace Files

This skill reads/writes:

```
docs/reviews/
├── [date]-[topic]-twin-technical.md
├── [date]-[topic]-twin-creative.md
├── [date]-[topic]-cognitive.md
└── [date]-[topic]-gate-results.md
```

## Acceptance Criteria

- [ ] `/ro select` recommends appropriate review type based on context and risk
- [ ] `/ro twin` (or `/ro multi`) spawns both technical and creative perspectives
- [ ] `/ro twin` aggregates findings from both perspectives
- [ ] `/ro cognitive` spawns configured cognitive modes (default: analyzer, architect, implementer)
- [ ] `/ro cognitive` presents different perspectives clearly
- [ ] `/ro gate` checks all configured quality criteria
- [ ] `/ro gate` blocks on critical failures
- [ ] `/ro gate` provides clear remediation guidance
- [ ] Review findings written to workspace files
- [ ] Configuration loaded from `.openclaw/` or `.claude/` paths

---

*Consolidated from 5 skills as part of agentic skills consolidation (2026-02-15).*
