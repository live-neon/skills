---
created: 2026-02-15
type: issue
scope: internal
status: resolved
priority: medium
related_plan: ../plans/2026-02-15-skills-documentation-migration.md
related_reviews:
  - [multiverse]/docs/reviews/2026-02-15-skills-doc-migration-impl-codex.md
  - [multiverse]/docs/reviews/2026-02-15-skills-doc-migration-impl-gemini.md
---

# Issue: Skills Documentation Migration Implementation Review Findings (N=2)

## Summary

External code review (N=2: Codex + Gemini) of the skills documentation migration implementation
identified cross-reference gaps. The migration successfully moved all 60 planned files with
534 tests passing, but the specification frontmatter references files that were intentionally
excluded from migration scope.

**Core Finding**: Migration execution was correct, but scope definition missed specification
frontmatter dependencies.

## Findings by Severity

### Critical (1)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| C-1 | 4 broken frontmatter refs in specification | Both | N=2 | Resolved |

**Details**: The specification (`docs/proposals/2026-02-13-agentic-skills-specification.md`)
references 4 files that were NOT migrated because they're not skills-specific:

| File | Location | Reason Not Migrated |
|------|----------|---------------------|
| `2026-02-13-plan-a-brand-restructure-pbd-migration.md` | `depends_on` | Brand restructure plan, broader scope |
| `2026-02-14-rg6-failure-attribution-research.md` | `related_issues` | Research issue, may apply beyond skills |
| `2026-02-14-frontmatter-audit-impl-review-findings.md` | `related_issues` | Frontmatter audit was executed from multiverse |
| `2026-02-14-frontmatter-audit-twin-review-findings.md` | `related_issues` | Frontmatter audit was executed from multiverse |

### Important (2)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| I-1 | 5 external observation references in specification | Both | N=2 | Resolved |
| I-2 | 2 SKILL.md files have non-relative docs paths | Gemini (verified N=2) | N=2 | Resolved |

**I-1 Details**: The specification's `related_observations` field uses multiverse paths:
```yaml
related_observations:
  - docs/observations/golden-master-cross-project-knowledge.md
  - docs/observations/configuration-as-code-type-safety.md
  - docs/observations/2025-11-11-git-destructive-operations-without-confirmation.md
  - docs/observations/plan-approve-implement-workflow-violation.md
  - docs/observations/2025-11-09-resist-file-proliferation.md
```
These are multiverse observations, not skills-specific, so they correctly stay in multiverse.
The paths should be marked as external.

**I-2 Details**: Two SKILL.md files reference docs/issues without relative paths:
- `agentic/core/circuit-breaker/SKILL.md:247`
- `agentic/core/emergency-override/SKILL.md:277`

Both reference: `docs/issues/2026-02-13-phase2-code-review-remediation.md`
Should be: `../../../docs/issues/2026-02-13-phase2-code-review-remediation.md`

### Minor (1)

| # | Finding | Source | N-Count | Status |
|---|---------|--------|---------|--------|
| M-1 | Historical workdir paths in review files | Both | N=2 | Accepted |

**Details**: Review files contain absolute `workdir:` paths like
`/Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills/tests`.
These are CLI output artifacts documenting where commands were run - acceptable as historical context.

## Disposition Matrix

| Finding | Disposition | Rationale |
|---------|-------------|-----------|
| C-1 | **Address (mark external)** | These files intentionally stay in multiverse; mark refs with `[multiverse]` |
| I-1 | **Address (mark external)** | Observations are multiverse-scoped; mark refs with `[multiverse]` |
| I-2 | **Address (fix paths)** | Update to relative paths for consistency |
| M-1 | **Accept** | Historical documentation, no functional impact |

## Recommended Actions

### Immediate

1. **Fix C-1**: Update specification frontmatter to mark external references:
   ```yaml
   depends_on:
     - "[multiverse]/docs/plans/2026-02-13-plan-a-brand-restructure-pbd-migration.md"
   related_issues:
     # Skills-specific issues (migrated)
     - ../issues/2026-02-13-phase2-code-review-remediation.md
     # External multiverse issues (not migrated)
     - "[multiverse]/docs/issues/2026-02-14-rg6-failure-attribution-research.md"
     - "[multiverse]/docs/issues/2026-02-14-frontmatter-audit-impl-review-findings.md"
     - "[multiverse]/docs/issues/2026-02-14-frontmatter-audit-twin-review-findings.md"
   ```

2. **Fix I-1**: Update `related_observations` to mark as external:
   ```yaml
   related_observations:
     - "[multiverse]/docs/observations/golden-master-cross-project-knowledge.md"
     # ... etc
   ```

3. **Fix I-2**: Update SKILL.md paths to relative:
   - `agentic/core/circuit-breaker/SKILL.md:247`: Change to `../../../docs/issues/...`
   - `agentic/core/emergency-override/SKILL.md:277`: Change to `../../../docs/issues/...`

## Verification

After fixes:
```bash
# Check no unmarked external references remain
grep -rn "docs/observations/" docs/proposals/ | grep -v "\[multiverse\]"
# Expected: No output

# Check SKILL.md paths are relative
grep -rn "docs/issues/2026" agentic/ --include="SKILL.md"
# Expected: Only ../../../docs/issues/... paths
```

## Cross-References

- **Plan**: [Skills Documentation Migration](../plans/2026-02-15-skills-documentation-migration.md)
- **Reviews**:
  - [Codex Review]([multiverse]/docs/reviews/2026-02-15-skills-doc-migration-impl-codex.md)
  - [Gemini Review]([multiverse]/docs/reviews/2026-02-15-skills-doc-migration-impl-gemini.md)
- **Related Issues**:
  - [Implementation Review Findings](2026-02-15-agentic-skills-implementation-review-findings.md)

---

*Issue created from N=2 external review (Codex + Gemini) of migration implementation.*
*All N=1 findings verified to N=2 through codebase inspection.*
