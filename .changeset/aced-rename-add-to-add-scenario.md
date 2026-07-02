---
"cyber-skills": patch
---

Rename the ACED `add` skill (and its spec unit) to `add-scenario`, so the name says what it adds — a golden-set scenario — rather than a bare, generic `add` that read awkwardly next to `npx skills add`. The skill folder `plugins/aced/skills/add` is now `plugins/aced/skills/add-scenario`, its spec node `.agents/specs/aced/suite-authoring/add` moves with it (the frozen `add.feature` → `add-scenario.feature`, a pure rename that preserves the freeze), and the docs route `/aced/add/` is now `/aced/add-scenario/`. Install with `npx skills add cyberuni/cyber-skills --skill aced/add-scenario`; the old `aced/add` path no longer resolves.
