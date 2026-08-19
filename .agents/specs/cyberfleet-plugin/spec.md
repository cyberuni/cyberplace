---
status: implemented
project-path: plugins/cyberfleet
approval:
  spec:
    verdict: approve
    by: unional
    cause: clearance
    why:
      floor: clearance — pre-authorized in-session by unional, scoped to meaning-preserving vocabulary renames only. align-spec classifies the CR as `narrowing (clearance)` because its scenario-diff is title-keyed and cannot distinguish a rename from a deletion; all reworded scenario titles read to it as removals (13 at the time of this gate, 11 in the final diff after the voice-bar retraction). The re-open of the @frozen suite was separately ratified by unional before the file was touched (ledger `kind: reopen`).
      blast: medium — one behavioral node (.agents/specs/cyberfleet-plugin/operator/) rewritten in place plus three collateral rename sites (this spec.md placement rule, the project README node index). No mechanism, no CLI, no sibling package, no other persona node touched. The implementation (plugins/cyberfleet/skills/operator/, agents/headless-operator.md, the plugin + marketplace manifests, the website cyberfleet docs) still carries the retired vocabulary by design and lands in this CR's deliver phase, so the spec is deliberately ahead of the impl at this gate.
      novelty: low — no mechanism added or changed. `cyberlegion unit register` under this session's own handle, `unit claim operator` unconditionally, `mail inbox --owner operator --unread`, and `mail read --owner operator --ack` are all untouched; every cyberlegion command string in the suite is byte-identical to HEAD. The change is the vocabulary the node uses to describe them. A voice-bar tightening authored mid-mission was retracted before merge (see note).
      confidence: high — three cold ACED spec-judge rounds, converging: R1 ALIGNED false (architect + builder, 3 blocking), R2 ALIGNED false (architect, 1 blocking — a list-structure regression the conductor's own scripted rewrap introduced), R3 ALIGNED true on all three lenses with no blocking finding. Meaning-preservation — the CR's central risk — was verified mechanically by the judge, not taken from the producer: 41 scenarios in / 41 out with 0 added, removed, merged, or split; every `cyberlegion` command string extracted two independent ways and diffed clean against HEAD; 7 of the 11 reworded scenarios carry byte-identical Then blocks and the other 4 changed only a noun inside an otherwise identical assertion (figures restated after the voice-bar retraction; they read 9 of 13 while that tightening was in); step count unchanged at 130 after the voice-bar tightening was retracted. Coverage maps 1:1 both directions (13 Subject bullets → 16 table rows → 41 scenarios, no orphans). Five of six `check:spec` checks green; align-spec fails only on the title-keyed Clearance signal above, which clears once committed since it diffs against HEAD.
      note: the anti-probe invariant (ADR-0022 amendment item 3) was the CR's chief risk — the retired noun "seat" carried it implicitly. It is now stated as an explicit rule in the Feature narrative ("The connection is asserted by invocation, never by a probe") plus two @behavior scenarios, the node README, and this spec's placement map. The judge graded it preserved and strengthened. A voice-bar tightening was authored in this CR and then RETRACTED before merge on unional's call. It was the only behavior change in a vocabulary CR, it needed an explicit carve-out from the Clearance in every record, and it took two attempts to get right (the first banned a conforming terse acknowledgment; the fix for that introduced an over-broad carve-out). The bar was also inferred from a one-line instruction rather than specified. It is deferred to its own CR where it can be specified and calibrated in both directions. What remains of it here is vocabulary only: the @quality scenario title no longer names the retired place-noun. Its three original Then clauses are byte-identical to pre-CR.
      leash: auto-none — user-set at run start. Not self-asserted; ratified in-session by unional holding the user channel.
      cr: operator-command-center-vocab
  impl:
    verdict: approve
    by: unional
    cause: dimension
    why:
      floor: none — the Clearance floor was engaged and discharged at the spec gate; the implementation narrows nothing.
      blast: low — three shipped agent-configuration files (plugins/cyberfleet/skills/operator/SKILL.md + README.md, plugins/cyberfleet/agents/headless-operator.md) and two published website pages. No code, no CLI, no other persona node. The plugin and marketplace manifests needed no change — they already described Operator as the command center, which is the term this CR keeps.
      novelty: low — no mechanism added or changed. The implementation renames the vocabulary it uses to describe mechanisms that already ship. The voice-bar tightening authored mid-mission was retracted before merge and deferred to its own CR.
      confidence: high — cold SDD impl-judge IMPLEMENTATION_PASS true, blocker null, over all 41 frozen scenarios with @trigger accuracy 9/9. Judged inline in a single context with no fan-out, so every cell rests on what that judge personally observed. It re-verified rather than carried prior reports: `pnpm verify` re-run first-hand at 29/29; every backtick command span extracted at HEAD vs working tree, normalized and diffed as multisets rather than line-scoped to defeat re-wrap artifacts, confirming zero mechanism drift; retired-term grep re-run across plugins/cyberfleet and the cyberfleet website docs at zero hits; an absorption read over all 41 Givens finding no trigger-example apparatus leaked into the implementation. Both known recurrence sites came back clean — the fail-soft no-multiplexer guard and the fail-loud missing-owner guard are visibly distinct and labeled in both files (clearer than the retired wording), and headless-operator.md's "no seat to serve" to "no human channel to serve" preserves the referent because "human channel" was already established earlier in that same document.
      note: the first impl-gate attempt failed on transport rather than judgment. The ACED impl-judge fanned out 15 blind two-pass case-judge runs; every run completed its protocol correctly but none could address its parent, so all 15 verdicts surfaced to the conductor and the judge correctly returned undetermined rather than emit unobserved cells. Those 15 runs were unanimous (8 of 9 trigger rows, 3 of 3 rubric runs at 9/9 / 8/9 / 9/9, 3 of 3 voice runs) but were deliberately NOT relayed back into the judge or folded into this gate — a verdict couriered by a third party is not a self-observed verdict. They are retained in the ledger as corroborating evidence only. This verdict rests solely on the inline judge's own reading. The harness defect is filed as a follow-up.
      leash: auto-none — user-set at run start. Not self-asserted; ratified in-session by unional holding the user channel.
      cr: operator-command-center-vocab
---

# cyberfleet-plugin — the fleet & crew personas (agent behavior)

> Root project spec — the **descriptive** top index for the `cyberfleet` **plugin** (the marketplace
> distribution at `plugins/cyberfleet`). Behaviors live in the capability folders below. This
> project was split out of the combined `cyberfleet` project by the `split-cyberfleet-spec` change,
> so the spec maps one-to-one onto the plugin. The deterministic engine — the `cyberfleet` CLI —
> lives in the sibling `cyberfleet` project (`../../../packages/cyberfleet/.agents/spec`, source
> `packages/cyberfleet`).

## What this is

The `cyberfleet` plugin ships the **persona layer** of the fleet: the agent-behavior that decides
*when* and *how* an agent reaches for the fleet, recruits or discharges a crew, and builds or
re-tunes an automaton. Every node here is a per-situation persona gateway skill (ACED carries all four
eval layers — activation and judgment). Each persona offloads its mechanics to a CLI — `cyberlegion`
for identity, mail, and spawn; `cyberfleet` for missions — and keeps its voice only in what it says
around them. Where a mechanic belongs to neither (the merge backstop's `gh`/git/CI), it is offloaded
to that tool, never re-implemented.

The persona nodes depend on their CLIs by **intent** — register / send / spawn / inbox (the
`cyberlegion` CLI) and the missions view (the `cyberfleet` CLI) for the fleet personas, and the
Tavern query / define-agent / manage-model-runners for the crew personas — never by an exact command
slug (ADR-0021). The dependency is one-way: neither CLI knows anything of these personas.

## Why this is its own project

The `cyberfleet` plugin and the `cyberfleet` CLI are **two packages that deploy differently** — the
plugin ships to the marketplace, the CLI ships to npm — and the plugin carries genuine agentic
behavior (spawn judgment, message etiquette, persona voice, crew recruitment/tuning) the CLI cannot.
Three axes agree on the same cut: artifact-type (agent-behavior vs deterministic script), deploy
target (marketplace vs npm), and package (`plugins/cyberfleet` vs `packages/cyberfleet`). This
project holds the four agent-behavior nodes; the four deterministic CLI nodes are the sibling
`cyberfleet` project. The plugin spec stays **central** (`.agents/specs/`) rather than co-located
under `plugins/cyberfleet` so it is not carried inside the distributed marketplace artifact.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`pod/`](./pod/README.md) | behavioral | the **Pod** persona — the ship's bridge: greet, clear inbox, run the mission, hail crew, HAL tell; no precondition, no probe; never spawns |
| [`operator/`](./operator/README.md) | behavioral | the **Operator** persona — the command-center dispatcher: any spawn, list the fleet, route messages, prune dead ships |
| [`recruitment/`](./recruitment/README.md) | behavioral | the **Crimp** persona — recruit/discharge crew types from the Tavern (browse, install, register; uninstall, retire) |
| [`mechanic/`](./mechanic/README.md) | behavioral | the **Mechanic** persona — build a new automaton or adjust an existing one's program (governance/model/effort/leash), re-chip its loadout, hot-swap the unit |

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new bridge behavior** (mission entry, inbox etiquette, hailing crew, the HAL tell — anything
  Pod does while working a ship) → `pod/` (the Pod persona).
- **a new fleet-level dispatch behavior** (**any** spawn, list the fleet, route between ships, prune
  — anything the Council calls Operator for) → `operator/` (the Operator persona).
- **a "which persona am I" concern** → **nowhere — there is no such concern.** Neither persona probes
  its folder. Operator connects to the command center by invocation; Pod is reached by the Council's
  ask. The ship marker and `cyberfleet mode` were deleted (#225) because the marker gated no
  capability and its only reader was the command that reported it. Do not reintroduce a location
  check in either node.
- **a new crew-acquisition persona behavior** (recruit/discharge a crew type — browse the Tavern,
  install/register, uninstall/retire) → `recruitment/` (the Crimp persona).
- **a new automaton-workshop persona behavior** (build a new automaton, or adjust an existing one's
  program — governance/model/effort/leash — re-chip its loadout, hot-swap the unit) → `mechanic/`
  (the Mechanic persona).
- **a new identity / message-queue / peer-launch / hook-injection CLI operation** → **not here** —
  that is the `cyberlegion` CLI project (`packages/cyberlegion`). A new mission-view / gate CLI
  operation is the `cyberfleet` CLI project (`packages/cyberfleet`).
- **a cross-capability persona e2e** (spans ≥2 persona nodes) → this project's own e2e; a future
  `acceptance/` node may formalize it.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested. Two cross-cutting concerns run through
this project (see the by-concept index below): `fleet` (the session-coordination personas — pod and
operator) and `crew-ops` (the crew-operations personas that recruit and tune **crew** — recruitment (Crimp)
and build+tune (Mechanic)). Note the distinction: a **crew** is a recruited specialist automaton (what
Crimp signs on from the Tavern); `crew-ops` is the concern of *operating on* crew, not the crew
itself.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `crew-ops` | `mechanic/` (behavior) · `recruitment/` (behavior) |
| `fleet` | `operator/` (behavior) · `pod/` (behavior) |

<!-- END generated: by-concept -->
