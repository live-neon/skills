# ClawHub Decoupling Implementation Review - Codex

**Date**: 2026-02-16
**Reviewer**: Codex GPT-5.1 (via codex exec)
**Files Reviewed**: 7 SKILL.md files, README.md, INDEX.md, CHANGELOG.md, LICENSE, implementation plan
**Issue**: `docs/issues/2026-02-16-clawhub-decoupling-impl-review-remediation.md`

## Summary

The decoupling implementation is largely complete and well-documented. The core goal of removing hardcoded Claude/Multiverse dependencies has been achieved for the 7 skill files. However, several documentation inconsistencies and residual provider-specific references remain in supporting files that should be addressed before ClawHub publication.

## Findings

### Critical

None identified. The core decoupling work appears complete.

### Important

#### I-1: Version Mismatch Between CHANGELOG and Skill Frontmatter

**Files**:
- `agentic/CHANGELOG.md:5` - Shows version 2.0.1
- `agentic/*/SKILL.md:3` - All show version 1.0.0
- `agentic/INDEX.md:7` - States "All skills at version **1.0.0**"
- `agentic/README.md:84` - States "Current version: **1.0.0**"

**Issue**: The CHANGELOG documents v2.0.1 (decoupling release) but all skill frontmatter and documentation references show v1.0.0. This creates confusion about the actual release state.

**Category**: Documentation
**Suggested Action**: Either bump all SKILL.md frontmatter versions to 2.0.1 to match CHANGELOG, or clarify in CHANGELOG that 2.0.1 refers to internal tracking while ClawHub publication uses 1.0.0 as initial release. The latter appears to be the intent based on plan documentation.

---

#### I-2: Missing Configuration Section in failure-memory and constraint-engine

**Files**:
- `agentic/failure-memory/SKILL.md` - No "## Configuration" section
- `agentic/constraint-engine/SKILL.md` - No "## Configuration" section

**Issue**: While context-verifier, safety-checks, review-orchestrator, governance all have explicit "## Configuration" sections documenting the `.openclaw/` > `.claude/` > defaults precedence, failure-memory and constraint-engine lack this section entirely.

**Category**: Documentation
**Suggested Action**: Add Configuration sections to both skills documenting config precedence, even if minimal:

```markdown
## Configuration

Configuration is loaded from (in order of precedence):
1. `.openclaw/[skill-name].yaml` (OpenClaw standard)
2. `.claude/[skill-name].yaml` (Claude Code compatibility)
3. Defaults (built-in)
```

---

#### I-3: safety-checks Config Precedence Deviates from Suite Standard

**File**: `agentic/safety-checks/SKILL.md:91-94`

```
Configuration is loaded from (in order of precedence):
1. `.openclaw/safety-checks.yaml` (OpenClaw standard)
2. `.claude/settings.json` (Claude Code compatibility)
3. Workspace root `settings.yaml`
```

**Issue**: This differs from the suite-wide standard documented elsewhere:
- Uses `.claude/settings.json` instead of `.claude/safety-checks.yaml`
- Uses "Workspace root `settings.yaml`" instead of "Defaults (built-in)"

**Category**: Design
**Suggested Action**: Align with suite standard (`.claude/safety-checks.yaml` and "Defaults") OR document why this skill intentionally differs (legacy compatibility with Claude Code's native settings.json).

---

#### I-4: Residual Claude-Specific References in Architecture Documentation

**File**: `docs/architecture/README.md:538-539`

```
└── .claude/
    └── skills/
```

**Issue**: The architecture file path diagram shows only `.claude/` without `.openclaw/` alternative, undermining decoupling messaging.

**Category**: Documentation
**Suggested Action**: Update diagram to show both paths or use provider-neutral terminology.

---

#### I-5: Outdated skill-publish.md Workflow

**File**: `docs/workflows/skill-publish.md:24-27`

```bash
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
cd ~/.claude/skills/liveneon && git pull
```

**Issue**: Installation instructions hardcode `.claude/` path. Should document both paths or use `openclaw install` as primary method.

**Category**: Documentation
**Suggested Action**: Update to reflect ClawHub installation as primary method:

```bash
# Primary (ClawHub)
openclaw install leegitw/[skill-name]

# Alternative (Git clone for development)
git clone https://github.com/live-neon/skills.git ~/.openclaw/skills/liveneon
# Or for Claude Code:
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

---

#### I-6: Claude-Specific Lock File in Output Example

**File**: `agentic/safety-checks/SKILL.md:255`

```
File: .claude/skills.lock
```

**Issue**: The session interference example shows a Claude-specific lock file path. Should be provider-neutral or show both.

**Category**: Documentation
**Suggested Action**: Change to generic path like `{config_dir}/skills.lock` or add note that path varies by provider.

---

### Minor

#### M-1: anthropic-opus Examples Throughout safety-checks

**File**: `agentic/safety-checks/SKILL.md:105-112, 166-179`

**Issue**: All model version examples use `anthropic-opus-4-5-20251101`. While the format is correct (`{provider}-{model}-{version}-{date}`), exclusive use of Anthropic examples may imply provider preference.

**Category**: Documentation
**Suggested Action**: Add diversity to examples. Already includes openai and google examples (lines 106-107). Consider making the primary config example provider-neutral or rotate providers in different output examples.

---

#### M-2: workflow-tools Lacks Configuration Section

**File**: `agentic/workflow-tools/SKILL.md`

**Issue**: No explicit Configuration section, though this skill may genuinely have no configurable options.

**Category**: Documentation
**Suggested Action**: Either add minimal Configuration section stating "No skill-specific configuration required" or document that it inherits config from dependencies.

---

#### M-3: CJK Characters in Root README Line 3

**File**: `README.md:3` - "OpenClaw/Claude Code skills"

**Issue**: Not a CJK issue, but line 3 explicitly mentions "Claude Code" alongside OpenClaw. This is intentional per the decoupling plan (Claude Code compatibility is a feature), but worth noting as it appears in the project tagline.

**Category**: Documentation
**Suggested Action**: No action needed - this correctly reflects dual-ecosystem support.

---

## Alternative Framing

### Are We Solving the Right Problem?

The decoupling implementation assumes that:

1. **ClawHub will become a viable distribution channel** - The skills are prepared for a platform that may not have significant adoption yet.

2. **Provider-neutrality is valuable** - The implementation maintains `.claude/` compatibility, suggesting the existing user base is Claude Code users. The effort to support `.openclaw/` may exceed demand.

3. **Configuration abstraction is sufficient** - The decoupling focuses on documentation and config paths but doesn't address potential runtime differences between AI providers (different capabilities, token limits, tool availability).

### Unquestioned Assumptions

1. **Model format will remain stable** - `{provider}-{model}-{version}-{date}` assumes providers will follow predictable naming conventions.

2. **YAML is universal** - Both `.openclaw/` and `.claude/` use YAML, but safety-checks shows `.claude/settings.json` exists too. Format inconsistency may cause issues.

3. **Dependency ordering is obvious** - Users must install context-verifier before failure-memory before constraint-engine. This ordering dependency is documented but not enforced.

### Recommendation

The decoupling is well-executed within its scope. Consider:

1. **Add automated compatibility tests** - Stage 8 (Integration Testing) marked complete but no evidence of test files. Add actual test scripts that verify both config paths work.

2. **Version clarity** - Decide whether 1.0.0 or 2.0.1 is the publication version and align all documentation.

3. **Dependency installation UX** - Consider adding a meta-install command: `openclaw install leegitw/agentic-suite` that installs all 7 skills in correct order.

---

## Verification Commands Run

```bash
# Claude/Multiverse references in agentic/
rg -n "Claude" agentic  # Found 8 references (all in config paths - acceptable)
rg -n "Multiverse" agentic  # Found 1 reference (CHANGELOG context - acceptable)

# OpenClaw path coverage
rg -n "\.openclaw" agentic  # Found 12 references (well documented)

# Version references
rg -n "^version:" agentic/*/SKILL.md  # All show 1.0.0
```

---

## Raw Output

<details>
<summary>Full CLI output</summary>

```
OpenAI Codex v0.63.0 (research preview)
--------
workdir: /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills
model: gpt-5.1-codex-max
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: auto
session id: 019c6597-37ad-71e1-a399-352657ebd7b2
--------

Plan executed:
1. Scanned repo structure and key docs for decoupling and config details
2. Assessed individual skills for remaining Claude/Multiverse coupling, config precedence, and dependencies
3. Summarized findings by severity with suggested actions

Key searches performed:
- rg -n "Claude" agentic → 8 matches (config compatibility references)
- rg -n "Multiverse" agentic → 1 match (CHANGELOG only)
- rg -n "\.openclaw" agentic → 12 matches (primary config path)
- rg -n "opus" agentic → 14 matches (examples, archived skills)
- rg -n "\.claude" docs → 10 matches (legacy docs needing update)

Files analyzed:
- All 7 agentic/*/SKILL.md files
- agentic/README.md, INDEX.md, CHANGELOG.md, LICENSE
- docs/architecture/README.md
- docs/workflows/skill-publish.md
- README.md (root)
```

</details>

---

*Review generated 2026-02-16 by Codex GPT-5.1 via `codex exec --sandbox read-only -m gpt-5.1-codex-max`.*
