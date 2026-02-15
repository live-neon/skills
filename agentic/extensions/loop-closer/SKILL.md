---
name: loop-closer
version: 1.0.0
description: Detect open loops (DEFERRED, PLACEHOLDER, TODO) before marking work complete
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, loops, completion, hygiene]
layer: extensions
status: active
source: docs/workflows/closing-loops.md
n_count: 3
---

# loop-closer

Detect open loops before marking work complete. Scans for DEFERRED observations,
PLACEHOLDER markers, and unclosed TODOs that could become forgotten failures.

## Problem Being Solved

Work is often marked complete while open items remain:
- DEFERRED observations waiting for resolution
- PLACEHOLDER markers in documentation
- TODO/FIXME comments in code

These forgotten items accumulate as technical debt and cause failures later.

## Usage

```
/loop-closer scan                      # Full scan of common locations
/loop-closer scan --type todos         # TODOs only
/loop-closer scan --type deferred      # DEFERRED observations only
/loop-closer scan --type placeholders  # PLACEHOLDER markers only
/loop-closer check <path>              # Check specific file or directory
```

## Example

```bash
# Before marking a PR complete
/loop-closer scan

# Check specific directory
/loop-closer check docs/observations/
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: scan, check |
| --type | No | Filter: todos, deferred, placeholders, all (default: all) |
| path | No | Specific path for check command |
| --verbose | No | Show all matches, not just summary |

## Output

### Scan Results

```
/loop-closer scan

OPEN LOOPS DETECTED
===================

DEFERRED Observations (2):
  1. docs/observations/api-timeout-handling.md
     Status: DEFERRED
     Reason: Blocked by external API documentation

  2. docs/observations/test-flakiness.md
     Status: DEFERRED
     Reason: Needs investigation

PLACEHOLDER Markers (3):
  1. docs/plans/phase6-implementation.md:45
     <!-- PLACEHOLDER: Add timeline -->

  2. docs/api/endpoints.md:120
     [PLACEHOLDER: Document error codes]

  3. ARCHITECTURE.md:89
     <!-- PLACEHOLDER: Dependency graph -->

Unclosed TODOs (5):
  1. src/handlers.ts:23
     // TODO: Add input validation

  2. src/handlers.ts:67
     // FIXME: Handle edge case

  3. tests/api.test.ts:45
     // TODO: Add negative tests

  4. src/utils.ts:12
     // XXX: Security review needed

  5. src/utils.ts:89
     /** @todo Add unit tests */

Summary:
  - DEFERRED: 2
  - PLACEHOLDER: 3
  - TODO/FIXME/XXX: 5
  - Total open loops: 10

Recommendation: Resolve or document these items before marking complete.
```

### Check Specific Path

```
/loop-closer check src/handlers.ts

OPEN LOOPS IN: src/handlers.ts
==============================

Line 23: // TODO: Add input validation
Line 67: // FIXME: Handle edge case

Total: 2 open loops
```

## Detection Patterns

| Type | Patterns Detected |
|------|-------------------|
| DEFERRED | `status: DEFERRED` in observation frontmatter |
| PLACEHOLDER | `<!-- PLACEHOLDER:`, `[PLACEHOLDER:`, `PLACEHOLDER:` |
| TODO | `// TODO:`, `# TODO:`, `/* TODO:`, `@todo` |
| FIXME | `// FIXME:`, `# FIXME:`, `/* FIXME:` |
| XXX | `// XXX:`, `# XXX:` (security/critical markers) |

## Scan Locations

Default scan includes:
- `docs/observations/` - DEFERRED observations
- `docs/plans/` - PLACEHOLDER markers
- `docs/` - Documentation PLACEHOLDERs
- `src/` - Code TODOs
- `tests/` - Test TODOs

## Integration

- **Layer**: Extensions
- **Depends on**: None (standalone)
- **Used by**: Pre-commit workflows, PR reviews

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Path not found | Error: "Path not found: <path>" |
| No open loops | Info: "No open loops detected" |
| Permission denied | Error: "Cannot read: <path>" |

## Acceptance Criteria

- [x] Detects DEFERRED observations
- [x] Detects PLACEHOLDER markers (3 formats)
- [x] Detects TODO/FIXME/XXX comments
- [x] Provides actionable report with file locations
- [x] --type filter works correctly
- [x] check command works for specific paths
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Run before marking work complete:
```bash
/loop-closer scan
```

**Verification**: `cd tests && npm test -- --grep "loop-closer"`
