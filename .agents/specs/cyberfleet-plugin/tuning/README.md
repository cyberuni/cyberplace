---
spec-type: behavioral
concept: [crew-ops]
---

# tuning — the crew-tuning persona: the Tuner

The user-facing entry to **reconfiguring an existing automaton** — a crew/persona already in the
fleet. **Tuner** is a persona gateway skill shipped in the `cyberfleet` plugin
(`plugins/cyberfleet/skills/tuner/`), a mechanic/maintenance-tech voice (NieR "plug-in chip"
flavor). Where **Pod** and **Operator** (the `gateway/` node) coordinate *sessions*, Tuner works on
one crew unit's **program**: it adjusts the automaton's governance, **model**, **effort**, and
**leash**; **re-chips** its loadout (adds/removes the skills and governances it carries); and
**hot-swaps** the whole automaton for another.

Tuner is a **thin, in-session dispatcher**, the same shape as the `aced:manage` gateway. When the
invocation already names the operation it fast-paths straight to the matching engine; on a bare
invocation it presents a short menu and does not guess. It holds **no production logic**, opens
**no CR**, and invokes **no gate** — it **routes to concrete engines** rather than reimplementing
them:

| Program change | Routed to |
|---|---|
| model / effort | the `manage-model-runners` runner-def family (`aced:manage-model-runners`) |
| persona / agent-definition edits, loadout re-chip | `define-agent` / `improve-agent-definition` |
| leash / autonomy | the autonomy rubric (`.agents/specs/sdd/design/autonomy-rubric.md`) |

> **Tuner picks no model.** It **advises** which model/effort/loadout the work wants and the **user
> switches** — Tuner never silently switches the running session's model itself, exactly as
> `aced:manage` does not.

Tuner is a persona (activation: per-situation), the same activation contract as Pod/Operator.

## Use Cases

**Fit:** strong — Tuner makes a genuine **activation decision** (reconfigure an *existing* unit,
versus recruiting a *new* crew → **Crimp**, versus deploying/spawning a *ship instance* → **Operator**,
versus authoring a *brand-new* skill from scratch → `define-skill`) **and** carries non-deterministic
routing judgment (which engine a program change belongs to, when to confirm a destructive hot-swap,
where the Crimp/Operator boundary falls). All four eval layers carry signal.

**Subject** — reconfiguring the program of one automaton already in the fleet, via the plug-in-chip
verbs:

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **adjust model / effort** | "make this agent use opus / give it more reasoning effort" | the target unit + desired model or effort | routes to `manage-model-runners`; **advises** the switch, user applies it |
| **edit program / re-chip loadout** | "change the governance it loads", "add/remove a skill it carries" | the target unit + the skills/governances to add or drop | routes to `define-agent` / `improve-agent-definition` |
| **adjust leash / autonomy** | "loosen/tighten this automaton's leash" | the target unit + desired autonomy posture | routes to the autonomy rubric |
| **hot-swap the unit** | "swap this crew for another one on this task" | the current unit + the replacement | **confirms first**, then swaps the whole automaton for another |
| **bare invocation** | "tune this agent" with no operation named | the target unit | presents a short menu (≤4 options), does not guess |

**Non-goals** — recruiting or acquiring a **new** crew type (browse the Tavern, install/register a
persona) — that is the **Crimp** persona (`recruitment/`), deferred; deploying or spawning a **ship
instance** / worktree to run work — that is the **Operator** persona (`gateway/`), deferred;
authoring a **brand-new** skill or agent from scratch — that is `define-skill` / a fresh
`define-agent`, not a reconfiguration; and the engine internals themselves (the runner-def
mechanics live in `manage-model-runners`, the agent-def edit mechanics in `define-agent` /
`improve-agent-definition`, the autonomy criteria in the autonomy rubric — Tuner only routes to
them, it never reimplements them).

Every scenario in [`tuning.feature`](./tuning.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **activate on reconfiguring an existing unit** | fires on tune/re-chip/hot-swap of a crew already in the fleet; defers recruit-new (Crimp), deploy-ship (Operator), author-from-scratch (`define-skill`) |
| **route model/effort → manage-model-runners** | classifies a model/effort change to the runner-def family |
| **route program/loadout edits → define-agent / improve-agent-definition** | classifies a governance/skill-loadout change to the agent-def engines |
| **route leash → the autonomy rubric** | classifies an autonomy change to the autonomy rubric |
| **advises, never silently switches the session model** | picks no model itself; advises and the user switches |
| **confirms before a hot-swap** | a whole-unit replacement is confirmed before it happens |
| **defers to Crimp / Operator at the boundary** | recruit-new hands to Crimp, deploy-ship hands to Operator, aloud |
| **thin in-session dispatcher** | fast-path when named / short menu when bare; loads the engine in-session, spawns nothing, opens no CR |
| **only reconfigures an existing unit** | never authors a brand-new crew, never deploys a ship |
