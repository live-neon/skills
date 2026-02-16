---
created: 2026-02-15
type: plan
status: backlog
priority: medium
prerequisite: learnings-n-counter in active use
deferred_from:
  - ../implementation/agentic-phase5-results.md
related:
  - ./2026-02-15-n-count-evidence-verification.md
  - ../../agentic/failure-memory/SKILL.md
---

# Circular Reference Detection Plan

## Summary

Detect and prevent circular references in observation evidence chains that could
inflate R/C/D counts artificially.

**Note**: This plan is a focused subset of the N-Count Evidence Verification plan.
See `2026-02-15-n-count-evidence-verification.md` for the complete implementation.

**Trigger**: When learnings-n-counter reports suspicious count patterns
**Duration**: 0.5 day (if implemented standalone)
**Output**: Circular detection in `/gov verify-counts --check-circular`

## Background

From Phase 5 results:

> **Circular reference detection**: N-count validation for inflated counts

**Problem**: Observations can cite each other, creating circular evidence:
```
LRN-001: See also: LRN-002
LRN-002: See also: LRN-001
```

If both increment R based on the other, counts become inflated.

## Relationship to N-Count Plan

This plan is **Stage 4** of `2026-02-15-n-count-evidence-verification.md`.

If implementing standalone (before full N-count verification):

### Standalone Implementation

1. **Add `/gov check-circular` command**
   ```
   Usage: /gov check-circular

   Output:
     Scanning .learnings/ for circular references...

     Circular chains found: 2

     Chain 1 (length 2):
       LRN-20260215-001 → LRN-20260215-002 → LRN-20260215-001

     Chain 2 (length 3):
       LRN-20260215-005 → LRN-20260215-006 → LRN-20260215-007 → LRN-20260215-005

     Recommendation: Review and break circular dependencies.
   ```

2. **Algorithm**
   ```python
   def detect_cycles(entries):
       # Build adjacency graph from "See also" links
       graph = build_graph(entries)

       # DFS to find cycles
       cycles = []
       for node in graph:
           cycles.extend(find_cycles_from(node, graph))

       return deduplicate(cycles)
   ```

3. **Remediation guidance**
   - Identify which entry is the "source" (earliest date)
   - Remove reverse link from derived entry
   - Recalculate R counts after breaking cycle

## Success Criteria

- [ ] Circular references detected
- [ ] All cycles reported with chain visualization
- [ ] Remediation guidance provided
- [ ] No false positives on valid "See also" links

## Cross-References

- **Full Plan**: `docs/plans/2026-02-15-n-count-evidence-verification.md` (Stage 4)
- **Phase 5 Deferral**: `docs/implementation/agentic-phase5-results.md`
- **Failure Memory**: `agentic/failure-memory/SKILL.md`

---

*Plan created 2026-02-15. Subset of N-Count Evidence Verification plan.*
