---
name: wire-formation-trigger
cr: wire-formation-trigger
target-spec: .agents/specs/sdd
ledger-shard: .agents/specs/sdd/ledger/wire-formation-trigger.2ef768.jsonl
status: active
todos:
  - id: explore-spec
    status: pending
    content: add additive scenario to mission/handoff/handoff.feature (handoff spawns sdd-warden, detached, post-landing)
  - id: explore-readme
    status: pending
    content: update mission/handoff/README.md placement section to distinguish scoped placement pass vs corpus-wide detached spawn
  - id: explore-loops
    status: pending
    content: update design/loops.md line 65 wording — formation now fires automatically post-mission; campaign/doctrine/forge still "may fire"
  - id: spec-gate
    status: pending
    content: cold spec-judge over the additive handoff.feature scenario + README/loops.md changes
  - id: deliver-impl
    status: pending
    content: update plugins/sdd/skills/start-mission/SKILL.md Step 4 — spawn sdd:sdd-warden by name, detached, after landing
  - id: impl-gate
    status: pending
    content: cold impl-judge over the new handoff.feature scenario
  - id: handoff
    status: pending
    content: commit, land on main (commit-to-main delivery shape)
---

# Mission: wire the formation loop's post-mission trigger

Formation-loop (`sdd-warden`) is documented "post-mission, corpus-wide and continuous" but nothing
spawns it — `mission/handoff/README.md` explicitly defers the corpus-wide pass and
`design/loops.md:65` hedges "may fire". Fix: handoff spawns `sdd:sdd-warden` by name, detached,
after a mission lands.

**Scope.** Formation-loop only. Doctrine-loop/sdd-scanner triggering is explicitly out of scope
(user's call — doctrine needs multi-mission signal to be useful).

**Prior research** (this session, before opening the CR): confirmed via Explore agent that neither
formation-loop nor doctrine-loop have any automatic invocation path today — only manual
(`/manage` → Audit & align, or direct `/formation-loop`/`/doctrine-loop`). Full drafted plan with
file-by-file detail: `/home/unional/.claude/plans/we-are-not-doing-nifty-sutherland.md` (scratch,
not part of this repo).

## NEXT — resume here

Run explore: add the additive scenario to `.agents/specs/sdd/mission/handoff/handoff.feature`
(near the existing placement-finalization scenarios):

```gherkin
Scenario: handoff spawns the formation loop after landing, detached
  Given a mission has landed in the declared delivery shape
  When handoff completes
  Then it spawns sdd-warden by name for a corpus-wide formation pass
  And it does not wait for that pass to return
```

Then update `mission/handoff/README.md` (the "Placement finalization" section) and
`design/loops.md:65` wording per the drafted plan above. Run the spec-producer/spec-judge grill
inline, converge, spec gate (should self-clear — additive only, no re-open). Then deliver: edit
`plugins/sdd/skills/start-mission/SKILL.md` Step 4 to add the spawn instruction. Impl gate, then
handoff (commit-to-main).
