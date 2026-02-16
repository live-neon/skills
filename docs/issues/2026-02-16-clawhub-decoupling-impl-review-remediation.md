# Issue: ClawHub Decoupling Implementation Review Remediation

**Created**: 2026-02-16
**Status**: Closed
**Resolved**: 2026-02-16
**Priority**: Medium
**Blocking**: None (all items addressed)

## Source Reviews (N=2)

- `docs/reviews/2026-02-16-clawhub-decoupling-impl-codex.md`
- `docs/reviews/2026-02-16-clawhub-decoupling-impl-gemini.md`

## Related

- **Plan**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (complete)
- **Context**: `output/context/2026-02-16-clawhub-decoupling-impl-context.md`

---

## Critical Findings

None - both reviewers confirmed core decoupling is complete.

---

## Important Findings (Verified N=2)

### I-1: Missing Configuration Sections (N=2: Both)

**Description**: 3 of 7 skills lack explicit Configuration sections despite README.md claiming "All skills support configuration via `.openclaw/` or `.claude/`"

**Files**:
- `agentic/failure-memory/SKILL.md` - Missing `## Configuration` section
- `agentic/constraint-engine/SKILL.md` - Missing `## Configuration` section
- `agentic/workflow-tools/SKILL.md` - Missing `## Configuration` section

**Fix**: Add Configuration section to each skill documenting:
```markdown
## Configuration

Configuration is loaded from (in order of precedence):
1. `.openclaw/[skill-name].yaml` (OpenClaw standard)
2. `.claude/[skill-name].yaml` (Claude Code compatibility)
3. Defaults (built-in)
```

**Severity**: Important (documentation consistency)

---

### I-2: Config File Extension Inconsistency (N=2: Verified)

**Description**: safety-checks uses `.claude/settings.json` while other skills document `.claude/[skill].yaml`

**Location**: `agentic/safety-checks/SKILL.md:93`

**Current**:
```markdown
2. `.claude/settings.json` (Claude Code compatibility)
```

**Fix**: Standardize to `.yaml` or document why JSON is used for this skill:
```markdown
2. `.claude/safety-checks.yaml` (Claude Code compatibility)
```

**Severity**: Important (consistency)

---

### I-3: Outdated Root README Installation Path (N=2: Verified)

**Description**: Root README.md contains outdated `~/.claude/skills/` installation path

**Location**: `README.md:29`

**Current**:
```bash
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

**Fix**: Update to use `openclaw install` or document both paths:
```bash
# ClawHub installation (recommended)
openclaw install leegitw/context-verifier

# Manual installation (Claude Code users)
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
```

**Severity**: Important (user confusion)

---

### I-4: Outdated skill-publish.md Workflow (N=2: Both)

**Description**: Workflow file contains outdated installation paths

**Location**: `docs/workflows/skill-publish.md:24-27`

**Current**:
```bash
git clone https://github.com/live-neon/skills.git ~/.claude/skills/liveneon
cd ~/.claude/skills/liveneon && git pull
```

**Fix**: Update to reflect ClawHub publication workflow

**Severity**: Important (documentation accuracy)

---

## Minor Findings (Verified N=2)

### M-1: Claude-Specific Lock File in Example (N=2: Verified)

**Description**: Session interference example shows `.claude/skills.lock` which is Claude-specific

**Location**: `agentic/safety-checks/SKILL.md:255`

**Current**:
```markdown
1. Stale file lock:
   File: .claude/skills.lock
```

**Fix**: Generalize or show both paths:
```markdown
1. Stale file lock:
   File: .openclaw/skills.lock (or .claude/skills.lock)
```

**Severity**: Minor (example completeness)

---

### M-2: Version Documentation (N=1→Documented)

**Description**: CHANGELOG shows 2.0.1, SKILL.md frontmatter shows 1.0.0

**Assessment**: Intentional - internal versioning (2.0.1) vs ClawHub publication version (1.0.0). The CHANGELOG tracks development history while SKILL.md frontmatter is the published version.

**Action**: No fix needed, but consider adding a note to CHANGELOG explaining the version strategy.

**Severity**: Minor (clarification only)

---

### M-3: Model Example Diversity (N=1→Verified False Positive)

**Description**: Codex noted model examples only use `anthropic-opus`

**Verification**: FALSE POSITIVE - `agentic/safety-checks/SKILL.md:105-107` already includes:
- `anthropic-opus-4-5-20251101`
- `openai-gpt-4-turbo-20250301`
- `google-gemini-2-pro-20260101`

**Action**: None required

---

## Alternative Framing (Codex)

Questions raised for consideration (not blocking):

1. **ClawHub adoption uncertainty** - Preparing for platform without known adoption
2. **Provider-neutrality value** - Existing users are Claude Code; `.openclaw/` may exceed demand
3. **Dependency ordering not enforced** - Users must manually install in correct order

**Assessment**: These are valid strategic considerations but don't block v1.0.0 publication. Can address in v1.1.0 if adoption warrants.

---

## Remediation Checklist

### High Priority (Before Publication)

- [x] Add Configuration section to `agentic/failure-memory/SKILL.md` ✓ 2026-02-16
- [x] Add Configuration section to `agentic/constraint-engine/SKILL.md` ✓ 2026-02-16
- [x] Add Configuration section to `agentic/workflow-tools/SKILL.md` ✓ 2026-02-16
- [x] Standardize config file extension in `agentic/safety-checks/SKILL.md:93` ✓ 2026-02-16
- [x] Update `README.md:29` installation path ✓ 2026-02-16

### Medium Priority (Can Publish With)

- [x] Update `docs/workflows/skill-publish.md:24-27` paths ✓ 2026-02-16
- [x] Generalize `.claude/skills.lock` example in `agentic/safety-checks/SKILL.md:255` ✓ 2026-02-16

### Low Priority (Post-Publication)

- [x] Add version strategy note to CHANGELOG ✓ 2026-02-16
- [ ] Consider meta-install command (`openclaw install leegitw/agentic-suite`) — Deferred to v1.1.0

---

## Acceptance Criteria

- [x] All 7 skills have Configuration sections ✓
- [x] Config file extensions are consistent across skills (all `.yaml`) ✓
- [x] No outdated installation paths in user-facing docs ✓
- [x] All N=2 important findings addressed ✓

---

*Issue created 2026-02-16 from code review N=2 (Codex + Gemini).*
