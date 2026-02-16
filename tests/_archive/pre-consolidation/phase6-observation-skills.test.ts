/**
 * Phase 6 Observation Management Skills Contract Tests
 *
 * Tests for Stage 4 observation management skills:
 *   - pbd-strength-classifier: Classify observation strength
 *   - observation-refactoring: Detect and execute maintenance operations
 *
 * Created during Phase 6 Stage 4 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// =============================================================================
// Fixture Paths
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures/phase6');
const OBSERVATIONS_DIR = path.join(FIXTURES_DIR, 'observations');

// =============================================================================
// Mock Implementations for Contract Testing
// =============================================================================

type Strength = 'weak' | 'medium' | 'strong';

interface ObservationFrontmatter {
  slug: string;
  status: string;
  n_count: number;
  r_count: number;
  c_count: number;
  d_count: number;
  created?: string;
  frame?: number;
  root_cause?: string;
  category?: string;
}

interface StrengthAssessment {
  file: string;
  slug: string;
  counters: {
    n: number;
    r: number;
    c: number;
    d: number;
  };
  strength: Strength;
  constraintCandidate: boolean;
  candidacyCriteria: {
    rThreshold: boolean;
    cThreshold: boolean;
    multipleSources: boolean;
    lowDisconfirmation: boolean;
  };
  warning?: string;
}

class MockPBDStrengthClassifier {
  private parseFrontmatter(filePath: string): ObservationFrontmatter | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    try {
      return yaml.parse(match[1]) as ObservationFrontmatter;
    } catch {
      return null;
    }
  }

  private classifyStrength(n: number): Strength {
    if (n <= 2) return 'weak';
    if (n <= 4) return 'medium';
    return 'strong';
  }

  assess(filePath: string): StrengthAssessment {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Observation not found: ${filePath}`);
    }

    const frontmatter = this.parseFrontmatter(filePath);

    // I-4 fix: Handle missing frontmatter gracefully with warning instead of throwing
    if (!frontmatter) {
      return {
        file: filePath,
        slug: path.basename(filePath, '.md'),
        counters: { n: 0, r: 0, c: 0, d: 0 },
        strength: 'weak',
        constraintCandidate: false,
        candidacyCriteria: {
          rThreshold: false,
          cThreshold: false,
          multipleSources: false,
          lowDisconfirmation: false,
        },
        warning: 'No frontmatter found, defaulting to weak strength',
      };
    }

    const { slug, n_count, r_count, c_count, d_count } = frontmatter;

    // I-4 fix: Validate n_count type and range
    let warning: string | undefined;
    let validNCount = n_count;
    if (typeof n_count !== 'number' || !Number.isInteger(n_count)) {
      warning = `Invalid n_count type: ${typeof n_count}, treating as 0`;
      validNCount = 0;
    } else if (n_count < 0) {
      warning = `Negative n_count: ${n_count}, treating as 0`;
      validNCount = 0;
    }

    const strength = this.classifyStrength(validNCount);

    const rThreshold = r_count >= 3;
    const cThreshold = c_count >= 2;
    const multipleSources = r_count >= 2; // Simplified: assume multiple sources if R>=2
    const lowDisconfirmation = d_count === 0 || d_count < r_count / 2;

    return {
      file: filePath,
      slug,
      counters: {
        n: validNCount,
        r: r_count,
        c: c_count,
        d: d_count,
      },
      strength,
      constraintCandidate: rThreshold && cThreshold && multipleSources && lowDisconfirmation,
      candidacyCriteria: {
        rThreshold,
        cThreshold,
        multipleSources,
        lowDisconfirmation,
      },
      warning,
    };
  }

  list(strengthFilter?: Strength): StrengthAssessment[] {
    const files = fs.readdirSync(OBSERVATIONS_DIR).filter(f => f.endsWith('.md'));
    const assessments: StrengthAssessment[] = [];

    for (const file of files) {
      try {
        const assessment = this.assess(path.join(OBSERVATIONS_DIR, file));
        if (!strengthFilter || assessment.strength === strengthFilter) {
          assessments.push(assessment);
        }
      } catch {
        // Skip files without valid frontmatter
      }
    }

    return assessments;
  }

  candidates(): StrengthAssessment[] {
    return this.list().filter(a => a.constraintCandidate);
  }
}

type RefactoringOperation = 'rename' | 'consolidate' | 'promote' | 'archive';

interface RefactoringCandidate {
  operation: RefactoringOperation;
  files: string[];
  reason: string;
}

interface RefactoringResult {
  operation: RefactoringOperation;
  success: boolean;
  message: string;
  auditEntry?: string;
}

class MockObservationRefactoring {
  private parseFrontmatter(filePath: string): ObservationFrontmatter | null {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    try {
      return yaml.parse(match[1]) as ObservationFrontmatter;
    } catch {
      return null;
    }
  }

  private isDatePrefixed(filename: string): boolean {
    return /^\d{4}-\d{2}-\d{2}-/.test(filename);
  }

  private isF2Protected(filePath: string): boolean {
    const frontmatter = this.parseFrontmatter(filePath);
    // M-4 fix: Use d_count consistently (frame property was undefined in fixtures)
    return (frontmatter?.d_count || 0) >= 2;
  }

  scan(directory: string = OBSERVATIONS_DIR): RefactoringCandidate[] {
    const candidates: RefactoringCandidate[] = [];
    const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));

    // I-3 fix: Build map for consolidate detection
    const byRootCause = new Map<string, string[]>();
    const byCategory = new Map<string, string[]>();

    for (const file of files) {
      const filePath = path.join(directory, file);

      // Check for rename candidates (date-prefixed)
      if (this.isDatePrefixed(file)) {
        candidates.push({
          operation: 'rename',
          files: [file],
          reason: 'Date-prefixed filename',
        });
      }

      // Check for promote candidates (N>=5)
      const frontmatter = this.parseFrontmatter(filePath);
      if (frontmatter && frontmatter.n_count >= 5) {
        candidates.push({
          operation: 'promote',
          files: [file],
          reason: `N=${frontmatter.n_count} validated pattern`,
        });
      }

      // Check for archive candidates (large files)
      const stats = fs.statSync(filePath);
      if (stats.size > 50 * 1024) {
        candidates.push({
          operation: 'archive',
          files: [file],
          reason: 'Exceeds 50KB threshold',
        });
      }

      // I-3 fix: Collect data for consolidate detection
      if (frontmatter?.root_cause) {
        const existing = byRootCause.get(frontmatter.root_cause) || [];
        existing.push(file);
        byRootCause.set(frontmatter.root_cause, existing);
      }
      if (frontmatter?.category) {
        const existing = byCategory.get(frontmatter.category) || [];
        existing.push(file);
        byCategory.set(frontmatter.category, existing);
      }
    }

    // I-3 fix: Detect consolidate candidates (same root_cause or category)
    for (const [rootCause, relatedFiles] of byRootCause) {
      if (relatedFiles.length >= 2) {
        candidates.push({
          operation: 'consolidate',
          files: relatedFiles,
          reason: `Same root_cause: ${rootCause}`,
        });
      }
    }

    return candidates;
  }

  rename(oldPath: string, newPath: string, dryRun = false): RefactoringResult {
    if (!fs.existsSync(oldPath)) {
      return {
        operation: 'rename',
        success: false,
        message: `Observation not found: ${oldPath}`,
      };
    }

    if (dryRun) {
      return {
        operation: 'rename',
        success: true,
        message: `Would rename ${oldPath} to ${newPath}`,
        auditEntry: `DRY-RUN: rename ${oldPath} -> ${newPath}`,
      };
    }

    // In real implementation, would do git mv
    return {
      operation: 'rename',
      success: true,
      message: `Renamed ${oldPath} to ${newPath}`,
      auditEntry: `rename ${oldPath} -> ${newPath}`,
    };
  }

  consolidate(obs1: string, obs2: string, dryRun = false): RefactoringResult {
    if (obs1 === obs2) {
      return {
        operation: 'consolidate',
        success: false,
        message: 'Cannot consolidate with self',
      };
    }

    if (!fs.existsSync(obs1) || !fs.existsSync(obs2)) {
      return {
        operation: 'consolidate',
        success: false,
        message: 'One or both observations not found',
      };
    }

    if (dryRun) {
      return {
        operation: 'consolidate',
        success: true,
        message: `Would consolidate ${obs1} and ${obs2}`,
        auditEntry: `DRY-RUN: consolidate ${obs1} + ${obs2}`,
      };
    }

    return {
      operation: 'consolidate',
      success: true,
      message: `Consolidated ${obs1} and ${obs2}`,
      auditEntry: `consolidate ${obs1} + ${obs2}`,
    };
  }

  promote(observation: string, dryRun = false): RefactoringResult {
    if (!fs.existsSync(observation)) {
      return {
        operation: 'promote',
        success: false,
        message: `Observation not found: ${observation}`,
      };
    }

    const frontmatter = this.parseFrontmatter(observation);
    if (!frontmatter || frontmatter.n_count < 5) {
      return {
        operation: 'promote',
        success: false,
        message: 'N-count below threshold (N>=5 required)',
      };
    }

    if (dryRun) {
      return {
        operation: 'promote',
        success: true,
        message: `Would promote ${observation} to constraint`,
        auditEntry: `DRY-RUN: promote ${observation}`,
      };
    }

    return {
      operation: 'promote',
      success: true,
      message: `Promoted ${observation} to constraint`,
      auditEntry: `promote ${observation}`,
    };
  }

  archive(observation: string, force = false, dryRun = false): RefactoringResult {
    if (!fs.existsSync(observation)) {
      return {
        operation: 'archive',
        success: false,
        message: `Observation not found: ${observation}`,
      };
    }

    if (this.isF2Protected(observation) && !force) {
      return {
        operation: 'archive',
        success: false,
        message: 'F=2 protected, use --force to override',
      };
    }

    if (dryRun) {
      return {
        operation: 'archive',
        success: true,
        message: `Would archive ${observation}`,
        auditEntry: `DRY-RUN: archive ${observation}`,
      };
    }

    return {
      operation: 'archive',
      success: true,
      message: `Archived ${observation}`,
      auditEntry: `archive ${observation}`,
    };
  }
}

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 6 Observation Management Skills', () => {
  describe('pbd-strength-classifier', () => {
    let classifier: MockPBDStrengthClassifier;

    beforeEach(() => {
      classifier = new MockPBDStrengthClassifier();
    });

    it('classifies N=1 as weak', () => {
      const n1File = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = classifier.assess(n1File);

      expect(result.strength).toBe('weak');
      expect(result.counters.n).toBe(1);
    });

    it('classifies N=3 as medium', () => {
      const n3File = path.join(OBSERVATIONS_DIR, 'n3-sample.md');
      const result = classifier.assess(n3File);

      expect(result.strength).toBe('medium');
      expect(result.counters.n).toBe(3);
    });

    it('classifies N=5+ as strong', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const result = classifier.assess(n5File);

      expect(result.strength).toBe('strong');
      expect(result.counters.n).toBeGreaterThanOrEqual(5);
    });

    it('identifies constraint candidates correctly', () => {
      const n3File = path.join(OBSERVATIONS_DIR, 'n3-sample.md');
      const result = classifier.assess(n3File);

      // N=3, R=3, C=2, D=0 should be a constraint candidate
      expect(result.constraintCandidate).toBe(true);
      expect(result.candidacyCriteria.rThreshold).toBe(true);
      expect(result.candidacyCriteria.cThreshold).toBe(true);
    });

    it('weak observations are not constraint candidates', () => {
      const n1File = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = classifier.assess(n1File);

      expect(result.constraintCandidate).toBe(false);
    });

    it('lists observations by strength filter', () => {
      const weakList = classifier.list('weak');
      const strongList = classifier.list('strong');

      expect(weakList.every(a => a.strength === 'weak')).toBe(true);
      expect(strongList.every(a => a.strength === 'strong')).toBe(true);
    });

    it('candidates returns only eligible observations', () => {
      const candidates = classifier.candidates();

      for (const candidate of candidates) {
        expect(candidate.constraintCandidate).toBe(true);
      }
    });

    it('throws error for non-existent file', () => {
      expect(() => classifier.assess('/nonexistent/observation.md'))
        .toThrow('Observation not found');
    });

    it('parses all R/C/D counters', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const result = classifier.assess(n5File);

      expect(result.counters).toHaveProperty('n');
      expect(result.counters).toHaveProperty('r');
      expect(result.counters).toHaveProperty('c');
      expect(result.counters).toHaveProperty('d');
    });
  });

  describe('observation-refactoring', () => {
    let refactoring: MockObservationRefactoring;

    beforeEach(() => {
      refactoring = new MockObservationRefactoring();
    });

    it('scans for refactoring candidates', () => {
      const candidates = refactoring.scan(OBSERVATIONS_DIR);

      expect(Array.isArray(candidates)).toBe(true);
    });

    it('detects promote candidates (N>=5)', () => {
      const candidates = refactoring.scan(OBSERVATIONS_DIR);
      const promoteCandidate = candidates.find(
        c => c.operation === 'promote' && c.files.includes('n5-sample.md')
      );

      expect(promoteCandidate).toBeDefined();
    });

    it('rename returns success for dry run', () => {
      const n1File = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = refactoring.rename(n1File, 'new-name.md', true);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Would rename');
      expect(result.auditEntry).toContain('DRY-RUN');
    });

    it('consolidate prevents self-consolidation', () => {
      const file = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = refactoring.consolidate(file, file);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot consolidate with self');
    });

    it('consolidate works with two different files', () => {
      const file1 = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const file2 = path.join(OBSERVATIONS_DIR, 'n3-sample.md');
      const result = refactoring.consolidate(file1, file2, true);

      expect(result.success).toBe(true);
    });

    it('promote requires N>=5', () => {
      const n1File = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = refactoring.promote(n1File);

      expect(result.success).toBe(false);
      expect(result.message).toContain('below threshold');
    });

    it('promote succeeds for N>=5 observation', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const result = refactoring.promote(n5File, true);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Would promote');
    });

    it('archive returns audit entry', () => {
      const n1File = path.join(OBSERVATIONS_DIR, 'n1-sample.md');
      const result = refactoring.archive(n1File, false, true);

      expect(result.auditEntry).toBeDefined();
    });

    it('operations include audit trail', () => {
      const n5File = path.join(OBSERVATIONS_DIR, 'n5-sample.md');
      const result = refactoring.promote(n5File, true);

      expect(result.auditEntry).toBeDefined();
      expect(result.auditEntry).toContain('promote');
    });
  });

  describe('pbd-strength-classifier to observation-refactoring integration', () => {
    let classifier: MockPBDStrengthClassifier;
    let refactoring: MockObservationRefactoring;

    beforeEach(() => {
      classifier = new MockPBDStrengthClassifier();
      refactoring = new MockObservationRefactoring();
    });

    it('strong observations from classifier are promote candidates', () => {
      // Get strong observations from classifier
      const strongObs = classifier.list('strong');

      // Verify they appear as promote candidates in refactoring
      const candidates = refactoring.scan(OBSERVATIONS_DIR);
      const promoteCandidates = candidates.filter(c => c.operation === 'promote');

      for (const strong of strongObs) {
        const filename = path.basename(strong.file);
        const isPromoteCandidate = promoteCandidates.some(
          c => c.files.includes(filename)
        );
        expect(isPromoteCandidate).toBe(true);
      }
    });

    it('constraint candidates can be promoted', () => {
      const candidates = classifier.candidates();

      for (const candidate of candidates) {
        if (candidate.counters.n >= 5) {
          const result = refactoring.promote(candidate.file, true);
          expect(result.success).toBe(true);
        }
      }
    });
  });
});
