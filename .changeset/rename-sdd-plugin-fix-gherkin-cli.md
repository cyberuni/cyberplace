---
"cyber-sdd": minor
---

Rename the package from `@cyberplace/sdd-plugin` to `cyber-sdd` and make it self-sufficient for a
standalone install: `gherkin-cli` is now a real dependency (imported directly, no longer shelled
out via `npx`), and `package.json#files` ships the right surface (skills, agents, plugin manifests)
for `npm install`.

Fixes a bug where concurrent `.feature` checks could corrupt the shared `npx` install cache under
load, intermittently breaking `check:spec`.
