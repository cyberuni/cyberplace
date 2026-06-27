# revise-spec

User-facing SDD entry skill for an **existing** spec node: dispatch the explore producer chain
(`sdd-operator`) to grill and tighten what is already written — **no scaffolding**. Leaves the node
at `status: draft`, ready for the spec gate (`validate-spec`). The smaller twin of `create-spec`.

revise-spec carries the **re-open precondition** — an `approved`/`implemented` node's `.feature` is
frozen and may not be revised without a ratified re-open — owns the **user channel** the operator
lacks (the revise grill and the iteration loop), and routes the operator's split observations to a
new node or a corpus operation. It writes no control frontmatter and advances no status.

References `sdd:lifecycle-governance` (status enum, freeze re-open) and `sdd:ownership-governance`
(write-ownership).
