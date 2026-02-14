---
name: skill-name
version: 1.0.0
description: One-line description
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, category]
---

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
