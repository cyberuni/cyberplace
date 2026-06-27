# validate-spec

User-facing SDD skill that runs the **spec gate** (Draft → Approved) over a CR's spec + suite
**diff**. It runs the deterministic structural checks (`scripts/check-spec-state.mts` — the root
lifecycle tuple + the per-node `spec-type` reconcile) and the provenance structural checks first
(fail-closed on malformed `produced-by` / no resolvable producer; flag-only on uninstalled
producers), dispatches `sdd-operator` to run the distinct spec-judge over the **{director, builder,
architect}** lens set and derive the leash, then takes the verdict — self-asserting into the async
review queue when in leash, else showing the in-session digest and taking the human verdict.

On **approve** it freezes each touched `.feature` per-file (`@frozen`), appends a per-CR `gate`
line to `ledger.jsonl`, and writes `status: approved`; `spec.md`/READMEs stay aligned, never frozen.
The **impl gate** is the mission's, not here. The gate is verdict-only — it writes no setup
frontmatter and never fixes issues automatically.

References `sdd:lifecycle-governance`, `sdd:ownership-governance`, `sdd:gate-validation-governance`,
and the design rules under `.agents/specs/sdd/design/` (provenance, lifecycle/freeze, autonomy).

## scripts/

- `check-spec-state.mts` — deterministic state validator (root tuple + per-node spec-type
  reconcile); run via `pnpm verify:specs-new`. Tested by `check-spec-state.test.mts`.
