---
name: version-migration
version: 1.0.0
description: Schema versioning and migration for state files
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, governance, versioning, migration]
layer: governance
status: active
---

# version-migration

Schema versioning and migration for state files. Ensures backward/forward
compatibility when state file schemas evolve. Prevents data corruption during
schema transitions.

## Problem Being Solved

State files (`.circuit-state.json`, `.overrides.json`, `.governance-state.json`)
lack version information. When schema changes occur (v1.0.0 → v1.1.0),
migration is manual and error-prone. This skill provides automated versioning
and migration with fail-closed safety.

## Usage

```
/version-migration check
/version-migration migrate <file> --to <version>
/version-migration migrate-all --to <version>
/version-migration rollback <file> --to <version>
/version-migration status
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| check | - | Detect version mismatches across state files |
| migrate | Yes (file) | Migrate specific file to target version |
| migrate-all | - | Migrate all state files to target version |
| rollback | Yes (file) | Rollback specific file to previous version |
| status | - | Show current versions of all state files |
| --to | Yes (for migrate/rollback) | Target version (e.g., 1.1.0) |
| --dry-run | No | Preview migration without applying |
| --force | No | Override compatibility warnings |

## Versioned State Format

All state files use this wrapper format:

```json
{
  "schema_version": "1.0.0",
  "data": {
    // existing state data
  },
  "migration_history": [
    {"from": "0.9.0", "to": "1.0.0", "date": "2026-02-14", "tool": "version-migration"}
  ]
}
```

## Compatibility Rules

| Scenario | Behavior |
|----------|----------|
| Read v1.0 with v1.1 code | Auto-migrate on read (forward compat) |
| Read v1.1 with v1.0 code | Fail with upgrade prompt (no backward) |
| Unknown version (v2.0) | Fail closed, log error, prompt manual intervention |
| Missing version field | Warning + treat as v0.9.0 + auto-migrate |

**Missing Version Warning**: When a state file lacks `schema_version`, it may indicate:
1. Legacy file (expected) - auto-migration proceeds
2. File corruption (unexpected) - investigate before proceeding

Log warning: `"No schema_version field found. Assuming v0.9.0. If unexpected, investigate file integrity before proceeding."`

## Commands

```
/version-migration check                      # Detect mismatches
/version-migration migrate .circuit-state.json --to 1.1.0
/version-migration migrate-all --to 1.1.0 --dry-run
/version-migration rollback .overrides.json --to 1.0.0
/version-migration status                     # Show all versions
```

## Output

**Version Check**:
```
VERSION CHECK
─────────────

State Files:
  .circuit-state.json     v1.0.0 → v1.1.0 available
  .overrides.json         v1.0.0 → v1.1.0 available
  .governance-state.json  v1.1.0 (current)

Mismatches: 2 files need migration

To migrate: /version-migration migrate-all --to 1.1.0
```

**Migration Preview**:
```
MIGRATION PREVIEW (dry-run)
───────────────────────────

File: .circuit-state.json
From: v1.0.0
To: v1.1.0

Changes:
  + Added field: last_health_check
  + Added field: alert_history
  ~ Renamed: trip_count → total_trips

Data preservation: 100% (all fields mapped)

To apply: /version-migration migrate .circuit-state.json --to 1.1.0
```

**Status Overview**:
```
VERSION STATUS
──────────────

Current schema version: 1.1.0

State Files:
  .circuit-state.json     v1.1.0 ✓
  .overrides.json         v1.1.0 ✓
  .governance-state.json  v1.1.0 ✓
  .constraint-index.json  v1.1.0 ✓

All files at current version.
```

## Integration

- **Layer**: Governance
- **Depends on**: None (foundational governance utility)
- **Used by**: governance-state, circuit-breaker, emergency-override

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Unknown version | Fail closed: "Unknown version v2.0.0. Manual intervention required." |
| Migration fails | Rollback to original, preserve backup, log error |
| Data loss detected | Abort: "Migration would lose field 'X'. Use --force to override." |
| File not found | Error: "State file not found: <path>" |
| Permission denied | Error: "Cannot write to: <path>" |

**Fail-Closed Behavior**: When version is unknown or migration fails, refuse to
proceed. Log detailed error with manual recovery steps. Never silently corrupt data.

## Validation

Migration safety is ensured through:

1. **Roundtrip test**: v1.0 → v1.1 → v1.0 produces identical data
2. **Field preservation test**: No data loss during migration
3. **Unknown field handling**: Preserve unknown fields (future-proofing)
4. **Backup creation**: Original file backed up before migration

## Acceptance Criteria

- [ ] Version check detects mismatches
- [ ] Migration transforms data correctly
- [ ] Rollback restores previous version
- [ ] Unknown version fails closed
- [ ] Data loss prevented (abort on field loss)
- [ ] Migration history tracked
- [ ] Tests added to skill-behavior.test.ts

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to Governance layer table if new skill
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
