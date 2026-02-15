# Test Mocks

Mock skill implementations for contract testing.

## Purpose

These mocks simulate skill behavior for contract tests without requiring the actual
skill implementations. They verify data contracts, interface compliance, and adapter
integration.

## Available Mocks

| Mock | Simulates | Used By |
|------|-----------|---------|
| `MockLearningsNCounter` | learnings-n-counter skill | phase5-bridge-contracts.test.ts |
| `MockFeatureRequestTracker` | feature-request-tracker skill | phase5-bridge-contracts.test.ts |
| `MockWALFailureDetector` | wal-failure-detector skill | phase5-bridge-contracts.test.ts |
| `MockHeartbeatConstraintCheck` | heartbeat-constraint-check skill | phase5-bridge-contracts.test.ts |
| `MockVFMConstraintScorer` | vfm-constraint-scorer skill | phase5-bridge-contracts.test.ts |

## Usage

```typescript
import {
  MockLearningsNCounter,
  MockFeatureRequestTracker,
  MockWALFailureDetector,
  MockHeartbeatConstraintCheck,
  MockVFMConstraintScorer,
} from '../mocks';

// In test
const counter = new MockLearningsNCounter();
counter.addObservation('obs-1', 5, 'Test observation');
const result = counter.summarize({ min_n_count: 3 });
```

## Adapter Integration

These mocks use the adapter factory from `agentic/bridge/adapters/`:

```typescript
import { getAdapter, resetAdapters } from '../../agentic/bridge/adapters/factory';

beforeEach(() => {
  resetAdapters(); // Clear adapter state between tests
});
```

## Contract Testing vs Integration Testing

**Contract tests** (using these mocks):
- Verify data structure compliance
- Test with deterministic, controlled data
- Fast execution, no external dependencies

**Integration tests** (Phase 5b, when ClawHub exists):
- Verify real component interactions
- Test actual ClawHub agent behavior
- Require running infrastructure

## History

Extracted from `phase5-bridge-contracts.test.ts` during Phase 6 Stage 1 cleanup
to reduce file size and enable reuse.
