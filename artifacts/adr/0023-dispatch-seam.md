# ADR-0023: The `subagent | channel` dispatch seam

## Status

Proposed

## Context

SDD's conductor routinely needs to **dispatch a role fulfillment** — spawn a cold judge for grader
independence, hand an impl-producer to a builder, fan a mission out headless — and get back a
verdict (`harness-spawning.md`, `plugin-contract-governance/SKILL.md`). Today that dispatch is
hardwired to the harness's own nested-subagent primitive (Claude Code's `Task` tool, etc.), which
means SDD's spawn model is bounded by whatever nesting depth the calling harness allows: depth 1
(main → judge/builder) is the portable default; depth 2 (`caller → automaton → judge`) only works on
a harness that lets a subagent spawn another; and the one documented escape from the nesting limit —
"spawn a fresh top-level session from outside" (`harness-spawning.md`) — is named only informally, as
a tmux aside, with no CLI or contract behind it.

The cyberlegion extraction (`.agents/plans/cyberlegion.design.md`) gives that escape hatch a real
mechanism: a harness-agnostic dispatch capability with a routing brain (**the Legate**, realized
in-session as `dispatch-governance` and headless as the `legate` automaton) that resolves an intent —
"fulfill role `R` with brief `B`, expect a verdict matching `V`" — to exactly one of three
strategies: **subagent** (the caller's own Task-equivalent tool), **channel** (a live peer session in
a multiplexer pane), or **run-inline** (no delegation; the caller does the work itself). SDD is a
natural first dependent: its depth-1 default and its depth-2/mux-escape story map directly onto that
seam, and formalizing the mapping gives SDD a named path past its own nesting ceiling without folding
fleet, mail, or persona concerns into SDD's spec.

## Decision Drivers

- SDD should depend on the dispatch capability **by intent** (ADR-0021), never by pinning a
  mechanism or a cyberlegion internal slug — the "depend on intent, never internals" rule applies to
  this boundary exactly as it does to any other cross-project reference.
- The **strategy choice** (subagent vs. channel vs. run-inline) is judgment that belongs entirely to
  the Legate/`dispatch-governance` — SDD names an intent and a verdict shape, never a mechanism.
- SDD must **never reference `cyberfleet`** — cyberfleet is the warm fleet-persona layer built *on
  top of* cyberlegion; SDD depending on it would invert the extraction's whole point (see the
  cyberlegion design's "Dependency direction (CI-enforced)" section).
- This must be **additive**: SDD's current spawning (harness-native Task subagents, depth 1 default,
  the headless automaton) keeps working unchanged. Nothing here rewires how SDD spawns today.
- One load-bearing pinned invocation site, not a hardcoded slug scattered across SDD's design docs.

## Considered Options

### Option 1: Leave SDD's spawn model exactly as documented, no cyberlegion reference

- **Pros**: zero new coupling; simplest.
- **Cons**: the tmux "spawn a fresh top-level session" escape hatch stays an informal aside with no
  real mechanism behind it; SDD gets no path to the channel strategy when it later wants one (e.g. a
  future warm, interactive role); the seam cyberlegion already built goes undiscovered by its most
  obvious dependent.

### Option 2: SDD calls cyberlegion's CLI directly wherever it spawns today

- **Pros**: immediate, concrete wiring.
- **Cons**: bypasses the Legate's routing judgment (SDD would be picking `subagent` vs. `channel`
  itself — exactly the mechanism-pinning ADR-0021 forbids); rewrites SDD's current spawn model ahead
  of any real need; couples SDD to cyberlegion's command surface at many call sites instead of one.

### Option 3: Name the seam by intent, map SDD's existing depth story onto it, one pinned site *(chosen)*

- **Pros**: honors ADR-0021 (intent, not slug; one load-bearing mention); additive — no change to
  SDD's actual runtime behavior; gives the tmux escape hatch a real name and a real mechanism to grow
  into later; keeps the Legate's routing judgment where it belongs (cyberlegion's
  `dispatch-governance`), not duplicated in SDD.
- **Cons**: a documentation-only ADR without an accompanying impl change can read as aspirational
  until a later CR actually threads dispatch calls through; requires readers to hold two vocabularies
  (SDD's depth-1/depth-2 story and cyberlegion's subagent/channel/run-inline strategies) side by side.

## Decision

Adopt **Option 3**.

Define the **`subagent | channel` dispatch seam** as an intent contract a dependent references by
capability, never by mechanism: *"fulfill role `R` with brief `B`, expect a verdict matching `V`."*
The Legate (`plugins/cyberlegion/skills/dispatch-governance`, in-session; the `legate` automaton,
headless) owns the strategy decision — subagent, channel, or run-inline — derived from the target
role's agent-definition `warm`/`interactive` tags crossed with multiplexer availability. A dependent
that hardcodes "always subagent" or "always channel" has broken the seam.

Map SDD's existing depth story onto the seam's three strategies, without changing what SDD does
today:

- **The portable depth-1 default** (main session → cold judge/builder, `harness-spawning.md`) *is*
  an instance of the **subagent** strategy — cold, one-shot, no live conversation expected. This is
  what SDD already does; the seam just gives it a name shared with cyberlegion's other dependents.
- **The multiplexer peer-session escape hatch** ("spawn a fresh top-level session," currently an
  informal tmux aside) *is* an instance of the **channel** strategy — a live peer in a pane, not a
  nested subagent, and therefore not bounded by the calling harness's nesting depth. This is the named
  mechanism the escape hatch lacked.
- **No-mux interactive dispatch** — a role that is warm/interactive but has no pane to open — *is* the
  **run-inline** strategy: the caller (SDD's own conductor, in-session) does the work itself rather
  than delegating. This is SDD's current in-session conductor behavior, now named as one leg of the
  same seam rather than an implicit default.

SDD depends on this seam **by intent** (ADR-0021 rule 1): it references "cyberlegion's dispatch
capability, the `subagent | channel` seam" and the strategies above, never cyberlegion's internal CLI
subcommand names or `dispatch-governance`'s implementation. Exactly **one** SDD reference is
load-bearing enough to name the concrete invocation (`npx cyberlegion@<version> dispatch ...`,
`<version>` a placeholder — pinning it is CR-8's job, not this ADR's); every other SDD reference
speaks only in intent/capability terms (ADR-0021 rule 2 — name a slug only at the one load-bearing
site).

This ADR does **not** wire any dispatch call through SDD's runtime. It establishes the dependency and
the vocabulary; a future CR may thread actual `dispatch` calls through the conductor's spawn points.
Until then, SDD's spawning behavior is exactly what `harness-spawning.md` and `sdd-automaton.md`
already describe.

## Rationale

Naming the seam and mapping it onto SDD's existing depth-1/depth-2/escape-hatch story costs nothing
today — SDD's runtime is unchanged — while giving the informally-documented tmux escape hatch a real
mechanism to grow into, and giving future dependents (a warm, interactive SDD role, a multi-CR
fan-out that wants a live peer instead of a cold automaton) a named path that already exists rather
than one they would have to invent. Keeping the strategy decision inside `dispatch-governance` (never
duplicated in SDD) is the direct application of ADR-0021's "depend on intent, never internals" rule
to a runtime capability rather than a spec capability — the same discipline, one boundary later.

## Consequences

### Positive

- SDD's tmux "spawn a fresh session" escape hatch gains a name (`channel`) and a real mechanism
  (cyberlegion's dispatch primitives) instead of staying an informal aside.
- SDD depends up on cyberlegion by intent with exactly one load-bearing pinned invocation site; no
  cyberlegion internals leak into SDD's design docs or plugin contract.
- SDD's current spawning behavior is unchanged — this is purely additive; nothing in
  `harness-spawning.md` or `sdd-automaton.md`'s described defaults needs to be re-verified against a
  new runtime path.
- SDD never references `cyberfleet` — the ADR-0021 cross-reference resolver enforces this as a loud
  CI failure rather than a silent drift.

### Negative

- Two vocabularies now describe the same three-way strategy split (SDD's depth-1/depth-2/escape-hatch
  framing vs. cyberlegion's subagent/channel/run-inline framing) until a later CR either retires the
  SDD-side framing in favor of the seam or keeps both intentionally (SDD-facing story vs.
  cyberlegion-facing mechanism).
- A documentation-only ADR with no accompanying runtime wiring risks reading as unimplemented intent
  if a later CR never threads real dispatch calls through the conductor.

### Risks

- **Slug leakage at the one pinned site.** The single load-bearing `npx cyberlegion@<version>
  dispatch ...` mention is the one place a real coupling exists; if a future edit copies that
  invocation into a second SDD file "for convenience," ADR-0021's leakage failure mode reappears.
  Mitigation: the cross-reference resolver (`resolve-governances`, `check-plan-safety`) and this
  ADR's own text keep the count at exactly one.
- **Boundary drift if cyberlegion's strategy names change.** If cyberlegion later renames `subagent`/
  `channel`/`run-inline`, every intent-only reference in SDD survives untouched (they don't name the
  strategies as slugs, only as concepts) but this ADR and the load-bearing site would need a
  freeze-preserving reconciliation (ADR-0021 rule 4).

## Implementation Notes

This ADR is documentation/governance-level only — no `packages/` code changes, no change to SDD's
described runtime spawning behavior. Follow-up (not part of this ADR):

- `.agents/specs/sdd/design/harness-spawning.md` gains a section mapping depth-1 → `subagent` and the
  mux escape hatch → `channel`, referencing this ADR (done as part of the CR that added this ADR).
- `plugins/sdd/agents/sdd-automaton.md` and `plugins/sdd/skills/plugin-contract-governance/SKILL.md`
  gain a minimal note that cold-judge/builder dispatch may be realized through this seam, pointing
  here (done as part of the CR that added this ADR).
- A later CR may thread actual `dispatch` calls through the conductor's spawn points, once
  cyberlegion is published (CR-8) and the pin lands.

## Related Decisions

- [ADR-0021](0021-spec-dependency-kinds.md) — the "depend on intent, never slug/internals; one
  load-bearing site" discipline this ADR applies to a runtime dispatch capability rather than a spec
  reference.
- [ADR-0022](0022-cyberfleet-persona.md) — the fleet-persona layer this ADR's dependency explicitly
  does **not** couple SDD to; cyberfleet depends on cyberlegion, SDD depends on cyberlegion, SDD never
  depends on cyberfleet.

**Note on numbering:** an earlier plan-era draft informally referred to a future "ADR-0023" for a
cyberfleet dispatch seam before the cyberlegion extraction split the mechanism out from the persona
layer. This document is the real ADR-0023; it supersedes no prior numbered ADR (no ADR-0023 was ever
published) and formalizes the seam at the layer it actually lives — cyberlegion, not cyberfleet.
