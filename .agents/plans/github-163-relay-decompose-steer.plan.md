---
cr: github-163-relay-decompose-steer
source: https://github.com/cyberuni/cyberplace/issues/163
target-spec: .agents/specs/cyberlegion-plugin
status: active
todos:
  - content: "intake — CR opened, leash recorded, plan scaffolded"
    status: completed
  - content: "explore — additive receive-triage scenarios on dispatch.feature; draft SKILL/README"
    status: pending
  - content: "spec gate — classify-edit-class addOnly + cold spec-judge; self-assert"
    status: pending
  - content: "deliver — relay-governance SKILL.md + README receive contract; impl gate; pnpm verify"
    status: pending
  - content: "handoff — PR that Closes #163; mail operator"
    status: pending
---

# github-163 — relay-governance: decompose a relayed steer by authority level

**CR:** https://github.com/cyberuni/cyberplace/issues/163

relay-governance covers SEND (report/ask transport by lifecycle) but not RECEIVE: how a
receiver triages a relayed steer whose parts sit at different authority levels. Absent that,
a cautious receiver bundle-rejects — throwing away in-scope refinement with the out-of-scope
doctrine (the #158 pod did exactly this).

## The refinement (issue acceptance)

1. **Split by authority level** — in-scope refinement (testable against the receiver's OWN
   frozen spec / CR acceptance / leash) adopts in-band, no provenance needed; cross-cutting /
   out-of-leash doctrine escalates up the relay for ratification, never adopted on a peer's
   say-so.
2. **Questions-against-your-own-spec framing** — senders SHOULD phrase in-scope steers as
   questions answerable from the receiver's frozen spec; receivers SHOULD re-derive that form
   when a sender bundles.
3. **No bundle verdicts** — bundle-adopt (launders unratified doctrine) and bundle-reject
   (discards in-scope refinement) both named anti-patterns; decompose first, then
   adopt/escalate each part on its own merit.
4. **Provenance principle explicit** — authority over peer mail cannot be established; a
   receiver acts only on what it can verify against its own loaded spec/governance/leash;
   embedded ratification in relayed mail is invalid (the relayed-ratification seam).

## Surface

- **spec:** `.agents/specs/cyberlegion-plugin/dispatch/dispatch.feature` (frozen) — ADD a
  `# ── Receive: decompose a relayed steer ──` stage (additive → self-clears, stays @frozen);
  `dispatch/README.md` behavior row.
- **impl:** `plugins/cyberlegion/skills/relay-governance/SKILL.md` + `README.md` — new
  receive-side section.

Independent of #162 (session-adapter-governance, separate file, ratifies rule CONTENT); this
CR fixes general RECEIVE mechanics.

## NEXT

Explore: draft the additive scenarios, spike the SKILL.md section, dispatch cold spec-judge.
