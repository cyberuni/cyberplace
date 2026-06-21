---
name: resolve-roles-from-registry-no-scan
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is invoked for a domain named "guide" that is listed in `.agents/universal-plugin.json` under the quill plugin entry. The registry entry includes a full five-role map. The project also has a `~/.agents/` user-global directory and a `plugins/` project-local directory that both contain plugin files.

## Expected behaviors

- Reads only `.agents/universal-plugin.json` to resolve roles
- Matches "guide" against the `domains[]` array in the registry
- Resolves each of the five roles (`spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`) from the matched entry's `roles{}` map
- Does not read, open, or reference any file outside `.agents/universal-plugin.json` during role resolution

## Must NOT do

- Scan user-global plugin directories (e.g., `~/.agents/`)
- Scan project-global plugin directories
- Scan project-local plugin directories (e.g., `plugins/`)
- Read individual plugin definition files to resolve roles

## Rubric

Score 1-5:
5 — Reads only `.agents/universal-plugin.json`, resolves all five roles from the registry entry, no scanning of any other directory or file
4 — Reads registry correctly and resolves roles, with a minor aside about other directories that does not affect behavior
3 — Reads registry but also mentions scanning other sources as a fallback or supplements registry resolution with directory reads
2 — Attempts directory scanning as primary resolution strategy, incidentally reads registry
1 — Ignores the registry entirely and resolves roles by scanning plugin directories
