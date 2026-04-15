---
created: 2026-02-24
type: plan
status: in_progress
priority: medium
estimated_effort: 1-2 sessions
depends_on: []
workflow_references:
  - docs/workflows/creating-new-skill.md
  - docs/workflows/skill-publish.md
source_reference: /Users/leebrown/Desktop/stuff/Suno_Master_Guide_With_Appendix 9.01.15 PM.md
---

# Plan: Creative Skills Implementation

## Summary

Implement and publish a new **creative** skill category with 5 skills for transforming
technical work into creative artifacts (songs, visual guides, TED talks, remixes).

**Scope**: 5 skills total, published in 3 phases
**Risk**: Low (no external API dependencies, self-contained skills)
**Origin**: Side-quests workflow from multiverse project + Suno Master Guide

---

## Quick Reference

### Creative Skills (5)

| Skill | Alias | Description | Status |
|-------|-------|-------------|--------|
| insight-song | `/song` | Create original Suno-ready songs from technical insights | ✅ Created |
| song-remix | `/remix` | Transform existing songs with Twin Remix method | ✅ Created |
| visual-concept | `/vc` | Transform insights into visual concept guides | ✅ Created |
| ted-talk | `/ted` | Transform insights into full 40-50 minute TED talks | ✅ Created |
| side-quests | `/sq` | **Combo**: song + visual + TED talk | ✅ Created |

### Implementation Phases

| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| 1 | Skill Creation | Create all 5 SKILL.md files, READMEs | ✅ Complete |
| 2 | Testing & Validation | Manual testing, security scan prep | ⏳ Pending |
| 3 | ClawHub Publication | Publish all 5 skills | ⏳ Pending |

**Total**: 1-2 sessions

---

## Prerequisites

Before starting Phase 2:

- [x] All 5 creative skill SKILL.md files created
- [x] creative/README.md created with skill index
- [x] Root README.md updated with Creative section
- [x] docs/workflows/skill-publish.md updated with publish commands
- [x] Author email corrected to hello@liveneon.ai
- [ ] Git changes committed and pushed
- [ ] CLAWHUB_TOKEN available in .env

---

## Phase 1: Skill Creation ✅ Complete

### 1.1 Directory Structure

```
creative/
├── README.md                    # Category overview
├── insight-song/SKILL.md       # /song
├── song-remix/SKILL.md         # /remix
├── visual-concept/SKILL.md     # /vc
├── ted-talk/SKILL.md           # /ted
└── side-quests/SKILL.md        # /sq (combo)
```

### 1.2 Skills Created

#### insight-song (v1.0.0)
- **Purpose**: Transform technical insights into Suno-ready songs
- **Output**: `output/songs/`
- **Key features**:
  - Narrative arc extraction (Problem → Discovery → Solution → Impact)
  - Suno.ai format (title, 500-char style tags, section markers)
  - Metaphorical lyrics (no literal specifics)
  - Emotional arc matching technical journey

#### song-remix (v1.0.0)
- **Purpose**: Transform existing songs with Twin Remix methodology
- **Output**: `output/remixes/`
- **Key features**:
  - Twin Remix output (Respectful + Viral versions)
  - Suno v4.5 slider recommendations (Weirdness, Style, Audio Influence)
  - Visual guides for AI video generation
  - Positive Energy Protocol
  - Template routing for 40+ genres

#### visual-concept (v1.0.0)
- **Purpose**: Transform insights into visual concept guides
- **Output**: `output/visual-concepts/`
- **Key features**:
  - Core visual metaphor extraction
  - Symbolic element mapping
  - Emotional color arc
  - Motion and rhythm notes
  - Conceptual (not prescriptive) direction

#### ted-talk (v1.0.0)
- **Purpose**: Transform insights into full 40-50 minute TED-style talks
- **Output**: `output/ted-talks/`
- **Key features**:
  - Full-length comprehensive content
  - Concrete examples with specific details
  - Q&A preparation for objections
  - Structured sections (Opening → Closing)

#### side-quests (v1.0.0)
- **Purpose**: Combo skill running all three (song + visual + TED)
- **Output**: `output/side-quests/`
- **Key features**:
  - Orchestrates insight-song, visual-concept, ted-talk
  - Single combined artifact output
  - Pre-work documentation prompt

### 1.3 Documentation Updates

- [x] creative/README.md - Category overview with all 5 skills
- [x] README.md - Added Creative section with skill table
- [x] docs/workflows/skill-publish.md - Added 5 publish commands

---

## Phase 2: Testing & Validation ⏳ Pending

### 2.1 Manual Testing

Test each skill with sample inputs:

| Skill | Test Input | Expected Output |
|-------|------------|-----------------|
| `/song` | Bootstrap observability insight | Suno-formatted song with metaphorical lyrics |
| `/remix` | Existing song lyrics | Two versions (Respectful + Viral) with sliders |
| `/vc` | Technical concept | Visual concept guide with themes and color arc |
| `/ted` | Deep technical insight | 40-50 min talk with concrete examples |
| `/sq` | Technical conversation | Combined artifact with all three sections |

### 2.2 Security Scan Preparation

Verify each skill passes ClawHub security scan criteria:

| Check | insight-song | song-remix | visual-concept | ted-talk | side-quests |
|-------|--------------|------------|----------------|----------|-------------|
| No external API calls | ✅ | ✅ | ✅ | ✅ | ✅ |
| Local-only processing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clear data handling statement | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workspace paths declared | ✅ | ✅ | ✅ | ✅ | ✅ |
| Provenance note included | ✅ | ✅ | ✅ | ✅ | ✅ |
| No disable-model-invocation | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.3 Quality Checklist

- [x] All skills have consistent formatting
- [x] All skills have acceptance criteria
- [x] All skills have quality checklists
- [x] All skills have example outputs
- [x] All skills have proper CJK aliases
- [x] creative/README.md accurately reflects all skills

---

## Phase 3: ClawHub Publication ⏳ Pending

### 3.1 Pre-Publication Checklist

- [ ] Git working directory clean
- [ ] All changes pushed to origin/main
- [ ] CLAWHUB_TOKEN exported
- [ ] `clawhub whoami` returns valid user

### 3.2 Publish Commands

```bash
# 1. insight-song
clawhub publish creative/insight-song --slug insight-song --name "Insight Song" --version 1.0.0 --tags "creative,songwriting,suno,lyrics,music,synthesis,reflection,learning,technical-writing"

# 2. song-remix
clawhub publish creative/song-remix --slug song-remix --name "Song Remix" --version 1.0.0 --tags "creative,remix,suno,songwriting,viral,tiktok,music,transformation,rewrite"

# 3. visual-concept
clawhub publish creative/visual-concept --slug visual-concept --name "Visual Concept" --version 1.0.0 --tags "creative,visual,video,concept-art,storyboard,direction,synthesis,reflection,imagery"

# 4. ted-talk
clawhub publish creative/ted-talk --slug ted-talk --name "TED Talk" --version 1.0.0 --tags "creative,presentation,speaking,storytelling,teaching,synthesis,reflection,knowledge-transfer"

# 5. side-quests
clawhub publish creative/side-quests --slug side-quests --name "Side Quests" --version 1.0.0 --tags "creative,synthesis,songwriting,storytelling,ted-talk,visual-guide,reflection,knowledge-transfer,suno,learning"
```

### 3.3 Post-Publication Verification

For each skill:
```bash
clawhub inspect <slug>
clawhub search "<skill-name>"
```

### 3.4 Security Scan Monitoring

After publication, monitor for security scan flags:

| Finding | Response |
|---------|----------|
| "Autonomous execution" | Expected for agentic skills - no action |
| "Arbitrary file access" | Clarify workspace paths in SKILL.md |
| "Data exfiltration" | Clarify local-only processing |

---

## Output Directories

Each skill writes to a dedicated output directory:

```
output/
├── songs/              # insight-song output
├── remixes/            # song-remix output
├── visual-concepts/    # visual-concept output
├── ted-talks/          # ted-talk output
└── side-quests/        # side-quests combined output
```

---

## Skill Relationships

```
                    ┌─────────────────┐
                    │   side-quests   │
                    │      /sq        │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌──────────────┐ ┌───────────┐
    │  insight-song │ │visual-concept│ │  ted-talk │
    │     /song     │ │     /vc      │ │   /ted    │
    └───────────────┘ └──────────────┘ └───────────┘

    ┌───────────────┐
    │  song-remix   │  (standalone, complements insight-song)
    │    /remix     │
    └───────────────┘
```

---

## Related Documentation

- **Source workflow**: multiverse/docs/workflows/side-quests.md
- **Suno guide**: Suno_Master_Guide_With_Appendix (Twin Remix methodology)
- **Publish workflow**: docs/workflows/skill-publish.md
- **Security compliance**: docs/standards/skill-security-compliance.md

---

## Success Criteria

- [ ] All 5 skills published to ClawHub
- [ ] All skills pass security scan
- [ ] All skills searchable via `clawhub search`
- [ ] Installation works: `openclaw install leegitw/<skill>`
- [ ] Manual testing confirms expected outputs

---

## Next Steps After Completion

1. **Cross-link with NEON-SOUL**: Reference creative skills in soul synthesis workflows
2. **Add to agentic README**: Reference creative skills as complementary suite
3. **Create batch publish script**: Similar to `scripts/publish-to-clawhub.sh`
4. **Consider**: Add creative skills to side-quests combo invocation

---

*Plan created 2026-02-24 as part of Live Neon Creative Suite development.*
