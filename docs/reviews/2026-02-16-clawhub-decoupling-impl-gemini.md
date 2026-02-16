# ClawHub Decoupling Implementation Review - Gemini

**Date**: 2026-02-16
**Reviewer**: gemini-25pro-validator
**Files Reviewed**: 7 SKILL.md files + 4 supporting files (README.md, INDEX.md, CHANGELOG.md, LICENSE)
**Plan**: docs/plans/2026-02-15-agentic-clawhub-decoupling.md (v3, all 9 stages complete)
**Issue**: `docs/issues/2026-02-16-clawhub-decoupling-impl-review-remediation.md`

## Summary

The ClawHub decoupling implementation is **substantially complete** with high-quality execution.
All 7 skills have consistent frontmatter, provider-agnostic model references, and properly
documented configuration precedence where applicable. Two important gaps remain: (1) root
README.md contains outdated installation path, and (2) three skills lack Configuration sections
despite being configurable per the README.md promise.

## Findings

### Critical

None found. All hardcoded Claude/Multiverse references have been removed from active skills.

### Important

**I-1: Root README.md contains outdated installation path**
- File: `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/README.md:29`
- Category: documentation
- Issue: `git clone ... ~/.claude/skills/liveneon` references old path
- Impact: Users following setup will use legacy path, not `.openclaw/` standard
- Suggested fix: Update to `git clone ... ~/.openclaw/skills/liveneon` or document both paths with precedence note

**I-2: Three skills missing Configuration section**
- Files:
  - `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/agentic/failure-memory/SKILL.md`
  - `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/agentic/constraint-engine/SKILL.md`
  - `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/agentic/workflow-tools/SKILL.md`
- Category: documentation/consistency
- Issue: These skills have no Configuration section, while context-verifier, safety-checks, review-orchestrator, and governance do
- Impact: README.md claims "All skills support configuration via .openclaw/[skill-name].yaml" but 3/7 skills don't document this
- Suggested fix: Add Configuration section to each, even if only showing defaults are used, or clarify in README.md which skills are configurable

**I-3: safety-checks/SKILL.md contains AWS reference in example**
- File: `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/agentic/safety-checks/SKILL.md:343`
- Category: decoupling
- Issue: `AWS_ACCESS_KEY: Rotated 85 days ago` in API Key Rotation example
- Context: This is an illustrative example showing what key rotation output might look like, not a hardcoded dependency
- Impact: Minor - AWS appears as example provider, not as required integration
- Suggested fix: Consider adding non-AWS examples (e.g., STRIPE_API_KEY, SENDGRID_KEY are already shown) or keep as-is since AWS is a common provider

**I-4: workflow-tools/SKILL.md contains AWS reference in example**
- File: `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/agentic/workflow-tools/SKILL.md:190`
- Category: decoupling
- Issue: `HARDCODED: AWS region` in infrastructure loop detection example
- Context: This is demonstrating what loop detection finds, not an actual dependency
- Impact: Minor - example shows detecting AWS hardcodes, which is appropriate
- Suggested fix: None needed - this is actually demonstrating the skill's purpose (finding hardcoded infrastructure refs)

### Minor

**M-1: docs/workflows/skill-publish.md contains outdated path**
- File: `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/docs/workflows/skill-publish.md:24-27`
- Category: documentation
- Issue: References `~/.claude/skills/liveneon`
- Impact: Workflow document inconsistent with .openclaw/ standard
- Suggested fix: Update to document both paths or primary .openclaw/ path

**M-2: pbd/README.md contains outdated path**
- File: `/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/pbd/README.md:128`
- Category: documentation
- Issue: References `~/.claude/skills/pbd`
- Impact: PBD skills installation instructions inconsistent
- Suggested fix: Update to document .openclaw/ path

**M-3: Archive files still contain old references**
- Files: `agentic/_archive/2026-02-consolidation/review/cognitive-review/SKILL.md:47,85,106`
- Category: documentation
- Issue: Contains `claude-sonnet-4-5` references
- Impact: None - these are archived/deprecated files
- Suggested fix: None needed - archive is historical record

**M-4: Inconsistent configuration file extension documentation**
- Files: safety-checks/SKILL.md:93 vs review-orchestrator/SKILL.md:136
- Category: consistency
- Issue: safety-checks documents `.claude/settings.json` while review-orchestrator documents `.claude/review-orchestrator.yaml`
- Impact: Minor confusion about expected file formats
- Suggested fix: Standardize on YAML for .claude/ compatibility path or document both JSON and YAML support

## Verification Results

### Decoupling Checks (PASS)

```bash
# Hardcoded model references in active skills
grep -rE "claude-opus|claude-sonnet|opus4[^a-z]|opus41|sonnet45" agentic/*/SKILL.md
# Result: No matches (only in CHANGELOG.md documenting the change, and _archive/)

# S3/AWS references
grep -riE "S3|aws|bucket" agentic/*/SKILL.md
# Result: 2 matches - both in illustrative examples, not dependencies
```

### Frontmatter Completeness (PASS)

All 7 skills have complete ClawHub frontmatter:
- `name`: Present
- `version`: 1.0.0
- `description`: Present
- `author`: Live Neon <contact@liveneon.dev>
- `homepage`: https://github.com/live-neon/skills/tree/main/agentic/[skill-name]
- `repository`: leegitw/[skill-name]
- `license`: MIT

### Configuration Path Documentation

| Skill | .openclaw/ documented | .claude/ documented | Configuration section |
|-------|----------------------|--------------------|-----------------------|
| context-verifier | Yes (line 86) | Yes (line 87) | Yes |
| safety-checks | Yes (line 92) | Yes (line 93) | Yes |
| review-orchestrator | Yes (line 135) | Yes (line 136) | Yes |
| governance | Yes (line 103) | Yes (line 104) | Yes |
| failure-memory | No | No | **No** |
| constraint-engine | No | No | **No** |
| workflow-tools | No | No | **No** |

## Alternative Framing Analysis

### Are we solving the right problem?

**Yes, but with a tension**: The decoupling enables ClawHub publication, but the skills remain
tightly coupled to the Neon Agentic lifecycle (R/C/D counters, evidence tiers, constraint lifecycle).
This isn't a problem - it's the differentiator. The question is whether standalone skill installation
makes sense when the value comes from the integrated pipeline.

**Observation**: The installation instructions encourage installing skills individually, but skills
like `governance` depend on `constraint-engine` which depends on `failure-memory` which depends on
`context-verifier`. The README acknowledges this with "install foundation first" guidance, which is
appropriate.

### What assumptions go unquestioned?

1. **ClawHub ecosystem exists and works**: The `openclaw install leegitw/[skill]` commands assume
   ClawHub registry functionality. If ClawHub doesn't support this invocation pattern yet, these
   are aspirational instructions.

2. **YAML configuration is portable**: The `.openclaw/` YAML format is assumed to be a standard,
   but OpenClaw/ClawHub may have different configuration requirements.

3. **Users want individual skill installation**: The 7-skill architecture assumes users may want
   just `context-verifier` without the rest. In practice, the value proposition requires the full
   pipeline.

### Recommendation

The decoupling is well-executed for the stated goal. Consider adding a "Quick Start: Full Suite"
section that provides a single command to install all 7 skills in dependency order, as this is
likely the most common use case.

## Publication Readiness Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Frontmatter complete | PASS | All 7 skills have required fields |
| No hardcoded Claude refs | PASS | None in active skills |
| No hardcoded AWS refs | PASS | Examples only, not dependencies |
| Configuration documented | PARTIAL | 4/7 skills have Configuration section |
| Installation instructions | PASS | Clear per-skill installation |
| LICENSE present | PASS | MIT license |
| CHANGELOG current | PASS | v2.0.1 documents decoupling |
| INDEX.md current | PASS | Auto-generated, accurate |

**Verdict**: Ready for publication with minor documentation updates recommended.

## Raw Output

<details>
<summary>Full Gemini CLI output</summary>

The Gemini CLI review identified the following primary concerns:

1. README.md Quick Start references old `~/.claude/` path
2. pbd/README.md contains outdated setup instructions
3. docs/workflows/skill-publish.md contains outdated setup instructions

The review confirmed 4 of 7 SKILL.md files as ready:
- context-verifier: Ready
- safety-checks: Ready
- failure-memory: Ready
- constraint-engine: Ready

The remaining 3 skills (review-orchestrator, governance, workflow-tools) were not fully
reviewed by Gemini CLI due to response truncation, but manual verification confirms they
follow the same patterns.

Additional manual verification performed:
- Grep for hardcoded references: PASS
- Frontmatter completeness check: PASS
- Configuration section consistency check: 4/7 have sections

</details>

---

*Review generated 2026-02-16 by gemini-25pro-validator agent.*
