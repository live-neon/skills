# Phase 2 Code Review Remediation

**Created**: 2026-02-13
**Resolved**: 2026-02-13
**Status**: Resolved
**Priority**: High
**Source**: N=2 External Code Review (Codex + Gemini)

## Summary

Consolidates all findings from the N=2 code review of Phase 2 Agentic Skills Implementation.
All N=1 findings have been verified to N=2 through direct file inspection.

## Cross-References

### Reviews
- `../reviews/2026-02-13-phase2-implementation-codex.md`
- `../reviews/2026-02-13-phase2-implementation-gemini.md`

### Implementation
- `../plans/2026-02-13-agentic-skills-phase2-implementation.md`
- `projects/live-neon/skills/docs/implementation/agentic-phase2-results.md`

---

## Finding 1: time_gated Approval Allows AI Self-Approval

**Severity**: Critical
**Source**: Codex (verified N=2)
**File**: `projects/live-neon/skills/agentic/core/emergency-override/SKILL.md:344`

### Evidence

```markdown
| Method | Security | Use Case |
|--------|----------|----------|
| `challenge_response` | High | Default - random token typed by human |
| `signed_token` | High | Pre-generated token from external auth system |
| `time_gated` | Medium | Fallback - 10s minimum delay before acceptance |
```

### Issue

The `time_gated` approval method auto-accepts overrides after a 10-second delay without
any human verification. This directly contradicts the trust boundary stated at line 18:
"AI CANNOT self-approve overrides."

### Risk

An AI could:
1. Request an override
2. Wait 10 seconds
3. Have it auto-approved without genuine human verification

This undermines the entire security model of the emergency-override skill.

### Resolution

**Option A (Recommended)**: Remove `time_gated` entirely
- Delete from Approval Methods table
- Document only `challenge_response` and `signed_token` as supported methods

**Option B**: Deprecate with explicit warning
- Mark as `DEPRECATED` in the table
- Add warning: "NOT RECOMMENDED - allows potential AI self-approval"
- Require explicit human opt-in via configuration file (not runtime)

**Option C**: Strengthen time_gated
- Require human action to enter time_gated mode (separate challenge)
- Increase delay to 60+ seconds
- Add terminal notification that interrupts workflow

---

## Finding 2: Missing sources >= 2 Check in Test Utility

**Severity**: Important
**Source**: Gemini (verified N=2)
**File**: `projects/live-neon/skills/tests/e2e/skill-behavior.test.ts:188-193`

### Evidence

```typescript
function isEligibleForConstraint(obs: Partial<ObservationFile>): boolean {
  if (obs.type !== 'failure') return false;
  if ((obs.r_count ?? 0) < 3) return false;
  if ((obs.c_count ?? 0) < 2) return false;
  if ((obs.c_unique_users ?? 0) < 2) return false;
  return true;  // No sources check!
}
```

Compare to `phase2-integration.test.ts:130` which correctly includes:
```typescript
new Set(obs.sources.map(s => s.file)).size >= 2
```

### Issue

The `isEligibleForConstraint` function in skill-behavior.test.ts is missing the
`sources >= 2` validation that is required by the constraint-generator spec.

### Risk

Tests may pass with observations that have insufficient source diversity, creating
false confidence in constraint eligibility logic.

### Resolution

Update `skill-behavior.test.ts:188-193`:

```typescript
function isEligibleForConstraint(obs: Partial<ObservationFile>): boolean {
  if (obs.type !== 'failure') return false;
  if ((obs.r_count ?? 0) < 3) return false;
  if ((obs.c_count ?? 0) < 2) return false;
  if ((obs.c_unique_users ?? 0) < 2) return false;
  // Add sources check
  const uniqueSources = new Set((obs.sources ?? []).map(s => s.file)).size;
  if (uniqueSources < 2) return false;
  return true;
}
```

---

## Finding 3: memory-search Eligibility Label Misleading

**Severity**: Important
**Source**: Codex (verified N=2)
**File**: `projects/live-neon/skills/agentic/core/memory-search/SKILL.md:148`

### Evidence

```markdown
/memory-search --type observation --min-r 3 --min-c 2

SEARCH RESULTS: Observations with R≥3, C≥2
──────────────────────────────────────────

Found 3 results (eligible for constraint generation):
```

### Issue

The output labels results as "eligible for constraint generation" when the search
filters only `--min-r 3 --min-c 2`. This ignores the `sources >= 2` and
`c_unique_users >= 2` requirements that are mandatory per constraint-generator spec.

### Risk

Users/AI may believe observations are constraint-eligible when they are not, leading
to failed constraint generation attempts or confusion.

### Resolution

**Option A (Recommended)**: Change label to be accurate
```markdown
Found 3 results (meeting R/C thresholds):
```

**Option B**: Add missing filters
- Add `--min-sources` and `--min-unique-users` filters to memory-search
- Only use "eligible" label when all 4 criteria are met

---

## Finding 4: Eligibility Criteria Documentation Inconsistent

**Severity**: Minor
**Source**: Codex (verified N=2)
**Files**: Multiple SKILL.md files

### Evidence

| Location | Criteria Mentioned |
|----------|-------------------|
| failure-tracker:14 | R≥3, C≥2, sources≥2 (missing unique_users) |
| failure-tracker:48 | R≥3, C≥2 (missing sources, unique_users) |
| failure-tracker:99,120 | All 4 criteria (correct) |
| constraint-generator spec | R≥3, C≥2, sources≥2, c_unique_users≥2 (canonical) |

### Issue

The eligibility formula is stated differently in different parts of the specs.
The canonical formula (from constraint-generator) requires all 4 criteria:
- R ≥ 3
- C ≥ 2
- sources ≥ 2
- c_unique_users ≥ 2

### Resolution

Standardize all eligibility references. Add a note to failure-tracker:

```markdown
**Eligibility Criteria** (for constraint generation):
- R ≥ 3 (recurrence)
- C ≥ 2 (confirmations)
- sources ≥ 2 (file diversity)
- c_unique_users ≥ 2 (user diversity)

See `constraint-generator/SKILL.md` for full details.
```

Update `--eligible` flag description (line 48):
```markdown
| --eligible | No | Filter to constraint-eligible (R≥3, C≥2, sources≥2, unique_users≥2) |
```

---

## Finding 5: ARCHITECTURE.md Layer Dependency Contradiction

**Severity**: Minor
**Source**: Codex (verified N=2)
**File**: `projects/live-neon/skills/ARCHITECTURE.md:402`

### Evidence

Line 402 (Layer Guidelines):
```markdown
| Core | May depend on Foundation only |
```

But the Core Memory Data Flow (lines 111-117) shows:
```markdown
failure-tracker → constraint-generator → constraint-lifecycle → circuit-breaker
```

These are Core-to-Core dependencies.

### Issue

The Layer Guidelines suggest Core skills should only depend on Foundation, but the
actual Core Memory layer has internal dependencies between Core skills.

### Resolution

Update Layer Guidelines (line 402):

```markdown
| Core | May depend on Foundation and other Core skills |
```

Or clarify in a note:
```markdown
**Note**: Within the Core Memory layer, skills may depend on each other
(failure-tracker → constraint-generator → constraint-lifecycle, etc.).
The "Foundation only" rule applies to skills in other categories.
```

---

## Finding 6: Race Conditions in State Transitions (Theoretical)

**Severity**: Important (Preventive)
**Source**: Gemini
**Status**: Theoretical - specs not yet implemented

### Issue

The circuit-breaker and emergency-override state transitions are not explicitly
designed for atomicity in concurrent scenarios. While atomic write-and-rename
prevents file corruption, concurrent state transitions could result in:
- Two violations recorded but only one counted
- Circuit failing to trip when it should

### Assessment

This is a theoretical concern for future implementation. The current SKILL.md specs
describe file-level atomic operations but not transaction-level atomicity.

### Resolution (Future)

When implementing these skills:
1. Use compare-and-swap semantics for state transitions
2. Add explicit locking for state file access
3. Include race condition tests in implementation

---

## Remediation Checklist

### Critical (Must Fix)
- [x] Finding 1: Remove or secure `time_gated` approval method

### Important (Should Fix)
- [x] Finding 2: Add `sources >= 2` check to `isEligibleForConstraint()`
- [x] Finding 3: Update memory-search eligibility label

### Minor (Consider)
- [x] Finding 4: Standardize eligibility criteria references
- [x] Finding 5: Clarify ARCHITECTURE.md layer dependency rules
- [x] Finding 6: Document atomicity requirements for future implementation

---

## Verification

After remediation:
1. Run full test suite: `npm test` (should still pass 330 tests)
2. Verify no new eligibility-related test failures
3. Review updated specs for consistency

### Verification Results (2026-02-13)

All remediation completed and verified:

```
 Test Files  3 passed (3)
      Tests  330 passed | 14 skipped (344)
```

**Changes Made**:

1. **Finding 1**: Removed `time_gated` from approval methods table; added security note explaining why time-based methods are intentionally unsupported
2. **Finding 2**: Added `sources >= 2` check to `isEligibleForConstraint()`; updated tests to include sources field
3. **Finding 3**: Changed label from "eligible for constraint generation" to "meeting R/C thresholds"
4. **Finding 4**: Updated failure-tracker line 14 and --eligible flag to include all 4 criteria
5. **Finding 5**: Updated ARCHITECTURE.md layer rule to "May depend on Foundation and other Core skills"; added clarifying note
6. **Finding 6**: Added "Concurrent State Transitions" section to both circuit-breaker and emergency-override SKILL.md files

---

*Issue created 2026-02-13 from N=2 code review (Codex + Gemini).*
*All findings verified to N=2 through direct file inspection.*
*Resolved 2026-02-13 - all 6 findings addressed.*
