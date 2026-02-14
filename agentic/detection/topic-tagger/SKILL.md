---
name: topic-tagger
version: 1.0.0
description: Infers topic tags from file paths, content, and context
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, detection, classification, tags]
---

# topic-tagger

Infers topic tags from file paths, content, and context.
Enables filtering constraints and observations by domain.

**Classification Method**: LLM-based semantic classification (NOT keyword matching)
**Reference**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

## Problem Being Solved

Constraints and observations need topic tags for filtering. Manual tagging is
inconsistent. Auto-tagging from file paths and content ensures coverage.

## Usage

```
/topic-tagger tag <file>
/topic-tagger tag-batch <directory>
/topic-tagger suggest "<description>"
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes (tag) | Path to file to tag |
| directory | Yes (tag-batch) | Directory to batch tag |
| description | Yes (suggest) | Text description to tag |

## Tag Categories

| Category | Example Tags | Detection Signals |
|----------|-------------|-------------------|
| Domain | git, database, auth, api | File path, imports, function names |
| Layer | frontend, backend, infra | Directory structure, file extensions |
| Concern | security, performance, reliability | Content analysis, error patterns |
| Workflow | planning, implementing, reviewing | Context from session state |

## Confidence Threshold

Tags with confidence >= 0.7 are included automatically.
Tags with confidence 0.5-0.7 are suggested but not auto-applied.
Tags with confidence < 0.5 are excluded.

## Output

```
TOPIC TAGS: src/git/push.ts
---------------------------

Tags (confidence >= 0.7):
  - git (0.95)        # path: src/git/*
  - version-control (0.88)  # semantic: git operations
  - safety (0.72)     # content: force, destructive

Suggested (0.5-0.7):
  - backend (0.65)    # below threshold, consider adding

Detection signals:
  - Path pattern: src/git/* -> git
  - Import: child_process -> backend
  - Content: "force", "push", "--no-verify" -> safety
```

## Example

```
/topic-tagger tag src/auth/login.ts

TOPIC TAGS: src/auth/login.ts
-----------------------------

Tags (confidence >= 0.7):
  - auth (0.97)           # path: src/auth/*
  - security (0.89)       # semantic: authentication
  - backend (0.82)        # layer detection

Suggested (0.5-0.7):
  - session (0.61)        # content mentions sessions

Applied: auth, security, backend
```

```
/topic-tagger tag-batch docs/constraints/

BATCH TAGGING: docs/constraints/
--------------------------------

Files tagged: 12

Tag distribution:
  - workflow (8 files)
  - git (5 files)
  - security (3 files)
  - testing (2 files)

New tags discovered:
  - code-review (2 files) - added to taxonomy
```

```
/topic-tagger suggest "force push safety constraint"

TAG SUGGESTION
--------------

Input: "force push safety constraint"

Suggested tags:
  - git (0.91)
  - safety (0.88)
  - workflow (0.74)

These tags would apply to a constraint about this topic.
```

## Integration

- **Layer**: Detection
- **Depends on**: context-packet
- **Used by**: memory-search, contextual-injection, review-selector

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Empty content | Warning: "No content to analyze. Using path-based tags only." |
| No tags detected | Warning: "No tags above threshold. Consider manual tagging." |
| Binary file | Warning: "Binary file detected. Using path-based tags only." |
| Partial batch failure | Warning: "Tagged X/Y files. Failures: [paths]. Review manually." |

## Acceptance Criteria

- [ ] Infers tags from file paths
- [ ] Content analysis adds semantic tags
- [ ] Confidence scores reflect detection quality
- [ ] Threshold filtering works (0.7 auto, 0.5-0.7 suggested)
- [ ] Batch tagging works on directories
- [ ] Suggest command works for descriptions
- [ ] Detection signals explained in output
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
