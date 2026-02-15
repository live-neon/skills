---
name: observation-refactoring
version: 1.0.0
description: Detect and execute observation maintenance operations
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, observations, refactoring, maintenance]
layer: extensions
status: active
source: docs/workflows/observation-refactoring.md
n_count: 5
---

# observation-refactoring

Detect candidates for observation maintenance operations: rename, consolidate,
promote, and archive. Execute operations with audit trail.

## Problem Being Solved

Observation directories accumulate maintenance debt:
- Date-prefixed filenames don't convey meaning
- Related observations remain fragmented (duplicating effort)
- Validated patterns aren't promoted to constraints
- Oversized feedback logs slow navigation

## Usage

```
/observation-refactoring scan                         # Find all candidates
/observation-refactoring rename <old> <new>           # Rename observation
/observation-refactoring consolidate <obs1> <obs2>    # Merge observations
/observation-refactoring promote <observation>        # Promote to constraint
/observation-refactoring archive <observation>        # Archive old observation
```

## Example

```bash
# Find maintenance candidates
/observation-refactoring scan

# Rename date-prefixed file
/observation-refactoring rename 2025-11-03-auth.md auth-patterns.md

# Consolidate related observations
/observation-refactoring consolidate api-timeout.md api-retry.md
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: scan, rename, consolidate, promote, archive |
| target | Varies | Path(s) for operation |
| --dry-run | No | Show what would happen without executing |
| --force | No | Override F=2 protection (requires confirmation) |

## Four Operations

| Operation | Trigger | Criteria |
|-----------|---------|----------|
| Rename | Date-prefixed filename | `YYYY-MM-DD-*.md` pattern |
| Consolidate | Developer recognition | Same pattern, different names |
| Promote | N>=5 validated | Strong classification |
| Archive | F>=2 or >50KB | False positive or oversized |

## F=2 Protection

Observations with F>=2 (disconfirmation evidence) are protected from archive.
The `--force` flag is required with explicit confirmation.

Why: F=2 indicates the observation captured a real pattern that was later
invalidated. This history is valuable for understanding pattern evolution.

**Terminology note**: F (False positives) = D (Disconfirmations). In observation
frontmatter, use `d_count` property. "F=2" and "D=2" are equivalent.

## Output

### Scan Results

```
/observation-refactoring scan

OBSERVATION MAINTENANCE SCAN
============================

RENAME Candidates (3):
  1. 2025-11-03-documentation-standards.md
     → documentation-standards.md

  2. 2025-11-09-resist-file-proliferation.md
     → resist-file-proliferation.md

  3. 2025-12-15-plan-approve-implement.md
     → plan-approve-implement-workflow.md

CONSOLIDATE Candidates (1):
  1. api-timeout-handling.md + api-retry-exhaustion.md
     Reason: Both address API resilience, same root cause
     Combined N-count: 7

PROMOTE Candidates (2):
  1. resist-file-proliferation.md (N=11)
  2. plan-approve-implement-workflow.md (N=5)

ARCHIVE Candidates (1):
  1. old-feedback-log.md (87KB)
     Reason: Exceeds 50KB threshold

Total: 7 maintenance operations available
```

### Rename Operation

```
/observation-refactoring rename 2025-11-03-auth.md auth-patterns.md

RENAME OPERATION
================

Source: 2025-11-03-auth.md
Target: auth-patterns.md

Actions:
  1. git mv docs/observations/2025-11-03-auth.md docs/observations/auth-patterns.md
  2. Update frontmatter: created: 2025-11-03
  3. Update any internal links

Status: Complete
Audit: Logged to .observation-refactoring-audit.log
```

### Protected Archive

```
/observation-refactoring archive pattern-with-history.md

ARCHIVE BLOCKED
===============

File: pattern-with-history.md
F-count: 2 (disconfirmation evidence)

This observation is F=2 protected.
Reason: Contains valuable history of pattern evolution.

To override, use: /observation-refactoring archive --force pattern-with-history.md
This requires explicit confirmation.
```

## Integration

- **Layer**: Extensions
- **Depends on**: pbd-strength-classifier (for promote)
- **Used by**: Monthly observation reviews

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "Observation not found: <path>" |
| F=2 archive attempt | Block: "F=2 protected, use --force" |
| Consolidate same file | Error: "Cannot consolidate with self" |
| Promote N<5 | Warning: "N-count below threshold" |

## Acceptance Criteria

- [x] Identifies rename/consolidate/promote/archive candidates
- [x] Respects F=2 protection
- [x] Creates audit trail for operations
- [x] Supports dry-run mode
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Run monthly maintenance scan:
```bash
/observation-refactoring scan
```

**Verification**: `cd tests && npm test -- -t "observation-refactoring"`
