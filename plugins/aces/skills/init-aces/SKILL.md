---
name: init-aces
description: Use this skill to register ACES as the SDD plugin for agent-configuration domains — writes an aces role-map entry to .agents/universal-plugin.json so the conductor resolves the ACES production-chain roles for skills, subagents, commands, and AGENTS.md sections.
---

# Init ACES

Register ACES in the project's SDD plugin registry so the conductor resolves the ACES production-chain roles by reading **only** `.agents/universal-plugin.json` — no plugin-directory scanning at runtime (the lockfile pattern).

## Workflow

### 1. Locate the registry file

Look for `.agents/universal-plugin.json` at the project root. If it exists, read and parse it; otherwise create it with `{}`.

**Fail closed on a corrupt file.** If the file exists but contains malformed JSON, **fail with an error and stop — do not overwrite it**. Silently rewriting a corrupt file could destroy valid entries from other plugins; leave the file untouched and let a human repair it.

### 2. Determine the ACES version

Read ACES's own version from its plugin manifest (it ships inside the plugin, so it knows its version for free). Use it as the `version` stamp.

### 3. Write the aces entry (rewrite-on-init migration)

Find the entry where `"name": "aces"` in the `sdd-plugins` array:

- **Not found** → append the canonical entry (create the array if absent).
- **Found, old shape** (the legacy `scenario-advisor` / `implementer` keys, or the legacy `domains[]` + shared `roles`/`governances`) → **rewrite** it to the `squads[]` shape below.
- **Found, `squads[]` shape, stale `version`** → rewrite when the recorded version differs (install / upgrade / manual re-run reconciles drift here; the conductor never compares versions at runtime).

Do not reorder or reformat other entries.

**Canonical entry:**

```json
{
  "name": "aces",
  "version": "<aces version>",
  "squads": [
    {
      "artifact-types": ["skill", "subagent", "command", "agents-section"],
      "roles": {
        "spec-producer": "aces-scenario-writer",
        "solution-producer": null,
        "spec-judge": "aces-spec-validator",
        "impl-producer": null,
        "impl-judge": "aces-impl-judge"
      },
      "governances": {
        "oracle-spec": null,
        "builder-spec": "aces-builder-spec",
        "builder-impl": "aces-builder-impl",
        "architect-spec": null,
        "architect-impl": null
      }
    }
  ]
}
```

ACES serves its four agent-config artifact-types with one squad. `impl-producer: null` — writing the agent config is done by the `define-agent` / `improve` skills or the SDD-default impl-producer (the conductor running `impl-producer-governance` via a spawned builder), not a bound impl-producer agent. `solution-producer: null` uses the SDD default. ACES binds its own `builder-spec` (`aces-builder-spec`) and `builder-impl` (`aces-builder-impl`) bars; each remaining `null` governance uses the SDD default actor-gate bar.

**Each squad's `governances` block is required.** Every squad must carry a `governances` map (each binding may be `null`, but the block itself must be present). Reject a payload with a squad missing its `governances` block — fail with an error and **do not write** the file.

### 4. Write the updated file

Write `.agents/universal-plugin.json` back with the updated contents.

### 5. Report

Confirm the `.agents/universal-plugin.json` aces entry is present under `sdd-plugins`, stamped with the ACES version, with a squad serving artifact-types `skill`, `subagent`, `command`, `agents-section`.

Next step: use `sdd:start-mission` (sdd plugin) to scaffold an agent-configuration spec; the conductor resolves the ACES roles automatically.
