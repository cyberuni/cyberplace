# Tasks: Gate Autonomy & Accountability

The runtime machinery is **blocked-by sdd-orchestrator** (draft). The enforcement slice is independent and was implemented first.

## Done — enforcement slice (independent of the orchestrator)

- [x] `validate-spec` static state check (`.mts` + 12 `node:test`): illegal `(status, aligned, markers, .feature)` tuples + `approved-by` shape — serves: *illegal state rejected*, *layer-scoped aligned*, *agent self-assertion needs why* — ratified by unional
- [x] wired into `validate-spec` as the deterministic first step + agent fallback
- [x] fixed `sdd-spec-graph` illegal `draft+aligned:true` (caught by the check)

## Deferred — orchestrator-resident (blocked-by sdd-orchestrator)

- [ ] leash derivation at runtime (four-dimension assessment per gate, re-derived per run)
- [ ] gate report emission (verdict + leash derivation + markers-as-questions + decision menu)
- [ ] `approved-by` writing — orchestrator self-assert (`by: agent` + `why`), skill ratify (`by: <human>`)
- [ ] freeze/unfreeze + gate actions (approve/change/reject; impl-gate Framer-revert)

## Shared with `sdd-provenance` (one checker, two records)

- [ ] extend the `validate-spec` checker to also validate `produced-by` shape — **after sdd-provenance is approved** — so a single checker enforces both `approved-by` (judge) and `produced-by` (producer)
- [ ] orchestrator writes both `approved-by` and `produced-by` at the same dispatch/synthesis boundary

## Sequencing

`sdd-orchestrator` (foundation: dispatch, registry, production chain)
→ shared `validate-spec` checker (`approved-by` ✅ done; `produced-by` next, post-approval)
→ runtime machinery (leash · gate report · `approved-by` + `produced-by` writing) in the orchestrator.
