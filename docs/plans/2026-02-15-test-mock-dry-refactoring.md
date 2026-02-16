---
created: 2026-02-15
type: plan
status: backlog
priority: low
prerequisite: ">10 test files in tests/"
deferred_from:
  - ../implementation/agentic-phase7-results.md
related:
  - ../../tests/README.md
  - ../../tests/mocks/
---

# Test Mock DRY Refactoring Plan

## Summary

Extract common test utilities (parseFrontmatter, mock helpers) into shared modules
to reduce duplication across test files. Currently each test file has its own variants.

**Trigger**: When test file count exceeds 10
**Duration**: 0.5 day
**Output**: Shared test utilities in `tests/utils/`

## Background

Phase 7 identified duplicate mock patterns across test files:

> **Analysis**:
> - 4 test files have parseFrontmatter variants
> - Different frontmatter types require different interfaces
> - Self-contained tests improve debugging clarity
>
> **Recommendation**: Extract to shared utilities when test file count exceeds 10.

**Current state**: 1 test file (consolidated), self-contained mocks
**Trigger state**: When tests/ contains >10 test files

## Prerequisites

Before starting:

- [ ] Test file count > 10
- [ ] Patterns stabilized (no major test refactoring planned)
- [ ] Current tests passing

### Verification

```bash
# Count test files
find tests/ -name "*.test.ts" | wc -l

# Check current test status
cd tests && npm test
```

## Stage 1: Pattern Analysis

**Duration**: 30 minutes
**Goal**: Identify common patterns to extract

### Tasks

1. **Inventory mock patterns**
   ```bash
   grep -r "parseFrontmatter\|mockSkill\|createMock" tests/ --include="*.ts"
   ```

2. **Categorize by type**
   - Frontmatter parsing (different interfaces)
   - Skill mocking (SKILL.md structure)
   - File system mocking
   - Assertion helpers

3. **Document interfaces**
   - List all interface variants
   - Note which tests use which

### Acceptance Criteria

- [ ] All mock patterns inventoried
- [ ] Categories documented
- [ ] Interface variants listed

## Stage 2: Utility Module Design

**Duration**: 30 minutes
**Goal**: Design shared utility structure

### Tasks

1. **Create utility structure**
   ```
   tests/
   ├── utils/
   │   ├── index.ts           # Re-exports
   │   ├── frontmatter.ts     # Parsing utilities
   │   ├── mocks.ts           # Mock factories
   │   └── assertions.ts      # Custom assertions
   ```

2. **Design generic interfaces**
   - Use generics for frontmatter types
   - Factory functions for mocks
   - Composable assertion helpers

3. **Plan migration path**
   - Which tests migrate first?
   - How to maintain backward compatibility?

### Acceptance Criteria

- [ ] Utility structure designed
- [ ] Generic interfaces drafted
- [ ] Migration path documented

## Stage 3: Implementation

**Duration**: 1.5 hours
**Goal**: Create shared utilities

### Tasks

1. **Create frontmatter utility**
   ```typescript
   // tests/utils/frontmatter.ts
   export interface FrontmatterResult<T> {
     data: T;
     content: string;
   }

   export function parseFrontmatter<T>(content: string): FrontmatterResult<T> {
     // Generic implementation
   }
   ```

2. **Create mock factories**
   ```typescript
   // tests/utils/mocks.ts
   export function createMockSkill(overrides?: Partial<Skill>): Skill {
     return {
       name: 'test-skill',
       description: 'Test skill',
       ...overrides,
     };
   }
   ```

3. **Create assertion helpers**
   ```typescript
   // tests/utils/assertions.ts
   export function assertValidSkill(skill: unknown): asserts skill is Skill {
     // Type guard with helpful errors
   }
   ```

4. **Export from index**
   ```typescript
   // tests/utils/index.ts
   export * from './frontmatter';
   export * from './mocks';
   export * from './assertions';
   ```

### Acceptance Criteria

- [ ] All utilities implemented
- [ ] Types properly exported
- [ ] No circular dependencies

## Stage 4: Migration

**Duration**: 1 hour
**Goal**: Update tests to use shared utilities

### Tasks

1. **Update imports**
   ```typescript
   // Before
   function parseFrontmatter(content: string) { ... }

   // After
   import { parseFrontmatter } from '../utils';
   ```

2. **Remove duplicate code**
   - Delete inline mock functions
   - Delete inline parsers
   - Delete inline assertions

3. **Verify tests pass**
   ```bash
   cd tests && npm test
   ```

4. **Update test README**
   - Document shared utilities
   - Add usage examples

### Acceptance Criteria

- [ ] All tests migrated
- [ ] No duplicate mock code
- [ ] Tests still pass
- [ ] README updated

## Success Criteria

- [ ] Shared utilities in `tests/utils/`
- [ ] All tests using shared utilities
- [ ] No duplicate mock patterns
- [ ] Test README documents utilities

## Files Created

- `tests/utils/index.ts`
- `tests/utils/frontmatter.ts`
- `tests/utils/mocks.ts`
- `tests/utils/assertions.ts`

## Cross-References

- **Phase 7 Decision**: `docs/implementation/agentic-phase7-results.md` (Stage 3)
- **Current Tests**: `tests/e2e/skill-loading.test.ts`
- **Test Mocks**: `tests/mocks/`

---

*Plan created 2026-02-15. Deferred from Phase 7 - waiting for >10 test files.*
