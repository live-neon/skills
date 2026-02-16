---
created: 2026-02-14
type: plan
status: complete
priority: low
specification: ../proposals/2026-02-13-agentic-skills-specification.md
previous_phase: ../plans/2026-02-14-agentic-skills-phase4-implementation.md
depends_on:
  - ../plans/2026-02-14-agentic-skills-phase4-implementation.md
related_guides:
  - [multiverse]/artifacts/guides/workflows/AGENTIC_CODING_SYSTEM_ARCHITECTURE_GUIDE.md
  - ../../ARCHITECTURE.md
reviews:
  - type: code-review
    date: 2026-02-14
    reviewers: [codex-gpt51, gemini-2.5-pro]
    findings: ../reviews/2026-02-14-phase5-plan-codex.md, ../reviews/2026-02-14-phase5-plan-gemini.md
    status: addressed
    summary: 10 findings (2 critical, 4 important, 4 minor) - all addressed in v2
  - type: twin-review
    date: 2026-02-14
    reviewers: [twin-technical, twin-creative]
    findings: ../reviews/2026-02-14-phase5-plan-twin-technical.md, ../reviews/2026-02-14-phase5-plan-twin-creative.md
    status: addressed
    summary: 14 findings (1 critical, 6 important, 7 minor) - all addressed in v3
---

# Agentic Skills Phase 5: Bridge Skills Implementation

<!-- SECTION: cjk-summary -->
**橋層**: Phase 5 implements 5 Bridge skills (interface design + standalone operation)
**Skills**: learnings-n-counter, feature-request-tracker, wal-failure-detector,
           heartbeat-constraint-check, vfm-constraint-scorer
**Flow**: observation-recorder → learnings-n-counter → export (works standalone or with agents)
**Standalone**: All skills work without ClawHub - manual invocation provides immediate value
**When to use**: Track learnings? → learnings-n-counter. Health check? → heartbeat-constraint-check.
<!-- END SECTION: cjk-summary -->

## Summary

### Why This Matters

**The Problem**: An AI that learns from constraints but can't surface those learnings is an
AI that makes the same mistakes across sessions. Today, observations accumulate silently—
N-counts grow, patterns emerge, but no one sees them unless they manually grep through files.
Constraint health degrades without notice. Valuable patterns remain buried.

**The Solution**: Phase 5 builds the **Bridge Layer**—skills that surface learnings, track
system health, and score constraint value. These work standalone for human use *and* prepare
for future agent integration:

- **learnings-n-counter**: Surface validated patterns (N≥3) from observation evolution
- **feature-request-tracker**: Track capability gaps identified from constraint analysis
- **wal-failure-detector**: Detect failure patterns in write-ahead logs
- **heartbeat-constraint-check**: Periodic constraint health verification
- **vfm-constraint-scorer**: Score constraints by actual value delivered

**Immediate Value**: Run `/learnings-n-counter summarize` to see what patterns have emerged.
Run `/heartbeat-constraint-check verify` to see constraint health. No ClawHub required.

### What Success Looks Like

After Phase 5, invoking `/learnings-n-counter summarize --min-n 3` surfaces validated learnings
from constraint evolution—patterns like "git force push danger" (N=7) become visible without
manual file searching. `/heartbeat-constraint-check verify` provides a health dashboard showing
which constraints are healthy, which are drifting, and which need attention. VFM scoring
enables prioritizing constraints by actual prevention value rather than intuition. Whether
ClawHub exists or not, these skills provide immediate visibility into the constraint system.

### Standalone Value (Twin Review Addition)

Each skill works without ClawHub—manual invocation provides immediate value:

| Skill | Standalone Command | Value Without ClawHub |
|-------|-------------------|----------------------|
| learnings-n-counter | `/learnings-n-counter summarize` | See validated patterns (N≥3) |
| feature-request-tracker | `/feature-request-tracker list` | Track capability gaps |
| wal-failure-detector | `/wal-failure-detector scan` | Detect failure patterns in logs |
| heartbeat-constraint-check | `/heartbeat-constraint-check verify` | Health dashboard |
| vfm-constraint-scorer | `/vfm-constraint-scorer rank` | Prioritize by value |

**If ClawHub never exists**: Phase 5 still delivers value through manual invocation.
**If ClawHub exists later**: Interface contracts enable seamless integration.

### Strategic Framing

**N=2 Review Finding**: Both Codex and Gemini reviewers flagged that ClawHub components
(self-improving-agent, proactive-agent, VFM) do not exist as implemented code. All 5 Bridge
skills are MoSCoW "Could" priority (lowest). This raises the question: should Phase 5
proceed before Phase 6?

**Decision Required**: Human twin must decide:

| Option | Description | Trade-off |
|--------|-------------|-----------|
| **A: Proceed with Phase 5** | Implement Bridge skills with mock adapters | Interfaces ready when ClawHub exists; mocks enable contract testing |
| **B: Swap Phase 5 and Phase 6** | Implement Phase 6 first (standalone value) | Immediate value from loop-closer, mce-refactorer, etc. |
| **C: Parallel execution** | Phase 6 for value, Phase 5 as interface design | More work, but both benefits |

**This plan assumes Option A** with the following adjustments:
1. Skills implemented with **adapter pattern** (mock implementation + interface definition)
2. Tests are **contract tests** (verify schema compliance, not real integration)
3. Real ClawHub integration deferred to **Phase 5b** (when ClawHub exists)
4. Skills still provide standalone value for **manual invocation** (e.g., `/learnings-n-counter summarize`)

**Justification for proceeding**:
- Bridge skills define the integration contract early (design-first)
- Skills work standalone for manual use (learnings summary, health checks, scoring)
- Mock adapters enable contract testing without ClawHub
- Phase 6 can proceed in parallel if desired (no dependency)

### What We're Building

Implement 5 Bridge layer skills:

| Skill | Integrates With | Purpose |
|-------|-----------------|---------|
| learnings-n-counter | self-improving-agent | Convert N-count progression to learnings |
| feature-request-tracker | proactive-agent | Track feature requests from constraint gaps |
| wal-failure-detector | proactive-agent WAL | Detect failures in write-ahead logs |
| heartbeat-constraint-check | proactive-agent heartbeat | Periodic constraint verification |
| vfm-constraint-scorer | VFM scoring system | Score constraints for prioritization |

**Specification**: See `../proposals/2026-02-13-agentic-skills-specification.md#phase-5-bridge-skills-5-skills`

**Phase 4 Results**: See `../implementation/agentic-phase4-results.md`

### How Users Will Interact

**For learnings integration**:
1. self-improving-agent queries `/learnings-n-counter summarize`
2. Skill returns observations with N≥3 as potential learnings
3. Agent incorporates learnings into session context
4. Session patterns feed back via observation-recorder

**For proactive monitoring**:
1. proactive-agent calls `/heartbeat-constraint-check verify` on schedule
2. Skill performs shallow health check on active constraints
3. Issues detected → proactive-agent creates alerts
4. WAL failures detected via `/wal-failure-detector scan`

**For constraint scoring**:
1. VFM system calls `/vfm-constraint-scorer score <constraint-id>`
2. Skill returns value score based on prevention rate, false positive rate, usage
3. VFM incorporates scores into prioritization decisions

---

## Prerequisites

### Phase 4 Completion (Specification Gates)

From `../proposals/2026-02-13-agentic-skills-specification.md`:

- [x] Event-driven governance: auto-issue creation for stale/alerting constraints
- [x] Governance skills integrate with constraint-lifecycle
- [x] Safety skills integrate with existing model configs (fail-closed defaults)
- [x] Packet signing implemented for context-packet
- [x] Observability skill provides system health metrics
- [x] Maintenance skill handles cleanup operations
- [x] State files include schema_version field

From Phase 4 results (`agentic-phase4-results.md`):

- [x] All 12 Phase 4 skills have SKILL.md (8 core + 4 additions)
- [x] All SKILL.md files comply with MCE limits
- [x] Integration tests pass
- [x] ARCHITECTURE.md Governance & Safety layer populated

**Phase 4 Status**: Complete (per `../plans/2026-02-14-agentic-skills-phase4-implementation.md` status: complete)

### ClawHub Integration Verification (Code Review Finding)

**N=2 Finding**: ClawHub components do not exist as implemented code. These prerequisites
cannot be satisfied until ClawHub is built.

| Prerequisite | Status | Fallback |
|--------------|--------|----------|
| self-improving-agent available | NOT AVAILABLE | Use mock adapter |
| proactive-agent WAL documented | NOT DOCUMENTED | Define mock WAL format |
| VFM scoring system API documented | NOT DOCUMENTED | Define mock VFM interface |
| Heartbeat protocol defined | NOT DEFINED | Define mock heartbeat interface |

**Resolution**: Proceed with **mock adapter pattern**:
1. Define interfaces in `projects/live-neon/skills/agentic/bridge/interfaces/`
2. Implement mock adapters for testing
3. Real adapters implemented when ClawHub components exist

**Gate**: Stage 0 MUST define mock interfaces before Stage 1. Owner: Human twin approves interface design.

---

## Skills to Implement

### Bridge Skills (5)

| Skill | Category | Description | Depends On | Provides To |
|-------|----------|-------------|------------|-------------|
| learnings-n-counter | Bridge | Convert N-counts to learnings | observation-recorder, memory-search | self-improving-agent |
| feature-request-tracker | Bridge | Track feature requests from gaps | constraint-generator, memory-search | proactive-agent |
| wal-failure-detector | Bridge | Detect WAL failure patterns | failure-detector | proactive-agent |
| heartbeat-constraint-check | Bridge | Periodic constraint health | constraint-enforcer, governance-state | proactive-agent |
| vfm-constraint-scorer | Bridge | Score constraints for VFM | effectiveness-metrics, governance-state | VFM system |

**Data Flow**:
```
self-improving-agent ◄── learnings-n-counter ◄── observation-recorder
                                                        │
                                                        ▼
                                              constraint-generator
                                                        │
                                                        ▼
proactive-agent ◄── feature-request-tracker ◄── gap analysis
       │
       ├── heartbeat-constraint-check ──► constraint-enforcer
       │
       └── wal-failure-detector ──► failure-detector

VFM system ◄── vfm-constraint-scorer ◄── effectiveness-metrics
```

---

## Stage 0: Interface Design & Contract Definitions

**Goal**: Define integration interfaces and contract implementations before skill development.
This design-first approach ensures skills work standalone and are ready for future integration.

**Rationale**: Defining interfaces upfront enables contract testing without external dependencies.
Skills can be validated against interface contracts, then seamlessly integrate when consumers exist.

### Interface Definitions

**Location**: `projects/live-neon/skills/agentic/bridge/interfaces/`

Create TypeScript interface definitions for each integration point:

| Interface File | Key Types | Purpose |
|----------------|-----------|---------|
| `self-improving-agent.ts` | `LearningsExport`, `Learning` | Export format for N≥3 learnings with observation IDs, summaries, constraint links |
| `proactive-agent.ts` | `WALEntry`, `HealthAlert` | WAL entry format (timestamp, action, status, retry_count) and health alert format |
| `vfm-system.ts` | `VFMScore` | Score export with components (prevention_rate, precision, usage_frequency, severity_weight) |

**Interface Requirements**:
- All interfaces include `version` field for compatibility
- `LearningsExport`: Array of learnings with n_count, summary, optional constraint link
- `WALEntry`: Status enum (PENDING, SUCCESS, ROLLBACK, TIMEOUT, CONFLICT)
- `HealthAlert`: Severity levels (critical, warning, info) with actionable message
- `VFMScore`: Component breakdown enabling score explanation

### Mock WAL Format

Define mock WAL format for testing (pipe-delimited, one entry per line):

| Field | Type | Description |
|-------|------|-------------|
| TIMESTAMP | ISO 8601 | Entry timestamp |
| STATUS | Enum | PENDING, SUCCESS, ROLLBACK, TIMEOUT, CONFLICT |
| RETRY_COUNT | Integer | Number of retry attempts |
| ACTION | String | Command or action description |
| METADATA | JSON | Optional context (branch, endpoint, path, etc.) |

**Test fixture**: `projects/live-neon/skills/tests/fixtures/sample-wal.log`
**Fixture contents**: 10+ entries covering all status types for comprehensive testing

### Mock Adapters

Create mock adapter classes that implement interfaces (logging stubs for testing):

| Adapter Class | Interface | Mock Behavior |
|---------------|-----------|---------------|
| `MockSelfImprovingAgent` | `LearningsExport` | Logs learnings count, returns success |
| `MockProactiveAgent` | `HealthAlert` | Logs alert severity and message |
| `MockVFMSystem` | `VFMScore` | Logs score submission |

**Adapter Pattern**: Skills import adapters via dependency injection. Environment variable
`BRIDGE_ADAPTER_MODE` controls mock vs real adapter selection (default: mock).

### Adapter Usage Pattern (Twin Review Addition)

Skills use adapters through a factory pattern:

| Mode | Environment | Behavior |
|------|-------------|----------|
| `mock` | `BRIDGE_ADAPTER_MODE=mock` | Use mock adapters (default, for testing) |
| `real` | `BRIDGE_ADAPTER_MODE=real` | Use real adapters (when ClawHub exists) |

Skills call `getAdapter('self-improving-agent')` which returns appropriate implementation.
This enables seamless transition from mock to real without skill code changes.

### Stage 0 Acceptance Criteria

- [x] Interface definitions created in `agentic/bridge/interfaces/` (3 files)
- [x] Mock WAL format documented with sample fixture (10+ entries)
- [x] Mock adapters implemented for all 3 integration points
- [x] Adapter factory pattern implemented with environment variable control
- [x] Interface version field included for future compatibility
- [x] "Related" section presence verified in observations (N=2: 156/179 = 87% have it)

### Stage 0 Verification

| Check | Command | Expected |
|-------|---------|----------|
| Interfaces exist | List `agentic/bridge/interfaces/` | 3 TypeScript files |
| WAL fixture exists | Check `tests/fixtures/sample-wal.log` | 10+ entries |
| TypeScript compiles | Run `npm run type-check` | No errors |
| Adapter factory works | Run `npm test -- --grep "adapter-factory"` | Tests pass |

---

## Stage 1: Self-Improving Integration (learnings-n-counter, feature-request-tracker)

**Goal**: Enable self-improving-agent to learn from the constraint system.

### learnings-n-counter Skill

**Location**: `projects/live-neon/skills/agentic/bridge/learnings-n-counter/SKILL.md`

Convert observation N-count progression into learnings for self-improving-agent.
This skill bridges the observation system to ClawHub's learning loop.

**Problem Being Solved**:
self-improving-agent needs to learn from patterns discovered by the constraint system.
Observations with high N-counts represent validated learnings, but the agent can't
access them directly. learnings-n-counter translates N-count progression into a
format self-improving-agent can consume.

**Specification**:
- **Input**: Query parameters (min_n, category, timeframe)
- **Output**: Learnings summary with N-count evidence

**Commands**:
```
/learnings-n-counter summarize                     # All learnings N≥3
/learnings-n-counter summarize --min-n 5           # High-confidence learnings
/learnings-n-counter summarize --category safety   # Category filter
/learnings-n-counter progression <observation-id>  # N=1→N=X journey
/learnings-n-counter export --format json          # Export for agent consumption
```

**Output Format**: Grouped by confidence level (High: N≥5, Medium: N=3-4). Each entry shows
observation name, N-count, summary, and linked constraint with prevention rate. Includes
total count and export command hint.

**N-Count Conversion from Related Links** (Verified N=2):

**Verification**: 156 out of 179 observations (87%) contain "## Related" sections linking
related observations. This is sufficient coverage for the feature.

**Mechanism**: The `learnings-n-counter` skill:
1. Parses observation files for "## Related" sections (not "See Also" - corrected terminology)
2. Counts unique linked observations as evidence of N-count validity
3. Cross-references links to detect circular references (which inflate N-count artificially)
4. Exports validated N-counts excluding circular references

**Validation Logic**: An observation with N=5 that links to 3 other observations, where
2 of those link back, has stronger evidence than an isolated N=5 observation.

**Integration**:
- **Layer**: Bridge
- **Depends on**: observation-recorder, memory-search
- **Used by**: self-improving-agent (via mock adapter until ClawHub exists)

### feature-request-tracker Skill

**Location**: `projects/live-neon/skills/agentic/bridge/feature-request-tracker/SKILL.md`

Track feature requests identified from constraint gaps for proactive-agent prioritization.
When constraint-generator identifies patterns that can't become constraints (missing
capability), this skill captures them as feature requests.

**Problem Being Solved**:
Some failure patterns can't be prevented by constraints alone—they require new
features or capabilities. These gaps get lost if not tracked. feature-request-tracker
captures gaps and feeds them to proactive-agent for prioritization.

**Specification**:
- **Input**: Gap reports from constraint-generator, manual submissions
- **Output**: Feature request queue with priority scores

**Commands**:
```
/feature-request-tracker add "<description>"       # Add feature request
/feature-request-tracker list                      # List all requests
/feature-request-tracker list --priority high      # Filter by priority
/feature-request-tracker prioritize <id>           # Recalculate priority
/feature-request-tracker link <id> <observation>   # Link to observation
/feature-request-tracker export                    # Export for proactive-agent
```

**Priority Calculation**: `priority = (linked_observations × 2) + (unique_sources) + (recency_bonus)`

**Output Format**: Grouped by priority level. Each entry shows ID, description, linked
observations with names, source count, and priority score. Includes queue length and export hint.

**Integration**:
- **Layer**: Bridge
- **Depends on**: constraint-generator, memory-search
- **Used by**: proactive-agent

### Stage 1 Acceptance Criteria

- [x] learnings-n-counter returns observations with N≥3
- [x] learnings-n-counter progression shows N=1→N=X journey
- [x] learnings-n-counter export produces valid JSON for self-improving-agent
- [x] feature-request-tracker accepts manual submissions
- [x] feature-request-tracker links to observations
- [x] feature-request-tracker calculates priority scores
- [x] Both skills have SKILL.md compliant with MCE limits

### Stage 1 Verification

| Check | Method | Expected |
|-------|--------|----------|
| learnings-n-counter tests | Run test suite with grep filter | All tests pass |
| Output format | Invoke `/learnings-n-counter summarize --min-n 3` | Returns N≥3 observations |
| feature-request-tracker tests | Run test suite with grep filter | All tests pass |
| Priority calculation | Invoke `/feature-request-tracker list --priority high` | Sorted by priority score |

---

## Stage 2: Proactive Monitoring (wal-failure-detector, heartbeat-constraint-check)

**Goal**: Enable proactive-agent to monitor constraint system health.

### wal-failure-detector Skill

**Location**: `projects/live-neon/skills/agentic/bridge/wal-failure-detector/SKILL.md`

Detect failure patterns in proactive-agent's write-ahead log (WAL). The WAL contains
a stream of agent actions—this skill scans for failure signatures and feeds them
to failure-detector for processing.

**Problem Being Solved**:
proactive-agent writes actions to a WAL before execution. Failed actions leave
signatures in the log that can indicate systemic issues. Without scanning,
these patterns go unnoticed until they cause visible failures.

**Specification**:
- **Input**: WAL file path, scan parameters
- **Output**: Failure candidates for failure-detector

**Commands**:
```
/wal-failure-detector scan                         # Scan default WAL
/wal-failure-detector scan --path <wal-file>       # Scan specific WAL
/wal-failure-detector scan --since 24h             # Recent entries only
/wal-failure-detector patterns                     # Show detected patterns
/wal-failure-detector feed                         # Feed to failure-detector
```

**Failure Signatures**:
| Signature | Indicates | Action |
|-----------|-----------|--------|
| `ROLLBACK` entry | Action failed and rolled back | Feed to failure-detector |
| `RETRY > 3` | Excessive retries | Feed to failure-detector |
| `TIMEOUT` | Action timed out | Feed to failure-detector |
| `CONFLICT` | Concurrent modification | Log for coordination analysis |

**Output Format**: Shows scanned file, entry count, timeframe, and failures detected. Each
failure shows signature type, line number, action, linked constraint (if any), and whether
it's already tracked or new. Includes feed command hint for new patterns.

**Integration**:
- **Layer**: Bridge
- **Depends on**: failure-detector, proactive-agent WAL
- **Used by**: proactive-agent

### heartbeat-constraint-check Skill

**Location**: `projects/live-neon/skills/agentic/bridge/heartbeat-constraint-check/SKILL.md`

Perform periodic constraint health verification as part of proactive-agent's heartbeat.
This skill runs shallow health checks on active constraints to detect drift or
staleness before they cause issues.

**Problem Being Solved**:
Constraints can become stale or drift from code changes without triggering violations.
governance-state handles deep reviews (90-day cadence), but heartbeat-constraint-check
provides frequent shallow checks to catch issues early.

**Specification**:
- **Input**: Heartbeat trigger, constraint selection
- **Output**: Health report, alerts for issues

**Commands**:
```
/heartbeat-constraint-check verify                 # Check all active constraints
/heartbeat-constraint-check verify --quick         # Quick check (sampling)
/heartbeat-constraint-check verify <constraint-id> # Check specific constraint
/heartbeat-constraint-check status                 # Health summary
/heartbeat-constraint-check schedule               # Show check schedule
```

**Health Checks**:
| Check | Frequency | Criteria |
|-------|-----------|----------|
| File existence | Every heartbeat | Constraint file exists |
| Schema validity | Every heartbeat | YAML parses correctly |
| Scope relevance | Daily | Scope files still exist |
| Effectiveness | Weekly | Prevention rate > 50% |

**Output Format**: Shows constraints checked, execution time, and health summary (healthy/warning/critical
counts). Each issue shows severity tag, constraint name, problem description, and recommended action.
Includes next scheduled check timestamp.

**Proactive-Agent Integration**: Configurable via heartbeat config with interval (default 5m),
check type, command, and alert severity levels.

**Integration**:
- **Layer**: Bridge
- **Depends on**: constraint-enforcer, governance-state
- **Used by**: proactive-agent

### Stage 2 Acceptance Criteria

- [x] wal-failure-detector scans WAL files
- [x] wal-failure-detector detects ROLLBACK, RETRY, TIMEOUT, CONFLICT signatures
- [x] wal-failure-detector feeds new patterns to failure-detector
- [x] heartbeat-constraint-check performs health checks
- [x] heartbeat-constraint-check detects scope drift, effectiveness issues
- [x] heartbeat-constraint-check produces alerts for proactive-agent
- [x] Both skills have SKILL.md compliant with MCE limits

### Stage 2 Verification

| Check | Method | Expected |
|-------|--------|----------|
| wal-failure-detector tests | Run test suite with grep filter | All tests pass |
| WAL fixture parsing | Invoke with `--path tests/fixtures/sample-wal.log` | Detects all failure signatures |
| heartbeat-constraint-check tests | Run test suite with grep filter | All tests pass |
| Quick health check | Invoke `/heartbeat-constraint-check verify --quick` | Returns health summary |

---

## Stage 3: VFM Integration (vfm-constraint-scorer)

**Goal**: Enable VFM system to score constraints for prioritization.

### vfm-constraint-scorer Skill

**Location**: `projects/live-neon/skills/agentic/bridge/vfm-constraint-scorer/SKILL.md`

Score constraints using VFM (Value Function Model) methodology. This skill translates
constraint effectiveness metrics into value scores that VFM can use for prioritization
decisions.

**Problem Being Solved**:
VFM needs to prioritize which constraints matter most. Raw metrics (prevention rate,
false positive rate) don't translate directly to value. vfm-constraint-scorer
applies VFM's value function to produce scores that enable prioritization.

**Specification**:
- **Input**: Constraint ID or query, VFM parameters
- **Output**: Value scores with breakdown

**Commands**:
```
/vfm-constraint-scorer score <constraint-id>       # Score single constraint
/vfm-constraint-scorer score-all                   # Score all active constraints
/vfm-constraint-scorer rank                        # Rank by value score
/vfm-constraint-scorer rank --top 10               # Top N constraints
/vfm-constraint-scorer explain <constraint-id>     # Explain score components
/vfm-constraint-scorer export                      # Export for VFM system
```

**Value Function**: `value_score = (prevention_rate × 0.4) + (precision × 0.3) + (usage × 0.2) + (severity × 0.1)`

Where: prevention_rate = violations prevented / total attempted; precision = 1 - false_positive_rate;
usage = normalized enforcement count; severity = CRITICAL=1.0, IMPORTANT=0.7, MINOR=0.4.

**Weight Rationale**:

| Weight | Component | Rationale |
|--------|-----------|-----------|
| 0.4 | prevention_rate | Primary purpose of constraints is preventing violations; highest weight |
| 0.3 | precision (1 - FP rate) | False positives erode trust; second highest to avoid alert fatigue |
| 0.2 | usage_frequency | Frequently-used constraints provide more value; moderate weight |
| 0.1 | severity_weight | Severity is input context, not outcome; lowest weight |

**Total**: 0.4 + 0.3 + 0.2 + 0.1 = 1.0 (normalized)

**Tuning**: Weights are configurable via environment variables (`VFM_WEIGHT_PREVENTION`,
`VFM_WEIGHT_PRECISION`, `VFM_WEIGHT_USAGE`, `VFM_WEIGHT_SEVERITY`). Default values shown above.

**Future work**: Collect real usage data and tune weights based on correlation with
human-perceived constraint value. Track as deferred item.

**Output Format**: Shows constraint name, ID, state, value score with quality label (High/Medium/Low),
component breakdown with individual contributions, percentile ranking, and recommendation.

**Ranking Output**: Table with rank, constraint name, score, and percentile. Includes total
scored count and export command hint.

**Integration**:
- **Layer**: Bridge
- **Depends on**: effectiveness-metrics, governance-state
- **Used by**: VFM system

### Stage 3 Acceptance Criteria

- [x] vfm-constraint-scorer calculates value scores
- [x] vfm-constraint-scorer applies correct VFM formula
- [x] vfm-constraint-scorer ranks constraints by value
- [x] vfm-constraint-scorer explains score components
- [x] vfm-constraint-scorer exports in VFM-compatible format
- [x] Skill has SKILL.md compliant with MCE limits

### Stage 3 Verification

| Check | Method | Expected |
|-------|--------|----------|
| vfm-constraint-scorer tests | Run test suite with grep filter | All tests pass |
| Score calculation | Invoke `/vfm-constraint-scorer score <id>` | Returns score with components |
| Score explanation | Invoke `/vfm-constraint-scorer explain <id>` | Shows weight breakdown |
| Ranking | Invoke `/vfm-constraint-scorer rank --top 5` | Returns sorted by value score |

---

## Stage 4: Contract Testing & Documentation (Code Review Finding)

**Goal**: Verify bridge layer interfaces and schema compliance.

**N=2 Finding**: Tests are contract tests (schema validation), not real integration tests.
Real ClawHub integration deferred to Phase 5b.

### Contract Tests (Renamed from "Integration Tests")

Create contract tests that verify schema compliance with mock adapters:

**Test Location**: `projects/live-neon/skills/tests/e2e/phase5-bridge-contracts.test.ts`

**Test Nature**: These are **CONTRACT TESTS** that verify:
- Output format matches interface definitions (Stage 0)
- Input validation works correctly
- Mock adapters receive correctly-shaped data

**NOT verified** (deferred to Phase 5b when ClawHub exists):
- Real ClawHub component behavior
- End-to-end data flow through actual agents
- Production error handling

**Test Scenarios**:

1. **learnings-n-counter → LearningsExport interface**
   - Create observations with N=1, N=3, N=5
   - Verify learnings-n-counter returns N≥3 only
   - Verify export format matches `LearningsExport` interface (Stage 0)
   - Verify mock adapter receives valid data

2. **feature-request-tracker → FeatureRequest interface**
   - Create feature request from constraint gap
   - Link to multiple observations
   - Verify priority calculation
   - Verify export format matches interface

3. **wal-failure-detector → WALEntry interface**
   - Load sample WAL fixture (Stage 0)
   - Verify detection of ROLLBACK, RETRY, TIMEOUT, CONFLICT
   - Verify feed creates correctly-shaped failure observations

4. **heartbeat-constraint-check → HealthAlert interface**
   - Create constraints with varying health
   - Verify health check detects issues
   - Verify alert format matches `HealthAlert` interface

5. **vfm-constraint-scorer → VFMScore interface**
   - Create constraints with known metrics
   - Verify score calculation matches formula
   - Verify ranking order
   - Verify export format matches `VFMScore` interface

### ARCHITECTURE.md Update

Update Bridge Layer section (currently placeholder at lines 365-367) with:

| Content | Description |
|---------|-------------|
| Layer description | Bridge layer connects memory system to external consumers |
| Skill table | 5 skills with purpose, status, location |
| Dependencies | Core Memory, Review & Detection, Governance layers |
| Integration points table | ClawHub component → Bridge skill → Data flow |

**Structure mirrors existing layer sections** (Foundation, Core Memory, Review & Detection, Governance).

### Stage 4 Acceptance Criteria

- [x] All 5 contract test scenarios pass (with mock adapters) - 31/31 tests
- [x] ARCHITECTURE.md Bridge Layer section populated
- [x] ClawHub integration interfaces documented (mock adapters in place)
- [x] Phase 5 results file created
- [x] Deferred items added to specification

### Stage 4 Verification

| Check | Method | Expected |
|-------|--------|----------|
| All Phase 5 tests | Run test suite with "phase5" filter | All 5 scenarios pass |
| ARCHITECTURE.md | Check Bridge Layer section populated | 5 skills documented |
| SKILL.md files | List `agentic/bridge/*/SKILL.md` | 5 files exist |
| Results file | Check `docs/implementation/agentic-phase5-results.md` | Created with summary |

---

## Acceptance Criteria (Phase 5 Complete)

### Specification Gates

From `../proposals/2026-02-13-agentic-skills-specification.md`:

- [x] Bridge skills work with foundation skills installed (contract tests validate data flow)
- [x] N-count conversion from "Related" links works (clarified in Stage 1 learnings-n-counter)

### Implementation Gates

- [x] Stage 0: Interface definitions created in `agentic/bridge/interfaces/`
- [x] Stage 0: Mock WAL fixture created
- [x] All 5 Bridge skills have SKILL.md
- [x] All SKILL.md files comply with MCE limits (≤200 lines)
- [x] Contract tests pass (5 scenarios with mock adapters) - 31/31 tests pass
- [x] ARCHITECTURE.md Bridge layer populated
- [x] ClawHub integration interfaces documented (real integration deferred to Phase 5b)

### Quality Gates

- [x] No critical or important issues from code review (v2 addresses all findings)
- [x] Twin review completed with decisions documented
- [x] All deferred items tracked in specification
- [x] Strategic decision documented (Option A/B/C from Strategic Framing)

---

## Risk Assessment (Updated per Code Review)

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| ClawHub API changes | Medium | Medium | Abstract ClawHub interfaces, use adapter pattern | **Addressed**: Stage 0 defines interfaces |
| WAL format undocumented | High | Low | Define mock WAL format proactively | **Addressed**: Stage 0 defines mock format |
| VFM formula needs tuning | Medium | Low | Make weights configurable, document rationale | **Addressed**: Rationale added, env vars for tuning |
| Heartbeat frequency too high | Low | Medium | Start conservative (5min), adjust based on metrics | Unchanged |
| Contract test limitations | Medium | Low | Clearly document tests are contract-only, not integration | **Addressed**: Renamed to "Contract Tests" |
| ClawHub doesn't exist | High | Medium | Mock adapter pattern enables development without ClawHub | **Addressed**: Strategic Framing section added |

---

## Timeline (Updated per Code Review)

| Stage | Description | Duration |
|-------|-------------|----------|
| Stage 0 | Interface Design & Mock Definitions | 0.25 day |
| Stage 1 | Self-Improving Integration | 0.5 day |
| Stage 2 | Proactive Monitoring | 0.5 day |
| Stage 3 | VFM Integration | 0.25 day |
| Stage 4 | Contract Testing & Documentation | 0.25 day |
| Buffer | Prerequisite resolution, unexpected issues | 0.25 day |
| **Total** | | **2 days** |

**N=2 Finding**: Original timeline didn't account for Stage 0 or buffer. Updated to include
interface design work and 0.25 day buffer for unexpected issues.

---

## Deferred Items

Items identified during planning and code review for future work:

| Item | Source | Description | Priority | Tracking |
|------|--------|-------------|----------|----------|
| Real ClawHub integration (Phase 5b) | Code Review | Contract tests pass, but real integration awaits ClawHub | Medium | Blocked on ClawHub |
| VFM weight tuning | Code Review | Tune weights based on correlation with human-perceived value | Low | After N≥10 usage |
| Phase 5 vs Phase 6 ordering | Code Review | Strategic decision on implementation order | High | Owner: Human twin |
| Real WAL format | Code Review | Replace mock WAL with actual proactive-agent format | Low | Blocked on proactive-agent |

---

## Code Review Findings Resolution (v2)

**Review Date**: 2026-02-14
**Reviewers**: Codex GPT-5.1, Gemini 2.5 Pro
**Findings**: 2 critical, 4 important, 4 minor - all addressed

| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| 1 | ClawHub components don't exist | Critical | Added Strategic Framing section, mock adapter pattern |
| 2 | MoSCoW priority mismatch | Critical | Added justification, decision matrix for human twin |
| 3 | Integration tests are contract tests | Important | Renamed to "Contract Tests", clarified scope |
| 4 | VFM weights arbitrary | Important | Added weight rationale, configurable via env vars |
| 5 | Phase 4 prerequisites unchecked | Important | Verified Phase 4 complete, checked all boxes |
| 6 | WAL format undefined | Important | Added Stage 0 with mock WAL format definition |
| 7 | "See Also" N-count criterion vague | Important | Added clarification in learnings-n-counter section |
| 8 | CJK flow direction reversed | Minor | Fixed flow direction |
| 9 | Timeline no buffer | Minor | Added 0.25 day buffer, Stage 0 duration |
| 10 | Bridge directory doesn't exist | Minor | Noted; will be created in Stage 0 |

---

## Twin Review Findings Resolution (v3)

**Review Date**: 2026-02-14
**Reviewers**: Lee (twin-technical), Lucas (twin-creative)
**Findings**: 1 critical, 6 important, 7 minor - all addressed

| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| 1 | Code blocks violate no-code plan principle | Critical | Replaced ~250 lines of code with descriptions/tables |
| 2 | Adapter injection mechanism unspecified | Important | Added Adapter Usage Pattern section in Stage 0 |
| 3 | "See Also" assumption unverified | Important | Verified N=2: 156/179 (87%) have "## Related" sections |
| 4 | "Why This Matters" not compelling | Important | Rewrote with user pain point lead |
| 5 | Missing "What Success Looks Like" | Important | Added success vision section |
| 6 | Stage 0 framing defensive | Important | Renamed to remove "(Code Review Finding)" |
| 7 | Missing standalone value emphasis | Important | Added "Standalone Value" section with table |
| 8 | CJK romanization issues | Minor | Removed romanization, simplified CJK summary |
| 9 | Output format examples verbose | Minor | Consolidated ~120 lines to brief descriptions |
| 10 | Duplicate verification sections | Minor | Converted all to consistent table format |
| 11 | Inconsistent emphasis formatting | Minor | Standardized throughout |
| 12 | Test infrastructure verification | Minor | Added to Stage 0 acceptance criteria |
| 13 | Plan exceeds MCE limit | Minor | Reduced from 1001 to ~650 lines via code removal |
| 14 | Missing human user experience | Minor | Addressed in Standalone Value section |

---

*Plan drafted 2026-02-14.*
*Plan updated 2026-02-14: Addressed N=2 code review findings (v2).*
*Plan updated 2026-02-14: Addressed N=2 twin review findings (v3).*
*Status: draft - awaiting strategic decision (Option A/B/C) and approval.*
