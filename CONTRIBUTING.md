# Contributing to Live Neon Skills

## Choosing a Category

This repository has two skill categories. Choose based on your skill's purpose:

| Choose Agentic if... | Choose PBD if... |
|---------------------|------------------|
| Skill manages workspace state | Skill is stateless analysis |
| Auto-triggered by events | Explicitly user-invoked |
| Technical output format | Human-readable output |
| Has layer dependencies | No dependencies |
| AI-to-AI communication | AI-to-human communication |

**Not sure?** See `docs/patterns/skill-format.md` for detailed guidance.

## Templates

Copy the appropriate template for your category:

- **Agentic skills**: `agentic/SKILL_TEMPLATE.md`
- **PBD skills**: `pbd/SKILL_TEMPLATE.md`

## Adding a New Skill

1. **Choose category** using the table above
2. **Copy template** to new directory:
   - Agentic: `agentic/your-skill-name/SKILL.md`
   - PBD: `pbd/your-skill-name/SKILL.md`
3. **Fill in all required sections** (see template)
4. **Run validation**: `cd tests && npm test`
5. **Update README** in the appropriate category directory

## Validation

Before submitting, ensure tests pass:

```bash
cd tests && npm test
```

Tests validate:
- Required frontmatter fields per category
- Required sections per category
- Semantic versioning
- Non-empty descriptions

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Add/modify skill with SKILL.md
4. Run validation tests
5. Submit PR with description

## Troubleshooting Validation Failures

| Error | Cause | Fix |
|-------|-------|-----|
| "missing user-invocable" | PBD skill missing field | Add `user-invocable: true` to frontmatter |
| "missing emoji" | PBD skill missing field | Add `emoji: 🔍` (appropriate emoji) |
| "missing layer" | Agentic skill missing field | Add `layer: core` (appropriate layer) |
| "missing alias" | Agentic skill missing field | Add `alias: /xx` (short alias) |
| "missing Section" | Required section not found | Add the missing `## Section` heading |

**If template copy fails validation**: Report to maintainers - template/test alignment issue.

## Developer Certificate of Origin (DCO)

By contributing, you certify that you have the right to submit the work
under the MIT license.

Sign-off your commits: `git commit -s -m "Your message"`
