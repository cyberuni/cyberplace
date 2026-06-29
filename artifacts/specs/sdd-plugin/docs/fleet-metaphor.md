# SDD as an Autonomous Strike Fleet

A single, consistent reading of the SDD agent architecture. The **neutral actors** come from the motive-model (tool-agnostic); the **fleet flavor** is SDD's presentation layer. Every fleet term maps to real machinery — the mapping columns make that explicit, so this stays a reference, not just decoration.

## Two layers

Implementation is **keyed by the actor name** (neutral, from the motive-model): `oracle`, `builder`, `architect`, `strategist` — registry `governances{}` keys, governance skills, the `OBSERVATIONS owner:` enum, spec prose. The **fleet unit names** are a presentation layer only — narrative, never keys.

| Actor (motive-model, neutral) | Fleet unit | SDD machinery |
|---|---|---|
| **Oracle** | **Commander** | the `oracle` role — scope, go/scrub; `oracle-governance` |
| **Builder** | **Battler** | the spec/impl **producer**; `builder-governance` |
| **Architect** | **Warden** | the `architect` role — structure/conventions; `architect-governance` |
| **Strategist** | **Scanner** *(in the Bunker)* | the outer-loop agent (`sdd-doctrine-loop`) — not yet built |
| *(coordinator)* Conductor | **Operator** | `sdd-operator` — the conn |
| *(the bar)* | **Executioner** | the **judge** — `spec-judge` / `impl-judge` |

## The Council

You and your teammates. You don't crew the ship — the automatons do. You hold the three accountable, high-blast-radius calls: the **gate verdict**, the **scrub** (kill), and **strategy keep-or-cut**. SDD is one ship in a larger fleet — you wield other tools too.

## The three loops

Nested by cadence and object — keeping them separate is the point (motive-model, "Strategist and the loop").

| Loop | Scope | What happens | SDD reality |
|---|---|---|---|
| **Engagement** *(inner)* | one task/segment | Battler acts → Executioner judges → Warden reshapes under green; autonomous, every iteration | the producer⇄judge cycle within a segment |
| **Mission** *(middle)* | one spec, draft → approved → implemented | the Operator runs it across watches; the Council is hailed only at gates and scrub | the per-spec lifecycle (`sdd-mission-loop`) |
| **Doctrine** *(outer)* | across missions / the fleet | the Scanner re-tunes doctrine; the Council keeps-or-cuts | the outer loop (`sdd-doctrine-loop`) |

## The two moves toward an automaton

- **Project** — imprint a **program** (a governance) and withdraw. Asynchronous, persistent: you tune *how the automaton behaves*, then leave; the tuning holds on every future run. (This is authoring/editing a governance.)
- **Inject** — jack in **live** to pilot or converse *through* an automaton. Real-time, transient: from the gateway you select one inner-loop unit (Battler, Warden, Executioner) and enter a direct channel. The zoom-in capability (`sdd-inject-channel`).

## Strategy → doctrine → corpus

Three distinct things, by time-direction — not synonyms:

- **Strategy** — the Scanner's *forward* output: a recommendation ("codify this pattern, prune that convention"). Situational, drafted each cycle, transient until ratified.
- **Doctrine** — the *principles* layer: codified operating rules ("how we operate"). Ratified strategy re-tunes it.
- **Corpus** — the *full durable body* every other delegate reads from: skills, governances, conventions, templates, plugins. Doctrine is its principles slice.

> The Scanner drafts **strategy** → the Council ratifies → it re-tunes the **doctrine** and grows the **corpus**.

## Mechanics → real machinery

| In-world | Real |
|---|---|
| **Program** | a governance (an automaton's operating directives) |
| **Sealed orders** | the frozen `.feature` — cut and sealed at authorization |
| **Combat log** | provenance — `produced-by` + `approved-by` (`sdd-provenance`) |
| **Drift / staleness** | what the Scanner prunes (the double-loop *revision* mode) |
| **The Bunker** | fleet-level command — where the Scanner sits, above any one ship |

## Lifecycle as a mission arc

| SDD status | Mission |
|---|---|
| `draft` | planning / briefing |
| `approved` + `.feature` frozen | **orders cut and sealed** |
| `implemented` | **objective taken** — debrief verified |
| `deprecated` | **scrubbed / decommissioned** |
| spec gate / impl gate | go/no-go briefing / debrief |
| governances | standing orders / rules of engagement |
