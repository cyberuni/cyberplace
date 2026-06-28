# combat-log-governance

Internal SDD governance (`user-invocable: false`). The **combat-log** contract — the shape of the
production provenance record: the two-face record (current-state frontmatter + the durable ledger),
the tracked combat log (in the plan) vs the durable ledger (root-spec sibling), the four entry kinds
(`report` / `correction` / `gate` / `strategy`), the CR-scoped `seq`, and the matchable `cause` enum.

A fixed-universal SDD governance, invariant per role. Loaded by the conductor, validate-spec, and the
doctrine-loop Scanner. The model + three-tier rationale + plan retirement live in
`design/provenance-model.md`; freeze/gating in `lifecycle-governance`; write-ownership in
`ownership-governance`. Not triggered by users directly.
