# gate-validation-governance

Internal SDD governance (`user-invocable: false`). The **gate-legality** contract — what makes a
spec's state legal and how a gate records its verdict: the legal `(status, markers,
.feature, approval)` tuples, the per-node `spec-type` checks, derived sync (no stored flag), approval
attribution, and the no-resolvable-producer fail-closed rule.

A fixed-universal SDD governance, invariant per role. Loaded by validate-spec, the conductor, and the
spec-judge. It carries **no leash** — the self-clear-vs-escalate bar lives in
`.agents/specs/sdd/design/autonomy-rubric.md`. The field schema/transitions are `lifecycle-governance`; the legality
model folds into `.agents/specs/sdd/design/lifecycle-model.md` (no separate design doc); write-ownership is
`ownership-governance`; the mechanical authority is `validate-spec/scripts/check-spec-state.mts`. Not
triggered by users directly.
