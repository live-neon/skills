# Skills Test Suite

> Part of [Live Neon Skills](../README.md) — unified testing for all skill categories.

## Quick Start

```bash
npm install
npm test
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (PBD + Agentic) |
| `npm run test:watch` | Run in watch mode |
| `npm run test:pbd` | Run PBD skill tests only |
| `npm run test:agentic` | Run Agentic skill tests only |
| `npm run test:e2e` | Run E2E tests only |
| `npm run test:real-llm` | Run with real LLM (requires USE_REAL_LLM=true) |
| `npm run test:behavior` | Run behavioral tests only |

## Test Structure

```
tests/
├── package.json          # Test dependencies (vitest, yaml)
├── e2e/
│   ├── skill-loading.test.ts   # Validates ALL skills format (structure)
│   └── skill-behavior.test.ts  # Behavioral tests (Phase 2, requires LLM)
└── fixtures/
    └── mock-workspace/   # Sample constraints/observations
        ├── docs/constraints/active/
        └── docs/observations/
```

## Testing Documentation-Only Skills

These skills are AI instruction sets, not executable code. This creates a unique testing challenge:

| Test Type | What It Validates | Phase |
|-----------|-------------------|-------|
| **Structure** | Required sections present, frontmatter valid | Current (Phase 1) |
| **Consistency** | Matches template, semantic versioning | Current (Phase 1) |
| **Behavior** | AI correctly follows instructions | Phase 2+ |

**Why structure testing first**: We can programmatically verify that SKILL.md files have correct
format, required sections, and valid metadata. This catches documentation drift and ensures
contributor consistency.

**Why behavioral testing is harder**: Verifying that an AI follows instructions correctly requires
LLM integration. We need to invoke the skill, capture output, and validate against expected behavior.
This is planned for Phase 2 with `npm run test:real-llm`.

**Current gap**: Tests validate documentation *exists* but not that execution is *correct*. Manual
validation via review workflows (twin-review, code-review) fills this gap until behavioral tests
are implemented.

## What's Tested

### skill-loading.test.ts

Validates all SKILL.md files across both categories:

- **Skill Discovery**: Finds skills in `pbd/` and `agentic/` directories
- **Frontmatter Validation**: Checks required fields (name, version, description)
- **Format Validation**: Semantic versioning, non-empty descriptions
- **Agentic-Specific**: Required sections (Usage, Example, Integration)

### Current Coverage

```
Discovered 12 skills:
  PBD: 7
  Agentic: 5

Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Docker Testing

For OpenClaw-based testing, see [docker/README.md](../docker/README.md).

## Adding New Tests

1. Create test file in appropriate directory (`e2e/`, `unit/`, etc.)
2. Follow vitest conventions
3. Use fixtures from `fixtures/mock-workspace/` for constraint/observation tests

## Related Documentation

- [Root README](../README.md) - Installation and skill overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System design
- [Phase 1 Results](../docs/implementation/agentic-phase1-results.md) - Implementation status

---

*Tests run via [vitest](https://vitest.dev/) v1.6.1*
