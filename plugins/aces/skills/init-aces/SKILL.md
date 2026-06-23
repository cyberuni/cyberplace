---
name: init-aces
description: Use this skill to register ACES as the SDD plugin for agent-configuration domains — writes an aces role-map entry to .agents/universal-plugin.json so sdd-orchestrator resolves the ACES production-chain roles for skills, subagents, commands, and AGENTS.md sections.
---

# Init ACES

Register ACES in the project's SDD plugin registry so `sdd-orchestrator` resolves the ACES production-chain roles by reading **only** `.agents/universal-plugin.json` — no plugin-directory scanning at runtime (the lockfile pattern).

## Workflow

### 1. Locate the registry file

Look for `.agents/universal-plugin.json` at the project root. If it exists, read it; otherwise create it with `{}`.

### 2. Determine the ACES version

Read ACES's own version from its plugin manifest (it ships inside the plugin, so it knows its version for free). Use it as the `version` stamp.

### 3. Write the aces entry (rewrite-on-init migration)

Find the entry where `"name": "aces"` in the `sdd-plugins` array:

- **Not found** → append the canonical entry (create the array if absent).
- **Found, old shape** (the pre-orchestrator `scenario-advisor` / `implementer` keys) → **rewrite** it to the role-map shape below.
- **Found, role-map shape, stale `version`** → rewrite when the recorded version differs (install / upgrade / manual re-run reconciles drift here; the orchestrator never compares versions at runtime).

Do not reorder or reformat other entries.

**Canonical entry:**

```json
{
  "name": "aces",
  "version": "<aces version>",
  "domains": ["skill", "subagent", "command", "agents-section"],
  "roles": {
    "spec-producer": "aces-scenario-writer",
    "plan-producer": null,
    "spec-judge": "aces-spec-validator",
    "impl-producer": null,
    "impl-judge": "aces-implementer"
  },
  "governances": { "director": null, "builder": null, "architect": null }
}
```

`impl-producer: null` — writing the agent config is done by the `define-agent` / `improve` skills or the generic Builder, not a bound impl-producer agent. `plan-producer: null` uses the SDD default. Each `null` governance uses the SDD default actor governance.

### 4. Write the updated file

Write `.agents/universal-plugin.json` back with the updated contents.

### 5. Report

Confirm the `.agents/universal-plugin.json` aces role-map entry is present under `sdd-plugins`, stamped with the ACES version, with domains `skill`, `subagent`, `command`, `agents-section`.

Next step: use `create-spec` (sdd plugin) to scaffold an agent-configuration spec; the orchestrator resolves the ACES roles automatically.
