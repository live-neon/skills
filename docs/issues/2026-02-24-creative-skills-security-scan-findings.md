---
created: 2026-02-24
resolved: 2026-02-24
type: issue
status: resolved
severity: medium
skills:
  - creative/ted-talk
  - creative/side-quests
  - creative/insight-song
  - creative/song-remix
  - creative/visual-concept
source: ClawHub Security Scan
classification: Suspicious (medium confidence)
---

# Issue: Creative Skills Security Scan Findings

## Summary

ClawHub security scanner flagged `ted-talk` and `side-quests` as **Suspicious** (medium confidence).
The same pattern applies to all 5 creative skills. Root cause: skills declare workspace output paths
but instruction-only skills should return results directly to the invoking agent.

## Affected Skills

| Skill | Scanner Result | Issues |
|-------|---------------|--------|
| ted-talk | Suspicious | Capability/requirements mismatch |
| side-quests | Suspicious | Path mismatch + capability/requirements mismatch |
| insight-song | Not yet scanned | Same pattern (preemptive fix) |
| song-remix | Not yet scanned | Same pattern (preemptive fix) |
| visual-concept | Not yet scanned | Same pattern (preemptive fix) |

## Scanner Findings

### ted-talk

> The skill claims to be a standalone creative tool that writes results to output/ted-talks/,
> which is fine for its purpose. However the runtime instructions repeatedly instruct the agent
> to 'collect concrete examples (files, metrics, decisions)' and to include actual filenames and
> metrics in the talk. The registry metadata only declares a workspace output path (write), not
> read access to project files or other workspace locations.

### side-quests

> The declared workspace requirement (metadata: output/side-quests/) does not match a required
> save path described in the instructions (Step 0 asks to save to docs/plans/YYYY-MM-DD-topic-name.md).
> This mismatch is incoherent and could cause the agent to write outside the declared output area.

## Root Cause

1. **Workspace declarations unnecessary**: Instruction-only skills should return results directly
   to the invoking agent, not write files. The agent decides what to do with the response.

2. **Path mismatch in side-quests**: Step 0 references `docs/plans/` which is project-specific
   (from multiverse workflow), not portable.

3. **Ambiguous data sources**: Skills say "read conversation context" and "collect concrete examples"
   but don't clarify that data comes from user-supplied input or conversation context only.

## Fix Applied

### 1. Remove workspace declarations from all 5 skills

```yaml
# REMOVED from all skills:
metadata:
  openclaw:
    requires:
      workspace:
        - output/*/
```

### 2. Remove "Workspace Files" sections from all 5 skills

Skills no longer write to files - they return results to the invoking agent.

### 3. Remove Step 0 from side-quests

The `docs/plans/` reference was project-specific and not portable.

### 4. Clarify input behavior

| Skill | Input Behavior |
|-------|---------------|
| insight-song | User-supplied context OR conversation context (default) |
| visual-concept | User-supplied context OR conversation context (default) |
| ted-talk | User-supplied context OR conversation context (default) |
| side-quests | User-supplied context OR conversation context (default) |
| song-remix | **Always requires user input** (existing lyrics to transform) |

### 5. Update output behavior

All skills now return results directly. The invoking agent can:
- Display the result
- Save to a file of their choosing
- Pass to another skill

### 6. Clarify data sources in Security Considerations

Added to all skills:
> This skill synthesizes content from user-supplied input or the current conversation context.
> It does NOT read files from the workspace or access project artifacts directly.

## Files Modified

- `creative/insight-song/SKILL.md`
- `creative/song-remix/SKILL.md`
- `creative/visual-concept/SKILL.md`
- `creative/ted-talk/SKILL.md`
- `creative/side-quests/SKILL.md`
- `creative/README.md` (removed Output Locations table)

## Resolution Checklist

- [x] Remove workspace declarations from all 5 skills
- [x] Remove "Workspace Files" sections from all 5 skills
- [x] Remove Step 0 from side-quests
- [x] Clarify input behavior (user-supplied OR conversation context)
- [x] Mark song-remix as always requiring user input
- [x] Update Security Considerations in all skills
- [x] Update creative/README.md
- [x] Commit changes (d865db5)
- [ ] Republish all 5 skills to ClawHub
- [ ] Verify security scans pass

---

*Consolidated issue for all creative skills security scan findings 2026-02-24*
