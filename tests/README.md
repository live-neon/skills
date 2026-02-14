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

## Test Structure

```
tests/
├── package.json          # Test dependencies (vitest, yaml)
├── e2e/
│   └── skill-loading.test.ts   # Validates ALL skills format
└── fixtures/
    └── mock-workspace/   # Sample constraints/observations
        ├── docs/constraints/active/
        └── docs/observations/
```

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
