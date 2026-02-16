/**
 * Skill Loading E2E Tests
 *
 * Validates ALL skills (PBD + Agentic) can be loaded and parsed.
 * Tests SKILL.md format, frontmatter, and documentation structure.
 *
 * Updated 2026-02-15 for consolidated agentic skills (48 → 7).
 *
 * Run:
 *   npm test tests/e2e/skill-loading.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parse as parseYaml } from 'yaml';

// Skill categories
const SKILLS_ROOT = resolve(import.meta.dirname, '../../');

// Consolidated agentic skills (7 total)
const CONSOLIDATED_AGENTIC_SKILLS = [
  'failure-memory',
  'constraint-engine',
  'context-verifier',
  'review-orchestrator',
  'governance',
  'safety-checks',
  'workflow-tools',
];

interface SkillFrontmatter {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  tags?: string[];
  layer?: string;
  status?: string;
  alias?: string;
  'user-invocable'?: boolean;
  emoji?: string;
}

interface SkillInfo {
  path: string;
  category: string;
  name: string;
  frontmatter: SkillFrontmatter;
  body: string;
}

function parseSkillMd(content: string): { frontmatter: SkillFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid SKILL.md format: missing frontmatter');
  }
  return {
    frontmatter: parseYaml(match[1]) as SkillFrontmatter,
    body: match[2],
  };
}

function discoverSkills(): SkillInfo[] {
  const skills: SkillInfo[] = [];

  // Discover PBD skills (pbd/plan/, pbd/remember/, pbd/observe/)
  const pbdPath = join(SKILLS_ROOT, 'pbd');
  if (existsSync(pbdPath)) {
    const pbdEntries = readdirSync(pbdPath, { withFileTypes: true });
    for (const entry of pbdEntries) {
      if (!entry.isDirectory()) continue;
      const skillMdPath = join(pbdPath, entry.name, 'SKILL.md');
      if (existsSync(skillMdPath)) {
        const content = readFileSync(skillMdPath, 'utf-8');
        const { frontmatter, body } = parseSkillMd(content);
        skills.push({
          path: skillMdPath,
          category: 'pbd',
          name: frontmatter.name || entry.name,
          frontmatter,
          body,
        });
      }
    }
  }

  // Discover consolidated agentic skills (agentic/failure-memory/, etc.)
  const agenticPath = join(SKILLS_ROOT, 'agentic');
  if (existsSync(agenticPath)) {
    const agenticEntries = readdirSync(agenticPath, { withFileTypes: true });
    for (const entry of agenticEntries) {
      if (!entry.isDirectory()) continue;
      // Skip archive and other non-skill directories
      if (entry.name.startsWith('_')) continue;

      const skillMdPath = join(agenticPath, entry.name, 'SKILL.md');
      if (existsSync(skillMdPath)) {
        const content = readFileSync(skillMdPath, 'utf-8');
        const { frontmatter, body } = parseSkillMd(content);
        skills.push({
          path: skillMdPath,
          category: 'agentic',
          name: frontmatter.name || entry.name,
          frontmatter,
          body,
        });
      }
    }
  }

  return skills;
}

describe('E2E: All Skills Loading', () => {
  let allSkills: SkillInfo[];
  let pbdSkills: SkillInfo[];
  let agenticSkills: SkillInfo[];

  beforeAll(() => {
    allSkills = discoverSkills();
    pbdSkills = allSkills.filter(s => s.category === 'pbd');
    agenticSkills = allSkills.filter(s => s.category === 'agentic');

    console.log(`\nDiscovered ${allSkills.length} skills:`);
    console.log(`  PBD: ${pbdSkills.length}`);
    console.log(`  Agentic: ${agenticSkills.length} (consolidated)\n`);
  });

  describe('Skill Discovery', () => {
    it('should discover skills from all categories', () => {
      expect(allSkills.length).toBeGreaterThan(0);
    });

    it('should discover agentic skills', () => {
      // Discovery-based: at least one skill found
      expect(agenticSkills.length).toBeGreaterThan(0);
      // Verify known consolidated skills exist (but don't enforce exact count)
      for (const expectedName of CONSOLIDATED_AGENTIC_SKILLS) {
        const found = agenticSkills.some(s =>
          s.name === expectedName || s.frontmatter.name === expectedName
        );
        expect(found, `Missing consolidated skill: ${expectedName}`).toBe(true);
      }
    });
  });

  describe('PBD Skills', () => {
    it('should have valid SKILL.md format', () => {
      for (const skill of pbdSkills) {
        expect(skill.frontmatter.name, `${skill.name} missing name`).toBeDefined();
        expect(skill.frontmatter.version, `${skill.name} missing version`).toBeDefined();
        expect(skill.frontmatter.description, `${skill.name} missing description`).toBeDefined();
        // PBD-specific required fields (C-2 fix)
        expect(skill.frontmatter['user-invocable'], `${skill.name} missing user-invocable`).toBe(true);
        expect(skill.frontmatter.emoji, `${skill.name} missing emoji`).toBeDefined();
      }
    });

    it('should have required documentation sections', () => {
      // Sections validated against actual skills (audited 2026-02-15)
      const requiredSections = [
        '## Agent Identity',
        '## When to Use',
        '## Related Skills',
      ];
      for (const skill of pbdSkills) {
        for (const section of requiredSections) {
          expect(skill.body, `${skill.name} missing ${section}`).toContain(section);
        }
      }
    });
  });

  describe('Agentic Skills (Consolidated)', () => {
    // Note: consolidated skill verification is now in 'should discover agentic skills' test

    it('should have valid SKILL.md format', () => {
      for (const skill of agenticSkills) {
        expect(skill.frontmatter.name, `${skill.name} missing name`).toBeDefined();
        expect(skill.frontmatter.version, `${skill.name} missing version`).toBeDefined();
        expect(skill.frontmatter.description, `${skill.name} missing description`).toBeDefined();
        expect(skill.frontmatter.author, `${skill.name} missing author`).toBe('Live Neon');
        expect(skill.frontmatter.layer, `${skill.name} missing layer`).toBeDefined();
        expect(skill.frontmatter.alias, `${skill.name} missing alias`).toBeDefined();
      }
    });

    it('should have required documentation sections', () => {
      // Sections validated against actual skills (audited 2026-02-15)
      const requiredSections = [
        '## Usage',
        '## Sub-Commands',
        '## Arguments',
        '## Integration',
        '## Failure Modes',
        '## Next Steps',
        '## Acceptance Criteria',
      ];
      for (const skill of agenticSkills) {
        for (const section of requiredSections) {
          expect(skill.body, `${skill.name} missing ${section}`).toContain(section);
        }
      }
    });

    it('should have layer assignments', () => {
      // Layers from agentic/SKILL_TEMPLATE.md (T-3 fix: added bridge, detection)
      const expectedLayers = ['foundation', 'core', 'review', 'detection', 'governance', 'safety', 'bridge', 'extensions'];
      for (const skill of agenticSkills) {
        expect(
          expectedLayers.includes(skill.frontmatter.layer!),
          `${skill.name} has invalid layer: ${skill.frontmatter.layer}`
        ).toBe(true);
      }
    });

    it('should have short aliases', () => {
      const expectedAliases = ['fm', 'ce', 'cv', 'ro', 'gov', 'sc', 'wt'];
      for (const skill of agenticSkills) {
        expect(
          expectedAliases.includes(skill.frontmatter.alias!),
          `${skill.name} has unexpected alias: ${skill.frontmatter.alias}`
        ).toBe(true);
      }
    });
  });

  describe('Format Validation', () => {
    it('should have semantic versioning', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;
      for (const skill of allSkills) {
        expect(
          skill.frontmatter.version,
          `${skill.name} has invalid version: ${skill.frontmatter.version}`
        ).toMatch(semverRegex);
      }
    });

    it('should have non-empty descriptions', () => {
      for (const skill of allSkills) {
        expect(
          skill.frontmatter.description?.length,
          `${skill.name} has empty description`
        ).toBeGreaterThan(10);
      }
    });
  });
});
