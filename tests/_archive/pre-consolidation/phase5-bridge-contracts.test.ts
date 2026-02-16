/**
 * Phase 5 Contract Tests
 *
 * CONTRACT TESTS - NOT INTEGRATION TESTS
 *
 * These tests verify data contracts and simulated interactions between
 * Bridge layer skills and external ClawHub components. They use LOCAL
 * MOCK IMPLEMENTATIONS defined in the adapters directory.
 *
 * What these tests validate:
 *   - Data structure contracts (types, fields, formats)
 *   - Output format matches interface definitions (Stage 0)
 *   - Input validation works correctly
 *   - Mock adapters receive correctly-shaped data
 *
 * What these tests DO NOT validate:
 *   - Real ClawHub component behavior
 *   - End-to-end data flow through actual agents
 *   - Production error handling
 *   - Real integration (deferred to Phase 5b when ClawHub exists)
 *
 * Scenarios (5 total):
 *   1. learnings-n-counter -> LearningsExport interface
 *   2. feature-request-tracker -> FeatureRequest interface
 *   3. wal-failure-detector -> WALEntry interface
 *   4. heartbeat-constraint-check -> HealthAlert interface
 *   5. vfm-constraint-scorer -> VFMScore interface
 *
 * Run tests:
 *   npx vitest run e2e/phase5-bridge-contracts.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';

// =============================================================================
// Import Real Interfaces from Stage 0
// =============================================================================

import type {
  LearningsExport,
  Learning,
  LearningsQuery,
} from '../../agentic/bridge/interfaces/self-improving-agent';

import type {
  WALEntry,
  WALFailure,
  WALStatus,
  HealthAlert,
  AlertSeverity,
  ConstraintHealth,
  HealthCheckSummary,
} from '../../agentic/bridge/interfaces/proactive-agent';

import type {
  VFMScore,
  VFMRanking,
  VFMWeights,
  VFMScoreComponents,
} from '../../agentic/bridge/interfaces/vfm-system';

import { DEFAULT_WEIGHTS, SEVERITY_WEIGHTS } from '../../agentic/bridge/interfaces/vfm-system';

// =============================================================================
// Import Mock Adapters from Stage 0
// =============================================================================

import { MockSelfImprovingAgent } from '../../agentic/bridge/adapters/mock-self-improving-agent';
import { MockProactiveAgent } from '../../agentic/bridge/adapters/mock-proactive-agent';
import { MockVFMSystem } from '../../agentic/bridge/adapters/mock-vfm-system';
import { getAdapter, resetAdapters, getAdapterMode } from '../../agentic/bridge/adapters/factory';

// =============================================================================
// Import Mock Skill Implementations (extracted to tests/mocks/ during Phase 6)
// =============================================================================

import {
  MockLearningsNCounter,
  MockFeatureRequestTracker,
  MockWALFailureDetector,
  MockHeartbeatConstraintCheck,
  MockVFMConstraintScorer,
} from '../mocks';

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 5 Contract Tests: Bridge Layer', () => {
  beforeEach(() => {
    resetAdapters();
  });

  describe('Adapter Factory', () => {
    it('defaults to mock mode', () => {
      expect(getAdapterMode()).toBe('mock');
    });

    it('returns mock adapters in mock mode', () => {
      const selfImproving = getAdapter('self-improving-agent');
      const proactive = getAdapter('proactive-agent');
      const vfm = getAdapter('vfm-system');

      expect(selfImproving).toBeInstanceOf(MockSelfImprovingAgent);
      expect(proactive).toBeInstanceOf(MockProactiveAgent);
      expect(vfm).toBeInstanceOf(MockVFMSystem);
    });

    it('uses singleton pattern for adapters', () => {
      const adapter1 = getAdapter('self-improving-agent');
      const adapter2 = getAdapter('self-improving-agent');
      expect(adapter1).toBe(adapter2);
    });
  });

  describe('Scenario 1: learnings-n-counter -> LearningsExport interface', () => {
    let counter: MockLearningsNCounter;

    beforeEach(() => {
      counter = new MockLearningsNCounter();
    });

    it('returns only observations with N >= min_n', () => {
      counter.addObservation('obs-1', 1, 'Low count');
      counter.addObservation('obs-2', 3, 'Medium count');
      counter.addObservation('obs-3', 5, 'High count');

      const result = counter.summarize({ min_n_count: 3 });

      expect(result.total_count).toBe(2);
      expect(result.learnings.map((l) => l.observation_id)).toContain('obs-2');
      expect(result.learnings.map((l) => l.observation_id)).toContain('obs-3');
      expect(result.learnings.map((l) => l.observation_id)).not.toContain('obs-1');
    });

    it('filters by category when provided', () => {
      counter.addObservation('obs-1', 5, 'Safety observation', 'safety');
      counter.addObservation('obs-2', 5, 'Process observation', 'process');

      const result = counter.summarize({ min_n_count: 3, category: 'safety' });

      expect(result.total_count).toBe(1);
      expect(result.learnings[0].category).toBe('safety');
    });

    it('produces valid LearningsExport format', () => {
      counter.addObservation('obs-1', 5, 'Test observation', 'safety');

      const result = counter.summarize({ min_n_count: 3 });

      // Verify interface compliance
      expect(result.version).toBe('1.0.0');
      expect(typeof result.exported_at).toBe('string');
      expect(result.min_n_count).toBe(3);
      expect(Array.isArray(result.learnings)).toBe(true);

      const learning = result.learnings[0];
      expect(learning.id).toBeDefined();
      expect(learning.observation_id).toBe('obs-1');
      expect(learning.n_count).toBe(5);
      expect(learning.summary).toBe('Test observation');
    });

    it('sends correctly-shaped data to mock adapter', async () => {
      counter.addObservation('obs-1', 5, 'Test');
      counter.addObservation('obs-2', 8, 'Test 2');

      await counter.exportToAgent();

      const adapter = getAdapter('self-improving-agent');
      const received = adapter.getReceivedLearnings();

      expect(received.length).toBe(1);
      expect(received[0].total_count).toBe(2);
      expect(received[0].version).toBe('1.0.0');
    });
  });

  describe('Scenario 2: feature-request-tracker -> FeatureRequest interface', () => {
    let tracker: MockFeatureRequestTracker;

    beforeEach(() => {
      tracker = new MockFeatureRequestTracker();
    });

    it('accepts manual feature request submissions', () => {
      const id = tracker.add('Semantic code search');
      expect(id).toMatch(/^FR-2026-\d{3}$/);

      const request = tracker.getRequest(id);
      expect(request?.description).toBe('Semantic code search');
    });

    it('links feature requests to observations', () => {
      const id = tracker.add('Real-time notifications');
      tracker.link(id, 'notification-delay-frustration');
      tracker.link(id, 'real-time-feedback-desire');

      const request = tracker.getRequest(id);
      expect(request?.observations.length).toBe(2);
    });

    it('calculates priority scores correctly', () => {
      const id = tracker.add('Test feature');

      // Initial: 1 source + recency bonus (< 7 days = 3)
      const initialPriority = tracker.calculatePriority(id);
      expect(initialPriority).toBe(1 + 3); // sources + recency

      // After linking 5 observations: (5 * 2) + 1 + 3 = 14
      for (let i = 0; i < 5; i++) {
        tracker.link(id, `obs-${i}`);
      }

      const linkedPriority = tracker.calculatePriority(id);
      expect(linkedPriority).toBe(10 + 1 + 3); // linked + sources + recency
    });

    it('assigns correct priority levels', () => {
      const lowId = tracker.add('Low priority');
      expect(tracker.getPriorityLevel(lowId)).toBe('low'); // 1 + 3 = 4

      const mediumId = tracker.add('Medium priority');
      tracker.link(mediumId, 'obs-1');
      expect(tracker.getPriorityLevel(mediumId)).toBe('medium'); // 2 + 1 + 3 = 6

      const highId = tracker.add('High priority');
      for (let i = 0; i < 5; i++) {
        tracker.link(highId, `obs-${i}`);
      }
      expect(tracker.getPriorityLevel(highId)).toBe('high'); // 10 + 1 + 3 = 14
    });
  });

  describe('Scenario 3: wal-failure-detector -> WALEntry interface', () => {
    let detector: MockWALFailureDetector;

    beforeEach(() => {
      detector = new MockWALFailureDetector();
    });

    it('parses WAL entries correctly', () => {
      const line = '2026-02-14T09:02:00Z|ROLLBACK|0|git push --force|{"branch":"main"}';
      const entry = detector.parseWALEntry(line, 3);

      expect(entry).not.toBeNull();
      expect(entry!.timestamp).toBe('2026-02-14T09:02:00Z');
      expect(entry!.status).toBe('ROLLBACK');
      expect(entry!.retry_count).toBe(0);
      expect(entry!.action).toBe('git push --force');
      expect(entry!.metadata).toEqual({ branch: 'main' });
      expect(entry!.line_number).toBe(3);
    });

    it('skips comments and empty lines', () => {
      expect(detector.parseWALEntry('# Comment', 1)).toBeNull();
      expect(detector.parseWALEntry('', 2)).toBeNull();
      expect(detector.parseWALEntry('   ', 3)).toBeNull();
    });

    it('detects ROLLBACK failures', () => {
      const entries: WALEntry[] = [
        {
          timestamp: '2026-02-14T09:00:00Z',
          status: 'SUCCESS',
          retry_count: 0,
          action: 'git add README.md',
        },
        {
          timestamp: '2026-02-14T09:02:00Z',
          status: 'ROLLBACK',
          retry_count: 0,
          action: 'git push --force',
          metadata: { constraint: 'git-force-push' },
        },
      ];

      const failures = detector.detectFailures(entries);

      expect(failures.length).toBe(1);
      expect(failures[0].signature).toBe('ROLLBACK');
      expect(failures[0].constraint_id).toBe('git-force-push');
    });

    it('detects TIMEOUT failures', () => {
      const entries: WALEntry[] = [
        {
          timestamp: '2026-02-14T09:04:00Z',
          status: 'TIMEOUT',
          retry_count: 0,
          action: 'curl -X POST https://slow-api.example.com',
        },
      ];

      const failures = detector.detectFailures(entries);

      expect(failures.length).toBe(1);
      expect(failures[0].signature).toBe('TIMEOUT');
    });

    it('detects RETRY_EXCEEDED failures', () => {
      const entries: WALEntry[] = [
        {
          timestamp: '2026-02-14T09:09:00Z',
          status: 'SUCCESS',
          retry_count: 4, // > 3
          action: 'fetch https://flaky-service.example.com/data',
        },
      ];

      const failures = detector.detectFailures(entries);

      expect(failures.length).toBe(1);
      expect(failures[0].signature).toBe('RETRY_EXCEEDED');
    });

    it('detects CONFLICT failures', () => {
      const entries: WALEntry[] = [
        {
          timestamp: '2026-02-14T09:08:00Z',
          status: 'CONFLICT',
          retry_count: 0,
          action: 'write shared-state.json',
        },
      ];

      const failures = detector.detectFailures(entries);

      expect(failures.length).toBe(1);
      expect(failures[0].signature).toBe('CONFLICT');
    });

    it('sends alerts to mock adapter', async () => {
      const failures: WALFailure[] = [
        {
          entry: {
            timestamp: '2026-02-14T09:02:00Z',
            status: 'ROLLBACK',
            retry_count: 0,
            action: 'git push --force',
          },
          signature: 'ROLLBACK',
          already_tracked: false,
        },
      ];

      await detector.sendAlerts(failures);

      const adapter = getAdapter('proactive-agent');
      const alerts = adapter.getReceivedAlerts();

      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].message).toContain('ROLLBACK');
    });
  });

  describe('Scenario 4: heartbeat-constraint-check -> HealthAlert interface', () => {
    let checker: MockHeartbeatConstraintCheck;

    beforeEach(() => {
      checker = new MockHeartbeatConstraintCheck();
    });

    it('reports healthy constraints', () => {
      checker.addConstraint('healthy-constraint', {
        file_exists: true,
        schema_valid: true,
        scope_files: ['src/main.ts'],
        effectiveness: 0.9,
      });

      const result = checker.checkConstraint('healthy-constraint');

      expect(result.status).toBe('healthy');
      expect(result.checks.file_exists).toBe(true);
      expect(result.checks.schema_valid).toBe(true);
      expect(result.checks.scope_relevant).toBe(true);
      expect(result.checks.effectiveness_ok).toBe(true);
      expect(result.alert).toBeUndefined();
    });

    it('detects missing file (critical)', () => {
      checker.addConstraint('missing-file', { file_exists: false });

      const result = checker.checkConstraint('missing-file');

      expect(result.status).toBe('critical');
      expect(result.alert?.severity).toBe('critical');
      expect(result.alert?.message).toContain('missing');
    });

    it('detects invalid schema (critical)', () => {
      checker.addConstraint('invalid-schema', { schema_valid: false });

      const result = checker.checkConstraint('invalid-schema');

      expect(result.status).toBe('critical');
      expect(result.alert?.severity).toBe('critical');
    });

    it('detects scope drift (warning)', () => {
      checker.addConstraint('scope-drift', { scope_files: [] });

      const result = checker.checkConstraint('scope-drift');

      expect(result.status).toBe('warning');
      expect(result.alert?.severity).toBe('warning');
      expect(result.alert?.message).toContain('Scope drift');
    });

    it('detects low effectiveness (warning)', () => {
      checker.addConstraint('low-effectiveness', { effectiveness: 0.4 });

      const result = checker.checkConstraint('low-effectiveness');

      expect(result.status).toBe('warning');
      expect(result.alert?.severity).toBe('warning');
      expect(result.alert?.context?.effectiveness).toBe(0.4);
    });

    it('produces valid HealthCheckSummary', async () => {
      checker.addConstraint('healthy', { effectiveness: 0.9 });
      checker.addConstraint('warning', { effectiveness: 0.4 });
      checker.addConstraint('critical', { file_exists: false });

      const summary = await checker.runHealthCheck();

      expect(summary.version).toBe('1.0.0');
      expect(summary.counts.total).toBe(3);
      expect(summary.counts.healthy).toBe(1);
      expect(summary.counts.warning).toBe(1);
      expect(summary.counts.critical).toBe(1);
      expect(summary.next_check).toBeDefined();
    });

    it('sends summary to mock adapter', async () => {
      checker.addConstraint('test', { effectiveness: 0.9 });

      await checker.runHealthCheck();

      const adapter = getAdapter('proactive-agent');
      const summaries = adapter.getReceivedSummaries();

      expect(summaries.length).toBe(1);
      expect(summaries[0].counts.total).toBe(1);
    });
  });

  describe('Scenario 5: vfm-constraint-scorer -> VFMScore interface', () => {
    let scorer: MockVFMConstraintScorer;

    beforeEach(() => {
      scorer = new MockVFMConstraintScorer();
    });

    it('calculates value scores using VFM formula', () => {
      scorer.addConstraint('test', {
        name: 'Test Constraint',
        prevention_rate: 0.94,
        false_positive_rate: 0.04,
        usage_frequency: 0.82,
        severity: 'IMPORTANT',
      });

      const score = scorer.score('test');

      expect(score).not.toBeNull();

      // Manual calculation:
      // prevention: 0.94 * 0.4 = 0.376
      // precision: 0.96 * 0.3 = 0.288
      // usage: 0.82 * 0.2 = 0.164
      // severity: 0.7 * 0.1 = 0.07
      // total: 0.898

      expect(score!.value_score).toBeCloseTo(0.898, 2);
      expect(score!.quality).toBe('high');
    });

    it('applies correct weight breakdown', () => {
      scorer.addConstraint('test', {
        name: 'Test',
        prevention_rate: 1.0,
        false_positive_rate: 0,
        usage_frequency: 1.0,
        severity: 'CRITICAL',
      });

      const score = scorer.score('test');

      // Perfect scores: 1.0 * each weight
      expect(score!.contributions.prevention).toBeCloseTo(0.4, 2);
      expect(score!.contributions.precision).toBeCloseTo(0.3, 2);
      expect(score!.contributions.usage).toBeCloseTo(0.2, 2);
      expect(score!.contributions.severity).toBeCloseTo(0.1, 2);
      expect(score!.value_score).toBeCloseTo(1.0, 2);
    });

    it('ranks constraints by value score', () => {
      scorer.addConstraint('high', {
        name: 'High',
        prevention_rate: 0.95,
        false_positive_rate: 0.02,
        usage_frequency: 0.9,
        severity: 'CRITICAL',
      });

      scorer.addConstraint('low', {
        name: 'Low',
        prevention_rate: 0.5,
        false_positive_rate: 0.3,
        usage_frequency: 0.2,
        severity: 'MINOR',
      });

      const ranking = scorer.rank();

      expect(ranking.rankings[0].constraint_id).toBe('high');
      expect(ranking.rankings[1].constraint_id).toBe('low');
      expect(ranking.rankings[0].percentile).toBeGreaterThan(ranking.rankings[1].percentile);
    });

    it('produces valid VFMRanking format', () => {
      scorer.addConstraint('test', {
        name: 'Test',
        prevention_rate: 0.9,
        false_positive_rate: 0.05,
        usage_frequency: 0.8,
        severity: 'IMPORTANT',
      });

      const ranking = scorer.rank();

      expect(ranking.version).toBe('1.0.0');
      expect(ranking.weights).toEqual(DEFAULT_WEIGHTS);
      expect(ranking.total_scored).toBe(1);
      expect(Array.isArray(ranking.rankings)).toBe(true);
    });

    it('sends ranking to mock adapter', async () => {
      scorer.addConstraint('test', {
        name: 'Test',
        prevention_rate: 0.9,
        false_positive_rate: 0.05,
        usage_frequency: 0.8,
        severity: 'IMPORTANT',
      });

      await scorer.exportToVFM();

      const adapter = getAdapter('vfm-system');
      const rankings = adapter.getReceivedRankings();

      expect(rankings.length).toBe(1);
      expect(rankings[0].total_scored).toBe(1);
    });

    it('assigns quality labels correctly', () => {
      scorer.addConstraint('high', {
        name: 'High',
        prevention_rate: 0.95,
        false_positive_rate: 0.02,
        usage_frequency: 0.9,
        severity: 'CRITICAL',
      });

      scorer.addConstraint('medium', {
        name: 'Medium',
        prevention_rate: 0.7,
        false_positive_rate: 0.1,
        usage_frequency: 0.5,
        severity: 'IMPORTANT',
      });

      scorer.addConstraint('low', {
        name: 'Low',
        prevention_rate: 0.4,
        false_positive_rate: 0.3,
        usage_frequency: 0.2,
        severity: 'MINOR',
      });

      expect(scorer.score('high')!.quality).toBe('high');
      expect(scorer.score('medium')!.quality).toBe('medium');
      expect(scorer.score('low')!.quality).toBe('low');
    });
  });
});
