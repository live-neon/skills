# Creative Skills

Creative synthesis and artifact generation skills that transform technical work into
multi-format creative outputs for reflection, reinforcement, and knowledge transfer.

## Philosophy

Creation forces synthesis. Making a song, visual guide, or narrative about a concept
reveals gaps that passive understanding cannot. These skills turn detours into destinations.

## Skills

| Skill | Alias | Description |
|-------|-------|-------------|
| [insight-song](insight-song/SKILL.md) | `/song` | Create original Suno-ready songs from technical insights |
| [song-remix](song-remix/SKILL.md) | `/remix` | Transform existing songs with Twin Remix method |
| [visual-concept](visual-concept/SKILL.md) | `/vc` | Transform insights into visual concept guides |
| [ted-talk](ted-talk/SKILL.md) | `/ted` | Transform insights into full 40-50 minute TED talks |
| [side-quests](side-quests/SKILL.md) | `/sq` | **Combo**: Run all three (song + visual + TED) |

## Installation

```bash
# Install individual components
openclaw install leegitw/insight-song
openclaw install leegitw/song-remix
openclaw install leegitw/visual-concept
openclaw install leegitw/ted-talk

# Or install the combo skill
openclaw install leegitw/side-quests
```

## When to Use

**Use individual skills** when you only need one format:
- `/song` — Quick audio reinforcement of a concept
- `/vc` — Visual direction for video content
- `/ted` — Comprehensive talk for teaching

**Use the combo skill** (`/sq`) when you want full multi-format synthesis.

### Choosing Between Similar Skills

| Starting Material | Use This | Why |
|-------------------|----------|-----|
| Technical insight or conversation | `/song` | Creates original song from fresh context |
| Existing song lyrics to transform | `/remix` | Creates variations (Respectful + Viral) |
| Want song + visual + TED together | `/sq` | Runs all three as combined artifact |

**Note**: `/remix` is standalone and not part of `/sq` because it transforms existing songs
rather than creating from technical insights.

## Good Candidates

- Deep technical insight emerged from conversation
- Pattern or principle that's broadly applicable
- Novel approach to common problem
- Decision with rich context and rationale
- "Aha" moment that shifted understanding

## Not Good Candidates

- Basic/standard practice without novel perspective
- Surface-level summary
- Concepts without depth or nuance
- No clear narrative arc

## Output Locations

| Skill | Output Directory |
|-------|-----------------|
| insight-song | `output/songs/` |
| song-remix | `output/remixes/` |
| visual-concept | `output/visual-concepts/` |
| ted-talk | `output/ted-talks/` |
| side-quests | `output/side-quests/` |

## Related Categories

- **agentic/**: Agent behavior skills (verification, memory, constraints)
- **pbd/**: Principle-Based Design skills (extraction, synthesis, comparison)

---

*"Context without action is paralysis. Action without context is chaos.
Creative skills make context actionable through synthesis."*

---

*Built by twins in Alaska.*
