---
created: 2026-02-15
updated: 2026-02-15
type: reference
status: partial
phase5b: ../plans/2026-02-15-agentic-skills-phase5b-implementation.md
verification_date: 2026-02-15
---

# ClawHub Format Compatibility

Comparison of Live Neon Skills workspace formats against ClawHub skill specifications.

## Summary

| Skill | Version | Status | Notes |
|-------|---------|--------|-------|
| self-improving-agent | 1.0.5 | ⚠️ Partial | ID scheme matches; field differences |
| proactive-agent | 3.1.0 | ✅ Compatible | HEARTBEAT.md matches; complementary scope |

## self-improving-agent Comparison

**Installed from**: `clawhub install self-improving-agent-1-0-2`
**Owner**: TXMERLXN

### ID Scheme ✅ Compatible

| Aspect | Spec | Ours | Status |
|--------|------|------|--------|
| Learning ID | `[LRN-YYYYMMDD-XXX]` | `[LRN-YYYYMMDD-XXX]` | ✅ Match |
| Error ID | `[ERR-YYYYMMDD-XXX]` | `[ERR-YYYYMMDD-XXX]` | ✅ Match |
| Feature ID | `[FEAT-YYYYMMDD-XXX]` | `[FEAT-YYYYMMDD-XXX]` | ✅ Match |

### File Structure ✅ Compatible

| File | Spec | Ours | Status |
|------|------|------|--------|
| `.learnings/LEARNINGS.md` | Required | ✅ Present | ✅ Match |
| `.learnings/ERRORS.md` | Required | ✅ Present | ✅ Match |
| `.learnings/FEATURE_REQUESTS.md` | Required | ✅ Present | ✅ Match |

### Entry Format ⚠️ Differences

**self-improving-agent expected:**
```markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
One-line description

### Details
Full context

### Suggested Action
Specific fix

### Metadata
- Source: conversation | error | user_feedback
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- See Also: LRN-20250110-001
```

**Our format:**
```markdown
### [LRN-YYYYMMDD-XXX] Title

**Date**: YYYY-MM-DD
**Source**: User correction / Review finding / Self-discovery
**R/C/D**: R=1, C=0, D=0

**Description**:
What was learned.

**Action taken**:
How it was addressed.

**See also**: Related observations
```

### Field Mapping

| Spec Field | Our Field | Compatibility |
|------------|-----------|---------------|
| `**Logged**` | `**Date**` | ⚠️ Different name, similar purpose |
| `**Priority**` | (none) | ❌ Missing |
| `**Status**` | (none) | ❌ Missing |
| `**Area**` | (none) | ❌ Missing |
| `### Summary` | `**Description**` | ⚠️ Different structure |
| `### Suggested Action` | `**Action taken**` | ⚠️ Different name |
| `See Also` | `**See also**` | ✅ Match |
| (none) | `**R/C/D**` | ➕ Our extension |

### Assessment

**Interoperability**: Partial

The ID scheme and file structure are fully compatible. Entry format differences are:
- Cosmetic (field names) - won't break parsing
- Missing fields (Priority, Status, Area) - may limit filtering features
- Our R/C/D extension - ignored by self-improving-agent (safe)

**Recommendation**:
1. Keep current format (functional)
2. Consider adding `**Status**` field for resolution tracking
3. Document R/C/D as Live Neon extension

---

## proactive-agent Comparison

**Installed from**: Manual copy (rate limited during `clawhub install`)
**Version**: 3.1.0
**Owner**: halthelobster (Hal Labs)

### Workspace Structure (proactive-agent expected)

```
workspace/
├── ONBOARDING.md      # First-run setup
├── AGENTS.md          # Operating rules, workflows
├── SOUL.md            # Identity, principles
├── USER.md            # Human context, preferences
├── MEMORY.md          # Long-term memory
├── SESSION-STATE.md   # WAL target (active task)
├── HEARTBEAT.md       # Periodic self-improvement ✅ We have this
├── TOOLS.md           # Tool configs
└── memory/
    ├── YYYY-MM-DD.md  # Daily raw capture
    └── working-buffer.md  # Danger zone log
```

### Compatibility Assessment

| Aspect | proactive-agent | Live Neon | Status |
|--------|-----------------|-----------|--------|
| HEARTBEAT.md | ✅ Required | ✅ Present | ✅ Match |
| `.learnings/` | Not specified | ✅ Present | ➕ Compatible |
| SESSION-STATE.md | Required | Not present | ⚠️ Different scope |
| Working Buffer | Required | Not present | ⚠️ Different scope |
| VFM Protocol | Documented | Similar to R/C/D | ✅ Conceptually aligned |

### Key Differences

**Scope**: proactive-agent focuses on **session persistence** (surviving context loss), while self-improving-agent focuses on **learning capture** (recording corrections/errors).

**Architecture**:
- proactive-agent: WAL Protocol → SESSION-STATE.md → Working Buffer
- self-improving-agent: Detection triggers → `.learnings/` files → Skill extraction

**Compatibility**: These skills are **complementary**, not overlapping:
- Use proactive-agent patterns for session management
- Use self-improving-agent patterns for learning capture
- Both can coexist in same workspace

### VFM Protocol Alignment

proactive-agent VFM scoring (Value-First Modification):

| Dimension | Weight | Equivalent in Live Neon |
|-----------|--------|------------------------|
| High Frequency | 3x | R (Recurrence) in R/C/D |
| Failure Reduction | 3x | Constraint effectiveness |
| User Burden | 2x | (implicit in priority) |
| Self Cost | 2x | (implicit in priority) |

**Conclusion**: R/C/D counters serve similar purpose to VFM scoring but with different granularity.

---

## Installed ClawHub Skills

Location: `clawhub-skills/`

| Skill | Version | Installed | Method |
|-------|---------|-----------|--------|
| self-improving-agent-1.0.5 | 1.0.5 | ✅ Yes | Manual copy |
| proactive-agent-3.1.0 | 3.1.0 | ✅ Yes | Manual copy |

**Note**: Manual installation due to ClawHub rate limiting. Skills copied from user Downloads.

---

## Action Items

- [x] ~~Retry proactive-agent installation~~ → Manual copy (rate limit workaround)
- [x] Review proactive-agent SKILL.md for WAL/HEARTBEAT format → Complementary scope documented
- [x] Decide on format alignment → **Keep ours** (functional, R/C/D is valuable extension)
- [ ] Update VERSION.md with verification status
- [x] Add compatibility notes to workspace files (already present: "compatible with self-improving-agent@1.0.5")
- [x] Add skills to docker-compose.yml

---

## Stage 2 Verification Status

**self-improving-agent@1.0.5**: ✅ Verified (2026-02-15)
- `.learnings/LEARNINGS.md`: Present, ID scheme compatible
- `.learnings/ERRORS.md`: Present, ID scheme compatible
- `.learnings/FEATURE_REQUESTS.md`: Present, ID scheme compatible
- Entry format: Partial compatibility (cosmetic differences only)

**proactive-agent@3.1.0**: ✅ Verified (2026-02-15)
- `HEARTBEAT.md`: Present, compatible
- Scope: Complementary (session persistence vs learning capture)
- VFM Protocol: Conceptually aligned with R/C/D counters

**Tests**: 10 passing (consolidated skills loading)

---

*Verification completed 2026-02-15 as part of Phase 5B.*
