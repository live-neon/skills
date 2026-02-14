---
name: file-verifier
version: 1.0.0
description: Verify file identity via checksum comparison
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, verification]
---

# file-verifier

Verify file identity by comparing checksums. Supports comparing a file to an expected
hash or comparing two files directly. Essential for golden master validation.

## Usage

```
/file-verifier <file> --hash <expected-hash>
/file-verifier <file1> --compare <file2>
/file-verifier --packet <context-packet.json>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| file | Yes* | File path to verify (*not required with --packet) |
| --hash | No | Expected MD5 or SHA256 hash to verify against |
| --compare | No | Second file to compare against |
| --packet | No | Context packet JSON to verify all files |
| --algorithm | No | Hash algorithm: md5, sha256, auto (default: auto) |

## Output

### Single File Verification

```
MATCH: src/main.go
  Algorithm: SHA256
  Hash: abc123def456...
  Status: File matches expected hash

---or---

MISMATCH: src/main.go
  Algorithm: SHA256
  Expected: abc123def456...
  Actual:   xyz789uvw012...
  Status: File has been modified
  Size diff: +15 bytes
  Possible: ~5-10 lines changed (estimate)
```

### File Comparison

```
IDENTICAL: src/main.go == src/main.backup.go
  MD5: abc123...
  SHA256: def456...

---or---

DIFFERENT: src/main.go != src/main.backup.go
  File 1 MD5: abc123...
  File 2 MD5: xyz789...
  Size diff: 150 bytes
```

### Packet Verification

```
PACKET VERIFICATION: context-packet-20260213.json

  ✓ src/handlers.go    MATCH
  ✓ src/services.go    MATCH
  ✗ src/db.go          MISMATCH (modified since packet created)
  ✗ src/deleted.go     MISSING (file no longer exists)

Summary: 2/4 files verified, 1 modified, 1 missing
```

## Example

```
/file-verifier src/main.go --hash abc123def456789

MATCH: src/main.go matches expected hash
  Algorithm: MD5 (auto-detected from hash length)
  Verified at: 2026-02-13T10:30:00Z
```

## Integration

- **Layer**: Foundation
- **Depends on**: None (foundational skill)
- **Used by**: golden-master validation, context-packet verification, constraint-enforcer

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| File not found | Error: "File not found: path/to/file" |
| Invalid hash format | Error: "Invalid hash format. Expected MD5 (32 chars) or SHA256 (64 chars)" |
| Permission denied | Error: "Permission denied: path/to/file" |
| Packet file invalid | Error: "Invalid context packet JSON" |

## Hash Auto-Detection

The algorithm is auto-detected based on hash length:
- 32 characters → MD5
- 64 characters → SHA256

Use `--algorithm` to override if needed.

## Use Cases

1. **Golden Master Validation**: Verify derived files match their source
2. **Review Context Verification**: Ensure reviewers have correct file versions
3. **Deployment Verification**: Confirm deployed files match expected state
4. **Change Detection**: Quick check if a file has been modified

## Acceptance Criteria

- [ ] Correctly identifies matching files
- [ ] Correctly identifies mismatched files
- [ ] Supports both MD5 and SHA256
- [ ] Auto-detects hash algorithm from length
- [ ] Compare mode works between two files
- [ ] Packet verification mode processes all files
- [ ] Clear output distinguishes MATCH/MISMATCH/MISSING
