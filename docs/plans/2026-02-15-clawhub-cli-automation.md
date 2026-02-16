---
created: 2026-02-15
type: plan
status: backlog
priority: low
prerequisite: ClawHub rate limit cleared
deferred_from:
  - ../implementation/agentic-phase5b-results.md
related:
  - ../references/clawhub-format-compatibility.md
  - ../workflows/skill-publish.md
  - ../../clawhub-skills/
---

# ClawHub CLI Automation Plan

## Summary

Automate ClawHub skill installation and updates using the CLI instead of manual copies.
Currently using manual installation due to rate limiting; automation enables CI/CD integration.

**Trigger**: When ClawHub rate limit is cleared and stable
**Duration**: 0.5 day
**Output**: Automated skill sync script, CI workflow

## Background

Phase 5B used manual skill installation due to ClawHub rate limiting:

```bash
# Manual approach (current)
cp -r ~/Downloads/self-improving-agent-1.0.5 clawhub-skills/
cp -r ~/Downloads/proactive-agent-3.1.0 clawhub-skills/
```

**Target approach**:
```bash
# Automated approach (goal)
clawhub install self-improving-agent --workdir . --dir clawhub-skills
clawhub install proactive-agent --workdir . --dir clawhub-skills
```

## Prerequisites

Before starting:

- [ ] ClawHub CLI available (`clawhub --version`)
- [ ] Rate limit cleared (`clawhub whoami` succeeds)
- [ ] Authentication configured

### Verification

```bash
# Check CLI availability
clawhub --version

# Check authentication
clawhub whoami

# Test rate limit status
clawhub search self-improving-agent
```

## Stage 1: CLI Verification

**Duration**: 30 minutes
**Goal**: Confirm CLI works without rate limiting

### Tasks

1. **Test basic commands**
   ```bash
   clawhub search self-improving-agent
   clawhub inspect self-improving-agent
   clawhub inspect proactive-agent
   ```

2. **Test install in temp directory**
   ```bash
   mkdir -p /tmp/clawhub-test
   clawhub install self-improving-agent --workdir /tmp/clawhub-test
   ls -la /tmp/clawhub-test/
   rm -rf /tmp/clawhub-test
   ```

3. **Document any issues**
   - Rate limit behavior
   - Error messages
   - Required flags

### Acceptance Criteria

- [ ] All basic commands work
- [ ] Test install succeeds
- [ ] No rate limit errors

## Stage 2: Sync Script Creation

**Duration**: 1 hour
**Goal**: Create reusable sync script

### Tasks

1. **Create sync script**
   ```bash
   # scripts/sync-clawhub-skills.sh
   #!/bin/bash
   set -e

   SKILLS_DIR="clawhub-skills"
   SKILLS=(
     "self-improving-agent"
     "proactive-agent"
   )

   for skill in "${SKILLS[@]}"; do
     echo "Installing $skill..."
     clawhub install "$skill" --workdir . --dir "$SKILLS_DIR" --force
   done

   echo "Sync complete."
   ```

2. **Add version pinning**
   - Read versions from `.clawhub/lock.json`
   - Install specific versions if specified

3. **Add error handling**
   - Retry on rate limit (with backoff)
   - Continue on single skill failure
   - Report summary at end

### Acceptance Criteria

- [ ] Script created at `scripts/sync-clawhub-skills.sh`
- [ ] Script handles rate limits gracefully
- [ ] Version pinning supported

## Stage 3: Lock File Management

**Duration**: 30 minutes
**Goal**: Automate lock file updates

### Tasks

1. **Update lock file after install**
   - Script should update `.clawhub/lock.json`
   - Include version, timestamp, source

2. **Add lock file validation**
   - Check installed versions match lock
   - Warn on version mismatch

3. **Add upgrade command**
   ```bash
   ./scripts/sync-clawhub-skills.sh --upgrade
   ```

### Acceptance Criteria

- [ ] Lock file auto-updated
- [ ] Version validation works
- [ ] Upgrade flag supported

## Stage 4: CI Integration (Optional)

**Duration**: 1 hour
**Goal**: Add GitHub Actions workflow

### Tasks

1. **Create workflow file**
   ```yaml
   # .github/workflows/sync-clawhub.yml
   name: Sync ClawHub Skills
   on:
     schedule:
       - cron: '0 0 * * 0'  # Weekly
     workflow_dispatch:

   jobs:
     sync:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Install ClawHub CLI
           run: npm install -g clawhub
         - name: Sync Skills
           run: ./scripts/sync-clawhub-skills.sh
           env:
             CLAWHUB_TOKEN: ${{ secrets.CLAWHUB_TOKEN }}
         - name: Commit Changes
           run: |
             git config user.name "github-actions"
             git config user.email "actions@github.com"
             git add clawhub-skills/ .clawhub/
             git diff --staged --quiet || git commit -m "chore: sync clawhub skills"
             git push
   ```

2. **Add secrets documentation**
   - Document required `CLAWHUB_TOKEN` secret
   - Add setup instructions to README

3. **Test workflow**
   - Run manually via workflow_dispatch
   - Verify skills update correctly

### Acceptance Criteria

- [ ] Workflow file created
- [ ] Secrets documented
- [ ] Manual trigger works

## Success Criteria

- [ ] Sync script works reliably
- [ ] Lock file management automated
- [ ] Rate limit handling implemented
- [ ] (Optional) CI workflow functional

## Cross-References

- **Manual Installation**: `docs/implementation/agentic-phase5b-results.md`
- **Format Compatibility**: `docs/references/clawhub-format-compatibility.md`
- **Skill Publish Workflow**: `docs/workflows/skill-publish.md`
- **Installed Skills**: `clawhub-skills/`

---

*Plan created 2026-02-15. Deferred from Phase 5B - blocked by rate limiting.*
