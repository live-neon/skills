---
created: 2026-02-15
updated: 2026-02-15
type: plan
status: ready
priority: low
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-14-agentic-skills-phase5-implementation.md
depends_on:
  - ../plans/2026-02-15-agentic-skills-consolidation.md (complete)
related_guides:
  - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md"
external_dependencies:
  - https://docs.openclaw.ai/tools/clawhub
  - https://github.com/openclaw/clawhub
---

# Phase 5B: ClawHub Workspace Compatibility Verification

## Summary

Verify that Live Neon Skills workspace files are compatible with ClawHub ecosystem skills.
This ensures the constraint/observation system can interoperate with ClawHub's
`self-improving-agent`, `proactive-agent`, and VFM system through shared file formats.

**Duration**: 0.5-1 day
**Prerequisites**: Consolidation complete, ClawHub CLI available
**Output**: Verification report, any format fixes, compatibility documentation

> **Note**: This plan was reframed after consolidation. The original approach used runtime
> adapters; the new approach uses file-based interoperability through shared workspace formats.
> See `docs/implementation/agentic-consolidation-results.md` for consolidation details.

## Context: Post-Consolidation Architecture

The consolidation (2026-02-15) changed the ClawHub integration approach:

| Before | After |
|--------|-------|
| 5 bridge skills with mock adapters | Documentation + workspace files |
| Runtime API integration planned | File-based interoperability |
| `agentic/bridge/adapters/*.ts` | Archived to `_archive/2026-02-consolidation/` |

**Current integration model**:
```
Live Neon Skills ←→ Workspace Files ←→ ClawHub Skills
     ↓                    ↓                    ↓
 /fm record    →   .learnings/LEARNINGS.md  ← self-improving-agent
 /ce generate  →   output/constraints/      ← proactive-agent
 HEARTBEAT.md  →   Periodic checks          ← VFM scoring
```

## Why This Matters

ClawHub skills expect specific file formats. If our workspace files don't match,
ClawHub skills won't be able to read our observations/constraints, breaking interoperability.

**Current state**: Workspace files created with assumed format
**Target state**: Verified compatibility with ClawHub skill specifications

---

## Prerequisites

Before starting verification:

1. **Consolidation complete**: ✅ `2026-02-15-agentic-skills-consolidation.md` executed
2. **ClawHub CLI available**: `openclaw` command installed
3. **Skill specs accessible**: self-improving-agent, proactive-agent documentation

### Verification

```bash
# Verify ClawHub CLI is available
clawhub --cli-version

# Verify authentication
clawhub whoami

# Search for target skills
clawhub search self-improving-agent
clawhub search proactive-agent

# Inspect skill metadata
clawhub inspect self-improving-agent
clawhub inspect proactive-agent
```

---

## Stage 1: Format Specification Review

**Duration**: 2 hours
**Goal**: Document exact format requirements from ClawHub skill specs

### Tasks

1. **Review self-improving-agent@1.0.5 spec**
   - Document `.learnings/LEARNINGS.md` expected format
   - Document `.learnings/ERRORS.md` expected format
   - Document `[LRN-YYYYMMDD-XXX]` ID scheme requirements
   - Note any required frontmatter fields

2. **Review proactive-agent@3.1.0 spec**
   - Document `output/constraints/` directory structure
   - Document constraint file format (YAML? JSON? Markdown?)
   - Document WAL protocol requirements (if applicable)
   - Note HEARTBEAT.md expectations

3. **Review VFM scoring spec**
   - Document `output/constraints/metadata.json` format
   - Document VFM weight fields and ranges

4. **Create compatibility matrix**
   - Map our formats to ClawHub expected formats
   - Identify any gaps or mismatches

### Acceptance Criteria

- [ ] self-improving-agent format documented
- [ ] proactive-agent format documented
- [ ] VFM format documented
- [ ] Compatibility matrix created

### Files Created

- `docs/references/clawhub-format-compatibility.md` (new)

---

## Stage 2: Workspace File Verification

**Duration**: 2 hours
**Goal**: Verify our workspace files match ClawHub expectations

### Tasks

1. **Verify .learnings/ format**
   ```bash
   # Check LEARNINGS.md structure
   head -30 .learnings/LEARNINGS.md

   # Verify ID format matches [LRN-YYYYMMDD-XXX]
   grep -E '\[LRN-[0-9]{8}-[0-9]{3}\]' .learnings/LEARNINGS.md

   # Check ERRORS.md structure
   head -30 .learnings/ERRORS.md
   ```

2. **Verify output/ format**
   ```bash
   # Check VERSION.md declares compatibility
   cat output/VERSION.md

   # Check constraints directory structure
   ls -la output/constraints/
   ```

3. **Run ClawHub inspection**
   ```bash
   # Inspect self-improving-agent format expectations
   clawhub inspect self-improving-agent

   # Inspect proactive-agent format expectations
   clawhub inspect proactive-agent

   # Install skills locally for detailed review
   clawhub install self-improving-agent
   clawhub install proactive-agent
   ```

4. **Document any mismatches**
   - Create issue for each format mismatch
   - Prioritize by impact on interoperability

### Acceptance Criteria

- [ ] .learnings/ format verified
- [ ] output/ format verified
- [ ] ClawHub validation passes (or issues documented)
- [ ] Mismatches documented with fixes

### Files Modified (if fixes needed)

- `.learnings/LEARNINGS.md`
- `.learnings/ERRORS.md`
- `output/VERSION.md`

---

## Stage 3: Integration Test with ClawHub CLI

**Duration**: 2 hours
**Goal**: Test actual interoperability with ClawHub skills

### Tasks

1. **Review installed skill SKILL.md files**
   ```bash
   # Check self-improving-agent format requirements
   cat skills/self-improving-agent/SKILL.md

   # Check proactive-agent format requirements
   cat skills/proactive-agent/SKILL.md
   ```

2. **Compare our workspace files against specs**
   ```bash
   # Verify .learnings/ matches expected format
   diff -u <(grep -A20 "## Format" skills/self-improving-agent/SKILL.md) \
           <(head -30 .learnings/LEARNINGS.md)

   # Verify output/ matches expected structure
   ls -la output/constraints/
   ```

3. **Test round-trip**
   - Create observation via `/fm record`
   - Export to ClawHub format
   - Import back and verify data integrity

### Acceptance Criteria

- [ ] self-improving-agent can read .learnings/
- [ ] proactive-agent can read output/constraints/
- [ ] Round-trip data integrity verified

### Files Created

- `tests/integration/clawhub-compatibility.test.ts` (new)

---

## Stage 4: Documentation and Cleanup

**Duration**: 1 hour
**Goal**: Document results and update references

### Tasks

1. **Create verification report**
   - Summary of compatibility status
   - Any fixes applied
   - Remaining limitations

2. **Update VERSION.md**
   - Confirm format versions are accurate
   - Add verification date

3. **Update ARCHITECTURE.md**
   - Update ClawHub integration section
   - Remove any "unverified" caveats

4. **Update results file**
   - Mark ClawHub compatibility as verified
   - Document any deferred items

### Acceptance Criteria

- [ ] Verification report created
- [ ] VERSION.md updated with verification date
- [ ] ARCHITECTURE.md updated
- [ ] Results file updated

### Files Created/Modified

- `docs/implementation/agentic-phase5b-results.md` (new)
- `output/VERSION.md` (modify)
- `docs/architecture/README.md` (modify)
- `docs/implementation/agentic-consolidation-results.md` (modify)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ClawHub CLI not available locally | Medium | High | Document manual verification steps |
| Format specs differ from assumed | Medium | Medium | Stage 1 discovers early; fix in Stage 2 |
| ClawHub skills not published yet | Medium | Low | Verify against spec, defer runtime test |
| ID scheme mismatch | Low | Medium | Regex validation, format migration |

---

## Timeline

| Stage | Duration | Cumulative | Description |
|-------|----------|------------|-------------|
| Stage 1 | 2 hours | 2 hours | Format specification review |
| Stage 2 | 2 hours | 4 hours | Workspace file verification |
| Stage 3 | 2 hours | 6 hours | Integration test with ClawHub CLI |
| Stage 4 | 1 hour | 7 hours | Documentation and cleanup |

**Total**: 0.5-1 day (depending on ClawHub CLI availability)

---

## Success Criteria

- [ ] ClawHub format specifications documented
- [ ] Workspace files verified compatible (or fixed)
- [ ] Integration test passes (or documented as blocked)
- [ ] VERSION.md updated with verification status
- [ ] Results file created

---

## Fallback: Manual Verification

If ClawHub CLI is not available:

1. **Spec-based verification**
   - Compare our formats against published ClawHub documentation
   - Use regex validation for ID schemes
   - Manual structure comparison

2. **Deferred runtime verification**
   - Document as "format-verified, runtime-pending"
   - Create follow-up task for when CLI available

3. **Community validation**
   - Share formats on ClawHub discussions
   - Request feedback from skill maintainers

---

## Out of Scope

The following are explicitly NOT part of Phase 5B:

- **Runtime adapter implementation** - Superseded by file-based approach
- **Publishing skills to ClawHub** - Separate plan
- **New Bridge skills** - Archived; file-based integration instead
- **Multi-agent coordination** - Deferred to future research
- **VFM weight tuning** - Requires N≥10 usage data

---

## Cross-References

- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Consolidation Results**: `../implementation/agentic-consolidation-results.md`
- **Architecture**: `../../docs/architecture/README.md` (智:clawhub section)
- **Archived Adapters**: `../../agentic/_archive/2026-02-consolidation/bridge/`
- **Workspace Format**: `../../output/VERSION.md`

---

## History

| Date | Change |
|------|--------|
| 2026-02-15 | Created as runtime adapter implementation plan |
| 2026-02-15 | Reframed to workspace compatibility verification (post-consolidation) |

---

*Plan reframed 2026-02-15 after consolidation. File-based interoperability replaces runtime adapters.*
