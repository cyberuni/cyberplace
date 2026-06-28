# sdd

The SDD **gateway** skill — the universal router / front door to a Spec-Driven-Development project. User-invocable: activates SDD, gathers missing intent, classifies the request, and routes it to the handling capability (intake / authoring / mission / corpus / the outer loops), then hands the resolved work to the conductor.

A **thin relay**: it holds no production logic, loads **no governance** (the macro-grill ruling), and writes no contract state. By default it **spawns nothing** — the conductor runs in-session (the operator role is the main session). It spawns the `sdd-operator` subagent and acts as relay **only** in the headless fallback (no live session — an unattended scheduler or a multi-CR fan-out).

Bakes in: explicit activation (`$sdd`), the fast path (artifact + action → route directly), the two-level intake menu with the hard four-option rule, surface-pending-strategy (count only — never draft or ratify), the routing-table-as-capability-index, in-session-vs-headless handoff with write-ownership preserved, and escape / freeze recognition (a non-CR escapes with no record; a frozen `.feature` routes back through authoring).
