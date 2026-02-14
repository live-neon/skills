/**
 * Skill Loading E2E Tests
 *
 * Validates ALL skills (PBD + Agentic) can be loaded and parsed.
 * Tests SKILL.md format, frontmatter, and documentation structure.
 *
 * Run:
 *   npm test tests/e2e/skill-loading.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join, basename, dirname } from 'node:path';
import { parse as parseYaml } from 'yaml';

// Skill categories
const SKILLS_ROOT = resolve(import.meta.dirname, '../../');
const SKILL_CATEGORIES = {
  pbd: ['plan', 'remember', 'observe'],  // PBD methodology skills
  agentic: ['core', 'review', 'detection', 'governance', 'safety', 'bridge', 'extensions'],
};

interface SkillFrontmatter {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  tags?: string[];
  'user-invocable'?: boolean;
}

interface SkillInfo {
  path: string;
  category: string;
  subcategory: string;
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

  for (const [category, subcategories] of Object.entries(SKILL_CATEGORIES)) {
    const categoryPath = join(SKILLS_ROOT, category);
    if (!existsSync(categoryPath)) continue;

    // Check direct skill directories (e.g., pbd/plan/)
    const entries = readdirSync(categoryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Check if this is a skill directory (has SKILL.md)
      const skillMdPath = join(categoryPath, entry.name, 'SKILL.md');
      if (existsSync(skillMdPath)) {
        const content = readFileSync(skillMdPath, 'utf-8');
        const { frontmatter, body } = parseSkillMd(content);
        skills.push({
          path: skillMdPath,
          category,
          subcategory: entry.name,
          name: frontmatter.name || entry.name,
          frontmatter,
          body,
        });
        continue;
      }

      // Check subdirectories (e.g., agentic/core/context-packet/)
      if (subcategories.includes(entry.name)) {
        const subPath = join(categoryPath, entry.name);
        const subEntries = readdirSync(subPath, { withFileTypes: true });
        for (const subEntry of subEntries) {
          if (!subEntry.isDirectory()) continue;
          const subSkillMdPath = join(subPath, subEntry.name, 'SKILL.md');
          if (existsSync(subSkillMdPath)) {
            const content = readFileSync(subSkillMdPath, 'utf-8');
            const { frontmatter, body } = parseSkillMd(content);
            skills.push({
              path: subSkillMdPath,
              category,
              subcategory: entry.name,
              name: frontmatter.name || subEntry.name,
              frontmatter,
              body,
            });
          }
        }
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
    console.log(`  Agentic: ${agenticSkills.length}\n`);
  });

  describe('Skill Discovery', () => {
    it('should discover skills from all categories', () => {
      expect(allSkills.length).toBeGreaterThan(0);
    });
  });

  describe('PBD Skills', () => {
    it('should have valid SKILL.md format', () => {
      for (const skill of pbdSkills) {
        expect(skill.frontmatter.name).toBeDefined();
        expect(skill.frontmatter.version).toBeDefined();
        expect(skill.frontmatter.description).toBeDefined();
      }
    });
  });

  describe('Agentic Skills', () => {
    it('should find at least 5 agentic skills (Phase 1)', () => {
      expect(agenticSkills.length).toBeGreaterThanOrEqual(5);
    });

    it('should have Foundation layer skills', () => {
      const foundationSkills = ['context-packet', 'file-verifier', 'constraint-enforcer', 'severity-tagger', 'positive-framer'];
      for (const name of foundationSkills) {
        const found = agenticSkills.some(s =>
          s.path.includes(`/${name}/`) || s.frontmatter.name?.toLowerCase().includes(name)
        );
        expect(found, `Missing Foundation skill: ${name}`).toBe(true);
      }
    });

    it('should have valid SKILL.md format', () => {
      for (const skill of agenticSkills) {
        expect(skill.frontmatter.name).toBeDefined();
        expect(skill.frontmatter.version).toBeDefined();
        expect(skill.frontmatter.description).toBeDefined();
        expect(skill.frontmatter.author).toBe('Live Neon');
      }
    });

    it('should have required documentation sections', () => {
      for (const skill of agenticSkills) {
        expect(skill.body, `${skill.name} missing Usage`).toContain('## Usage');
        expect(skill.body, `${skill.name} missing Example`).toContain('## Example');
        expect(skill.body, `${skill.name} missing Integration`).toContain('## Integration');
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
