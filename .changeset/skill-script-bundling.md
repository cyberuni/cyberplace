---
'cyberplace': patch
---

`skill-design` governance: keep a skill's scripts inside its own folder and run them with plain `node`. Share logic by authoring it once in the package source and bundling it into each skill's `scripts/` at pack time; ship the bundles through npm, not git, and give each skill a pinned `npx` fallback for git installs.
