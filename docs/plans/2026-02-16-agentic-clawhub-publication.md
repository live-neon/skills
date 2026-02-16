---
created: 2026-02-16
type: plan
status: draft
priority: high
estimated_effort: 1-2 sessions
depends_on:
  - docs/plans/2026-02-15-agentic-clawhub-decoupling.md
workflow_reference: docs/workflows/skill-publish.md
---

# Plan: Agentic Skills ClawHub Publication

## Summary

Publish the 7 decoupled agentic skills to ClawHub under the `leegitw` namespace,
following the dependency order established in the decoupling plan.

**Scope**: 7 skills, published in 4 phases
**Risk**: Low (all prep work complete, skills verified)
**Blocking**: None (decoupling complete)

> **Repository Note**: Skills are hosted on GitHub at `live-neon/skills` (org repo)
> but published to ClawHub under the `leegitw` username for installation.
> Users install via `openclaw install leegitw/[skill-name]`.

---

## Quick Reference

| Phase | Goal | Skills | Status |
|-------|------|--------|--------|
| 1 | Setup | CLI, auth, verification | ⏳ Pending |
| 2 | Foundation | context-verifier | ⏳ Pending |
| 3 | Core Pipeline | failure-memory, constraint-engine | ⏳ Pending |
| 4 | Extended Suite | safety-checks, review-orchestrator, governance, workflow-tools | ⏳ Pending |
| 5 | Cross-linking | NEON-SOUL references | ⏳ Pending |

**Total**: 1-2 sessions

---

## Prerequisites

Before starting, ensure:

- [x] All 7 skills decoupled (docs/plans/2026-02-15-agentic-clawhub-decoupling.md complete)
- [x] Code review N=2 passed (Codex + Gemini)
- [x] Twin review N=2 passed (Technical + Creative)
- [x] All SKILL.md files at version 1.0.0
- [x] LICENSE file present
- [ ] Git changes pushed to origin/main

---

## Workflow Reference

This plan follows the ClawHub publishing workflow documented in:
**`docs/workflows/skill-publish.md`** (Section: Optional: ClawHub Publishing)

Key commands from that workflow:
- Setup: `clawhub login --token "$CLAWHUB_TOKEN" --no-browser`
- Publish: `clawhub publish <path> --slug <name> --name "<title>" --version <ver> --tags "<tags>"`
- Verify: `clawhub inspect <name>` and `clawhub search <query>`

---

## Phase 1: Setup (One-Time)

**Goal**: Establish ClawHub authentication and verify CLI readiness.

### Steps

```bash
# 1. Create ClawHub account (if not exists)
# Visit: https://clawhub.ai/signup

# 2. Generate API token
# Visit: https://clawhub.ai/settings/tokens
# Create token with "publish" scope

# 3. Save token to environment
echo 'CLAWHUB_TOKEN=clh_xxx...' >> .env

# 4. Install CLI (if not installed)
npm install -g clawhub

# 5. Verify installation
clawhub --version

# 6. Login and verify
set -a && source .env && set +a
clawhub login --token "$CLAWHUB_TOKEN" --no-browser
clawhub whoami
```

### Exit Criteria

- [ ] `clawhub whoami` shows `leegitw` username
- [ ] Token has publish permissions
- [ ] CLI version is current

---

## Phase 2: Foundation (context-verifier)

**Goal**: Publish the foundation skill first, test installation flow.

### Why First

context-verifier has no dependencies - it's the foundation layer. Publishing it first:
1. Tests the entire publish/install flow
2. Verifies ClawHub accepts our frontmatter format
3. Provides a safe rollback point

### Publish Command

```bash
cd /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills

clawhub publish agentic/context-verifier \
  --slug context-verifier \
  --name "Context Verifier - File Integrity and Hash Computation" \
  --version 1.0.0 \
  --tags "verification,hashing,integrity,context,foundation"
```

### Verification

```bash
# 1. Check publication
clawhub inspect context-verifier

# 2. Test installation (in a clean directory)
cd /tmp
mkdir clawhub-test && cd clawhub-test
openclaw install leegitw/context-verifier

# 3. Verify SKILL.md loaded
ls -la .openclaw/skills/context-verifier/

# 4. Smoke test commands (manual verification)
# /cv hash src/main.go
# /cv packet src/*.go --name "test"
```

### Exit Criteria

- [ ] `clawhub inspect context-verifier` shows correct metadata
- [ ] `openclaw install leegitw/context-verifier` succeeds
- [ ] SKILL.md content matches source
- [ ] No security warnings from ClawHub

---

## Phase 3: Core Pipeline (failure-memory, constraint-engine)

**Goal**: Publish the core learning pipeline in dependency order.

### Dependency Order

```
context-verifier (Phase 2)
       ↓
failure-memory (this phase, first)
       ↓
constraint-engine (this phase, second)
```

### Publish Commands

```bash
cd /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills

# 1. failure-memory (depends on context-verifier)
clawhub publish agentic/failure-memory \
  --slug failure-memory \
  --name "Failure Memory - Pattern Detection and Observation Recording" \
  --version 1.0.0 \
  --tags "failure,memory,patterns,observations,learning,rcd-counters"

# 2. constraint-engine (depends on failure-memory)
clawhub publish agentic/constraint-engine \
  --slug constraint-engine \
  --name "Constraint Engine - Generation, Enforcement, and Circuit Breaker" \
  --version 1.0.0 \
  --tags "constraints,enforcement,circuit-breaker,governance,rules"
```

### Verification

```bash
# Check both publications
clawhub inspect failure-memory
clawhub inspect constraint-engine

# Test installation chain (clean directory)
cd /tmp
rm -rf clawhub-test && mkdir clawhub-test && cd clawhub-test

# Install in order
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine

# Verify all three loaded
ls -la .openclaw/skills/

# Smoke test the pipeline (manual verification)
# /fm observe "Test pattern"
# /fm status
# /ce generate OBS-YYYYMMDD-XXX (with eligible observation)
```

### Exit Criteria

- [ ] Both skills published successfully
- [ ] Installation chain works in order
- [ ] No dependency errors
- [ ] Core pipeline commands functional

---

## Phase 4: Extended Suite (4 skills)

**Goal**: Publish remaining skills. These can be published in parallel (no inter-dependencies).

### Skills

| Skill | Layer | Dependencies |
|-------|-------|--------------|
| safety-checks | Safety | constraint-engine |
| review-orchestrator | Review | failure-memory, context-verifier |
| governance | Governance | constraint-engine, failure-memory |
| workflow-tools | Extensions | failure-memory, constraint-engine |

### Publish Commands

```bash
cd /Users/twin2/Desktop/projects/multiverse/projects/live-neon/skills

# safety-checks
clawhub publish agentic/safety-checks \
  --slug safety-checks \
  --name "Safety Checks - Model Pinning, Fallbacks, and Runtime Validation" \
  --version 1.0.0 \
  --tags "safety,validation,model-pinning,fallbacks,security"

# review-orchestrator
clawhub publish agentic/review-orchestrator \
  --slug review-orchestrator \
  --name "Review Orchestrator - Multi-Perspective Review Coordination" \
  --version 1.0.0 \
  --tags "review,multi-perspective,cognitive-modes,quality-gates"

# governance
clawhub publish agentic/governance \
  --slug governance \
  --name "Governance - Constraint Lifecycle and Periodic Reviews" \
  --version 1.0.0 \
  --tags "governance,lifecycle,compliance,reviews,adoption"

# workflow-tools
clawhub publish agentic/workflow-tools \
  --slug workflow-tools \
  --name "Workflow Tools - Loop Detection, Parallel Decisions, MCE Analysis" \
  --version 1.0.0 \
  --tags "workflow,loops,parallel,mce,utilities"
```

### Verification

```bash
# Check all publications
clawhub inspect safety-checks
clawhub inspect review-orchestrator
clawhub inspect governance
clawhub inspect workflow-tools

# Full suite installation test (clean directory)
cd /tmp
rm -rf clawhub-test && mkdir clawhub-test && cd clawhub-test

# Install full suite in order
openclaw install leegitw/context-verifier
openclaw install leegitw/failure-memory
openclaw install leegitw/constraint-engine
openclaw install leegitw/safety-checks
openclaw install leegitw/review-orchestrator
openclaw install leegitw/governance
openclaw install leegitw/workflow-tools

# Verify all 7 loaded
ls -la .openclaw/skills/
# Should show: context-verifier, failure-memory, constraint-engine,
#              safety-checks, review-orchestrator, governance, workflow-tools

# Search verification
clawhub search "leegitw"
# Should return all 7 skills
```

### Exit Criteria

- [ ] All 4 skills published successfully
- [ ] Full 7-skill installation works
- [ ] `clawhub search leegitw` returns all 7 skills
- [ ] No security warnings

---

## Phase 5: Cross-linking

**Goal**: Add references from NEON-SOUL and update external documentation.

### Tasks

```bash
# 1. Update NEON-SOUL to reference ClawHub skills
# Add to neon-soul documentation:
# - Link to ClawHub: https://clawhub.ai/leegitw
# - Installation instructions: openclaw install leegitw/[skill]

# 2. Update live-neon/skills README
# - Add ClawHub badges
# - Add "Available on ClawHub" section

# 3. Verify cross-links work
# - Test all URLs resolve
# - Test installation from NEON-SOUL docs
```

### Exit Criteria

- [ ] NEON-SOUL references ClawHub installation
- [ ] README has ClawHub badges/links
- [ ] All cross-links resolve correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ClawHub security scan fails | Low | Medium | Skills already pass gitleaks; review any flagged patterns |
| Frontmatter format rejected | Low | Low | Format validated against OpenClaw spec |
| Dependency install fails | Low | Medium | Test each phase before proceeding |
| Token permissions insufficient | Low | Low | Verify token scope before starting |
| Network/service interruption | Low | Low | Retry; phases are independent |

---

## Rollback Strategy

Each phase is independent. If a phase fails:

1. **Phase 2 fails**: Debug context-verifier, do not proceed
2. **Phase 3 fails**: Users can still use context-verifier standalone
3. **Phase 4 fails**: Core pipeline (3 skills) remains functional
4. **Phase 5 fails**: Skills work, just without cross-links

To unpublish a skill (if needed):
```bash
clawhub unpublish leegitw/[skill-name]
```

---

## Success Criteria

**Minimum Viable Publication**:
- [ ] Phase 2 complete (context-verifier available)
- [ ] Phase 3 complete (core pipeline available)

**Full Publication**:
- [ ] All 5 phases complete
- [ ] All 7 skills searchable on ClawHub
- [ ] Full installation chain verified
- [ ] Cross-links from NEON-SOUL working

---

## Post-Publication

After successful publication:

1. **Monitor**: Check ClawHub analytics for install counts
2. **Support**: Watch for issues/questions from early adopters
3. **Iterate**: Track v1.1.0 items (meta-package, claude-defaults)
4. **Announce**: Consider announcement in relevant communities

---

## Appendix: Skill Metadata Summary

| Skill | Slug | Tags |
|-------|------|------|
| context-verifier | context-verifier | verification, hashing, integrity, context, foundation |
| failure-memory | failure-memory | failure, memory, patterns, observations, learning, rcd-counters |
| constraint-engine | constraint-engine | constraints, enforcement, circuit-breaker, governance, rules |
| safety-checks | safety-checks | safety, validation, model-pinning, fallbacks, security |
| review-orchestrator | review-orchestrator | review, multi-perspective, cognitive-modes, quality-gates |
| governance | governance | governance, lifecycle, compliance, reviews, adoption |
| workflow-tools | workflow-tools | workflow, loops, parallel, mce, utilities |

---

*Plan created 2026-02-16. Reference: docs/workflows/skill-publish.md*
