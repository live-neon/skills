# LLM-Based Semantic Similarity Guide

**Version**: 1.0
**Status**: Active
**Last Updated**: 2026-02-13
**Principles Applied**: Evidence & Verification, Safety > Correctness

## TL;DR

Use LLM semantic similarity instead of pattern matching for action classification.
Pattern matching (`git push --force` vs `git push -f`) is trivially evaded.
Semantic classification understands intent: both mean "force push to remote."

```
Pattern Matching:  "git push -f" ≠ "git push --force"  (WRONG - same action)
Semantic Matching: "git push -f" ≈ "force push"       (CORRECT - same intent)
```

---

## Introduction

### The Problem with Pattern Matching

Pattern matching (string/glob/regex) for action classification is fundamentally broken
for safety-critical operations. Adversaries or confused agents can trivially bypass
pattern-based constraints:

| Pattern | Matches | Evades Pattern |
|---------|---------|----------------|
| `git push --force` | "git push --force" | "git push -f" |
| `rm -rf` | "rm -rf /path" | "find . -delete" |
| `git reset --hard` | "git reset --hard HEAD" | "git checkout ." |

**Root cause**: Pattern matching operates on surface syntax, not semantic intent.

### The Solution: Semantic Classification

LLM-based semantic similarity understands what actions *mean*, not how they're spelled:

```
Action: "delete everything in the working directory"
Intent: destructive (removes files, cannot easily undo)
Matches: rm -rf, find -delete, git clean -fd, git checkout .
```

---

## Core Concepts

### Intent Classification

Every action has an **intent** that describes its effect:

| Intent | Description | Risk Level | Examples |
|--------|-------------|------------|----------|
| **destructive** | Cannot be easily undone | Critical | force push, reset --hard, rm -rf |
| **modifying** | Changes state but recoverable | Important | edit file, create branch, commit |
| **read-only** | No side effects | Safe | git status, cat file, ls |
| **external** | Affects systems outside repo | Variable | push, deploy, publish, API call |

### Semantic Scope

Instead of pattern lists, constraints define a **semantic scope**:

```yaml
# Pattern matching (WRONG)
patterns:
  - "git push --force"
  - "git push -f"
  - "git push --force-with-lease"

# Semantic scope (CORRECT)
scope: "Actions that overwrite remote git history"
intent: destructive
```

The LLM evaluates whether a proposed action falls within the semantic scope.

### Confidence Scoring

Semantic matches include confidence scores (0.0-1.0):

| Score | Meaning | Action |
|-------|---------|--------|
| >= 0.9 | High confidence match | Block/enforce |
| 0.7-0.9 | Likely match | Warn, may need review |
| < 0.7 | Low confidence | Log as potential match |

---

## Implementation Pattern

### 1. Define Semantic Scope

```markdown
---
id: git-safety-protocol
severity: critical
scope: "Actions that modify or destroy git history, branches, or working directory state"
intent: destructive
---

# Git Safety Protocol

Actions that match this constraint include (but are not limited to):
- Resetting commits or HEAD position
- Force pushing (overwrites remote history)
- Deleting branches
- Cleaning untracked files
- Any action that cannot be easily undone
```

### 2. LLM Evaluation Prompt

```
Given the constraint scope:
"{scope}"

And the proposed action:
"{action}"

Evaluate:
1. Does the action fall within the constraint scope? (yes/no/uncertain)
2. What is the action's intent? (destructive/modifying/read-only/external)
3. Confidence score (0.0-1.0)
4. Reasoning (1-2 sentences)

Respond in JSON format.
```

### 3. Process Response

```typescript
interface SemanticMatch {
  matches: boolean;
  intent: 'destructive' | 'modifying' | 'read-only' | 'external';
  confidence: number;
  reasoning: string;
}

function evaluateAction(action: string, constraint: Constraint): SemanticMatch {
  const prompt = buildEvaluationPrompt(action, constraint.scope);
  const response = await llm.complete(prompt);
  return parseSemanticMatch(response);
}
```

### 4. Apply Thresholds

```typescript
function shouldBlock(match: SemanticMatch, constraint: Constraint): boolean {
  if (!match.matches) return false;

  // High confidence + critical = block
  if (match.confidence >= 0.9 && constraint.severity === 'critical') {
    return true;
  }

  // Medium confidence = warn
  if (match.confidence >= 0.7) {
    emitWarning(match, constraint);
    return constraint.severity === 'critical';
  }

  // Low confidence = log only
  logPotentialMatch(match, constraint);
  return false;
}
```

---

## Testing Strategy

### Test Semantic Equivalence

```typescript
describe('Semantic Similarity', () => {
  const gitSafetyScope = "Actions that modify or destroy git history";

  it('should match equivalent actions', async () => {
    const equivalentActions = [
      "git push --force",
      "git push -f",
      "force push to origin",
      "overwrite remote history",
      "git push --force-with-lease",
    ];

    for (const action of equivalentActions) {
      const match = await evaluateAction(action, gitSafetyScope);
      expect(match.matches).toBe(true);
      expect(match.confidence).toBeGreaterThan(0.8);
    }
  });

  it('should not match unrelated actions', async () => {
    const unrelatedActions = [
      "git push origin main",  // Normal push, not force
      "git status",
      "create new branch",
    ];

    for (const action of unrelatedActions) {
      const match = await evaluateAction(action, gitSafetyScope);
      expect(match.matches).toBe(false);
    }
  });
});
```

### Test Intent Classification

```typescript
describe('Intent Classification', () => {
  it('should classify destructive actions', async () => {
    const destructiveActions = [
      "delete the repository",
      "rm -rf everything",
      "force push over remote",
      "hard reset to origin",
    ];

    for (const action of destructiveActions) {
      const match = await evaluateAction(action, anyScope);
      expect(match.intent).toBe('destructive');
    }
  });
});
```

---

## Common Pitfalls

### 1. Mixing Pattern and Semantic Matching

**Problem**: Using patterns as a "fast path" before semantic evaluation

```typescript
// WRONG: Patterns as optimization
if (action.includes('--force')) {
  return { matches: true };  // Skip LLM
}
return semanticEvaluate(action);
```

**Fix**: Always use semantic evaluation. Pattern matching undermines the approach.

### 2. Ignoring Confidence Scores

**Problem**: Treating all matches as equally certain

```typescript
// WRONG: Binary matching
if (match.matches) {
  block(action);
}
```

**Fix**: Use confidence thresholds for graduated response.

### 3. Overly Narrow Scope

**Problem**: Scope too specific, misses semantic equivalents

```yaml
# WRONG: Too narrow
scope: "git reset --hard command"

# CORRECT: Intent-based
scope: "Actions that discard uncommitted changes"
```

### 4. Missing Edge Cases in Scope

**Problem**: Scope doesn't anticipate alternative ways to achieve same effect

```yaml
# WRONG: Only mentions git commands
scope: "Actions using git reset"

# CORRECT: Describes effect, not mechanism
scope: "Actions that move HEAD or discard commits"
```

---

## When to Use Alternatives

### Use Pattern Matching For:

- **File path selection**: `--constraints docs/constraints/*.md`
- **Log filtering**: grep for specific error codes
- **Input validation**: regex for email format

### Use Semantic Matching For:

- **Action classification**: determining what an action does
- **Constraint enforcement**: checking if action violates rules
- **Intent analysis**: understanding user/agent goals
- **Safety checks**: any blocking decision

**Rule of thumb**: If the match result affects safety or correctness, use semantic.
If it's just file selection or formatting, pattern matching is acceptable.

---

## Performance Considerations

### Caching

Cache semantic evaluations for identical (action, scope) pairs:

```typescript
const cache = new Map<string, SemanticMatch>();

function evaluateWithCache(action: string, scope: string): SemanticMatch {
  const key = `${action}::${scope}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = semanticEvaluate(action, scope);
  cache.set(key, result);
  return result;
}
```

### Batching

For multiple constraints, batch evaluate:

```typescript
async function evaluateAllConstraints(
  action: string,
  constraints: Constraint[]
): SemanticMatch[] {
  // Parallel evaluation
  return Promise.all(
    constraints.map(c => evaluateAction(action, c))
  );
}
```

### Cost Management

- Use smaller models for initial screening (0.7 threshold)
- Use larger models for critical decisions (0.9+ confidence)
- Cache aggressively (action+scope pairs are stable)

---

## Comparison: Pattern vs Semantic

| Criterion | Pattern Matching | Semantic Matching |
|-----------|------------------|-------------------|
| **Evasion resistance** | Low (trivially bypassed) | High (understands intent) |
| **Implementation complexity** | Simple | Moderate |
| **Latency** | <1ms | 100-500ms |
| **Cost** | Free | LLM API cost |
| **Maintenance** | High (update patterns) | Low (scope is stable) |
| **Coverage** | Explicit only | Implicit equivalents |
| **False positives** | Low (exact match) | Possible (needs tuning) |
| **False negatives** | High (missed variants) | Low (semantic coverage) |

**Recommendation**: For safety-critical operations, semantic matching's higher accuracy
outweighs its latency and cost. For non-safety operations, pattern matching is acceptable.

---

## Conclusion

LLM-based semantic similarity is required for any skill that enforces constraints or
classifies actions. Pattern matching is prohibited for safety-critical operations.

**Key takeaways**:

1. Define constraints with semantic **scope** and **intent**, not patterns
2. Always include confidence scores in matches
3. Use graduated response (block/warn/log) based on confidence
4. Test semantic equivalence, not just exact matches
5. Cache results for performance

**Decision framework**:

```
Is this a safety-critical decision?
├─ Yes → Use semantic matching (this guide)
└─ No →
   ├─ File selection → Pattern matching OK
   └─ Content analysis → Use semantic matching
```

---

## Related Documentation

- **ARCHITECTURE.md**: System overview, layer dependencies
- **constraint-enforcer SKILL.md**: Primary consumer of semantic matching
- **severity-tagger SKILL.md**: Uses semantic analysis for classification

---

*Guide created 2026-02-13 following guide-generation workflow.*
*Evidence source: NEON-SOUL semantic matching implementation.*
