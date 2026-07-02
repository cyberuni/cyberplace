---
"cyber-skills": patch
---

Rename the ACES `add` skill (and its spec unit) to `add-scenario`, so the name says what it adds — a golden-set scenario — rather than a bare, generic `add` that read awkwardly next to `npx skills add`. The skill folder `plugins/aces/skills/add` is now `plugins/aces/skills/add-scenario`, its spec node `.agents/specs/aces/suite-authoring/add` moves with it (the frozen `add.feature` → `add-scenario.feature`, a pure rename that preserves the freeze), and the docs route `/aces/add/` is now `/aces/add-scenario/`. Install with `npx skills add cyberuni/cyber-skills --skill aces/add-scenario`; the old `aces/add` path no longer resolves.
