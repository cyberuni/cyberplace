---
status: active
todos:
  - content: "Intake: locate handoff + combat-log nodes, classify edit-class, settle CR scope"
    status: completed
  - content: "Explore: draft handoff README + .feature delta (record/classify/propose/drain) + combat-log followup shape"
    status: pending
  - content: "Spec gate: cold sdd-spec-judge, freeze, ledger gate line"
    status: pending
  - content: "Deliver: start-mission Step 4 + combat-log-governance SKILL.md"
    status: pending
  - content: "Impl gate: cold sdd-impl-judge against the frozen .feature"
    status: pending
  - content: "Handoff: pnpm verify, commit, PR Closes #237, dogfood the doctrine on own follow-ups"
    status: pending
---

# CR: handoff records follow-ups durably, classifies, proposes, drains

**Source** — [#237](https://github.com/cyberuni/cyberplace/issues/237) (closes by reference).
Supersedes #230 (closed unmerged; its spec prose ports in).

**Project spec** — `.agents/specs/sdd/` (project-path `plugins/sdd`).

## The change

At **handoff**, follow-ups stop being treated alike. Four stages, only the first unconditional:

1. **Record** — every identified follow-up written as a durable `kind: followup` line in the CR's
   **ledger shard**. No permission, no forge, no human. Cannot be denied ⇒ the thread cannot be lost.
2. **Classify** — a proposal, not a verdict. `blocking` (contradicts a completion claim already made)
   vs `backlog` (new territory). A **suite-lied** finding is not a follow-up at all — it is an
   Oracle-lens revert that stays in *this* mission.
3. **Propose** — handoff emits a classified proposal + evidence and **never writes the graph itself**.
4. **Drain** — permission-gated filing to the forge. A drain on the durable record, not the primary act.

## Scope (settled at intake)

**sdd only.** The four stages straddle `sdd` and `cyberfleet-plugin/operator`; SDD's rule is one CR =
one project spec (`intake/README.md:31`). This CR specs the **Pod side** — everything handoff itself
executes. The **Operator's admission** (vet/dedupe/append via `proposeEdge`) is a filed follow-up
against `cyberfleet-plugin` — which this mission dogfoods by recording it as `blocking`.

- `.agents/specs/sdd/mission/handoff/` — `README.md` + `handoff.feature`
- `.agents/specs/sdd/common-governances/combat-log/` — `README.md` (the `followup` entry shape)
- `plugins/sdd/skills/start-mission/SKILL.md` — the conductor's Step 4
- `plugins/sdd/skills/combat-log-governance/SKILL.md` — the `followup` kind + write ownership

## Findings from intake

- **`sdd/forge/` is a terminology collision, not the target.** That node is the opt-in
  cross-installation field loop that improves SDD itself. The issue's "forge" means the issue tracker.
  Touch neither.
- **The seams all exist.** Ledger shards are per-CR-per-writer (ADR-0020); `proposeEdge` already vets
  RAW cycles; the graph already carries a **`discovered-from`** edge kind ("B was created while working
  on A" — recorded, not acted on in v1); the Operator README already claims **single writer** and
  "append the retirement + **discovered edges**"; missions "only **report**". Nothing to invent.
- **`followup` is a 7th ledger kind.** Today: `report`/`correction`/`halt` → combat log;
  `leash`/`gate`/`strategy` → ledger. `followup` joins the **ledger** tier (durable, never deleted) —
  the combat log is deleted at retro, which would lose the thread. Ledger lines carry **no `ts`**.
- **The existing follow-up scenario is passive.** `a reported follow-up becomes a new CR` names no
  actor and no gate. This delta is **additive on a silence**, not a narrowing ⇒ freeze self-clears.
- **#196 is still OPEN** — the closing edge has not landed, so speccing first is still possible.
  This is the whole sequencing risk; it holds.

## Requirements carried in (spec them; not follow-ups)

- **A. Denial path mandatory** — what killed #230. Record stands, drain retries later, failure is
  **loud**. No fallback indistinguishable from success (#228).
- **B. Stricter safe-to-publish floor for the issue body** — the existing floor passes a repo-relative
  ledger-shard filename cleanly, and that is exactly what leaked. New bar, not a `check-plan-safety` reuse.
- **C. Agent-filed marker** — else intake cannot separate agent- from human-filed and the branching
  factor cannot be measured. Cheap now, impossible retroactively.
- **D. Mixed dedupe** — file the unmatched, skip the matched, never all-or-nothing.

## Guardrails

- **Do not use `nudge` to launder the filing permission** — that forges the owner's voice (#227).
- If the drain cannot run headless here, that is **expected**: record stands, emit the gate verdict,
  leave the human ratification owed.

## NEXT

Explore: draft the handoff README + `.feature` delta and the combat-log `followup` entry shape.
