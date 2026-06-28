# create-spec

User-facing SDD entry skill for **new** capability content: scaffold a new spec node under the
project tree (`.agents/specs/<project>/`), then run the explore producer chain **in-session** over
it. Leaves the node at `status: draft`, ready for the spec gate (`validate-spec`).

create-spec runs in the **main session as the conductor** — it classifies the node's `spec-type` and
`artifact-types`, scaffolds the type-matching README + `.feature` skeleton, collects the seed intent
(new feature) or signals backfill, then runs the spec-producer **inline**, grilling the human live
and spawning the **cold spec-judge** (and the impl-producer builder for build-to-learn) under an
iteration cap. It is the positional ratifier, writes no control frontmatter, and advances no status
past draft. The spawned `sdd-operator` is the headless fallback only. An **existing** node is
`revise-spec`.

References `sdd:lifecycle-governance` (status enum, `draft`), `sdd:ownership-governance`
(write-ownership), `sdd:spec-producer-governance` (the inline grilling procedure),
`sdd:spec-format-governance` + `sdd:suite-format-governance` (skeleton shape).
