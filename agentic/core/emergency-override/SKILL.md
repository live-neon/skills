---
name: emergency-override
version: 1.0.0
description: Temporary bypass of constraints with human approval and audit trail
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, memory, core, safety, override, emergency]
---

# emergency-override

Temporarily bypass constraints or tripped circuits with explicit human approval
and full audit trail. This skill ensures AI cannot self-approve bypasses while
providing a safety valve for legitimate emergencies.

## Trust Boundary

**Critical Design Principle**: AI CANNOT self-approve overrides.

The challenge: In a REPL where AI generates text, how do we distinguish human
terminal input from AI-generated "APPROVE" strings?

**Solution**: Challenge-response with random token generated AFTER AI's last
response. The token is invisible to the AI context, requiring out-of-band
human action (reading screen, typing token).

## Usage

```
/emergency-override create <constraint-id> --reason "<text>" [--duration <time>]
/emergency-override list [--active | --expired | --all]
/emergency-override revoke <override-id>
/emergency-override history [--constraint <id>] [--days <n>]
/emergency-override status <override-id>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: create, list, revoke, history, status |
| constraint-id | Yes* | Constraint to override (*for create only) |
| --reason | Yes* | Explanation for override (*for create only) |
| --duration | No | Override duration (default: 1h, max: 24h) |
| --active | No | Show only active overrides |
| --expired | No | Show only expired overrides |
| --all | No | Show all overrides including revoked |
| --days | No | Limit history to N days (default: 30) |

## Duration Format

| Format | Example | Meaning |
|--------|---------|---------|
| `Nm` | `30m` | 30 minutes |
| `Nh` | `2h` | 2 hours |
| `Nd` | `1d` | 1 day (24 hours, maximum) |

## Example

```bash
# Request an emergency override (requires human approval)
/emergency-override create git-safety-force-push --reason "Production hotfix" --duration 1h

# List active overrides
/emergency-override list

# Revoke an override before use
/emergency-override revoke override-2026-02-13-001

# View override history
/emergency-override history --days 7
```

## Output

**See `EXAMPLES.md` for detailed output examples.**

Brief summaries:

| Command | Output |
|---------|--------|
| `create` (request) | Shows constraint severity, displays challenge token prompt |
| `create` (approved) | Confirms override ID, expiry, single-use status |
| `create` (denied) | Confirms denial, logs audit entry |
| `create` (timeout) | Auto-denies after 5 minutes |
| `list` | Shows active/expired/all overrides with status |
| `revoke` | Confirms revocation, logs audit entry |
| `history` | Lists all overrides with final status (USED/REVOKED/EXPIRED) |

## Override Lifecycle

```
REQUESTED ──► APPROVED ──► ACTIVE ──► USED/EXPIRED/REVOKED
     │            │
     │            └──► DENIED (human typed DENY)
     │
     └──► TIMEOUT (no response in 5 min)
```

## States

| State | Description | Can Be Used |
|-------|-------------|-------------|
| REQUESTED | Awaiting human approval | No |
| APPROVED | Human approved, not yet active | No (transition state) |
| ACTIVE | Valid and ready for use | Yes |
| USED | Consumed by one bypass | No |
| EXPIRED | Duration elapsed | No |
| REVOKED | Manually cancelled | No |
| DENIED | Human rejected request | No |
| TIMEOUT | No response in time | No |

## Safety Requirements

| Requirement | Implementation |
|-------------|----------------|
| Human approval | Challenge-response with random token |
| Maximum duration | 24 hours (enforced at creation) |
| Single-use default | Override consumed after one bypass |
| Audit trail | All state changes logged with who/when/why |
| Token security | Generated AFTER AI response, 6 alphanumeric chars |
| Timeout | 5 minutes to respond, auto-deny on timeout |
| AI bypass prevention | Token invisible to AI context window |

## Challenge-Response Protocol

```
1. AI requests override via /emergency-override create
2. System generates random 6-character token: "X7K9M2"
   - Token created AFTER AI's last response
   - Token NOT echoed to AI context
3. System displays prompt to terminal:
   "To approve, type this exact code: X7K9M2"
4. Human reads screen and types token
5. System validates exact match (case-sensitive)
6. If match: override approved, audit logged
   If mismatch: retry allowed (max 3 attempts)
   If timeout: auto-denied, audit logged
```

**Why This Works**:
- Token is generated AFTER AI's last response
- Token is displayed to terminal only (not to AI)
- AI cannot predict or reproduce the random token
- Requires out-of-band human action (reading screen, typing)

## Token Generation

```
Algorithm:
1. Generate 6 random alphanumeric characters (A-Z, 0-9)
2. Exclude ambiguous characters (O, 0, I, 1, L) for readability
3. Store token hash (not plaintext) for validation
4. Token valid for 5 minutes only
```

**Character Set**: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (31 chars, no ambiguous)

## Override File Format

```json
{
  "overrides": [
    {
      "id": "override-2026-02-13-001",
      "constraint_id": "git-safety-force-push",
      "reason": "Emergency hotfix deployment",
      "approval_method": "challenge_response",
      "approval_timestamp": "2026-02-13T10:30:00Z",
      "approved_by": "human_terminal",
      "created": "2026-02-13T10:30:00Z",
      "expires": "2026-02-13T11:30:00Z",
      "duration_seconds": 3600,
      "single_use": true,
      "state": "ACTIVE",
      "used": false,
      "used_at": null,
      "used_for": null,
      "revoked_at": null,
      "revoked_by": null
    }
  ],
  "audit": [
    {
      "timestamp": "2026-02-13T10:30:00Z",
      "override_id": "override-2026-02-13-001",
      "action": "approved",
      "who": "human_terminal",
      "method": "challenge_response",
      "details": "Token X7K9M2 verified"
    }
  ]
}
```

## Approval Methods

| Method | Security | Use Case |
|--------|----------|----------|
| `challenge_response` | High | Default - random token typed by human |
| `signed_token` | High | Pre-generated token from external auth system |

**Default**: `challenge_response` - recommended for all environments.

**Security Note**: Time-based approval methods (e.g., auto-accept after delay) are
intentionally NOT supported. Such methods would allow AI self-approval, undermining
the core security guarantee that "AI CANNOT self-approve overrides."

## Integration

- **Layer**: Core
- **Depends on**: constraint-enforcer (checks if override exists), circuit-breaker (can bypass tripped circuits)
- **Used by**: Workflow skills that need emergency bypass

## Integration with constraint-enforcer

When constraint-enforcer checks an action:

```
1. constraint-enforcer receives action to check
2. Before blocking, checks .overrides.json for active override:
   - constraint_id matches
   - state = ACTIVE
   - expires > now
   - used = false (if single_use)
3. If valid override found:
   - Allow action
   - Mark override as used (used=true, used_at=now, used_for=action)
   - Log to audit trail
4. If no valid override:
   - Normal enforcement (block or warn)
```

## Integration with circuit-breaker

When circuit is OPEN:

```
1. Action would normally be blocked
2. Check for active override on the constraint
3. If valid override:
   - Allow single action through
   - Override consumed
   - Circuit remains OPEN (override doesn't reset circuit)
4. Log bypass to circuit history
```

## Atomic File Updates

Override file updates use atomic write-and-rename pattern:
1. Write to `.overrides.json.tmp`
2. Rename to `.overrides.json` (atomic on POSIX)
3. For concurrent access: retry with exponential backoff

## Concurrent State Transitions

**Implementation Requirement** (from N=2 code review):

When implementing state transitions, ensure atomicity to prevent race conditions:

1. **Read-Modify-Write**: Use compare-and-swap semantics
   - Read current state and version
   - Calculate new state
   - Write only if version unchanged, else retry

2. **State Transition Guards**: Lock during transition
   - REQUESTED → APPROVED: only one approval per override
   - ACTIVE → USED: only one consumption per override
   - Prevent double-use from concurrent requests

3. **Testing**: Include race condition tests
   - Simulate concurrent approval attempts
   - Verify override consumed exactly once

**Reference**: `docs/issues/2026-02-13-phase2-code-review-remediation.md` Finding 6

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Constraint not found | Error: "Constraint not found: <id>" |
| Override already exists | Error: "Active override already exists for <id>" |
| Duration exceeds 24h | Error: "Maximum duration is 24 hours" |
| Invalid token | "Invalid code. X attempts remaining." |
| Token timeout | Auto-deny after 5 minutes |
| Override expired | Error: "Override has expired" |
| Override already used | Error: "Override already consumed" |
| Override revoked | Error: "Override was revoked" |
| File locked | Retry with backoff (3 attempts) |

## Acceptance Criteria

- [x] Creates override with expiry
- [x] Requires human approval (challenge-response)
- [x] Single-use override consumed after use
- [x] Expired overrides rejected
- [x] Full audit trail maintained
- [x] Maximum 24h duration enforced
- [x] Token generation secure and unpredictable
- [x] Timeout auto-denies request
- [x] Revocation works for unused overrides
- [x] Integration with constraint-enforcer
- [x] Integration with circuit-breaker

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
