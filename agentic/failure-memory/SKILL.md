---
name: failure-memory
version: 1.0.0
description: Unified failure tracking, observation recording, and pattern detection
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, failure, observation, pattern]
layer: core
status: active
alias: fm
---

# failure-memory (記憶)

Unified skill for failure detection, observation recording, memory search, and pattern convergence.
Consolidates 10 granular skills into a single coherent memory system.

**Trigger**: 失敗発生 (failure occurred)

**Source skills**: failure-tracker, observation-recorder, memory-search, topic-tagger, failure-detector, evidence-tier, effectiveness-metrics, pattern-convergence-detector, positive-framer, contextual-injection

## Usage

```
/fm <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/fm detect` | 検出 | fail∈{test,user,API}→record | Next Steps (auto) |
| `/fm record` | 記録 | pattern→obs, R++∨C++∨D++ | Next Steps (auto) |
| `/fm search` | 索引 | query(pattern∨tag∨slug)→obs[] | Explicit |
| `/fm classify` | 分類 | obs→tier∈{N=1:弱,N=2:中,N≥3:強} | Explicit |
| `/fm status` | 状態 | eligible:R≥3∧C≥2, recent:30d | Explicit |
| `/fm refactor` | 整理 | obs[]→merge∨split∨restructure | Explicit |
| `/fm converge` | 収束 | pattern[]→detect(similarity≥0.8) | Explicit |

## Arguments

### /fm detect

| Argument | Required | Description |
|----------|----------|-------------|
| type | Yes | Failure type: `test`, `user`, `api`, `error` |
| context | No | Additional context for the failure |

### /fm record

| Argument | Required | Description |
|----------|----------|-------------|
| pattern | Yes | Pattern description or observation ID |
| counter | No | Counter to increment: `R` (default), `C`, or `D` |

### /fm search

| Argument | Required | Description |
|----------|----------|-------------|
| query | Yes | Search pattern, tag, or slug |
| status | No | Filter by status: `pending`, `eligible`, `all` (default) |

### /fm classify

| Argument | Required | Description |
|----------|----------|-------------|
| observation | Yes | Observation ID or pattern |

### /fm status

| Argument | Required | Description |
|----------|----------|-------------|
| --eligible | No | Show only eligible observations (R≥3 ∧ C≥2) |
| --recent | No | Show only observations from last 30 days |

### /fm refactor

| Argument | Required | Description |
|----------|----------|-------------|
| observations | Yes | Comma-separated observation IDs |
| action | Yes | Action: `merge`, `split`, `restructure` |

### /fm converge

| Argument | Required | Description |
|----------|----------|-------------|
| --threshold | No | Similarity threshold (default: 0.8) |

## Detection Triggers

Agent scans for these patterns to auto-invoke `/fm detect`:

| Pattern | Source | Action |
|---------|--------|--------|
| `test.exit_code != 0` | Tool output | `/fm detect test` |
| "Actually...", "No, that's wrong" | User message | `/fm record correction` |
| "I meant...", "Not X, Y" | User message | `/fm record correction` |
| API 4xx/5xx response | Tool output | `/fm detect api` |
| "error:", "failed", "Exception" | Tool output | `/fm detect error` |

## Core Logic

### R/C/D Counters

| Counter | Meaning | Updated By |
|---------|---------|------------|
| **R** (Recurrence) | Auto-detected occurrences | `/fm detect`, `/fm record` |
| **C** (Confirmations) | Human-verified true positives | Human via `/fm record C` |
| **D** (Disconfirmations) | Human-verified false positives | Human via `/fm record D` |

### Evidence Tiers

| Tier | Criteria | Meaning |
|------|----------|---------|
| 弱 (weak) | N=1 | Single occurrence, may be noise |
| 中 (emerging) | N=2 | Pattern emerging, monitor |
| 強 (strong) | N≥3 | Established pattern, actionable |

### Slug Taxonomy

Observations are tagged with slugs: `git-*`, `test-*`, `workflow-*`, `security-*`, `docs-*`, `quality-*`

### Metrics

- `prevention_rate`: Failures prevented / Total potential failures
- `false_positive_rate`: D / (C + D)

## Output

### /fm detect output

```
[DETECTED] test failure
Pattern: lint-before-commit
Observation: OBS-20260215-001
R: 1 → 2
Status: Monitoring (R<3)
```

### /fm status output

```
=== Failure Memory Status ===

Eligible for constraint (R≥3 ∧ C≥2):
- OBS-20260210-003: lint-before-commit (R=4, C=2, D=0)
- OBS-20260212-007: test-before-push (R=3, C=3, D=1)

Recent (last 30d): 12 observations
Pending review: 3 observations
```

## Integration

- **Layer**: Core
- **Depends on**: context-verifier (for file change detection)
- **Used by**: constraint-engine (for eligibility checks), governance (for state queries)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid sub-command | List available sub-commands |
| Missing observation ID | Error with usage example |
| No matches found | "No observations match query" |
| Duplicate detection | Increment R counter, don't create new observation |

## Next Steps

After invoking this skill:

| Condition | Action |
|-----------|--------|
| R incremented | Check eligibility: R≥3 ∧ C≥2 → notify user |
| R≥3 ∧ C≥2 | Suggest `/ce generate` for constraint |
| Pattern recurring | Link with `See Also`, bump priority |
| Always | Update `.learnings/ERRORS.md` or `.learnings/LEARNINGS.md` |

## Workspace Files

This skill reads/writes:

```
.learnings/
├── ERRORS.md        # [ERR-YYYYMMDD-XXX] command failures
├── LEARNINGS.md     # [LRN-YYYYMMDD-XXX] corrections, best practices
└── observations/    # Individual observation files
    └── OBS-YYYYMMDD-XXX.md
```

## Acceptance Criteria

- [ ] `/fm detect` creates or updates observation with R++
- [ ] `/fm record` supports R, C, D counter updates
- [ ] `/fm search` finds observations by pattern, tag, or slug
- [ ] `/fm classify` returns correct tier based on N count
- [ ] `/fm status` shows eligible observations
- [ ] `/fm refactor` merges/splits observations correctly
- [ ] `/fm converge` detects similar patterns (≥0.8 similarity)
- [ ] Detection triggers work for test failures, user corrections, API errors
- [ ] Workspace files follow self-improving-agent format

---

*Consolidated from 10 skills as part of agentic skills consolidation (2026-02-15).*
