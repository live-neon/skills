# Errors

Command failures, exceptions, and error patterns.

Format: `[ERR-YYYYMMDD-XXX]`

---

## Template

```markdown
### [ERR-YYYYMMDD-XXX] Title

**Date**: YYYY-MM-DD
**Type**: Test failure / API error / Command failure
**R/C/D**: R=1, C=0, D=0

**Error**:
```
Error message or stack trace
```

**Context**:
What was happening when error occurred.

**Resolution**:
How it was fixed (if resolved).

**See also**: Related observations
```

---

*File format compatible with self-improving-agent@1.0.5*
