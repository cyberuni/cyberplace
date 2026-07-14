---
status: active
todos:
  - content: "Intake: locate handoff node, classify edit-class of the follow-up scenarios"
    status: completed
  - content: "Explore: draft handoff README + .feature delta for autonomous follow-up filing"
    status: completed
  - content: "Spec gate: cold sdd-spec-judge, freeze, ledger gate line"
    status: completed
  - content: "Deliver: update conductor handoff instructions in start-mission SKILL.md"
    status: completed
  - content: "Impl gate: cold sdd-impl-judge against frozen .feature"
    status: completed
  - content: "Handoff: pnpm verify, commit, PR, mail legate"
    status: completed
  - content: "BLOCKED on owner: harness classifier denied `gh issue create` — the doctrine's central act cannot execute"
    status: pending
---

# CR: handoff files identified follow-ups autonomously

**Source** — bare prompt (owner brief, relayed). No close-by-reference source → no `Closes #N`.

**Project spec** — `.agents/specs/sdd/` (project-path `plugins/sdd`).

## The change

At the **handoff** phase, when the conductor identifies follow-up work (noticed during the
mission, out of scope for it), it **files an issue per follow-up immediately and autonomously —
no approval gate**. Dedupe against existing open issues before filing.

**Owner's decision (encode as the decision, not as rationale prose):** identified follow-ups get
lost if they wait for a gate; filing is cheap and reversible. Handoff holds **standing authority**
to file — better to file now and close later than drop the thread.

## Scope

- `.agents/specs/sdd/mission/handoff/` — `README.md` + `acceptance/handoff.feature`
- `plugins/sdd/skills/start-mission/SKILL.md` — the conductor's Step 4 handoff instructions

## Findings from intake

- **No approval path exists to replace.** The frozen scenario `a reported follow-up becomes a new
  CR` is passive (`When the follow-up is filed`) — it never names who files or when. The brief's
  "old surface-and-wait-for-approval path (if any)" does not exist. This delta is **additive**,
  not a replacement.
- **Additive ⇒ freeze self-clears.** New scenarios assert filing is autonomous + deduped; the
  existing scenario's guarantee is untouched. No re-open, no Clearance floor.
- **Do not delegate to `create-issue`.** It is a repo-private skill (`.agents/skills/`), not
  shipped with the sdd plugin, and its steps 3–4 **ask the user to confirm** before filing — which
  contradicts the autonomous mandate. Spec the dedupe **behavior** (search existing open issues,
  skip on match) so the plugin stays portable and self-contained.
- **Forge-conditional.** SDD is not GitHub-specific; the delivery-shape contract already scopes
  "same-forge issue (GitHub, GitLab)". A project whose source has no issue forge files nothing —
  the follow-up stays in the distilled summary only.
- **Real evidence for the owner's rationale:** the ledger repeatedly records follow-ups "routed as
  a follow-up CR" as gate prose; #220–#223 were filed only because a human chased them.

## Open decisions to settle in explore

1. **Order** — file the issues **before** writing the distilled summary, so the summary references
   the filed issue numbers (not bare prose).
2. **No new floor** — filing autonomously *removes* a wait; it adds no escalation, so the frozen
   `no new floor` contract is reinforced, not contradicted.

## Outcome

Both gates self-asserted within `auto-all` leash, each clean on round 1 (no correction lines).
Spec gate ALIGNED (oracle/builder/architect PASS); impl gate 7/7, IMPLEMENTATION_PASS true.
`pnpm verify` green 21/21 on the `origin/main`-rebased tree. PR open for owner ratification.

## ★ BLOCKED — the doctrine's central act cannot execute in this harness

Handoff tried to dogfood the new doctrine by filing its one identified follow-up (the mixed
dedupe case, below). **The harness auto-mode classifier denied `gh issue create`**, reason:

> [External System Writes] … no user message names filing an issue or that destination; it also
> carries internal spec paths, ledger filenames, and doctrine details onto a public tracker
> (Excess Sensitive Detail).

This is the `#229` pattern (`frozen` ≠ `ever ran`) landing on this very CR: the suite is frozen,
the impl gate is green, and the central act **has never executed once**. The grant is real in the
spec and blocked at the runtime. Two distinct problems, both for the owner:

1. **Permission.** A standing `gh issue create` Bash permission rule (or equivalent) is needed, or
   the conductor's standing authority is spec-only. SDD cannot self-grant this.
2. **Body content.** The classifier also flagged internal spec paths + ledger filenames as
   excess detail for a public tracker. The spec says the summary is the *outward* distillate —
   the follow-up **issue body** has no such floor, and arguably needs one (the combat log's
   safe-to-publish floor is the obvious model). Not in this CR's scope.

## The unfiled follow-up (spec-gate strategist OBSERVATION, seq 2)

No scenario covers the **mixed** dedupe case — several follow-ups where some match existing open
issues and some do not. Pure edges are covered (all-match; no-forge). Composition is implied by
`each identified follow-up files its own issue` + `a follow-up matching an existing open issue is
not filed again`, so it did not block the gate — but an implementation that bails out of filing
entirely on the first match would pass both existing scenarios. Suggested additive scenario:

```gherkin
Scenario: a mixed follow-up set files only the unmatched follow-ups
  Given several identified follow-ups where some match existing open issues and some do not
  When handoff files the mission's follow-ups
  Then it files an issue only for the follow-ups with no match
  And it files no duplicate for the matched ones
```

The spec-gate architect OBSERVATION (the filing-specific no-escalation scenario overlaps the
general one) was **deliberately not filed** — the judge called it "not a defect, matches this
suite's existing style", and this CR's own rule says keep follow-ups sensible.

## NEXT

Owner decision on the permission grant above. If granted, file the mixed-case follow-up and
re-run this handoff step to prove the doctrine executes.
