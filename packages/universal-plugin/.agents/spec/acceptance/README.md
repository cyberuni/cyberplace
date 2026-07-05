# acceptance — cross-capability end-to-end

Home for e2e behavior that spans **more than one** capability node — e.g. `plugin init` → edit the
canonical manifest → `plugin validate` → `plugin build` and confirm the derived vendor manifests.

No `.feature` lives here yet. This is a descriptive placeholder (no `spec-type` marker, so it is not
a scanned node); a later mission formalizes the cross-capability suite once `plugin validate` and
`plugin init` are implemented. Single-capability behavior stays in that capability's own node.
