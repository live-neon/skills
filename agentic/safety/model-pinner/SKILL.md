---
name: model-pinner
version: 1.0.0
description: Pin and verify model versions for consistency
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, safety, model, versioning]
---

# model-pinner

Pin and verify model versions for consistency. Ensures version consistency within
sessions and across reproducible runs. Prevents behavior drift when model updates occur.

## Usage

```
/model-pinner pin <model> --level <level>
/model-pinner verify
/model-pinner list
/model-pinner unpin --level <level>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| model | Yes (for pin) | Model identifier (e.g., claude-4-opus) |
| --level | No | Pin scope: session (default), project, global |

## Pin Levels

| Level | Scope | Use Case | Config Location |
|-------|-------|----------|-----------------|
| Session | Current session only | Default for exploration | In-memory |
| Project | This codebase | Reproducible builds | `.claude/model-pin.json` |
| Global | All projects | Enterprise consistency | `~/.claude/global-pin.json` |

**Precedence**: Session > Project > Global

## Commands

```
/model-pinner pin claude-4-opus --level session   # Current session only
/model-pinner pin claude-4-opus --level project   # This codebase
/model-pinner pin claude-4-opus --level global    # All projects
/model-pinner verify                              # Check current session
/model-pinner list                                # Show all pins
/model-pinner history                             # Pin change history
/model-pinner unpin --level project               # Remove project pin
```

## Output

**Session Pin Status**:
```
MODEL PIN STATUS
────────────────

Session: abc123
Pinned: claude-4-opus (exact: claude-4-opus-20260101)

Verification:
  Current model: claude-4-opus-20260101 ✓
  Pin level: session
  Expires: end of session

Drift detected: None
```

**Project Pin Status**:
```
MODEL PIN STATUS
────────────────

Project: /Users/twin/multiverse
Pinned: claude-4-opus (exact: claude-4-opus-20260101)
Config: .claude/model-pin.json

Verification:
  Current model: claude-4-opus-20260101 ✓
  Pin level: project
  Expires: never (until unpinned)

Drift detected: None
```

**Global Pin Status**:
```
MODEL PIN STATUS
────────────────

Global pin active
Pinned: claude-4-sonnet (exact: claude-4-sonnet-20260115)
Config: ~/.claude/global-pin.json

Verification:
  Current model: claude-4-sonnet-20260115 ✓
  Pin level: global
  Expires: never (until unpinned)
  Override: project pins take precedence

Drift detected: None
```

## Integration

- **Layer**: Safety
- **Depends on**: None (foundational safety skill)
- **Used by**: fallback-checker, all model-using skills

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Pinned model unavailable | BLOCK operation, error with fallback suggestion |
| No fallback defined | Fail closed, require explicit resolution |
| Version drift detected | Warning + verification prompt |
| Invalid model identifier | Error with valid model list |

**Fail-Closed Behavior**: If pinned model unavailable and no fallback defined,
BLOCK operation with error. Never silently use unpinned model.

## Acceptance Criteria

- [ ] Creates valid pins at session/project/global levels
- [ ] Version verification accurate
- [ ] Pin precedence works (session > project > global)
- [ ] Fail-closed on unavailable model
- [ ] History tracks pin changes

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
