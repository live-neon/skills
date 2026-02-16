# Research: OpenClaw/ClawHub Skills and Hook Patterns

**Date**: 2026-02-15
**Status**: Complete
**Purpose**: Understand how OpenClaw skills published to ClawHub implement automation and "next steps" patterns

---

## Executive Summary

OpenClaw has **three distinct hook systems**, and existing skills use all of them:

1. **Claude Code / Codex hooks** (PreToolUse, PostToolUse, Stop) - Used by self-improving-agent, planning-with-files
2. **OpenClaw Gateway hooks** (agent:bootstrap, command:new) - Native to OpenClaw runtime
3. **Webhook hooks** (HTTP triggers) - Used by linear-webhook, fieldy-ai-webhook

**Critical clarification**: Skills CAN include hooks directly in SKILL.md frontmatter (see `planning-with-files`). However, the **portable foundation** is still text instructions (Next Steps), which work in ANY agent.

**Key insight**: Design skills with a layered approach:
- **Layer 1** (required): SKILL.md with Next Steps - works everywhere
- **Layer 2** (optional): Claude Code hooks in frontmatter OR scripts/ - works in Claude Code/Codex
- **Layer 3** (optional): OpenClaw Gateway hooks - works in OpenClaw only

---

## ClawHub Registry Overview

| Stat | Value |
|------|-------|
| Total skills (Feb 2026) | 5,705 |
| Curated skills | 3,002 (after spam/malicious filtering) |
| Registry URL | [clawhub.ai](https://clawhub.ai) |
| GitHub repo | [github.com/openclaw/clawhub](https://github.com/openclaw/clawhub) |

**Features**:
- Vector search (embeddings, not just keywords)
- Semantic versioning with changelogs
- Moderation hooks for approvals/audits
- CLI-friendly API for automation

---

## SKILL.md Format Specification

### Required Structure

```
my-skill/
  SKILL.md           # Markdown documentation (required, case-sensitive)
  package.json       # Metadata (optional)
  install.sh         # Installation script (optional)
  config.json        # Configuration schema (optional)
```

### Frontmatter Fields

**Required**:
```yaml
---
name: skill-name
description: Brief description of what the skill does
---
```

**Optional**:
```yaml
---
name: skill-name
description: Brief description
homepage: https://github.com/...
user-invocable: true                    # Controls slash command exposure
disable-model-invocation: false         # Excludes from model prompts
command-dispatch: tool                  # Direct tool invocation
command-tool: Bash                      # Which tool executes
command-arg-mode: raw                   # Forwards unparsed arguments
metadata:
  openclaw:
    requires:
      env:
        - ENV_VAR_NAME
      bins:
        - binary-name
      anyBins:
        - alt-binary-1
        - alt-binary-2
    primaryEnv: ENV_VAR_NAME
    os: darwin                          # Platform restriction
---
```

**Important constraint**: The parser supports **single-line** frontmatter keys only. Metadata must be formatted as single-line JSON objects.

---

## Three Hook Systems (Critical Clarification)

**Important**: "Hooks" in OpenClaw means different things depending on context. There are **three distinct hook systems**:

### 1. Claude Code / Codex-Style Hooks

Tool-loop hooks that fire on agent tool use. **Some openclaw/skills already use these.**

| Event | When | Blocking? |
|-------|------|-----------|
| `PreToolUse` | Before tool executes | Yes |
| `PostToolUse` | After tool succeeds | No |
| `UserPromptSubmit` | Prompt submitted | Yes |
| `Stop` | Agent finishes | Yes |

**Example skills using these**:
- `self-improving-agent` - `.claude/settings.json` with UserPromptSubmit + PostToolUse
- `planning-with-files` - hooks in SKILL.md frontmatter (PreToolUse, PostToolUse, Stop)

**Configuration**: Via `.claude/settings.json` OR embedded in SKILL.md frontmatter:

```yaml
---
name: planning-with-files
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash|Read|Glob|Grep"
      command: "cat task_plan.md ..."
  PostToolUse:
    - matcher: "Write|Edit"
      command: "echo 'Update plan reminder'"
  Stop:
    - command: "./scripts/completion-check.sh"
---
```

### 2. OpenClaw Gateway Hooks (OpenClaw-Native)

Internal gateway event scripts. **Different from Claude Code hooks.**

| Event | When |
|-------|------|
| `command` | Any command event |
| `command:new` | New command started |
| `command:reset` | Command reset |
| `command:stop` | Command stopped |
| `agent:bootstrap` | Agent initialization |
| `gateway:startup` | Gateway starts |

**Bundled hooks** (built-in):
- `session-memory` - saves context on `/new`
- `bootstrap-extra-files` - injects files at bootstrap
- `command-logger` - logs commands
- `boot-md` - boot markdown injection

**Configuration**: Via OpenClaw gateway config, not `.claude/settings.json`

### 3. Webhook Hooks (HTTP Triggers)

External HTTP entrypoints that trigger OpenClaw work. **For integrations.**

**Example skills using these**:
- `linear-webhook` - routes `POST /hooks/linear` through transform → agent
- `fieldy-ai-webhook` - routes `POST /hooks/fieldy` with wake word trigger

**Configuration**:
```json
{
  "hooks": {
    "enabled": true,
    "token": "...",
    "path": "/hooks/linear",
    "transformsDir": "./transforms",
    "mappings": { ... }
  }
}
```

### 4. Plugin-Bundled Hooks

Plugins can ship **both hooks and skills** together:
- `HOOK.md` + `handler.ts` for hook logic
- `skills/<name>/SKILL.md` for skill content

---

## Skills CAN Include Hooks

**Correction to earlier research**: Skills CAN define hooks directly in SKILL.md frontmatter (for Claude Code/Codex). The `planning-with-files` skill demonstrates this pattern.

However, the **portable foundation** remains the text instructions (Next Steps). Hooks are optional automation that only works in environments that support them.

### How Skills Work

1. **Discovery**: System scans skill directories for SKILL.md files
2. **Filtering**: Applies allowlist and enabled status checks
3. **Policy Gating**: Includes skills only if corresponding tools pass policy
4. **Injection**: Concatenates skill markdown into system prompt
5. **Hook Registration**: If SKILL.md has `hooks:` frontmatter, registers them
6. **Propagation**: Environment variables become available to tool execution

### Where Automation Lives

| Mechanism | Purpose | Location |
|-----------|---------|----------|
| **Claude Code hooks** | Tool-loop automation | `.claude/settings.json` OR SKILL.md frontmatter |
| **Gateway hooks** | Agent lifecycle | OpenClaw gateway config |
| **Webhook hooks** | External triggers | Gateway webhook mappings |
| **Cron Tasks** | Scheduled invocations | `cron.*` config |
| **Directives** | Runtime overrides | `/model`, `/think`, `/elevated` |
| **Session Tools** | Agent-to-agent | `sessions_spawn`, `sessions_send` |

---

## The "Next Steps" Pattern

Since skills can't programmatically trigger automation, they use **text-based instructions** to guide agent behavior.

### Pattern: Text Instructions as Soft Hooks

```markdown
## Next Steps

After using this skill:

1. **Verify the output** - Check that files were created correctly
2. **Run tests** - Execute `npm test` to validate changes
3. **Update documentation** - If public API changed, update README
4. **Commit changes** - Use conventional commit format
```

The agent reads these instructions and follows them based on:
- Understanding the context
- Applying judgment about which steps are relevant
- Executing actions using available tools

### Why This Works

| Hard Hooks (Claude Code) | Soft Hooks (ClawHub Skills) |
|--------------------------|------------------------------|
| Programmatic execution | Text instruction |
| Deterministic | Agent interprets |
| Fires automatically | Agent chooses to follow |
| Requires hook API | Works anywhere |
| Can block actions | Guides behavior |

**Advantage**: Soft hooks are portable. They work with any agent that can read markdown, regardless of hook API support.

---

## Recommended SKILL.md Structure for Live Neon

Based on research, our skills should include:

```markdown
---
name: skill-name
description: One-line description
homepage: https://github.com/live-neon/skills/tree/main/agentic/skill-name
user-invocable: true
tags: [agentic, memory, category]
---

# skill-name

Brief description of purpose.

## Usage

```
/skill-name <required-arg> [optional-arg]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| arg1 | Yes | Description |
| arg2 | No | Description (default: value) |

## Output

What the skill produces.

## Example

```
/skill-name example-input

[Expected output]
```

## Integration

- **Layer**: Core
- **Depends on**: upstream-skill-1, upstream-skill-2
- **Used by**: downstream-skill-1, downstream-skill-2

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Missing input | Error message |
| Invalid format | Error with expected format |

## Next Steps

After this skill completes, the agent SHOULD:

1. **[If output includes file changes]** Verify files exist and are valid
2. **[If creating constraints]** Add to active constraints directory
3. **[If recording failures]** Increment R counter in observation
4. **[Always]** Report completion status to user

These are INSTRUCTIONS, not automation. The agent reads and follows them.
```

---

## Comparison: Hook Systems

### Claude Code / Codex Hooks (Tool-Loop)

| Event | When | Can Block? | Used By |
|-------|------|------------|---------|
| `SessionStart` | Session begins/resumes | No | - |
| `UserPromptSubmit` | Prompt submitted | Yes | self-improving-agent |
| `PreToolUse` | Before tool executes | Yes | planning-with-files |
| `PostToolUse` | After tool succeeds | No | self-improving-agent |
| `Stop` | Agent finishes | Yes | planning-with-files |
| `Notification` | Alert sent | No | - |

### OpenClaw Gateway Hooks (Lifecycle)

| Event | When | Used By |
|-------|------|---------|
| `agent:bootstrap` | Agent initialization | self-improving-agent (HOOK.md) |
| `command:new` | New command | session-memory (bundled) |
| `command:stop` | Command stopped | command-logger (bundled) |
| `gateway:startup` | Gateway starts | boot-md (bundled) |

### Webhook Hooks (External Triggers)

| Pattern | Trigger | Used By |
|---------|---------|---------|
| `POST /hooks/<name>` | External HTTP | linear-webhook, fieldy-ai-webhook |
| Transform mappings | Request → agent | Integration skills |

### ClawHub Skills (Base Layer)

| Capability | Support |
|------------|---------|
| Block actions | Via Claude Code hooks (optional) |
| Auto-execute | Via hooks (optional) |
| Inject context | Yes - into system prompt |
| Define requirements | Yes - env, bins, config |
| Embed hooks | Yes - in SKILL.md frontmatter |
| Version/publish | Yes - via ClawHub CLI |

---

## Publishing to ClawHub

### Requirements

1. GitHub account at least 1 week old
2. SKILL.md with valid frontmatter
3. No secrets in skill content
4. Published to github.com/openclaw/skills (NOT personal repo)

### Commands

```bash
# Install ClawHub CLI
npm install -g clawhub

# Login
clawhub login --token "$CLAWHUB_TOKEN"

# Publish
clawhub publish path/to/skill \
  --slug skill-name \
  --name "Skill Display Name" \
  --version 1.0.0 \
  --tags "tag1,tag2,tag3"

# Verify
clawhub inspect skill-name
```

---

## Implications for Live Neon Skills

### What We Should Do

1. **Include "Next Steps" in every SKILL.md** - Portable soft hooks (works everywhere)
2. **Embed Claude Code hooks in SKILL.md frontmatter** - For Claude Code/Codex users (like `planning-with-files`)
3. **Provide separate hook scripts** - For environments that prefer `.claude/settings.json` (like `self-improving-agent`)
4. **Use CJK notation in skill body** - Compact, agent-optimized
5. **Document which hook system each feature needs** - Users can choose based on their environment

### Hook Strategy by Environment

| Environment | Hook Approach | Example |
|-------------|---------------|---------|
| **Claude Code** | SKILL.md frontmatter OR `.claude/settings.json` | planning-with-files, self-improving-agent |
| **OpenClaw Gateway** | Gateway config + HOOK.md | Bundled hooks pattern |
| **External Integrations** | Webhook mappings | linear-webhook |
| **Any agent** | Next Steps (text) | Universal fallback |

### What We Should NOT Do

1. **Don't assume only ONE hook system** - Support multiple approaches
2. **Don't skip text instructions** - Hooks are optional, Next Steps are required
3. **Don't mix Gateway hooks with Claude Code hooks** - They're different systems

### The Layered Approach

For maximum compatibility, each skill should have:

```
┌────────────────────────────────────────────────────────────┐
│  LAYER 3: Claude Code Hooks (optional)                      │
│  - Embed in SKILL.md frontmatter OR provide scripts/        │
│  - Works: Claude Code, Codex CLI                            │
├────────────────────────────────────────────────────────────┤
│  LAYER 2: OpenClaw Gateway Hooks (optional)                 │
│  - Provide hooks/HOOK.md + handler.ts                       │
│  - Works: OpenClaw only                                     │
├────────────────────────────────────────────────────────────┤
│  LAYER 1: SKILL.md with Next Steps (required)               │
│  - Text instructions, detection triggers                    │
│  - Works: ANY agent that reads markdown                     │
└────────────────────────────────────────────────────────────┘
```

**Key insight**: Layer 1 is required. Layers 2-3 are progressive enhancements for specific environments.

---

## Case Study: Real-World ClawHub Skills

Analysis of two production skills from ClawHub that our agentic skills are designed to integrate with.

### self-improving-agent v1.0.5

**Author**: peterskoett
**Purpose**: Captures learnings, errors, and corrections to enable continuous improvement

#### Directory Structure

```
self-improving-agent-1.0.5/
├── SKILL.md                    # Main skill (592 lines)
├── _meta.json                  # ClawHub metadata
├── hooks/
│   └── openclaw/
│       ├── HOOK.md             # OpenClaw hook definition
│       ├── handler.js          # Hook implementation (JS)
│       └── handler.ts          # Hook implementation (TS)
├── scripts/
│   ├── activator.sh            # UserPromptSubmit hook script
│   ├── error-detector.sh       # PostToolUse hook script
│   └── extract-skill.sh        # Skill extraction helper
├── references/
│   ├── hooks-setup.md          # Hook configuration guide
│   ├── openclaw-integration.md # OpenClaw-specific setup
│   └── examples.md             # Usage examples
├── assets/
│   ├── SKILL-TEMPLATE.md       # Template for extracted skills
│   └── LEARNINGS.md            # Learning file template
└── .learnings/
    ├── LEARNINGS.md            # Corrections, gaps, best practices
    ├── ERRORS.md               # Command failures, exceptions
    └── FEATURE_REQUESTS.md     # User-requested capabilities
```

#### Key Patterns

**1. Dual-Mode Operation**: Works as soft hooks (text instructions) AND hard hooks (shell scripts)

```markdown
## Quick Reference (Soft Hook - in SKILL.md)

| Situation | Action |
|-----------|--------|
| Command/operation fails | Log to `.learnings/ERRORS.md` |
| User corrects you | Log to `.learnings/LEARNINGS.md` with category `correction` |
| User wants missing feature | Log to `.learnings/FEATURE_REQUESTS.md` |
```

**2. Hook Scripts for Claude Code** (optional automation layer):

```bash
# activator.sh - UserPromptSubmit hook (~50-100 tokens overhead)
cat << 'EOF'
<self-improvement-reminder>
After completing this task, evaluate if extractable knowledge emerged:
- Non-obvious solution discovered through investigation?
- Workaround for unexpected behavior?
- Project-specific pattern learned?
- Error required debugging to resolve?

If yes: Log to .learnings/ using the self-improvement skill format.
If high-value (recurring, broadly applicable): Consider skill extraction.
</self-improvement-reminder>
EOF
```

**3. Error Detection via PostToolUse**:

```bash
# error-detector.sh - Scans Bash output for error patterns
ERROR_PATTERNS=("error:" "failed" "command not found" "Permission denied" ...)
# Only outputs reminder if error detected
```

**4. XML Tags for Structured Output**:

- `<self-improvement-reminder>` - Learning evaluation prompt
- `<error-detected>` - Error capture prompt

#### Lessons for Live Neon

| Pattern | How self-improving-agent Does It | Live Neon Application |
|---------|----------------------------------|------------------------|
| Logging format | `[LRN-YYYYMMDD-XXX]` ID scheme | Our observation ID format |
| Priority levels | low/medium/high/critical | Map to N-count thresholds |
| Status tracking | pending/resolved/promoted | Our constraint lifecycle |
| Promotion path | .learnings/ → CLAUDE.md | observation → constraint |
| Detection triggers | "Actually...", "No, that's wrong" | Our failure detection patterns |

---

### proactive-agent v3.1.0

**Author**: halthelobster (Hal Labs)
**Purpose**: Transform AI agents from task-followers into proactive partners

#### Directory Structure

```
proactive-agent-3.1.0/
├── SKILL.md                # Main skill (633 lines)
├── _meta.json              # ClawHub metadata
├── scripts/
│   └── security-audit.sh   # Security verification
├── references/
│   ├── onboarding-flow.md  # User onboarding process
│   └── security-patterns.md # Security guidelines
├── assets/
│   ├── HEARTBEAT.md        # Periodic self-check checklist
│   ├── MEMORY.md           # Long-term memory template
│   ├── SESSION-STATE.md    # Active working memory (WAL target)
│   ├── SOUL.md             # Identity, principles, boundaries
│   ├── USER.md             # Human's context, goals, preferences
│   ├── AGENTS.md           # Operating rules, workflows
│   ├── TOOLS.md            # Tool configurations, gotchas
│   └── ONBOARDING.md       # First-run setup
└── SKILL-v2.3-backup.md    # Previous version backup
```

#### Key Patterns

**1. NO Hook Scripts** - Relies entirely on text instructions (soft hooks):

The entire skill is embedded behavioral rules that the agent follows:

```markdown
## The WAL Protocol ⭐

**The Law:** You are a stateful operator. Chat history is a BUFFER, not storage.

### Trigger — SCAN EVERY MESSAGE FOR:
- ✏️ **Corrections** — "It's X, not Y" / "Actually..." / "No, I meant..."
- 📍 **Proper nouns** — Names, places, companies, products
- 🎨 **Preferences** — Colors, styles, approaches
- 📋 **Decisions** — "Let's do X" / "Go with Y"

### The Protocol
**If ANY of these appear:**
1. **STOP** — Do not start composing your response
2. **WRITE** — Update SESSION-STATE.md with the detail
3. **THEN** — Respond to your human
```

**2. Workspace File Architecture** (context injection via files):

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `SESSION-STATE.md` | Active working memory | Every critical detail |
| `HEARTBEAT.md` | Periodic self-improvement checklist | Each heartbeat |
| `MEMORY.md` | Curated long-term wisdom | Periodically |
| `SOUL.md` | Identity and principles | Rarely |
| `USER.md` | Human's preferences | As learned |

**3. Behavioral Protocols as "Soft Hooks"**:

| Protocol | Trigger | Action |
|----------|---------|--------|
| WAL | Correction/decision in message | Write to SESSION-STATE.md FIRST |
| Working Buffer | Context >60% | Log every exchange |
| Compaction Recovery | Session starts with `<summary>` | Read buffer, recover state |
| VBR | About to say "done" | Test the outcome first |

**4. HEARTBEAT.md as Periodic Check** (cron-triggered):

```markdown
## 🔒 Security Check
- Injection scan for suspicious patterns
- Behavioral integrity confirmation

## 🔧 Self-Healing Check
- Review logs for errors
- Diagnose & fix issues

## 🎁 Proactive Surprise Check
> "What could I build RIGHT NOW that would make my human say
> 'I didn't ask for that but it's amazing'?"
```

**5. Self-Improvement Guardrails**:

```markdown
### ADL Protocol (Anti-Drift Limits)
- ❌ Don't add complexity to "look smart"
- ❌ Don't make changes you can't verify worked
- ❌ Don't use vague concepts as justification

### VFM Protocol (Value-First Modification)
| Dimension | Weight | Question |
|-----------|--------|----------|
| High Frequency | 3x | Will this be used daily? |
| Failure Reduction | 3x | Does this turn failures into successes? |
| User Burden | 2x | Can human say 1 word instead of explaining? |

**Threshold:** If weighted score < 50, don't do it.
```

#### Lessons for Live Neon

| Pattern | How proactive-agent Does It | Live Neon Application |
|---------|------------------------------|------------------------|
| Memory persistence | WAL Protocol + Working Buffer | Our observation files |
| Periodic checks | HEARTBEAT.md via cron | heartbeat-constraint-check skill |
| Priority scoring | VFM weighted dimensions | Our R/C/D counter thresholds |
| Anti-drift | ADL Protocol | Our constraint lifecycle gates |
| Workspace files | SOUL.md, USER.md, AGENTS.md | Our .learnings/ structure |

---

## Synthesis: Patterns for Live Neon Agentic Skills

### The Three-Layer Model

Based on both skills, successful ClawHub skills operate at three layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: AUTOMATION                       │
│  Optional hooks for Claude Code/Codex (scripts/, hooks/)    │
│  Fires programmatically, provides reminders                  │
├─────────────────────────────────────────────────────────────┤
│                    LAYER 2: WORKSPACE                        │
│  Files that persist across sessions (assets/*.md)            │
│  MEMORY.md, SESSION-STATE.md, .learnings/                    │
├─────────────────────────────────────────────────────────────┤
│                    LAYER 1: SKILL (SKILL.md)                 │
│  Instructions injected into system prompt                    │
│  Protocols, triggers, formats, "Next Steps"                  │
└─────────────────────────────────────────────────────────────┘
```

**Key insight**: Layer 1 (SKILL.md) is required and portable. Layers 2-3 are optional enhancements.

### Common Structural Elements

| Element | self-improving-agent | proactive-agent | Live Neon Should Have |
|---------|---------------------|-----------------|----------------------|
| Quick Reference table | ✅ Yes | ✅ Yes (as protocols) | ✅ Yes |
| Trigger patterns | ✅ Detection Triggers | ✅ WAL triggers | ✅ Yes (failure patterns) |
| File format specs | ✅ Learning Entry format | ✅ Buffer format | ✅ Yes (observation format) |
| Status/lifecycle | ✅ pending→resolved→promoted | ✅ Protocol states | ✅ Yes (draft→active→retired) |
| Priority system | ✅ low/medium/high/critical | ✅ VFM scoring | ✅ Yes (R/C/D thresholds) |
| Workspace files | ✅ .learnings/ | ✅ assets/*.md | ✅ Yes |
| Hook scripts | ✅ Yes (optional) | ❌ No | Optional |
| XML output tags | ✅ Yes | ❌ No | Consider |

### "Next Steps" Best Practices (from real skills)

**self-improving-agent approach** - Conditional actions:

```markdown
## Quick Reference

| Situation | Action |
|-----------|--------|
| Command/operation fails | Log to `.learnings/ERRORS.md` |
| User corrects you | Log to `.learnings/LEARNINGS.md` |
| Similar to existing entry | Link with `**See Also**`, consider priority bump |
| Broadly applicable | Promote to `CLAUDE.md` |
```

**proactive-agent approach** - Protocol triggers:

```markdown
### Trigger — SCAN EVERY MESSAGE FOR:
- ✏️ **Corrections** → Write to SESSION-STATE.md FIRST
- 📋 **Decisions** → Write to SESSION-STATE.md FIRST

### The Protocol
1. **STOP** — Do not start composing your response
2. **WRITE** — Update file with the detail
3. **THEN** — Respond
```

### Recommended Live Neon Pattern

Combine both approaches:

```markdown
## Triggers (自動検出)

| Pattern | Action | Output |
|---------|--------|--------|
| fail∈{test,user,API} | /fm detect | obs.R++ |
| "Actually...", "No, that's wrong" | /fm record correction | obs.R++ |
| R≥3 ∧ C≥2 | /ce generate | constraint.draft |

## Next Steps (実行後)

After this skill completes:

1. **[If R incremented]** Check eligibility: R≥3 ∧ C≥2 → trigger constraint generation
2. **[If constraint generated]** Add to `constraints/draft/`, notify user
3. **[If pattern recurring]** Link with `See Also`, bump priority
4. **[Always]** Update workspace state file
```

---

## Sources

### Documentation
- [ClawHub - OpenClaw Docs](https://docs.openclaw.ai/tools/clawhub)
- [Skills - OpenClaw Docs](https://docs.openclaw.ai/tools/skills)
- [Hooks - OpenClaw Docs](https://docs.openclaw.ai/automation/hooks) - Gateway hooks documentation
- [Plugins - OpenClaw Docs](https://docs.openclaw.ai/tools/plugin) - Plugin-bundled hooks
- [GitHub - openclaw/clawhub](https://github.com/openclaw/clawhub)
- [Skills System - DeepWiki](https://deepwiki.com/openclaw/openclaw/6.4-skills-system)
- [awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)

### Skill Examples (Hook Patterns)
- [self-improving-agent](https://playbooks.com/skills/openclaw/skills/self-improving-agent) - Claude Code hooks via settings.json
- [planning-with-files](https://playbooks.com/skills/openclaw/skills/planning-with-files) - Claude Code hooks in SKILL.md frontmatter
- [linear-webhook](https://playbooks.com/skills/openclaw/skills/linear-webhook) - Webhook hook mappings
- [fieldy-ai-webhook](https://playbooks.com/skills/openclaw/skills/fieldy-ai-webhook) - Webhook with wake word

### Local Analysis
- **self-improving-agent v1.0.5** - Downloaded skill analysis
- **proactive-agent v3.1.0** - Downloaded skill analysis

---

*Research completed 2026-02-15. Updated with case study analysis of self-improving-agent and proactive-agent.*
*Updated 2026-02-15: Clarified three distinct hook systems (Claude Code, Gateway, Webhook) based on additional research. Added planning-with-files, linear-webhook, fieldy-ai-webhook examples.*
*Updated 2026-02-15: Initial release targets ClawHub/OpenClaw only. Using "Next Steps" soft hooks (like proactive-agent). Claude Code hooks deferred to future release.*
