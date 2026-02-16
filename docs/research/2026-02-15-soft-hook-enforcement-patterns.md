# Research: Soft Hook Enforcement Patterns

**Date**: 2026-02-15
**Status**: Complete
**Purpose**: Address gap in soft hook reliability - how to ensure agents follow text-based instructions
**Related**: `2026-02-15-openclaw-clawhub-hooks-research.md`

---

## Executive Summary

**The Problem**: Both Codex and Gemini code reviews flagged that our "Next Steps" soft hooks are text instructions agents may not follow reliably. This is a known limitation across the OpenClaw ecosystem.

**The Industry Reality**: OpenClaw's own documentation states:
> "System prompt guardrails are soft guidance only; hard enforcement comes from tool policy, exec approvals, sandboxing"

**Key Finding**: The solution is not to make soft hooks "harder" but to layer them with verification mechanisms. Successful skills use a **Three-Layer Enforcement Model**:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: HARD ENFORCEMENT (Tool Hooks)                         │
│  PreToolUse can deny/allow/modify - programmatic guarantee      │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: VERIFICATION (HEARTBEAT)                              │
│  Periodic checks detect drift - reactive but reliable           │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: SOFT GUIDANCE (Next Steps)                            │
│  Text instructions - portable but advisory                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Soft Hook Problem

### What Are Soft Hooks?

Soft hooks are text-based instructions embedded in SKILL.md that guide agent behavior:

```markdown
## Next Steps

After this skill completes:
1. Check eligibility: R≥3 ∧ C≥2 → trigger constraint generation
2. Update workspace files
3. Notify user of status changes
```

The agent reads these instructions and *should* follow them, but there's no guarantee.

### Why Soft Hooks Fail

| Failure Mode | Description | Frequency |
|--------------|-------------|-----------|
| Ignored | Agent doesn't notice instruction | Common |
| Misinterpreted | Agent does something different | Occasional |
| Context lost | Compaction removes instruction | After compaction |
| Priority conflict | Other instructions take precedence | Common |
| Hallucinated completion | Agent claims to have done it without doing it | Rare |

### Industry Acknowledgment

OpenClaw Version 2026.2.12 release notes explicitly address this:
> "Soft hooks enforcement remains advisory. Hard enforcement requires tool policy integration."

Source: [OpenClaw 2026.2.12 Security Release](https://cybersecuritynews.com/openclaw-2026-2-12-released/)

---

## Enforcement Patterns from Industry

### Pattern 1: HEARTBEAT Verification

**Source**: proactive-agent v3.1.0, OpenClaw core

HEARTBEAT.md runs periodically (default: every 30 minutes) and checks conditions:

```markdown
## 🔒 Security Check
- [ ] No injection patterns in recent inputs
- [ ] Behavioral integrity maintained

## 🔧 Self-Healing Check
- [ ] Review logs for errors
- [ ] Diagnose & fix issues
```

**How it works**:
1. Agent evaluates each checklist item against current state
2. **Pass**: Writes `HEARTBEAT_OK`, continues
3. **Fail**: Triggers alert (issue file, notification)

**Limitation**: Reactive, not preventive. Detects drift after it happens.

Source: [HEARTBEAT.md Proactive Monitoring](https://repovive.com/roadmaps/openclaw/skills-memory-automation/heartbeat-md-proactive-monitoring)

### Pattern 2: Hard Hooks (Claude Agent SDK)

**Source**: Claude Agent SDK, Claude Code

Tool hooks provide programmatic enforcement with `PreToolUse`, `PostToolUse`, etc.:

```python
async def protect_env_files(input_data, tool_use_id, context):
    file_path = input_data["tool_input"].get("file_path", "")
    if file_path.endswith(".env"):
        return {
            "hookSpecificOutput": {
                "permissionDecision": "deny",
                "permissionDecisionReason": "Cannot modify .env files",
            }
        }
    return {}
```

**Decision flow**: Deny rules checked first → Ask rules → Allow rules → Default to Ask

**Key capability**: `permissionDecision` can be `'allow'`, `'deny'`, or `'ask'`

Source: [Claude Agent SDK Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)

### Pattern 3: Structured Output Enforcement

**Source**: OpenAI, industry best practice

Instead of free-form text, use JSON schemas with validation:

```json
{
  "action": "record_failure",
  "observation_id": "OBS-20260215-001",
  "counter": "R",
  "increment": 1
}
```

**Enforcement mechanisms**:
1. Schema validation rejects non-conforming responses
2. Enum constraints limit options to predefined values
3. Type enforcement ensures data type consistency

**Improvement over soft hooks**: Machine-parsable, validates automatically

Source: [Structured Prompting Guide](https://medium.com/@vishal.dutt.data.architect/structured-prompting-with-json-the-engineering-path-to-reliable-llms-2c0cb1b767cf)

### Pattern 4: Multi-Agent Verification

**Source**: OVON Framework, LangGraph

Use a second agent to verify the first agent's compliance:

```
Agent A executes task
     ↓
Agent B verifies output matches instructions
     ↓
If mismatch: escalate to human
```

**Frameworks using this**:
- LangChain/LangGraph: Inter-agent coordination via JSON payloads
- OVON (Open Voice Network): Structured JSON messages between agents

Source: [How JSON Prompting Supercharges Multi-Agent AI Systems](https://aicompetence.org/json-prompting-supercharges-multi-agent-ai-systems/)

### Pattern 5: Instruction Repetition

**Source**: ilert Engineering Guide

Repeat critical instructions at multiple points:

```markdown
## Task Definition
Always update workspace files after recording failures.

## Rules
- MUST update workspace files after recording failures

## Key Reminder
Remember: Update workspace files after recording failures.
```

**Finding**: "Repetition improves adherence, especially when dealing with longer, more complex instructions."

Source: [Engineering Reliable AI Agents](https://www.ilert.com/blog/engineering-reliable-ai-agents)

---

## How proactive-agent Handles Compliance

proactive-agent v3.1.0 uses NO hard hooks. It relies entirely on behavioral protocols with verification:

### 1. WAL Protocol (Write-Ahead Logging)

```markdown
### Trigger — SCAN EVERY MESSAGE FOR:
- ✏️ **Corrections** — "It's X, not Y" / "Actually..."
- 📋 **Decisions** — "Let's do X" / "Go with Y"

### The Protocol
**If ANY of these appear:**
1. **STOP** — Do not start composing your response
2. **WRITE** — Update SESSION-STATE.md with the detail
3. **THEN** — Respond to your human
```

### 2. ADL Protocol (Anti-Drift Limits)

Self-check before actions:
- ❌ Don't add complexity to "look smart"
- ❌ Don't make changes you can't verify worked
- ❌ Don't use vague concepts as justification

### 3. VFM Protocol (Value-First Modification)

Score proposed actions before taking them:

| Dimension | Weight | Question |
|-----------|--------|----------|
| High Frequency | 3x | Will this be used daily? |
| Failure Reduction | 3x | Does this turn failures into successes? |

**Threshold**: If weighted score < 50, don't do it.

### 4. HEARTBEAT.md Verification

Periodic check that validates protocols are being followed.

**Key insight**: proactive-agent treats soft hooks as a *system* of interlocking protocols, not isolated instructions.

---

## Synthesis: The Three-Layer Model

Based on research, the most effective approach combines all three layers:

### Layer 1: Soft Guidance (Required, Portable)

Text instructions in SKILL.md that work in any environment.

**Best practices**:
- Use tables for trigger→action mapping
- Repeat critical instructions
- Use CJK notation for compactness
- Include "Detection Triggers" that specify patterns

```markdown
## Detection Triggers

| Pattern | Action |
|---------|--------|
| `test.exit_code != 0` | `/fm detect test` |
| "Actually...", "No, that's wrong" | `/fm record correction` |
```

### Layer 2: Verification (Recommended)

HEARTBEAT.md periodic checks that detect drift:

```markdown
## P1: Critical (Every Session)

### Soft Hook Verification
- [ ] Check `.learnings/ERRORS.md` has entries from recent sessions
- [ ] Check `output/hooks/blocked.log` shows constraint checks
- [ ] If missing: Review "Next Steps", clarify trigger patterns
```

**Frequency**: P1 every session, P2 weekly, P3 monthly

### Layer 3: Hard Enforcement (Optional, Environment-Specific)

Claude Code/Agent SDK hooks for guaranteed enforcement:

```yaml
# In SKILL.md frontmatter (Claude Code)
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      command: "check-constraints.sh"
```

Or via Claude Agent SDK:

```python
hooks = {
    "PreToolUse": [HookMatcher(matcher="Write|Edit", hooks=[constraint_check])]
}
```

---

## Recommendations for Live Neon Skills

### Immediate (No Code Changes)

1. **Enhance Next Steps tables** with explicit trigger patterns
2. **Add instruction repetition** - key rules in multiple sections
3. **Use HEARTBEAT.md** for P1/P2/P3 verification (already implemented)

### Short-Term (Structured Format)

Consider structured instruction format for critical operations:

```yaml
# Instead of prose:
next_steps:
  - condition: "R >= 3 AND C >= 2"
    action: "/ce generate"
    required: true
  - condition: "always"
    action: "update .learnings/"
    required: true
```

**Trade-off**: More machine-parsable, but less human-readable.

### Future (Hard Hooks)

When Claude Code hooks are implemented:

```yaml
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash"
      command: "/ce check --file ${file_path}"
  PostToolUse:
    - matcher: "Bash"
      command: "/fm detect --check-exit-code"
```

**Deferred to future release** per consolidation plan.

---

## Metrics: How to Measure Compliance

### Proposed Metrics

| Metric | Source | Good Range |
|--------|--------|------------|
| HEARTBEAT pass rate | `output/hooks/heartbeat.log` | >95% |
| Workspace file freshness | `.learnings/*.md` timestamps | <24h |
| Soft hook trigger rate | Detection pattern matches / session | >80% |
| Manual intervention rate | Human corrections / session | <10% |

### Detection of Non-Compliance

Add to HEARTBEAT.md P1 checks:

```markdown
### Soft Hook Verification

Verify "Next Steps" are being followed:

- [ ] `.learnings/ERRORS.md` updated when errors occurred
- [ ] `/fm detect` triggered on test failures
- [ ] Constraint checks happening before file changes

**If any missing**: Soft hooks are failing. Review:
1. Are trigger patterns clear enough?
2. Is instruction repeated at key points?
3. Consider adding hard hook for critical paths
```

---

## Alternative Approaches Considered

### 1. Formal State Machine

Replace text instructions with explicit state transitions:

```
State: FAILURE_DETECTED
  → on R++ AND R>=3 AND C>=2: transition to ELIGIBLE
  → on R++: stay in FAILURE_DETECTED

State: ELIGIBLE
  → on /ce generate: transition to CONSTRAINT_DRAFT
```

**Pros**: Unambiguous, verifiable
**Cons**: Requires runtime implementation, not portable
**Status**: Deferred (Phase 8+)

### 2. Agent Communication Bus

Dedicated event system for agent-to-agent coordination:

```json
{
  "event": "failure_recorded",
  "observation_id": "OBS-20260215-001",
  "counters": {"R": 3, "C": 2, "D": 0},
  "eligible": true
}
```

**Pros**: Reliable, auditable
**Cons**: Requires infrastructure, not portable
**Status**: Not planned

### 3. LLM-as-Verifier

Use a second LLM call to verify compliance:

```
Prompt: "Did the agent follow these instructions? [instructions]
         Here's what happened: [transcript]
         Answer: YES/NO with explanation"
```

**Pros**: Works with existing infrastructure
**Cons**: Adds latency and cost, may disagree with original agent
**Status**: Could be added to HEARTBEAT checks

---

## Conclusion

**Soft hooks are inherently advisory**. The industry accepts this and builds verification layers around them.

**Our approach is sound**: Layer 1 (Next Steps) + Layer 2 (HEARTBEAT.md) provides portable foundation. Layer 3 (Claude Code hooks) is correctly deferred to future release.

**Key improvements available now**:
1. Enhance trigger pattern clarity in Next Steps tables
2. Add instruction repetition for critical rules
3. Use HEARTBEAT.md P1 checks to detect compliance drift
4. Consider structured format for machine-parsable instructions

**The gap flagged by reviewers is acknowledged but not a blocker**. It's a known limitation that we've mitigated with verification (HEARTBEAT) and will further address with hard hooks in future releases.

---

## Sources

### Documentation
- [Claude Agent SDK Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [OpenClaw 2026.2.12 Release](https://cybersecuritynews.com/openclaw-2026-2-12-released/)
- [HEARTBEAT.md Proactive Monitoring](https://repovive.com/roadmaps/openclaw/skills-memory-automation/heartbeat-md-proactive-monitoring)

### Guides
- [Engineering Reliable AI Agents](https://www.ilert.com/blog/engineering-reliable-ai-agents)
- [Structured Prompting with JSON](https://medium.com/@vishal.dutt.data.architect/structured-prompting-with-json-the-engineering-path-to-reliable-llms-2c0cb1b767cf)
- [How JSON Prompting Supercharges Multi-Agent AI Systems](https://aicompetence.org/json-prompting-supercharges-multi-agent-ai-systems/)

### Security & Governance
- [OpenClaw: Why Governance Matters](https://www.cloudbees.com/blog/openclaw-is-a-preview-of-why-governance-matters-more-than-ever)
- [OpenClaw Agent Security](https://www.reco.ai/blog/openclaw-the-ai-agent-security-crisis-unfolding-right-now)

### Skill Analysis
- [self-improving-agent (ClawHub)](https://clawhub.ai/pskoett/self-improving-agent)
- [proactive-agent (ClawHub)](https://clawhub.ai/halthelobster/proactive-agent)

---

*Research completed 2026-02-15. Addresses gap identified by N=2 code review (Codex + Gemini).*
