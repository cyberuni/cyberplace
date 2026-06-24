# Tasks: Gate Autonomy & Accountability

The runtime machinery is **blocked-by sdd-operator** (draft). The enforcement slice is independent and was implemented first.

## Done — enforcement slice (independent of the operator)

- [x] `validate-spec` static state check (`.mts` + 12 `node:test`): illegal `(status, aligned, markers, .feature)` tuples + `approved-by` shape — serves: *illegal state rejected*, *layer-scoped aligned*, *agent self-assertion needs why* — ratified by unional
- [x] wired into `validate-spec` as the deterministic first step + agent fallback
- [x] fixed `sdd-spec-graph` illegal `draft+aligned:true` (caught by the check)

## Done — operator-resident (implemented inline in the operator agent + SDD skills)

- [x] leash derivation at runtime — `sdd-operator` Step 4b (four-dimension assessment per gate, ceiling, re-derived per run)
- [x] gate report emission — `sdd-operator` Step 4b + Return contract (verdict per face + leash derivation + markers-as-questions + decision menu)
- [x] `approved-by` writing — `ownership-governance` matrix + operator self-assert (`by: agent` + `leash` + `why`), `validate-spec` ratify (`by: <human>`)
- [x] gate actions — `validate-spec` §6 (approve/change/reject per gate; impl-gate Director-revert unfreeze)

Awaiting the human **impl gate** (derived `auto-none` — blast radius reaches core SDD governance): the work above is provisional until ratified.

## Shared with `sdd-provenance` (one checker, two records)

- [ ] extend the `validate-spec` checker to also validate `produced-by` shape — **after sdd-provenance is approved** — so a single checker enforces both `approved-by` (judge) and `produced-by` (producer)
- [ ] operator writes both `approved-by` and `produced-by` at the same dispatch/synthesis boundary

## Sequencing

`sdd-operator` (foundation: dispatch, registry, production chain)
→ shared `validate-spec` checker (`approved-by` ✅ done; `produced-by` next, post-approval)
→ runtime machinery (leash · gate report · `approved-by` + `produced-by` writing) in the operator.
