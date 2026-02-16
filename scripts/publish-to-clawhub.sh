#!/bin/bash
#
# Publish remaining agentic skills to ClawHub with rate limit delays
#
# Usage: ./scripts/publish-to-clawhub.sh
#
# This script waits 1 hour for GitHub API rate limits to reset,
# then publishes one skill every 15 minutes.
#
# Already published: context-verifier
# To publish: failure-memory, constraint-engine, safety-checks,
#             review-orchestrator, governance, workflow-tools

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")"
cd "$SKILLS_DIR"

# Load environment
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found"
    exit 1
fi

# Verify authentication
echo "Verifying ClawHub authentication..."
# Strip ANSI color codes before checking output
WHOAMI_OUTPUT=$(clawhub whoami 2>&1 | sed 's/\x1b\[[0-9;]*m//g')
if ! echo "$WHOAMI_OUTPUT" | grep -q "leegitw"; then
    echo "Error: Not authenticated as leegitw"
    echo "Output was: $WHOAMI_OUTPUT"
    exit 1
fi
echo "Authenticated as leegitw"

# Skills to publish (in dependency order)
declare -a SKILLS=(
    "failure-memory|Failure Memory - Pattern Detection and Observation Recording|failure,memory,patterns,observations,learning,rcd-counters"
    "constraint-engine|Constraint Engine - Generation, Enforcement, and Circuit Breaker|constraints,enforcement,circuit-breaker,governance,rules"
    "safety-checks|Safety Checks - Model Pinning, Fallbacks, and Runtime Validation|safety,validation,model-pinning,fallbacks,security"
    "review-orchestrator|Review Orchestrator - Multi-Perspective Review Coordination|review,multi-perspective,cognitive-modes,quality-gates"
    "governance|Governance - Constraint Lifecycle and Periodic Reviews|governance,lifecycle,compliance,reviews,adoption"
    "workflow-tools|Workflow Tools - Loop Detection, Parallel Decisions, MCE Analysis|workflow,loops,parallel,mce,utilities"
)

DELAY_BETWEEN_SKILLS=900  # 15 minutes in seconds
INITIAL_WAIT=3600         # 1 hour in seconds

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

publish_skill() {
    local skill_data="$1"
    IFS='|' read -r slug name tags <<< "$skill_data"

    log "Publishing $slug..."

    if clawhub publish "agentic/$slug" \
        --slug "$slug" \
        --name "$name" \
        --version 1.0.0 \
        --tags "$tags"; then
        log "SUCCESS: $slug published"
        return 0
    else
        log "FAILED: $slug - will retry on next run"
        return 1
    fi
}

# Check for --skip-wait flag
SKIP_WAIT=false
if [ "$1" = "--skip-wait" ]; then
    SKIP_WAIT=true
    log "Skipping initial wait (--skip-wait flag)"
fi

# Initial wait for rate limit reset
if [ "$SKIP_WAIT" = false ]; then
    log "Waiting 1 hour for GitHub API rate limits to reset..."
    log "Started at: $(date)"
    log "Will resume at: $(date -v+1H 2>/dev/null || date -d '+1 hour')"
    echo ""
    echo "You can safely close this terminal - consider running with:"
    echo "  nohup ./scripts/publish-to-clawhub.sh > publish.log 2>&1 &"
    echo ""
    sleep $INITIAL_WAIT
fi

log "Starting publication of ${#SKILLS[@]} skills..."
echo ""

# Track results
PUBLISHED=()
FAILED=()

for i in "${!SKILLS[@]}"; do
    skill_data="${SKILLS[$i]}"
    IFS='|' read -r slug name tags <<< "$skill_data"

    log "[$((i+1))/${#SKILLS[@]}] Processing $slug"

    if publish_skill "$skill_data"; then
        PUBLISHED+=("$slug")
    else
        FAILED+=("$slug")
    fi

    # Wait between skills (except after the last one)
    if [ $i -lt $((${#SKILLS[@]} - 1)) ]; then
        log "Waiting 15 minutes before next publish..."
        sleep $DELAY_BETWEEN_SKILLS
    fi
done

echo ""
log "========================================="
log "Publication complete!"
log "========================================="
echo ""
log "Published (${#PUBLISHED[@]}): ${PUBLISHED[*]}"
if [ ${#FAILED[@]} -gt 0 ]; then
    log "Failed (${#FAILED[@]}): ${FAILED[*]}"
    log "Re-run script to retry failed skills"
fi
echo ""

# Verify all skills
log "Verifying published skills..."
clawhub search "leegitw" || true

echo ""
log "Done. Check https://clawhub.ai for your published skills."
