---
name: cache-validator
version: 1.0.0
description: Validate cached responses to prevent stale data
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, safety, cache, validation]
layer: safety
status: active
---

# cache-validator

Validate cached responses to prevent stale data. Ensures freshness of context
packets, memory search results, and constraint lookups.

## Usage

```
/cache-validator check <cache-key>
/cache-validator status
/cache-validator invalidate <pattern>
/cache-validator configure --ttl <duration>
```

## Example

```bash
# Check cache status overview
/cache-validator status

# Invalidate stale context packets
/cache-validator invalidate "ctx-*"
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| cache-key | Yes (for check) | Cache entry identifier |
| pattern | Yes (for invalidate) | Glob pattern for bulk invalidation |
| --ttl | No | Time-to-live duration (e.g., 10m, 1h) |

## Cache Categories

| Cache | TTL Default | Staleness Risk | Invalidation |
|-------|-------------|----------------|--------------|
| Context packets | 5 minutes | Medium (files change) | Hash-based (file content changed) |
| Memory search | 15 minutes | Low (observations stable) | TTL only |
| Constraint lookup | 1 hour | Low (constraints stable) | TTL + version field |
| Model responses | Session | High (context changes) | Context hash changed |

## Commands

```
/cache-validator check context-packet-abc  # Single cache entry
/cache-validator status                    # Cache health overview
/cache-validator invalidate "ctx-*"        # Invalidate by pattern
/cache-validator configure --ttl 10m       # Adjust default TTL
```

## Output

**Single Entry Check**:
```
CACHE VALIDATION: context-packet-abc
────────────────────────────────────

Status: VALID
TTL: 3m remaining (of 5m)
Last validated: 2026-02-14T10:02:00Z

Content hash: a1b2c3d4
Source files:
  src/main.ts (unchanged)
  src/utils.ts (unchanged)

Freshness: CONFIRMED
```

**Cache Health Overview**:
```
CACHE STATUS
────────────

Total entries: 47
Valid: 42 (89%)
Stale: 5 (11%)

By Category:
  Context packets: 12 valid, 2 stale
  Memory search: 15 valid, 1 stale
  Constraint lookup: 10 valid, 2 stale
  Model responses: 5 valid, 0 stale

Recommendations:
  - Invalidate stale context-packet-xyz (source changed)
  - Consider shorter TTL for constraint lookups
```

## Integration

- **Layer**: Safety
- **Depends on**: context-packet
- **Used by**: Memory skills, constraint lookups

**Stage Sequencing Note**: Initially validates unsigned packets using hash-based
content verification. After packet signing (Stage 6A), will also verify signatures.

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Validation uncertain | Return STALE, force regeneration |
| Source file changed | Invalidate immediately |
| TTL expired | Mark stale, require refresh |
| Hash mismatch | CRITICAL - potential tampering |

**Fail-Closed Behavior**: When validation fails or is uncertain, returns STALE
and forces regeneration. Never proceed with potentially stale data in safety-critical paths.

## Acceptance Criteria

- [ ] Detects stale entries accurately
- [ ] TTL configuration works
- [ ] Invalidation patterns work
- [ ] Hash-based validation functional
- [ ] Fail-closed on uncertainty

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
