---
name: cyberlegion-identity-presence-split
status: active
todos:
  - content: "split identity/identity.feature: extract the standing-identity (9 scenarios) and main-pane (8 scenarios) clusters into a new node (proposed presence/), verbatim/coverage-preserving; identity/ retains register/whoami/who/bare-status/prune/self-id-recovery/harness-detection/touch"
    status: pending
  - content: "author presence/README.md (spec-type: behavioral, concept: [cyberlegion]) carrying the moved Use Cases; rewrite identity/README.md to drop the moved sections and non-goal the new node"
    status: pending
  - content: "update cross-node non-goals referencing identity/'s owner-inbox/main-pane behaviors (surfacing/README.md, mail/README.md's standing-precedence pointer, root spec.md capabilities table) to point at the new node"
    status: pending
  - content: "spec gate: freeze-preserving split — every moved scenario is verbatim, so this narrows nothing and self-clears the frozen-contract guard; still run the gate to re-freeze both .feature files under their new paths"
    status: pending
  - content: "root pnpm verify; commit by unit of work; handoff"
    status: pending
---

# CR cyberlegion-identity-presence-split — split the oversized identity/ node

Target spec: `packages/cyberlegion/.agents/spec` (nodes `identity/` NARROWED, new node — name TBD,
proposed `presence/`).

## Origin

Filed by the sdd-warden formation pass following `cyberlegion-init-legate` (post-mission, corpus-wide
structure audit). `check-spec-structure --spec-dir packages/cyberlegion/.agents/spec` flags
`identity/` **oversized: 43 scenarios > 40**. Two feature clusters were bolted onto `identity/` across
two separate missions:

- **standing identity** (`cyberlegion-owner-mailbox`, 9 scenarios) — `identity owner --handle <name>`,
  the handle-keyed, pane-less, prune-exempt owner-inbox record.
- **main pane** (`cyberlegion-init-legate`, 8 scenarios) — `identity bind-main`/`--clear`/`main`, the
  hub-level singleton pointer to the standing owner's live presence.

Together these 17 scenarios are ~40% of the node and share a coherent theme distinct from the
node's original subject (register/recover/discover a *session's own* identity): they both concern the
**human owner's** durable presence over the hub, not a session's self-identity. `identity/README.md`
itself already names this theme verbatim — "The main pane is the standing owner's live presence."

## Why this escalates rather than self-clears

The Warden confirmed the underlying producer/consumer boundary is **sound** — `identity/` owns the
main-pane verbs + pointer, `surfacing/` only *consumes* it in the owner-mail gate, and both nodes'
non-goals sections already cross-reference each other correctly. No reconcile finding there.

But the **split itself** is escalated, not self-cleared in-session, because:
- it is the **first split** ever performed on this project spec — no derivable precedent for the
  resulting node boundary or name (novelty is not low);
- it touches **multiple already-frozen `.feature` files** and requires coordinated cross-reference
  updates in at least `surfacing/README.md`, `mail/README.md`, and the root `spec.md` capabilities
  table (blast is not low);
- naming the new node (`presence/`? nested `identity/owner/`? something else?) is a real design
  decision the Warden should not make unilaterally.

Every moved scenario would move **verbatim** — this is coverage-preserving and narrows nothing, so
per the frozen-contract guard it would self-clear even on a frozen `.feature` were the boundary
already settled. It is the boundary/name decision, not the freeze, that pushes this to a CR.

## Proposed shape (for the Council/Architect to ratify or amend)

- **`identity/`** keeps: register, whoami, who, bare-status (AXI #8), prune, self-identity recovery,
  harness detection, last-seen touch. Concern stays "self-identify and discover peers."
- **new node** (proposed `presence/`) takes: standing identity (`identity owner`) + main pane
  (`identity bind-main`/`--clear`/`main`). Concern: "the standing owner's durable, hub-level
  presence." CLI verb surface is unaffected either way (verbs stay under `identity` regardless of
  which spec node documents them, matching how `who`/`spawn`/`send` already alias across nodes).

## SUPERSEDED

**Do not resume this brief.** Working the split surfaced that it chased a symptom: `identity/` is
oversized because the spec is organized on an invented axis (`surfacing`/`wake`) that matches no CLI
command. The real fix is a corpus realignment to the architecture — see
[`cyberlegion-cli-realign.plan.md`](./cyberlegion-cli-realign.plan.md) and its
[`.design.md`](./cyberlegion-cli-realign.design.md). Under the realignment there is no `presence/`
node: `identity/` becomes `unit/`, `owner` folds into `register --standing`, and the main-pane verbs
become `attach` — so the oversize resolves without the carve this brief proposed. Retire this brief
when the realignment lands.

## NEXT

Superseded by `cyberlegion-cli-realign`. No action here.
