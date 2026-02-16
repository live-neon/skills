/**
 * Phase 6 Workflow Skills Contract Tests
 *
 * Tests for Stage 2 workflow encoding skills:
 *   - loop-closer: Detect DEFERRED/PLACEHOLDER/TODO markers
 *   - parallel-decision: 5-factor framework
 *   - threshold-delegator: Auto-delegation at threshold
 *
 * Created during Phase 6 Stage 2 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Fixture Paths
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures/phase6');

// =============================================================================
// Mock Implementations for Contract Testing
// =============================================================================

interface LoopMatch {
  type: 'deferred' | 'placeholder' | 'todo';
  file: string;
  line?: number;
  content: string;
}

class MockLoopCloser {
  scan(options: { type?: string; path?: string } = {}): LoopMatch[] {
    const matches: LoopMatch[] = [];
    const targetPath = options.path || FIXTURES_DIR;
    const typeFilter = options.type || 'all';

    // Scan markers directory
    const markersDir = path.join(targetPath, 'markers');
    if (fs.existsSync(markersDir)) {
      const files = fs.readdirSync(markersDir);

      for (const file of files) {
        const filePath = path.join(markersDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // DEFERRED detection
          if ((typeFilter === 'all' || typeFilter === 'deferred') &&
              line.includes('status: DEFERRED')) {
            matches.push({
              type: 'deferred',
              file: filePath,
              line: index + 1,
              content: line.trim(),
            });
          }

          // PLACEHOLDER detection
          if ((typeFilter === 'all' || typeFilter === 'placeholders') &&
              (line.includes('<!-- PLACEHOLDER:') ||
               line.includes('[PLACEHOLDER:') ||
               line.includes('PLACEHOLDER:'))) {
            matches.push({
              type: 'placeholder',
              file: filePath,
              line: index + 1,
              content: line.trim(),
            });
          }

          // TODO detection
          if ((typeFilter === 'all' || typeFilter === 'todos') &&
              (line.includes('// TODO:') ||
               line.includes('# TODO:') ||
               line.includes('/* TODO:') ||
               line.includes('@todo') ||
               line.includes('// FIXME:') ||
               line.includes('// XXX:'))) {
            matches.push({
              type: 'todo',
              file: filePath,
              line: index + 1,
              content: line.trim(),
            });
          }
        });
      }
    }

    return matches;
  }

  check(filePath: string): LoopMatch[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Path not found: ${filePath}`);
    }
    // Read the file directly instead of going through scan()
    // to avoid path doubling (scan adds /markers internally)
    const matches: LoopMatch[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // DEFERRED detection
      if (line.includes('status: DEFERRED')) {
        matches.push({
          type: 'deferred',
          file: filePath,
          line: index + 1,
          content: line.trim(),
        });
      }

      // PLACEHOLDER detection
      if (line.includes('<!-- PLACEHOLDER:') ||
          line.includes('[PLACEHOLDER:') ||
          line.includes('PLACEHOLDER:')) {
        matches.push({
          type: 'placeholder',
          file: filePath,
          line: index + 1,
          content: line.trim(),
        });
      }

      // TODO detection
      if (line.includes('// TODO:') ||
          line.includes('# TODO:') ||
          line.includes('/* TODO:') ||
          line.includes('@todo') ||
          line.includes('// FIXME:') ||
          line.includes('// XXX:')) {
        matches.push({
          type: 'todo',
          file: filePath,
          line: index + 1,
          content: line.trim(),
        });
      }
    });

    return matches;
  }
}

type ParallelFactor = 'dependencies' | 'ordering' | 'resources' | 'isolation' | 'complexity';
type FactorResult = 'PARALLEL' | 'SERIAL';

interface ParallelEvaluation {
  task: string;
  factors: Record<ParallelFactor, FactorResult>;
  score: number;
  recommendation: 'PARALLEL' | 'SERIAL';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
}

class MockParallelDecision {
  private evaluateFactors(task: string): Record<ParallelFactor, FactorResult> {
    const taskLower = task.toLowerCase();

    // Heuristic-based evaluation
    const hasDependency = taskLower.includes('then') ||
                          taskLower.includes('after') ||
                          taskLower.includes('before');
    const hasOrder = taskLower.includes('first') ||
                     taskLower.includes('sequence') ||
                     taskLower.includes('step');
    const isIndependent = taskLower.includes('independent') ||
                          taskLower.includes('parallel') ||
                          taskLower.includes('concurrent');

    // Resource constraint detection (I-2 fix: was always PARALLEL)
    const hasResourceConstraint = taskLower.includes('limited') ||
                                   taskLower.includes('shared') ||
                                   taskLower.includes('memory') ||
                                   taskLower.includes('cpu') ||
                                   taskLower.includes('lock') ||
                                   taskLower.includes('mutex');

    return {
      dependencies: hasDependency ? 'SERIAL' : 'PARALLEL',
      ordering: hasOrder ? 'SERIAL' : 'PARALLEL',
      resources: hasResourceConstraint ? 'SERIAL' : 'PARALLEL',
      isolation: isIndependent ? 'PARALLEL' : (hasDependency ? 'SERIAL' : 'PARALLEL'),
      complexity: hasDependency ? 'SERIAL' : 'PARALLEL',
    };
  }

  evaluate(task: string): ParallelEvaluation {
    const factors = this.evaluateFactors(task);
    const parallelCount = Object.values(factors).filter(v => v === 'PARALLEL').length;

    // I-2 fix: 2-3 factors is context-dependent, not automatically SERIAL
    // For 2-3 factors, lean toward PARALLEL if isolation is PARALLEL, else SERIAL
    let recommendation: 'PARALLEL' | 'SERIAL';
    if (parallelCount >= 4) {
      recommendation = 'PARALLEL';
    } else if (parallelCount <= 1) {
      recommendation = 'SERIAL';
    } else {
      // 2-3 factors: context-dependent - use isolation as tie-breaker
      recommendation = factors.isolation === 'PARALLEL' ? 'PARALLEL' : 'SERIAL';
    }

    const confidence: 'high' | 'medium' | 'low' =
      parallelCount >= 4 || parallelCount <= 1 ? 'high' : 'medium';

    const reasoning: string[] = [];
    if (factors.dependencies === 'SERIAL') reasoning.push('Tasks have dependencies');
    if (factors.ordering === 'SERIAL') reasoning.push('Order matters');
    if (factors.resources === 'SERIAL') reasoning.push('Resource constraints detected');
    if (parallelCount === 5) reasoning.push('All factors favor parallel execution');
    if (parallelCount >= 2 && parallelCount <= 3) {
      reasoning.push(`Context-dependent (${parallelCount}/5 factors favor parallel)`);
    }

    return {
      task,
      factors,
      score: parallelCount,
      recommendation,
      confidence,
      reasoning,
    };
  }

  quick(task: string): 'PARALLEL' | 'SERIAL' {
    return this.evaluate(task).recommendation;
  }

  factors(): string[] {
    return ['dependencies', 'ordering', 'resources', 'isolation', 'complexity'];
  }
}

interface ThresholdCount {
  category: string;
  count: number;
  threshold: number;
  exceeded: boolean;
}

interface DelegationSuggestion {
  category: string;
  agent: string;
  reason: string;
}

class MockThresholdDelegator {
  private counts: Map<string, number> = new Map();
  private thresholds: Map<string, number> = new Map([
    ['findings', 10],
    ['bugs', 15],
    ['docs', 8],
    ['tests', 10],
  ]);

  private agentMap: Record<string, string> = {
    findings: '@implementer',
    bugs: '@planner',
    docs: '@docs-agent',
    tests: '@implementer',
  };

  addCount(category: string, amount: number = 1): void {
    const current = this.counts.get(category) || 0;
    this.counts.set(category, current + amount);
  }

  check(): ThresholdCount[] {
    const results: ThresholdCount[] = [];

    for (const [category, threshold] of this.thresholds) {
      const count = this.counts.get(category) || 0;
      results.push({
        category,
        count,
        threshold,
        exceeded: count > threshold,
      });
    }

    return results;
  }

  configure(category: string, threshold: number): void {
    if (threshold <= 0) {
      throw new Error('Threshold must be positive integer');
    }
    this.thresholds.set(category, threshold);
  }

  suggest(): DelegationSuggestion | null {
    const exceeded = this.check().filter(c => c.exceeded);
    if (exceeded.length === 0) return null;

    const highest = exceeded.sort((a, b) => (b.count - b.threshold) - (a.count - a.threshold))[0];

    return {
      category: highest.category,
      agent: this.agentMap[highest.category] || '@planner',
      reason: `${highest.category} count (${highest.count}) exceeds threshold (${highest.threshold})`,
    };
  }

  reset(): void {
    this.counts.clear();
  }
}

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 6 Workflow Skills', () => {
  describe('loop-closer', () => {
    let loopCloser: MockLoopCloser;

    beforeEach(() => {
      loopCloser = new MockLoopCloser();
    });

    it('detects DEFERRED observations', () => {
      const matches = loopCloser.scan({ type: 'deferred' });

      const deferredMatches = matches.filter(m => m.type === 'deferred');
      expect(deferredMatches.length).toBeGreaterThan(0);
      expect(deferredMatches[0].content).toContain('DEFERRED');
    });

    it('detects PLACEHOLDER markers', () => {
      const matches = loopCloser.scan({ type: 'placeholders' });

      const placeholderMatches = matches.filter(m => m.type === 'placeholder');
      expect(placeholderMatches.length).toBeGreaterThan(0);
    });

    it('detects TODO/FIXME/XXX comments', () => {
      const matches = loopCloser.scan({ type: 'todos' });

      const todoMatches = matches.filter(m => m.type === 'todo');
      expect(todoMatches.length).toBeGreaterThan(0);
    });

    it('returns all types when type=all', () => {
      const matches = loopCloser.scan({ type: 'all' });

      const types = new Set(matches.map(m => m.type));
      expect(types.size).toBeGreaterThanOrEqual(2); // At least 2 types
    });

    it('includes file path and line number in results', () => {
      const matches = loopCloser.scan();

      if (matches.length > 0) {
        expect(matches[0].file).toBeDefined();
        expect(matches[0].line).toBeDefined();
        expect(typeof matches[0].line).toBe('number');
      }
    });

    it('throws error for non-existent path', () => {
      expect(() => loopCloser.check('/nonexistent/path')).toThrow('Path not found');
    });
  });

  describe('parallel-decision', () => {
    let parallelDecision: MockParallelDecision;

    beforeEach(() => {
      parallelDecision = new MockParallelDecision();
    });

    it('evaluates all 5 factors', () => {
      const result = parallelDecision.evaluate('Run independent tests');

      expect(Object.keys(result.factors)).toHaveLength(5);
      expect(result.factors).toHaveProperty('dependencies');
      expect(result.factors).toHaveProperty('ordering');
      expect(result.factors).toHaveProperty('resources');
      expect(result.factors).toHaveProperty('isolation');
      expect(result.factors).toHaveProperty('complexity');
    });

    it('recommends PARALLEL for independent tasks', () => {
      const result = parallelDecision.evaluate('Run 3 independent test modules');

      expect(result.recommendation).toBe('PARALLEL');
      expect(result.confidence).toBe('high');
    });

    it('recommends SERIAL for dependent tasks', () => {
      const result = parallelDecision.evaluate('Create database schema then seed data');

      expect(result.recommendation).toBe('SERIAL');
      expect(result.factors.dependencies).toBe('SERIAL');
    });

    it('provides reasoning for recommendation', () => {
      const result = parallelDecision.evaluate('Build first then deploy');

      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('quick mode returns recommendation only', () => {
      const result = parallelDecision.quick('Independent parallel tasks');

      expect(['PARALLEL', 'SERIAL']).toContain(result);
    });

    it('factors command returns all 5 factor names', () => {
      const factors = parallelDecision.factors();

      expect(factors).toHaveLength(5);
      expect(factors).toContain('dependencies');
      expect(factors).toContain('ordering');
    });

    it('provides score from 0-5', () => {
      const result = parallelDecision.evaluate('Some task');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(5);
    });
  });

  describe('threshold-delegator', () => {
    let delegator: MockThresholdDelegator;

    beforeEach(() => {
      delegator = new MockThresholdDelegator();
    });

    it('tracks counts across categories', () => {
      delegator.addCount('findings', 5);
      delegator.addCount('bugs', 3);

      const status = delegator.check();

      const findings = status.find(s => s.category === 'findings');
      const bugs = status.find(s => s.category === 'bugs');

      expect(findings?.count).toBe(5);
      expect(bugs?.count).toBe(3);
    });

    it('triggers exceeded when count > threshold', () => {
      delegator.addCount('findings', 12); // Default threshold is 10

      const status = delegator.check();
      const findings = status.find(s => s.category === 'findings');

      expect(findings?.exceeded).toBe(true);
    });

    it('suggests appropriate agent', () => {
      delegator.addCount('findings', 12);

      const suggestion = delegator.suggest();

      expect(suggestion).not.toBeNull();
      expect(suggestion?.agent).toBe('@implementer');
    });

    it('suggests planner for bugs category', () => {
      delegator.addCount('bugs', 20);

      const suggestion = delegator.suggest();

      expect(suggestion?.agent).toBe('@planner');
    });

    it('returns null when no thresholds exceeded', () => {
      delegator.addCount('findings', 5);

      const suggestion = delegator.suggest();

      expect(suggestion).toBeNull();
    });

    it('allows threshold configuration', () => {
      delegator.configure('findings', 15);
      delegator.addCount('findings', 12);

      const status = delegator.check();
      const findings = status.find(s => s.category === 'findings');

      expect(findings?.threshold).toBe(15);
      expect(findings?.exceeded).toBe(false);
    });

    it('throws error for invalid threshold', () => {
      expect(() => delegator.configure('findings', 0)).toThrow('positive integer');
      expect(() => delegator.configure('findings', -5)).toThrow('positive integer');
    });

    it('reset clears all counts', () => {
      delegator.addCount('findings', 10);
      delegator.addCount('bugs', 5);
      delegator.reset();

      const status = delegator.check();
      const totalCount = status.reduce((sum, s) => sum + s.count, 0);

      expect(totalCount).toBe(0);
    });
  });
});
