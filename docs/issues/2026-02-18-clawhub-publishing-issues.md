---
created: 2026-02-18
type: issue
status: open
priority: high
topic: ClawHub publishing issues for agentic skills
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

## Issue 3: Failure-Memory Flagged

**Skill**: `agentic/failure-memory`
**Status**: Published but flagged
**VirusTotal**: Suspicious
**OpenClaw**: Benign (high confidence)

**Reason for Flag**:
- Scans tool output, user messages, CI/CD output
- Mentions "across sessions and projects" which implies broader data access
- Optional dependency on `leegitw/context-verifier`

**Assessment**: False positive. Local failure-detection and memory tool.

**Recommendations from Scanner**:
1. Confirm what agent data streams it will access
2. Ensure `.learnings/` directory is acceptable
3. Trust optional dependency before installing

**Action Required**:
- [ ] Clarify data access boundaries in SKILL.md
- [ ] Make dependency relationship clearer
- [ ] Submit GitHub issue to ClawHub if flag persists

---

## Issue 4: Safety-Checks Flagged (NEEDS FIXES)

**Skill**: `agentic/safety-checks`
**Status**: Published but flagged
**VirusTotal**: Suspicious
**OpenClaw**: Suspicious (medium confidence)

**Reason for Flag** (LEGITIMATE CONCERNS):

1. **Internal contradiction**: SKILL.md says it "uses your agent's configured model" but registry metadata sets `disable-model-invocation=true`

2. **Undeclared config paths**: SKILL.md lists `config_paths` that registry metadata did not declare

3. **Broad instructions**: Scanning environment variables, `/tmp` files, file locks, `global/window` mutations - broader than declared

4. **Platform-specific checks**: References to `window.*` and `global.*` appear unrelated to generic safety checker

**Assessment**: LEGITIMATE - Needs fixes before resubmission.

**Action Required**:
- [ ] **FIX**: Reconcile `disable-model-invocation` contradiction
- [ ] **FIX**: Align declared config_paths between SKILL.md and registry
- [ ] **FIX**: Remove or clarify `window.*`/`global.*` checks (platform-specific)
- [ ] **FIX**: Limit scope of env var and `/tmp` scanning or document clearly
- [ ] **FIX**: Clarify cross-session scan permissions
- [ ] Republish after fixes

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

## Issue 6: Workflow-Tools Pending

**Skill**: `agentic/workflow-tools`
**Status**: Scan in progress
**VirusTotal**: Pending
**OpenClaw**: Benign (high confidence)

**Notes from Pre-scan**:
- Subworkflow feature can invoke other skills (inherits their privileges)
- Scans directories and reads config files
- No credentials or install spec required

**Action Required**:
- [ ] Wait for VirusTotal scan to complete
- [ ] Address any issues that arise

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

## Priority Order (Updated 2026-02-18)

### Completed Fixes
- [x] **safety-checks** v1.1.0 - Fixed contradictions, narrowed scope
- [x] **review-orchestrator** v1.1.0 - Fixed metadata mismatch, clarified cognitive modes
- [x] **context-verifier** v1.1.0 - Fixed model invocation claim
- [x] **failure-memory** v1.1.0 - Fixed cross-project claim, added Security Considerations
- [x] **governance** - Renamed slug to `agentic-governance`
- [x] **constraint-engine** v1.1.0 - Fixed model invocation contradiction

### Pending Republish (Rate Limited)
1. `safety-checks` v1.1.0
2. `review-orchestrator` v1.1.0
3. `context-verifier` v1.1.0
4. `failure-memory` v1.1.0
5. `agentic-governance` v1.0.0
6. `constraint-engine` v1.1.0

### Monitoring
- `workflow-tools` - VirusTotal scan pending (OpenClaw: Benign)

---

## Common Patterns in Flags

All flagged skills share these characteristics:
- Instruction-only (no code) - but scanners still flag
- Reference config paths in SKILL.md that aren't in registry metadata
- Mention optional dependencies
- Cloud LLM data processing warnings (standard for all agent tools)

**Meta-action**: Consider creating a template that ensures SKILL.md and registry metadata are always aligned to avoid future flags.

---

## Commands Reference

```bash
# Publish with different slug
clawhub publish agentic/governance --slug pattern-governance --name "Pattern Governance" --version 1.0.0 --tags "governance,lifecycle,compliance,reviews,adoption"

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

*Created 2026-02-18 after publishing 6 of 7 agentic skills to ClawHub*
*Updated with external research from openclaw/clawhub issues*
