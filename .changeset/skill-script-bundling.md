---
'cyberplace': patch
---

`skill-design` governance: keep a skill's scripts inside its own folder, run them with plain `node`, and share logic across skills by authoring it once in the package source and bundling it into each skill's `scripts/`, with a CI drift check.
