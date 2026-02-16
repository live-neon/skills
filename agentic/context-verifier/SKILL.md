---
name: context-verifier
version: 1.0.0
description: File integrity verification, hash computation, and context packet management
author: Live Neon <contact@liveneon.dev>
homepage: https://github.com/live-neon/skills/tree/main/agentic/context-verifier
repository: leegitw/context-verifier
license: MIT
tags: [agentic, verification, hash, integrity, context]
layer: foundation
status: active
alias: cv
---

# context-verifier (検証)

Unified skill for file hash computation, integrity verification, severity tagging,
and context packet creation. Consolidates 3 granular skills into a single verification system.

**Trigger**: 明示呼出 (explicit invocation)

**Source skills**: context-packet, file-verifier, severity-tagger

## Installation

```bash
openclaw install leegitw/context-verifier
```

**Dependencies**: None (foundational skill)

**Standalone usage**: This skill is fully functional standalone. It provides file integrity
verification that other skills in the suite depend on. Install this first when adopting
the Neon Agentic Suite.

## Usage

```
/cv <sub-command> [arguments]
```

## Sub-Commands

| Command | CJK | Logic | Trigger |
|---------|-----|-------|---------|
| `/cv hash` | 哈希 | file→SHA256(content) | Explicit |
| `/cv verify` | 検証 | file×hash→match✓∨mismatch✗ | Explicit |
| `/cv tag` | 標記 | file→severity∈{critical,important,minor} | Explicit |
| `/cv packet` | 包装 | files[]→{path,hash,severity,timestamp}[] | Explicit |

## Arguments

### /cv hash

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes | File path to hash |
| --algorithm | No | Hash algorithm: `sha256` only (MD5/SHA-1 removed - cryptographically broken) |

### /cv verify

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes | File path to verify |
| hash | Yes | Expected hash value |
| --algorithm | No | Hash algorithm: sha256 only |

### /cv tag

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes | File path to tag |
| severity | No | Severity level: `critical`, `important`, `minor` (auto-detected if omitted) |

### /cv packet

| Argument | Required | Description |
|----------|----------|-------------|
| files | Yes | Comma-separated file paths or glob pattern |
| --name | No | Packet name (default: auto-generated) |
| --include-content | No | Include file content in packet (default: false) |

## Configuration

Configuration is loaded from (in order of precedence):
1. `.openclaw/context-verifier.yaml` (OpenClaw standard)
2. `.claude/context-verifier.yaml` (Claude Code compatibility)
3. Defaults (built-in patterns)

## Core Logic

### Hash Computation

Default algorithm: SHA-256

```
hash(file) = SHA256(file.content)
```

### Severity Classification

Files are auto-classified based on configurable patterns:

| Severity | Default Patterns | Behavior on Change |
|----------|------------------|-------------------|
| critical | `*.env`, `*credentials*`, `*secret*`, project config | Block operation |
| important | `*.go`, `*.ts`, `*.md` (in docs/) | Warn user |
| minor | `*.log`, `*.tmp`, `output/*` | Info only |

Critical file patterns are configurable via `.openclaw/context-verifier.yaml`:

```yaml
# .openclaw/context-verifier.yaml
critical_patterns:
  - "*.env"
  - "*credentials*"
  - "*secret*"
  - "CLAUDE.md"     # Claude Code projects
  - "AGENTS.md"     # OpenClaw projects
  - "pyproject.toml" # Python projects
  - "Cargo.toml"    # Rust projects
```

### Context Packet Structure

```json
{
  "id": "PKT-20260215-001",
  "created": "2026-02-15T10:30:00Z",
  "files": [
    {
      "path": "src/main.go",
      "hash": "abc123...",
      "severity": "important",
      "size": 1234,
      "modified": "2026-02-15T10:00:00Z"
    }
  ],
  "metadata": {
    "purpose": "pre-refactor snapshot",
    "creator": "context-verifier"
  }
}
```

## Output

### /cv hash output

```
[HASH] src/main.go
Algorithm: SHA-256
Hash: a1b2c3d4e5f6...
Size: 1,234 bytes
Modified: 2026-02-15 10:00:00
```

### /cv verify output (match)

```
[VERIFY] src/main.go
Status: ✓ MATCH
Expected: a1b2c3d4e5f6...
Actual:   a1b2c3d4e5f6...
```

### /cv verify output (mismatch)

```
[VERIFY] src/main.go
Status: ✗ MISMATCH
Expected: a1b2c3d4e5f6...
Actual:   x9y8z7w6v5u4...

WARNING: File has changed since last read.
Action: Re-read file before making changes.
```

### /cv tag output

```
[TAG] src/main.go
Severity: important
Reason: Go source file
Behavior: Warn on unexpected change
```

### /cv packet output

```
[PACKET CREATED]
ID: PKT-20260215-001
Files: 5
Total size: 12,345 bytes

Files included:
- src/main.go (important) - a1b2c3...
- src/handler.go (important) - d4e5f6...
- .env (critical) - g7h8i9...
- docs/README.md (important) - j0k1l2...
- output/log.txt (minor) - m3n4o5...

Stored: output/context-packets/PKT-20260215-001.json
```

## Integration

- **Layer**: Foundation (no dependencies)
- **Depends on**: None (foundational verification system)
- **Used by**: failure-memory (for file change detection), constraint-engine (for pre-action checks)

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: {path}" |
| Permission denied | Error: "Cannot read file: {path}" |
| Invalid hash format | Error: "Invalid hash format. Expected: {algorithm}" |
| Glob matches no files | Warning: "No files match pattern: {glob}" |

## Next Steps

After invoking this skill:

| Condition | Action |
|-----------|--------|
| Hash mismatch | Alert user, suggest re-read of file |
| Critical file changed | Block operation, require verification |
| Packet created | Store in `output/context-packets/` for audit |

## Workspace Files

This skill reads/writes:

```
output/
└── context-packets/
    └── PKT-YYYYMMDD-XXX.json
```

## Examples

### Verify file before editing

```
/cv hash src/main.go
# Save hash: a1b2c3d4e5f6...

# ... later, before editing ...

/cv verify src/main.go a1b2c3d4e5f6
# ✓ MATCH - safe to edit
```

### Create context packet for refactoring

```
/cv packet src/*.go,internal/**/*.go --name "pre-refactor"
# Creates packet with all Go files

# ... after refactoring ...

# Can compare against packet to see what changed
```

### Tag sensitive files

```
/cv tag .env
# Severity: critical

/cv tag src/handler.go
# Severity: important
```

### Verify database migration before deployment

```
/cv packet db/migrations/*.sql --name "pre-deploy-migrations"
# Creates packet with all migration files

# After staging deployment...
/cv verify db/migrations/001_users.sql abc123...
# ✓ MATCH - migration file unchanged, safe to deploy to production
```

### Create API schema verification packet

```
/cv packet api/schemas/*.json,api/openapi.yaml --name "api-schema-v2"
# Creates packet with all API schema files for version control
```

## Acceptance Criteria

- [ ] `/cv hash` computes SHA-256 hash of file
- [ ] `/cv verify` compares file hash against expected value
- [ ] `/cv verify` clearly indicates match/mismatch
- [ ] `/cv tag` auto-classifies file severity based on patterns
- [ ] `/cv tag` allows manual severity override
- [ ] `/cv packet` creates JSON packet with file metadata
- [ ] `/cv packet` supports glob patterns
- [ ] Critical file changes trigger block behavior
- [ ] Workspace files stored in documented location

---

*Consolidated from 3 skills as part of agentic skills consolidation (2026-02-15).*
