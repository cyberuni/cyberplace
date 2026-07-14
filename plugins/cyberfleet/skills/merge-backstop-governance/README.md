# merge-backstop-governance

Partial Skill: invoke by name only — the Operator's merge discipline. Not user-invocable — loaded by the
`headless-operator` agent (and the in-session Operator persona) at the merge step of the lifecycle loop.

## When it loads

- The lifecycle loop has one or more missions reported done (a PR created at handoff) and must retire
  them to trunk.
- The `headless-operator` agent runs the merge step unattended; the in-session Operator runs the same
  discipline when it merges by hand.

## What it does

- **Order** — retires in **Operation order**, not issue order: a consumer never lands before its
  producer; the Operation is the retirement boundary. Uses the mission-graph engine's Operation views
  as retire guidance.
- **Gate** — a merge lands only if **speculative CI is green on the merged result** (not just the
  mission's own branch); a red result never reaches trunk.
- **Bisect** — on a red stacked batch, isolates the culprit mission, holds it (re-queued for repair as
  a single-writer graph append), and lands the innocent missions.
- **Depth** — bounds speculation depth by **predictor confidence**: commit near when unsure, speculate
  far when confident. Speculation never weakens the always-green invariant.

## What it does not do

- Never a CI runner, merge engine, or git host — those are `gh`/git/CI, invoked as mechanics.
- Never the `ready` scheduler (read-only); this is the write/retire side the dispatcher owns.
- Never the per-unit spawn mechanism (`cyberlegion unit spawn`).
