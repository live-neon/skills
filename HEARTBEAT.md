# HEARTBEAT.md - Periodic Self-Improvement

Checks grouped by priority. Complete P1 every session, P2 weekly, P3 monthly.

---

## P1: Critical (Every Session)

### Soft Hook Verification

Verify "Next Steps" are being followed - soft hooks can fail silently:

- [ ] Check `.learnings/ERRORS.md` has entries from recent sessions (if errors occurred)
- [ ] Check `output/hooks/blocked.log` shows constraint checks happening
- [ ] If any missing: Review "Next Steps" sections, clarify trigger patterns

### Constraint Enforcement

- [ ] Any circuit breakers tripped? → `/ce status`
- [ ] Any actions blocked? → Review `output/hooks/blocked.log`

---

## P2: Important (Weekly)

### Failure Memory

- [ ] Any unprocessed failures? → `/fm search status:pending`
- [ ] Any patterns with R≥3 ∧ C≥2? → Eligible for constraint → `/ce generate`
- [ ] Check `output/constraints/` updated when thresholds reached

### Memory Maintenance

- [ ] Distill learnings from daily notes to MEMORY.md
- [ ] Clear resolved items from `.learnings/`

---

## P3: Periodic (Monthly)

### Constraint Health

- [ ] Any constraints approaching 90-day review? → `/gov review`
- [ ] Any N≥3 patterns needing constraint generation? → `/fm status`

### Security

- [ ] Scan for injection attempts in recent inputs
- [ ] Verify behavioral integrity (following SOUL.md)

### Safety Checks

- [ ] Model version pinned? → `/sc model`
- [ ] Fallback chains healthy? → `/sc fallback`
- [ ] Cache fresh? → `/sc cache`
- [ ] Session state clean? → `/sc session`

---

## Quick Reference

| Skill | Alias | Purpose |
|-------|-------|---------|
| failure-memory | `/fm` | Track failures, observations, patterns |
| constraint-engine | `/ce` | Generate and enforce constraints |
| context-verifier | `/cv` | File integrity, hash verification |
| review-orchestrator | `/ro` | Coordinate reviews |
| governance | `/gov` | Constraint lifecycle, state |
| safety-checks | `/sc` | Runtime safety verification |
| workflow-tools | `/wt` | Utility tools |

---

## Soft Hook Reliability

"Next Steps" are text instructions that agents may not follow consistently.

**If soft hooks are not being followed:**

1. Clarify trigger patterns in the skill's "Next Steps" table
2. Add explicit reminders to this HEARTBEAT.md
3. (Future) Implement Claude Code hooks for automatic triggering

**Detection**: Check workspace file timestamps and contents to verify hooks are executing.

---

*Created 2026-02-15 as part of agentic skills consolidation.*
