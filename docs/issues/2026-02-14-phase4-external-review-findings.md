# Phase 4 External Review Findings

**Created**: 2026-02-14
**Resolved**: 2026-02-14
**Status**: Closed
**Priority**: Medium
**Source**: External Code Review (Codex + Gemini)
**Type**: Test Quality / Mock Fidelity
**Phase**: 4 (Governance & Safety)

## Summary

External N=2 code review (Codex + Gemini) of Phase 4 implementation identified 6 net-new
findings not covered by the twin review. All findings relate to mock implementation fidelity
in contract tests, not specification issues. The SKILL.md files correctly document the
expected behavior; the mocks have been updated to match.

**Finding Distribution**:
- Critical (test logic): 2 - RESOLVED
- Important (edge case): 1 - RESOLVED
- Minor (mock fidelity): 3 - RESOLVED

**Resolution**: All 6 findings addressed. Tests increased from 33 to 50 (17 new tests).

## Cross-References

### Review Sources
- Codex Review: `docs/reviews/2026-02-14-phase4-implementation-codex.md`
- Gemini Review: `docs/reviews/2026-02-14-phase4-implementation-gemini.md`

### Related Issues
- `docs/issues/2026-02-14-phase4-code-review-findings.md` (N=2 code review - CLOSED)
- `docs/issues/2026-02-14-phase4-twin-review-findings.md` (twin review - CLOSED)

### Related Plans
- `docs/plans/2026-02-14-agentic-skills-phase4-implementation.md` (implemented plan)
- `docs/proposals/2026-02-13-agentic-skills-specification.md` (specification)

### Related Results
- `docs/implementation/agentic-phase4-results.md`

### Test File
- `tests/e2e/phase4-contracts.test.ts`

---

## Critical Findings

### Finding 1: Cache Validation Test Logic Flaw

**Source**: Codex Review
**File**: `tests/e2e/phase4-contracts.test.ts`
**Lines**: 357-407 (updated)

**Issue**: The `MockCacheValidator.validate()` method had confusing hash comparison logic.

**Resolution**:
- Separated `currentFileHashes` (file system state) from `cachedFileHashes` (cached state)
- Added clear documentation explaining the mock design
- Added Scenario 16 with 3 tests validating cache behavior

**Status**: [x] Done

---

### Finding 2: Lock Mock Has No Expiry

**Source**: Codex Review
**File**: `tests/e2e/phase4-contracts.test.ts`
**Lines**: 259-296 (updated)

**Issue**: The `MockGovernanceState.acquireLock()` method created locks without TTL.

**Resolution**:
- Added `expires_at` field to `WriteLock` interface
- Updated `acquireLock()` to check expiry before rejecting
- Added `refreshLock()` method for heartbeat functionality
- Added `isLockExpired()` method for testing
- Added Scenario 12 with 4 tests validating lock TTL behavior

**Status**: [x] Done

---

## Important Findings

### Finding 3: Drift Formula Division by Zero

**Source**: Codex Review
**File**: `agentic/governance/constraint-reviewer/SKILL.md`
**Lines**: 116-117

**Issue**: Division by zero when `files=0`.

**Verification**: The SKILL.md already documents the edge case handling:
```
- If `files = 0` (constraint references no files): return 1.0 (maximum drift)
- If `age_days = 0` (same-day creation): use 1 day minimum
```

**Resolution**: Verified specification is correct. Mock implements drift score correctly
for round-trip testing (using hash comparison, not the formula). No additional changes
needed.

**Status**: [x] Done (verified - spec is correct)

---

## Minor Findings

### Finding 4: Fallback Chain Only Uses First Fallback

**Source**: Codex Review
**File**: `tests/e2e/phase4-contracts.test.ts`
**Lines**: 325-373 (updated)

**Issue**: The `MockFallbackChecker.activateFallback()` always used first fallback only.

**Resolution**:
- Added `fallback_index` field to `FallbackChain` interface
- Added `activateNextFallback()` method for cascading through chain
- Added `resetToPrimary()` method for recovery
- Added `getChain()` method for inspection
- Added Scenario 13 with 3 tests validating cascade behavior

**Status**: [x] Done

---

### Finding 5: Model Pin expires_at Always Null

**Source**: Codex Review
**File**: `tests/e2e/phase4-contracts.test.ts`
**Lines**: 288-335 (updated)

**Issue**: Session pins had meaningless `null` expiry.

**Resolution**:
- Session pins now have explicit `expires_at` timestamp (24-hour default)
- Project/global pins remain `null` (don't expire)
- Added `simulateSessionEnd()` method for testing
- Updated `getPin()` to check expiry before returning
- Added Scenario 14 with 4 tests validating session pin expiry

**Status**: [x] Done

---

### Finding 6: Dormancy Mock Missing Time Component

**Source**: Gemini Review
**File**: `tests/e2e/phase4-contracts.test.ts`
**Lines**: 56-66, 206-224 (updated)

**Issue**: Mock calculated dormancy based on `violation_count === 0` only, missing the
60-day time window requirement.

**Resolution**:
- Added `last_violation_at` optional field to `ConstraintState` interface
- Updated dormancy check to require both `violation_count === 0` AND 60 days since
  last violation (or never had violations)
- Added Scenario 15 with 3 tests validating dormancy time component

**Status**: [x] Done

---

## Remediation Tracking

| # | Severity | Status | Source | Tests Added |
|---|----------|--------|--------|-------------|
| 1 | Critical | [x] Done | Codex | 3 (Scenario 16) |
| 2 | Critical | [x] Done | Codex | 4 (Scenario 12) |
| 3 | Important | [x] Done | Codex | 0 (verified spec) |
| 4 | Minor | [x] Done | Codex | 3 (Scenario 13) |
| 5 | Minor | [x] Done | Codex | 4 (Scenario 14) |
| 6 | Minor | [x] Done | Gemini | 3 (Scenario 15) |

**Total New Tests**: 17 (50 total tests now passing)

---

## Test Summary

**Before**: 33 tests across 11 scenarios
**After**: 50 tests across 16 scenarios

**New Scenarios Added**:
- Scenario 12: Lock TTL Expiry (4 tests)
- Scenario 13: Fallback Chain Cascade (3 tests)
- Scenario 14: Session Pin Expiry (4 tests)
- Scenario 15: Dormancy Time Component (3 tests)
- Scenario 16: Cache Valid Without Changes (3 tests)

---

## Reviewer Notes

**Codex**: "These are CONTRACT tests, not integration tests. The mocks encode implementation
details. Question: Are we testing the data contract or the mock implementation? Recommend
adding comment: 'These mocks verify data structure contracts. Actual cryptographic
verification and file I/O tested in integration tests (Phase 5+).'"

**Response**: Header comment updated to clarify mock purpose and document addressed findings.

**Gemini**: "The contract tests are thorough and provide a strong foundation for verifying
system behavior. Findings are primarily focused on potential refinements, edge cases, and
mock fidelity rather than significant flaws."

**Response**: All refinements implemented. Mock fidelity now matches specifications.

---

*Issue created 2026-02-14 from external code review (N=2).*
*Issue resolved 2026-02-14. All 6 findings addressed with 17 new tests.*
