---
name: context-packet
version: 2.0.0
description: Generate signed, auditable context packets for review workflows
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, audit, signing]
layer: foundation
status: active
---

# context-packet

Generate signed, auditable context packets that capture file state for reproducible reviews.
Context packets provide cryptographic hashes for file identity verification and Ed25519
signatures for authenticity verification.

> **Security Note (v2.0)**: Context packets are now signed by default using Ed25519.
> They verify both file *identity* (content hash) and *authenticity* (who created the packet).
> Use `--unsigned` for legacy unsigned packets if needed.

## Usage

```
/context-packet <file1> [file2] [file3] ...
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| files | Yes | One or more file paths to include in packet |
| --output | No | Output file path (default: context-packet-TIMESTAMP.json) |
| --algorithm | No | Hash algorithm: sha256 (default), md5 (deprecated), both |
| --unsigned | No | Create unsigned packet (legacy compatibility) |
| --key | No | Signing key path (default: auto-generated session key) |

## Signing Commands

```
/context-packet rotate-key --reason "scheduled"   # Rotate signing key
/context-packet verify <packet-file>              # Verify packet signature
/context-packet list-keys                         # Show available keys
```

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
  "tool_version": "context-packet-2.0.0",
  "signature": {
    "algorithm": "Ed25519",
    "public_key": "base64-encoded-public-key...",
    "value": "base64-encoded-signature...",
    "signed_at": "2026-02-13T10:30:00Z",
    "key_id": "session-abc123"
  }
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
| Permission denied (read) | Error entry for that file, continues with others |
| Output path not writable | Error: "Cannot write to output path: <path>" |
| Binary file | Includes hashes but marks as binary (no line count) |

## Key Management

| Aspect | Strategy |
|--------|----------|
| Generation | Auto-generate on first use (`~/.claude/keys/signing.key`) |
| Storage | OS keychain preferred; fallback to encrypted file with passphrase |
| Rotation | Manual trigger: `/context-packet rotate-key --reason "scheduled"` |
| Revocation | Add revoked keys to `.revoked-keys.json`; verifiers reject |
| Distribution | Public keys embedded in signed packets; project keys in `.claude/project-keys/` |

## First Run Experience

On first `/context-packet` invocation:

1. **Key Generation**: System auto-generates Ed25519 keypair
2. **Storage Attempt**: Try OS keychain (macOS Keychain, Windows Credential Manager)
3. **Fallback**: If keychain unavailable, prompt: "Keychain not available. Enter passphrase for encrypted key file:"
4. **Success Message**: "Signing key generated and stored. Future packets will be signed automatically."
5. **Key ID Display**: "Key ID: session-abc123 (use for verification)"

**First Run Output**:
```
First-time setup: Generating signing key...
✓ Ed25519 keypair generated
✓ Stored in OS keychain
✓ Key ID: session-abc123

Ready to create signed packets. Run /context-packet --help for usage.
```

**Keychain Failure**:
```
First-time setup: Generating signing key...
✓ Ed25519 keypair generated
⚠ OS keychain not available

Enter passphrase for encrypted key file:
(passphrase will be required on each signing operation)
```

## Security Considerations

**MD5 Deprecation**: MD5 is collision-prone and unsuitable for security-critical verification.
Use `--algorithm sha256` (now the default). MD5 support is retained only for compatibility
with legacy systems.

**Ed25519 Signing (v2.0)**: Packets are now signed by default. The signature proves:
1. **Provenance**: Which agent/session created the packet
2. **Integrity**: Packet has not been modified since signing
3. **Non-repudiation**: Creator cannot deny generating the packet

**Threat Model**: For a 2-person team, the primary need is provenance (source tracking).
Ed25519 signing also provides integrity for future multi-user scenarios and audit compliance.

**Key Compromise Response** (Break-Glass Procedure):

If a private key is suspected compromised:

1. **Immediate**: Revoke the key by adding to `.revoked-keys.json`
2. **Rotate**: Generate new key with `/context-packet rotate-key --reason "compromise"`
3. **Audit**: Run `/context-packet audit-signatures` to verify historical packets
4. **Invalidate**: Mark all signatures from the compromised key as untrusted
5. **Regenerate**: If critical, regenerate affected packets with new key

**Audit Command**:
```
/context-packet audit-signatures --key <key-id>    # Verify packets from specific key
/context-packet audit-signatures --since <date>   # Verify packets after date
```

**File-Based Revocation Limitations**: The `.revoked-keys.json` approach has race conditions
(verifier may not see updated file immediately). For a 2-person team this is acceptable.
For enterprise use, consider CRL distribution or online verification.

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
- [ ] Ed25519 signatures valid (v2.0)
- [ ] Key rotation works without data loss
- [ ] Signature verification rejects tampered packets

## Next Steps

After creating/modifying this skill:

1. **Update ARCHITECTURE.md** - Add to Foundation layer table if new skill
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
