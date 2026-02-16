---
name: review-orchestrator
version: 1.0.0
description: Multi-agent review coordination for twin, cognitive, and code reviews
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, twin, cognitive, orchestration]
layer: review
status: active
alias: ro
---

# review-orchestrator (審査)

Unified skill for selecting review types, spawning twin/cognitive review agents,
and managing quality gates. Consolidates 5 granular skills into a single review system.

**Trigger**: レビュー要求 (review requested)

**Source skills**: twin-review, cognitive-review, review-selector, staged-quality-gate, prompt-normalizer

## Usage

```
/ro <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/ro select` | 選択 | context×risk→type∈{twin,cognitive,code} | Explicit |
| `/ro twin` | 双子 | spawn(technical,creative)→findings[] | Explicit |
| `/ro cognitive` | 認知 | spawn(opus4,opus41,sonnet45)→analysis[] | Explicit |
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
| --technical-only | No | Skip creative twin |
| --creative-only | No | Skip technical twin |

### /ro cognitive

| Argument | Required | Description |
|----------|----------|-------------|
| target | Yes | File path(s) or topic to review |
| --modes | No | Cognitive modes: `opus4`, `opus41`, `sonnet45` (default: all) |

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
| Implementation | Medium | `/ro twin` (both twins) |
| Implementation | High | `/ro twin` + `/ro cognitive` |
| Architecture | Any | `/ro cognitive` |
| Documentation | Any | `/ro twin --creative-only` |
| Security | Any | `/ro cognitive` + external review |

### Twin Review Perspectives

| Twin | Focus | CJK |
|------|-------|-----|
| Technical | Architecture, standards, patterns, security | 技術 |
| Creative | UX, communication, philosophy alignment | 創造 |

### Cognitive Modes

| Mode | Model | Perspective | CJK |
|------|-------|-------------|-----|
| opus4 | Claude Opus 4 | "Here's what conflicts" | 審碼 |
| opus41 | Claude Opus 4.1 | "Here's how to restructure" | 審構 |
| sonnet45 | Claude Sonnet 4.5 | "Here's how to implement" | 審実 |

### Quality Gate Checks

| Check | Condition | Severity |
|-------|-----------|----------|
| Tests pass | `npm test` exit 0 | Critical |
| Coverage maintained | delta ≤ 5% | Important |
| No critical findings | review.critical == 0 | Critical |
| Docs updated | changed files have docs | Minor |

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
[TWIN REVIEW INITIATED]
Target: src/handlers/auth.go
Spawning: technical, creative

--- Technical Twin Findings ---
Severity: important
- I-1: Missing error handling on line 45
- I-2: Consider extracting validation logic

Severity: minor
- M-1: Inconsistent naming convention

--- Creative Twin Findings ---
Severity: minor
- M-1: Error messages could be more user-friendly
- M-2: Consider adding debug logging for operators

Verdict: Approved with conditions
```

### /ro cognitive output

```
[COGNITIVE REVIEW INITIATED]
Target: docs/architecture/auth-flow.md
Modes: opus4, opus41, sonnet45

--- Opus 4 Analysis (Conflicts) ---
- Tension between security and usability in token refresh
- Trade-off: session duration vs re-auth frequency

--- Opus 4.1 Analysis (Restructure) ---
- Suggested: Extract token service from handler
- Benefit: Cleaner separation of concerns

--- Sonnet 4.5 Analysis (Implement) ---
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
- [ ] `/ro twin` spawns both technical and creative twins
- [ ] `/ro twin` aggregates findings from both twins
- [ ] `/ro cognitive` spawns all three cognitive modes
- [ ] `/ro cognitive` presents different perspectives clearly
- [ ] `/ro gate` checks all quality criteria
- [ ] `/ro gate` blocks on critical failures
- [ ] `/ro gate` provides clear remediation guidance
- [ ] Review findings written to workspace files

---

*Consolidated from 5 skills as part of agentic skills consolidation (2026-02-15).*
