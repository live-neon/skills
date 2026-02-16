# Skills CJK Vocabulary (技能語彙)

Agent-optimized notation for skill invocation and logic expression.

---

## Skill Aliases (技能別名)

| Alias | Full Name | CJK | Meaning |
|-------|-----------|-----|---------|
| `/fm` | failure-memory | 記憶 | Memory/記録 |
| `/ce` | constraint-engine | 制約 | Constraint/制限 |
| `/cv` | context-verifier | 検証 | Verification |
| `/ro` | review-orchestrator | 審査 | Review/審議 |
| `/gov` | governance | 治理 | Governance |
| `/sc` | safety-checks | 安全 | Safety |
| `/wt` | workflow-tools | 工具 | Tools |

---

## Sub-command CJK (副命令)

### failure-memory (記憶)
| Sub | CJK | Logic |
|-----|-----|-------|
| detect | 検出 | fail∈{test,user,API}→record |
| record | 記録 | pattern→obs, R++∨C++∨D++ |
| search | 索引 | query(pattern∨tag)→obs[] |
| classify | 分類 | obs→N∈{1:弱,2:中,≥3:強} |
| refactor | 整理 | obs[]→merge∨split |
| converge | 収束 | similarity≥0.8→pattern |
| status | 状態 | eligible:R≥3∧C≥2 |

### constraint-engine (制約)
| Sub | CJK | Logic |
|-----|-----|-------|
| check | 検査 | constraints→pass✓∨block✗ |
| generate | 生成 | R≥3∧C≥2∧D/(C+D)<0.2→constraint |
| status | 状態 | active[]∧circuit∈{CLOSED,OPEN,HALF} |
| override | 上書 | bypass(temp)+audit |
| lifecycle | 周期 | draft→active→retiring→retired |
| version | 版本 | v++, history.preserve |
| threshold | 閾値 | user∨context→custom |

### context-verifier (検証)
| Sub | CJK | Logic |
|-----|-----|-------|
| hash | 哈希 | file→SHA256 |
| verify | 検証 | file×hash→match✓∨mismatch✗ |
| tag | 標記 | severity∈{critical,important,minor} |
| packet | 包装 | files[]→{path,hash,severity}[] |

### review-orchestrator (審査)
| Sub | CJK | Logic |
|-----|-----|-------|
| select | 選択 | context×risk→type |
| twin | 双子 | spawn(tech,creative)→findings[] |
| cognitive | 認知 | spawn(opus4,41,sonnet45)→analysis[] |
| gate | 門番 | staged→pass✓∨block✗ |

### governance (治理)
| Sub | CJK | Logic |
|-----|-----|-------|
| state | 状態 | central_state+event→alert |
| review | 審査 | constraints.due→queue |
| index | 索引 | skills[]→INDEX.md |
| verify | 検証 | source↔compiled→sync✓∨drift✗ |
| migrate | 移行 | schema.v(n)→v(n+1) |

### safety-checks (安全)
| Sub | CJK | Logic |
|-----|-----|-------|
| model | 機種 | version→pinned✓∨drift✗ |
| fallback | 代替 | chain.exists→safe✓∨missing✗ |
| cache | 快取 | age>TTL→stale✗ |
| session | 会話 | state→clean✓∨interference✗ |

### workflow-tools (工具)
| Sub | CJK | Logic |
|-----|-----|-------|
| loops | 循環 | scan(TODO∨DEFERRED)→openloop[] |
| parallel | 並列 | 5因子→serial∨parallel |
| mce | 極限 | lines>200→split[] |
| subworkflow | 副流 | task→clawhub.skill |

---

## Mathematical Notation (数学記法)

| Symbol | Meaning | Example |
|--------|---------|---------|
| ∈ | Element of | `fail∈{test,user,API}` |
| ∧ | AND | `R≥3 ∧ C≥2` |
| ∨ | OR | `pass✓ ∨ block✗` |
| → | Implies/maps to | `pattern→constraint` |
| ≥ | Greater or equal | `N≥3` |
| < | Less than | `D/(C+D)<0.2` |
| ✓ | Success/pass | `match✓` |
| ✗ | Failure/block | `block✗` |
| ++ | Increment | `R++` |
| [] | Array/list | `obs[]` |
| {} | Set | `{test,user,API}` |
| × | Cross/compare | `file×hash` |
| ⊂ | Subset of | `pbd ⊂ /fm classify` |

---

## Evidence Tiers (証拠階層)

| N | CJK | English | Action |
|---|-----|---------|--------|
| 1 | 弱 | Weak | Track only |
| 2 | 中 | Emerging | Verify pattern |
| ≥3 | 強 | Strong | Generate constraint |

---

## Hook Notation (鉤記法)

| Symbol | Meaning |
|--------|---------|
| ⚡ | Hook-enabled |
| PostToolUse | After tool completes |
| PreFileWrite | Before file modification |
| BLOCKING | Can halt operation |
| non-blocking | Log only, continue |

---

## Circuit States (回路状態)

| State | CJK | Behavior |
|-------|-----|----------|
| CLOSED | 閉 | Normal operation |
| OPEN | 開 | Block all matching |
| HALF | 半 | Allow with warning |

Thresholds: CRITICAL→3/30d | IMPORTANT→5/30d | MINOR→10/30d

---

## Lifecycle States (生命周期)

```
draft → active → retiring → retired
草稿    活性     退役中     退役済
```

---

*Standalone vocabulary for skills submodule. For full multiverse CJK, see `multiverse/docs/standards/CJK_VOCABULARY.md`*
