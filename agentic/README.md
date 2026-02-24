# Neon Agentic Suite

A comprehensive skill suite for AI-assisted software development with built-in learning,
constraint enforcement, and governance. Implements a complete failure-to-constraint lifecycle
with mathematical burden of proof.

## Quick Start

```bash
# Install foundation first
openclaw install leegitw/context-verifier

# Install core skills
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine

# Install additional layers as needed
openclaw install leegitw/safety-checks
openclaw install leegitw/review-orchestrator
openclaw install leegitw/governance
openclaw install leegitw/workflow-tools
```

## Try It Now (2 minutes)

Want to see it work? Install just the core and try these commands:

```bash
# Install core only
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
```

```
# Record an observation (simulating a detected pattern)
/fm record "Tests should run before commit"

# Check status - see your observation
/fm status

# After 3 occurrences (R≥3) and 2 confirmations (C≥2),
# generate a constraint:
/fm record "Tests should run before commit" C
/ce generate OBS-YYYYMMDD-XXX
```

See the [Complete Walkthrough](#complete-walkthrough) below for the full cycle.

## Lifecycle

The suite implements a complete learning lifecycle:

```
Failure → Observation → Pattern → Constraint → Governance
   │          │           │           │            │
   └─ /fm ────┴─ detect ──┴─ R/C/D ───┴─ /ce ──────┴─ /gov
```

1. **Detect**: Failures are automatically detected (test failures, API errors, user corrections)
2. **Record**: Patterns are recorded as observations with R/C/D counters
3. **Classify**: Observations mature through evidence tiers (弱→中→強)
4. **Generate**: Eligible observations become constraints (R≥3 ∧ C≥2)
5. **Govern**: Constraints are reviewed, versioned, and retired over time

## Layer Architecture

| Layer | Skill | Alias | Purpose |
|-------|-------|-------|---------|
| Foundation | context-verifier | `/cv` | File integrity, hashing, context packets |
| Core | failure-memory | `/fm` | Failure detection, observation recording |
| Core | constraint-engine | `/ce` | Constraint generation, enforcement |
| Safety | safety-checks | `/sc` | Model pinning, fallback validation |
| Review | review-orchestrator | `/ro` | Multi-perspective reviews, quality gates |
| Governance | governance | `/gov` | Lifecycle management, compliance |
| Extensions | workflow-tools | `/wt` | Loop detection, parallel decisions, MCE |

## Evidence Tiers

Observations mature through evidence tiers based on R/C/D counters:

| Tier | CJK | Criteria | Meaning |
|------|-----|----------|---------|
| Weak | 弱 | N=1 | Single occurrence, may be noise |
| Emerging | 中 | N=2, R≥2 ∧ C≥1 | Pattern emerging, monitor |
| Strong | 強 | N≥3, R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 | Established, actionable |

> **CJK Notation**: Japanese characters provide compact, memorable identifiers used throughout
> this suite. They are optional—all functionality works with English commands. The CJK column
> appears in command tables for quick reference. Examples: 検出 (detect), 記録 (record), 生成 (generate).

**Counters**:
- **R** (Recurrence): Auto-detected occurrences
- **C** (Confirmations): Human-verified true positives
- **D** (Disconfirmations): Human-verified false positives

**Constraint eligibility**: `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2`

**Why these thresholds?**
- **R≥3**: One occurrence is noise, two is coincidence, three is a pattern
- **C≥2**: Multiple human confirmations prevent single-source bias
- **D/(C+D)<0.2**: Allows some false positives but caps signal degradation at 20%
- **sources≥2**: Cross-validation from independent contexts (different sessions, files, or users)

## Configuration

All skills support configuration via (in order of precedence):
1. `.openclaw/[skill-name].yaml` (OpenClaw standard)
2. `.claude/[skill-name].yaml` (Claude Code compatibility)
3. Defaults (built-in)

## Versioning

All skills follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes to skill interface or config format
- **MINOR**: New features, new examples, new config options
- **PATCH**: Bug fixes, documentation improvements

Current version: **1.0.0** (post-consolidation release)

## Comparison

| Feature | Neon Suite | Traditional Linters | Other AI Tools |
|---------|------------|--------------------|--------------------|
| Learning from failures | ✓ R/C/D counters | ✗ | ✗ |
| Mathematical burden of proof | ✓ Evidence tiers | ✗ | ✗ |
| Human confirmation loop | ✓ C/D counters | ✗ | ✗ |
| Constraint lifecycle | ✓ Draft→Active→Retired | ✗ | ✗ |
| Circuit breaker | ✓ Graduated thresholds | ✗ | ✗ |
| Multi-perspective review | ✓ Technical + Creative | ✗ | Partial |
| Provider-agnostic | ✓ Configurable models | N/A | ✗ |

## Skills

### context-verifier (`/cv`)
File integrity verification, hash computation, and context packet management.
**Foundation layer** - no dependencies, install first.

### failure-memory (`/fm`)
Failure detection, observation recording, and pattern convergence.
**Core layer** - depends on context-verifier.

### constraint-engine (`/ce`)
Constraint generation, enforcement, circuit breaker, and lifecycle management.
**Core layer** - depends on failure-memory.

### safety-checks (`/sc`)
Runtime safety verification for model pinning, fallbacks, cache, and sessions.
**Safety layer** - depends on constraint-engine.

### review-orchestrator (`/ro`)
Multi-perspective review coordination with configurable cognitive modes.
**Review layer** - depends on failure-memory, context-verifier.

### governance (`/gov`)
Constraint lifecycle governance, state management, and periodic reviews.
**Governance layer** - depends on constraint-engine, failure-memory.

### workflow-tools (`/wt`)
Utility tools for workflow management, parallel decisions, and MCE refactoring.
**Extensions layer** - depends on failure-memory, constraint-engine.

## Complete Walkthrough

This walkthrough shows the full failure-to-constraint lifecycle in action.

### Step 1: A Failure Occurs

A test fails, and the agent automatically detects it:

```
> npm test
FAIL: src/auth.test.js - Expected token to be valid

[DETECTED] test failure
Pattern: auth-token-validation
Observation: OBS-20260216-001
R: 1 (first occurrence)
Tier: 弱 (weak)
```

### Step 2: Pattern Recurs (R → 3)

The same failure happens again in different contexts:

```
[DETECTED] test failure
Pattern: auth-token-validation
Observation: OBS-20260216-001
R: 2 → 3
Tier: 弱 → 中 (emerging)
```

### Step 3: Human Confirms (C → 2)

A human reviews and confirms these are true positives:

```
/fm record OBS-20260216-001 C
[CONFIRMED] auth-token-validation
C: 1 → 2
Status: ELIGIBLE (R≥3 ∧ C≥2)
Tier: 中 → 強 (strong)
```

### Step 4: Generate Constraint

The observation becomes an enforced constraint:

```
/ce generate OBS-20260216-001

[CONSTRAINT GENERATED]
ID: CON-20260216-001
Text: "Always validate auth tokens before API calls"
From: OBS-20260216-001 (auth-token-validation)
Severity: IMPORTANT
Status: draft

Next: /ce lifecycle CON-20260216-001 active
```

### Step 5: Constraint Enforced

Future actions are checked against active constraints:

```
> Attempting API call without token validation...

[CHECK BLOCKED]
Constraint violated: CON-20260216-001
  "Always validate auth tokens before API calls"
  Severity: IMPORTANT

Action: Add token validation, then retry.
Override: /ce override CON-20260216-001 "emergency hotfix"
```

### The Loop Closes

```
Failure → Observation → Pattern → Constraint → Enforcement
   ↑                                              │
   └──────────── Prevents Future Failures ────────┘
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Live Neon <hello@liveneon.ai>

---

*Consolidated from 48 granular skills as part of the Neon Agentic Suite v1.0.0 release.*
