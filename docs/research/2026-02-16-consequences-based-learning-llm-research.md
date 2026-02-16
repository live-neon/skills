# Research: Consequences-Based Learning in LLM Agents

**Date**: 2026-02-16
**Purpose**: External research on "consequences over instructions" patterns and mathematical notation for AI agent learning
**Context**: Supporting documentation for `docs/workflows/creating-new-skill.md` and agentic skills architecture

---

## Executive Summary

This research validates the core principle underlying Live Neon's agentic skills: **AI systems learn best from consequences, not instructions**. The approach aligns with broader industry trends in reinforcement learning, self-improving agents, and constraint-based safety systems.

Key findings:
1. **RL over instructions**: Pure reinforcement learning (DeepSeek-R1, RLVR) produces better reasoning than supervised instruction-following
2. **Evidence accumulation**: Threshold-based eligibility (R≥3, C≥2) mirrors active learning principles where uncertain examples are most informative
3. **Circuit breaker patterns**: Industry-standard safety mechanisms use similar threshold-violation → cooldown → recovery flows
4. **Memory persistence**: Self-improving agents require persistent, utility-based memory with rigorous selection for storage and removal

---

## 1. Reinforcement Learning vs. Instructions

### The Shift from Instructions to Outcomes

Recent breakthroughs demonstrate that reasoning abilities of LLMs can be incentivized through pure reinforcement learning, eliminating the need for human-labeled reasoning trajectories.

> "Unlike supervised learning or unsupervised learning, RL is built on interaction—the system learns by doing, by nudging the environment and watching how it reacts. Rewards, penalties, surprises, and mistakes shape the policy more than any static dataset ever could."
> — [The State of Reinforcement Learning 2025](https://www.turingpost.com/p/stateofrl2025)

**Key developments (2025-2026)**:

| Development | Approach | Result |
|-------------|----------|--------|
| DeepSeek-R1 | Pure RL for reasoning | Emergent self-reflection, verification, dynamic strategy adaptation |
| RLVR (Reinforcement Learning with Verifiable Rewards) | Deterministic correctness labels | Expanding beyond math/code to chemistry, biology |
| GRPO Algorithm | Post-training with verification | Standard practice in LLM pipelines |

**Why this matters for agentic skills**: The R/C/D counter system implements this principle—failures (R) are the "rewards/penalties" that shape behavior, while human confirmations (C) and disconfirmations (D) provide verification signals.

### Sources
- [DeepSeek-R1 Nature Paper](https://www.nature.com/articles/s41586-025-09422-z)
- [RLHF 101 - CMU Machine Learning Blog](https://blog.ml.cmu.edu/2025/06/01/rlhf-101-a-technical-tutorial-on-reinforcement-learning-from-human-feedback/)
- [State of LLMs 2025 - Sebastian Raschka](https://magazine.sebastianraschka.com/p/state-of-llms-2025)

---

## 2. Self-Improving Agent Patterns

### Six Core Mechanisms for Self-Improvement

Research from [Yohei Nakajima (BabyAGI creator)](https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/) identifies six patterns:

| Pattern | How It Works | Persistence |
|---------|--------------|-------------|
| **Reflection & In-Loop Feedback** | Agents critique own outputs | Ephemeral (session-only) |
| **Self-Correction Training** | Train on mistake-correction pairs | Permanent (in weights) |
| **Self-Generated Curricula** | Create own training tasks | Label-free, requires curation |
| **Model Self-Adaptation** | Generate self-edit instructions | Interpretable, requires pipeline |
| **Code-Level Self-Modification** | Edit own source code | Persistent, 17-53% improvements |
| **Embodied Self-Practice** | Environment interaction | Autonomous refinement |

**Critical success factors identified**:
1. **Feedback Quality** — Signal reliability, not scale, is the bottleneck
2. **Persistent Structures** — Experience → reusable artifacts (trajectories become exemplars)
3. **Verification Gates** — Self-improvement as "proposal process gated by rigorous checks"

### Alignment with Agentic Skills

Our approach maps to these patterns:

| Our Component | Research Pattern | Implementation |
|---------------|------------------|----------------|
| `.learnings/` directory | Persistent Structures | Observations become reusable |
| Human C/D verification | Verification Gates | Confirmations gate constraint generation |
| R≥3 threshold | Self-Generated Curricula | Multiple failures = training signal |
| Circuit breaker | Reflection & In-Loop | Runtime feedback prevents runaway |

### Sources
- [Better Ways to Build Self-Improving AI Agents](https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/)
- [Stanford CS329A: Self-Improving AI Agents](https://online.stanford.edu/courses/cs329a-self-improving-ai-agents)
- [Unlocking LLMs' Self-Improvement Capacity](https://aclanthology.org/2025.findings-acl.1084.pdf)

---

## 3. Evidence Accumulation and Thresholds

### The R/C/D Pattern in Research Context

The confirmation-disconfirmation dynamic in evidence accumulation has deep roots in decision science:

> "When metacognitive agents assign low confidence to decisions, they tend to become more open to new information... models predict that when confidence falls below 0.5, agents should show a 'disconfirmation' bias."
> — [Confirmation bias is adaptive when coupled with efficient metacognition](https://pmc.ncbi.nlm.nih.gov/articles/PMC7935132/)

**Key insight**: Our D/(C+D) < 0.2 threshold (false positive rate below 20%) implements this metacognitive principle—constraints only emerge when evidence confidence is high.

### Mathematical Thresholds in AI Safety

Research on autonomous AI agents identifies **outcome-driven constraint violations** as a critical concern:

> "Emergent forms of outcome-driven constraint violations arise when agents pursue goal optimization under strong performance incentives while deprioritizing ethical, legal, or safety constraints."
> — [Benchmark for Constraint Violations (arXiv:2512.20798)](https://arxiv.org/abs/2512.20798)

**Threshold effectiveness varies by model**:
- Outcome-driven constraint violations range from 1.3% to 71.4% across 12 state-of-the-art LLMs
- This variance supports the need for project-specific threshold tuning

### Eligibility Formula Validation

Our formula `R≥3 ∧ C≥2 ∧ D/(C+D)<0.2 ∧ sources≥2` aligns with:

| Component | Research Basis |
|-----------|----------------|
| R≥3 | Active learning: "uncertain examples are most informative" |
| C≥2 | Verification gates: "rigorous checks" prevent false positives |
| D/(C+D)<0.2 | Metacognitive threshold: high confidence before action |
| sources≥2 | Diversity requirement: prevents overfitting to single context |

### Sources
- [Confirmation Bias and Evidence Accumulation](https://pmc.ncbi.nlm.nih.gov/articles/PMC7935132/)
- [A Framework for Studying AI Agent Behavior](https://arxiv.org/html/2509.25609)
- [Constraint Violations Benchmark](https://arxiv.org/abs/2512.20798)

---

## 4. Circuit Breaker Patterns

### Industry Standard Implementation

Circuit breakers are now standard in AI agent safety:

> "Circuit breakers prevent a bad situation from spiraling further... when certain thresholds are crossed, the breaker trips and the failing provider or model is removed from the routing pool."
> — [Retries, fallbacks, and circuit breakers in LLM apps](https://portkey.ai/blog/retries-fallbacks-and-circuit-breakers-in-llm-apps/)

### Threshold Mechanisms

[Research on trustworthy AI agents](https://www.sakurasky.com/blog/missing-primitives-for-trustworthy-ai-part-6/) identifies key patterns:

| Mechanism | Purpose | Implementation |
|-----------|---------|----------------|
| **Kill Switches** | Boolean agent disable | Redis/feature flags for low-latency |
| **Token Bucket Rate Limiting** | Action frequency control | Tokens refilled over time |
| **Sliding Window Detection** | Pattern detection | Flag >5 identical actions in 2 seconds |
| **Policy-Based Hard Stops** | Semantic constraints | OPA/Rego rules independent of frequency |

**Critical design principle**: Per-agent state isolation prevents one agent's activity from affecting others.

### Alignment with Our Circuit Breaker

Our implementation (`CLOSED → OPEN → HALF-OPEN → CLOSED`) matches industry patterns:

| Our State | Industry Equivalent |
|-----------|---------------------|
| CLOSED (normal) | Circuit accepting requests |
| OPEN (5 violations in 30d) | Circuit tripped, requests blocked |
| HALF-OPEN (24h cooldown) | Testing period before recovery |
| Severity tiers (3/5/10) | Risk-based threshold tuning |

### Sources
- [Kill Switches and Circuit Breakers](https://www.sakurasky.com/blog/missing-primitives-for-trustworthy-ai-part-6/)
- [AI Agent Kill Switches - Practical Safeguards](https://www.pedowitzgroup.com/ai-agent-kill-switches-practical-safeguards-that-work)
- [Distributional AGI Safety](https://arxiv.org/html/2512.16856v1)

---

## 5. Memory Persistence and Learning from Errors

### The Criticality of Agent Memory

> "Memory has emerged as a core capability of foundation model-based agents... Agent memory is characterized by its role as a persistent, evolving, and self-improving substrate that integrates both factual knowledge and experiential traces."
> — [Memory in the Age of AI Agents (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564)

### Selective Memory is Essential

Research shows indiscriminate memory storage degrades performance:

> "Empirical findings show the necessity of rigorous selection for both storage and removal, as indiscriminate strategies propagate errors and degrade long-term agent performance, with utility-based and retrieval-history-based deletion yielding up to 10% performance gains."
> — [Memory Survey Paper](https://arxiv.org/abs/2512.13564)

**Implication for agentic skills**: Our R/C/D system implements selective memory—only observations meeting eligibility thresholds become constraints.

### Memory Architectures (2025)

| Architecture | Key Feature | Relevance |
|--------------|-------------|-----------|
| **Mem0** | Production-ready long-term memory | Scalable persistence |
| **MIRIX** | Multi-instance reasoning | Cross-task learning |
| **O-Mem** | Utility-based deletion | Quality over quantity |
| **Memoria** | Reflection-based modules | Generalizes across task distributions |

### Sources
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564)
- [Mem0: Production-Ready AI Agents with Long-Term Memory](https://arxiv.org/pdf/2504.19413)
- [AI-Native Memory and Context-Aware Agents](https://ajithp.com/2025/06/30/ai-native-memory-persistent-agents-second-me/)

---

## 6. Failure-Driven Learning Challenges

### Why AI Systems Struggle to Self-Correct

> "LLMs are great at following instructions but terrible at catching their own mistakes."
> — [Why AI Systems Can't Catch Their Own Mistakes](https://www.novaspivack.com/technology/ai-technology/why-ai-systems-cant-catch-their-own-mistakes-and-what-to-do-about-it)

Research systematically analyzed 8 reasoning models (7B-685B parameters) and found consistent self-evaluation failures. This validates the need for **external verification** (human C/D) rather than relying on agent self-assessment.

### Multi-Agent Error Recovery

The "17x Error Trap" in multi-agent systems:

> "A major challenge in identifying high-quality training instances is trajectory evaluation—quantifying how much progress was made towards task completion."
> — [Why Your Multi-Agent System is Failing](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/)

**Solution**: Constraint-based evaluation frameworks provide fine-grained assessment, enabling leverage of partially successful trajectories.

### Sources
- [Why AI Can't Catch Own Mistakes](https://www.novaspivack.com/technology/ai-technology/why-ai-systems-cant-catch-their-own-mistakes-and-what-to-do-about-it)
- [Multi-Agent Error Trap](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/)
- [LLM Reasoning Failures](https://www.emergentmind.com/topics/reasoning-failures-in-llms)

---

## 7. Implications for Skill Design

### Validated Patterns

Our agentic skills architecture aligns with research in these areas:

| Our Pattern | Research Validation |
|-------------|---------------------|
| "Consequences over instructions" | RLVR, DeepSeek-R1 show RL outperforms instruction-following |
| R/C/D counter system | Evidence accumulation with metacognitive thresholds |
| Eligibility formula | Active learning: uncertain examples most informative |
| Circuit breaker | Industry-standard safety mechanism |
| `.learnings/` persistence | Memory survey: selective, utility-based storage |
| Human verification (C/D) | External verification needed; AI self-evaluation unreliable |

### Open Questions

| Question | Research Status |
|----------|-----------------|
| Optimal threshold values | Model-dependent; 1.3%-71.4% violation variance suggests tuning needed |
| Dynamic thresholds | "Hidden metrics, akin to financial audits" may prevent gaming |
| Cross-session learning | Reflection-based memory modules show promise |
| Semantic classification | Two-stage matching (embedding + LLM) emerging as standard |

### Recommendations

1. **Keep R≥3 threshold**: Aligns with active learning principles
2. **Consider dynamic D/(C+D) threshold**: Research suggests agents may optimize to skirt static thresholds
3. **Implement utility-based memory pruning**: 10% performance gains from selective deletion
4. **Add semantic classification**: Two-stage matching for IMPORTANT/MINOR severity constraints

---

## 8. Future Research Directions

### Emerging Patterns (2026 Predictions)

From [AI in 2026 Predictions](https://dr-arsanjani.medium.com/ai-in-2026-predictions-mapped-to-the-agentic-ai-maturity-model-c6f851a40ef5):

1. **Digital DNA / Constitutional Guardrails**: Hardcoded security protocols agents cannot optimize away
2. **Sandboxed Self-Evolution**: Autonomy granted only within monitored environments
3. **Formal Decision Traces**: SMT solvers + neural models for machine-checkable proof certificates

### Regulatory Considerations

Proposed frameworks require:
- Documentation of **action space** (permitted actions)
- **Autonomy limits** (maximum action sequences before human intervention)
- Transparent threshold definitions

### Sources
- [AI in 2026 Predictions](https://dr-arsanjani.medium.com/ai-in-2026-predictions-mapped-to-the-agentic-ai-maturity-model-c6f851a40ef5)
- [AI Agents Should be Regulated Based on Autonomous Operations](https://arxiv.org/html/2503.04750v2)
- [Formal Decision Traces](https://www.researchsquare.com/article/rs-8736256/v1)

---

## Summary

The research validates our core architecture decisions:

1. **Consequences-based learning** is the direction the industry is moving (RLVR, self-improving agents)
2. **Mathematical thresholds** (R≥3, C≥2, D/(C+D)<0.2) align with active learning and metacognition research
3. **Circuit breaker patterns** are industry-standard and our implementation matches best practices
4. **Selective memory persistence** with human verification addresses known AI self-evaluation failures
5. **External verification** (human C/D) is essential because LLMs struggle to catch their own mistakes

The agentic skills architecture is well-positioned relative to current research, with opportunities to add dynamic thresholds and enhanced semantic classification in future iterations.

---

*Research compiled: 2026-02-16*
*Related files: `docs/workflows/creating-new-skill.md`, `docs/architecture/README.md`*
