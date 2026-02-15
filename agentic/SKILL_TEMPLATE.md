---
name: skill-name
version: 1.0.0
description: One-line description
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, category]
layer: core  # foundation | core | review | detection | governance | safety | bridge | extensions
status: active  # active | deprecated | removed
---

<!-- NOTE: The inline comments on `layer` and `status` fields above (e.g., "# foundation | core | ...")
     are for template guidance only. When creating actual SKILL.md files, omit these comments
     for cleaner frontmatter. Example: use `layer: core` not `layer: core  # foundation | core | ...` -->

# skill-name

Brief description of what this skill does and why it exists in the agentic system.

## Usage

```
/skill-name <required-arg> [optional-arg]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| required-arg | Yes | Description of the required argument |
| optional-arg | No | Description (default: value) |

## Output

Description of what the skill outputs. Include format details.

```
[Example output format]
```

## Example

```
/skill-name example-input

[Expected output for this example]
```

## Integration

- **Layer**: (Choose based on dependencies—see guidance below)
- **Depends on**: [list of skills this depends on, or "None (foundational)"]
- **Used by**: [list of skills that use this]

**Layer Selection Guide**:

| Layer | Dependency Rule | When to Use |
|-------|-----------------|-------------|
| Foundation | No dependencies on other agentic skills | Low-level primitives |
| Core | Depends only on Foundation | Memory operations |
| Review/Detection | Depends on Foundation or Core | Analysis and recognition |
| Governance/Safety | May depend on any lower layer | Lifecycle and protection |
| Bridge | May depend on any layer | External integrations |
| Extensions | May depend on any layer | Observation-backed skills |

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Missing input | Error message explaining what's needed |
| Invalid format | Error message with expected format |

## Acceptance Criteria

- [ ] Criterion 1: Specific, testable requirement
- [ ] Criterion 2: Another specific requirement
- [ ] Criterion 3: Edge case handling

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
- Update `docs/implementation/agentic-phase{N}-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
