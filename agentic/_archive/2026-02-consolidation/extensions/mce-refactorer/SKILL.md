---
name: mce-refactorer
version: 1.0.0
description: Analyze files for MCE compliance and suggest split strategies
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, extensions, mce, refactoring, compliance]
layer: extensions
status: active
source: docs/patterns/mce-refactoring.md
n_count: 7
---

# mce-refactorer

Analyze files for MCE (Minimal Complete Example) compliance. Suggest split
strategies based on file type when limits are exceeded.

## Problem Being Solved

Files drift past MCE limits without systematic detection:
- Incremental growth goes unnoticed (N=3: 3 files grew 32-68% over limit)
- Different file types need different split strategies
- Documentation files need hub-subworkflow pattern, not code-style splits
- Manual compliance checking is error-prone

## Usage

```
/mce-refactorer analyze <file>       # Full MCE analysis
/mce-refactorer suggest <file>       # Quick split suggestion
/mce-refactorer strategies           # Show all split strategies
```

## Example

```bash
# Check if a file needs refactoring
/mce-refactorer analyze src/handlers.go

# Get quick suggestion for a test file
/mce-refactorer suggest tests/api_test.go
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: analyze, suggest, strategies |
| file | Yes (for analyze/suggest) | Path to file to analyze |
| --verbose | No | Show detailed split recommendations |

## MCE Limits

| File Type | Limit | Rationale |
|-----------|-------|-----------|
| Test files | 200 lines | Maintainability |
| Production modules | 200 lines | Cognitive load |
| Handler files | 600 lines | Complex routing allowed |
| Documentation | 300 lines | Use hub-subworkflow |

## Output

### Analyze File

```
/mce-refactorer analyze src/core.go

MCE ANALYSIS
============

File: src/core.go
Lines: 412
Limit: 200
Status: EXCEEDS LIMIT

File Type: Production code

Recommended Strategy: Responsibility separation

Suggested Split:
  1. core_types.go      (~100 lines) - Data structures
  2. core_interface.go  (~120 lines) - Contracts
  3. core_logic.go      (~150 lines) - Main logic
  4. core_helpers.go    (~80 lines)  - Utilities

Verification Commands:
  wc -l src/core*.go
  go build ./...
  go test ./...
```

### Documentation File

```
/mce-refactorer analyze docs/workflow.md

MCE ANALYSIS
============

File: docs/workflow.md
Lines: 450
Limit: 300
Status: EXCEEDS LIMIT

File Type: Documentation

Delegating to: /hub-subworkflow

Run: /hub-subworkflow analyze docs/workflow.md
```

### Split Strategies

```
/mce-refactorer strategies

MCE SPLIT STRATEGIES
====================

TEST FILES (limit: 200 lines)
-----------------------------
- Template type split: Tests grouped by template → page_test.go, metadata_test.go
- Workflow stage split: Tests follow workflow → add_test.go, publish_test.go
- Concern split: Tests have different patterns → safety_test.go, functional_test.go

PRODUCTION CODE (limit: 200 lines)
----------------------------------
- Logging extraction: Verbose debugging → logging.go with helpers
- Responsibility separation: Multiple concerns → core.go, extractors.go, helpers.go
- Concern separation: Cross-cutting → cache.go, report.go, analysis.go

RESEARCH CODE (limit: 200, accept 75-80%)
-----------------------------------------
- Module pattern: Complex algorithms → types.go, interface.go, core.go, helpers.go
- Accept slight overage for algorithmic cohesion (205-220 lines)

DOCUMENTATION (limit: 300 lines)
--------------------------------
- Delegates to /hub-subworkflow for hub + sub-document pattern
```

## Integration

- **Layer**: Extensions
- **Depends on**: hub-subworkflow (for documentation files)
- **Used by**: Code review workflows, MCE compliance checks

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: <path>" |
| Binary file | Error: "Cannot analyze binary file" |
| Under limit | Info: "File is MCE compliant (X/Y lines)" |

## When NOT to Use

- **Files well under limits**: <150 lines don't need analysis
- **Contract tests with inline mocks**: Accepted pattern (411-608 lines) for self-contained test documentation
- **Prototype/throwaway code**: Temporary code not worth splitting
- **Algorithmically cohesive modules**: When splitting would break conceptual unity (accept 75-80% overage)
- **Generated files**: Auto-generated code should be regenerated, not manually split

Split when MCE limits are exceeded AND the file will be maintained long-term.

## Acceptance Criteria

- [x] Detects files exceeding MCE limit
- [x] Suggests appropriate split strategy by file type
- [x] Delegates docs to hub-subworkflow
- [x] Provides verification commands
- [x] SKILL.md compliant with MCE limits (<220 lines total)

## Next Steps

Check file compliance:
```bash
/mce-refactorer analyze <file>
```

**Verification**: `cd tests && npm test -- -t "mce-refactorer"`
