# Test Migration Guide

Documents the test structure changes from 48 granular skills to 7 consolidated skills.

## Overview

| Metric | Before | After | Notes |
|--------|--------|-------|-------|
| Test files | 13 | ~8 | Consolidated by skill |
| Test count | 534 | ~100-150 | Contract tests remain, behavioral deduplicated |
| Coverage | 100% specs | 100% sub-commands | Same coverage, fewer tests |

## Current Test Structure (Pre-Migration)

```
tests/
├── pbd/                          # PBD skill tests (unchanged)
│   └── *.test.ts
├── agentic/                      # Granular skill tests
│   ├── core/                     # 14 skills
│   ├── review/                   # 6 skills
│   ├── detection/                # 4 skills
│   ├── governance/               # 5 skills
│   ├── safety/                   # 4 skills
│   ├── bridge/                   # 5 skills
│   └── extensions/               # 10 skills
└── e2e/                          # Integration tests
    ├── phase1-foundation.test.ts
    ├── phase2-core.test.ts
    ├── phase3-review.test.ts
    ├── phase4-governance.test.ts
    ├── phase5-bridge-contracts.test.ts
    └── skill-loading.test.ts
```

## Target Test Structure (Post-Migration)

```
tests/
├── pbd/                          # PBD skill tests (unchanged)
│   └── *.test.ts
├── agentic/                      # Consolidated skill tests
│   ├── failure-memory.test.ts    # /fm sub-commands
│   ├── constraint-engine.test.ts # /ce sub-commands
│   ├── context-verifier.test.ts  # /cv sub-commands
│   ├── review-orchestrator.test.ts # /ro sub-commands
│   ├── governance.test.ts        # /gov sub-commands
│   ├── safety-checks.test.ts     # /sc sub-commands
│   ├── workflow-tools.test.ts    # /wt sub-commands
│   └── clawhub-integration.test.ts # Workspace file formats
└── e2e/                          # Integration tests (consolidated)
    ├── lifecycle.test.ts         # failure→constraint lifecycle
    └── skill-loading.test.ts     # Skill discovery
```

## Test Mapping by Skill

### failure-memory.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `core/failure-tracker.test.ts` | ~15 | `/fm detect`, `/fm record` |
| `core/observation-recorder.test.ts` | ~12 | `/fm record` |
| `core/memory-search.test.ts` | ~10 | `/fm search` |
| `detection/topic-tagger.test.ts` | ~8 | `/fm classify` |
| `detection/failure-detector.test.ts` | ~10 | `/fm detect` |
| `detection/evidence-tier.test.ts` | ~8 | `/fm classify` |
| `detection/effectiveness-metrics.test.ts` | ~10 | `/fm status` |
| `extensions/pattern-convergence-detector.test.ts` | ~6 | `/fm converge` |
| `detection/positive-framer.test.ts` | ~5 | `/fm record` |
| `core/contextual-injection.test.ts` | ~8 | `/fm search` |

**Estimated**: ~92 tests → ~25 consolidated tests

### constraint-engine.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `core/constraint-generator.test.ts` | ~12 | `/ce generate` |
| `core/constraint-lifecycle.test.ts` | ~15 | `/ce lifecycle` |
| `core/constraint-enforcer.test.ts` | ~18 | `/ce check` |
| `core/circuit-breaker.test.ts` | ~20 | `/ce status`, `/ce threshold` |
| `core/emergency-override.test.ts` | ~10 | `/ce override` |
| `review/severity-tagger.test.ts` | ~8 | `/ce threshold` |
| `core/progressive-loader.test.ts` | ~8 | `/ce check` |

**Estimated**: ~91 tests → ~20 consolidated tests

### context-verifier.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `core/context-packet.test.ts` | ~15 | `/cv packet`, `/cv hash` |
| `core/file-verifier.test.ts` | ~12 | `/cv verify` |

**Estimated**: ~27 tests → ~10 consolidated tests

### review-orchestrator.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `review/twin-review.test.ts` | ~15 | `/ro twin` |
| `review/cognitive-review.test.ts` | ~12 | `/ro cognitive` |
| `review/review-selector.test.ts` | ~10 | `/ro select` |
| `review/staged-quality-gate.test.ts` | ~12 | `/ro gate` |
| `review/prompt-normalizer.test.ts` | ~8 | `/ro twin`, `/ro cognitive` |
| `review/slug-taxonomy.test.ts` | ~6 | `/ro select` |

**Estimated**: ~63 tests → ~15 consolidated tests

### governance.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `governance/governance-state.test.ts` | ~15 | `/gov state` |
| `governance/constraint-reviewer.test.ts` | ~12 | `/gov review` |
| `governance/index-generator.test.ts` | ~10 | `/gov index` |
| `governance/round-trip-tester.test.ts` | ~8 | `/gov verify` |
| `governance/version-migration.test.ts` | ~10 | `/gov migrate` |

**Estimated**: ~55 tests → ~12 consolidated tests

### safety-checks.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `safety/model-pinner.test.ts` | ~12 | `/sc model` |
| `safety/fallback-checker.test.ts` | ~10 | `/sc fallback` |
| `safety/cache-validator.test.ts` | ~8 | `/sc cache` |
| `safety/adoption-monitor.test.ts` | ~10 | `/sc session` |
| `extensions/cross-session-safety-check.test.ts` | ~8 | `/sc session` |

**Estimated**: ~48 tests → ~12 consolidated tests

### workflow-tools.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `extensions/loop-closer.test.ts` | ~10 | `/wt loops` |
| `extensions/parallel-decision.test.ts` | ~12 | `/wt parallel` |
| `extensions/threshold-delegator.test.ts` | ~8 | `/wt parallel` |
| `extensions/mce-refactorer.test.ts` | ~12 | `/wt mce` |
| `extensions/hub-subworkflow.test.ts` | ~10 | `/wt subworkflow` |
| `extensions/observation-refactoring.test.ts` | ~8 | `/wt loops` |
| `extensions/constraint-versioning.test.ts` | ~10 | (moved to `/ce version`) |

**Estimated**: ~70 tests → ~15 consolidated tests

### clawhub-integration.test.ts

| Source Test File | Tests | Maps To |
|------------------|-------|---------|
| `bridge/learnings-n-counter.test.ts` | ~10 | Workspace file format |
| `bridge/feature-request-tracker.test.ts` | ~8 | Workspace file format |
| `bridge/wal-failure-detector.test.ts` | ~10 | Workspace file format |
| `bridge/heartbeat-constraint-check.test.ts` | ~8 | HEARTBEAT.md format |
| `bridge/vfm-constraint-scorer.test.ts` | ~12 | Workspace file format |

**Estimated**: ~48 tests → ~10 consolidated tests

## E2E Test Consolidation

| Source | Tests | Target |
|--------|-------|--------|
| `phase1-foundation.test.ts` | ~30 | `lifecycle.test.ts` |
| `phase2-core.test.ts` | ~45 | `lifecycle.test.ts` |
| `phase3-review.test.ts` | ~35 | `lifecycle.test.ts` |
| `phase4-governance.test.ts` | ~40 | `lifecycle.test.ts` |
| `phase5-bridge-contracts.test.ts` | 31 | `clawhub-integration.test.ts` |
| `skill-loading.test.ts` | 8 | `skill-loading.test.ts` (updated) |

## Migration Procedure

### Phase 1: Create New Test Files

```bash
# Create consolidated test structure
mkdir -p tests/agentic-consolidated

# Create test files (one per consolidated skill)
touch tests/agentic-consolidated/failure-memory.test.ts
touch tests/agentic-consolidated/constraint-engine.test.ts
touch tests/agentic-consolidated/context-verifier.test.ts
touch tests/agentic-consolidated/review-orchestrator.test.ts
touch tests/agentic-consolidated/governance.test.ts
touch tests/agentic-consolidated/safety-checks.test.ts
touch tests/agentic-consolidated/workflow-tools.test.ts
touch tests/agentic-consolidated/clawhub-integration.test.ts
```

### Phase 2: Migrate Tests

For each consolidated skill:
1. Copy relevant contract tests from source files
2. Update describe blocks to use sub-command names
3. Update mock implementations for consolidated interfaces
4. Remove duplicate tests (e.g., shared validation logic)

### Phase 3: Update E2E Tests

1. Consolidate phase tests into `lifecycle.test.ts`
2. Update `skill-loading.test.ts` to expect 7 skills
3. Remove phase-specific test files

### Phase 4: Verify Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Verify no regression
# Target: <5% branch coverage delta from baseline
```

## Test Deduplication Strategy

Many granular skills share common patterns. Consolidation eliminates:

| Pattern | Duplicates | Consolidated To |
|---------|------------|-----------------|
| R/C/D counter validation | ~15 tests | 3 tests in `/fm` |
| Severity classification | ~12 tests | 2 tests in `/ce` |
| SHA-256 hash verification | ~10 tests | 2 tests in `/cv` |
| File format validation | ~20 tests | 5 tests in `clawhub-integration` |

## Baseline Metrics

Captured before migration:

```
Test Files  13 passed (13)
     Tests  534 passed | 14 skipped (548)
  Duration  331ms
```

## Success Criteria

- [ ] All consolidated test files created
- [ ] Tests pass: `npm test`
- [ ] Coverage delta: <5% from baseline
- [ ] No orphaned test files in old structure
- [ ] `skill-loading.test.ts` expects 7 agentic skills

---

*Migration guide created 2026-02-15. Execute as part of Stage 6 (Archive).*
