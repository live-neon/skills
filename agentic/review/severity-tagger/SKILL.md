---
name: severity-tagger
version: 1.0.0
description: Classify finding severity as critical/important/minor
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, review, classification]
---

# severity-tagger

Classify review findings by severity level to prioritize remediation. Uses
consistent criteria to ensure objective classification across all review types.

## Usage

```
/severity-tagger "<finding>"
/severity-tagger --batch <findings-file>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| finding | Yes* | Description of the finding to classify (*not required with --batch) |
| --batch | No | File containing multiple findings (one per line or JSON array) |
| --format | No | Output format: text, json (default: text) |
| --context | No | Additional context about the codebase/domain |

## Severity Levels

| Level | Criteria | Action | Examples |
|-------|----------|--------|----------|
| **CRITICAL** | Safety violation, data loss risk, security issue | Block, fix immediately | SQL injection, missing auth, destructive operations |
| **IMPORTANT** | Correctness issue, significant bug, workflow violation | Fix before merge | Race condition, missing error handling, skipped tests |
| **MINOR** | Style issue, optimization opportunity, documentation gap | Track, fix when convenient | Naming conventions, missing comments, minor refactoring |

## Output

### Single Finding

```
SEVERITY: IMPORTANT

Finding: "Function lacks error handling for database connection failures"

Rationale:
  - Correctness issue: errors silently ignored
  - Impact: could cause data inconsistency or silent failures
  - Not safety-critical: no data loss or security risk (not CRITICAL)
  - Not cosmetic: affects runtime behavior (not MINOR)

Classification factors:
  ✗ Safety/Security risk      → would be CRITICAL
  ✓ Correctness issue         → IMPORTANT
  ✗ Style/Documentation only  → would be MINOR

Recommendation: Fix before merge
Priority: 2 (after CRITICAL issues)
```

### Batch Output

```
/severity-tagger --batch review-findings.txt

SEVERITY SUMMARY:

  CRITICAL (2):
    1. "SQL query built from user input without sanitization"
    2. "Authentication bypass in admin endpoint"

  IMPORTANT (3):
    1. "Function lacks error handling for database failures"
    2. "Race condition in concurrent map access"
    3. "Missing input validation on API endpoint"

  MINOR (1):
    1. "Variable naming doesn't follow convention"

Total: 6 findings (2 critical, 3 important, 1 minor)
Recommendation: Block on CRITICAL, prioritize IMPORTANT
```

## Example

```
/severity-tagger "Missing CSRF token validation on form submission"

SEVERITY: CRITICAL

Finding: "Missing CSRF token validation on form submission"

Rationale:
  - Security vulnerability (OWASP Top 10: Cross-Site Request Forgery)
  - Could allow attackers to perform actions on behalf of authenticated users
  - Immediate fix required before deployment

Classification factors:
  ✓ Safety/Security risk      → CRITICAL
  ✗ Correctness issue only    → would be IMPORTANT
  ✗ Style/Documentation only  → would be MINOR

Recommendation: Block deployment, fix immediately
Priority: 1 (highest)
```

## Integration

- **Layer**: Foundation
- **Depends on**: None (foundational skill)
- **Used by**: twin-review, cognitive-review, code-review, constraint-generator

## Classification Heuristics

### CRITICAL Indicators
- Security keywords: injection, XSS, CSRF, auth bypass, credential, token leak
- Safety keywords: data loss, corruption, destructive, irreversible
- Scope: affects all users, production data, system integrity

### IMPORTANT Indicators
- Bug keywords: race condition, null pointer, unhandled, timeout, deadlock
- Workflow keywords: skipped test, missing validation, unchecked error
- Scope: affects functionality, correctness, reliability

### MINOR Indicators
- Style keywords: naming, formatting, convention, comment, documentation
- Optimization keywords: could be faster, minor inefficiency, cleanup
- Scope: affects readability, maintainability, not runtime behavior

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Empty finding | Error: "Finding description cannot be empty" |
| Batch file not found | Error: "Batch file not found: path" |
| Ambiguous finding | Returns classification with lower confidence note |
| Insufficient context | Defaults to IMPORTANT with note to verify |

## Acceptance Criteria

- [ ] Correctly classifies security issues as CRITICAL
- [ ] Correctly classifies bugs/correctness issues as IMPORTANT
- [ ] Correctly classifies style/documentation issues as MINOR
- [ ] Provides clear rationale for classification
- [ ] Batch mode processes multiple findings
- [ ] JSON output format valid
- [ ] Handles ambiguous findings with appropriate caveats

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to layer table if new skill
2. **Update upstream skills** - Add this skill to their "Used by" lists
3. **Update downstream skills** - Verify "Depends on" lists are current
4. **Run verification** - `cd tests && npm test`
5. **Check closing loops** - See `docs/workflows/phase-completion.md`

**If part of a phase implementation**:
- Mark stage complete in implementation plan
- Proceed to next stage OR run phase-completion workflow
- Update `docs/implementation/agentic-phase4-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
