# cyber-sdd

## 0.1.0

### Minor Changes

- 4f6dd97: Rename the package from `@cyberplace/sdd-plugin` to `cyber-sdd` and make it self-sufficient for a
  standalone install: `gherkin-cli` is now a real dependency (imported directly, no longer shelled
  out via `npx`), and `package.json#files` ships the right surface (skills, agents, plugin manifests)
  for `npm install`.

  Fixes a bug where concurrent `.feature` checks could corrupt the shared `npx` install cache under
  load, intermittently breaking `check:spec`.

- b9ee04d: The SDD spec-judge now emits a non-blocking spec-format conformance warning when a behavioral
  `spec.md` is missing a required section — especially `## Use Cases`, `## Control Flow` (CFG), or
  `## Scenario map`. The warning is surfaced in the spec-gate report and never blocks the gate, sets
  `ALIGNED: false`, or short-circuits the lenses on its own. Reference and descriptive nodes raise no
  warning.
