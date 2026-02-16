---
created: 2026-02-15
type: plan
status: draft
priority: medium
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-14-agentic-skills-phase5-implementation.md
depends_on:
  - ../plans/2026-02-14-agentic-skills-phase5-implementation.md
blocked_by:
  - 2026-02-15-agentic-skills-consolidation.md
related_guides:
  - "[multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md"
external_dependencies:
  - https://docs.openclaw.ai/tools/clawhub
  - https://github.com/openclaw/clawhub
---

# Phase 5B: ClawHub Integration Implementation

## Summary

Replace mock adapters with real ClawHub API integration for the Bridge layer.
This enables the constraint/observation system to communicate with ClawHub's
`self-improving-agent`, `proactive-agent`, and VFM system.

**Duration**: 2-3 days
**Prerequisites**: Consolidation plan complete, ClawHub API access
**Blocked by**: `2026-02-15-agentic-skills-consolidation.md`
**Output**: Real adapters in `agentic/clawhub-bridge/adapters/`, integration tests passing

> **Note**: This plan should execute AFTER the consolidation plan. Post-consolidation,
> the 5 bridge skills become 1 `clawhub-bridge` skill with 5 sub-commands. The adapter
> code remains the same; only the SKILL.md organization changes.

## Why This Matters

The Bridge layer currently uses mock adapters that simulate ClawHub behavior. While this
enabled development and contract testing, the skills provide no real value until connected
to actual ClawHub components. Phase 5B completes the integration story.

**Current state**: 5 Bridge skills with 31 contract tests passing against mocks
**Target state**: Same skills working with live ClawHub APIs

---

## Prerequisites

Before starting implementation:

1. **Consolidation complete**: `2026-02-15-agentic-skills-consolidation.md` executed
2. **ClawHub API access**: Valid authentication token in `.env`
3. **API documentation**: Endpoints for self-improving-agent, proactive-agent, VFM
4. **Test environment**: ClawHub staging/sandbox environment for integration tests

### Verification

```bash
# Verify ClawHub CLI is available
openclaw --version

# Verify API access
curl -H "Authorization: Bearer $CLAWHUB_TOKEN" https://api.clawhub.ai/health
```

---

## Stage 1: API Discovery and Interface Validation

**Duration**: 0.5 day
**Goal**: Document actual ClawHub APIs and validate current interfaces match

### Tasks

1. **Document ClawHub APIs**
   - Fetch OpenAPI/schema for self-improving-agent endpoints
   - Fetch OpenAPI/schema for proactive-agent endpoints
   - Fetch OpenAPI/schema for VFM system endpoints
   - Create `docs/references/clawhub-api-mapping.md`

2. **Compare interfaces**
   - Validate `Learning` / `LearningsExport` against self-improving-agent API
   - Validate `WALEntry` / `WALFailure` / `HealthAlert` against proactive-agent API
   - Validate `VFMScore` / `VFMRanking` against VFM system API
   - Document any mismatches in interface-audit.md

3. **Decision point**: Interface changes required?
   - If yes: Create interface migration subtask
   - If no: Proceed to Stage 2

### Acceptance Criteria

- [ ] ClawHub API endpoints documented
- [ ] Interface comparison table created
- [ ] Decision on interface changes recorded

### Files Created/Modified

- `docs/references/clawhub-api-mapping.md` (new)
- `docs/references/interface-audit.md` (new)

---

## Stage 2: Real Adapter Implementation - self-improving-agent

**Duration**: 0.5 day
**Goal**: Implement real adapter for self-improving-agent

### Tasks

1. **Create real adapter**
   - Create `agentic/bridge/adapters/real-self-improving-agent.ts`
   - Implement `consumeLearnings(export: LearningsExport): Promise<void>`
   - Implement `queryLearnings(query: LearningsQuery): Promise<Learning[]>`
   - Add authentication handling (Bearer token from env)
   - Add error handling and retries

2. **Update factory**
   - Modify `factory.ts` to return real adapter when `BRIDGE_ADAPTER_MODE=real`
   - Add adapter availability check via health endpoint

3. **Integration tests**
   - Create `tests/integration/self-improving-agent.integration.test.ts`
   - Test learnings export to real API
   - Test learnings query from real API
   - Skip in CI without credentials

### Acceptance Criteria

- [ ] `real-self-improving-agent.ts` implemented
- [ ] Factory returns real adapter when mode=real
- [ ] Integration tests pass with live API

### Files Created/Modified

- `agentic/bridge/adapters/real-self-improving-agent.ts` (new)
- `agentic/bridge/adapters/factory.ts` (modify)
- `tests/integration/self-improving-agent.integration.test.ts` (new)

---

## Stage 3: Real Adapter Implementation - proactive-agent

**Duration**: 0.5 day
**Goal**: Implement real adapter for proactive-agent

### Tasks

1. **Create real adapter**
   - Create `agentic/bridge/adapters/real-proactive-agent.ts`
   - Implement `parseWAL(path: string): Promise<WALEntry[]>`
   - Implement `sendHealthAlert(alert: HealthAlert): Promise<void>`
   - Implement `getHealthSummary(): Promise<HealthCheckSummary>`
   - Add WAL file watching capability

2. **Update factory**
   - Add proactive-agent to real adapter routing

3. **Integration tests**
   - Create `tests/integration/proactive-agent.integration.test.ts`
   - Test WAL parsing with real proactive-agent WAL format
   - Test health alert sending
   - Test health summary retrieval

### Acceptance Criteria

- [ ] `real-proactive-agent.ts` implemented
- [ ] WAL parsing matches actual proactive-agent format
- [ ] Integration tests pass with live API

### Files Created/Modified

- `agentic/bridge/adapters/real-proactive-agent.ts` (new)
- `agentic/bridge/adapters/factory.ts` (modify)
- `tests/integration/proactive-agent.integration.test.ts` (new)

---

## Stage 4: Real Adapter Implementation - VFM System

**Duration**: 0.5 day
**Goal**: Implement real adapter for VFM system

### Tasks

1. **Create real adapter**
   - Create `agentic/bridge/adapters/real-vfm-system.ts`
   - Implement `submitScore(score: VFMScore): Promise<void>`
   - Implement `submitRanking(ranking: VFMRanking): Promise<void>`
   - Implement `getWeights(): Promise<VFMWeights>`

2. **Update factory**
   - Add VFM system to real adapter routing
   - Complete `isRealAdapterAvailable()` implementation

3. **Integration tests**
   - Create `tests/integration/vfm-system.integration.test.ts`
   - Test score submission
   - Test ranking export
   - Test weight retrieval

### Acceptance Criteria

- [ ] `real-vfm-system.ts` implemented
- [ ] Score submission accepted by VFM API
- [ ] Integration tests pass with live API

### Files Created/Modified

- `agentic/bridge/adapters/real-vfm-system.ts` (new)
- `agentic/bridge/adapters/factory.ts` (modify)
- `tests/integration/vfm-system.integration.test.ts` (new)

---

## Stage 5: End-to-End Integration Testing

**Duration**: 0.5 day
**Goal**: Verify complete data flow through all Bridge skills with real APIs

### Tasks

1. **E2E test scenarios**
   - Create `tests/e2e/bridge-integration.e2e.test.ts`
   - Scenario 1: Observation N≥3 → learnings-n-counter → self-improving-agent
   - Scenario 2: Constraint gap → feature-request-tracker → proactive-agent
   - Scenario 3: WAL failure → wal-failure-detector → failure pattern
   - Scenario 4: Constraint check → heartbeat-constraint-check → health alert
   - Scenario 5: Constraint scoring → vfm-constraint-scorer → VFM ranking

2. **Documentation updates**
   - Update ARCHITECTURE.md Bridge layer section
   - Remove "mock adapter" caveats
   - Add ClawHub configuration section

3. **Environment setup**
   - Create `.env.clawhub.example` with required variables
   - Document required ClawHub permissions/scopes

### Acceptance Criteria

- [ ] All 5 E2E scenarios pass
- [ ] ARCHITECTURE.md updated
- [ ] Environment setup documented

### Files Created/Modified

- `tests/e2e/bridge-integration.e2e.test.ts` (new)
- `ARCHITECTURE.md` (modify)
- `.env.clawhub.example` (new)

---

## Stage 6: Verification and Cleanup

**Duration**: 0.5 day
**Goal**: Final verification and documentation

### Tasks

1. **Run full test suite**
   ```bash
   # Contract tests (should still pass with mocks)
   BRIDGE_ADAPTER_MODE=mock npm test

   # Integration tests (requires credentials)
   BRIDGE_ADAPTER_MODE=real npm run test:integration

   # E2E tests
   BRIDGE_ADAPTER_MODE=real npm run test:e2e
   ```

2. **Update deferred items**
   - Remove Phase 5B items from specification deferred list
   - Update Phase 5 results file

3. **Create results file**
   - Document what was implemented
   - Note any API differences discovered
   - List remaining items (if any)

### Acceptance Criteria

- [ ] All tests pass (mock and real modes)
- [ ] Deferred items updated
- [ ] Results file created

### Files Created/Modified

- `docs/implementation/agentic-phase5b-results.md` (new)
- `docs/proposals/2026-02-13-agentic-skills-specification.md` (modify)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ClawHub API differs from interfaces | Medium | High | Stage 1 discovers early; interface adapter pattern |
| API rate limits | Low | Medium | Add rate limiting to real adapters |
| Authentication complexity | Medium | Medium | Document OAuth/token flow clearly |
| WAL format changes | Medium | Medium | Flexible parser, version field |

---

## Timeline

| Stage | Duration | Cumulative | Description |
|-------|----------|------------|-------------|
| Stage 1 | 0.5 day | 0.5 day | API discovery, interface validation |
| Stage 2 | 0.5 day | 1 day | self-improving-agent adapter |
| Stage 3 | 0.5 day | 1.5 days | proactive-agent adapter |
| Stage 4 | 0.5 day | 2 days | VFM system adapter |
| Stage 5 | 0.5 day | 2.5 days | E2E integration testing |
| Stage 6 | 0.5 day | 3 days | Verification and cleanup |

**Total**: 2.5-3 days

---

## Success Criteria

- [ ] 3 real adapters implemented (self-improving-agent, proactive-agent, vfm-system)
- [ ] Factory correctly routes to real adapters when `BRIDGE_ADAPTER_MODE=real`
- [ ] Contract tests still pass with mock adapters
- [ ] Integration tests pass with real APIs
- [ ] E2E scenarios verified
- [ ] Documentation updated (no more "mock" caveats in Bridge section)

---

## Out of Scope

The following are explicitly NOT part of Phase 5B:

- **Publishing skills to ClawHub** - Separate plan
- **New Bridge skills** - Only integrating existing 5
- **Multi-agent coordination** - Deferred to RG-2 research
- **VFM weight tuning** - Requires N≥10 usage data

---

## Cross-References

- **Specification**: `../proposals/2026-02-13-agentic-skills-specification.md`
- **Phase 5 Results**: `../implementation/agentic-phase5-results.md`
- **Architecture**: `../../ARCHITECTURE.md` (Bridge Layer section)
- **Interfaces**: `../../agentic/bridge/interfaces/`
- **Adapters**: `../../agentic/bridge/adapters/`

---

*Plan created 2026-02-15. Phase 5B completes the ClawHub integration story.*
