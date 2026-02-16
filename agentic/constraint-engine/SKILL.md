---
name: constraint-engine
version: 1.0.0
description: Unified constraint generation, enforcement, and lifecycle management
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, constraint, enforcement, circuit-breaker, lifecycle]
layer: core
status: active
alias: ce
---

# constraint-engine (制約)

Unified skill for constraint generation, pre-action checking, circuit breaker management,
and constraint lifecycle. Consolidates 7 granular skills into a single enforcement system.

**Trigger**: 行動前∨閾値到達 (pre-action or threshold reached)

**Source skills**: constraint-generator, circuit-breaker, emergency-override, constraint-lifecycle, constraint-versioning, positive-framer (partial), contextual-injection (partial)

## Usage

```
/ce <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/ce check` | 検査 | action→constraints[]→pass∨block | Next Steps (auto) |
| `/ce generate` | 生成 | eligible(obs)→constraint | Next Steps (auto) |
| `/ce status` | 状態 | active[], circuit∈{CLOSED,OPEN,HALF} | Explicit |
| `/ce override` | 上書 | constraint→bypass(temp), audit.log++ | Explicit |
| `/ce lifecycle` | 周期 | state∈{draft→active→retiring→retired} | Explicit |
| `/ce version` | 版本 | constraint→v++, history.preserve | Explicit |
| `/ce threshold` | 閾値 | user∨context→custom_threshold | Explicit |

## Arguments

### /ce check

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Action to check against constraints |
| --severity | No | Minimum severity to check: `critical`, `important`, `minor` (default: all) |

### /ce generate

| Argument | Required | Description |
|----------|----------|-------------|
| observation | Yes | Observation ID or pattern to generate constraint from |
| --force | No | Generate even if eligibility criteria not met |

### /ce status

| Argument | Required | Description |
|----------|----------|-------------|
| --circuit | No | Show circuit breaker status only |
| --active | No | Show active constraints only |

### /ce override

| Argument | Required | Description |
|----------|----------|-------------|
| constraint | Yes | Constraint ID to override |
| reason | Yes | Reason for override (logged for audit) |
| --duration | No | Override duration (default: "session") |

### /ce lifecycle

| Argument | Required | Description |
|----------|----------|-------------|
| constraint | Yes | Constraint ID |
| state | Yes | Target state: `draft`, `active`, `retiring`, `retired` |

### /ce version

| Argument | Required | Description |
|----------|----------|-------------|
| constraint | Yes | Constraint ID |
| --bump | No | Version bump type: `major`, `minor`, `patch` (default: minor) |

### /ce threshold

| Argument | Required | Description |
|----------|----------|-------------|
| --R | No | Custom recurrence threshold (default: 3) |
| --C | No | Custom confirmation threshold (default: 2) |
| --reset | No | Reset to default thresholds |

## Core Logic

### Eligibility Criteria

Observation becomes eligible for constraint when:

```
R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2
```

| Criterion | Meaning |
|-----------|---------|
| R≥3 | At least 3 recurrences |
| C≥2 | At least 2 human confirmations |
| D/(C+D)<0.2 | False positive rate under 20% |
| sources≥2 | Observed by at least 2 different sources |

### Positive Reframing

Constraints are automatically reframed positively:

| Negative | Positive |
|----------|----------|
| "Don't commit without tests" | "Always run tests before commit" |
| "Don't push to main directly" | "Always create PR for main changes" |

### Circuit Breaker States

| State | Meaning | Behavior |
|-------|---------|----------|
| CLOSED | Normal operation | Constraints enforced |
| OPEN | Circuit tripped | Block all related actions |
| HALF-OPEN | Testing recovery | Allow limited actions |

### Circuit Breaker Thresholds

| Severity | Threshold | Window |
|----------|-----------|--------|
| CRITICAL | 3 violations | 30 days |
| IMPORTANT | 5 violations | 30 days |
| MINOR | 10 violations | 30 days |

### Constraint Lifecycle

```
draft → active → retiring → retired
  │        │         │
  └────────┴─────────┴── 90-day review gates
```

## Output

### /ce check output (pass)

```
[CHECK PASSED] git commit -m "feature"
Active constraints checked: 5
All constraints satisfied.
```

### /ce check output (block)

```
[CHECK BLOCKED] git commit -m "feature"

Constraint violated: CON-20260210-001
  "Always run tests before commit"
  Severity: CRITICAL

Action: Run tests first, then retry commit.
Override: /ce override CON-20260210-001 "emergency hotfix"
```

### /ce status output

```
=== Constraint Engine Status ===

Circuit Breaker: CLOSED (healthy)

Active Constraints (5):
- CON-20260210-001: Always run tests before commit [CRITICAL]
- CON-20260212-003: Always lint before commit [IMPORTANT]
- ...

Draft Constraints (2):
- CON-20260215-001: Pending approval

Violations (30d): 2
```

### /ce generate output

```
[CONSTRAINT GENERATED]

From: OBS-20260210-003 (lint-before-commit)
ID: CON-20260215-001
Text: "Always run lint before commit"
Severity: IMPORTANT
Status: draft

Next: Review and approve with /ce lifecycle CON-20260215-001 active
```

## Integration

- **Layer**: Core
- **Depends on**: failure-memory (for eligibility data)
- **Used by**: governance (for constraint reviews), safety-checks (for enforcement)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Invalid sub-command | List available sub-commands |
| Constraint not found | Error with suggestion to search |
| Ineligible observation | Show missing criteria, suggest /fm status |
| Circuit OPEN | Block action, show recovery guidance |
| Override without reason | Require reason for audit trail |

## Next Steps

After invoking this skill:

| Condition | Action |
|-----------|--------|
| Constraint generated | Add to `output/constraints/draft/`, notify user |
| Constraint activated | Move to `output/constraints/active/` |
| Action blocked | Log to `output/hooks/blocked.log`, explain why |
| Circuit OPEN | Surface to user with recovery guidance |
| Override used | Audit log entry, temporary bypass only |

## Workspace Files

This skill reads/writes:

```
output/
├── constraints/
│   ├── draft/           # Pending constraints
│   │   └── CON-YYYYMMDD-XXX.md
│   ├── active/          # Enforced constraints
│   │   └── CON-YYYYMMDD-XXX.md
│   ├── retired/         # Historical constraints
│   │   └── CON-YYYYMMDD-XXX.md
│   └── metadata.json    # VFM scoring data
└── hooks/
    └── blocked.log      # Actions blocked by constraints
```

## Acceptance Criteria

- [ ] `/ce check` validates action against active constraints
- [ ] `/ce check` blocks when constraint violated, shows reason
- [ ] `/ce generate` creates constraint from eligible observation
- [ ] `/ce generate` applies positive reframing
- [ ] `/ce status` shows circuit breaker state and active constraints
- [ ] `/ce override` creates temporary bypass with audit log
- [ ] `/ce lifecycle` transitions constraint through states
- [ ] `/ce version` increments constraint version preserving history
- [ ] Circuit breaker trips at severity-appropriate thresholds
- [ ] Workspace files follow documented structure

---

*Consolidated from 7 skills as part of agentic skills consolidation (2026-02-15).*
