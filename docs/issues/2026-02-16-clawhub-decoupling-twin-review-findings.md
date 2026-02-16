# Issue: ClawHub Decoupling Twin Review Findings

**Created**: 2026-02-16
**Status**: Closed
**Resolved**: 2026-02-16
**Priority**: Low (post-publication improvements)
**Blocking**: None (all actionable items addressed)

## Source Reviews (N=2)

- `docs/reviews/2026-02-16-clawhub-decoupling-impl-twin-technical.md`
- `docs/reviews/2026-02-16-clawhub-decoupling-impl-twin-creative.md`

## Related

- **Plan**: `docs/plans/2026-02-15-agentic-clawhub-decoupling.md` (complete)
- **Code Review Issue**: `docs/issues/2026-02-16-clawhub-decoupling-impl-review-remediation.md` (closed)
- **Code Reviews**: `docs/reviews/2026-02-16-clawhub-decoupling-impl-codex.md`, `docs/reviews/2026-02-16-clawhub-decoupling-impl-gemini.md`

---

## Verdict

**APPROVED** for ClawHub v1.0.0 publication. All findings are improvements for v1.1.0, not blockers.

---

## Critical Findings

None.

---

## Important Findings (Verified N=2)

### I-1: R/C/D Threshold Rationale Missing (N=2: Both Verified)

**Description**: The mathematical criteria `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2` appear frequently but are never motivated. Users ask "why 3? why 2?" and find no answer.

**Locations**:
- `agentic/README.md:67`
- `agentic/failure-memory/SKILL.md:55`
- `agentic/constraint-engine/SKILL.md:119-128`

**Verification**: Grep for "why.*threshold\|rationale" returns no matches.

**Suggested Fix** (add to `agentic/README.md` after line 67):
```markdown
**Why these thresholds?**
- R≥3: One occurrence is noise, two is coincidence, three is a pattern
- C≥2: Requires multiple human confirmations to avoid single-source bias
- D/(C+D)<0.2: Allows some false positives but caps signal degradation at 20%
- sources≥2: Cross-validation from independent contexts
```

**Severity**: Important (affects understanding, not function)
**Target**: v1.1.0

---

### I-2: No "Quick Win" Path for New Users (N=2: Both Verified)

**Description**: New users must commit to understanding the full 7-skill architecture. There's no "try this one command to see value" entry point.

**Location**: `agentic/README.md` (missing section)

**Verification**: Grep for "quick.?start\|getting.?started\|try.*first" returns no matches.

**Suggested Fix**: Add a "Try It Now" section to `agentic/README.md`:
```markdown
## Try It Now (2 minutes)

```bash
# Install just the core
openclaw install leegitw/failure-memory

# Record an observation
/fm record "Tests should run before commit"

# Check status
/fm status
```

See the full suite for constraint generation and enforcement.
```

**Severity**: Important (affects adoption)
**Target**: v1.1.0

---

### I-3: Manual Dependency Installation (N=2: Both)

**Description**: Users must manually install dependencies in correct order. No automated dependency resolution.

**Location**: `agentic/README.md:9-22`, `agentic/INDEX.md:47-61`

**Current**:
```bash
# 1. Foundation (install first - no dependencies)
openclaw install leegitw/context-verifier

# 2. Core (install in order)
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine
...
```

**Suggested Fix**: Request ClawHub feature for dependency resolution, or create meta-package:
```bash
openclaw install leegitw/agentic-suite  # Installs all 7 in correct order
```

**Severity**: Important (affects UX)
**Target**: v1.1.0 (depends on ClawHub capability)
**Note**: Already tracked in previous remediation issue as deferred item.

---

### I-4: No End-to-End Tutorial (N=2: Both Verified)

**Description**: No walkthrough showing the complete failure → observation → constraint → enforcement cycle.

**Location**: `agentic/README.md` (missing), no `docs/tutorials/` directory

**Verification**: Grep for "tutorial\|walkthrough\|step.?by.?step" returns no matches.

**Suggested Fix**: Create `agentic/TUTORIAL.md` or add to README:
```markdown
## Complete Walkthrough

### Step 1: Detect a Failure
```
> npm test
FAIL: src/auth.test.js

[DETECTED] test failure
Pattern: auth-test-failure
Observation: OBS-20260216-001
R: 1
```

### Step 2: Failure Recurs (R → 3)
[... show R incrementing ...]

### Step 3: Human Confirms (C → 2)
```
/fm record OBS-20260216-001 C
```

### Step 4: Generate Constraint
```
/ce generate OBS-20260216-001
[CONSTRAINT GENERATED]
Text: "Always run auth tests before commit"
```

### Step 5: Enforcement
```
> git commit -m "feature"
[CHECK BLOCKED] Constraint violated
```
```

**Severity**: Important (affects onboarding)
**Target**: v1.1.0

---

## Minor Findings (Verified N=2)

### M-1: CJK Notation Unexplained (N=2: Both Verified)

**Description**: CJK column appears in command tables but is never explained to non-Japanese users.

**Locations**: All 7 SKILL.md files in `| Command | CJK | Logic | Trigger |` tables

**Example**: `agentic/failure-memory/SKILL.md:49-57`

**Verification**: CJK column exists but no explanation of what it means or why it's there.

**Suggested Fix**: Add footnote or section:
```markdown
> **CJK Notation**: Japanese characters provide compact, memorable identifiers.
> They are optional—all functionality works with English commands.
> Examples: 検出 (detect), 記録 (record), 生成 (generate)
```

**Severity**: Minor (cultural context, not functionality)
**Target**: v1.1.0 or v1.2.0

---

### M-2: "workflow-tools" is Grab-Bag Name (N=1: Creative)

**Description**: Unlike other skills with clear purposes (failure-memory, constraint-engine), "workflow-tools" is a consolidation artifact that groups unrelated utilities.

**Location**: `agentic/workflow-tools/SKILL.md`

**Assessment**: This is a trade-off from consolidation (48 → 7 skills). The grab-bag is preferable to having 4 separate tiny skills.

**Action**: Document in skill description that it's a utility collection. Already noted at line 17-18:
> "Unified skill for workflow utilities including open loop detection, parallel/serial decision framework, MCE file analysis, and subworkflow spawning."

**Severity**: Minor (naming, not function)
**Target**: No action needed (acceptable trade-off)

---

### M-3: MCE Acronym Not Expanded (N=1: Creative → Verified FALSE POSITIVE)

**Description**: Creative review noted MCE acronym not expanded.

**Verification**: FALSE POSITIVE - MCE is expanded at `agentic/workflow-tools/SKILL.md:22`:
> `MCE (minimal-context-engineering)`

**Action**: None required.

---

### M-4: AWS References in Examples (N=1: Technical → Verified Acceptable)

**Description**: AWS references appear in illustrative examples.

**Locations**:
- `agentic/safety-checks/SKILL.md:343` - `AWS_ACCESS_KEY` in rotation example
- `agentic/workflow-tools/SKILL.md:190` - `HARDCODED: AWS region` in loop detection

**Assessment**: These are illustrative examples showing the skills detecting issues. They demonstrate real-world usage, not AWS dependency.

**Action**: Acceptable as-is. Could add non-AWS example alongside in future.

**Severity**: Minor (illustrative, not dependency)
**Target**: No action needed

---

### M-5: MCE Threshold Approaching (N=1: Technical → Verified Informational)

**Description**: Multiple files approaching 400-line MCE threshold.

**Verified File Sizes**:
| File | Lines | Status |
|------|-------|--------|
| workflow-tools/SKILL.md | 396 | ⚠ Approaching |
| safety-checks/SKILL.md | 380 | ⚠ Approaching |
| review-orchestrator/SKILL.md | 377 | ⚠ Approaching |
| governance/SKILL.md | 365 | ⚠ Approaching |
| constraint-engine/SKILL.md | 325 | OK |
| context-verifier/SKILL.md | 308 | OK |
| failure-memory/SKILL.md | 268 | OK |

**Assessment**: All under 400 lines. MCE threshold is 200 for code files; documentation files have more latitude. Monitor but no action needed.

**Severity**: Informational
**Target**: Monitor in future releases

---

## Alternative Framing Consensus

Both reviewers raised strategic questions:

1. **Are we solving the right problem?**
   - Yes - decoupling enables broader adoption without abandoning existing users

2. **Provider-neutrality assumption**:
   - Valid for doc-driven skills (no runtime model calls)
   - Technical suggestion: Consider `leegitw/claude-defaults` package for zero-config Claude users

3. **ClawHub adoption**:
   - Reasonable risk; skills work standalone regardless of ClawHub success

4. **User engagement with C/D counters**:
   - Worth monitoring post-launch; most value comes from R (automatic)

---

## Remediation Checklist

### High Priority (v1.1.0)

- [x] Add R/C/D threshold rationale to `agentic/README.md` ✓ 2026-02-16
- [x] Add "Try It Now" quick start section ✓ 2026-02-16
- [x] Create end-to-end tutorial (walkthrough of full cycle) ✓ 2026-02-16

### Medium Priority (v1.1.0 or v1.2.0)

- [x] Add CJK notation explanation/footnote ✓ 2026-02-16
- [ ] Consider meta-install package (`leegitw/agentic-suite`) — Deferred (depends on ClawHub)
- [ ] Consider `leegitw/claude-defaults` for zero-config Claude users — Deferred to v1.1.0

### Low Priority (Monitor)

- [ ] Monitor MCE threshold as skills grow — Ongoing
- [ ] Add non-AWS examples if user feedback suggests confusion — As needed

---

## Acceptance Criteria

- [x] Users can understand "why these thresholds" from documentation ✓
- [x] New users have a 2-minute "try it" path ✓
- [x] Complete failure-to-constraint cycle is documented with walkthrough ✓
- [x] CJK notation has brief explanation for international users ✓

---

*Issue created 2026-02-16 from twin review N=2 (Technical + Creative).*
