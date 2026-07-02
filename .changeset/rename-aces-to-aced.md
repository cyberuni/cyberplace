---
"cyber-skills": minor
---

Rename the ACES plugin to **ACED** — Agent Config Evaluation & Development. The old expansion, "Agent Config Examination & Specification," undersold what the plugin does: it doesn't just examine and specify agent configs, it runs the full SDD production chain (spec-producer, spec-judge, impl-producer, impl-judge) that builds and evolves them.

This is a breaking rename for existing installs. All `aces:*` skill and agent references (`aces:run`, `aces:add-scenario`, `aces:define-agent`, `aces:define-skill`, `aces:define-governance`, `aces:improve`, `aces:improve-skill`, `aces:compare`, `aces:report`, `aces:init-aces`, `aces-scenario-writer`, `aces-spec-validator`, `aces-impl-judge`, `aces-case-judge`) no longer resolve — use their `aced:*` / `aced-*` equivalents (e.g. `aced:init-aced`). The plugin directory moves from `plugins/aces` to `plugins/aced`, and its `.agents/universal-plugin.json` registration key changes from `aces` to `aced`. Consumers with an existing local `.agents/universal-plugin.json` entry pointing at `aces` must update it to `aced`, and re-run `npx skills add cyberuni/cyber-skills --skill aced/<skill>` for any pinned install paths.
