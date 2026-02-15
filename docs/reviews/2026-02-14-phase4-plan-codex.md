# Phase 4 Implementation Plan Review - Codex

**Date**: 2026-02-14
**Reviewer**: 審碼 (codex-gpt51-examiner)
**Model**: gpt-5.1-codex-max
**Files Reviewed**:
- `../plans/2026-02-14-agentic-skills-phase4-implementation.md` (primary)
- `output/context/2026-02-14-phase4-implementation-context.md` (context)
- `../proposals/2026-02-13-agentic-skills-specification.md` (lines 593-646)
- `projects/live-neon/neon-soul/docs/research/cryptographic-audit-chains.md`
- `projects/live-neon/skills/ARCHITECTURE.md`

## Summary

Phase 4 plan is comprehensive in scope (8 core skills + 3 additions) but has critical gaps in dependency ordering, research gate resolution strategy, and implementation details for security-sensitive features (packet signing, multi-agent coordination). The plan would benefit from tighter stage sequencing and explicit handling for unresolved research gates before downstream skills depend on them.

## Findings

### Critical

**1. Dependency/Stage Mismatch (plan lines 435-547, 659-750)**

`index-generator` (Stage 3) depends on 90-day review decisions from `constraint-reviewer` (Stage 2), but the dependency table at line 197 lists `governance-state` and `constraint-lifecycle` without including `constraint-reviewer`. This underspecifies the pipeline for reviewed constraints flowing into dashboards.

Similarly, `cache-validator` (Stage 5) consumes `context-packet`, but packet signing/verification is deferred to Stage 6. This creates a sequencing gap where cache-validator may process unsigned packets during implementation, then need rework when signing is added.

**Recommendation**: Either reorder stages (packet signing before cache-validator) or explicitly document that cache-validator will initially work with unsigned packets and be updated post-Stage 6.

---

**2. Multi-Agent Coordination Unresolved (RG-2) - plan lines 314-321**

The plan acknowledges RG-2 is GAP status but proceeds with a "file-based locking with 5-second timeout" strategy. This is insufficient for concurrent writers:

- No atomic write guarantee
- No lease/heartbeat mechanism
- Risk of split-brain state and lost updates
- 5-second timeout may cause cascading failures under load

Downstream skills (`constraint-reviewer`, `index-generator`) will rely on `governance-state` being consistent. If RG-2 remains unresolved, any multi-agent scenario risks corrupted state.

**Recommendation**: Either:
1. Complete RG-2 research before Stage 1 (recommended)
2. Explicitly restrict governance-state to single-agent mode with enforcement (acceptable for v1)
3. Use proven coordination mechanism (SQLite, advisory locks) instead of custom file locking

---

### Important

**3. Safety Chain Fail-Closed Behavior Missing (plan lines 550-656)**

`fallback-checker` depends on `model-pinner`, but the plan does not specify:
- What happens if pinning is absent or stale?
- Should the system fail closed (block) or open (warn)?
- How is fallback graph coverage verified per skill?

`adoption-monitor` depends on `effectiveness-metrics` but no ingestion path is described.

**Recommendation**: Add explicit failure modes to each safety skill specification. Default should be fail-closed for safety-critical paths.

---

**4. Packet Signing Lacks Key Management (plan lines 758-789)**

Ed25519 signing is specified, but critical operational concerns are missing:
- Key storage location and format
- Key rotation procedure
- Key revocation (compromised key scenario)
- Trust distribution to verifiers
- Signature binding to `schema_version` (for migration safety)

**Recommendation**: Add a "Key Management" subsection to Stage 6A covering these concerns. Reference RG-7 research which already distinguishes provenance from integrity requirements.

---

**5. Version Migration Strategy Incomplete (plan lines 816-843)**

The plan specifies `schema_version` field and migration history, but lacks:
- Migration tooling (how to run migrations?)
- Forward/backward compatibility rules (can v1.1 read v1.0?)
- Validation tests for migration correctness
- Fallback behavior for unknown versions

**Recommendation**: Add migration tooling specification or explicitly defer to a follow-up task with entry/exit criteria (similar to RG-6 pattern from Phase 3).

---

**6. Observability Scope Undefined (plan lines 793-815)**

Observability is listed as a "Review-Identified Addition" but:
- No specific signals/events defined
- No sink specification (where do metrics go?)
- No SLO targets
- Governance dashboards depend on this but no schema is provided

**Recommendation**: Either scope down to "health metrics in governance-state dashboard" (as partially specified) or create explicit observability specification if broader scope intended.

---

**7. RG-4 Unresolved with No Mitigation (plan lines 136-148, 359-367)**

The plan proceeds with arbitrary 90-day review cadence despite RG-4 being GAP. No mitigation strategies are proposed:
- No decay signal monitoring
- No drift scoring
- No adaptive scheduling based on constraint activity

**Recommendation**: At minimum, document the 90-day cadence as provisional with explicit exit criteria. Consider adding simple decay signals (e.g., "dormant >60 days" already in dashboard) as mitigation.

---

### Minor

**8. Timeline Aggressive (plan lines 995-1018)**

2-3 days serial for 8 core skills + 3 additions + 7 integration scenarios is ambitious given:
- Governance-state concurrency issues need resolution
- Packet signing needs key management
- Version migration needs tooling
- Observability needs scoping

Each of these typically requires deeper validation and soak time.

**Recommendation**: Consider adding 0.5-1 day buffer or explicitly document which items can be deferred to post-Phase 4 follow-up.

---

**9. Integration Tests Lack Negative Cases (plan lines 860-968)**

The 7 scenarios cover happy paths but omit:
- Lock contention handling (concurrent writers)
- Signature failure (tampered packet)
- Migration rollback (version downgrade)
- Cache invalidation race conditions

Pass/fail criteria and fixtures (signed packets, stale caches, concurrent writer simulation) are not specified.

**Recommendation**: Add at least 2-3 negative test scenarios, particularly for packet signing verification failure and governance-state lock contention.

---

**10. Cleanup/Maintenance Commands Missing (specification line 619)**

The specification mentions "Cleanup/Maintenance commands" deferred from Phase 2 Twin Review (Finding 9), but this is not addressed in the Phase 4 plan. This may be needed for governance-state hygiene:
- Retired constraint cleanup
- Key rotation automation
- Index rebuild scheduling

**Recommendation**: Either add to Stage 6 "Review-Identified Additions" or explicitly note as deferred to Phase 5/6.

---

## Alternative Framing: Are We Solving the Right Problem?

**Observation**: The RG-7 research document (`cryptographic-audit-chains.md`) explicitly states:

> "NEON-SOUL primarily needs **provenance**. Integrity is a nice-to-have for transparency but not critical for the use case."

The packet signing implementation proposes Ed25519 signatures (cryptographic integrity) when the research suggests provenance (source tracking) is the actual need. This creates a potential over-engineering risk:

- Ed25519 requires key management infrastructure
- Provenance-only would require simpler source references

**Question to consider**: Is packet signing solving the right problem? The threat model in ARCHITECTURE.md (line 344) lists "adversarial tampering" as something we do NOT protect against. If the trust assumption is "AI is confused, not malicious," why add cryptographic signing?

**Counter-argument**: Packet signing may be appropriate for:
1. Future multi-user scenarios
2. Audit compliance requirements
3. Defense in depth

**Recommendation**: Clarify the threat model packet signing addresses. If it's primarily provenance, consider simpler implementation. If it's integrity against future threats, document that rationale.

---

## Raw Output

<details>
<summary>Full CLI output</summary>

```
**Findings**
- **Critical** – Dependency/stage mismatch: `index-generator` depends on the 90-day decisions from `constraint-reviewer`, but it's scheduled in Stage 3 alongside `round-trip-tester` while `constraint-reviewer` is Stage 2; also its table lists `governance-state` + `constraint-lifecycle` but not `constraint-reviewer`, so the pipeline for reviewed constraints/dashboards is underspecified. Likewise, `cache-validator` consumes `context-packet` yet packet-signing/verif is deferred to Stage 6, creating a sequencing gap for signed/validated packets.
- **Critical** – Governance-state multi-agent coordination unresolved (RG-2 still GAP): file-based locking + 5s timeout is not safe for concurrent writers without atomic writes/leases; risk of split-brain state and lost updates is unaddressed before downstream skills (constraint-reviewer/index-generator) rely on it.
- **Important** – Safety chain correctness: `fallback-checker` depends on `model-pinner`, but no plan to fail closed if pinning is absent/stale, nor to verify fallback graph coverage per skill; adoption-monitor depends on `effectiveness-metrics` yet no ingestion path is described.
- **Important** – Packet signing lacks key management: Ed25519 signing is called out, but key storage, rotation, revocation, and trust distribution to verifiers are not specified; no plan for signature binding to schema_version/migrations.
- **Important** – Version migration strategy too thin: "schema_version in all state files + history" lacks migration tooling, forward/backward compatibility rules, validation tests, and fallback behavior when unknown versions appear.
- **Important** – Observability/Metrics addition is listed but not scoped (which signals/events, sinks, SLOs, dashboards). Governance dashboards depend on it but no schema or pipeline is defined.
- **Important** – RG-4 unresolved but constraint-reviewer proceeds with arbitrary 90-day cadence; no mitigation (e.g., decay signals, drift scoring, adaptive scheduling) is proposed before rollout.
- **Minor** – Timeline (2–3 days serial for 8 core skills + 3 additions + 7 integration scenarios) is aggressive; governance-state concurrency, signing, migrations, and observability typically need deeper validation and soak.
- **Minor** – Integration tests list scenarios but omit pass/fail criteria, fixtures (signed packets, stale caches, concurrent writers), and negative cases (lock contention, signature failure, migration rollback).
- **Minor** – "Cleanup/Maintenance commands" deferred in Phase 2 still not planned; may be needed for governance-state hygiene (retired constraints cleanup, key rotation).
```

**CLI Session Details**:
- Model: gpt-5.1-codex-max
- Sandbox: read-only
- Reasoning effort: xhigh
- Tokens used: 2,628

</details>

---

*Review generated 2026-02-14 by 審碼 (codex-gpt51-examiner) as part of N=2 code review.*
