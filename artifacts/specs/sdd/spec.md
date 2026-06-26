# Spec-Driven Development (SDD)

> **STUB** — root project spec, scaffolded for [CR #34](https://github.com/cyberuni/cyber-skills/issues/34).
> Content TBD. The working model lives in [`./DESIGN-NOTES.md`](./DESIGN-NOTES.md).

## What SDD is

<!-- TODO: the abstraction stack (outcome ← code ← spec+suite ← CR) + the Mission Loop (steps 1–4) + the 4 post-mission outer loops, in brief -->

## Capability map

| Folder | Owns | Loop role |
|---|---|---|
| `design/` | the abstract idea — rules & model | — |
| `gateway/` | the universal router/door | — (not a loop step) |
| `intake/` | the CR subsystem (sources + escape + inject) | feeds the mission (step 1) |
| `authoring/` | grill CR → spec+suite diff (+ spec gate); shared capability | explore (step 2), invoked |
| `mission/` | the autonomous orchestrator (+ impl gate) | Mission Loop steps 1–4 |
| `mission/deliver/` | build to keep against the frozen suite | deliver (step 3) |
| `mission/handoff/` | land the result in the delivery shape | handoff (step 4) |
| `campaign/` `formation/` `doctrine/` `forge/` | the 4 post-mission outer loops | step 5 (not in the Mission Loop) |
| `corpus/` | spec-corpus tooling | — |
| `plugin/` | SDD's plugin nature (ships-as-plugin + extended-by-plugins; registry init-write) | — |
| `acceptance/` | e2e behavior suite | — |

## Invariants

- **ONE spec, ONE behavior suite, ONE gate/freeze baseline.** Folders are *views*, never lifecycle units — none gets its own `status`/approval.
- **Rule-in-design + behavior-in-capability.**
- **Unit scenarios colocate** with their capability; **acceptance (e2e) scenarios** live in `acceptance/`.

## TODO

- [ ] author the root narrative
- [ ] fill each capability folder
- [ ] build the behavior suite (`acceptance/` + colocated unit)
