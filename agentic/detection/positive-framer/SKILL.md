---
name: positive-framer
version: 1.0.0
description: Transform negative rules to positive actionable guidance
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, detection, transformation]
---

# positive-framer

Transform negative "Don't X" rules into positive "Always Y" guidance.
Positive framing is more actionable, easier to follow, and reduces cognitive load.

## Usage

```
/positive-framer "<negative-rule>"
/positive-framer --batch <rules-file>
/positive-framer --constraint <constraint-file>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| rule | Yes* | Negative rule to transform (*not required with --batch/--constraint) |
| --batch | No | File containing multiple rules (one per line) |
| --constraint | No | Constraint file to transform in place |
| --format | No | Output format: text, json, markdown (default: text) |

## Transformation Patterns

| Negative Pattern | Positive Pattern |
|-----------------|------------------|
| "Don't X" | "Always Y (the opposite of X)" |
| "Never X" | "Always Y (the safe alternative)" |
| "Avoid X" | "Prefer Y (the better approach)" |
| "X is not allowed" | "Use Y instead" |
| "Don't X without Y" | "Always Y before X" |

## Output

### Single Rule

```
NEGATIVE: "Don't execute destructive git commands without confirmation"

POSITIVE: "Always request explicit confirmation before executing git commands
           that modify history (reset, rebase, force push, clean)"

Transformation:
  - "Don't" → "Always"
  - "without confirmation" → "request explicit confirmation before"
  - Added specificity: "commands that modify history"
  - Added examples: "(reset, rebase, force push, clean)"

Quality improvements:
  ✓ Actionable: tells you what TO do, not just what NOT to do
  ✓ Specific: lists the commands that require confirmation
  ✓ Measurable: "explicit confirmation" is verifiable
```

### Batch Output

```
/positive-framer --batch rules.txt

TRANSFORMATIONS:

1. NEGATIVE: "Don't commit without tests"
   POSITIVE: "Always include passing tests with every commit"

2. NEGATIVE: "Never bypass git hooks"
   POSITIVE: "Always run git hooks before committing; if hooks fail, fix issues"

3. NEGATIVE: "Don't skip the planning phase"
   POSITIVE: "Always complete the planning phase before implementation"

4. NEGATIVE: "Avoid hardcoding configuration values"
   POSITIVE: "Always use environment variables or config files for configuration"

Summary: 4 rules transformed
```

## Example

```
/positive-framer "Don't skip the planning phase"

NEGATIVE: "Don't skip the planning phase"

POSITIVE: "Always complete the planning phase before implementation"

Transformation:
  - "Don't skip" → "Always complete"
  - "the planning phase" → "the planning phase before implementation"
  - Added temporal context: "before implementation"

Why this is better:
  - Original: Tells you what NOT to do (skip)
  - Transformed: Tells you what TO do (complete) and when (before implementation)
```

## Integration

- **Layer**: Foundation
- **Depends on**: None (foundational skill)
- **Used by**: constraint-generator (for new constraints), observation-recorder

## Transformation Guidelines

### Good Transformations

1. **Preserve Meaning**: The positive version must have the same intent
2. **Add Specificity**: Include "when", "how", or "what" details
3. **Make Actionable**: Reader should know exactly what to do
4. **Keep It Simple**: Don't overcomplicate simple rules

### Examples of Good Transformations

| Negative | Positive | Why It's Good |
|----------|----------|---------------|
| "Don't use magic numbers" | "Always define named constants for numeric values" | Tells you what to do |
| "Never commit secrets" | "Always use environment variables for secrets; add secrets to .gitignore" | Adds how |
| "Avoid global state" | "Prefer dependency injection over global state" | Suggests alternative |

### Compound Rules

For compound negative rules, transform each part:

```
NEGATIVE: "Don't deploy without tests and don't skip code review"

POSITIVE: "Always ensure tests pass before deployment AND
           always complete code review before deployment"
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Empty rule | Error: "Rule cannot be empty" |
| Already positive | Info: "Rule already appears to be positively framed" |
| Ambiguous negation | Returns transformation with note about ambiguity |
| No clear transformation | Returns original with suggestions |

## Quality Metrics

A good positive transformation should be:

- **Actionable**: Starts with a verb (Always, Use, Ensure, Complete)
- **Specific**: Includes what, when, or how
- **Verifiable**: Can objectively determine if rule is followed
- **Complete**: Doesn't lose meaning from original

## Acceptance Criteria

- [ ] Transforms "Don't X" to "Always Y"
- [ ] Preserves semantic meaning of original rule
- [ ] Adds specificity where helpful
- [ ] Handles compound rules (multiple negations)
- [ ] Detects already-positive rules
- [ ] Batch mode processes multiple rules
- [ ] Constraint file mode updates in place
- [ ] Output is actionable and specific
