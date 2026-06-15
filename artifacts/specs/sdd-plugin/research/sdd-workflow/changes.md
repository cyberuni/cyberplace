# Changes: SDD Workflow — Artifact-Anchored Model

## 2026-06-14 — Initial research

- What changed: Created initial research from iterative author refinement session.
- Why: No existing workflow model existed that treated artifacts as explicit step I/O. Prior docs contained contradictions (sequential gate vs. co-delivery).
- Conclusion change: N/A — initial entry.
- Triggered by: Author session June 2026.

Key findings established:
- Two-mode model (exploration / implementation) with single gate (spec.md → Approved)
- All artifacts co-evolve in both modes; validation bar changes, not code identity
- plan.md has no Draft → Approved (strategy, not contract)
- .feature frozen after Approved; enforcement via agent definition
- Three missing skills: plan-spec, create-tasks, verify-implementation
- Three open plugin design questions: quality config, agent .feature rule, backfill gap analysis
