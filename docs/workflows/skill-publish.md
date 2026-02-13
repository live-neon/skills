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

---

## Installation (Users)

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
description: One-line description of what this skill does.
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

## Optional: ClawHub Publishing

Skills can optionally be published to [ClawHub](https://clawhub.ai) for broader discovery.

### Setup (One-Time)

```bash
# 1. Create account at https://clawhub.ai
# 2. Generate token at https://clawhub.ai/settings/tokens
# 3. Install CLI
npm install -g clawhub

# 4. Login
clawhub login --token "YOUR_TOKEN" --no-browser
clawhub whoami
```

### Publish

```bash
clawhub publish pbd/essence-distiller \
  --slug essence-distiller \
  --name "Essence Distiller - Find What Actually Matters" \
  --version 1.0.0 \
  --tags "extraction,summarization,clarity,principles"
```

### Verify

```bash
clawhub inspect essence-distiller
clawhub search essence
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| gitleaks finds secrets | Remove secret, rotate credential, use `.gitignore` |
| Push rejected | Pull first: `git pull --rebase origin main` |
| SKILL.md not loading | Check frontmatter syntax (valid YAML) |
| Wrong homepage URL | Update to `https://github.com/live-neon/skills/tree/main/...` |

---

## Cross-References

- **CONTRIBUTING.md**: Contribution guidelines, DCO sign-off
- **SECURITY.md**: Vulnerability reporting
- **README.md**: Installation, available skills

---

*Built by twins in Alaska.*
