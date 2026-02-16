# constraint-generator Examples

Detailed output examples for all constraint-generator commands.

## Scan Observations

```
/constraint-generator scan --eligible-only

ELIGIBLE OBSERVATIONS (3):

  1. git-force-push-without-confirmation
     R: 5, C: 3, Sources: 3, Unique Users: 2
     Status: ELIGIBLE - ready for constraint generation
     Last updated: 2026-02-13

  2. tests-skipped-before-commit
     R: 4, C: 2, Sources: 2, Unique Users: 2
     Status: ELIGIBLE - ready for constraint generation
     Last updated: 2026-02-12

  3. plan-implemented-without-approval
     R: 3, C: 2, Sources: 2, Unique Users: 2
     Status: ELIGIBLE - ready for constraint generation
     Last updated: 2026-02-11

NOT ELIGIBLE (5):
  - missing-error-handling (R=2, needs R≥3)
  - inconsistent-naming (type=pattern, patterns ineligible)
  - api-key-in-code (C=1, needs C≥2)
  - slow-query-detected (c_unique_users=1, needs ≥2)
  - race-condition-bug (sources=1, needs sources≥2)

Run '/constraint-generator generate <slug>' to create constraint.
```

## Preview Constraint

```
/constraint-generator preview git-force-push-without-confirmation

CONSTRAINT PREVIEW: git-force-push-without-confirmation
────────────────────────────────────────────────────────

Source Observation:
  docs/observations/failures/git-force-push-without-confirmation.md
  R: 5, C: 3, D: 0, Sources: 3

Proposed Constraint:
────────────────────

---
id: git-safety-force-push
severity: CRITICAL
status: draft
scope: "Actions that force-push to remote repositories or overwrite remote history"
intent: destructive
created: 2026-02-13
source_observation: docs/observations/failures/git-force-push-without-confirmation.md
r_count: 5
c_count: 3
auto_generated: true
---

# Git Safety: Force Push

Always request explicit user confirmation before executing force push operations.

## Semantic Scope

Actions matching this constraint include:
- Force pushing to any remote branch (git push --force, git push -f)
- Overwriting remote history with local changes
- Using --force-with-lease without understanding implications
- Any operation that could lose commits on remote

## Required Actions

1. Present consequences to user (commits will be overwritten)
2. List affected commits that will be lost on remote
3. Request explicit "yes" confirmation with reason
4. Log the decision and reason to audit trail

────────────────────────────────────────────────────────

Severity Classification (via severity-tagger):
  ✓ Safety/Security risk: destroys git history → CRITICAL

Positive Framing (via positive-framer):
  NEGATIVE: "Don't execute force push without confirmation"
  POSITIVE: "Always request explicit user confirmation before executing force push"

Ready to generate? Run:
  /constraint-generator generate git-force-push-without-confirmation
```

## Generate Constraint

```
/constraint-generator generate git-force-push-without-confirmation

CONSTRAINT GENERATED: git-safety-force-push
────────────────────────────────────────────

Created: docs/constraints/draft/git-safety-force-push.md

Constraint Details:
  ID: git-safety-force-push
  Severity: CRITICAL (assigned by severity-tagger)
  Status: draft
  Source: docs/observations/failures/git-force-push-without-confirmation.md

Processing Applied:
  ✓ severity-tagger: Classified as CRITICAL (safety risk)
  ✓ positive-framer: Transformed to positive guidance
  ✓ Semantic scope: Generated from failure evidence

Next Steps:
  1. Review the draft constraint for accuracy
  2. Adjust scope or wording if needed
  3. Use '/constraint-lifecycle activate git-safety-force-push' to enforce

Observation Updated:
  - Added: constraint_generated: docs/constraints/draft/git-safety-force-push.md
```

## Status

```
/constraint-generator status

CONSTRAINT GENERATOR STATUS
───────────────────────────

Observations Scanned: 15
  - Failures: 10
  - Patterns: 5 (excluded from eligibility)

Eligibility Summary:
  - Eligible: 3
  - Not yet eligible: 7

Generated Constraints:
  - Total: 8
  - Draft: 2
  - Active: 5
  - Retired: 1

Recent Activity:
  - 2026-02-13: Generated git-safety-force-push (CRITICAL)
  - 2026-02-12: Generated test-before-commit (IMPORTANT)
  - 2026-02-10: Generated plan-approval-required (IMPORTANT)
```
