---
name: review-selector
version: 1.0.0
description: Chooses appropriate review type based on context, file types, and risk level
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, selection, orchestration]
---

# review-selector

Chooses appropriate review type based on context, file types, and risk level.
Removes guesswork about which review workflow to use.

**Existing Workflow Reference**: `docs/workflows/review.md`

## Problem Being Solved

Users shouldn't need to remember which review type to use. The system should
recommend based on what's being reviewed:
- Simple bug fix? code-review (external)
- Implementation plan? twin-review
- Architecture change? cognitive-review
- Security-critical? independent-review (N=5)

## Usage

```
/review-selector recommend <file>
/review-selector recommend <file> --risk <low|medium|high|critical>
/review-selector execute <file>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes | Path to file to review |
| --risk | No | Override auto-detected risk level |
| execute | No | Auto-execute recommended review |

## Selection Criteria

| Context | Recommended Review | Rationale |
|---------|-------------------|-----------|
| Implementation plan | twin-review | Twins catch different plan issues |
| Architecture change | cognitive-review | Needs conflict + restructure analysis |
| Simple bug fix | code-review (Codex/Gemini) | External validation, fast |
| Critical security change | independent-review (N=5) | Maximum coverage |
| Documentation update | twin-creative only | Focus on clarity |

## Security Detection

Security-related content detection uses `topic-tagger` semantic classification
(NOT pattern matching). The tag `security` with confidence >= 0.7 triggers
elevated review recommendations.

**Soft Dependency**: Without topic-tagger, review-selector uses path-based
heuristics (e.g., `**/security/**` paths) as fallback. Full semantic detection
available after topic-tagger is implemented.

## Output

```
REVIEW RECOMMENDATION
---------------------

File: docs/plans/security-migration.md
Type: Implementation Plan
Risk: High (security-related)

Recommended: independent-review (N=5)
  - 3 cognitive modes (internal)
  - 2 external validators (Codex + Gemini)

Rationale:
  - Security-related content detected (topic-tagger: security 0.89)
  - Plan type benefits from diverse perspectives
  - High-risk warrants maximum review coverage

Execute? /review-selector execute docs/plans/security-migration.md
```

## Example

```
/review-selector recommend src/auth/login.ts

REVIEW RECOMMENDATION
---------------------

File: src/auth/login.ts
Type: Code (TypeScript)
Risk: High (auth-related)

Recommended: cognitive-review
  - Analyst: Check for security conflicts
  - Transformer: Architectural improvements
  - Operator: Implementation verification

Rationale:
  - Authentication code requires careful review
  - Multiple perspectives catch different issues
  - Not critical enough for N=5, but needs more than N=2

Execute? /review-selector execute src/auth/login.ts
```

```
/review-selector recommend README.md --risk low

REVIEW RECOMMENDATION
---------------------

File: README.md
Type: Documentation (Markdown)
Risk: Low (overridden)

Recommended: twin-creative (single twin)
  - Focus on clarity and readability
  - Documentation-specific review

Rationale:
  - Documentation benefits from creative perspective
  - Low risk allows single-twin efficiency
  - Technical review not needed for README

Execute? /review-selector execute README.md
```

## Integration

- **Layer**: Review
- **Depends on**: twin-review, cognitive-review
- **Soft dependency**: topic-tagger (for security detection; path-based fallback if unavailable)
- **Used by**: Workflow automation

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Unknown file type | Warning: "Unknown type for <ext>. Defaulting to twin-review." |
| topic-tagger unavailable | Warning: "Using path-based detection (topic-tagger unavailable)" |
| Review skill unavailable | Error: "Recommended review <type> not available. Install skill." |

## Acceptance Criteria

- [ ] Recommends based on file type
- [ ] Risk level affects recommendation
- [ ] Security content triggers higher N-count
- [ ] Path-based fallback when topic-tagger unavailable
- [ ] Execute command invokes recommended review
- [ ] Single-twin option for low-risk docs
- [ ] Override flag respects user preference
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
