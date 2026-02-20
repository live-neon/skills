---
created: 2026-02-18
resolved: 2026-02-18
type: issue
status: resolved
priority: high
topic: Code review remediation for ClawHub publishing
source: code-review (N=2)
reviewers:
  - codex-gpt51-examiner
  - gemini-25pro-validator
related:
  - docs/issues/2026-02-18-clawhub-publishing-issues.md
affects:
  - agentic/governance
  - agentic/workflow-tools
  - agentic/failure-memory
  - agentic/safety-checks
---

# Code Review Remediation: ClawHub Publishing

## Summary

External code review (N=2: Codex + Gemini) identified issues that should be addressed before republishing skills to ClawHub. All findings were verified at N=2.

## Source Reviews

- [2026-02-18-clawhub-publishing-codex.md](../reviews/2026-02-18-clawhub-publishing-codex.md)
- [2026-02-18-clawhub-publishing-gemini.md](../reviews/2026-02-18-clawhub-publishing-gemini.md)

---

## Issue 1: Data Handling Contradiction (governance, workflow-tools)

**Status**: Resolved
**Severity**: Important
**Verified**: N=2 (Gemini identified, manually confirmed)

**Problem**: Both skills have `disable-model-invocation: true` in frontmatter but their "Data handling" statements say "uses your agent's configured model". This contradiction may trigger scanner flags.

**Affected Files**:
- `agentic/governance/SKILL.md:56-59`
- `agentic/workflow-tools/SKILL.md:59-62`

**Current (WRONG)**:
```markdown
**Data handling**: This skill operates within your agent's trust boundary. All governance
analysis uses your agent's configured model — no external APIs or third-party services are called.
```

**Fix**: Change to instruction-only language matching other skills:
```markdown
**Data handling**: This skill is instruction-only (`disable-model-invocation: true`).
It provides [templates/analysis structure] but does NOT invoke AI models itself.
No external APIs or third-party services are called. Results are written to `output/[dir]/`
in your workspace. The skill only accesses paths declared in its metadata.
```

**Action Items**:
- [x] Update governance/SKILL.md data handling statement ✓
- [x] Update workflow-tools/SKILL.md data handling statement ✓
- [x] Bump versions (governance → 1.2.0, workflow-tools → 1.2.0) ✓

---

## Issue 2: Missing Security Considerations Sections

**Status**: Resolved
**Severity**: Important
**Verified**: N=2 (Gemini identified, grep confirmed)

**Problem**: 5 of 7 agentic skills have Security Considerations sections. Governance and workflow-tools are missing this required section.

**Affected Files**:
- `agentic/governance/SKILL.md` - No Security Considerations section
- `agentic/workflow-tools/SKILL.md` - No Security Considerations section

**Fix**: Add Security Considerations section following the pattern from other skills:

```markdown
## Security Considerations

**What this skill accesses:**
- Configuration files in `.openclaw/[skill].yaml` and `.claude/[skill].yaml`
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

**Action Items**:
- [x] Add Security Considerations section to governance/SKILL.md ✓
- [x] Add Security Considerations section to workflow-tools/SKILL.md ✓

---

## Issue 3: Auto-Detection Language Conflict (failure-memory)

**Status**: Resolved
**Severity**: Important
**Verified**: N=2 (Codex identified, manually confirmed)

**Problem**: The "Detection Triggers" section says "Agent scans for these patterns to auto-invoke `/fm detect`" which implies autonomous behavior. This conflicts with `disable-model-invocation: true` and may keep "autonomous execution" scanner flags alive.

**Affected File**: `agentic/failure-memory/SKILL.md:139`

**Current (PROBLEMATIC)**:
```markdown
## Detection Triggers

Agent scans for these patterns to auto-invoke `/fm detect`:
```

**Fix**: Clarify these are user-invoked or orchestrator-triggered, not autonomous:
```markdown
## Detection Triggers

When you invoke `/fm detect`, the skill looks for these patterns in recent context:
```

Or alternatively:
```markdown
## Detection Triggers

These patterns indicate when `/fm detect` should be invoked (user or orchestrator triggers):
```

**Action Items**:
- [x] Reword detection triggers section to remove "auto-invoke" language ✓
- [x] Bump version (failure-memory → 1.3.0) ✓

---

## Issue 4: Workspace Path Scope Mismatch (safety-checks)

**Status**: Resolved
**Severity**: Important
**Verified**: N=2 (Codex identified, manually confirmed)

**Problem**: The Cross-Session State section describes checking `.openclaw/` and `.claude/` directories for stale locks, but the metadata only declares `.openclaw/cache/` and `output/safety/`. This could trigger "undeclared file access" scanner warnings.

**Affected File**: `agentic/safety-checks/SKILL.md:175-183`

**Current Metadata**:
```yaml
metadata:
  openclaw:
    requires:
      config:
        - .openclaw/safety-checks.yaml
        - .claude/safety-checks.yaml
      workspace:
        - .openclaw/cache/
        - output/safety/
```

**Documentation Claims** (line 179):
> File locks | Stale `.lock` files in `.openclaw/` or `.claude/` | Resource contention

**Options**:
1. **Expand metadata** to include full directories:
   ```yaml
   workspace:
     - .openclaw/
     - .claude/
     - output/safety/
   ```
2. **Narrow documentation** to match current metadata scope

**Recommendation**: Option 1 (expand metadata) - the check description is accurate to the skill's intended behavior.

**Action Items**:
- [x] Update safety-checks metadata to include `.openclaw/` and `.claude/` (not just subpaths) ✓
- [x] Bump version (safety-checks → 1.3.0) ✓

---

## Minor Issues

### M-1: Version Numbering Inconsistency

**Severity**: Minor
**Impact**: Cosmetic only

Governance and workflow-tools are at v1.1.0 while others are at v1.2.0. This will be resolved when fixing Issues 1-2 (bumping to v1.2.0).

### M-2: Redundant Workspace Paths (failure-memory)

**Severity**: Minor
**Impact**: None (cosmetic)

`.learnings/` and `.learnings/observations/` are both declared. The parent path already covers the subdirectory. Can be cleaned up but not blocking.

### M-3: Governance Directory vs Skill Name

**Severity**: Minor
**Impact**: None

Directory is `governance/` but skill name is `agentic-governance`. This is intentional (slug was taken) and documented in the original issue.

---

## Republish Order

All fixes applied (including security scan remediation). Ready to republish when rate limit clears:

| Skill | Version | Status |
|-------|---------|--------|
| governance | v1.2.0 | ✓ Ready (code review fixes) |
| workflow-tools | v1.4.0 | ✓ Ready (code review + security scan fixes) |
| failure-memory | v1.4.0 | ✓ Ready (code review + security scan fixes) |
| safety-checks | v1.4.0 | ✓ Ready (code review + security scan fixes) |
| constraint-engine | v1.2.0 | ✓ Ready |
| context-verifier | v1.3.0 | ✓ Ready (security scan fixes) |
| review-orchestrator | v1.3.0 | ✓ Ready (security scan fixes) |

---

## Cross-References

### Parent Issue
- [2026-02-18-clawhub-publishing-issues.md](./2026-02-18-clawhub-publishing-issues.md) - Original publishing issues

### Code Reviews
- [2026-02-18-clawhub-publishing-codex.md](../reviews/2026-02-18-clawhub-publishing-codex.md) - Codex review
- [2026-02-18-clawhub-publishing-gemini.md](../reviews/2026-02-18-clawhub-publishing-gemini.md) - Gemini review

### Workflow Documentation
- [creating-new-skill.md](../workflows/creating-new-skill.md) - Skill creation workflow
- [skill-publish.md](../workflows/skill-publish.md) - Publishing workflow

### Affected Skills
- [agentic/governance/SKILL.md](../../agentic/governance/SKILL.md)
- [agentic/workflow-tools/SKILL.md](../../agentic/workflow-tools/SKILL.md)
- [agentic/failure-memory/SKILL.md](../../agentic/failure-memory/SKILL.md)
- [agentic/safety-checks/SKILL.md](../../agentic/safety-checks/SKILL.md)

---

*Created 2026-02-18 from N=2 code review (Codex + Gemini)*
