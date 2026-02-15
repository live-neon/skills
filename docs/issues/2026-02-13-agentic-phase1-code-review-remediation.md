---
created: 2026-02-13
resolved: 2026-02-13
type: issue
status: resolved
priority: high
source: code-review
reviews:
  - ../reviews/2026-02-13-agentic-phase1-implementation-codex.md
  - ../reviews/2026-02-13-agentic-phase1-implementation-gemini.md
affects:
  - projects/live-neon/skills/agentic/core/context-packet/SKILL.md
  - projects/live-neon/skills/agentic/core/file-verifier/SKILL.md
  - projects/live-neon/skills/agentic/core/constraint-enforcer/SKILL.md
  - projects/live-neon/skills/agentic/detection/positive-framer/SKILL.md
  - projects/live-neon/skills/ARCHITECTURE.md
  - projects/live-neon/skills/tests/e2e/skill-loading.test.ts
plan: ../plans/2026-02-13-agentic-skills-phase1-implementation.md
results: projects/live-neon/skills/docs/implementation/agentic-phase1-results.md
---

# Phase 1 Code Review Remediation

## Summary

External code review (N=2: Codex + Gemini) of the Phase 1 agentic skills implementation
identified security and architectural concerns requiring remediation before Phase 2.

**Review Date**: 2026-02-13
**Reviewers**: codex-gpt51-examiner (gpt-5.1-codex-max), gemini-25pro-validator (gemini-2.5-pro)

---

## Findings Summary

| # | Finding | Severity | Codex | Gemini | Status |
|---|---------|----------|-------|--------|--------|
| 1 | MD5 algorithm default/support | Critical | Critical | Minor | N=2 |
| 2 | constraint-enforcer safety gaps | Critical | Important | Critical | N=2 |
| 3 | file-verifier hash auto-detection | Important | Critical | Important | N=2 |
| 4 | Test suite validates structure only | Important | Important | Noted | N=2 |
| 5 | No packet signing for audit claims | Important | Important | - | N=1 |
| 6 | Circuit breaker behavior undefined | Important | - | Important | N=2* |
| 7 | positive-framer lacks backup/preview | Minor | Minor | - | N=2* |
| 8 | context-packet missing output failure | Minor | - | Minor | N=2* |

*Verified manually to confirm N=2

---

## Critical Findings

### 1. MD5 Algorithm Default/Support (N=2)

**Location**: `context-packet/SKILL.md:27`, `file-verifier/SKILL.md:28-31`

**Issue**: MD5 is promoted as default algorithm ("both" = md5 + sha256). MD5 is
collision-prone and unsuitable for audit-grade integrity verification. Auto-detection
by string length (32=MD5) enables trivial bypass.

**Resolution**:
- [x] Default to SHA-256 only in context-packet
- [x] Add deprecation warning for MD5 option
- [x] Flag MD5 inputs in file-verifier with security warning

### 2. constraint-enforcer Safety Gaps (N=2)

**Location**: `constraint-enforcer/SKILL.md`

**Issues**:
1. **Pattern evasion** (Gemini): String/glob matching is easily bypassed through
   aliases (`git push --force` vs `git push -f`), concatenation, or alternative commands
2. **Fails open** (Codex): Missing constraints directory silently disables enforcement

**Resolution**:
- [x] Document pattern matching limitations explicitly
- [x] Change to fail-closed behavior (require `--allow-missing-constraints` flag)
- [x] Implement semantic action classification (following NEON-SOUL pattern)

**Guide**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

The guide documents the semantic approach:
- LLM semantic similarity for action/constraint matching
- Intent classification (destructive/modifying/read-only/external)
- Confidence scoring (0.0-1.0) with graduated response
- Semantic scope definitions instead of pattern lists

**Implemented in constraint-enforcer**:
- Replaced pattern matching with LLM-based semantic similarity
- Added intent classification (destructive/modifying/read-only/external)
- Added confidence scoring (0.0-1.0) for each match
- Updated constraint file format to use `scope` and `intent` fields

---

## Important Findings

### 3. file-verifier Hash Auto-Detection (N=2)

**Location**: `file-verifier/SKILL.md:109-112`

**Issue**: Auto-detecting algorithm by string length prevents future algorithms and
assumes bare hash input.

**Resolution**:
- [x] Document limitation
- [ ] Consider `algorithm:hash` format for Phase 2

### 4. Test Suite Validates Structure Only (N=2)

**Location**: `skill-loading.test.ts`

**Issue**: Tests only assert SKILL.md metadata and section presence. No behavioral
tests for hash generation, constraint matching, or transformations.

**Resolution**:
- [x] Add behavioral test stubs (`tests/e2e/skill-behavior.test.ts`)
- [x] Document test coverage gap in results file

**Note**: Behavioral test stubs created as part of twin review remediation (Finding #1).
Tests are stubs (todo) pending Phase 2 LLM integration for actual behavioral testing.

### 5. No Packet Signing for Audit Claims (N=1)

**Location**: `context-packet/SKILL.md:12-13`, `file-verifier/SKILL.md:10-13`

**Issue**: Claims "cryptographic verification" but packets are unsigned JSON.
Malicious actor can rewrite packet and file hashes together.

**Resolution**:
- [x] Add security note about signing requirements
- [x] Document threat model assumptions
- [ ] Consider signing as Phase 3 governance skill

### 6. Circuit Breaker Behavior Undefined (N=2)

**Location**: `ARCHITECTURE.md:126-127`

**Issue**: Document states "5 violations in 30 days → OPEN state" but never defines
what OPEN state means. Missing: stop agent? notify human? safe mode? recovery?

**Resolution**:
- [x] Add "Circuit Breaker States" section to ARCHITECTURE.md
- [x] Define OPEN/CLOSED/HALF-OPEN states
- [x] Document recovery procedures

---

## Minor Findings

### 7. positive-framer Lacks Backup/Preview (N=2)

**Location**: `positive-framer/SKILL.md:29`

**Issue**: `--constraint <file>` transforms in place with no backup or preview.

**Resolution**:
- [x] Add `--dry-run` option to documentation
- [x] Document backup workflow recommendation

### 8. context-packet Missing Output Failure Mode (N=2)

**Location**: `context-packet/SKILL.md:86-94`

**Issue**: Failure modes cover reading files but not writing output (permission denied
on `--output` path).

**Resolution**:
- [x] Add failure mode: `Output path not writable -> Error message`

---

## Alternative Framing (Both Reviewers)

Both reviewers raised architectural questions worth considering for future phases:

1. **Pattern vs Semantic Matching**: Pattern-based constraints are insufficient.
   **RESOLVED** - See `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`:
   - LLM-based semantic similarity (not string matching)
   - Intent classification (destructive/modifying/read-only/external)
   - Confidence scoring (0.0-1.0)
   - Constraint-enforcer updated to use semantic matching

2. **Reactive-Only Learning**: System learns from failures but doesn't reinforce
   successes. Consider positive feedback loops (NEON-SOUL's N-count promotion is
   a model: N≥3 → axiom promotion).

3. **Meta-Level Monitoring**: What if the constraint system itself has bugs? Consider
   monitoring the monitors.

4. **Documentation-Only Skills**: These are AI instructions, not executable code. How
   do we verify correct AI execution? The test suite validates documentation exists,
   not that execution is correct.

---

## Remediation Plan

### Phase 1 Immediate (Before Phase 2) - COMPLETE

1. ✅ Update context-packet: SHA-256 default, MD5 warning
2. ✅ Update constraint-enforcer: fail-closed, semantic classification implemented
3. ✅ Update ARCHITECTURE.md: circuit breaker states
4. ✅ Add missing failure modes to context-packet
5. ✅ Add behavioral test stubs (`tests/e2e/skill-behavior.test.ts`)
6. ✅ Document threat model in ARCHITECTURE.md

### Phase 2 Concurrent

1. Consider `algorithm:hash` format for file-verifier
2. Implement behavioral tests (stubs exist, pending LLM integration)

### Future Phases

1. Packet signing (Phase 3 governance)
2. Positive feedback loops

---

## Cross-References

- **Plan**: `../plans/2026-02-13-agentic-skills-phase1-implementation.md`
- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Results**: `projects/live-neon/skills/docs/implementation/agentic-phase1-results.md`
- **Codex Review**: `../reviews/2026-02-13-agentic-phase1-implementation-codex.md`
- **Gemini Review**: `../reviews/2026-02-13-agentic-phase1-implementation-gemini.md`
- **Semantic Similarity Guide**: `projects/live-neon/skills/docs/guides/SEMANTIC_SIMILARITY_GUIDE.md`

---

*Issue created 2026-02-13 from N=2 code review findings.*
