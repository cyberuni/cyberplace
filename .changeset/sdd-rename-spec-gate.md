---
"cyber-skills": patch
---

Rename the SDD `validate-spec` skill (and its spec node) to `spec-gate`, reconciling the name with the "spec gate" concept the design already uses everywhere. The skill folder `plugins/sdd-new/skills/validate-spec` is now `plugins/sdd-new/skills/spec-gate`; its `check-spec-state.mts` / `check-feature.mts` engines move with it. The gate skill body now also documents `check-feature.mts` (the `.feature`-form authority run in `verify:specs-new`).
