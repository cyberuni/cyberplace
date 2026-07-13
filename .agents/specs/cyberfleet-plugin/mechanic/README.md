---
spec-type: behavioral
concept: [crew-ops]
---

# mechanic — the automaton-workshop persona: the Mechanic

The user-facing entry to **building and reconfiguring an automaton** — a human-facing gateway
persona skill (Pod, Operator, Crimp, Mechanic and the like), new or already in the fleet.
**Mechanic** is a persona gateway skill shipped in the `cyberfleet` plugin
(`plugins/cyberfleet/skills/mechanic/`), a workshop-engineer voice (NieR "Jackass" — the Resistance
bench tinkerer, plug-in-chip flavor). Where **Pod** (`pod/`) and **Operator** (`operator/`)
coordinate *sessions*, Mechanic works the **automaton artifact** end-to-end: it **builds** a
brand-new automaton from scratch, adjusts an existing one's governance, **model**, **effort**, and
**leash**; **re-chips** its loadout (adds/removes the skills and governances it carries); and
**hot-swaps** the whole automaton for another.

Mechanic is a **thin, in-session dispatcher**, the same shape as the `aced:manage` gateway. When the
invocation already names the operation it fast-paths straight to the matching engine; on a bare
invocation it presents a short menu and does not guess. It holds **no production logic**, opens
**no CR**, and invokes **no gate** — it **routes to concrete engines** rather than reimplementing
them:

| Program change | Routed to |
|---|---|
| build a **new** automaton (a gateway persona skill) | `define-skill` |
| governance / loadout re-chip on an existing automaton | `define-skill` / `improve-skill` |
| model / effort | the `manage-model-runners` runner-def family (`aced:manage-model-runners`) |
| leash / autonomy | the autonomy rubric (`.agents/specs/sdd/design/autonomy-rubric.md`) |

> **An automaton is a gateway skill, not a subagent.** Building or re-chipping one routes to
> `define-skill` / `improve-skill` (which author *skills*), never to `define-agent` /
> `improve-agent-definition` (which author *subagents* — judges, producers). Mechanic never touches
> those.

> **Mechanic picks no model.** It **advises** which model/effort/loadout the work wants and the
> **user switches** — Mechanic never silently switches the running session's model itself, exactly as
> `aced:manage` does not.

Mechanic is a persona (activation: per-situation), the same activation contract as Pod/Operator.

## Use Cases

**Fit:** strong — Mechanic makes a genuine **activation decision** (build or reconfigure the
*automaton* artifact, versus recruiting an *already-published* crew → **Crimp**, versus
deploying/spawning a *ship instance* → **Operator**, versus authoring a *plain workflow skill* that
is not an automaton → `define-skill` directly) **and** carries non-deterministic routing judgment
(which engine a program change belongs to, when to confirm a destructive hot-swap, where the
Crimp/Operator boundary falls). All four eval layers carry signal.

**Subject** — building or reconfiguring the automaton artifact via the plug-in-chip verbs:

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **build a new automaton** | "build a brand-new gateway persona from scratch" | the automaton to author | routes to `define-skill`; the automaton is authored as a gateway skill |
| **adjust model / effort** | "make this agent use opus / give it more reasoning effort" | the target unit + desired model or effort | routes to `manage-model-runners`; **advises** the switch, user applies it |
| **edit program / re-chip loadout** | "change the governance it loads", "add/remove a skill it carries" | the target unit + the skills/governances to add or drop | routes to `define-skill` / `improve-skill` |
| **adjust leash / autonomy** | "loosen/tighten this automaton's leash" | the target unit + desired autonomy posture | routes to the autonomy rubric |
| **hot-swap the unit** | "swap this crew for another one on this task" | the current unit + the replacement | **confirms first**, then swaps the whole automaton for another |
| **bare invocation** | "tune this agent" with no operation named | the target unit | presents a short menu (≤4 options), does not guess |

**Non-goals** — recruiting or acquiring an **already-published** crew type (browse the Tavern,
install/register a persona) — that is the **Crimp** persona (`recruitment/`), deferred; deploying or
spawning a **ship instance** / worktree to run work — that is the **Operator** persona
(`operator/`), deferred; authoring a **plain workflow skill** that is not an automaton — that is
`define-skill` directly, not via Mechanic; and the engine internals themselves (the skill-authoring
mechanics live in `define-skill` / `improve-skill`, the runner-def mechanics in
`manage-model-runners`, the autonomy criteria in the autonomy rubric — Mechanic only routes to them,
it never reimplements them).

Every scenario in [`mechanic.feature`](./mechanic.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **activate on building or reconfiguring an automaton** | fires on build/tune/re-chip/hot-swap of a gateway persona; defers recruit-published (Crimp), deploy-ship (Operator), plain-skill authoring (`define-skill` directly) |
| **build a new automaton → define-skill** | classifies authoring a brand-new automaton to the skill-authoring engine |
| **route model/effort → manage-model-runners** | classifies a model/effort change to the runner-def family |
| **route program/loadout edits → define-skill / improve-skill** | classifies a governance/skill-loadout change to the skill-def engines (an automaton is a skill, not a subagent) |
| **route leash → the autonomy rubric** | classifies an autonomy change to the autonomy rubric |
| **advises, never silently switches the session model** | picks no model itself; advises and the user switches |
| **confirms before a hot-swap** | a whole-unit replacement is confirmed before it happens |
| **defers to Crimp / Operator at the boundary** | recruit-published hands to Crimp, deploy-ship hands to Operator, aloud |
| **thin in-session dispatcher** | fast-path when named / short menu when bare; loads the engine in-session, spawns nothing, opens no CR |
| **builds a not-yet-existing automaton** | authors it via `define-skill` rather than deferring authoring to Crimp |
