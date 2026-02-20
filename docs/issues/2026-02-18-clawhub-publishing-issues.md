---
created: 2026-02-18
resolved: 2026-02-20
type: issue
status: resolved
priority: high
topic: ClawHub publishing issues for agentic skills
related:
  - docs/issues/2026-02-18-code-review-remediation.md
affects:
  - agentic/governance
  - agentic/context-verifier
  - agentic/failure-memory
  - agentic/safety-checks
  - agentic/review-orchestrator
  - agentic/workflow-tools
---

# ClawHub Publishing Issues

## Summary

After 4 days of waiting, 6 of 7 agentic skills were published. However, there are several issues that need to be addressed.

## Issue 1: Governance Slug Taken

**Skill**: `agentic/governance`
**Status**: BLOCKED - Cannot publish
**Error**:
```
clawhub publish agentic/governance --slug governance --name "Governance" --version 1.0.0 --tags "governance,lifecycle,compliance,reviews,adoption"

✖ Uncaught Error: Only the owner can publish updates
    at handler (../../convex/skills.ts:3543:16)
```

**Problem**: The slug `governance` is already taken by another owner.

**Action Required**: Choose a new slug. Options:
- `pattern-governance`
- `knowledge-governance`
- `neon-governance`
- `mg-governance` (memory-garden)

**Decision**: Use `agentic-governance` as the slug. This follows the pattern of prefixing with the skill category and clearly identifies it as part of the Neon Agentic Suite.

```bash
clawhub publish agentic/governance --slug agentic-governance --name "Agentic Governance" --version 1.2.0 --tags "agentic,governance,lifecycle,compliance,reviews,adoption"
```

---

## Issue 2: Context-Verifier Flagged

**Skill**: `agentic/context-verifier`
**Status**: Published but flagged
**VirusTotal**: Suspicious
**OpenClaw**: Benign (high confidence)

**Reason for Flag**:
- Skill can store unencrypted file contents when `--include-content` flag is used
- Writes to `output/context-packets/` directory

**Assessment**: False positive. The skill does exactly what it claims.

**Recommendations from Scanner**:
1. Add `output/context-packets/` to `.gitignore`
2. Avoid `--include-content` for secrets (`.env`, credentials)
3. Restrict filesystem permissions on output directory
4. Consider adding encryption for stored packets

**Action Required**:
- [ ] Update SKILL.md to emphasize security warnings more prominently
- [ ] Consider adding optional encryption feature
- [ ] Submit GitHub issue to ClawHub if flag persists

---

## Issue 3: Failure-Memory Flagged (v1.1.0 REPUBLISHED)

**Skill**: `agentic/failure-memory`
**Status**: Republished v1.1.0, still flagged
**VirusTotal**: Pending
**OpenClaw**: Suspicious (medium confidence)

**Original Issues (FIXED in v1.1.0)**:
- [x] "across sessions and projects" removed - FIXED
- [x] Clarified workspace-local only - FIXED
- [x] Security Considerations section added - FIXED
- [x] Model invocation contradiction fixed - FIXED

**New Issues After Republish**:

1. **Auto-detection vs disable-model-invocation conflict**: SKILL.md describes auto-detection triggers (scanning tool outputs, user messages, CI/CD) but `disable-model-invocation: true` prevents autonomous invocation
   - Scanner asks: "confirm whether the platform or other skills will actually trigger it automatically"

2. **Registry metadata mismatch**: Same as safety-checks - registry doesn't show declared paths

3. **Trigger descriptions imply broader access**: Detection triggers mention "tool output", "CI/CD output", "DB migrations" which may be outside `.learnings/`

**Assessment**: Need to clarify that detection triggers are MANUAL (user must invoke), not AUTO.

**Action Required**:
- [ ] Clarify detection triggers are invoked by user, not auto-scanning
- [ ] Remove or reword auto-detection claims that conflict with disable-model-invocation
- [ ] File GitHub issue about registry metadata mismatch

---

## Issue 4: Safety-Checks Flagged (v1.1.0 REPUBLISHED)

**Skill**: `agentic/safety-checks`
**Status**: Republished v1.1.0, still flagged
**VirusTotal**: Pending
**OpenClaw**: Suspicious (medium confidence)

**Original Issues (FIXED in v1.1.0)**:
- [x] Model invocation contradiction - FIXED
- [x] window.*/global.* checks removed - FIXED
- [x] Scope narrowed to workspace only - FIXED
- [x] Security Considerations section added - FIXED

**New Issues After Republish**:

1. **Registry metadata mismatch**: SKILL.md frontmatter declares `config_paths` and `workspace_paths`, but ClawHub registry says "no required config paths or workspace access"
   - This appears to be a ClawHub parsing issue - metadata IS in SKILL.md

2. **Dependency clarification needed**: Doc recommends installing other skills but registry doesn't list formal dependencies

**Assessment**: May be ClawHub registry bug. The metadata IS declared in SKILL.md frontmatter.

**Action Required**:
- [ ] File GitHub issue asking ClawHub to clarify why registry doesn't show declared metadata
- [ ] Clarify dependency relationship (optional vs required) in SKILL.md

---

## Issue 5: Review-Orchestrator Flagged

**Skill**: `agentic/review-orchestrator`
**Status**: Published but flagged
**VirusTotal**: Suspicious
**OpenClaw**: Benign (medium confidence)

**Reason for Flag**:

1. **Metadata mismatch**: Registry metadata says "Required config paths: none" but SKILL.md lists `config_paths` (`.openclaw/.claude` YAMLs)

2. **Ambiguous "External validators"**: Mentions "Codex and Gemini" which could be read as calling external services (though skill says it uses agent's configured model)

3. **Dependency provenance**: References `leegitw/*` skills

**Assessment**: Minor issues, mostly documentation clarity.

**Action Required**:
- [ ] **FIX**: Align config_paths between registry metadata and SKILL.md
- [ ] **CLARIFY**: Reword "External validators" to clarify these are logical review modes, not API calls
- [ ] Document dependency trust model
- [ ] Republish after fixes

---

## Issue 6: Workflow-Tools Flagged

**Skill**: `agentic/workflow-tools`
**Status**: Published but flagged
**VirusTotal**: Suspicious
**OpenClaw**: Suspicious (medium confidence)

**Reason for Flag**:

1. **Arbitrary path scanning**: `/wt loops` accepts arbitrary directory paths for dependency analysis
2. **Subworkflow spawning**: `/wt subworkflow` can spawn other skills, inheriting their permissions
3. **Privilege expansion concern**: Combined with other agentic skills, could expand effective privilege footprint

**Assessment**: Legitimate concerns about capability scope. Documentation already updated.

**Fix Applied** (v1.3.0):
- [x] Fixed data handling statement (instruction-only language)
- [x] Added Security Considerations section
- [x] Updated metadata to correct `metadata.openclaw.requires.*` format
- [x] Document path scanning scope for `/wt loops`
- [x] Document subworkflow spawning scope
- [x] Add provenance note

---

## Issue 7: Constraint-Engine Flagged

**Skill**: `agentic/constraint-engine`
**Status**: Published but flagged
**VirusTotal**: Pending
**OpenClaw**: Suspicious (medium confidence)

**Reason for Flag**:

1. **Model invocation contradiction**: SKILL.md says "uses your agent's configured model" but `disable-model-invocation: true`

2. **Undeclared dependency**: Documentation recommends failure-memory but registry metadata doesn't declare it

3. **Audit log path unclear**: `audit.log++` referenced without clear path

**Assessment**: Same pattern as other skills - needs fixes.

**Fix Applied** (v1.1.0):
- [x] Fixed model invocation contradiction
- [x] Added Security Considerations section
- [x] Clarified dependency relationship with failure-memory
- [x] Clarified audit logging location

**Republish Command**:
```bash
clawhub publish agentic/constraint-engine --slug constraint-engine --name "Constraint Engine" --version 1.1.0 --tags "agentic,constraint,enforcement,circuit-breaker,lifecycle"
```

---

## Detailed Security Scan Results (2026-02-19)

### review-orchestrator

**Scan Results**: VirusTotal: Suspicious | OpenClaw: Benign (high confidence)

**Assessment Summary**:
> The skill is an instruction-only orchestration helper whose requests and metadata are consistent with its stated purpose and it does not ask for extra credentials or install arbitrary code.

**Findings**:

| Category | Status | Details |
|----------|--------|---------|
| Purpose & Capability | ✓ | Name/description match manifest and runtime instructions. Required config paths and workspace are reasonable |
| Instruction Scope | ℹ | Explicit instruction-only with `disable-model-invocation: true`. "Spawn review agents" is orchestration pattern for host agent to follow |
| Install Mechanism | ✓ | No install spec or binary downloads. Dependencies are other OpenClaw skills via platform |
| Credentials | ℹ | No env vars declared. Config files could reference API keys in your environment - review before use |
| Persistence & Privilege | ✓ | always:false, disable-model-invocation:true. Writes only to `docs/reviews/` |

**Scanner Recommendations**:
1. Inspect `.openclaw/review-orchestrator.yaml` and `.claude/review-orchestrator.yaml` - ensure no API keys or unexpected endpoints
2. Review optional dependencies (failure-memory, context-verifier) permissions separately
3. Verify comfort with outputs written to `docs/reviews/`
4. Note: host agent (or other skills) must perform model calls since `disable-model-invocation=true`

**Action Required**:
- [x] Add note to SKILL.md that config files contain no credentials by design ✓ (v1.3.0)
- [x] Document that dependencies are skill references, not code imports ✓ (v1.3.0)
- [x] Add provenance note ✓ (v1.3.0)

---

### safety-checks

**Scan Results**: VirusTotal: Benign | OpenClaw: Suspicious (medium confidence)

**Assessment Summary**:
> The skill's stated purpose (runtime safety checks) is plausible, but the instructions leave important gaps about how key checks (especially 'actual' model version) are performed and there's a provenance/metadata mismatch that should be clarified before installation.

**Findings**:

| Category | Status | Details |
|----------|--------|---------|
| Purpose & Capability | ! | Verifying model version requires runtime metadata access. SKILL.md disallows model invocation and doesn't declare access to agent runtime config. **Provenance mismatch**: homepage (live-neon) vs repository (leegitw) |
| Instruction Scope | ! | Does not specify where 'Actual' model version is read from. Unclear how model pinning works in practice |
| Install Mechanism | ℹ | Instruction-only. References dependencies that would increase footprint |
| Credentials | ℹ | No env vars. May implicitly require access to agent runtime metadata (not declared) |
| Persistence & Privilege | ✓ | always:false, disable-model-invocation:true |

**Scanner Recommendations**:
1. Clarify exactly where/how skill reads 'Actual' model version
2. Reconcile repository/homepage mismatch (live-neon vs leegitw)
3. Provide explicit list of files/commands the skill reads

**Action Required**:
- [x] **FIX**: Add clarification that model version is read from agent's reported model header ✓ (v1.4.0)
- [x] **FIX**: Add provenance note ✓ (v1.4.0)
- [x] Document that model pinning validates config expectations ✓ (v1.4.0)

---

### failure-memory

**Scan Results**: VirusTotal: Benign | OpenClaw: Suspicious (medium confidence)

**Assessment Summary**:
> The skill's stated purpose (recording and searching local failure observations) is plausible, but there are inconsistencies in how it says it will be invoked, where its code/repo comes from, and how/what it will scan — so verify origin and runtime behavior before installing.

**Findings**:

| Category | Status | Details |
|----------|--------|---------|
| Purpose & Capability | ℹ | Name/description align. **Minor mismatch**: author/homepage (Live Neon) vs repository (leegitw) |
| Instruction Scope | ! | Describes 'auto-invoke' but skill is disable-model-invocation:true. Detection implies reading tool outputs/CI/CD beyond `.learnings/` |
| Install Mechanism | ℹ | Instruction-only. References dependency (context-verifier) |
| Credentials | ✓ | No env vars or credentials requested |
| Persistence & Privilege | ✓ | always:false, disable-model-invocation:true |

**Scanner Recommendations**:
1. Verify skill origin (Live Neon vs leegitw)
2. Clarify how detection is triggered (manual commands, orchestrator, or other)
3. Confirm what files/logs are scanned at runtime
4. Review config files for unexpected endpoints

**Already Fixed in v1.3.0**:
- [x] Removed "auto-invoke" language - now says "user or orchestrator triggers"

**Action Required**:
- [x] **FIX**: Add provenance note ✓ (v1.4.0)
- [x] Clarify that detection patterns describe what to look for, not autonomous scanning ✓ (v1.4.0)

---

### context-verifier

**Scan Results**: VirusTotal: Suspicious | OpenClaw: Suspicious (high confidence)

**Assessment Summary**:
> The skill's stated purpose (file integrity verification) matches most requirements, but its SKILL.md claims restricted file access while the runtime instructions allow reading arbitrary user-specified files and optionally writing their contents to disk — an inconsistency that could lead to accidental exposure of secrets.

**Findings**:

| Category | Status | Details |
|----------|--------|---------|
| Purpose & Capability | ℹ | Name/description align. No binaries/env vars/credentials requested |
| Instruction Scope | ! | **CONTRADICTION**: Claims "only accesses paths declared in its metadata" but accepts arbitrary user-specified files. `--include-content` writes file contents to disk |
| Install Mechanism | ✓ | Instruction-only. Lowest install risk |
| Credentials | ✓ | No credentials requested |
| Persistence & Privilege | ℹ | always:false. Packets with `--include-content` retained indefinitely |

**Scanner Recommendations**:
1. Treat `--include-content` as dangerous - never use on secrets
2. Add `output/context-packets/` to .gitignore
3. Inspect config files before use
4. Consider runtime-enforced allowlist for paths

**Action Required**:
- [x] **FIX**: Remove contradictory claim - added clear note that skill reads user-specified files ✓ (v1.3.0)
- [x] **FIX**: Strengthen file access warnings in Security Considerations ✓ (v1.3.0)
- [x] Add provenance note ✓ (v1.3.0)

---

### workflow-tools

**Scan Results**: VirusTotal: Suspicious | OpenClaw: Suspicious (medium confidence)

**Assessment Summary**:
> The skill's stated purpose (workflow utilities and loop detection) is plausible, but `/wt loops` accepts arbitrary path arguments for directory scanning and `/wt subworkflow` can spawn other skills — capabilities that require careful review before installation.

**Findings**:

| Category | Status | Details |
|----------|--------|---------|
| Purpose & Capability | ℹ | Name/description align. **Concern**: `/wt loops` scans arbitrary user-specified directories for dependency cycles |
| Instruction Scope | ! | `/wt subworkflow` can spawn other skills (inherits their privileges). Arbitrary path scanning capability |
| Install Mechanism | ✓ | Instruction-only. No binaries or external downloads |
| Credentials | ✓ | No env vars or credentials requested |
| Persistence & Privilege | ℹ | always:false, disable-model-invocation:true. Writes to `output/workflow-analysis/` |

**Scanner Recommendations**:
1. Review what directories `/wt loops` will scan — ensure no sensitive paths
2. Audit which skills `/wt subworkflow` can spawn and their permissions
3. Inspect config files for unexpected endpoints
4. Verify comfort with outputs written to `output/workflow-analysis/`

**Key Concerns**:
- `/wt loops <path>` accepts arbitrary directory paths for dependency analysis
- `/wt subworkflow` spawns other skills, inheriting their permission scope
- Combined with other agentic skills, could expand effective privilege footprint

**Action Required**:
- [x] Fixed data handling statement (instruction-only language) ✓ (v1.2.0)
- [x] Added Security Considerations section ✓ (v1.2.0)
- [x] Document path scanning scope for `/wt loops` ✓ (v1.3.0)
- [x] Document subworkflow spawning scope ✓ (v1.3.0)
- [x] Add provenance note ✓ (v1.3.0)

---

## Common Provenance Issue — RESOLVED

All 4 flagged skills had the same provenance mismatch:
- **Homepage/Author**: Live Neon (`https://github.com/live-neon/skills`)
- **Repository**: leegitw (`leegitw/skill-name`)

**Root Cause**: Skills were originally developed under `live-neon` organization but published to ClawHub under `leegitw` account.

**Fix Applied**: Option 3 - Added provenance note to each SKILL.md Security Considerations section:
> "This skill is developed by Live Neon (https://github.com/live-neon/skills) and published
> to ClawHub under the `leegitw` account. Both refer to the same maintainer."

**Skills Updated**:
- [x] review-orchestrator v1.3.0
- [x] safety-checks v1.4.0
- [x] failure-memory v1.4.0
- [x] context-verifier v1.3.0
- [x] workflow-tools v1.4.0

---

## Priority Order (Updated 2026-02-18 Evening)

### ROOT CAUSE IDENTIFIED & FIXED (2026-02-18 Late Evening)

**Problem**: ClawHub registry doesn't read top-level `config_paths` and `workspace_paths` from SKILL.md frontmatter.

**Solution**: Use `metadata.openclaw.requires.*` nested format:

```yaml
# ❌ WRONG - Registry ignores these
config_paths:
  - .openclaw/skill.yaml
workspace_paths:
  - output/skill-output/

# ✅ CORRECT - Registry reads these
metadata:
  openclaw:
    requires:
      config:
        - .openclaw/skill.yaml
      workspace:
        - output/skill-output/
```

### All Skills Updated (Post Security Scan Review)

| Skill | Version | Fixes Applied | Status |
|-------|---------|---------------|--------|
| constraint-engine | 1.2.0 | metadata format | Ready to republish |
| governance | 1.2.0 | metadata, data handling, security section | Ready to republish |
| failure-memory | 1.4.0 | metadata, detection clarification, provenance | Ready to republish |
| context-verifier | 1.3.0 | metadata, file access clarification, provenance | Ready to republish |
| safety-checks | 1.4.0 | metadata, model version clarification, provenance | Ready to republish |
| review-orchestrator | 1.3.0 | metadata, config/dependency notes, provenance | Ready to republish |
| workflow-tools | 1.4.0 | metadata, data handling, security section, path/subworkflow scope, removed contradictory claim | Ready to republish |

### Workflow Docs Updated

To prevent this issue from recurring, both workflow documents were updated:

**[docs/workflows/creating-new-skill.md](../workflows/creating-new-skill.md)**:
- Updated "Runtime Dependencies (metadata.openclaw)" section with correct nested YAML format
- Removed single-line JSON example that was incorrect
- Updated "Agentic Skills: Additional Required Fields" to use `metadata.openclaw.requires.*`
- Added warning that registry ignores top-level `config_paths`/`workspace_paths`
- **Added** instruction-only data handling template (for `disable-model-invocation: true`)
- **Added** Security Considerations templates for: file access scope, subworkflow spawning, provenance notes, config files, dependencies
- **Added** anti-patterns: model invocation contradiction, auto-invoke language, undocumented access, provenance mismatch
- **Added** "Before You Install" section template (HIGH success fix from research)
- **Added** templates for: external service name confusion, implicit data access, .gitignore guidance
- **Fixed** data handling template to not claim "only accesses declared paths" (was contradictory)

**[docs/workflows/skill-publish.md](../workflows/skill-publish.md)**:
- Updated "Required Frontmatter Fields" section with correct format
- Added warning about registry parser behavior
- Updated "Security-Critical Fields" table to reference `metadata.openclaw.requires.*`
- Updated "Pre-Publish Security Checklist" to detect wrong format
- Added "Metadata mismatch" and "Model invocation contradiction" to Common Security Scan Findings table
- **Added** slug availability check section (before publishing)
- **Added** "Auto-invoke language conflict", "Provenance mismatch", "Arbitrary file access", "Privilege expansion" to Common Security Scan Findings
- **Added** "Additional Security Considerations" section with templates for all new patterns
- **Added** "External service names", "Implicit data access" to Common Security Scan Findings
- **Added** templates for: external service name confusion, implicit data access, .gitignore recommendation

### Pending Actions
- [x] Address code review findings → [2026-02-18-code-review-remediation.md](./2026-02-18-code-review-remediation.md) ✓ RESOLVED
- [x] Update workflow docs with all lessons learned ✓ RESOLVED
- [x] Twin review completed ✓ APPROVED (2026-02-20)
- [ ] Republish all 7 skills with new versions (waiting for rate limit)
- [ ] Verify registry shows correct metadata after republish

### Code Review Findings (N=2) — RESOLVED

External review by Codex + Gemini identified additional issues. All resolved in **[2026-02-18-code-review-remediation.md](./2026-02-18-code-review-remediation.md)**:
- ✓ Data handling contradictions in governance and workflow-tools
- ✓ Missing Security Considerations sections
- ✓ Auto-detection language conflict in failure-memory
- ✓ Workspace path scope mismatch in safety-checks

---

## Common Patterns in Flags

All flagged skills share these characteristics:
- Instruction-only (no code) - but scanners still flag
- Reference config paths in SKILL.md that aren't in registry metadata
- Mention optional dependencies
- Cloud LLM data processing warnings (standard for all agent tools)

**Root cause identified**: ClawHub registry only reads `metadata.openclaw.requires.*` nested blocks.
Top-level `config_paths` and `workspace_paths` fields are **ignored by the registry parser**.

**Solution applied**: All 7 skills converted to correct format. Workflow docs updated to prevent future issues.

---

## Commands Reference

```bash
# Publish governance with new slug (original was taken)
clawhub publish agentic/governance --slug agentic-governance --name "Agentic Governance" --version 1.2.0 --tags "agentic,governance,lifecycle,compliance,reviews,adoption"

# Check skill status
clawhub info leegitw/<skill-name>

# Unpublish and republish (if needed)
clawhub unpublish leegitw/<skill-name>
clawhub publish <path> --slug <new-slug> ...
```

---

---

## Research: How Others Resolved False Positives

Based on review of 30+ open and closed issues in `openclaw/clawhub`:

### Key Findings

**1. This is a widespread problem** (Feb 17-18, 2026):
- 20+ open false positive issues in the last 48 hours
- Skills flagged despite VirusTotal showing 0/70+ detections
- OpenClaw scanner shows "Benign" but VirusTotal shows "Suspicious"

**2. Common resolution patterns**:

| Resolution | Example | Success Rate |
|------------|---------|--------------|
| Fix metadata alignment | date-night #414 | HIGH |
| Add Security Considerations section | html2md #405 | HIGH |
| Clarify documentation | RepoMedic #219 | MEDIUM |
| File detailed appeal | aport-agent-guardrail #386 | PENDING |
| Wait for re-scan | Multiple | MEDIUM |

**3. What gets flagged** (even when legitimate):
- Writing to directories (even workspace directories)
- Reading config files
- Scanning environment variables
- Cross-session data access
- Dependencies on other skills
- "Broad" instruction scope

**4. What fixes the flags**:

a) **Metadata alignment** (MOST IMPORTANT):
   - Ensure `config_paths` in SKILL.md matches registry metadata
   - Ensure `workspace` paths are declared
   - Ensure all `requires.*` fields are accurate

b) **Security Considerations section** in SKILL.md:
   ```markdown
   ## Security Considerations
   - What data is accessed and why
   - What gets written and where
   - No credentials/secrets requested
   - No external network calls (or document if there are)
   - Data does not leave machine (or document if it does)
   ```

c) **"Before You Install" section**:
   - List exactly what gets written
   - List what permissions are needed
   - Explain why each behavior is necessary

d) **Reconcile contradictions**:
   - If SKILL.md says "uses model" but `disable-model-invocation: true` → FIX
   - If SKILL.md lists paths not in metadata → ADD to metadata

**5. Appeal process**:
- File GitHub issue with:
  - Skill URL
  - VirusTotal report link
  - Explanation of each flagged behavior
  - Links to source code
  - Request for specific guidance

### Recommended Actions for Our Skills

**For context-verifier and failure-memory** (false positives):
1. Add "Security Considerations" section to SKILL.md
2. Add "Before You Install" section documenting exact behaviors
3. Ensure all paths are declared in metadata
4. File GitHub appeal if flags persist

**For safety-checks** (legitimate concerns):
1. FIX the `disable-model-invocation` contradiction first
2. Remove or document the `window.*`/`global.*` checks
3. Align all config_paths with metadata
4. Republish and wait for re-scan

**For review-orchestrator** (metadata mismatch):
1. Add `config_paths` to registry metadata to match SKILL.md
2. Clarify "External validators" wording
3. Republish

### Template: GitHub Appeal Issue

```markdown
## False positive: [skill-name] flagged as suspicious

**Skill:** [clawhub.ai/leegitw/skill-name](URL)

**Scan results:**
- VirusTotal: [link] — 0/70+ detections
- OpenClaw: Benign (high confidence)

**Why this is a false positive:**
[Explain each flagged behavior and why it's necessary]

**What the skill does:**
[Brief description]

**Documentation:**
- SKILL.md includes Security Considerations section
- All paths declared in metadata
- No credentials requested
- No external network calls

**Request:**
1. Re-scan or re-review with this context
2. Clear suspicious flag, OR
3. Share what rule triggered so we can adjust

**Publisher:** @leegitw
```

---

## Cross-References

### Related Issues

- **[2026-02-18-code-review-remediation.md](./2026-02-18-code-review-remediation.md)** — Code review findings (N=2) with action items

### Code Reviews

- **[2026-02-18-clawhub-publishing-codex.md](../reviews/2026-02-18-clawhub-publishing-codex.md)** — Codex review
- **[2026-02-18-clawhub-publishing-gemini.md](../reviews/2026-02-18-clawhub-publishing-gemini.md)** — Gemini review

### Standards & Workflow Documentation (Updated)

- **[skill-security-compliance.md](../standards/skill-security-compliance.md)** — **Authoritative** security requirements (extracted from this issue)
- **[creating-new-skill.md](../workflows/creating-new-skill.md)** — Skill creation workflow, references skill-security-compliance.md
- **[skill-publish.md](../workflows/skill-publish.md)** — Publishing workflow, references skill-security-compliance.md

### Affected Skills

- [agentic/constraint-engine/SKILL.md](../../agentic/constraint-engine/SKILL.md) — v1.2.0
- [agentic/governance/SKILL.md](../../agentic/governance/SKILL.md) — v1.2.0
- [agentic/failure-memory/SKILL.md](../../agentic/failure-memory/SKILL.md) — v1.4.0
- [agentic/context-verifier/SKILL.md](../../agentic/context-verifier/SKILL.md) — v1.3.0
- [agentic/safety-checks/SKILL.md](../../agentic/safety-checks/SKILL.md) — v1.4.0
- [agentic/review-orchestrator/SKILL.md](../../agentic/review-orchestrator/SKILL.md) — v1.3.0
- [agentic/workflow-tools/SKILL.md](../../agentic/workflow-tools/SKILL.md) — v1.4.0

### External References

- [openclaw/clawhub issues](https://github.com/openclaw/clawhub/issues) — Source of metadata format research
- [ClawHub Registry](https://clawhub.ai) — Skill registry

---

*Created 2026-02-18 after publishing 6 of 7 agentic skills to ClawHub*
*Updated with external research from openclaw/clawhub issues*
*Updated 2026-02-18 late evening with root cause fix and workflow doc updates*
*Updated 2026-02-19 with detailed security scan results for all flagged skills*
*Updated 2026-02-20 with comprehensive workflow doc updates (all lessons learned)*
