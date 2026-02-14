---
name: prompt-normalizer
version: 1.0.0
description: Ensures identical context across all reviewers in multi-reviewer sessions
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, context, normalization]
---

# prompt-normalizer

Ensures identical context is provided to all reviewers in a multi-reviewer session.
Critical for valid N>=2 reviews where reviewers must see exactly the same input.

## Problem Being Solved

When spawning twin reviewers or cognitive modes, each gets its own context window.
If context differs (different file versions, different ordering, missing files), the
reviews aren't truly independent—they're reviewing different things.

## Usage

```
/prompt-normalizer create <file-list>
/prompt-normalizer verify <packet-id>
/prompt-normalizer diff <packet-a> <packet-b>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file-list | Yes | Comma-separated file paths to normalize |
| packet-id | Yes (verify) | Packet ID to verify |
| packet-a, packet-b | Yes (diff) | Packet IDs to compare |

## Context Normalization Rules

1. **File ordering**: Alphabetical by path (deterministic)
2. **File content**: Hash-verified at time of normalization
3. **System prompts**: Stripped of session-specific details (timestamps, random seeds)
4. **Token budget**: Identical allocation across all reviewers

## Output

Creates a frozen context packet with checksums:

```json
{
  "packet_id": "norm-2026-02-13-001",
  "created": "2026-02-13T10:00:00Z",
  "files": [
    {"path": "src/git/push.ts", "hash": "sha256:abc...", "lines": 150},
    {"path": "tests/push.test.ts", "hash": "sha256:def...", "lines": 200}
  ],
  "total_tokens": 3500,
  "system_prompt_hash": "sha256:xyz...",
  "reviewers": ["twin-technical", "twin-creative"]
}
```

## Example

```
/prompt-normalizer create "src/git/push.ts, tests/push.test.ts"

CONTEXT PACKET CREATED
----------------------
Packet ID: norm-2026-02-13-001
Files: 2 (alphabetical order)
  - src/git/push.ts [150 lines] [sha256:abc123...]
  - tests/push.test.ts [200 lines] [sha256:def456...]
Total tokens: 3,500
System prompt hash: sha256:xyz789...

Ready for review. Pass packet_id to twin-review or cognitive-review.
```

```
/prompt-normalizer verify norm-2026-02-13-001

VERIFICATION: norm-2026-02-13-001
---------------------------------
Reviewers: twin-technical, twin-creative

twin-technical:
  - src/git/push.ts: sha256:abc123... MATCH
  - tests/push.test.ts: sha256:def456... MATCH
  - System prompt: sha256:xyz789... MATCH

twin-creative:
  - src/git/push.ts: sha256:abc123... MATCH
  - tests/push.test.ts: sha256:def456... MATCH
  - System prompt: sha256:xyz789... MATCH

Status: VERIFIED - All reviewers received identical context
```

## Integration

- **Layer**: Review
- **Depends on**: context-packet (for hashing)
- **Used by**: twin-review, cognitive-review

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>. Verify path exists." |
| File changed since normalization | Error: "Hash mismatch for <path>. File modified after normalization." |
| Invalid packet ID | Error: "Packet not found: <id>. Check packet ID or create new." |
| Reviewer context mismatch | Error: "Context mismatch for <reviewer>. Re-normalize required." |

## Acceptance Criteria

- [ ] Creates frozen context packets with unique IDs
- [ ] File ordering is deterministic (alphabetical)
- [ ] Hash verification ensures identical content
- [ ] Verification shows all reviewers received same input
- [ ] Diff command shows differences between packets
- [ ] Token budget calculated and reported
- [ ] System prompt hash included for full verification
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
