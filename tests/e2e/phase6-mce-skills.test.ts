/**
 * Phase 6 MCE Compliance Skills Contract Tests
 *
 * Tests for Stage 3 MCE compliance skills:
 *   - mce-refactorer: Analyze files for MCE compliance and suggest splits
 *   - hub-subworkflow: Split large docs into hub + sub-documents
 *
 * Created during Phase 6 Stage 3 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Fixture Paths
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures/phase6');
const FILES_DIR = path.join(FIXTURES_DIR, 'files');

// =============================================================================
// Mock Implementations for Contract Testing
// =============================================================================

type FileType = 'test' | 'production' | 'research' | 'documentation' | 'handler';
type SplitStrategy = 'template-type' | 'workflow-stage' | 'concern' |
                     'logging-extraction' | 'responsibility-separation' |
                     'module-pattern' | 'hub-subworkflow';

interface MCELimits {
  test: number;
  production: number;
  handler: number;
  documentation: number;
  research: number;
}

interface AnalysisResult {
  file: string;
  lines: number;
  limit: number;
  fileType: FileType;
  exceeds: boolean;
  strategy?: SplitStrategy;
  suggestedFiles?: string[];
  delegateTo?: string;
}

const MCE_LIMITS: MCELimits = {
  test: 200,
  production: 200,
  handler: 600,
  documentation: 300,
  research: 200, // but accept 75-80% compliance
};

class MockMCERefactorer {
  private detectFileType(filePath: string): FileType {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    if (ext === '.md') return 'documentation';
    if (basename.includes('_test') || basename.includes('.test.') || basename.includes('-test')) return 'test';
    if (basename.includes('handler')) return 'handler';
    if (filePath.includes('research') || filePath.includes('experimental')) return 'research';
    return 'production';
  }

  private getLimit(fileType: FileType): number {
    return MCE_LIMITS[fileType];
  }

  private suggestStrategy(fileType: FileType): SplitStrategy {
    switch (fileType) {
      case 'test':
        return 'template-type';
      case 'production':
        return 'responsibility-separation';
      case 'handler':
        return 'concern';
      case 'documentation':
        return 'hub-subworkflow';
      case 'research':
        return 'module-pattern';
    }
  }

  private generateSplitSuggestion(fileType: FileType, basename: string): string[] {
    const name = basename.replace(/\.(ts|go|js|md)$/, '');

    switch (fileType) {
      case 'test':
        return [`${name}_unit.test.ts`, `${name}_integration.test.ts`];
      case 'production':
        return [`${name}_types.ts`, `${name}_core.ts`, `${name}_helpers.ts`];
      case 'handler':
        return [`${name}_read.ts`, `${name}_write.ts`, `${name}_helpers.ts`];
      case 'research':
        return [`${name}_types.ts`, `${name}_interface.ts`, `${name}_core.ts`];
      default:
        return [];
    }
  }

  analyze(filePath: string): AnalysisResult {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    const fileType = this.detectFileType(filePath);
    const limit = this.getLimit(fileType);
    const exceeds = lines > limit;
    const basename = path.basename(filePath);

    const result: AnalysisResult = {
      file: filePath,
      lines,
      limit,
      fileType,
      exceeds,
    };

    if (exceeds) {
      if (fileType === 'documentation') {
        result.delegateTo = '/hub-subworkflow';
      } else {
        result.strategy = this.suggestStrategy(fileType);
        result.suggestedFiles = this.generateSplitSuggestion(fileType, basename);
      }
    }

    return result;
  }

  suggest(filePath: string): string {
    const result = this.analyze(filePath);
    if (!result.exceeds) {
      return `File is MCE compliant (${result.lines}/${result.limit} lines)`;
    }
    if (result.delegateTo) {
      return `Delegating to ${result.delegateTo}`;
    }
    return `Strategy: ${result.strategy}`;
  }

  strategies(): Record<FileType, SplitStrategy[]> {
    return {
      test: ['template-type', 'workflow-stage', 'concern'],
      production: ['logging-extraction', 'responsibility-separation', 'concern'],
      handler: ['concern', 'responsibility-separation'],
      documentation: ['hub-subworkflow'],
      research: ['module-pattern'],
    };
  }
}

interface Section {
  title: string;
  startLine: number;
  endLine: number;
  lines: number;
}

interface HubAnalysisResult {
  file: string;
  lines: number;
  threshold: number;
  exceeds: boolean;
  sections: Section[];
  recommendSplit: boolean;
}

interface HubSuggestion {
  hub: string;
  hubLines: number;
  subDocuments: Array<{
    name: string;
    focus: string;
    estimatedLines: number;
  }>;
}

class MockHubSubworkflow {
  private detectSections(content: string): Section[] {
    const sections: Section[] = [];
    const lines = content.split('\n');
    let currentSection: Section | null = null;

    lines.forEach((line, index) => {
      // Detect h2 headings as section boundaries
      if (line.startsWith('## ')) {
        if (currentSection) {
          currentSection.endLine = index;
          currentSection.lines = currentSection.endLine - currentSection.startLine;
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          startLine: index + 1,
          endLine: lines.length,
          lines: 0,
        };
      }
    });

    if (currentSection) {
      currentSection.endLine = lines.length;
      currentSection.lines = currentSection.endLine - currentSection.startLine;
      sections.push(currentSection);
    }

    return sections;
  }

  analyze(filePath: string): HubAnalysisResult {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath);
    if (ext !== '.md') {
      throw new Error('Not a documentation file');
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    const threshold = 300;
    const exceeds = lines > threshold;
    const sections = this.detectSections(content);

    return {
      file: filePath,
      lines,
      threshold,
      exceeds,
      sections,
      recommendSplit: exceeds || sections.length >= 3,
    };
  }

  suggest(filePath: string): HubSuggestion | null {
    const analysis = this.analyze(filePath);

    if (!analysis.recommendSplit) {
      return null;
    }

    const basename = path.basename(filePath, '.md');
    const hubLines = 100 + (analysis.sections.length * 10); // Approximate

    return {
      hub: `${basename}.md`,
      hubLines,
      subDocuments: analysis.sections.map(section => ({
        name: `${basename}-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.md`,
        focus: section.title,
        estimatedLines: Math.min(section.lines, 200),
      })),
    };
  }

  template(filePath: string): string {
    const analysis = this.analyze(filePath);
    const basename = path.basename(filePath, '.md');
    const title = basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let template = `# ${title} Hub\n\n`;
    template += '## Quick Reference\n\n';
    template += '| Workflow | When to Use | Link |\n';
    template += '|----------|-------------|------|\n';

    for (const section of analysis.sections) {
      const slug = section.title.toLowerCase().replace(/\s+/g, '-');
      template += `| ${section.title} | [trigger] | [${basename}-${slug}.md] |\n`;
    }

    template += '\n## Decision Tree\n\n';
    template += '```\n';
    template += `Working with ${title.toLowerCase()}?\n`;
    for (let i = 0; i < analysis.sections.length; i++) {
      const section = analysis.sections[i];
      const slug = section.title.toLowerCase().replace(/\s+/g, '-');
      const prefix = i === analysis.sections.length - 1 ? '└──' : '├──';
      template += `${prefix} ${section.title}? → ${basename}-${slug}.md\n`;
    }
    template += '```\n';

    return template;
  }
}

// =============================================================================
// Test Scenarios
// =============================================================================

describe('Phase 6 MCE Compliance Skills', () => {
  describe('mce-refactorer', () => {
    let refactorer: MockMCERefactorer;

    beforeEach(() => {
      refactorer = new MockMCERefactorer();
    });

    it('detects test file exceeding MCE limit', () => {
      const testFile = path.join(FILES_DIR, 'large-test-file.ts');
      const result = refactorer.analyze(testFile);

      expect(result.fileType).toBe('test');
      expect(result.limit).toBe(200);
      expect(result.exceeds).toBe(true);
      expect(result.lines).toBeGreaterThan(200);
    });

    it('suggests appropriate strategy for test files', () => {
      const testFile = path.join(FILES_DIR, 'large-test-file.ts');
      const result = refactorer.analyze(testFile);

      expect(result.strategy).toBe('template-type');
      expect(result.suggestedFiles).toBeDefined();
      expect(result.suggestedFiles!.length).toBeGreaterThan(0);
    });

    it('delegates documentation to hub-subworkflow', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const result = refactorer.analyze(docFile);

      expect(result.fileType).toBe('documentation');
      expect(result.limit).toBe(300);
      expect(result.exceeds).toBe(true);
      expect(result.delegateTo).toBe('/hub-subworkflow');
    });

    it('returns all strategies for each file type', () => {
      const strategies = refactorer.strategies();

      expect(strategies.test).toContain('template-type');
      expect(strategies.production).toContain('responsibility-separation');
      expect(strategies.documentation).toContain('hub-subworkflow');
    });

    it('reports compliant files correctly', () => {
      // Create a small test file
      const smallFile = path.join(FIXTURES_DIR, 'markers/todo-sample.ts');
      if (fs.existsSync(smallFile)) {
        const result = refactorer.analyze(smallFile);
        // Small fixture files should be under limit
        expect(result.exceeds).toBe(false);
      }
    });

    it('throws error for non-existent file', () => {
      expect(() => refactorer.analyze('/nonexistent/file.ts'))
        .toThrow('File not found');
    });

    it('suggest returns human-readable message', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const suggestion = refactorer.suggest(docFile);

      expect(suggestion).toContain('/hub-subworkflow');
    });

    it('generates split suggestions with proper file names', () => {
      const testFile = path.join(FILES_DIR, 'large-test-file.ts');
      const result = refactorer.analyze(testFile);

      expect(result.suggestedFiles).toBeDefined();
      expect(result.suggestedFiles!.every(f => f.includes('large-test-file'))).toBe(true);
    });
  });

  describe('hub-subworkflow', () => {
    let hubSubworkflow: MockHubSubworkflow;

    beforeEach(() => {
      hubSubworkflow = new MockHubSubworkflow();
    });

    it('detects documentation exceeding threshold', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const result = hubSubworkflow.analyze(docFile);

      expect(result.threshold).toBe(300);
      expect(result.exceeds).toBe(true);
      expect(result.lines).toBeGreaterThan(300);
    });

    it('detects sections in documentation', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const result = hubSubworkflow.analyze(docFile);

      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.sections[0].title).toBeDefined();
    });

    it('recommends split for multi-section documents', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const result = hubSubworkflow.analyze(docFile);

      expect(result.recommendSplit).toBe(true);
    });

    it('suggests hub + sub-documents structure', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const suggestion = hubSubworkflow.suggest(docFile);

      expect(suggestion).not.toBeNull();
      expect(suggestion!.hub).toBe('large-doc.md');
      expect(suggestion!.subDocuments.length).toBeGreaterThan(0);
    });

    it('generates hub template with decision tree', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const template = hubSubworkflow.template(docFile);

      expect(template).toContain('# Large Doc Hub');
      expect(template).toContain('## Quick Reference');
      expect(template).toContain('## Decision Tree');
      expect(template).toContain('├──');
    });

    it('throws error for non-markdown files', () => {
      const tsFile = path.join(FILES_DIR, 'large-test-file.ts');

      expect(() => hubSubworkflow.analyze(tsFile))
        .toThrow('Not a documentation file');
    });

    it('throws error for non-existent file', () => {
      expect(() => hubSubworkflow.analyze('/nonexistent/doc.md'))
        .toThrow('File not found');
    });

    it('sub-document names follow naming convention', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const suggestion = hubSubworkflow.suggest(docFile);

      expect(suggestion).not.toBeNull();
      for (const subDoc of suggestion!.subDocuments) {
        expect(subDoc.name).toMatch(/^large-doc-[\w-]+\.md$/);
      }
    });

    it('estimates reasonable line counts for sub-documents', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');
      const suggestion = hubSubworkflow.suggest(docFile);

      expect(suggestion).not.toBeNull();
      for (const subDoc of suggestion!.subDocuments) {
        expect(subDoc.estimatedLines).toBeLessThanOrEqual(200);
      }
    });
  });

  describe('mce-refactorer to hub-subworkflow delegation', () => {
    let refactorer: MockMCERefactorer;
    let hubSubworkflow: MockHubSubworkflow;

    beforeEach(() => {
      refactorer = new MockMCERefactorer();
      hubSubworkflow = new MockHubSubworkflow();
    });

    it('mce-refactorer delegates docs to hub-subworkflow', () => {
      const docFile = path.join(FILES_DIR, 'large-doc.md');

      // Step 1: MCE refactorer identifies doc needs delegation
      const mceResult = refactorer.analyze(docFile);
      expect(mceResult.delegateTo).toBe('/hub-subworkflow');

      // Step 2: Hub-subworkflow processes the doc
      const hubResult = hubSubworkflow.analyze(docFile);
      expect(hubResult.recommendSplit).toBe(true);

      // Step 3: Get split suggestion
      const suggestion = hubSubworkflow.suggest(docFile);
      expect(suggestion).not.toBeNull();
      expect(suggestion!.subDocuments.length).toBeGreaterThan(0);
    });
  });
});
