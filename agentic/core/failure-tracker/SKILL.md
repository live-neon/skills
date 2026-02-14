---
name: failure-tracker
version: 1.0.0
description: Detect and record failure observations with R/C/D counter tracking
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, observation]
---

# failure-tracker

Detect and record failure observations (test failures, user corrections, review findings,
runtime errors) with R/C/D counter tracking. Creates observation files that can be promoted
to constraints when eligibility criteria are met (R≥3, C≥2, sources≥2, c_unique_users≥2).

## Semantic Classification

This skill uses **LLM-based semantic similarity** for failure classification, NOT pattern
matching. Related failures (different wording, same root cause) should be grouped together.

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach.

**Thresholds** (from RG-3 research):
- CRITICAL failures: similarity ≥ 0.85
- IMPORTANT failures: similarity ≥ 0.80
- MINOR failures: similarity ≥ 0.70

## Usage

```
/failure-tracker record "<failure-description>" --source <file:line>
/failure-tracker confirm <observation-slug>
/failure-tracker disconfirm <observation-slug> [--reason <text>]
/failure-tracker status <observation-slug>
/failure-tracker list [--eligible] [--pending]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: record, confirm, disconfirm, status, list |
| description | Yes* | Failure description (*for record only) |
| --source | Yes* | Source location file:line (*for record only) |
| --session | No | Session identifier (default: auto-generated) |
| --context-packet | No | Path to context packet for evidence |
| --eligible | No | Filter to constraint-eligible observations (R≥3, C≥2, sources≥2, unique_users≥2) |
| --pending | No | Filter to observations awaiting confirmation |
| --reason | No | Explanation for disconfirmation decision |

## Output

### Record New Failure

```
/failure-tracker record "Force pushed without user confirmation" --source src/git/push.ts:47

RECORDED: git-force-push-without-confirmation

  Type: failure
  R count: 1 (new observation)
  Status: pending confirmation
  Source: src/git/push.ts:47
  Session: sess_20260213_a1b2c3

  Next: Use '/failure-tracker confirm git-force-push-without-confirmation'
        to confirm this is a real issue.
```

### Record Recurrence

```
/failure-tracker record "Executed git push --force without asking" --source src/deploy/release.ts:89

MATCHED EXISTING: git-force-push-without-confirmation (similarity: 0.92)

  R count: 2 → 3 (recurrence detected)
  Sources: 2 (src/git/push.ts, src/deploy/release.ts)
  C count: 1
  Status: awaiting 1 more confirmation for constraint eligibility

  Semantic match: "Force pushed without user confirmation" ↔
                  "Executed git push --force without asking"
```

### Confirm Failure

```
/failure-tracker confirm git-force-push-without-confirmation

CONFIRMED: git-force-push-without-confirmation

  C count: 1 → 2 (confirmed by user_twin1)
  D count: 0
  Unique confirming users: 2 (user_twin1, user_twin2)
  Engagement time: 8.2 seconds

  Eligibility: R=3 ✓, C=2 ✓, sources=2 ✓, unique_users=2 ✓
  Status: ELIGIBLE for constraint generation

  Next: constraint-generator will auto-trigger on next scan.
```

### Status Check

```
/failure-tracker status git-force-push-without-confirmation

OBSERVATION: git-force-push-without-confirmation

  Type: failure
  R count: 5
  C count: 3 (from 2 unique users)
  D count: 1
  Sources: 3
  Created: 2026-02-10
  Updated: 2026-02-13

  Eligibility: ELIGIBLE (R≥3 ✓, C≥2 ✓, sources≥2 ✓, unique_users≥2 ✓)
  Constraint: docs/constraints/active/git-safety-force-push.md (generated 2026-02-12)

  Evidence:
    1. src/git/push.ts:47 (2026-02-10)
    2. src/deploy/release.ts:89 (2026-02-11)
    3. src/git/push.ts:52 (2026-02-12)
```

## Observation File Format

Observation files are stored in `docs/observations/failures/<slug>.md`:

```markdown
---
slug: git-force-push-without-confirmation
type: failure
r_count: 3
c_count: 2
d_count: 0
c_unique_users: 2
c_details:
  - user: user_twin1
    timestamp: 2026-02-11T10:30:00Z
    decision_time_seconds: 12
    engagement_score: 0.9
  - user: user_twin2
    timestamp: 2026-02-12T14:15:00Z
    decision_time_seconds: 8
    engagement_score: 0.85
sources:
  - file: src/git/push.ts
    line: 47
    date: 2026-02-10
    session: sess_abc123
  - file: src/deploy/release.ts
    line: 89
    date: 2026-02-11
    session: sess_def456
  - file: src/git/push.ts
    line: 52
    date: 2026-02-12
    session: sess_ghi789
created: 2026-02-10
updated: 2026-02-13
context_packet: .packets/2026-02-13-abc123.json
eligible_for_constraint: true
constraint_generated: docs/constraints/active/git-safety-force-push.md
---

# Force Push Without Confirmation

## Description

AI executed `git push --force` without asking for user confirmation.

## Evidence

### Occurrence 1 (2026-02-10)
- **File**: src/git/push.ts:47
- **Action**: Executed `git push --force origin main`
- **Context**: Deployment hotfix, user had requested quick deploy
- **Detection**: User correction after remote history lost

### Occurrence 2 (2026-02-11)
- **File**: src/deploy/release.ts:89
- **Action**: Executed `git push -f origin release/v2.1`
- **Context**: Branch cleanup during release prep
- **Detection**: CI failure triggered investigation

### Occurrence 3 (2026-02-12)
- **File**: src/git/push.ts:52
- **Action**: Executed `git push --force-with-lease origin feature/auth`
- **Context**: Rebasing feature branch
- **Detection**: Code review finding

## Resolution

Before executing any force push operation:
1. Present consequences to user (history will be overwritten)
2. List affected commits that will be lost on remote
3. Request explicit "yes" confirmation with reason
4. Log the decision and reason to audit trail
```

## R/C/D Counter Semantics

The three counters track different aspects of failure validation:

| Counter | Meaning | Updated By | Purpose |
|---------|---------|------------|---------|
| R (Recurrence) | Times failure detected | Automatic | Shows pattern frequency |
| C (Confirmations) | Human-verified true positives | `/confirm` | Validates real issue |
| D (Disconfirmations) | Human-verified false positives | `/disconfirm` | Prevents bad constraints |

**Cross-reference**: For pattern observations, see `observation-recorder` which uses
`endorse`/`deprecate` (equivalent to `confirm`/`disconfirm` for failures).

**Eligibility Criteria** (from Architecture Guide v5.2):
- R ≥ 3 (at least 3 recurrences)
- C ≥ 2 (at least 2 human confirmations)
- sources ≥ 2 (from at least 2 distinct sources)
- c_unique_users ≥ 2 (from RG-5: at least 2 different humans)

## Bias Mitigation (from RG-5 Research)

Human confirmation quality affects constraint reliability. This skill implements:

### Multi-User Requirement
Confirmations must come from at least 2 different users, not just 2 confirmations
from the same user. This mitigates individual bias.

### Engagement Tracking
Each confirmation records:
- `decision_time_seconds`: Time between viewing and deciding
- `engagement_score`: 0.0-1.0 based on engagement signals

**Warning signals**:
- Decision time < 5 seconds: Possible rubber-stamping
- C ratio > 95% for a user: Possible undercorrection
- C ratio < 50% for a user: Possible overcorrection

### Weighted Confirmations
Engagement score factors into constraint quality assessment:
```
engagement_score = base * time_factor * accuracy_factor * recency_factor
```

## Integration

- **Layer**: Core
- **Depends on**: context-packet (for evidence hashing)
- **Used by**: constraint-generator (triggers when eligible)

## Storage Location

```
docs/observations/
├── failures/           # failure-tracker output
│   └── <slug>.md       # e.g., git-force-push-without-confirmation.md
├── patterns/           # observation-recorder output (positive patterns)
│   └── <slug>.md
└── *.md                # existing observations (legacy, not auto-generated)
```

**Naming Convention**: `<slug>.md` where slug is kebab-case failure identifier.

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No description provided | Error: "Failure description required" |
| No source provided | Error: "Source location required (file:line)" |
| Invalid source format | Error: "Source must be in format file:line" |
| Observation not found | Error: "Observation not found: <slug>" |
| Already confirmed by user | Warning: "Already confirmed by this user" |
| User confirming too fast | Warning: "Decision very fast (<5s). Consider reviewing evidence." |

## Semantic Matching Details

When recording failures, existing observations are searched for semantic similarity:

| Failure A | Failure B | Match? | Action |
|-----------|-----------|--------|--------|
| "Force pushed without asking" | "git push --force without confirmation" | YES (0.92) | Increment R |
| "Deleted branch without asking" | "Force pushed without asking" | NO (0.45) | New observation |
| "Forgot to run tests" | "Skipped test suite" | YES (0.88) | Increment R |

**Two-stage matching** (from RG-3 research):
1. Fast embedding filter (< 0.5 similarity → skip)
2. Deep LLM classification (≥ 0.5 → full semantic analysis)

## Example Workflow

```
# Day 1: First failure detected
/failure-tracker record "Force pushed without user confirmation" --source src/git/push.ts:47

# Day 2: Related failure detected (auto-matched)
/failure-tracker record "Executed git push --force without asking" --source src/deploy/release.ts:89

# Day 2: First confirmation
/failure-tracker confirm git-force-push-without-confirmation

# Day 3: Another recurrence
/failure-tracker record "Used --force flag on git push" --source src/git/push.ts:52

# Day 3: Second confirmation (different user)
/failure-tracker confirm git-force-push-without-confirmation

# Check status
/failure-tracker status git-force-push-without-confirmation
# → ELIGIBLE for constraint generation
```

## Acceptance Criteria

- [x] Creates observation file with correct format
- [x] R counter auto-increments on repeated failures
- [x] Semantic matching identifies related failures
- [x] Source diversity tracked (same failure from different files/sessions)
- [x] C counter increments on confirm
- [x] D counter increments on disconfirm
- [x] Tracks unique users for confirmations (c_unique_users)
- [x] Records engagement metrics (decision_time, engagement_score)
- [x] Generates context packets for evidence
- [x] Lists observations with eligibility status
- [x] Shows warning for fast confirmation decisions

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to layer table if new skill
2. **Update upstream skills** - Add this skill to their "Used by" lists
3. **Update downstream skills** - Verify "Depends on" lists are current
4. **Run verification** - `cd tests && npm test`
5. **Check closing loops** - See `docs/workflows/phase-completion.md`

**If part of a phase implementation**:
- Mark stage complete in implementation plan
- Proceed to next stage OR run phase-completion workflow
- Update `docs/implementation/agentic-phase4-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
