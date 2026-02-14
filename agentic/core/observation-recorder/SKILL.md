---
name: observation-recorder
version: 1.0.0
description: Record positive patterns with evidence for knowledge capture
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, observation]
---

# observation-recorder

Record positive patterns (successful workflows, effective techniques, good practices)
for knowledge capture. Unlike failure-tracker, pattern observations are **never eligible**
for constraint generation—they capture successes to replicate, not problems to prevent.

## Key Difference from failure-tracker

| Aspect | failure-tracker | observation-recorder |
|--------|-----------------|---------------------|
| Type | `failure` | `pattern` |
| Purpose | Problems to prevent | Successes to replicate |
| Constraint eligible | Yes (when R≥3, C≥2) | Never |
| Counter semantics | R=recurrence, C/D=validation | R=observations, C=usefulness |
| Downstream consumer | constraint-generator | pbd-strength-classifier (Phase 6) |

## Semantic Classification

This skill uses **LLM-based semantic similarity** for pattern classification, NOT pattern
matching. Related patterns (different wording, same practice) should be grouped together.

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach.

## Usage

```
/observation-recorder record "<pattern-description>" --source <file:line>
/observation-recorder endorse <observation-slug>
/observation-recorder deprecate <observation-slug> [--reason <text>]
/observation-recorder status <observation-slug>
/observation-recorder list [--endorsed] [--recent]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: record, endorse, deprecate, status, list |
| description | Yes* | Pattern description (*for record only) |
| --source | Yes* | Source location file:line (*for record only) |
| --session | No | Session identifier (default: auto-generated) |
| --context-packet | No | Path to context packet for evidence |
| --endorsed | No | Filter to endorsed patterns |
| --recent | No | Filter to patterns from last 7 days |
| --reason | No | Explanation for deprecation |

## Output

### Record New Pattern

```
/observation-recorder record "Used TDD workflow: wrote failing test first, then implementation" --source src/auth/login.test.ts:15

RECORDED: successful-tdd-workflow

  Type: pattern
  R count: 1 (new observation)
  Status: active
  Source: src/auth/login.test.ts:15
  Session: sess_20260213_x7y8z9

  Note: Pattern observations capture successes to replicate.
        They are never promoted to constraints.
```

### Record Recurrence

```
/observation-recorder record "Followed TDD: test first, then code" --source src/handlers/user.test.ts:42

MATCHED EXISTING: successful-tdd-workflow (similarity: 0.89)

  R count: 2 → 3 (pattern reinforced)
  Sources: 2 (src/auth/login.test.ts, src/handlers/user.test.ts)
  Endorsements: 1

  Semantic match: "Used TDD workflow: wrote failing test first" ↔
                  "Followed TDD: test first, then code"
```

### Endorse Pattern

```
/observation-recorder endorse successful-tdd-workflow

ENDORSED: successful-tdd-workflow

  Endorsements: 1 → 2 (endorsed by user_twin1)
  Deprecations: 0

  Pattern strength: HIGH (R=5, endorsed=2)

  This pattern is frequently observed and endorsed.
  Consider documenting in team guidelines.
```

### Status Check

```
/observation-recorder status successful-tdd-workflow

OBSERVATION: successful-tdd-workflow

  Type: pattern
  R count: 5
  Endorsements: 3
  Deprecations: 0
  Sources: 4
  Created: 2026-01-15
  Updated: 2026-02-13

  Constraint eligible: NO (patterns never become constraints)
  Strength: HIGH
  Consumer: pbd-strength-classifier (Phase 6)

  Evidence:
    1. src/auth/login.test.ts:15 (2026-01-15)
    2. src/handlers/user.test.ts:42 (2026-01-20)
    3. src/services/api.test.ts:88 (2026-02-05)
    4. src/models/session.test.ts:23 (2026-02-10)
    5. src/utils/validator.test.ts:67 (2026-02-13)
```

### List Patterns

```
/observation-recorder list --endorsed

ENDORSED PATTERNS (3):

  1. successful-tdd-workflow
     R: 5, Endorsed: 3, Strength: HIGH
     "Write failing test first, then implementation"

  2. thoughtful-commit-messages
     R: 8, Endorsed: 4, Strength: HIGH
     "Include 'why' in commit messages, not just 'what'"

  3. early-context-loading
     R: 3, Endorsed: 2, Strength: MEDIUM
     "Load docs/CLAUDE.md at session start for context"
```

## Observation File Format

Pattern observations are stored in `docs/observations/patterns/<slug>.md`:

```markdown
---
slug: successful-tdd-workflow
type: pattern
r_count: 5
endorsements: 3
deprecations: 0
sources:
  - file: src/auth/login.test.ts
    line: 15
    date: 2026-01-15
    session: sess_abc123
  - file: src/handlers/user.test.ts
    line: 42
    date: 2026-01-20
    session: sess_def456
  - file: src/services/api.test.ts
    line: 88
    date: 2026-02-05
    session: sess_ghi789
  - file: src/models/session.test.ts
    line: 23
    date: 2026-02-10
    session: sess_jkl012
  - file: src/utils/validator.test.ts
    line: 67
    date: 2026-02-13
    session: sess_mno345
created: 2026-01-15
updated: 2026-02-13
context_packet: .packets/2026-02-13-xyz789.json
strength: high
---

# Successful TDD Workflow

## Description

Write failing test first, then implementation to make it pass.

## Pattern Details

The TDD workflow consists of:
1. Write a failing test that describes desired behavior
2. Run test to confirm it fails
3. Write minimal implementation to make test pass
4. Run test to confirm it passes
5. Refactor if needed

## Evidence

### Observation 1 (2026-01-15)
- **File**: src/auth/login.test.ts:15
- **Pattern**: Wrote login validation test before implementing validator
- **Context**: New auth feature development
- **Outcome**: Clean implementation, caught edge case early

### Observation 2 (2026-01-20)
- **File**: src/handlers/user.test.ts:42
- **Pattern**: Test-first for user handler
- **Context**: User CRUD implementation
- **Outcome**: Discovered API contract issue before coding

### Observation 3 (2026-02-05)
- **File**: src/services/api.test.ts:88
- **Pattern**: TDD for API client
- **Context**: External service integration
- **Outcome**: Mocking strategy clarified through test writing

## Why This Works

- Clarifies requirements before coding
- Catches design issues early
- Creates living documentation
- Enables confident refactoring
```

## Counter Semantics

For pattern observations, counters have different meaning than failure observations:

| Counter | Meaning | Updated By | Purpose |
|---------|---------|------------|---------|
| R (Recurrence) | Times pattern observed | Automatic | Shows pattern frequency |
| Endorsements | Human "this is useful" | `/endorse` | Validates value |
| Deprecations | Human "no longer useful" | `/deprecate` | Marks outdated |

**Cross-reference**: For failure observations, see `failure-tracker` which uses
`confirm`/`disconfirm` (equivalent to `endorse`/`deprecate` for patterns).

**Strength Classification**:
- HIGH: R ≥ 5 AND endorsements ≥ 2
- MEDIUM: R ≥ 3 OR endorsements ≥ 1
- LOW: R < 3 AND endorsements = 0

## Constraint Gate

**CRITICAL**: Pattern observations are **never eligible** for constraint promotion.

The `type: pattern` field is the single source of truth:
- `type: failure` → constraint-generator considers for promotion
- `type: pattern` → constraint-generator ignores (hard-coded exclusion)

This prevents positive practices from becoming restrictive rules. Patterns are
for knowledge capture and replication, not enforcement.

## Integration

- **Layer**: Core
- **Depends on**: context-packet (for evidence hashing)
- **Used by**: pbd-strength-classifier (Phase 6 - pattern-based development)

## Storage Location

```
docs/observations/
├── failures/           # failure-tracker output
│   └── <slug>.md
├── patterns/           # observation-recorder output
│   └── <slug>.md       # e.g., successful-tdd-workflow.md
└── *.md                # existing observations (legacy, not auto-generated)
```

**Naming Convention**: `<slug>.md` where slug is kebab-case pattern identifier.

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No description provided | Error: "Pattern description required" |
| No source provided | Error: "Source location required (file:line)" |
| Invalid source format | Error: "Source must be in format file:line" |
| Observation not found | Error: "Observation not found: <slug>" |
| Already endorsed by user | Warning: "Already endorsed by this user" |
| Attempting to confirm (wrong command) | Error: "Use 'endorse' for patterns, 'confirm' for failures" |

## Semantic Matching Details

When recording patterns, existing observations are searched for semantic similarity:

| Pattern A | Pattern B | Match? | Action |
|-----------|-----------|--------|--------|
| "Used TDD workflow" | "Test-first development" | YES (0.91) | Increment R |
| "Good commit messages" | "Descriptive PR titles" | NO (0.52) | New observation |
| "Early context loading" | "Load CLAUDE.md at start" | YES (0.85) | Increment R |

**Two-stage matching** (from RG-3 research):
1. Fast embedding filter (< 0.5 similarity → skip)
2. Deep LLM classification (≥ 0.5 → full semantic analysis)

## Example Workflow

```
# Day 1: Pattern observed
/observation-recorder record "Used TDD: test first, then code" --source src/auth/login.test.ts:15

# Day 2: Related pattern observed (auto-matched)
/observation-recorder record "Wrote failing test before implementation" --source src/handlers/user.test.ts:42

# Day 2: Someone finds it useful
/observation-recorder endorse successful-tdd-workflow

# Day 5: More observations
/observation-recorder record "TDD workflow for API client" --source src/services/api.test.ts:88

# Check status
/observation-recorder status successful-tdd-workflow
# → Strength: MEDIUM (R=3, endorsed=1)

# More endorsements over time → HIGH strength
```

## Use Cases

1. **Knowledge Capture**: Document what works well for future reference
2. **Onboarding**: New team members learn proven patterns
3. **Pattern-Based Development**: Feed into PBD strength classifier
4. **Best Practices**: Identify candidates for team guidelines

## Acceptance Criteria

- [x] Creates pattern observation file with correct format
- [x] R counter auto-increments on related patterns
- [x] Semantic matching identifies related patterns
- [x] Source diversity tracked
- [x] Endorsement counter increments on endorse
- [x] Deprecation counter increments on deprecate
- [x] Type field is always "pattern" (never "failure")
- [x] NOT eligible for constraint generation (hard-coded exclusion)
- [x] Strength classification (HIGH/MEDIUM/LOW) based on R and endorsements
- [x] Generates context packets for evidence
- [x] Lists patterns with strength indicators

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
