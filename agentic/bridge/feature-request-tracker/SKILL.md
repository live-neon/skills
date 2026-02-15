---
name: feature-request-tracker
version: 1.0.0
description: Track feature requests from constraint gaps for proactive-agent prioritization
author: Live Neon
homepage: https://github.com/live-neon/skills
tags: [agentic, bridge, feature-requests, gaps, proactive]
layer: bridge
status: active
---

# feature-request-tracker

Track feature requests identified from constraint gaps for proactive-agent prioritization.
When constraint-generator identifies patterns that can't become constraints (missing
capability), this skill captures them as feature requests.

## Problem Being Solved

Some failure patterns can't be prevented by constraints alone—they require new
features or capabilities. These gaps get lost if not tracked. feature-request-tracker
captures gaps and feeds them to proactive-agent for prioritization.

## Usage

```
/feature-request-tracker add "<description>"       # Add feature request
/feature-request-tracker list                      # List all requests
/feature-request-tracker list --priority high      # Filter by priority
/feature-request-tracker prioritize <id>           # Recalculate priority
/feature-request-tracker link <id> <observation>   # Link to observation
/feature-request-tracker export                    # Export for proactive-agent
```

## Example

```bash
# Add a feature request from identified gap
/feature-request-tracker add "Real-time constraint violation notifications"

# Link observations to increase priority
/feature-request-tracker link FR-2026-012 notification-delay-frustration
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| action | Yes | Command: add, list, prioritize, link, export |
| description | Yes* | Feature request description (*for add only) |
| id | Yes* | Request ID (*for prioritize, link) |
| observation | Yes* | Observation slug (*for link only) |
| --priority | No | Filter by priority: high, medium, low |
| --status | No | Filter by status: open, in-progress, resolved |
| --source | No | Gap source: constraint-generator, manual |

## Priority Calculation

Priority is calculated using a weighted formula:

```
priority = (linked_observations * 2) + (unique_sources) + (recency_bonus)
```

| Factor | Weight | Description |
|--------|--------|-------------|
| linked_observations | x2 | Each linked observation adds 2 points |
| unique_sources | x1 | Each unique source (session, user) adds 1 point |
| recency_bonus | 0-3 | 3 if < 7d, 2 if < 30d, 1 if < 90d, 0 otherwise |

**Priority Levels**:
- High: score >= 10
- Medium: score 5-9
- Low: score < 5

## Output

### Add Feature Request

```
/feature-request-tracker add "Semantic code search across codebase"

CREATED: FR-2026-047
===================

Description: Semantic code search across codebase
Priority: LOW (score: 3)
  - Linked observations: 0 (0 points)
  - Unique sources: 1 (1 point)
  - Recency bonus: 2 (< 30 days)

Status: open
Source: manual
Created: 2026-02-14

Tip: Link observations to increase priority:
  /feature-request-tracker link FR-2026-047 <observation-slug>
```

### List Feature Requests

```
/feature-request-tracker list --priority high

FEATURE REQUESTS (High Priority)
================================

1. FR-2026-012
   Description: Real-time constraint violation notifications
   Priority: HIGH (score: 14)
     - Linked observations: 5
     - Unique sources: 3
     - Recency: 3 (< 7 days)
   Status: open
   Observations:
     - notification-delay-frustration (N=4)
     - real-time-feedback-desire (N=3)
     - violation-visibility-issue (N=5)
     - sync-constraint-feedback (N=2)
     - immediate-alert-need (N=3)

2. FR-2026-023
   Description: Constraint dependency visualization
   Priority: HIGH (score: 12)
     - Linked observations: 4
     - Unique sources: 2
     - Recency: 2 (< 30 days)
   Status: in-progress
   Observations:
     - constraint-relationship-confusion (N=3)
     - dependency-tracking-need (N=4)
     - visual-constraint-map (N=2)
     - complex-dependencies-unclear (N=3)

Total: 5 high-priority requests
Export: /feature-request-tracker export
```

### Link to Observation

```
/feature-request-tracker link FR-2026-047 semantic-search-desired

LINKED: FR-2026-047 <- semantic-search-desired
=========================================

Previous priority: LOW (score: 3)
New priority: MEDIUM (score: 7)
  - Linked observations: 1 -> 2 (+2 points)
  - Observation N-count: 3

Feature request now has stronger evidence.
Consider adding more observation links to increase priority.
```

### Export for Proactive-Agent

```
/feature-request-tracker export

{
  "version": "1.0.0",
  "exported_at": "2026-02-14T16:00:00Z",
  "total_count": 23,
  "high_priority": 5,
  "medium_priority": 8,
  "low_priority": 10,
  "requests": [
    {
      "id": "FR-2026-012",
      "description": "Real-time constraint violation notifications",
      "priority_score": 14,
      "priority_level": "high",
      "status": "open",
      "linked_observations": [
        "notification-delay-frustration",
        "real-time-feedback-desire",
        "violation-visibility-issue"
      ],
      "unique_sources": 3,
      "created_at": "2026-02-10T10:00:00Z",
      "updated_at": "2026-02-14T12:00:00Z"
    }
  ]
}

Exported to: .exports/feature-requests-2026-02-14.json
Ready for proactive-agent consumption.
```

## Gap Detection Sources

Feature requests can come from:

| Source | Mechanism | Example |
|--------|-----------|---------|
| constraint-generator | Pattern can't become constraint | "Needs new capability" |
| manual | User identifies gap | Direct submission |
| twin-review | Review identifies missing feature | Review finding |
| observation | High-N observation without constraint path | Pattern without solution |

## Storage Format

Feature requests are stored in `docs/feature-requests/<id>.md`:

```markdown
---
id: FR-2026-012
description: Real-time constraint violation notifications
priority_score: 14
priority_level: high
status: open
source: constraint-generator
linked_observations:
  - notification-delay-frustration
  - real-time-feedback-desire
  - violation-visibility-issue
unique_sources: 3
created: 2026-02-10
updated: 2026-02-14
---

# Real-time Constraint Violation Notifications

## Description

Users want immediate notification when constraints are violated,
rather than discovering violations during review.

## Linked Observations

- notification-delay-frustration (N=4): Frustration with delayed feedback
- real-time-feedback-desire (N=3): Explicit request for real-time alerts
- violation-visibility-issue (N=5): Violations not visible until later

## Gap Analysis

Current constraint system detects violations but doesn't push notifications.
This requires new capability: real-time event streaming.

## Potential Solutions

1. WebSocket notifications for active sessions
2. Slack/Discord integration for team alerts
3. Email digest for daily summaries
```

## Integration

- **Layer**: Bridge
- **Depends on**: constraint-generator, memory-search
- **Used by**: proactive-agent (via mock adapter until ClawHub exists)

## Adapter Pattern

This skill uses the bridge adapter pattern for proactive-agent integration:

```typescript
import { getAdapter } from '../adapters';

const agent = getAdapter('proactive-agent');
await agent.submitFeatureRequests(featureRequestExport);
```

Environment variable `BRIDGE_ADAPTER_MODE` controls adapter selection:
- `mock` (default): Uses MockProactiveAgent for testing
- `real`: Uses real adapter when ClawHub exists

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| No description provided | Error: "Feature description required" |
| Invalid request ID | Error: "Feature request not found: <id>" |
| Observation not found | Error: "Observation not found: <slug>" |
| Already linked | Warning: "Observation already linked to this request" |
| Export write fails | Error: "Failed to write export: <reason>" |

## Acceptance Criteria

- [x] Accepts manual feature request submissions
- [x] Links feature requests to observations
- [x] Calculates priority scores correctly
- [x] Filters by priority level
- [x] Filters by status
- [x] Export produces valid JSON
- [x] Priority recalculates when observations linked
- [x] Mock adapter integration works
- [x] SKILL.md compliant with MCE limits (< 200 lines body)

## Next Steps

See [Bridge README](../README.md) for layer overview and workflows.

**Verification**: `cd tests && npm test -- --grep "feature-request-tracker"`
