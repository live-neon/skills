# Agentic ClawHub Decoupling Plan Review - Codex

**Date**: 2026-02-15
**Reviewer**: codex-gpt51-examiner
**Model**: gpt-5.1-codex-max
**Files Reviewed**:
- `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (primary)
- `agentic/review-orchestrator/SKILL.md`
- `agentic/safety-checks/SKILL.md`
- `agentic/context-verifier/SKILL.md`
- `agentic/constraint-engine/SKILL.md`
- `docs/issues/2026-02-15-agentic-consolidation-review-findings.md`

## Summary

The plan is structurally sound with clear staging and a sensible spike-first approach for the largest uncertainty (cognitive mode abstraction). However, the review identified two critical gaps: no migration strategy for existing users, and no test strategy beyond grep verification. The verification commands catch surface-level changes but miss semantic validation of the new abstractions.

## Findings

### Critical

| ID | Location | Finding |
|----|----------|---------|
| C-1 | Plan (all stages) | **No migration plan for existing configs/data**: No stage covers how legacy `.claude/` users or existing model identifiers migrate. Risk: breakage for current Multiverse deployments. Need backward compatibility, deprecation notice, dual-read/write window. Suggest adding migration/testing stage with fallback config resolution. |
| C-2 | Plan (all stages) | **Test strategy absent**: Plan only has grep checks; no unit/integration coverage or fixture updates per skill. Risk: silent regressions in skill logic and lifecycle counters (R/C/D). Add explicit test stage with sample invocations and acceptance criteria validation. |

### Important

| ID | Location | Finding |
|----|----------|---------|
| I-1 | Plan:60-65 | **Stage dependencies vague**: Stage 2 (generalize twin) may depend on Stage 1 interface decisions; Stage 3 decoupling might require outcomes from Stage 2 for consistency. Consider explicit ordering/exit criteria per stage to avoid rework. |
| I-2 | Plan:60-65, Plan:292-338 | **Estimates likely low**: Stage 1 claimed 100-150 LOC but needs interface design, config loader, and validation - likely >1 session. Stage 5 "diverse examples across all skills" for 7 skills is more than 1-2 sessions if curated/validated. |
| I-3 | Plan:113-121, Plan:165-174, Plan:220-233, Plan:277-286, Plan:386-405 | **Verification commands incomplete**: Greps don't assert new generic terms are present (e.g., "multi-perspective", "primary/backup/local"). No check for 90-day cadence configurability text. No check for presence of suite README/frontmatter once added. Commands verify absence of old terms but not presence of new abstractions. |
| I-4 | Plan:342-376 | **Publication artifacts underspecified**: Stage 6/7 don't mention license text alignment, versioning, or ClawHub metadata validation (required keys, frontmatter schema). Missing check for author/brand neutrality beyond greps. |
| I-5 | Plan:426-437 | **Risk log missing mitigation owners**: Risk table identifies 5 risks but no explicit owners or mitigation tracking. No risk register format (e.g., model-name drift, config precedence conflicts, example correctness). |

### Minor

| ID | Location | Finding |
|----|----------|---------|
| M-1 | review-orchestrator/SKILL.md:101 | **npm test quality gate retained**: Plan mentions pluggable checks but lacks acceptance criteria or examples for other ecosystems (go test, pytest, etc.). The verification only checks "npm test" appears in configuration context, not that alternative examples exist. |
| M-2 | review-orchestrator/SKILL.md:6 | **Twin terminology in tags**: Tags include "twin" which is user-visible metadata. Plan should clarify whether to keep historical naming in tags/commands vs. user-facing documentation. Verification grep excludes `Source skills:` but doesn't address tags. |
| M-3 | Plan:239-288 | **Narrow scoping for context-verifier/constraint-engine**: No plan to update docs/examples after making cadence configurable or removing CLAUDE.md hardcode. Just removes hardcode without showing new configurable usage. |

## Verification Command Analysis

The plan's grep commands have several gaps:

| Stage | Command | Issue |
|-------|---------|-------|
| Stage 1 | `grep -E "opus4\|opus41\|sonnet45..."` | Only checks absence; doesn't verify generic interface is present |
| Stage 2 | `grep -i "twin" ... \| grep -v "Source skills:"` | Misses `tags: [... twin ...]` in frontmatter (line 6) |
| Stage 2 | `grep "npm test"` | Doesn't verify alternative test commands are documented |
| Stage 4 | `grep "CLAUDE.md"` | Expected "only in config example" but doesn't verify config example exists |
| Stage 4 | `grep -A2 "review_cadence"` | Only checks presence, not that it's actually configurable |
| Stage 7 | `grep -r "Multiverse\|multiverse\|Live Neon"` | Expected "only in author field" but doesn't verify author field still exists for attribution |

**Recommendation**: Add positive verification commands that check new abstractions are present, not just that old hardcodes are removed.

## ClawHub Publication Considerations

The plan should include a pre-publication checklist:

1. **Frontmatter validity**: Required ClawHub keys present (name, version, description, author, homepage, tags)
2. **License text**: MIT license file present and referenced
3. **Neutral authoring**: Author field acceptable (Live Neon), repository points to public URL
4. **Version pinning**: version: 1.0.0 in all skills
5. **Config schema doc**: Both `.openclaw/` and `.claude/` paths documented with examples
6. **Example invocations**: Don't rely on Multiverse-specific assets (no internal paths, no S3 buckets)
7. **README lifecycle diagram**: R/C/D counter explanation for "failure-to-constraint lifecycle" clarity

## Alternative Framing

**Are we solving the right problem?**

The plan frames the work as "removing Multiverse-specific dependencies." A stronger framing would be: "publish vendor-neutral skill suite with pluggable model/config/runtime backends."

This reframing suggests:

1. **Capability contracts per skill**: Define what each skill requires (config path, model interface, storage interface) vs. what it provides
2. **Adapter layer**: Formal abstraction for storage providers (S3, local, memory) and model providers (Claude, OpenAI, etc.)
3. **Compatibility tests**: Prove decoupling with tests that run against both `.openclaw/` and `.claude/` configurations

The current plan removes surface-level references but doesn't establish a formal abstraction layer. Risk: future model providers or config systems require another decoupling pass.

**Unquestioned assumptions**:

1. ClawHub users want individual skills (7 separate publishes) vs. a bundle
2. The R/C/D counter system is self-explanatory (may need onboarding docs)
3. "Multi-perspective review" is intuitive terminology (may need explanation)
4. Config precedence (`.openclaw/` > `.claude/` > workspace root) is obvious

## Recommendations

### Immediate (add to plan)

1. Add **Stage 1.5: Migration Strategy** - document config precedence, backward compat, deprecation timeline
2. Add **Stage 7.5: Integration Testing** - sample invocations of each skill against both config systems
3. Strengthen verification commands to check presence of new abstractions, not just absence of old

### Before Publication

1. Create pre-publication checklist (see ClawHub Considerations above)
2. Define formal capability contracts for each skill
3. Add onboarding section to suite README explaining R/C/D counters

## Raw Output

<details>
<summary>Full CLI output</summary>

```
OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/tests
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c6556-5826-7781-9207-4c40c4b46071
--------

**Findings - Critical**
- Missing migration plan for existing configs/data: No stage covers how legacy `.claude/` users or existing model identifiers migrate (backward compatibility, deprecation notice, dual-read/write window). Risk: breakage for current deployments. Suggest add migration/testing stage with fallback config resolution.
- Test strategy absent: Plan only has grep checks; no unit/integration coverage or fixture updates per skill. Risk: silent regressions in skill logic and lifecycle counters. Add explicit test stage with sample invocations and acceptance criteria.

**Findings - Important**
- Stage dependencies vague: Stage 2 (generalize twin) may depend on Stage 1 interface decisions; Stage 3 decoupling might require outcomes from Stage 2 for consistency. Consider ordering/exit criteria per stage to avoid rework.
- Estimates likely low: Stage 1 claimed 100-150 LOC but needs interface design, config loader, and validation—likely >1 session. Stage 5 "diverse examples across all skills" for 7 skills is more than 1-2 sessions if curated/validated.
- Verification commands incomplete: Greps don't assert new generic terms (e.g., "multi-perspective"), config schema examples, or primary/backup/local fallback text. No check for 90-day cadence configurability or presence of suite README/frontmatter once added.
- Publication artifacts underspecified: Stage 6/7 don't mention license text alignment, versioning, or ClawHub metadata validation (e.g., required keys, Markdown frontmatter schema). Also missing check for author/brand neutrality beyond greps.
- Risk log missing: No explicit risk register (e.g., model-name drift, config precedence conflicts, example correctness) or mitigation owners.

**Findings - Minor**
- "Npm test" quality gate retained (review-orchestrator line ~101) may not generalize; plan mentions pluggable checks but lacks acceptance criteria or examples for other ecosystems.
- "Twin" terminology appears in tags/command name; plan should clarify whether to keep historical naming in notes vs. user-facing commands to meet verification intent.
- Context-verifier/constraint-engine fixes scoped narrowly; no plan to update docs/examples after making cadence configurable or removing CLAUDE.md hardcode.

**ClawHub Publication Considerations**
- Add checklist: frontmatter validity, license text present, neutral authoring, repository URL, version pinning, config schema doc, and example invocations that don't rely on Multiverse assets.
- Ensure README includes lifecycle diagram plus brief R/C/D counter explanation to satisfy "failure-to-constraint lifecycle" clarity.

**Alternative Framing**
- Goal may be "publish vendor-neutral skill suite with pluggable model/config/runtime backends" rather than just removing Multiverse terms. Consider formalizing: capability contracts per skill, adapter layer for storage/model providers, and compatibility tests against both `.openclaw/` and `.claude/` to prove decoupling.

tokens used: 2,268
```

</details>

---

*Review generated 2026-02-15 by codex-gpt51-examiner using gpt-5.1-codex-max.*
