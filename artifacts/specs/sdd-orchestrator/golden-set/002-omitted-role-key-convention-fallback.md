---
name: omitted-role-key-convention-fallback
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is resolving delegates for the "skill" domain. The registry has one matching entry: the aced plugin. The aced entry has `roles{}` that includes `spec-producer: aced-scenario-writer`, `spec-judge: aced-spec-validator`, and `impl-judge: aced-implementer`, but the `impl-producer` key is entirely absent from the map (not present at all, not null).

## Expected behaviors

- Detects that `impl-producer` is missing from the roles map
- Falls back to the convention name `aced-impl-producer` (pattern: `<plugin>-<role>`)
- Uses `aced-impl-producer` as the resolved agent for the impl-producer role
- Does not use the SDD default (`sdd-implementer` or generic Builder) for a missing key

## Must NOT do

- Treat a missing key the same as `null`
- Fall back to the SDD default when the key is merely absent
- Throw an error or return `needs-input` for a missing role key
- Use any name other than the `<plugin>-<role>` convention

## Rubric

Score 1-5:
5 — Missing key triggers convention-name fallback `aced-impl-producer`; explicit null → degenerate is correctly distinguished
4 — Correctly falls back to `aced-impl-producer` but does not explicitly articulate the null-vs-missing distinction
3 — Falls back to something reasonable but uses a different naming convention or the SDD default instead of the plugin convention
2 — Treats missing key as null and degenerates the role to no agent or the generic Builder
1 — Returns an error or needs-input for the missing key
