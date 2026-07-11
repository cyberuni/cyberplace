---
name: handoff-pr-closes-ref
status: active
todos:
  - content: "intake: locate node mission/handoff (revise), leash shard c4a599, plan scaffolded"
    status: completed
  - content: "explore: added 2 additive scenarios to handoff.feature (PR body carries source auto-close ref; non-close-capable source -> none) + README prose sync"
    status: completed
  - content: "spec gate: sdd-spec-judge ALIGNED; gherkin-cli diff addOnly:true -> stays @frozen; ledger seq2 self-asserted"
    status: completed
  - content: "deliver: synced impl start-mission Step 4 (write Closes #<n> when source closes by ref, none otherwise); automaton inherits, unedited; intake/README stale-drift synced"
    status: completed
  - content: "impl gate: sdd-impl-judge IMPLEMENTATION_PASS; ledger seq3 self-asserted"
    status: completed
  - content: "handoff: pnpm verify 19/19; branch+PR (no Closes ref — CR has no source issue, dogfoods the negative case); combat log kept"
    status: pending
---

# CR handoff-pr-closes-ref — handoff writes the PR auto-close reference

Target spec: `.agents/specs/sdd` (node `mission/handoff/`). **Revise**, additive.

General-prompt CR (no source issue drives it; #122 is an unrelated cyberlegion concern).

## The gap

Both the handoff README (`conditional status write-back`, line ~37/130) and the intake README
(line ~99) describe the model — "a PR closes the source on merge (`Closes #N`)" — but **no frozen
scenario asserts handoff WRITES that closing reference into the PR body**. The only PR/source
scenario ("a merged PR closes the source without a separate close") tests the *merge* side and
presumes the reference is already there. So an implementation can pass the suite while never
emitting `Closes #N` — which is what happened on PR #120 (its source issue never auto-closed).

## Scope

- **Additive** to `.agents/specs/sdd/mission/handoff/handoff.feature`, under "Conditional status
  write-back": PR-flow + close-by-reference-capable source ⇒ PR body carries the closing
  reference; source not close-capable (bare prompt, cross-system) ⇒ no closing reference. Nothing
  existing narrowed ⇒ self-clears, stays `@frozen`, no re-open (confirm via `gherkin-cli diff`).
- **Prose sync** (`mission/handoff/README.md`): make "handoff *writes* the source's auto-close
  reference when the source supports it" explicit in the write-back section.
- **Impl sync** (`plugins/sdd/skills/start-mission/SKILL.md` Step 4 + `plugins/sdd/agents/sdd-automaton.md`):
  instruct writing the source's auto-close reference (e.g. `Closes #N`) into the PR body when the
  source supports close-by-reference.

## NEXT

Draft the two additive scenarios + README prose delta; spawn cold `sdd:sdd-spec-judge`; confirm
additive via `npx gherkin-cli@0.0.1 diff --base HEAD <feature> --format json`; run spec gate.
