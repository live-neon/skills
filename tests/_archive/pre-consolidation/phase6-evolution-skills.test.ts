/**
 * Phase 6 Constraint Evolution Skills Contract Tests
 *
 * Tests for Stage 5 constraint evolution skills:
 *   - constraint-versioning: Track constraint evolution
 *   - cross-session-safety-check: Verify state consistency
 *
 * Created during Phase 6 Stage 5 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Fixture Paths
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures/phase6');
const SESSIONS_DIR = path.join(FIXTURES_DIR, 'sessions');
const OBSERVATIONS_DIR = path.join(FIXTURES_DIR, 'observations');

// =============================================================================
// Mock Implementations for Contract Testing
// =============================================================================

interface VersionEntry {
  version: string;
  n_count: number;
  date: string;
  context: string;
  change_summary: string;
  breaking_changes?: boolean;
}

interface ConstraintHistory {
  name: string;
  currentVersion: string;
  status: 'active' | 'deprecated';
  versions: VersionEntry[];
  contextDiversity: number;
}

interface JourneyEntry {
  n_count: number;
  date: string;
  context: string;
  description: string;
}

interface NCountJourney {
  observation: string;
  currentN: number;
  entries: JourneyEntry[];
  duration: number; // days
  contexts: string[];
}

class MockConstraintVersioning {
  private constraints: Map<string, ConstraintHistory> = new Map();

  constructor() {
    // Initialize with sample constraint
    this.constraints.set('git-commit-format', {
      name: 'git-commit-format',
      currentVersion: '2.3',
      status: 'active',
      versions: [
        { version: '1.0', n_count: 1, date: '2025-09-15', context: 'PR review', change_summary: 'Initial rules' },
        { version: '1.1', n_count: 2, date: '2025-10-03', context: 'Team discussion', change_summary: 'Added scope prefix' },
        { version: '2.0', n_count: 5, date: '2025-11-20', context: 'CI integration', change_summary: 'Body requirements', breaking_changes: true },
        { version: '2.3', n_count: 9, date: '2026-01-15', context: 'Cross-team', change_summary: 'Co-author guidelines' },
      ],
      contextDiversity: 4,
    });
  }

  history(constraintName: string): ConstraintHistory | null {
    return this.constraints.get(constraintName) || null;
  }

  journey(observationPath: string): NCountJourney | null {
    // Read N-count from observation fixture
    if (!fs.existsSync(observationPath)) {
      return null;
    }

    const content = fs.readFileSync(observationPath, 'utf-8');
    const nCountMatch = content.match(/n_count:\s*(\d+)/);
    const slugMatch = content.match(/slug:\s*(.+)/);

    if (!nCountMatch || !slugMatch) {
      return null;
    }

    const currentN = parseInt(nCountMatch[1], 10);
    const slug = slugMatch[1].trim();

    // Generate journey based on current N
    const entries: JourneyEntry[] = [];
    const contexts = ['initial', 'review', 'validation', 'team', 'architecture'];

    for (let n = 1; n <= currentN; n++) {
      entries.push({
        n_count: n,
        date: `2026-0${Math.min(n, 2)}-${String(n * 5).padStart(2, '0')}`,
        context: contexts[(n - 1) % contexts.length],
        description: n === 1 ? 'Initial observation' : `Occurrence ${n}`,
      });
    }

    return {
      observation: slug,
      currentN,
      entries,
      duration: currentN * 10, // Rough estimate
      contexts: [...new Set(entries.map(e => e.context))],
    };
  }

  timeline(from?: string, to?: string): Array<{ date: string; event: string; detail: string }> {
    const events: Array<{ date: string; event: string; detail: string }> = [];

    for (const [, constraint] of this.constraints) {
      for (const version of constraint.versions) {
        events.push({
          date: version.date,
          event: `${constraint.name} v${version.version}`,
          detail: `N=${version.n_count}: ${version.change_summary}`,
        });
      }
    }

    // Sort by date
    events.sort((a, b) => a.date.localeCompare(b.date));

    // Filter by date range if provided
    if (from || to) {
      return events.filter(e => {
        if (from && e.date < from) return false;
        if (to && e.date > to) return false;
        return true;
      });
    }

    return events;
  }
}

type ConflictType = 'concurrent_modification' | 'stale_state' | 'plan_drift' | 'context_staleness';
type RiskLevel = 'high' | 'medium' | 'low';

interface SessionState {
  session_id: string;
  started_at: string;
  ended_at?: string;
  user: string;
  domain: string;
  files_modified: string[];
  commits?: Array<{ hash: string; message: string; timestamp: string }>;
  conflict_detected?: boolean;
  conflict_type?: ConflictType;
  stale_state_warning?: {
    message: string;
    recommendation: string;
    severity: string;
  };
}

interface Conflict {
  type: ConflictType;
  file: string;
  riskLevel: RiskLevel;
  description: string;
  recommendation: string;
}

interface VerificationResult {
  session_id: string;
  user: string;
  warnings: string[];
  conflicts: Conflict[];
  recommendation: string;
}

class MockCrossSessionSafetyCheck {
  private loadSessionState(filePath: string): SessionState | null {
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  verify(sessionDir: string = SESSIONS_DIR): VerificationResult {
    const conflictState = this.loadSessionState(path.join(sessionDir, 'conflict-state.json'));
    const historicalState = this.loadSessionState(path.join(sessionDir, 'historical-state.json'));

    const warnings: string[] = [];
    const conflicts: Conflict[] = [];

    if (conflictState?.conflict_detected) {
      conflicts.push({
        type: conflictState.conflict_type || 'concurrent_modification',
        file: (conflictState as any).conflict_details?.file || 'unknown',
        riskLevel: 'high',
        description: 'File modified in concurrent session',
        recommendation: 'Pull latest changes before editing',
      });

      if (conflictState.stale_state_warning) {
        warnings.push(conflictState.stale_state_warning.message);
      }
    }

    return {
      session_id: conflictState?.session_id || 'unknown',
      // M-3 fix: Use consistent 'user' property (fixture updated to match interface)
      user: conflictState?.user || 'unknown',
      warnings,
      conflicts,
      recommendation: conflicts.length > 0 ? 'Run git pull before starting' : 'State is consistent',
    };
  }

  history(sessionDir: string = SESSIONS_DIR): SessionState[] {
    const sessions: SessionState[] = [];

    const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const state = this.loadSessionState(path.join(sessionDir, file));
      if (state) {
        sessions.push(state);
      }
    }

    return sessions.sort((a, b) => a.started_at.localeCompare(b.started_at));
  }

  conflicts(sessionDir: string = SESSIONS_DIR): Conflict[] {
    const result = this.verify(sessionDir);
    return result.conflicts;
  }

  detectCrossSessionIncident(sessionDir: string = SESSIONS_DIR): boolean {
    const sessions = this.history(sessionDir);

    // Check for any session with conflict_detected
    return sessions.some(s => s.conflict_detected === true);
  }
}

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 6 Constraint Evolution Skills', () => {
  describe('constraint-versioning', () => {
    let versioning: MockConstraintVersioning;

    beforeEach(() => {
      versioning = new MockConstraintVersioning();
    });

    it('retrieves constraint history', () => {
      const history = versioning.history('git-commit-format');

      expect(history).not.toBeNull();
      expect(history!.name).toBe('git-commit-format');
      expect(history!.versions.length).toBeGreaterThan(0);
    });

    it('shows version progression N=1 to N=9', () => {
      const history = versioning.history('git-commit-format');

      expect(history!.versions[0].n_count).toBe(1);
      expect(history!.versions[history!.versions.length - 1].n_count).toBe(9);
    });

    it('tracks context diversity', () => {
      const history = versioning.history('git-commit-format');

      expect(history!.contextDiversity).toBe(4);
      const contexts = new Set(history!.versions.map(v => v.context));
      expect(contexts.size).toBe(4);
    });

    it('records version timestamps', () => {
      const history = versioning.history('git-commit-format');

      for (const version of history!.versions) {
        expect(version.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('journey shows N=1 to current N progression', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const journey = versioning.journey(n5File);

      expect(journey).not.toBeNull();
      expect(journey!.currentN).toBe(5);
      expect(journey!.entries.length).toBe(5);
      expect(journey!.entries[0].n_count).toBe(1);
    });

    it('journey tracks context diversity', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const journey = versioning.journey(n5File);

      expect(journey!.contexts.length).toBeGreaterThan(0);
    });

    it('journey returns null for non-existent observation', () => {
      const journey = versioning.journey('/nonexistent.md');

      expect(journey).toBeNull();
    });

    it('timeline returns sorted events', () => {
      const timeline = versioning.timeline();

      expect(timeline.length).toBeGreaterThan(0);

      // Verify sorted by date
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].date >= timeline[i - 1].date).toBe(true);
      }
    });

    it('timeline filters by date range', () => {
      const filtered = versioning.timeline('2025-11-01', '2025-12-01');

      for (const event of filtered) {
        expect(event.date >= '2025-11-01').toBe(true);
        expect(event.date <= '2025-12-01').toBe(true);
      }
    });

    it('returns null for unknown constraint', () => {
      const history = versioning.history('nonexistent-constraint');

      expect(history).toBeNull();
    });
  });

  describe('cross-session-safety-check', () => {
    let safetyCheck: MockCrossSessionSafetyCheck;

    beforeEach(() => {
      safetyCheck = new MockCrossSessionSafetyCheck();
    });

    it('verify detects conflicts from fixture', () => {
      const result = safetyCheck.verify(SESSIONS_DIR);

      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it('verify provides recommendations', () => {
      const result = safetyCheck.verify(SESSIONS_DIR);

      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.length).toBeGreaterThan(0);
    });

    it('history returns session list', () => {
      const sessions = safetyCheck.history(SESSIONS_DIR);

      expect(sessions.length).toBeGreaterThan(0);
    });

    it('history includes file modification info', () => {
      const sessions = safetyCheck.history(SESSIONS_DIR);
      const sessionWithFiles = sessions.find(s => s.files_modified?.length > 0);

      expect(sessionWithFiles).toBeDefined();
      expect(sessionWithFiles!.files_modified.length).toBeGreaterThan(0);
    });

    it('conflicts returns conflict list', () => {
      const conflicts = safetyCheck.conflicts(SESSIONS_DIR);

      expect(Array.isArray(conflicts)).toBe(true);
    });

    it('detects historical cross-session incident', () => {
      const hasIncident = safetyCheck.detectCrossSessionIncident(SESSIONS_DIR);

      expect(hasIncident).toBe(true);
    });

    it('conflicts have risk level', () => {
      const conflicts = safetyCheck.conflicts(SESSIONS_DIR);

      for (const conflict of conflicts) {
        expect(['high', 'medium', 'low']).toContain(conflict.riskLevel);
      }
    });

    it('conflicts have recommendations', () => {
      const conflicts = safetyCheck.conflicts(SESSIONS_DIR);

      for (const conflict of conflicts) {
        expect(conflict.recommendation).toBeDefined();
        expect(conflict.recommendation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('constraint-versioning to pbd-strength integration', () => {
    let versioning: MockConstraintVersioning;

    beforeEach(() => {
      versioning = new MockConstraintVersioning();
    });

    it('journey N-count matches observation strength', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const journey = versioning.journey(n5File);

      // N=5 should be "strong"
      expect(journey!.currentN).toBeGreaterThanOrEqual(5);
    });

    it('constraint versions align with N-count thresholds', () => {
      const history = versioning.history('git-commit-format');

      // Should have progression through weak (1-2), medium (3-4), strong (5+)
      const nCounts = history!.versions.map(v => v.n_count);

      expect(nCounts.some(n => n <= 2)).toBe(true); // Had weak phase
      expect(nCounts.some(n => n >= 5)).toBe(true); // Reached strong
    });
  });
});
