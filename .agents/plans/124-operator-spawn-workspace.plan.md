---
cr: 124-operator-spawn-workspace
project: cyberfleet-plugin
status: active
todos:
  - content: "explore — add additive @behavior scenario for --at workspace to operator.feature"
    status: completed
  - content: "spec gate — additive self-clears, stays @frozen; self-assert within leash"
    status: completed
  - content: "deliver — add --at workspace to operator SKILL.md spawn bullet"
    status: completed
  - content: "impl gate — verify SKILL.md matches new scenario; pnpm verify"
    status: completed
  - content: "handoff — commit, push, PR closing #124"
    status: in_progress
---

# CR 124 — Operator spawns ships with own workspace

DOC-ONLY. Operator's documented spawn invocation must pass `--at workspace` explicitly so a
commissioned ship opens its own herdr workspace, not a pane crowding a neighbor. PR #167 (#161)
already made new-worktree `cyberlegion unit spawn` default to `workspace`; #124 closes the
**documentation** gap — the operator persona skill never states the own-workspace shape.

Decision (settled): pass `--at workspace` **explicitly**. Rationale — "a ship = its own worktree =
its own workspace" is a cyberfleet opinion asserted one layer up; the cyberlegion primitive stays
neutral. Explicit is legible and robust regardless of the primitive's default. Issue acceptance
also requires the documented invocation to include `--at workspace`.

Scope: two tracked files —
- `.agents/specs/cyberfleet-plugin/operator/operator.feature` (frozen) — **add** one `@behavior`
  scenario (additive → self-clears, stays `@frozen`, no re-open).
- `plugins/cyberfleet/skills/operator/SKILL.md` — add `--at workspace` to the spawn bullet.

No CLI verbs change. `unit spawn` / `unit who` are canonical; the skill's verbs are correct.

## NEXT

Landed both gates (spec + impl self-asserted, cold ACED judges PASS, pnpm verify green). Push branch
and open PR closing #124. Keep plan until merged + doctrine-distilled.

Follow-up (separate CR): strip the pre-existing stray `</content>` trailing line + soft-wrapped step
text from `operator.feature`, `pod.feature`, and the two READMEs (gherkin-cli strict-parse hygiene).
