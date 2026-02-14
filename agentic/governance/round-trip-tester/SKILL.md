---
name: round-trip-tester
version: 1.0.0
description: Validate struct-markdown synchronization for constraints
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, governance, validation, sync]
---

# round-trip-tester

Validate struct/markdown synchronization for constraints. Detects drift between
structured format (JSON/state files) and markdown format (CONSTRAINT.md).

## Problem Being Solved

Constraints exist in both structured format (JSON/state files) and markdown format
(CONSTRAINT.md). These must stay synchronized. round-trip-tester detects drift
and can auto-fix simple cases.

## Usage

```
/round-trip-tester check <constraint>
/round-trip-tester check-all
/round-trip-tester fix <constraint>
/round-trip-tester fix <constraint> --apply
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| check | Yes (id) | Check single constraint for sync drift |
| check-all | - | Check all constraints |
| fix | Yes (id) | Preview fix (dry-run, no changes) |
| --apply | No | Actually apply the fix (requires explicit flag) |

## Round-Trip Test

```
CONSTRAINT.md -> parse -> struct -> serialize -> CONSTRAINT.md'
                          |
                          +-- compare: md == md' ?
```

**Source of Truth**: Markdown (CONSTRAINT.md) is authoritative. Struct is derived.
Auto-fix regenerates struct from markdown, not vice versa.

**Markdown Complexity Limitation**: This approach assumes relatively simple constraint
structure (key-value frontmatter, prose body). If a constraint requires:
- Complex conditional logic
- Nested parameters
- Dynamic expressions

Consider: Split into multiple simpler constraints, OR use a structured format (JSON/YAML)
with markdown serving as high-level documentation only.

## Security Considerations

**Untrusted Input Warning**: This skill is designed for CI/CD use on project-internal
constraint files. Do NOT run on untrusted or user-supplied markdown files.

Maliciously crafted markdown could:
- Cause parser DoS via pathological regex
- Inject unexpected content during serialization

For external constraint sources, validate content before passing to round-trip-tester.

## Output

```
ROUND-TRIP TEST: git-force-push-safety
--------------------------------------

Status: DRIFT DETECTED

Differences:
  Line 12: severity: "critical" -> severity: "CRITICAL" (case)
  Line 45: Missing: "reviewed_date" field

Auto-fixable: Yes
Fix command: /round-trip-tester fix git-force-push-safety --apply
```

## Check-All Output

```
ROUND-TRIP TEST: All Constraints
--------------------------------

| Constraint | Status | Differences | Fixable |
|------------|--------|-------------|---------|
| git-force-push-safety | DRIFT | 2 | Yes |
| test-before-commit | SYNC | 0 | - |
| code-review-required | DRIFT | 1 | Yes |

Total: 3 constraints, 2 with drift

Fix all: /round-trip-tester fix --all --apply
```

## Fix Preview (Safe by Default)

```
/round-trip-tester fix git-force-push-safety

FIX PREVIEW: git-force-push-safety
----------------------------------

Changes to apply:
  Line 12: severity: "critical" -> "CRITICAL"
  Line 45: Add field: reviewed_date: null

DRY-RUN: No changes made.
To apply: /round-trip-tester fix git-force-push-safety --apply
```

## Integration

- **Layer**: Governance
- **Depends on**: constraint-lifecycle
- **Used by**: CI/CD (pre-commit validation), index-generator

## CI/CD Integration

Add to pre-commit or CI pipeline:
```bash
/round-trip-tester check-all --strict
# Exit code 1 if any drift detected
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <id>" |
| Parse error | Error: "Failed to parse <file>: <details>" |
| Not auto-fixable | Warning: "Drift requires manual fix. See differences." |
| Apply without preview | Error: "Run without --apply first to preview changes." |
| Partial write detected | Error: "Partial write detected. Run `/round-trip-tester fix <id> --apply` to resync." |

**Partial Write Recovery**: If an agent crashes mid-update, the struct and markdown
may diverge. Detect via checksum mismatch between expected and actual file sizes.
Recovery requires explicit `--apply` to confirm resync direction.

## Acceptance Criteria

- [ ] Detects drift between markdown and struct
- [ ] Shows detailed differences
- [ ] Dry-run preview is default (safe by default)
- [ ] --apply required for actual changes
- [ ] Auto-fix works for simple cases (case, missing fields)
- [ ] check-all scans entire constraints directory
- [ ] CI-friendly exit codes (0 = sync, 1 = drift)
- [ ] Tests added to skill-behavior.test.ts

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
