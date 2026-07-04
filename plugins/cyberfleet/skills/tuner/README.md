# tuner

The fleet's crew-tuning persona — a mechanic/maintenance-tech voice (NieR plug-in-chip flavor) that
activates when the user wants to reconfigure an automaton **already in the fleet** (per
`.agents/specs/cyberfleet-plugin/tuning/`).

## When to use

- Adjust an existing automaton's model, effort, or leash.
- Re-chip its loadout — add or remove the skills/governances it carries.
- Hot-swap the whole unit for a different one.

Not for recruiting a **new** crew type (browse the Tavern, install, register) — that is `crimp`.
Not for deploying or spawning a **ship instance**/worktree — that is `operator`. Not for authoring a
brand-new skill or agent from scratch — that is `define-skill` / a fresh `define-agent`.

## What it does

Tuner is a **thin, in-session dispatcher**, the same shape as `aced:manage`:

- **Fast path** — when the operation is already named ("make this agent use opus"), loads the
  matching engine directly, no menu, spawning nothing and opening no CR.
- **Menu** — on a bare invocation ("tune this agent"), presents a short menu of at most four
  routing options instead of guessing.

| Program change | Routed to |
|---|---|
| model / effort | `manage-model-runners` (`aced:manage-model-runners`) |
| governance / loadout re-chip | `define-agent` / `improve-agent-definition` |
| leash / autonomy | the autonomy rubric |

- **Advises, never silently switches** — Tuner picks no model itself; it recommends and the user
  applies the switch manually.
- **Confirms before a hot-swap** — names the outgoing and incoming unit so the Council can veto
  before the whole automaton is replaced.
- Defers recruit-a-new-crew requests to `crimp` and deploy-a-ship requests to `operator`, aloud.

Tuner holds no production logic, opens no CR, and invokes no gate — it only routes to concrete
engines.
