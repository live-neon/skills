---
created: 2026-02-15
type: reference
status: partial
phase5b: ../plans/2026-02-15-agentic-skills-phase5b-implementation.md
---

# ClawHub Format Compatibility

Comparison of Live Neon Skills workspace formats against ClawHub skill specifications.

## Summary

| Skill | Version | Status | Notes |
|-------|---------|--------|-------|
| self-improving-agent | 1.0.2 | ⚠️ Partial | ID scheme matches; field differences |
| proactive-agent | 3.1.0 | ⏳ Pending | Rate limited during inspection |

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

**Slug**: `proactive-agent`
**Version**: 3.1.0
**Owner**: halthelobster

**Status**: ⏳ Rate limited - need to retry inspection

**Expected workspace files** (from description):
- WAL Protocol files
- Working Buffer
- HEARTBEAT pattern

### Pending Verification

```bash
# Retry when rate limit clears
clawhub install proactive-agent --workdir . --dir clawhub-skills --force
```

---

## Installed ClawHub Skills

Location: `clawhub-skills/`

| Skill | Version | Installed |
|-------|---------|-----------|
| self-improving-agent-1-0-2 | 1.0.0 | ✅ Yes |
| proactive-agent | 3.1.0 | ⏳ Pending |

---

## Action Items

- [ ] Retry proactive-agent installation when rate limit clears
- [ ] Review proactive-agent SKILL.md for WAL/HEARTBEAT format
- [ ] Decide on format alignment (keep ours vs adopt spec fully)
- [ ] Update VERSION.md with verification status
- [ ] Add compatibility notes to workspace files

---

*Verification started 2026-02-15 as part of Phase 5B.*
