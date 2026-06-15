# Evidence: SDD Workflow — Artifact-Anchored Model

## E01 — Two-mode model (exploration vs. implementation)

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Iterative refinement with project author
- Type: Primary (project author)
- Notes: All artifacts can exist in both modes. What changes is the validation bar, not code identity. Author explicitly confirmed: exploration code and implementation code can be the same code; they are not separate categories.

## E02 — Single gate: spec.md → Approved

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: `sdd-principles.md` + `spec-lifecycle.md` + author confirmation
- Type: Internal governance
- Notes: The only hard lifecycle gate that controls shipping. No equivalent gate for plan.md or tasks.md — they are strategy, not contract.

## E03 — .feature freeze after Approved

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: Once spec.md reaches Approved, .feature scenarios are frozen. Adding/removing scenarios requires new Draft → Approved cycle. Enforcement mechanism: agent definition (not validate-spec checklist).

## E04 — plan.md has no Draft → Approved

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: Plan is strategy (the how), not contract (the what). Strategies change during implementation — that is normal, not a violation. Formal plan approval would penalize adaptation. Review happens at MR time.

## E05 — Artifacts co-evolve in all directions during exploration

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: Author refinement session + cc-sdd/Kiro tool examples
- Type: Synthesized
- Notes: No required creation order during exploration. Writing rough tasks can reveal spec gaps. Exploration code can reveal plan is wrong. Test case discovery can surface spec gaps. All feedback loops are valid and expected.

## E06 — Exploration code is not throw-away by rule

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: "Throw-away" is a special case triggered by complexity (cross-cutting change, heavy mocking required), not a rule. When change is contained, exploration code often becomes implementation code. No ceremony needed — the bar rises, code does not swap.

## E07 — plan.md and tasks.md valid during exploration

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: Exploration can be complicated even when contained. Exploration plan/tasks can become implementation plan/tasks, or serve as source material. Same co-evolution model applies.

## E08 — Task granularity: unit of work, universal

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: Tasks are the atomic unit of work appropriate for what is being built. No domain-specific rule. The SDD plugin is domain-agnostic — applies to skills, plugins, code, libraries, applications.

## E09 — Three missing skills identified

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: Workflow analysis
- Type: Gap analysis
- Notes: `plan-spec`, `create-tasks`, `verify-implementation` are all missing from the current plugin. `validate-spec` covers only Draft→Approved; a separate `verify-implementation` skill is needed for Approved→Implemented.

## E10 — research.md threshold: topic depth, not count

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: Create research.md when investigation itself is worth sharing — another builder would benefit from reading how the decision was reached. Shallow unknowns go inline in plan.md. Not determined by number of unknowns.

## E11 — Backfill uses gap analysis to determine mode

- Date: June 2026
- Status: Confirmed (author-validated)
- Confidence: High
- Source: Author refinement session
- Type: Primary
- Notes: When code exists and spec is backfilled, gap analysis compares existing implementation quality (tests, docs, coverage) against spec scenarios. Gap determines whether existing code is exploration or implementation quality. Gap output seeds tasks.md.

## E12 — Project-level quality configuration needed (open)

- Date: June 2026
- Status: Open question
- Confidence: High (that the need exists); Low (on design)
- Source: Author refinement session
- Type: Design gap
- Notes: verify-implementation and promotion clarity depend on project-defined quality thresholds. The plugin needs a config surface. Design is unresolved.

## E13 — Agent definition must enforce .feature freeze (open)

- Date: June 2026
- Status: Open question
- Confidence: High (that the need exists)
- Source: Author refinement session
- Type: Design gap
- Notes: Agent must not modify .feature when spec.md is Approved. Needs to be formalized in plugin agent governance. Not a validate-spec checklist item.

## E14 — Gap analysis design in backfill (open)

- Date: June 2026
- Status: Open question
- Confidence: High (that the need exists)
- Source: Author refinement session
- Type: Design gap
- Notes: create-spec backfill path needs a gap analysis step. Design unresolved. Should output: mode determination + tasks seeding tasks.md.

## E15 — specs/spec.md:104 is a known doc error

- Date: June 2026
- Status: Confirmed error
- Confidence: High
- Source: Author confirmation + contradiction with sdd-principles.md rule 1
- Type: Internal doc
- Notes: "Implementation begins only after Approved" is incorrect under the two-mode model. Fix required in specs/spec.md and spec-lifecycle.md.
