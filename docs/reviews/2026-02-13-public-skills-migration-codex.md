# Public Skills Repository Migration Review - Codex

**Date**: 2026-02-13
**Reviewer**: 審碼 (codex-gpt51-examiner)
**Model**: gpt-5.1-codex-max
**Files Reviewed**: `../plans/2026-02-13-public-skills-repo-migration.md`
**Context File**: `[multiverse]/output/context/2026-02-13-public-skills-migration-context.md`

## Summary

The migration approach (separate OSS skills repo under live-neon brand as submodule) is **directionally sound** but **unsafe to execute as written**. The plan has **three critical gaps** in secret scanning, IP clearance, and public-release governance that must be addressed before any content is pushed to a public repository. Additionally, **none of the findings from the 2026-02-09 neon-soul migration review have been addressed** in this plan.

## Findings

### Critical

| Location | Issue | Recommendation |
|----------|-------|----------------|
| Entire plan | **No secret/credential history scan before open-sourcing** - Prior review (2026-02-09) noted gitleaks/trufflehog across full history is required, but plan lacks a stage for repo-level and migrated-skill history scans and a publication gate. | Add Stage 0: Pre-publish security gate with full-history secret scan using gitleaks/trufflehog on ALL PBD skills before copying to public repo. Block publish until clean. |
| Stage 3-4 | **Public repo creation omits license/IP clearance** - No legal sign-off or path-by-path allowlist. Risk of exporting proprietary content from patent-skills without review. The 7 PBD skills originated in `obviously-not/patent-skills/` - are they cleared for MIT licensing? | Add explicit IP review step. Create allowlist of files approved for export. Get legal sign-off before Stage 4 push. |
| Stage 3-4 | **No public-release checklist** - "Create repo and push" is unsafe. Missing: data classification, trademark/brand checks, OSPO/legal approval, README/CONTRIBUTING/CODEOWNERS ownership verification. | Create pre-publish checklist as explicit gate before Stage 4 push. Include trademark clearance for "Live Neon" and "liveneon.ai". |

### Important

| Location | Issue | Recommendation |
|----------|-------|----------------|
| Stage 6 | **Submodule add ignores prior finding to pin branch** - No `-b main` flag. SSH-only URL breaks CI without deploy keys. Prior review (2026-02-09) specifically flagged this. | Change to: `git submodule add -b main https://github.com/liveneon/skills.git projects/live-neon/skills` (HTTPS) or document deploy key requirements. |
| Entire plan | **CI/CD considerations missing** - No updates to workflows to init submodules. No check that downstream consumers/infra handle submodules. No staging/dry-run before merge. | Add Stage 6.5: CI/CD updates with submodule init steps, consumer guidance, and dry-run workflow to verify clones work. |
| Verification | **Verification checklist is high-level** - No concrete tests for skills, no smoke-load in Claude Code, no checksum/manifest for migrated skills, no diff-based validation. | Add specific verification: diff of migrated skills, manifest with SHA256 hashes, Claude Code smoke test (`/pbe-extractor` invocation works). |
| Rollback | **Rollback doesn't cover pushed public repo** - No steps for: making repo private, revoking tokens/keys, revoking tags/releases, handling cached/replicated artifacts (package managers, forks). | Expand rollback with public repo contingencies. Note: once public, content may be forked - consider private staging repo first. |
| Stage 5 | **Agentic skills "to be implemented" lack definition** - No acceptance criteria, interfaces, or safety reviews. 37 skills referenced from proposal but no validation they're ready for implementation. | Defer Stage 5 until acceptance criteria defined, OR scope Phase 1 to only 3-5 skills with clear specs. |
| Stage 3 | **No plan for repo permissions/ownership** - Missing: CODEOWNERS, branch protection, required reviews, protected main branch. | Add repo governance setup: CODEOWNERS file, branch protection rules, require reviews for main. |
| Stage 3 | **No governance for third-party contributions** - Missing: CLA/DCO, SECURITY.md, vulnerability disclosure policy. | Add: SECURITY.md, DCO sign-off requirement, vuln disclosure process. |

### Minor

| Location | Issue | Recommendation |
|----------|-------|----------------|
| Timeline | **Timeline optimistic for public OSS launch** - Missing legal/review gates, CI updates, docs. 6-7 hours assumes no blocking approvals. | Add buffer time for legal review (1-2 business days). Consider timeline of 2-3 days instead of 6-7 hours. |
| Stage 7-8 | **Cross-reference/docs update steps lack automation** - Listed but no automated grep checks and link validation; easy to miss broken references. | Add automated verification: `grep -r "projects/live-neon/neon-soul" docs/ CLAUDE.md` should return 0 results. |

## Approach Assessment

### Is the approach fundamentally sound?

**Yes, with caveats.**

The brand separation (Live Neon for OSS, Obviously Not for proprietary) and the submodule architecture are sound patterns. However:

1. **The migration conflates two distinct operations** that should be sequenced:
   - **Operation A**: Internal restructure (create live-neon directory, move neon-soul) - low risk
   - **Operation B**: Public repository creation and skill migration - HIGH risk

   These should be executed in phases with a gate between them.

2. **The plan assumes the 7 PBD skills are clean and cleared** - but they originated in `obviously-not/patent-skills/`. The name "patent-skills" suggests potential IP entanglement. Explicit clearance is required.

3. **The 37 agentic skills are aspirational** - they exist only in the proposal document, not as implemented code. Mixing migration (7 skills) with implementation (37 skills) in the same plan adds risk and scope creep.

### What assumptions go unquestioned?

| Assumption | Risk | Recommendation |
|------------|------|----------------|
| PBD skills can be MIT-licensed | May have IP encumbrances from patent domain origin | Legal review required |
| Git histories are clean of secrets | History scanning not performed | Run gitleaks/trufflehog |
| CI/consumers handle submodules | May break existing workflows | Test before merge |
| 5 "quick win" agentic skills can ship without specs | Undefined acceptance criteria | Defer or spec first |
| Legal/OSPO approval is implicit | Two-person team may not have OSPO | Document decision authority |
| "Live Neon" brand is available | Trademark not verified | Check trademark availability |

### Alternative Approaches to Consider

1. **Private staging first**: Create `liveneon/skills` as PRIVATE repo, complete migration, verify, THEN make public. This allows rollback before exposure.

2. **Separate plans**: Split into Plan A (internal restructure) and Plan B (public repo). Execute Plan A first, then Plan B after legal review.

3. **Copy-first, delete-later**: Currently plan removes from patent-skills after verification. Consider keeping originals for longer (30 days) as additional safety net.

## Prior Review Findings Status

| 2026-02-09 Finding | Addressed in This Plan? |
|--------------------|-------------------------|
| Secret scanning needs gitleaks/trufflehog for full history | **NO** - Not mentioned |
| Submodule add needs branch pin (`-b main`) | **NO** - Still omitted |
| CI/CD needs submodule initialization docs | **NO** - Not addressed |
| SSH-only URLs break CI without deploy keys | **NO** - Still uses SSH URL |

## Recommended Actions Before Execution

### Must-Have (Block execution without these)

1. **Add pre-publish security gate** - Full-history secret scan with gitleaks/trufflehog on ALL files being migrated
2. **Get IP/legal clearance** - Written approval that PBD skills can be MIT-licensed and published
3. **Create public-release checklist** - Data classification, trademark, ownership verification
4. **Pin submodule branch** - Add `-b main` to submodule command
5. **Provide HTTPS URL option** - For CI environments, or document deploy key requirements

### Should-Have (Complete before full rollout)

6. **Add CI/CD section** - Submodule init steps for pipelines
7. **Create private staging repo first** - Migrate there, verify, then make public
8. **Add repo governance** - CODEOWNERS, branch protection, SECURITY.md
9. **Strengthen verification** - Checksums, diff validation, Claude Code smoke test
10. **Expand rollback** - Include public repo contingencies

### Nice-to-Have (Complete later)

11. **Defer agentic skills** - Scope Stage 5 to only skills with clear specs
12. **Add automated link checking** - Verify cross-references with CI

## Raw Output

<details>
<summary>Full CLI output</summary>

```
**Findings (ordered by severity)**
- critical – No explicit secret/hardcoded credential history scan before open-sourcing; prior review noted gitleaks/trufflehog across full history, but plan lacks a stage for repo-level and migrated-skill history scans and publication gate.
- critical – Public repo creation omits license/IP clearance and dependency/VCS history review for patent-related code; risk of exporting proprietary content from patent-skills without legal sign-off or path-by-path allowlist.
- critical – No public-release checklist (data classification, trademark/brand checks, OSPO/legal approval, README/CONTRIBUTING/CODEOWNERS ownership) before push; "create repo and push" is unsafe.
- important – Submodule add step ignores prior finding to pin branch (`-b main`) and to use HTTPS for CI friendliness or provide deploy keys/docs; SSH-only URL breaks CI.
- important – CI/CD considerations missing: no updates to workflows to init submodules, no check that downstream consumers/infra handle submodules; no staging/dry-run before merge.
- important – Verification checklist is high-level; no concrete tests (unit/contract/e2e) for skills, no smoke-load in Claude Code, no checksum/manifest for migrated skills, no diff-based validation of moved files.
- important – Rollback only covers filesystem moves and submodule removal; no rollback for a pushed public repo (e.g., making private, revoking tokens/keys, revoking tags/releases), no plan for cached/replicated artifacts.
- important – Agentic skills "to be implemented" lack definition of acceptance criteria, interfaces, or safety reviews; risks of scope creep and unreviewed behaviors.
- important – No plan for permissions/ownership in the new repo (CODEOWNERS, branch protection, required reviews, protected main/default branch).
- important – No governance for third-party contributions (CLA/DCO, security.txt/vuln disclosure policy).
- minor – Timeline optimistic for public OSS launch (missing legal/review gates, CI updates, docs), and parallel tracks may mask blocking approvals.
- minor – Cross-reference/docs update steps are listed but lack automated grep checks and link validation; easy to miss broken references.

**Answers to questions**
1) Prior findings: not addressed—secret scanning across history missing; submodule branch pin missing; CI/CD submodule init missing; SSH URL issue unresolved.
2) New public-repo risks: accidental IP leak from patent code/history; lack of license/ownership clarity; missing contributor/branch protections; missing vulnerability disclosure channel; potential key/URL exposure in history; CI failures due to submodule auth.
3) Approach is directionally sound (separate OSS skills + submodule) but unsafe to execute without adding security/legal gating, branch pin/HTTPS, CI updates, and stronger verification/rollback.
4) Unquestioned assumptions: that patent-skill content can be open-sourced as-is; that histories are clean; that CI/consumers handle submodules; that 5 "quick win" agentic skills can be safely shipped without specs/tests; that legal/OSPO approval is implicit.

**Suggested fixes (high impact)**
- Add a pre-publish gate: full-history secret scan (gitleaks/trufflehog), IP/legal review with allowlist of files to export, license selection, and OSS approval.
- Define repo controls: CODEOWNERS, branch protection, required reviews, default branch main pinned in submodule, HTTPS URL or deploy key path.
- Update CI/docs: submodule init steps, consumer guidance, and a dry-run workflow to clone with submodules.
- Strengthen verification: diff/manifest of migrated skills, smoke test in Claude Code, link check/grep for old paths.
- Expand rollback: steps to make repo private, revoke tokens/keys, delete tags/releases, and restore pointers.
```

**Session metadata**:
- Model: gpt-5.1-codex-max
- Provider: openai
- Sandbox: read-only
- Reasoning effort: xhigh
- Tokens used: 6,139

</details>

---

*Review generated by 審碼 (codex-gpt51-examiner) using Codex CLI v0.63.0*
