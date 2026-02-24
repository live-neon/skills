# Workflow: Skill Publishing

**Purpose**: Add or update skills in the Live Neon skills repository.

**When to use**: Adding new skills, updating existing skills, version bumps.

**Distribution**: Git-based (clone from GitHub).

---

## Quick Reference

- [Add a New Skill](#add-a-new-skill)
- [Update an Existing Skill](#update-an-existing-skill)
- [Version Bump](#version-bump)
- [Pre-Publish Checklist](#pre-publish-checklist)
- [Security Scan Compliance](#security-scan-compliance) - **Required for ClawHub**
- [ClawHub Publishing](#optional-clawhub-publishing)

---

## Installation (Users)

**ClawHub (recommended)**:
```bash
# Install individual skills via OpenClaw
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine
# See agentic/README.md for full installation order
```

**Manual (Claude Code users)**:
```bash
# Clone to Claude Code skills directory
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon

# Update existing installation
cd ~/.claude/skills/liveneon && git pull
```

---

## Add a New Skill

### 1. Create Skill Directory

```bash
cd /path/to/skills
mkdir -p pbd/my-new-skill
```

### 2. Create SKILL.md

Use the OpenClaw format:

```markdown
---
name: My New Skill
description: User-friendly, outcome-focused description (see creating-new-skill.md for guidance).
homepage: https://github.com/live-neon/skills/tree/main/pbd/my-new-skill
user-invocable: true
emoji: ✨
tags:
  - relevant
  - tags
  - here
---

# My New Skill

Brief description of the skill's purpose.

## Usage

```
/my-new-skill [arguments]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| arg1 | Yes | Description |
| arg2 | No | Description (default: value) |

## Output

What the skill produces.

## Example

```
/my-new-skill example-input

[Expected output]
```
```

### 3. Security Scan

```bash
# Check for secrets before committing
gitleaks detect --source pbd/my-new-skill -v
```

### 4. Commit and Push

```bash
git add pbd/my-new-skill/
git commit -s -m "feat(pbd): add my-new-skill"
git push origin main
```

> The `-s` flag adds your DCO sign-off (required by CONTRIBUTING.md).

---

## Update an Existing Skill

### 1. Edit SKILL.md

Make your changes to the skill's `SKILL.md` file.

### 2. Bump Version (if applicable)

Update the `version:` field in frontmatter if the skill has one.

### 3. Security Scan

```bash
gitleaks detect --source pbd/skill-name -v
```

### 4. Commit and Push

```bash
git add pbd/skill-name/
git commit -s -m "fix(pbd): description of change"
git push origin main
```

---

## Version Bump

Skills may optionally include a version in frontmatter:

```yaml
---
name: Essence Distiller
version: 1.0.0
# ...
---
```

**When to bump:**
- **Patch** (1.0.0 → 1.0.1): Bug fixes, clarifications
- **Minor** (1.0.0 → 1.1.0): New features, added sections
- **Major** (1.0.0 → 2.0.0): Breaking changes to usage

---

## Pre-Publish Checklist

Before pushing changes:

```bash
# 1. Working directory
pwd  # Should be in skills repo root

# 2. Security scan (no secrets)
gitleaks detect --source . -v
# Should show "no leaks found"

# 3. SKILL.md exists and is valid
cat pbd/skill-name/SKILL.md | head -20
# Should show valid frontmatter

# 4. Homepage URL is correct
grep "homepage:" pbd/skill-name/SKILL.md
# Should point to live-neon/skills

# 5. Clean git status
git status
```

---

## Security Scan Compliance

ClawHub performs automated security scanning on published skills. Skills flagged as "Suspicious" or
"Malicious" may be delisted.

**Full reference**: See **[skill-security-compliance.md](../standards/skill-security-compliance.md)** for complete security requirements, templates, and anti-patterns.

### Quick Checklist

```bash
# 1. Check for secrets
gitleaks detect --source path/to/skill -v

# 2. Verify metadata format (CORRECT nested format)
grep -A5 "metadata:" path/to/skill/SKILL.md | grep -E "(openclaw|requires|config|workspace):"

# 3. Check for WRONG format (registry ignores these!)
grep -E "^config_paths:|^workspace_paths:" path/to/skill/SKILL.md

# 4. For agentic skills, verify disable-model-invocation is NOT present
grep "disable-model-invocation:" path/to/skill/SKILL.md
# If found, REMOVE IT for agentic skills - it prevents auto-invocation
```

### Common Findings & Fixes

| Finding | Fix |
|---------|-----|
| "Autonomous execution" | For agentic skills: expected, no fix. For passive: add `disable-model-invocation: true` |
| "Metadata mismatch" | Use `metadata.openclaw.requires.*` (not top-level) |
| "Provenance mismatch" | Add provenance note |
| "Arbitrary file access" | Document file access scope |

**Full list**: [skill-security-compliance.md](../standards/skill-security-compliance.md#common-security-scan-findings)

### Reference

For detailed security scan remediation examples, see:
- [skill-security-compliance.md](../standards/skill-security-compliance.md) (authoritative security standard)
- [ClawHub Publishing Issues](../issues/2026-02-18-clawhub-publishing-issues.md) (7-skill remediation case study)
- [NEON-SOUL Security Lessons](../../../neon-soul/docs/issues/2026-02-10-skillmd-llm-wording-false-positive.md) (7-phase fix journey)

---

## Optional: ClawHub Publishing

Skills can optionally be published to [ClawHub](https://clawhub.ai) for broader discovery.

### Setup (One-Time)

```bash
# 1. Create account at https://clawhub.ai
# 2. Generate token at https://clawhub.ai/settings/tokens
# 3. Save token to .env
cp .env.example .env
# Edit .env and add your token: CLAWHUB_TOKEN=clh_xxx...

# 4. Install CLI
npm install -g clawhub

# 5. Login
source .env
clawhub login --token "$CLAWHUB_TOKEN" --no-browser
clawhub whoami
```

### Check Slug Availability

Before publishing, verify your desired slug isn't already taken:

```bash
# Check if slug exists
clawhub info username/desired-slug
# If "Not found" → slug is available
# If shows skill info → slug is taken, choose another

# Alternative: search for similar names
clawhub search "desired-slug"
```

**If slug is taken**, choose an alternative:
- `neon-skillname` (prefix with your brand)
- `skillname-v2` (version suffix)
- `category-skillname` (category prefix)

### Publish

Example (one-liner format for easy copy/paste):

```bash
clawhub publish pbd/essence-distiller --slug essence-distiller --name "Essence Distiller" --version 1.0.2 --tags "summarization,distillation,clarity,simplification,tldr,key-points,extraction,writing,analysis,openclaw"
```

### Verify

```bash
clawhub inspect essence-distiller
clawhub search essence
```

---

### All Skill Publish Commands

**Agentic Skills (7):**

```bash
clawhub publish agentic/context-verifier --slug context-verifier --name "Context Verifier" --version 1.5.1 --tags "agentic,verification,integrity,validation,checksums,drift-detection,state,file-verification"
```

```bash
clawhub publish agentic/failure-memory --slug failure-memory --name "Failure Memory" --version 1.5.0 --tags "agentic,memory,learning,self-improving,error-tracking,observability,patterns,adaptive,feedback"
```

```bash
clawhub publish agentic/constraint-engine --slug constraint-engine --name "Constraint Engine" --version 1.3.0 --tags "agentic,guardrails,enforcement,rules,circuit-breaker,self-improving,prevention,validation"
```

```bash
clawhub publish agentic/safety-checks --slug safety-checks --name "Safety Checks" --version 1.5.2 --tags "agentic,safety,validation,model-pinning,fallback,runtime-verification,cache,guardrails"
```

```bash
clawhub publish agentic/review-orchestrator --slug review-orchestrator --name "Review Orchestrator" --version 1.5.0 --tags "agentic,review,orchestration,multi-perspective,code-review,quality,twin-review,feedback"
```

```bash
clawhub publish agentic/governance --slug agentic-governance --name "Agentic Governance" --version 1.3.0 --tags "agentic,governance,lifecycle,maintenance,health-checks,observability,compliance,staleness"
```

```bash
clawhub publish agentic/workflow-tools --slug workflow-tools --name "Workflow Tools" --version 1.5.0 --tags "agentic,workflow,automation,orchestration,parallel,decision-making,loops,task-management"
```

**PBD Skills (7):**

```bash
clawhub publish pbd/essence-distiller --slug essence-distiller --name "Essence Distiller" --version 1.0.2 --tags "summarization,distillation,clarity,simplification,tldr,key-points,extraction,writing,analysis,openclaw"
```

```bash
clawhub publish pbd/pbe-extractor --slug pbe-extractor --name "PBE Extractor" --version 1.0.2 --tags "extraction,principles,methodology,best-practices,summarization,knowledge-management,documentation,analysis,openclaw"
```

```bash
clawhub publish pbd/pattern-finder --slug pattern-finder --name "Pattern Finder" --version 1.0.1 --tags "comparison,patterns,common-ground,agreement,analysis,synthesis,alignment,discovery,openclaw"
```

```bash
clawhub publish pbd/principle-comparator --slug principle-comparator --name "Principle Comparator" --version 1.0.2 --tags "comparison,principles,common-ground,agreement,diff,analysis,alignment,synthesis,openclaw"
```

```bash
clawhub publish pbd/principle-synthesizer --slug principle-synthesizer --name "Principle Synthesizer" --version 1.0.2 --tags "synthesis,principles,multi-source,consolidation,canonical,merging,knowledge-management,documentation,openclaw"
```

```bash
clawhub publish pbd/core-refinery --slug core-refinery --name "Core Refinery" --version 1.0.4 --tags "synthesis,multi-source,consolidation,merging,knowledge-management,summarization,analysis,openclaw"
```

```bash
clawhub publish pbd/golden-master --slug golden-master --name "Golden Master" --version 1.0.3 --tags "documentation,source-of-truth,freshness,staleness,validation,technical-writing,docs,file-tracking,openclaw"
```

---

### Batch Publishing (Multiple Skills)

ClawHub's publish API is rate-limited by GitHub API quotas (~60 req/hour unauthenticated).
When publishing multiple skills, use the batch script:

```bash
# Waits 1 hour for rate limit reset, then publishes 1 skill every 15 minutes
nohup ./scripts/publish-to-clawhub.sh > publish.log 2>&1 &
tail -f publish.log
```

See `scripts/publish-to-clawhub.sh` for the agentic skills batch publisher.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| gitleaks finds secrets | Remove secret, rotate credential, use `.gitignore` |
| Push rejected | Pull first: `git pull --rebase origin main` |
| SKILL.md not loading | Check frontmatter syntax (valid YAML) |
| Wrong homepage URL | Update to `https://github.com/live-neon/skills/tree/main/...` |
| Rate limit exceeded | Wait 1 hour or use `scripts/publish-to-clawhub.sh` for batch publishing |

---

## Cross-References

- **[creating-new-skill.md](./creating-new-skill.md)**: Complete skill creation workflow (validation, design, implementation)
- **README.md**: Installation, available skills
- **CONTRIBUTING.md**: Contribution guidelines, DCO sign-off
- **SECURITY.md**: Vulnerability reporting
- **.env.example**: ClawHub token template (for optional publishing)
- **[CJK Vocabulary](../standards/CJK_VOCABULARY.md)**: Skill aliases, sub-commands, math notation (agent-facing)
- **[scripts/publish-to-clawhub.sh](../../scripts/publish-to-clawhub.sh)**: Batch publisher with rate limit handling
- **[Publication Plan](../plans/2026-02-16-agentic-clawhub-publication.md)**: Agentic + PBD skills publication tracking (14 skills)
- **[NEON-SOUL Security Lessons](../../../neon-soul/docs/issues/2026-02-10-skillmd-llm-wording-false-positive.md)**: Security scan remediation case study

---

*Built by twins in Alaska.*
