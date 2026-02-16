---
created: 2026-02-15
type: plan
status: backlog
priority: medium
prerequisite: Active constraint usage
deferred_from:
  - ../implementation/agentic-phase7-results.md
related:
  - ../../agentic/failure-memory/SKILL.md
  - ../../agentic/governance/SKILL.md
  - ../references/clawhub-format-compatibility.md
---

# N-Count Evidence Verification Plan

## Summary

Implement verification that R/C/D (Recurrence/Confirmation/Disconfirmation) counts
are backed by actual evidence entries, preventing inflated or orphaned counts.

**Trigger**: When constraints are actively being generated
**Duration**: 1 day
**Output**: Verification commands in `/gov`, integrity checks in `/fm`

## Background

The R/C/D counting system tracks observation evidence:
- **R (Recurrence)**: How many times pattern observed
- **C (Confirmation)**: Human confirmations of validity
- **D (Disconfirmation)**: Human rejections

**Problem**: Counts can become disconnected from evidence if:
- Entry deleted but count not decremented
- Count manually edited without adding entry
- Circular references inflate counts

**Current state**: Counts trusted without verification
**Target state**: Counts verified against evidence trail

## Prerequisites

Before starting:

- [ ] `.learnings/` contains real entries (not just templates)
- [ ] At least one constraint generated via `/ce generate`
- [ ] R/C/D format in use

### Verification

```bash
# Check for entries with R/C/D
grep "R/C/D" .learnings/LEARNINGS.md

# Check for constraints
ls output/constraints/
```

## Stage 1: Evidence Trail Design

**Duration**: 2 hours
**Goal**: Design evidence linking structure

### Tasks

1. **Define evidence link format**
   ```markdown
   **R/C/D**: R=3, C=2, D=0
   **Evidence**:
   - R: OBS-20260215-001, OBS-20260215-005, OBS-20260215-012
   - C: Review-20260215, User-20260216
   - D: (none)
   ```

2. **Design verification algorithm**
   ```
   For each entry with R/C/D:
     1. Parse claimed counts
     2. Parse evidence links
     3. Verify link count matches claimed count
     4. Verify each link resolves to real entry
     5. Report discrepancies
   ```

3. **Define remediation actions**
   - Auto-fix: Adjust count to match evidence
   - Manual: Flag for human review
   - Critical: Block constraint generation

### Acceptance Criteria

- [ ] Evidence format documented
- [ ] Verification algorithm specified
- [ ] Remediation actions defined

## Stage 2: Verification Command

**Duration**: 2 hours
**Goal**: Add verification to `/gov`

### Tasks

1. **Add `/gov verify-counts` command**
   ```
   Usage: /gov verify-counts [options]

   Options:
     --fix         Auto-fix mismatches where safe
     --report      Generate detailed report
     --strict      Fail on any mismatch

   Output:
     Verified: 15 entries
     Mismatches: 2 entries
       - LRN-20260215-003: R=5 claimed, R=3 evidence
       - LRN-20260215-007: C=2 claimed, C=1 evidence
   ```

2. **Implement verification logic**
   - Parse all `.learnings/*.md` files
   - Extract R/C/D counts
   - Extract evidence links (if present)
   - Cross-reference and validate

3. **Add to governance SKILL.md**
   - Document new command
   - Add to "When to Use" section
   - Include examples

### Acceptance Criteria

- [ ] `/gov verify-counts` documented
- [ ] Verification logic specified
- [ ] Auto-fix behavior defined

## Stage 3: Integrity Checks in /fm

**Duration**: 2 hours
**Goal**: Prevent orphaned counts at creation time

### Tasks

1. **Update `/fm record` to require evidence**
   ```
   When incrementing R:
     - Must link to source observation
     - Must not duplicate existing link

   When incrementing C/D:
     - Must link to verification source
     - Must record verifier identity
   ```

2. **Add pre-increment validation**
   - Before R++: Check observation exists
   - Before C++: Check verification recorded
   - Before D++: Check disconfirmation reason

3. **Update failure-memory SKILL.md**
   - Document evidence requirements
   - Add validation error messages
   - Include examples

### Acceptance Criteria

- [ ] Evidence required for count changes
- [ ] Validation errors helpful
- [ ] SKILL.md updated

## Stage 4: Circular Reference Detection

**Duration**: 2 hours
**Goal**: Detect and prevent circular evidence

### Tasks

1. **Define circular reference**
   ```
   Circular: A → B → A (A cites B, B cites A)

   Example:
     LRN-001: Evidence includes LRN-002
     LRN-002: Evidence includes LRN-001
     Result: Both have inflated R counts
   ```

2. **Implement detection**
   - Build evidence graph
   - Detect cycles using DFS
   - Report all circular chains

3. **Add to verification**
   ```
   /gov verify-counts --check-circular

   Circular references detected:
     Chain 1: LRN-001 → LRN-002 → LRN-001
     Chain 2: LRN-005 → LRN-006 → LRN-007 → LRN-005
   ```

### Acceptance Criteria

- [ ] Circular detection implemented
- [ ] All cycles reported
- [ ] Remediation guidance provided

## Success Criteria

- [ ] Evidence trail format documented
- [ ] `/gov verify-counts` command works
- [ ] `/fm record` validates evidence
- [ ] Circular reference detection works
- [ ] Results file created

## Files Modified

- `agentic/governance/SKILL.md` - Add verify-counts command
- `agentic/failure-memory/SKILL.md` - Add evidence requirements
- `.learnings/LEARNINGS.md` - Update template with Evidence field

## Cross-References

- **R/C/D Format**: `docs/references/clawhub-format-compatibility.md`
- **Failure Memory**: `agentic/failure-memory/SKILL.md`
- **Governance**: `agentic/governance/SKILL.md`
- **Phase 7 Deferral**: `docs/implementation/agentic-phase7-results.md`

---

*Plan created 2026-02-15. Deferred from Phase 7 - requires active usage.*
