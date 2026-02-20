# Workflow: Creating a New Skill

**Purpose**: Guide the complete process of creating a new skill from conception to publication.

**When to use**: Creating new skills for the Live Neon skills repository.

**Companion doc**: [skill-publish.md](./skill-publish.md) — covers publishing and security compliance details.

---

## Quick Reference

- [Phase 1: Validation](#phase-1-validation) — Should this be a skill?
- [Phase 2: Design](#phase-2-design) — Agent Identity and structure
- [Phase 3: Implementation](#phase-3-implementation) — Writing the SKILL.md
- [Phase 4: Security Compliance](#phase-4-security-compliance) — Required for ClawHub
- [Phase 5: Quality Checklist](#phase-5-quality-checklist) — Pre-publication validation
- [Phase 6: Publication](#phase-6-publication) — Git commit and optional ClawHub

---

## Phase 1: Validation

### When to Create a New Skill

Create a new skill when:

| Trigger | Requirement |
|---------|-------------|
| **Repeated need** | You've needed this capability 3+ times (N≥3) |
| **Clear boundary** | The skill does one thing well |
| **AI-assistable** | The task benefits from AI guidance |
| **Reusable** | Others could benefit from this skill |

### When NOT to Create a New Skill

| Situation | Alternative |
|-----------|-------------|
| One-time task | Just do it manually |
| Overlaps existing skill | Extend the existing skill |
| Pure automation | Use a script, not a skill |
| Too broad | Split into multiple skills |

### Decision Tree

```
Need identified
    ↓
[Has this need occurred 3+ times?]
    ├─ No → Wait for more evidence
    └─ Yes ↓
[Does an existing skill cover this?]
    ├─ Yes → Extend existing skill
    └─ No ↓
[Is the scope clear and bounded?]
    ├─ No → Refine scope first
    └─ Yes ↓
[Would AI guidance add value?]
    ├─ No → Create a script instead
    └─ Yes → Proceed to Phase 2
```

### Evidence Documentation

Before creating a skill, document the evidence:

```markdown
## Skill Proposal: [skill-name]

### Evidence (N≥3 Required)

| Instance | Date | Context | Outcome |
|----------|------|---------|---------|
| 1 | YYYY-MM-DD | Description of need | What happened |
| 2 | YYYY-MM-DD | Description of need | What happened |
| 3 | YYYY-MM-DD | Description of need | What happened |

### Proposed Scope

- **Does**: [clear statement of what skill does]
- **Does NOT**: [explicit boundaries]
- **Related skills**: [existing skills this relates to]
```

---

## Phase 2: Design

### Skill Categories

Choose the appropriate category:

| Category | Directory | Characteristics |
|----------|-----------|-----------------|
| **Agentic** | `agentic/` | Workflow automation, agent coordination, lifecycle management |
| **PBD** | `pbd/` | Principle-Based Documentation — extraction, synthesis, comparison |

### Agent Identity

Every skill needs a clear Agent Identity section:

```markdown
## Agent Identity

**Role**: [One sentence describing what you help with]
**Understands**: [What problem the user faces]
**Approach**: [How you solve it]
**Boundaries**: [What you will NOT do]
**Tone**: [Communication style]
**Opening Pattern**: [How you begin conversations]
```

**Examples**:

| Skill Type | Tone | Opening Pattern |
|------------|------|-----------------|
| Technical (agentic) | Precise, systematic | "Let me check the current state..." |
| Discovery (pbd) | Warm, celebratory | "You have sources that might share deeper truth..." |
| Analysis | Methodical, thorough | "Let me analyze this systematically..." |

### Structure Template

```markdown
---
[Frontmatter - see Phase 4]
---

# Skill Name

## Agent Identity
[See above]

## What This Solves (Agentic Only)
[User-facing problem statement - what pain point does this address?]

## When to Use
[Triggers for activation]

## Important Limitations
[What the skill cannot do]

---

## Core Operations / Usage
[Main functionality]

## Arguments / Sub-Commands
[Input specification]

## Output
[What the skill produces]

---

## Error Handling
[Error codes and messages]

## Related Skills
[Skills that work together with this one]

---

## Required Disclaimer
[If applicable - especially for PBD skills]

---

*Built by [attribution]*
```

### Voice Pairing (PBD Only)

PBD skills often come in pairs with different voices:

| Technical Voice | Conversational Voice |
|-----------------|---------------------|
| pbe-extractor | essence-distiller |
| principle-comparator | pattern-finder |
| principle-synthesizer | core-refinery |

**When to create paired skills**:
- Same methodology, different presentation
- Technical audience vs. general audience
- Formal documentation vs. discovery experience

---

## Phase 3: Implementation

### Directory Structure

```
category/skill-name/
├── SKILL.md          # Required - the skill definition
├── examples/         # Optional - usage examples
│   └── example-1.md
└── tests/            # Optional - test cases
    └── test-cases.md
```

### Writing Guidelines

**Do**:
- Use imperative mood in headings ("Generate", not "Generating")
- Include concrete examples with expected output
- Define all terminology in a terminology table
- Link to related skills

**Don't**:
- Duplicate functionality from existing skills
- Include implementation code (skills are prompts, not code)
- Use vague language ("might", "could", "try to")
- Assume context not provided in the skill

### Output Schemas

Skills with structured output should include a JSON schema:

```markdown
## Output Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["operation", "metadata", "result"],
  "properties": {
    "operation": { "type": "string" },
    "metadata": { ... },
    "result": { ... }
  }
}
```
```

### CJK Notation (Agentic Only)

Agentic skills use CJK characters and math notation for **compression and signal density**.

**Why this matters**:

| Challenge | Solution | Benefit |
|-----------|----------|---------|
| LLM context windows are limited | CJK encodes more meaning per token | 3-5x compression vs prose |
| Verbose instructions get truncated | Math notation is universal and precise | Survives context pressure |
| Agents scan for patterns | Symbolic notation is scannable | Faster pattern matching |
| Instructions can be ambiguous | `R≥3` is unambiguous | No interpretation errors |

**Compression comparison**:

| Prose | CJK + Math | Tokens Saved |
|-------|------------|--------------|
| "When recurrence count is at least 3 and confirmations are at least 2 and false positive rate is below 20%" | `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2` | ~15 → 5 |
| "Before action or when threshold reached" | `行動前∨閾値到達` | ~8 → 2 |
| "Weak, medium, or strong evidence" | `弱/中/強` | ~5 → 1 |

**Signal density principle**: Pack maximum meaning into minimum tokens. When context is compacted or truncated, high-density notation survives while verbose prose is lost.

**Standard elements**:

| Element | Example | Purpose |
|---------|---------|---------|
| Skill name suffix | `failure-memory (失敗)` | Quick identification |
| Trigger notation | `**Trigger**: 行動前∨閾値到達` | Scannable conditions |
| Logic expression | `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2` | Precise thresholds |
| Evidence tiers | `N∈{1:弱,2:中,≥3:強}` | Compact classification |
| Sub-command logic | `pattern→obs, R++` | Action chains |

**Reference**: See [CJK Vocabulary](../standards/CJK_VOCABULARY.md) for complete notation reference.

### Math Notation and Consequences-Based Learning

**Core Principle** (from [Architecture README](../architecture/README.md)):
> AI systems learn best from consequences, not instructions.

Agentic skills use math notation to implement consequences-based learning. Instead of telling an AI "don't do X," the system:

1. **Records failures** — Every mistake becomes an observation
2. **Tracks evidence** — R/C/D counters accumulate over time
3. **Establishes thresholds** — Math notation defines when action is taken
4. **Creates constraints** — Only after evidence accumulates do rules emerge

**The Eligibility Formula**:

```
R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2
```

| Variable | Meaning | Threshold | Why |
|----------|---------|-----------|-----|
| **R** | Recurrence count | ≥3 | Failure has happened multiple times |
| **C** | Human confirmations | ≥2 | Humans verified it's a real problem |
| **D** | Disconfirmations | D/(C+D)<0.2 | False positive rate below 20% |
| **sources** | Different contexts | ≥2 | Not specific to one file/session |

**Why This Matters for Skill Design**:

| Traditional Approach | Consequences Approach |
|---------------------|----------------------|
| "Always validate inputs" | Track validation failures → R++ → C++ → generate constraint |
| Static rules, forgotten | Evidence-based rules, continuously validated |
| Instructions can be ignored | Math thresholds are objective and verifiable |
| No feedback loop | Failure → Observation → Constraint → Enforcement |

**When writing agentic skills**:
- Use R/C/D counters for eligibility tracking
- Design outputs that increment counters appropriately
- Include evidence tier classification (弱/中/強 = weak/emerging/strong)
- Trust the math — thresholds prevent premature constraint generation

**Research validation**: See [Consequences-Based Learning Research](../research/2026-02-16-consequences-based-learning-llm-research.md) for external validation of this approach, including alignment with RLVR, self-improving agent patterns, and industry circuit breaker standards.

### Next Steps Section (Soft Hooks)

Every skill should include a "Next Steps" section that guides agent behavior after the skill completes.
These are **soft hooks** - text instructions that agents follow but aren't programmatically enforced.

```markdown
## Next Steps

After this skill completes:

1. **[If output includes file changes]** Verify files exist and are valid
2. **[If creating constraints]** Add to `output/constraints/draft/`
3. **[Always]** Report completion status to user
```

**Best practices** (from [soft hook research](../research/2026-02-15-soft-hook-enforcement-patterns.md)):

| Practice | Why It Works |
|----------|--------------|
| Use trigger tables | `Pattern → Action` is clearer than prose |
| Repeat critical instructions | Improves adherence for complex tasks |
| Include conditions | `[If X]` makes relevance clear |
| Be specific | "Update `.learnings/ERRORS.md`" not "update files" |

### Optional: Claude Code Hooks (Advanced)

Skills CAN embed Claude Code hooks directly in SKILL.md frontmatter for automated enforcement:

```yaml
---
name: planning-with-files
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash"
      command: "cat task_plan.md | head -50"
  PostToolUse:
    - matcher: "Write|Edit"
      command: "echo 'Remember to update the plan'"
  Stop:
    - command: "./scripts/completion-check.sh"
---
```

**Hook types** (see [hooks research](../research/2026-02-15-openclaw-clawhub-hooks-research.md)):

| Hook | When | Can Block? |
|------|------|------------|
| `PreToolUse` | Before tool executes | Yes |
| `PostToolUse` | After tool succeeds | No |
| `UserPromptSubmit` | Prompt submitted | Yes |
| `Stop` | Agent finishes | Yes |

**Three-Layer Enforcement Model**:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Hard Hooks (optional)                              │
│  - Embedded in SKILL.md frontmatter                          │
│  - Works: Claude Code, Codex CLI only                        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: HEARTBEAT Verification (recommended)               │
│  - Periodic checks detect drift                              │
│  - Works: Any environment with scheduled tasks               │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Next Steps (required)                              │
│  - Text instructions in SKILL.md                             │
│  - Works: ANY agent that reads markdown                      │
└─────────────────────────────────────────────────────────────┘
```

**Recommendation**: Start with Layer 1 (Next Steps). Add Layer 3 hooks only if you need guaranteed enforcement.

---

## Phase 4: Security Compliance

**This phase is REQUIRED for ClawHub publication.**

**Full reference**: See **[skill-security-compliance.md](../standards/skill-security-compliance.md)** for complete security requirements, templates, and anti-patterns.

### Quick Summary

1. **Required frontmatter**: `disable-model-invocation: true`, `homepage` (GitHub URL)

2. **Metadata format** - use nested `metadata.openclaw.requires.*`:
   ```yaml
   metadata:
     openclaw:
       requires:
         config:
           - .openclaw/skill-name.yaml
         workspace:
           - output/skill-output/
   ```
   ⚠️ Top-level `config_paths`/`workspace_paths` are **ignored by registry**

3. **Data handling statement** - use "instruction-only" language for `disable-model-invocation: true` skills

4. **Security Considerations section** - required if skill handles sensitive patterns

5. **Pre-publish checklist** - run gitleaks, verify metadata format, check for contradictions

### Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| "Uses your model" + `disable-model-invocation: true` | Use "instruction-only" language |
| "Auto-invoke" language | Use "user or orchestrator triggers" |
| "Only accesses declared paths" + user input | Document arbitrary file access |
| Homepage/repository owner differ | Add provenance note |

**Full details**: [skill-security-compliance.md](../standards/skill-security-compliance.md)

---

## Phase 5: Quality Checklist

### Pre-Publication Validation

```bash
# 1. Directory exists with SKILL.md
ls category/skill-name/SKILL.md

# 2. No secrets (gitleaks scan)
gitleaks detect --source category/skill-name -v

# 3. Required frontmatter fields present
grep -E "^(name|version|description|homepage|disable-model-invocation):" \
  category/skill-name/SKILL.md

# 4. Homepage uses GitHub URL (not young/suspicious domains)
grep "homepage:" category/skill-name/SKILL.md | grep "github.com"

# 5. Data handling statement present
grep -A5 "Data handling" category/skill-name/SKILL.md

# 6. No download+execute patterns (VirusTotal check)
grep -i "download.*execute\|curl.*bash\|wget.*sh" category/skill-name/SKILL.md
# Expected: No results

# 7. No obfuscated code (VirusTotal check)
grep -i "base64\|eval\|exec" category/skill-name/scripts/*.sh 2>/dev/null
# Review any matches carefully

# 8. External endpoints documented (if network calls)
grep -A10 "External Endpoints" category/skill-name/SKILL.md
```

### Content Checklist

| Section | Required | Check |
|---------|----------|-------|
| Frontmatter | Yes | All required fields present |
| Description | Yes | User-friendly, outcome-focused (not just features) |
| Agent Identity | Yes | Role, Understands, Approach, Boundaries defined |
| Data handling | Yes | Statement present and accurate |
| What This Solves | Agentic: Yes | User-facing problem statement (TR-2 pattern) |
| When to Use | Yes | Clear triggers defined |
| Limitations | Yes | Explicit boundaries stated |
| Core Operations | Yes | Main functionality documented |
| Output | Yes | Expected output described |
| External Endpoints | If network calls | Table of URLs and data transmitted |
| Error Handling | Recommended | Error codes and messages |
| Related Skills | Recommended | Cross-references to related skills |
| Disclaimer | If applicable | Especially for PBD synthesis skills |

### ClawHub Package Contents

**Include**:
- `SKILL.md` (required)
- `README.md` (optional but recommended)
- `scripts/` directory (if applicable)
- Example files

**Exclude** (these should NOT be uploaded to ClawHub):
- `.git/` directory
- `.gitignore`
- `.env` files
- `LICENSE` (ClawHub has its own licensing)
- Build artifacts
- Test files (keep in separate repo)

### Quality Gates

| Gate | Criteria | Pass/Fail |
|------|----------|-----------|
| **Scope** | Does one thing well | [ ] |
| **Completeness** | All required sections present | [ ] |
| **Accuracy** | Data handling statement truthful | [ ] |
| **Security** | All security fields present | [ ] |
| **VirusTotal Ready** | No download+execute, no obfuscation, endpoints documented | [ ] |
| **Dependencies** | Runtime deps declared in `metadata.openclaw` | [ ] |
| **Consistency** | Follows category conventions | [ ] |
| **Examples** | At least one concrete example | [ ] |

---

## Phase 6: Publication

### Git Commit

```bash
# Stage skill
git add category/skill-name/

# Commit with DCO sign-off
git commit -s -m "feat(category): add skill-name

- [Brief description of what the skill does]
- [Any notable design decisions]"

# Push
git push origin main
```

### Update Indexes (If Applicable)

For agentic skills:
- Update `agentic/INDEX.md` with new skill
- Update `agentic/CHANGELOG.md` with version entry

### Optional: ClawHub Publishing

See [skill-publish.md#optional-clawhub-publishing](./skill-publish.md#optional-clawhub-publishing) for:
- ClawHub account setup
- Publishing commands
- Batch publishing for multiple skills

---

## Common Patterns

### PBD Skill Pair Creation

When creating conversational + technical pairs:

1. Create technical skill first (formal language, detailed output)
2. Create conversational skill second (warm language, simplified output)
3. Link skills in Related Skills sections
4. Ensure same methodology, different presentation

### Agentic Skill Consolidation

When consolidating multiple skills into one:

1. List all source skills and their functions
2. Design sub-command structure
3. Create consolidated skill with all functions
4. Move source skills to `_archive/`
5. Update migration path documentation

### Adding Sub-Commands

When extending an existing skill:

1. Add sub-command to Arguments table
2. Add CJK notation if agentic
3. Update examples to show new sub-command
4. Update CHANGELOG with minor version bump

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Kitchen sink | Too many responsibilities | Split into focused skills |
| Vague scope | "Help with X" | Specific triggers and outputs |
| Missing boundaries | No "Does NOT" section | Explicit limitations |
| Copy-paste frontmatter | Missing skill-specific fields | Update all paths and names |
| Optimistic data claims | "Never leaves machine" | "Agent's trust boundary" |
| No examples | Hard to understand usage | At least one complete example |
| Download + execute | VirusTotal flags as malicious | Use declared dependencies instead |
| Obfuscated scripts | VirusTotal flags as suspicious | Write transparent, documented code |
| "Paste into terminal" | Security risk pattern | Use proper `requires.bins` |
| Undeclared dependencies | Skill fails at runtime | Use `metadata.openclaw.requires` |
| Multi-line metadata | Parser fails | Keep metadata as single-line JSON |
| "Uses your model" + disable-model-invocation | Contradiction flagged by scanner | Use "instruction-only skill" language |
| "Auto-invoke" + disable-model-invocation | Implies autonomous behavior | Use "user or orchestrator triggers" |
| Undocumented arbitrary file access | Scanner flags as undeclared access | Add explicit file access scope warning |
| "Only accesses declared paths" + user input | Contradiction when skill reads user-specified files/dirs | Remove claim; document that skill reads arbitrary user-provided paths |
| Undocumented skill spawning | Scanner flags privilege expansion | Document permission inheritance |
| Provenance mismatch | Homepage/repository owner differ | Add provenance note explaining same maintainer |
| External service name confusion | Uses "Codex", "Gemini" without clarification | Add note clarifying these are review modes, not API calls |
| Undocumented implicit access | Reads agent runtime data not in declared paths | Document exactly where/how data is obtained |
| Missing .gitignore guidance | Output dirs not excluded from version control | Add .gitignore recommendation for output directories |

---

## Cross-References

### Internal

- **[skill-publish.md](./skill-publish.md)**: Publishing workflow
- **[skill-security-compliance.md](../standards/skill-security-compliance.md)**: Security requirements (authoritative)
- **[../plans/2026-02-16-agentic-clawhub-publication.md](../plans/2026-02-16-agentic-clawhub-publication.md)**: Publication tracking
- **[../../agentic/README.md](../../agentic/README.md)**: Agentic suite overview
- **[../../pbd/README.md](../../pbd/README.md)**: PBD suite overview
- **[NEON-SOUL Security Lessons](../../../neon-soul/docs/issues/2026-02-10-skillmd-llm-wording-false-positive.md)**: Security scan remediation case study
- **[ClawHub Publishing Issues](../issues/2026-02-18-clawhub-publishing-issues.md)**: 7-skill remediation with detailed security scan results and lessons learned

### Research (Hooks & Enforcement)

- **[OpenClaw/ClawHub Hooks Research](../research/2026-02-15-openclaw-clawhub-hooks-research.md)**: Three hook systems, SKILL.md format, case studies
- **[Soft Hook Enforcement Patterns](../research/2026-02-15-soft-hook-enforcement-patterns.md)**: Three-Layer Model, HEARTBEAT verification, compliance patterns

### Research (Learning Theory)

- **[Consequences-Based Learning Research](../research/2026-02-16-consequences-based-learning-llm-research.md)**: External validation of "consequences over instructions" approach, R/C/D counter system, circuit breaker patterns, alignment with RLVR and self-improving agent research

### External (OpenClaw/ClawHub)

> **Note**: Some URLs below are illustrative references to expected documentation locations. Verify current URLs at [openclaw.ai](https://openclaw.ai) or [clawhub.ai](https://clawhub.ai).

- **[OpenClaw Skills Documentation](https://docs.openclaw.ai/tools/skills)**: Official SKILL.md format reference
- **[ClawHub Repository](https://github.com/openclaw/clawhub)**: Skill registry source code
- **[VirusTotal Partnership](https://openclaw.ai/blog/virustotal-partnership)**: Security scanning details
- **[13-Point Publishing Checklist](https://gist.github.com/adhishthite/0db995ecfe2f23e09d0b2d418491982c)**: Community best practices
- **[Code Insight Threat Analysis](https://blog.virustotal.com/2026/02/from-automation-to-infection-how.html)**: What triggers security flags

---

*Built by twins in Alaska.*
