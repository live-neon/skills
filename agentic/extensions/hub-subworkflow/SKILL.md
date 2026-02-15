---
name: hub-subworkflow
version: 1.0.0
description: Split large documentation into hub + sub-document structure
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, documentation, hub, organization]
layer: extensions
status: active
source: docs/patterns/hub-subworkflow.md
n_count: 5
---

# hub-subworkflow

Analyze large documentation files and suggest hub + sub-document structure.
Generates hub templates with navigation and identifies logical sub-document splits.

## Problem Being Solved

Large documentation files create cognitive overload:
- Files drift past 300-500+ lines incrementally
- Readers load entire document when they need one section
- Changes to one section risk breaking others
- Token budget wasted on irrelevant content

## Usage

```
/hub-subworkflow analyze <doc>       # Analyze document structure
/hub-subworkflow suggest <doc>       # Suggest hub + sub-docs
/hub-subworkflow template <doc>      # Generate hub template
```

## Example

```bash
# Analyze a large workflow document
/hub-subworkflow analyze docs/workflows/complex.md

# Generate hub template
/hub-subworkflow template docs/workflows/complex.md
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: analyze, suggest, template |
| doc | Yes | Path to documentation file |
| --verbose | No | Show detailed section analysis |

## Trigger Conditions

| Condition | Action |
|-----------|--------|
| Document > 300 lines | Apply hub-subworkflow |
| Document has 2+ modes/phases | Apply hub-subworkflow |
| Document < 200 lines | Do NOT split (overhead exceeds benefit) |
| Tightly coupled sections | Do NOT split (breaks cohesion) |

## Output

### Analyze Document

```
/hub-subworkflow analyze docs/workflows/observations.md

HUB-SUBWORKFLOW ANALYSIS
========================

File: docs/workflows/observations.md
Lines: 1660
Threshold: 300
Status: EXCEEDS THRESHOLD

Detected Sections (4):
  1. Creation workflow (lines 1-400)
  2. Growth workflow (lines 401-800)
  3. Integration workflow (lines 801-1200)
  4. Maintenance workflow (lines 1201-1660)

Recommendation: Split into hub + 4 sub-documents
```

### Suggest Structure

```
/hub-subworkflow suggest docs/workflows/observations.md

SUGGESTED STRUCTURE
===================

Hub: docs/workflows/observations.md (~150 lines)
  - Quick reference table
  - Decision tree
  - Links to sub-workflows

Sub-documents:
  1. observations-creation.md (~250 lines)
     Focus: Creating new observations

  2. observations-growth.md (~250 lines)
     Focus: N-count tracking, evolution

  3. observations-integration.md (~250 lines)
     Focus: Linking, cross-references

  4. observations-maintenance.md (~300 lines)
     Focus: Cleanup, archival
```

### Generate Template

```
/hub-subworkflow template docs/workflows/observations.md

# Observations Hub

## Quick Reference

| Workflow | When to Use | Link |
|----------|-------------|------|
| Creation | New observation needed | [observations-creation.md] |
| Growth | Tracking N-count evolution | [observations-growth.md] |
| Integration | Linking observations | [observations-integration.md] |
| Maintenance | Cleanup and archival | [observations-maintenance.md] |

## Decision Tree

Need to work with observations?
├── Creating new? → observations-creation.md
├── Tracking growth? → observations-growth.md
├── Linking to other docs? → observations-integration.md
└── Cleaning up? → observations-maintenance.md

## Related

- [patterns/pbd.md] - Pattern-Based Development
- [standards/observation-format.md] - Observation template
```

## Hub Template Structure

```markdown
# [Topic] Hub

## Quick Reference

| Variant | When to Use | Link |
|---------|-------------|------|
| variant-a | [trigger] | [variant-a.md](variant-a.md) |

## Decision Tree

[Visual navigation]

## Related

- [Related documentation links]
```

## Sub-Document Template

```markdown
# [Topic] - [Variant Name]

**Hub**: [name.md](name.md)

## When to Use

[Clear trigger condition]

## Procedure

[Self-contained guidance]
```

## Integration

- **Layer**: Extensions
- **Depends on**: None (standalone)
- **Used by**: mce-refactorer (for documentation files), doc review workflows

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Non-markdown file | Error: "Not a documentation file" |
| Under threshold | Info: "Document is within threshold (X/300 lines)" |
| No clear sections | Warning: "Could not detect distinct sections" |

## Acceptance Criteria

- [x] Identifies documents needing hub structure
- [x] Suggests logical sub-document splits
- [x] Generates hub template with navigation
- [x] Detects distinct sections/modes
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Analyze large documentation:
```bash
/hub-subworkflow analyze <doc>
```

**Verification**: `cd tests && npm test -- -t "hub-subworkflow"`
