# workflows — cross-capability usage flows

Home for behavior that spans **more than one** capability node — e.g. `plugin init` → edit the
canonical manifest → `plugin validate` → `plugin build` and confirm the derived vendor manifests. A
**workflow** is the project-level analogue of a use case: a path through the composed capabilities.

No `.feature` lives here yet. This is a descriptive placeholder (no `spec-type` marker, so it is not
a scanned node); a later mission formalizes the workflow suite once `plugin validate` and
`plugin init` are implemented. Single-capability behavior stays in that capability's own node.
