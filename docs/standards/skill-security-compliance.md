# Standard: Skill Security Compliance

**Purpose**: Security requirements for ClawHub publication. This is the authoritative source for security compliance.

**When to use**: Creating or updating skills for ClawHub publication.

**CJK**: 安 (security)

---

## Quick Reference

- [Required Frontmatter](#required-frontmatter)
- [Metadata Format](#metadata-format-metadataopenclaw)
- [Data Handling Statements](#data-handling-statements)
- [Security Considerations Section](#security-considerations-section)
- [Common Scan Findings](#common-security-scan-findings)
- [Pre-Publish Checklist](#pre-publish-security-checklist)

---

## Required Frontmatter

All skills published to ClawHub MUST include:

```yaml
---
name: skill-name
version: 1.0.0
description: User-friendly, outcome-focused description
author: Your Name <email@domain.com>
homepage: https://github.com/org/repo/tree/main/path/to/skill
repository: username/skill-name
license: MIT
tags: [relevant, tags]
disable-model-invocation: true  # REQUIRED - prevents autonomous execution flags
metadata:
  openclaw:
    requires:
      config:
        - .openclaw/skill-name.yaml
        - .claude/skill-name.yaml
      workspace:
        - output/skill-output/
---
```

**Description style**: Write descriptions that tell users **what problem you solve**, not just what features you have.

| Style | Example | Verdict |
|-------|---------|---------|
| Technical (avoid) | "Unified failure tracking and pattern detection" | ❌ |
| Outcome-focused (prefer) | "Stop making the same mistakes — turn failures into patterns" | ✓ |

---

## Metadata Format (metadata.openclaw)

**CRITICAL**: ClawHub registry reads ONLY the `metadata.openclaw` block.

```yaml
# ❌ WRONG - Registry ignores these top-level fields
config_paths:
  - .openclaw/skill.yaml
workspace_paths:
  - output/skill-output/

# ✓ CORRECT - Registry reads these
metadata:
  openclaw:
    requires:
      config:
        - .openclaw/skill.yaml
      workspace:
        - output/skill-output/
```

Using the wrong format causes:
- Registry shows "Required config paths: none" even when SKILL.md declares paths
- Security scanner finds mismatch between SKILL.md and registry metadata
- Skill gets flagged as "Suspicious" for metadata inconsistency

**Metadata fields**:

| Field | Purpose | Example |
|-------|---------|---------|
| `requires.env` | Environment variables needed | `- OPENAI_API_KEY` |
| `requires.bins` | Binaries on PATH | `- curl` |
| `requires.config` | Config file paths (read) | `- .openclaw/skill.yaml` |
| `requires.workspace` | Output directories (write) | `- output/results/` |
| `primaryEnv` | Primary API key (UI display) | `OPENAI_API_KEY` |

---

## Data Handling Statements

All skills MUST include a data handling statement.

**For instruction-only skills** (`disable-model-invocation: true`):

```markdown
**Data handling**: This skill is instruction-only (`disable-model-invocation: true`).
It provides [templates/prompts/structure] but does NOT invoke AI models itself.
No external APIs or third-party services are called. Results are written to `output/[dir]/`
in your workspace.
```

**For skills using agent's model** (no `disable-model-invocation`):

```markdown
**Data handling**: This skill operates within your agent's trust boundary. All [analysis type]
uses your agent's configured model — no external APIs or third-party services are called.
```

**Key rules**:
- If `disable-model-invocation: true`, use "instruction-only" language (NOT "uses your model")
- Say "agent's trust boundary" NOT "never leaves your machine"
- Never use "auto-invoke" or "auto-detect" language with `disable-model-invocation: true`
- If skill reads user-specified files, do NOT claim "only accesses declared paths"

---

## Security Considerations Section

Include ALL applicable subsections:

### Base Template

```markdown
## Security Considerations

**What this skill accesses:**
- Configuration files in `.openclaw/skill-name.yaml` and `.claude/skill-name.yaml`
- [List other accessed paths]

**What this skill does NOT access:**
- Files outside declared workspace paths
- System environment variables
- Network resources or external APIs

**What this skill does NOT do:**
- Invoke AI models (instruction-only skill)
- Send data to external services
- Execute arbitrary code
- Modify files outside its workspace
```

### Additional Sections (use as applicable)

**If skill reads user-specified files** (beyond declared metadata):
```markdown
**⚠️ File access scope**: This skill reads user-specified files for [purpose]. The metadata
declares config and output paths only — the skill will read ANY file path you provide to
`/skill command`. Use caution with sensitive files.
```

**If skill can spawn other skills**:
```markdown
**Subworkflow spawning:**
The `/skill subworkflow` command spawns other ClawHub skills.
- **Scope**: Can invoke any skill installed via `openclaw install`
- **Permissions**: Spawned skills execute with their own declared permissions
- **Risk**: Effective permission footprint is the union of this skill plus spawned skills
```

**If homepage org differs from repository owner**:
```markdown
**Provenance note:**
This skill is developed by [Org] (https://github.com/org/repo) and published
to ClawHub under the `username` account. Both refer to the same maintainer.
```

**If skill has config files**:
```markdown
**Configuration files:**
The config files contain only local behavior settings (thresholds, patterns).
They do NOT contain API keys, tokens, or external service endpoints by design.
```

**If skill references other skills as dependencies**:
```markdown
**Dependency clarification:**
References to `other-skill` are skill-level dependencies installed via `openclaw install`.
These are separate instruction-only skills with their own declared permissions.
```

**If skill mentions tool/model names** (e.g., Codex, Gemini):
```markdown
**Review modes note:**
References to "Codex" and "Gemini" are cognitive review modes (perspectives for analysis),
not external API calls. This skill does NOT call external APIs.
```

**If skill reads implicit data** (not a declared file path):
```markdown
**Runtime data access:**
The `/skill check` command reads data from your agent's session metadata (e.g., model version
from API headers). It does NOT call external APIs — it reads information already exposed by
your agent runtime.
```

### "Before You Install" Section (Recommended for flagged skills)

```markdown
## Before You Install

**What this skill reads:**
- Config files: `.openclaw/skill.yaml`, `.claude/skill.yaml`
- User-specified files: Any path you provide to `/skill command`

**What this skill writes:**
- Output directory: `output/skill-output/`

**What this skill does NOT do:**
- Call external APIs or services
- Access files outside your specified paths
- Store credentials or secrets
- Run in the background or persist

**Recommended setup:**
1. Add `output/skill-output/` to your `.gitignore`
2. Review config files before first use
3. Avoid using with sensitive directories
```

---

## Common Security Scan Findings

| Finding | Cause | Fix |
|---------|-------|-----|
| "Autonomous execution" | Missing `disable-model-invocation: true` | Add field to frontmatter |
| "Undeclared file access" | Using top-level `config_paths` | Use `metadata.openclaw.requires.config` |
| "Metadata mismatch" | SKILL.md mentions paths registry doesn't show | Migrate to `metadata.openclaw.requires.*` |
| "Suspicious domain" | Young domain in `homepage` | Use GitHub URL |
| "Sensitive data handling" | Patterns like `*.env` without docs | Add Security Considerations section |
| "Model invocation contradiction" | Says "uses your model" + `disable-model-invocation: true` | Use "instruction-only" language |
| "Auto-invoke language conflict" | Says "auto-invoke" + `disable-model-invocation: true` | Use "user or orchestrator triggers" |
| "Provenance mismatch" | Homepage org differs from repository | Add provenance note |
| "Arbitrary file access" | Reads user paths beyond declared metadata | Add file access scope warning |
| "Privilege expansion" | Can spawn other skills | Document permission inheritance |
| "External service names" | Uses "Codex", "Gemini" without clarification | Add review modes note |
| "Implicit data access" | Reads data not in declared paths | Document exactly how data is obtained |

---

## Pre-Publish Security Checklist

```bash
# 1. Check for secrets
gitleaks detect --source path/to/skill -v

# 2. Verify required frontmatter (CORRECT format)
grep "disable-model-invocation:" path/to/skill/SKILL.md
grep -A5 "metadata:" path/to/skill/SKILL.md | grep -E "(openclaw|requires|config|workspace):"

# 3. Check for WRONG format (registry ignores these)
grep -E "^config_paths:|^workspace_paths:" path/to/skill/SKILL.md
# If found, MIGRATE to metadata.openclaw.requires format!

# 4. Check homepage uses GitHub URL
grep "homepage:" path/to/skill/SKILL.md
# Should be: https://github.com/...

# 5. Verify no sensitive patterns without documentation
grep -i "secret\|credential\|password\|env" path/to/skill/SKILL.md
# If found, ensure Security Considerations section exists

# 6. Check for contradictory claims
grep -i "only accesses.*declared\|auto-invoke\|auto-detect" path/to/skill/SKILL.md
# Review any matches for contradictions with disable-model-invocation
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| "Uses your model" + disable-model-invocation | Contradiction flagged by scanner | Use "instruction-only skill" language |
| "Auto-invoke" + disable-model-invocation | Implies autonomous behavior | Use "user or orchestrator triggers" |
| "Only accesses declared paths" + user input | Contradiction when skill reads user files | Remove claim; document arbitrary access |
| Undocumented skill spawning | Scanner flags privilege expansion | Document permission inheritance |
| Provenance mismatch | Homepage/repository owner differ | Add provenance note |
| External service name confusion | "Codex", "Gemini" without clarification | Add review modes note |
| Undocumented implicit access | Reads agent runtime data not declared | Document exactly how data is obtained |
| Missing .gitignore guidance | Output dirs not excluded | Add .gitignore recommendation |

---

## VirusTotal Code Insight: What Triggers Flags

| Behavior | Flag Level | How to Avoid |
|----------|------------|--------------|
| Download + execute external code | **Malicious** | Never instruct users to run downloaded binaries |
| Base64-encoded scripts | **Suspicious** | Use plain text; document all scripts |
| "Paste this into terminal" patterns | **Suspicious** | Use declared `requires.bins` instead |
| Hardcoded secrets/credentials | **Suspicious** | Use `requires.env` declarations |
| Obfuscation techniques | **Suspicious** | Write transparent, readable code |
| Excessive permissions | **Suspicious** | Request only necessary access |

---

## Cross-References

- **[creating-new-skill.md](../workflows/creating-new-skill.md)**: Full skill creation workflow
- **[skill-publish.md](../workflows/skill-publish.md)**: Publishing workflow
- **[ClawHub Publishing Issues](../issues/2026-02-18-clawhub-publishing-issues.md)**: 7-skill remediation case study
- **[NEON-SOUL Security Lessons](../../../neon-soul/docs/issues/2026-02-10-skillmd-llm-wording-false-positive.md)**: Security scan remediation case study

---

*Extracted from creating-new-skill.md Phase 4 and skill-publish.md Security Scan Compliance (2026-02-20)*
