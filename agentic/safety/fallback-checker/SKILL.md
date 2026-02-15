---
name: fallback-checker
version: 1.0.0
description: Verify fallback strategies exist for graceful degradation
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, safety, fallback, degradation]
layer: safety
status: active
---

# fallback-checker

Verify fallback strategies exist for graceful degradation. Ensures all critical
system components have defined fallback paths when primary options fail.

## Usage

```
/fallback-checker analyze <component>
/fallback-checker coverage
/fallback-checker simulate <failure-scenario>
/fallback-checker verify <component>
```

## Example

```bash
# Check fallback coverage for all components
/fallback-checker coverage

# Verify a specific component's fallback chain
/fallback-checker verify memory-search
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| component | Yes (for analyze/verify) | Component to check (e.g., memory-search, model) |
| failure-scenario | Yes (for simulate) | Scenario to test (e.g., model-failure) |

## Fallback Cascade Behavior

When a primary fails and fallback is activated:
1. Track current fallback index (starts at 0)
2. If current fallback fails, increment index and try next
3. Continue until fallback succeeds or chain exhausted
4. If chain exhausted, enter fail-safe mode (logged bypass)

**Cascade Commands**:
```
/fallback-checker activate <component>           # Activate first fallback
/fallback-checker activate-next <component>      # Move to next fallback in chain
/fallback-checker reset <component>              # Reset to primary
```

## Verify Command

The verify command performs shallow availability checks without running full operations:

```
/fallback-checker verify model
```

**Output**:
```
FALLBACK VIABILITY CHECK: model
───────────────────────────────

Primary: claude-4-opus
  Status: AVAILABLE (ping: 45ms)

Fallback 1: claude-4-sonnet
  Status: AVAILABLE (ping: 38ms)

Fallback 2: claude-3.5-sonnet
  Status: UNAVAILABLE (error: 503 Service Unavailable)

Risk: MEDIUM (one fallback unavailable)
Recommendation: Investigate claude-3.5-sonnet availability
```

**Checks Performed**:
- Model endpoints: Low-cost API ping to confirm authentication and availability
- Memory services: Health check endpoint
- Constraint services: File existence and parse check

## Fallback Categories

| Category | Primary | Fallback 1 | Fallback 2 |
|----------|---------|------------|------------|
| Model | claude-4-opus | claude-4-sonnet | claude-3.5-sonnet |
| Memory | memory-search | contextual-injection | manual context |
| Constraint | constraint-enforcer | warn-only mode | bypass (logged) |

## Commands

```
/fallback-checker analyze memory-search    # Single component analysis
/fallback-checker analyze model            # Model fallback chain
/fallback-checker coverage                 # Full coverage report
/fallback-checker simulate model-failure   # Test fallback path
/fallback-checker simulate memory-failure  # Test memory fallback
```

## Output

**Component Analysis**:
```
FALLBACK ANALYSIS: memory-search
────────────────────────────────

Primary: memory-search (semantic query)
Fallback 1: contextual-injection (path-based)
Fallback 2: manual context loading

Coverage: COMPLETE

Simulation:
  memory-search fails → contextual-injection activates
  contextual-injection fails → prompt for manual context

Risk: LOW (all paths verified)
```

**Coverage Report**:
```
FALLBACK COVERAGE REPORT
────────────────────────

Component Coverage:
  model:              COMPLETE (3 fallbacks)
  memory-search:      COMPLETE (2 fallbacks)
  constraint-enforcer: COMPLETE (2 fallbacks)
  cache-validator:    PARTIAL (1 fallback)
  circuit-breaker:    NONE (critical gap!)

Overall Coverage: 80% (4/5 components)

Recommendations:
  1. Add fallback for circuit-breaker
  2. Add second fallback for cache-validator
```

**Simulation Result**:
```
SIMULATION: model-failure
─────────────────────────

Scenario: Primary model (claude-4-opus) unavailable

Step 1: Detect model unavailability
Step 2: Check model-pinner for fallback
Step 3: Activate fallback: claude-4-sonnet
Step 4: Log fallback activation
Step 5: Continue operation with fallback model

Result: SUCCESS (graceful degradation)
Latency: +50ms (fallback lookup)
```

## Integration

- **Layer**: Safety
- **Depends on**: model-pinner
- **Used by**: Runtime protection, health monitoring

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No fallback defined | Report CRITICAL gap in coverage |
| Fallback also fails | Chain to next fallback or fail-safe |
| Simulation fails | Report failure point, suggest fix |
| Unknown component | Error with valid component list |

## Acceptance Criteria

- [ ] Identifies fallback chains for all components
- [ ] Coverage report accurate
- [ ] Simulation works without side effects
- [ ] CRITICAL gaps highlighted
- [ ] Risk assessment accurate

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to Safety layer table if new skill
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
