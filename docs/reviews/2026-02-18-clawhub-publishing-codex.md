# ClawHub Publishing Issues Review - Codex

**Date**: 2026-02-18
**Reviewer**: Codex GPT-5.1 (gpt-5.1-codex-max)
**CJK**: (Codex GPT-5.1 Examiner)
**Files Reviewed**:
- `docs/issues/2026-02-18-clawhub-publishing-issues.md`
- `docs/workflows/creating-new-skill.md`
- `docs/workflows/skill-publish.md`
- `agentic/constraint-engine/SKILL.md`
- `agentic/governance/SKILL.md`
- `agentic/failure-memory/SKILL.md`
- `agentic/context-verifier/SKILL.md`
- `agentic/safety-checks/SKILL.md`
- `agentic/review-orchestrator/SKILL.md`
- `agentic/workflow-tools/SKILL.md`

## Summary

The metadata migration to `metadata.openclaw.requires.*` format is applied consistently across all 7 agentic skills. No critical issues found. Two important follow-up items identified: an auto-detection trigger conflict in failure-memory and a workspace path mismatch in safety-checks.

## Findings

### Critical
*None identified.*

### Important

1. **failure-memory auto-detection vs disable-model-invocation conflict**
   - **File**: `agentic/failure-memory/SKILL.md:139`
   - **Issue**: Documentation states "Agent scans for these patterns to auto-invoke `/fm detect`" which conflicts with `disable-model-invocation: true` in frontmatter (line 13)
   - **Impact**: This wording can keep the "autonomous execution"/metadata-mismatch flag alive during ClawHub security scans
   - **Recommendation**: Rephrase as user-invoked triggers or clarify that the orchestrator/platform triggers it, not the skill autonomously

2. **safety-checks workspace path mismatch**
   - **File**: `agentic/safety-checks/SKILL.md:175-183`
   - **Issue**: Cross-Session State section says checks cover `.openclaw/` and `.claude/` directories, but declared workspace metadata (lines 20-22) only includes `.openclaw/cache/` and `output/safety/`
   - **Impact**: Scanner may flag "undeclared file access" for `.claude/` lock file checks
   - **Recommendation**: Either narrow the scope description to match declared paths, or add `.openclaw/` and `.claude/` root directories to metadata.openclaw.requires.workspace

### Minor

1. **Redundant workspace paths**
   - **File**: `agentic/failure-memory/SKILL.md:20-21`
   - **Issue**: Both `.learnings/` and `.learnings/observations/` declared; child path is redundant if parent is already declared
   - **Recommendation**: Consider keeping only `.learnings/` unless ClawHub registry requires explicit child paths

2. **Republish command version inconsistency**
   - **File**: `docs/issues/2026-02-18-clawhub-publishing-issues.md:197`
   - **Issue**: Republish command shows `--version 1.1.0` for constraint-engine but actual SKILL.md shows v1.2.0
   - **Impact**: Cosmetic - the command is historical and version table at line 229 is correct
   - **Recommendation**: Add note that command is historical or update to reflect current version

3. **Governance skill name mismatch**
   - **File**: `agentic/governance/SKILL.md:2`
   - **Issue**: Frontmatter `name: agentic-governance` differs from directory name `governance/`
   - **Impact**: May affect slug selection when republishing
   - **Recommendation**: Verify this is intentional for slug differentiation

## Observations

### Positive Findings

- **Metadata Migration Complete**: All 7 skills use correct nested `metadata.openclaw.requires.*` format
  - `agentic/constraint-engine/SKILL.md:14-22`
  - `agentic/governance/SKILL.md:14-23`
  - `agentic/failure-memory/SKILL.md:14-22`
  - `agentic/context-verifier/SKILL.md:14-21`
  - `agentic/safety-checks/SKILL.md:14-22`
  - `agentic/review-orchestrator/SKILL.md:14-21`
  - `agentic/workflow-tools/SKILL.md:14-24`

- **No Legacy Config Paths**: Grep confirmed zero instances of top-level `config_paths` or `workspace_paths` across all SKILL.md files

- **Version Alignment**: All skill versions match the issue tracking table
  - constraint-engine: v1.2.0
  - governance: v1.1.0
  - failure-memory: v1.2.0
  - context-verifier: v1.2.0
  - safety-checks: v1.2.0
  - review-orchestrator: v1.2.0
  - workflow-tools: v1.1.0

- **Workflow Docs Updated**: Both workflow docs clearly explain the metadata format issue
  - `docs/workflows/creating-new-skill.md:424-449` - Runtime Dependencies section with correct format
  - `docs/workflows/creating-new-skill.md:448` - Warning about registry parser behavior
  - `docs/workflows/skill-publish.md:199-221` - Required Frontmatter Fields with correct format
  - `docs/workflows/skill-publish.md:221-224` - Warning about registry parser behavior

- **Cross-References Present**: Issue doc correctly links to all 7 skill files and both workflow docs

### Alternative Framing

**Is this the right solution?**

The current approach (migrating to `metadata.openclaw.requires.*`) is a pragmatic fix for ClawHub registry parser behavior. However:

1. **Root cause is upstream**: The ClawHub registry should ideally read top-level YAML fields. Filing an upstream issue could eliminate the need for dual-format maintenance.

2. **Duplication risk**: If ClawHub later supports top-level fields, we'll have redundant data. The workflow docs do document this clearly.

3. **Schema evolution**: The nested format is more explicit about what OpenClaw specifically requires vs general YAML frontmatter.

**Unquestioned assumptions**:
- Assumes ClawHub will continue to only read nested format
- Assumes Security Considerations section resolves false positives (may need verification after republish)
- Assumes formal dependencies in registry aren't required (skills document optional dependencies in prose only)

## Recommended Next Steps

1. **Before republishing**: Fix the failure-memory trigger language (line 139)
2. **Before republishing**: Align safety-checks scope description with declared workspace paths
3. **After republishing**: Verify registry shows correct metadata paths
4. **Future consideration**: File upstream issue with ClawHub about supporting top-level config_paths/workspace_paths

## Raw Output

<details>
<summary>Full CLI output (excerpted - key findings)</summary>

```
OpenAI Codex v0.63.0 (research preview)
model: gpt-5.1-codex-max
sandbox: read-only
tokens used: 190,972

Reviewed the issue doc, workflow docs, and all seven SKILL frontmatters;
the metadata migration to `metadata.openclaw.requires.*` is applied consistently,
but a couple follow-ups remain.

**Findings**
- Important: `agentic/failure-memory/SKILL.md:139` still claims "Agent scans for
  these patterns to auto-invoke `/fm detect`," which conflicts with the issue doc's
  action item to clarify manual vs. automatic triggers while `disable-model-invocation: true`
  is set. This wording can keep the "autonomous execution"/metadata-mismatch flag alive;
  consider reframing as user-invoked or describing the orchestrator that triggers it.

- Minor: `agentic/safety-checks/SKILL.md:175` and the scope note at
  `agentic/safety-checks/SKILL.md:183` say checks cover `.openclaw/` and `.claude/`,
  but the declared workspaces are only `.openclaw/cache/` and `output/safety/`.
  Either narrow the scope description or add the missing paths so behavior matches
  metadata and avoids "undeclared file access" concerns.

**Observations**
- All seven updated skills use the nested format with no lingering `config_paths`/`workspace_paths`
- Workflow docs clearly capture the parser caveat and the correct YAML shape
- Cross-references to all seven skills are present
```

</details>

---

*Review generated by Codex GPT-5.1 (gpt-5.1-codex-max) via codex exec --sandbox read-only*
