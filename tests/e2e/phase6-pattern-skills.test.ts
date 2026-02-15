/**
 * Phase 6 Pattern Detection Skills Contract Tests
 *
 * Tests for Stage 6 pattern detection skills:
 *   - pattern-convergence-detector: Monitor N=2 patterns for convergence
 *
 * Created during Phase 6 Stage 6 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// =============================================================================
// Fixture Paths
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures/phase6');
const PATTERNS_DIR = path.join(FIXTURES_DIR, 'patterns');

// =============================================================================
// Mock Implementations for Contract Testing
// =============================================================================

interface PatternFrontmatter {
  slug: string;
  status: string;
  n_count: number;
  r_count: number;
  c_count: number;
  d_count: number;
  category?: string;
  root_cause?: string;
  keywords?: string[];
  related?: string[];
}

// M-6 fix: Extract cluster name generation to named function
function generateClusterName(rootCause: string, category?: string): string {
  // Convert root_cause like "missing-timeout-config" to "Missing-Timeout"
  const words = rootCause.split('-').slice(0, 2);
  const titleCased = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
  return `${category || 'general'}-${titleCased.toLowerCase()}`;
}

interface ConvergenceSignal {
  type: 'root_cause' | 'category' | 'keywords' | 'related';
  weight: 'high' | 'medium' | 'low';
  detail: string;
}

interface PatternMatch {
  pattern: string;
  file: string;
  n_count: number;
  root_cause?: string;
  category?: string;
  signals: ConvergenceSignal[];
  combinedN: number;
}

interface PatternCluster {
  name: string;
  members: string[];
  root_cause: string;
  category?: string;
  combinedN: number;
  recommendation: string;
}

interface ScanResult {
  clusters: PatternCluster[];
  unclusteredPatterns: string[];
}

class MockPatternConvergenceDetector {
  private parseFrontmatter(filePath: string): PatternFrontmatter | null {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    try {
      return yaml.parse(match[1]) as PatternFrontmatter;
    } catch {
      return null;
    }
  }

  private loadN2Patterns(directory: string): Array<{ file: string; frontmatter: PatternFrontmatter }> {
    const patterns: Array<{ file: string; frontmatter: PatternFrontmatter }> = [];

    if (!fs.existsSync(directory)) return patterns;

    const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(directory, file);
      const frontmatter = this.parseFrontmatter(filePath);
      if (frontmatter && frontmatter.n_count === 2) {
        patterns.push({ file, frontmatter });
      }
    }

    return patterns;
  }

  private findConvergenceSignals(
    pattern1: PatternFrontmatter,
    pattern2: PatternFrontmatter
  ): ConvergenceSignal[] {
    const signals: ConvergenceSignal[] = [];

    // Check root_cause match (high weight)
    if (pattern1.root_cause && pattern2.root_cause &&
        pattern1.root_cause === pattern2.root_cause) {
      signals.push({
        type: 'root_cause',
        weight: 'high',
        detail: `Shared root cause: ${pattern1.root_cause}`,
      });
    }

    // Check category match (medium weight)
    if (pattern1.category && pattern2.category &&
        pattern1.category === pattern2.category) {
      signals.push({
        type: 'category',
        weight: 'medium',
        detail: `Same category: ${pattern1.category}`,
      });
    }

    // M-2 fix: Check for keyword overlap (low weight)
    if (pattern1.keywords && pattern2.keywords) {
      const keywords1 = new Set(pattern1.keywords);
      const overlap = pattern2.keywords.filter(k => keywords1.has(k));
      if (overlap.length > 0) {
        signals.push({
          type: 'keywords',
          weight: 'low',
          detail: `Shared keywords: ${overlap.join(', ')}`,
        });
      }
    }

    // M-2 fix: Check for related pattern links (medium weight)
    if (pattern1.related && pattern1.related.includes(pattern2.slug)) {
      signals.push({
        type: 'related',
        weight: 'medium',
        detail: `${pattern1.slug} explicitly links to ${pattern2.slug}`,
      });
    }
    if (pattern2.related && pattern2.related.includes(pattern1.slug)) {
      signals.push({
        type: 'related',
        weight: 'medium',
        detail: `${pattern2.slug} explicitly links to ${pattern1.slug}`,
      });
    }

    return signals;
  }

  scan(directory: string = PATTERNS_DIR): ScanResult {
    const patterns = this.loadN2Patterns(directory);
    const clusters: PatternCluster[] = [];
    const clustered = new Set<string>();

    // Group by root_cause
    const byRootCause = new Map<string, Array<{ file: string; frontmatter: PatternFrontmatter }>>();

    for (const pattern of patterns) {
      if (pattern.frontmatter.root_cause) {
        const key = pattern.frontmatter.root_cause;
        if (!byRootCause.has(key)) {
          byRootCause.set(key, []);
        }
        byRootCause.get(key)!.push(pattern);
      }
    }

    // Create clusters from groups with 2+ members
    for (const [rootCause, members] of byRootCause) {
      if (members.length >= 2) {
        const combinedN = members.reduce((sum, m) => sum + m.frontmatter.n_count, 0);
        const category = members[0].frontmatter.category;
        const slugs = members.map(m => m.frontmatter.slug);

        // M-6 fix: Use extracted function for cluster name generation
        const clusterName = generateClusterName(rootCause, category);

        clusters.push({
          name: clusterName,
          members: slugs,
          root_cause: rootCause,
          category,
          combinedN,
          recommendation: combinedN >= 4
            ? 'Consider consolidation into unified constraint'
            : `Watch for additional occurrences (N=${combinedN})`,
        });

        for (const member of members) {
          clustered.add(member.file);
        }
      }
    }

    // Find unclustered patterns
    const unclustered = patterns
      .filter(p => !clustered.has(p.file))
      .map(p => p.file);

    return { clusters, unclusteredPatterns: unclustered };
  }

  watch(observationPath: string, directory: string = PATTERNS_DIR): PatternMatch[] {
    const targetFrontmatter = this.parseFrontmatter(observationPath);
    if (!targetFrontmatter) {
      throw new Error('Observation not found');
    }

    const matches: PatternMatch[] = [];
    const patterns = this.loadN2Patterns(directory);

    for (const pattern of patterns) {
      if (pattern.frontmatter.slug === targetFrontmatter.slug) continue;

      const signals = this.findConvergenceSignals(targetFrontmatter, pattern.frontmatter);

      if (signals.length > 0) {
        matches.push({
          pattern: pattern.frontmatter.slug,
          file: pattern.file,
          n_count: pattern.frontmatter.n_count,
          root_cause: pattern.frontmatter.root_cause,
          category: pattern.frontmatter.category,
          signals,
          combinedN: targetFrontmatter.n_count + pattern.frontmatter.n_count,
        });
      }
    }

    // Sort by number of signals (most signals first)
    return matches.sort((a, b) => b.signals.length - a.signals.length);
  }

  clusters(directory: string = PATTERNS_DIR): PatternCluster[] {
    return this.scan(directory).clusters;
  }

  getCombinedNCount(patterns: PatternFrontmatter[]): number {
    return patterns.reduce((sum, p) => sum + p.n_count, 0);
  }
}

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 6 Pattern Detection Skills', () => {
  describe('pattern-convergence-detector', () => {
    let detector: MockPatternConvergenceDetector;

    beforeEach(() => {
      detector = new MockPatternConvergenceDetector();
    });

    it('scans for converging N=2 patterns', () => {
      const result = detector.scan(PATTERNS_DIR);

      expect(result).toHaveProperty('clusters');
      expect(result).toHaveProperty('unclusteredPatterns');
    });

    it('finds patterns with same root_cause', () => {
      const result = detector.scan(PATTERNS_DIR);

      // The fixtures have two patterns with same root_cause
      expect(result.clusters.length).toBeGreaterThan(0);

      const cluster = result.clusters[0];
      expect(cluster.root_cause).toBe('missing-timeout-config');
      expect(cluster.members.length).toBe(2);
    });

    it('calculates combined N-count for clusters', () => {
      const result = detector.scan(PATTERNS_DIR);
      const cluster = result.clusters[0];

      // Two N=2 patterns should give combined N=4
      expect(cluster.combinedN).toBe(4);
    });

    it('provides consolidation recommendation', () => {
      const result = detector.scan(PATTERNS_DIR);
      const cluster = result.clusters[0];

      expect(cluster.recommendation).toBeDefined();
      expect(cluster.recommendation.length).toBeGreaterThan(0);
    });

    it('watch returns potential matches', () => {
      const patternA = path.join(PATTERNS_DIR, 'converging-n2-a.md');
      const matches = detector.watch(patternA, PATTERNS_DIR);

      expect(matches.length).toBeGreaterThan(0);
    });

    it('watch calculates combined N-count', () => {
      const patternA = path.join(PATTERNS_DIR, 'converging-n2-a.md');
      const matches = detector.watch(patternA, PATTERNS_DIR);

      const match = matches[0];
      expect(match.combinedN).toBe(4); // 2 + 2
    });

    it('watch returns convergence signals', () => {
      const patternA = path.join(PATTERNS_DIR, 'converging-n2-a.md');
      const matches = detector.watch(patternA, PATTERNS_DIR);

      const match = matches[0];
      expect(match.signals.length).toBeGreaterThan(0);
      expect(match.signals.some(s => s.type === 'root_cause')).toBe(true);
    });

    it('signals have correct weight levels', () => {
      const patternA = path.join(PATTERNS_DIR, 'converging-n2-a.md');
      const matches = detector.watch(patternA, PATTERNS_DIR);

      for (const match of matches) {
        for (const signal of match.signals) {
          expect(['high', 'medium', 'low']).toContain(signal.weight);
        }
      }
    });

    it('clusters returns cluster list', () => {
      const clusters = detector.clusters(PATTERNS_DIR);

      expect(Array.isArray(clusters)).toBe(true);
      expect(clusters.length).toBeGreaterThan(0);
    });

    it('cluster has required properties', () => {
      const clusters = detector.clusters(PATTERNS_DIR);
      const cluster = clusters[0];

      expect(cluster).toHaveProperty('name');
      expect(cluster).toHaveProperty('members');
      expect(cluster).toHaveProperty('root_cause');
      expect(cluster).toHaveProperty('combinedN');
      expect(cluster).toHaveProperty('recommendation');
    });

    it('watch throws for non-existent observation', () => {
      expect(() => detector.watch('/nonexistent.md', PATTERNS_DIR))
        .toThrow('Observation not found');
    });

    it('sorts matches by signal count', () => {
      const patternA = path.join(PATTERNS_DIR, 'converging-n2-a.md');
      const matches = detector.watch(patternA, PATTERNS_DIR);

      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].signals.length).toBeGreaterThanOrEqual(matches[i].signals.length);
      }
    });

    it('getCombinedNCount aggregates correctly', () => {
      const patterns = [
        { slug: 'a', status: 'active', n_count: 2, r_count: 2, c_count: 1, d_count: 0 },
        { slug: 'b', status: 'active', n_count: 2, r_count: 2, c_count: 1, d_count: 0 },
        { slug: 'c', status: 'active', n_count: 3, r_count: 3, c_count: 2, d_count: 0 },
      ];

      const combined = detector.getCombinedNCount(patterns);
      expect(combined).toBe(7);
    });
  });

  describe('pattern-convergence-detector integration', () => {
    let detector: MockPatternConvergenceDetector;

    beforeEach(() => {
      detector = new MockPatternConvergenceDetector();
    });

    it('clusters with combinedN >= 4 recommend consolidation', () => {
      const clusters = detector.clusters(PATTERNS_DIR);

      for (const cluster of clusters) {
        if (cluster.combinedN >= 4) {
          expect(cluster.recommendation.toLowerCase()).toContain('consolidat');
        }
      }
    });

    it('cluster detection enables early constraint promotion', () => {
      const result = detector.scan(PATTERNS_DIR);

      // If two N=2 patterns share root cause, combined N=4 enables early action
      const highValueCluster = result.clusters.find(c => c.combinedN >= 4);

      expect(highValueCluster).toBeDefined();
      // Combined N=4 is stronger than either individual N=2
    });
  });
});
