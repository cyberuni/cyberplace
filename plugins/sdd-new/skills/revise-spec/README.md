# revise-spec

User-facing SDD entry skill for an **existing** spec node: run the explore producer chain
**in-session** to grill and tighten what is already written — **no scaffolding**. Leaves the node
at `status: draft`, ready for the spec gate (`validate-spec`). The smaller twin of `create-spec`.

revise-spec runs in the **main session as the conductor** (spawned `sdd-operator` is the headless
fallback only): it carries the **re-open precondition** — an `approved`/`implemented` node's
`.feature` is frozen and may not be revised without a ratified re-open — runs the spec-producer
**inline**, grilling the human live and spawning the **cold spec-judge** each round, and routes
split observations to a new node or a corpus operation. It is the positional ratifier, writes no
control frontmatter, and advances no status.

References `sdd:lifecycle-governance` (status enum, freeze re-open), `sdd:ownership-governance`
(write-ownership), and `sdd:spec-producer-governance` (the inline grilling procedure).
