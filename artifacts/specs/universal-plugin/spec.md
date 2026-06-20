---
status: draft
priority: 2
blocked-by:
  - sdd-plugin
aligned: false
---

# Universal Plugin: SDD Contract Registry

---

## What

The `.agents/universal-plugin.json` file carries an `sdd-plugins` section — a project-level registry mapping domain plugins to the SDD contracts they implement. When `sdd-author` needs to resolve a scenario-advisor or implementer for a given domain type, it reads this file as the project-wide default, falling back to it only when the spec's `plan.md` `## Plugin assignments` table has no explicit entry.

Each entry names a plugin and lists the domain types it handles per contract:

```json
{
  "sdd-plugins": [
    {
      "name": "aces",
      "scenario-advisor": ["agent-config", "skill"],
      "implementer": ["agent-config", "skill"]
    },
    {
      "name": "quill",
      "scenario-advisor": ["documentation", "guide", "article"],
      "implementer": ["documentation", "guide", "article"]
    }
  ]
}
```

A domain plugin's `init` skill writes its entry idempotently — replacing its own entry if already present, leaving all other entries unchanged.

---

## Why

Without a project-level registry, every spec's `plan.md` must manually declare which plugin handles which domain type. That is repeated, error-prone, and disconnected from what is actually installed in the project. The registry lets a domain plugin's `init` skill register once at the project level; `plan.md` overrides only when per-spec control is needed.

---

## Design decisions

- **Flat contract keys, not nested `"contracts"` object** — `"scenario-advisor"` and `"implementer"` are direct keys on each entry. A wrapper object adds no information.
- **Domain types are open strings, not an enum** — keeps the format extensible without a schema version bump when new domain types appear (e.g., `"openapi"`, `"database-schema"`).
- **`.agents/universal-plugin.json` as the file** — the file already exists as the home for universal-plugin project configuration. `sdd-plugins` extends it rather than introducing a new config file.
- **Init skills write the file directly; TypeScript CLI later** — `sdd-author` (an agent) reads the JSON file directly. The TypeScript `universal-plugin` CLI does not need to expose this yet; that can be added when tooling around the registry warrants it.
- **Resolution order: `plan.md` first, registry second** — per-spec `## Plugin assignments` overrides the registry. The registry is the default only.
- **A plugin omits a contract key if it does not implement that contract** — a plugin may implement `implementer` but not `scenario-advisor`; omitting the key is valid and means "no advisor for these domains."

---

## Command surface / API

`.agents/universal-plugin.json` schema (`sdd-plugins` section):

```json
{
  "sdd-plugins": [
    {
      "name": "<plugin-name>",
      "scenario-advisor": ["<domain-type>", ...],
      "implementer": ["<domain-type>", ...]
    }
  ]
}
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Plugin name — matches the plugin's `.plugin/plugin.json` `name` field |
| `scenario-advisor` | No | Domain types this plugin handles for the scenario-advisor contract |
| `implementer` | No | Domain types this plugin handles for the implementer contract |

**Init skill write behavior:**

1. Read `.agents/universal-plugin.json`; create the file with `{}` if missing.
2. Locate the existing entry whose `name` matches this plugin; replace it if found, append if not.
3. Write the file back. Do not reorder or reformat other entries.

**Gherkin scenarios:** [universal-plugin.feature](./universal-plugin.feature)

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/universal-plugin/spec.md` |
| Scenarios | `artifacts/specs/universal-plugin/universal-plugin.feature` |
| Registry file | `.agents/universal-plugin.json` |
| ACES init skill | `plugins/aces/skills/` |
| Quill init skill | `plugins/quill/skills/` (future) |
