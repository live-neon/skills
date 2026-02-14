---
name: memory-search
version: 1.0.0
description: Query observations and constraints using semantic similarity
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, search, semantic]
---

# memory-search

Query the observation and constraint memory system using semantic similarity.
Search returns ranked results based on relevance, with support for filtering
by type, status, tags, and thresholds.

## Semantic Classification

This skill uses **LLM-based semantic similarity** for search, NOT pattern matching.
A query like "force push safety" finds constraints about `git push --force` even
if those exact words don't appear. The LLM understands semantic equivalence.

**Guide**: See `docs/guides/SEMANTIC_SIMILARITY_GUIDE.md` for the complete semantic
matching approach.

## Usage

```
/memory-search "<query>"
/memory-search "<query>" --type <observation|constraint>
/memory-search "<query>" --status <status>
/memory-search --tag <tag> [--tag <tag2>]
/memory-search --file <pattern>
/memory-search --min-r <n> --min-c <n>
/memory-search --severity <level>
/memory-search --recent <days>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| query | No* | Semantic search query (*required unless using filters) |
| --type | No | Filter by type: observation, constraint |
| --status | No | Filter by status: draft, active, retiring, retired, failure, pattern |
| --tag | No | Filter by tag (can specify multiple) |
| --file | No | Filter by file pattern (glob syntax) |
| --min-r | No | Minimum R count for observations |
| --min-c | No | Minimum C count for observations |
| --severity | No | Filter by severity: CRITICAL, IMPORTANT, MINOR |
| --recent | No | Only items updated in last N days |
| --limit | No | Maximum results to return (default: 10) |
| --format | No | Output format: brief, detailed, json |

## Example

```bash
# Semantic search
/memory-search "force push safety"

# Filter by type and severity
/memory-search --type constraint --severity CRITICAL

# Find eligible observations
/memory-search --type observation --min-r 3 --min-c 2

# Search by file pattern
/memory-search --file "src/git/*.ts"
```

## Output

### Semantic Search

```
/memory-search "force push safety"

SEARCH RESULTS: "force push safety"
────────────────────────────────────

Found 3 results (0.23s):

1. [CONSTRAINT] git-safety-force-push (relevance: 0.94)
   Status: active | Severity: CRITICAL
   Scope: "Actions that force-push to remote repositories"
   Path: docs/constraints/active/git-safety-force-push.md

2. [OBSERVATION] git-force-push-without-confirmation (relevance: 0.87)
   Type: failure | R: 5, C: 3, D: 0
   Description: AI executed force push without asking for confirmation
   Path: docs/observations/failures/git-force-push-without-confirmation.md

3. [OBSERVATION] git-history-rewrite-patterns (relevance: 0.72)
   Type: pattern | R: 2, Endorsements: 1
   Description: Successful patterns for safe git history manipulation
   Path: docs/observations/patterns/git-history-rewrite-patterns.md
```

### Filtered Search

```
/memory-search --type constraint --severity CRITICAL

SEARCH RESULTS: CRITICAL constraints
────────────────────────────────────

Found 3 results:

1. [CONSTRAINT] git-safety-force-push
   Status: active | Severity: CRITICAL
   Path: docs/constraints/active/git-safety-force-push.md

2. [CONSTRAINT] git-safety-destructive-ops
   Status: active | Severity: CRITICAL
   Path: docs/constraints/active/git-safety-destructive-ops.md

3. [CONSTRAINT] security-credential-handling
   Status: draft | Severity: CRITICAL
   Path: docs/constraints/draft/security-credential-handling.md
```

### File Pattern Search

```
/memory-search --file "src/git/*.ts"

SEARCH RESULTS: Files matching src/git/*.ts
───────────────────────────────────────────

Found 2 results:

1. [CONSTRAINT] git-safety-force-push
   Matches: scope includes "src/git/*.ts"
   Path: docs/constraints/active/git-safety-force-push.md

2. [OBSERVATION] git-force-push-without-confirmation
   Matches: source file src/git/push.ts
   Path: docs/observations/failures/git-force-push-without-confirmation.md
```

### Threshold Search

```
/memory-search --type observation --min-r 3 --min-c 2

SEARCH RESULTS: Observations with R≥3, C≥2
──────────────────────────────────────────

Found 3 results (meeting R/C thresholds):

1. [OBSERVATION] git-force-push-without-confirmation
   Type: failure | R: 5, C: 3, D: 0
   Path: docs/observations/failures/git-force-push-without-confirmation.md

2. [OBSERVATION] tests-skipped-before-commit
   Type: failure | R: 4, C: 2, D: 0
   Path: docs/observations/failures/tests-skipped-before-commit.md

3. [OBSERVATION] plan-implemented-without-approval
   Type: failure | R: 3, C: 2, D: 1
   Path: docs/observations/failures/plan-implemented-without-approval.md
```

### Recent Activity Search

```
/memory-search --recent 7

SEARCH RESULTS: Updated in last 7 days
──────────────────────────────────────

Found 5 results:

1. [CONSTRAINT] git-safety-force-push (updated 2026-02-13)
   Status: active | Severity: CRITICAL

2. [OBSERVATION] git-force-push-without-confirmation (updated 2026-02-13)
   Type: failure | R: 5, C: 3

3. [CONSTRAINT] test-before-commit (updated 2026-02-12)
   Status: active | Severity: IMPORTANT

... (2 more)
```

### JSON Output

```
/memory-search "force push" --format json --limit 1

{
  "query": "force push",
  "results": [
    {
      "type": "constraint",
      "id": "git-safety-force-push",
      "relevance": 0.94,
      "status": "active",
      "severity": "CRITICAL",
      "scope": "Actions that force-push to remote repositories",
      "path": "docs/constraints/active/git-safety-force-push.md",
      "tags": ["git", "safety", "destructive"],
      "updated": "2026-02-13"
    }
  ],
  "total": 3,
  "returned": 1,
  "time_ms": 230
}
```

## Search Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| Semantic | Query string provided | LLM-based similarity matching |
| Filter | Only flags provided | Exact match filtering |
| Hybrid | Query + flags | Semantic search with filters applied |

## Relevance Scoring

Results are ranked by relevance score (0.0 - 1.0):

| Score Range | Interpretation |
|-------------|----------------|
| 0.90 - 1.00 | Exact or near-exact match |
| 0.80 - 0.89 | Strong semantic match |
| 0.70 - 0.79 | Good match, related concept |
| 0.60 - 0.69 | Weak match, tangentially related |
| < 0.60 | Not returned (below threshold) |

**Minimum Threshold**: Results below 0.60 relevance are filtered out.

## Searchable Fields

### Observations

| Field | Searchable | Filterable |
|-------|------------|------------|
| slug | Yes (semantic) | Yes (exact) |
| description | Yes (semantic) | No |
| type | No | Yes |
| r_count | No | Yes (threshold) |
| c_count | No | Yes (threshold) |
| d_count | No | Yes (threshold) |
| sources | Yes (file patterns) | Yes (glob) |
| tags | Yes (semantic) | Yes (exact) |
| updated | No | Yes (recent) |

### Constraints

| Field | Searchable | Filterable |
|-------|------------|------------|
| id | Yes (semantic) | Yes (exact) |
| scope | Yes (semantic) | No |
| severity | No | Yes |
| status | No | Yes |
| intent | Yes (semantic) | Yes |
| tags | Yes (semantic) | Yes (exact) |
| updated | No | Yes (recent) |

## Index Structure

Memory search maintains an index for fast retrieval:

```
docs/.memory-index.json
{
  "version": "1.0.0",
  "built": "2026-02-13T10:00:00Z",
  "observations": {
    "git-force-push-without-confirmation": {
      "type": "failure",
      "path": "docs/observations/failures/git-force-push-without-confirmation.md",
      "r_count": 5,
      "c_count": 3,
      "d_count": 0,
      "tags": ["git", "safety"],
      "updated": "2026-02-13"
    }
  },
  "constraints": {
    "git-safety-force-push": {
      "status": "active",
      "severity": "CRITICAL",
      "path": "docs/constraints/active/git-safety-force-push.md",
      "scope": "Actions that force-push to remote repositories",
      "tags": ["git", "safety", "destructive"],
      "updated": "2026-02-13"
    }
  }
}
```

## Index Maintenance

```
/memory-search --rebuild-index    # Force full rebuild
/memory-search --index-status     # Show index health
```

**Auto-rebuild triggers**:
- New observation/constraint created
- Existing file modified
- File moved between directories (state change)

## Integration

- **Layer**: Core
- **Depends on**: context-packet (for result hashing/validation)
- **Used by**: contextual-injection, all workflow skills

## Integration with contextual-injection

When contextual-injection needs relevant constraints:

```
1. contextual-injection calls memory-search with current context
2. memory-search returns ranked constraints matching:
   - File patterns in current session
   - Tags matching current domain
   - Recent violations
3. contextual-injection selects top N by relevance and priority
4. Selected constraints injected into session context
```

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No results found | Return empty with "No results found" message |
| Index outdated | Warning + auto-rebuild |
| Index missing | Auto-build on first search |
| Invalid query | Error: "Invalid search query" |
| Invalid filter | Error: "Invalid filter: <details>" |
| LLM unavailable | Fallback to keyword matching (degraded mode) |

## Performance

| Operation | Expected Time |
|-----------|---------------|
| Filter-only search | < 50ms |
| Semantic search (cached) | < 100ms |
| Semantic search (LLM call) | 200-500ms |
| Index rebuild (100 files) | 2-5s |

## Acceptance Criteria

- [x] Semantic search returns relevant results
- [x] Filter by type (observation/constraint)
- [x] Filter by status, tags, severity
- [x] Filter by R/C/D thresholds
- [x] File pattern matching (glob)
- [x] Recent activity filtering
- [x] Results ranked by relevance (0.0-1.0)
- [x] Minimum relevance threshold (0.60)
- [x] JSON output format support
- [x] Index auto-maintenance
- [x] Graceful fallback when LLM unavailable

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to layer table if new skill
2. **Update upstream skills** - Add this skill to their "Used by" lists
3. **Update downstream skills** - Verify "Depends on" lists are current
4. **Run verification** - `cd tests && npm test`
5. **Check closing loops** - See `docs/workflows/phase-completion.md`

**If part of a phase implementation**:
- Mark stage complete in implementation plan
- Proceed to next stage OR run phase-completion workflow
- Update `docs/implementation/agentic-phase4-results.md`

**Related workflows**:
- `docs/workflows/documentation-update.md` - Full documentation update process
- `docs/workflows/phase-completion.md` - Phase completion checklist
