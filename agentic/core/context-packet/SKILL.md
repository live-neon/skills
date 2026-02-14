---
name: context-packet
version: 1.0.0
description: Generate auditable context packets for review workflows
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, audit]
---

# context-packet

Generate auditable context packets that capture file state for reproducible reviews.
Context packets provide cryptographic verification that reviewers see identical content.

## Usage

```
/context-packet <file1> [file2] [file3] ...
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| files | Yes | One or more file paths to include in packet |
| --output | No | Output file path (default: context-packet-TIMESTAMP.json) |
| --algorithm | No | Hash algorithm: md5, sha256, both (default: both) |

## Output

Creates a JSON file with file metadata and cryptographic hashes:

```json
{
  "generated_at": "2026-02-13T10:30:00Z",
  "packet_id": "cp-20260213-103000-a1b2c3",
  "files": [
    {
      "path": "src/main.go",
      "exists": true,
      "md5": "abc123def456...",
      "sha256": "789ghi012jkl...",
      "lines": 150,
      "bytes": 4250,
      "modified_at": "2026-02-12T15:00:00Z"
    },
    {
      "path": "src/missing.go",
      "exists": false,
      "error": "file not found"
    }
  ],
  "summary": {
    "total_files": 2,
    "found": 1,
    "missing": 1,
    "total_lines": 150,
    "total_bytes": 4250
  },
  "tool_version": "context-packet-1.0.0"
}
```

## Example

```
/context-packet src/handlers.go src/services.go internal/db.go

Generated: context-packet-20260213-103000-a1b2c3.json
Files: 3 (3 found, 0 missing)
Total lines: 450
Total bytes: 12,340

Hashes:
  src/handlers.go   MD5:abc123... SHA256:def456...
  src/services.go   MD5:ghi789... SHA256:jkl012...
  internal/db.go    MD5:mno345... SHA256:pqr678...
```

## Integration

- **Layer**: Foundation
- **Depends on**: None (foundational skill)
- **Used by**: twin-review, cognitive-review, code-review workflows, file-verifier

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No files provided | Error: "At least one file path required" |
| All files missing | Warning + generates packet with all missing entries |
| Permission denied | Error entry for that file, continues with others |
| Binary file | Includes hashes but marks as binary (no line count) |

## Use Cases

1. **Review Reproducibility**: Ensure all reviewers see identical file content
2. **Audit Trail**: Prove what was reviewed at a specific point in time
3. **Change Detection**: Compare packets to detect modifications between reviews
4. **Context Verification**: Validate that loaded context matches expected state

## Acceptance Criteria

- [ ] Generates valid JSON output
- [ ] MD5 and SHA256 hashes are correct (verified with `md5sum`/`shasum`)
- [ ] Timestamps in ISO 8601 format
- [ ] Handles missing files gracefully (reports error, continues with others)
- [ ] Line count accurate for text files
- [ ] Binary files detected and marked appropriately
