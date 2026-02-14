---
name: twin-review
version: 1.0.0
description: Spawns twin reviewers (technical + creative) for N=2 review coverage
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, twin, parallel]
layer: review
status: active
---

# twin-review

Spawns twin reviewers (technical + creative) for N=2 review coverage.
Automates the twin review workflow with file verification and parallel execution.

**Existing Workflow Reference**: `docs/workflows/twin-review.md`

## Problem Being Solved

Twin reviews require spawning two agents with identical context, collecting results,
and ensuring both review the same file versions. Manual coordination is error-prone.

## Usage

```
/twin-review <file-or-plan>
/twin-review <file> --twin <technical|creative>
/twin-review <plan> --type <plan|code|docs>
/twin-review --collect <session-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file-or-plan | Yes | Path to file or plan to review |
| --twin | No | Single twin mode (default: both) |
| --type | No | Review type hint (default: auto-detect) |
| --collect | No | Collect results from session |

## Twin Specializations

| Twin | Focus | Reviews |
|------|-------|---------|
| Technical | Backend, infra, planning, testing, docs accuracy | Architecture, correctness, edge cases |
| Creative | UX, HTMX, forms, visual, docs clarity | Usability, readability, presentation |

## File Verification Protocol (CRITICAL)

From `docs/workflows/twin-review.md` lines 129-149, 382-494:

1. **SHA-256 checksums required**: All files passed to twins MUST include checksums
2. **Verbose file references**: Path + lines + hash + commit + verified date
3. **Verification command**: `shasum -a 256 <file> | head -c 16` for quick verification
4. **Twin verification**: Each twin MUST verify SHA-256 matches before reviewing

**Note**: SHA-256 standardized per N=2 code review (2026-02-14). MD5 deprecated due to
collision vulnerability. 16-char prefix provides adequate uniqueness for quick verification.

### Verification Output (embedded in context)

```
File Manifest (照:file-reference-protocol):
- src/git/push.ts [187 lines] [sha256:a1b2c3d4e5f6g7h8] [main@abc123] [verified 2026-02-13]
- tests/push.test.ts [234 lines] [sha256:e5f6g7h8a1b2c3d4] [main@abc123] [verified 2026-02-13]
```

### Twin Agent Requirement

Before reviewing, each twin MUST output:
```
Verifying file checksums...
  src/git/push.ts: sha256:a1b2c3d4e5f6g7h8 (matches)
  tests/push.test.ts: sha256:e5f6g7h8a1b2c3d4 (matches)
Proceeding with review.
```

If checksum mismatch: STOP review, report error, request re-normalization.

## Workflow Mandates

| Mandate | Source | Enforcement |
|---------|--------|-------------|
| Read-only mode | review.md:28-42 | Twins MUST NOT modify files under review |
| Parallel invocation | twin-review.md:21-49 | Twins MUST spawn in parallel, not sequential |
| Same Prompt Principle | cognitive-review.md:58-68 | Identical prompts to all reviewers |

**Feedback Loop**: Skill invocation does NOT trigger workflow feedback updates.
Feedback loop is for human-driven workflow invocations per `docs/workflows/twin-review.md`.

## Output

```
TWIN REVIEW: docs/plans/example-plan.md
---------------------------------------

Context Normalized: norm-2026-02-13-001
Files: 3 (1,250 tokens)

File Manifest:
- docs/plans/example-plan.md [450 lines] [sha256:abc12345def67890]
- src/feature.ts [200 lines] [sha256:def67890abc12345]
- tests/feature.test.ts [180 lines] [sha256:ghi11223jkl44556]

Spawning reviewers (parallel)...
  twin-technical (agent abc123) - SPAWNED
  twin-creative (agent def456) - SPAWNED

Results will be collected at:
  /twin-review --collect abc123,def456
```

## Example

```
/twin-review docs/plans/2026-02-13-feature-plan.md

TWIN REVIEW: docs/plans/2026-02-13-feature-plan.md
--------------------------------------------------

Context Normalized: norm-2026-02-13-042
Files: 1 (890 tokens)

File Manifest:
- docs/plans/2026-02-13-feature-plan.md [312 lines] [sha256:f4e3d2c1b0a98765]

Spawning reviewers (parallel)...
  twin-technical (agent tech-001) - SPAWNED
  twin-creative (agent creat-002) - SPAWNED

Status: RUNNING
Estimated completion: 5-10 minutes

Collect results: /twin-review --collect tech-001,creat-002
```

## Integration

- **Layer**: Review
- **Depends on**: prompt-normalizer, context-packet
- **Used by**: review-selector, workflow skills

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Checksum mismatch | Error: "SHA-256 mismatch for <file>. Expected <hash>, got <actual>. Re-normalize." |
| Agent spawn failed | Error: "Failed to spawn <twin>. Check agent availability." |
| Context too large | Error: "Context exceeds token budget (<tokens>). Reduce file count." |

## Acceptance Criteria

- [ ] Spawns both twin agents in parallel (not sequential)
- [ ] Context normalized before spawning (prompt-normalizer integration)
- [ ] File verification protocol enforced (SHA-256 checksums in manifest)
- [ ] Each twin verifies checksums before reviewing
- [ ] Read-only mode enforced (twins cannot modify files)
- [ ] Results collectable after completion
- [ ] Review type affects prompt (plan vs code vs docs)
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
