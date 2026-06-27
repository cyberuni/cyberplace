# create-spec

User-facing SDD entry skill for **new** capability content: scaffold a new spec node under the
project tree (`.agents/specs/<project>/`), then dispatch the explore producer chain (`sdd-operator`)
over it. Leaves the node at `status: draft`, ready for the spec gate (`validate-spec`).

create-spec owns the **user channel** the operator lacks — it classifies the node's `spec-type` and
`artifact-types`, scaffolds the type-matching README + `.feature` skeleton, collects the up-front
grill (new feature) or signals backfill, then drives the operator under an iteration cap. It writes
no control frontmatter and advances no status past draft. An **existing** node is `revise-spec`.

References `sdd:lifecycle-governance` (status enum, `draft`), `sdd:ownership-governance`
(write-ownership), `sdd:spec-format-governance` + `sdd:suite-format-governance` (skeleton shape).
