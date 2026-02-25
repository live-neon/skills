---
created: 2026-02-24
type: issue
status: resolved
resolved: 2026-02-24
severity: medium
skills:
  - creative/ted-talk
  - creative/side-quests
source: ClawHub Security Scan
classification: Suspicious (medium confidence)
---

# Issue: Creative Skills Overly Prescriptive About Concrete Examples

## Summary

ClawHub security scanner flagged `ted-talk` and `side-quests` as **Suspicious** (medium confidence).
Root cause: Skills explicitly state they don't read workspace files, but then instruct agents to
include "actual file names", "specific metrics", and "real decisions" - creating ambiguity about
data access and potentially encouraging sensitive data exposure.

## Scanner Findings

### ted-talk

> SKILL.md both (a) asserts the skill does NOT read files from the workspace or access project
> artifacts directly, and (b) repeatedly instructs the agent to 'collect concrete examples
> (files, metrics, decisions)' and to 'Include actual file names' and specific metrics.
> These are inconsistent.

### side-quests

> The TED Talk rules explicitly ask for 'concrete examples (file names, metrics, decisions)',
> which does not align with the earlier explicit statement that the skill 'does NOT read files
> from the workspace or access project artifacts directly.'

## Root Cause

The instructions are **too prescriptive** about what concrete examples should look like.

**Problematic patterns in ted-talk/SKILL.md:**
- "Include concrete examples from actual work" (line ~182)
- "Actual file names (`internal/gemini/client.go`)" (line ~183)
- "Real decisions made (`300s timeout, not 30s`)" (line ~184)
- "Specific metrics (`2.3 second p99 latency`)" (line ~185)

**Why this is wrong:**
1. A TED talk doesn't need literal file paths - metaphors and general descriptions work better
2. Prescribing exact formats (file paths, metrics) implies workspace access
3. Users providing context can choose their own level of detail
4. The skill should focus on *what kind* of examples, not *exact format*

## User Insight

> "They should just provide the content. I don't know why we need filenames and line numbers
> for a TED talk."

This is correct. The skill should:
- Ask for **concrete context** (specific, real, not hypothetical)
- Let the user/agent decide what level of detail to provide
- Not prescribe formats that imply file system access

## Proposed Fix

### 1. Remove prescriptive example formats from ted-talk

**Before (lines 180-186):**
```markdown
### Step 4: Include Concrete Details

TED talks get specific. Include:
- Actual file names (`internal/gemini/client.go`)
- Real decisions made (`300s timeout, not 30s`)
- Specific metrics (`2.3 second p99 latency`)
- Actual problems encountered (`3 AM debugging session`)
```

**After:**
```markdown
### Step 4: Ground in Reality

TED talks resonate when they're specific, not hypothetical. Draw from:
- Real problems you encountered (not abstract scenarios)
- Actual decisions and their reasoning
- Specific outcomes and what changed
- Stories with concrete details the audience can visualize

The user provides context - use what they share, don't invent specifics.
```

### 2. Update ted-talk Context Understanding Checklist

**Before (line ~83):**
```markdown
| Concrete examples? | Specific files, decisions, metrics from actual work |
```

**After:**
```markdown
| Concrete examples? | Specific details from the context provided |
```

### 3. Update side-quests TED Talk Rules reference

The side-quests skill embeds TED talk instructions inline. Apply same fix pattern.

### 4. Review all "concrete examples" language

Search for and soften any language that implies accessing workspace files:
- "actual file names" → "real examples"
- "specific metrics" → "specific outcomes"
- "collect concrete examples (files, metrics, decisions)" → "use concrete details from the context provided"

## Files to Modify

- `creative/ted-talk/SKILL.md`
- `creative/side-quests/SKILL.md`

## Resolution Checklist

- [x] Remove prescriptive file/metric format examples from ted-talk
- [x] Update Context Understanding Checklist in ted-talk
- [x] Apply same fixes to side-quests TED talk section
- [x] Verify no other "files, metrics, decisions" patterns remain
- [x] Bump versions to 1.0.2
- [ ] Commit changes
- [ ] Republish to ClawHub
- [ ] Verify security scans pass

## Version Impact

This requires version bump to 1.0.2 for both skills.

---

*Issue created 2026-02-24 from ClawHub security scan findings.*
