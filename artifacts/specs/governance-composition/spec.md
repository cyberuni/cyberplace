---
status: draft
priority: 1
blocked-by: []
---

# Agent Governance Composition

---

## What

Agent and subagent definitions can declare a list of governance dependencies. When the agent is invoked, the declared governances are loaded and injected into the agent's context before it begins work — without requiring the agent to run `governance show` manually as a first step.

A governance reference uses the syntax `<plugin>:<governance-name>` for cross-plugin references, or `<governance-name>` for intra-plugin references.

---

## Why

Currently, agents that need governance knowledge must issue `governance show <name>` as their first action. This is fragile:

- The instruction to "run governance show first" lives in prose — it can be forgotten, misread, or omitted.
- Cross-plugin references have no standard syntax; there is no way to say "load SDD's principles from the ACES agent definition."
- There is no enforcement: an agent that skips the load step silently lacks the knowledge it needs.

Declarative governance manifests move the load step from prose convention to a structured, enforceable contract. The runtime guarantees the agent has the governance context before its first action.

---

## Design decisions

### Reference syntax: `<plugin>:<name>` vs URL vs path

Chose `<plugin>:<name>` (e.g., `sdd:sdd-principles`, `aces:skill-spec-schema`) over file paths or URLs because:
- Stable across plugin version upgrades (resolved at runtime, not hardcoded)
- Readable in agent definition YAML/JSON without tooling
- Consistent with how skills are namespaced (`aces:create-spec`)

Paths were rejected: fragile across installs. URLs were rejected: offline-unfriendly, caching complexity.

### Manifest field in agent definition vs separate file

Manifest is declared inline in the agent definition file (a `requires_governances` field) rather than a sidecar file. Keeps agent definition self-contained. A sidecar is only warranted when the list exceeds what fits readably inline (rare).

### Load order: declaration order

Governances are injected in declaration order. Later entries can reference concepts introduced by earlier entries. Callers are responsible for ordering.

### Failure on missing governance

If a declared governance cannot be resolved (plugin not installed, name typo), the agent invocation fails with a clear error rather than silently proceeding without the knowledge. Silent degradation is worse than a loud failure.

---

## Command surface / API

Agent definition YAML (illustrative):

```yaml
name: aces-spec-designer
description: "..."
requires_governances:
  - sdd:sdd-principles
  - sdd:spec-template
  - aces:skill-spec-schema
```

Resolution at invocation time:

```
<runtime> resolve governance sdd:sdd-principles
  → looks up "sdd" plugin install location
  → reads <sdd-plugin>/governances/sdd-principles.md
  → injects content into agent context before first message
```

CLI for manual inspection (existing `governance show`, extended):

```
cyber-skills governance show sdd:sdd-principles   # cross-plugin
cyber-skills governance show sdd-principles        # intra-plugin (current behavior)
```

**Error cases:**
- Plugin not found → `Error: governance plugin "sdd" is not installed`
- Governance name not found → `Error: governance "sdd-principles" not found in plugin "sdd"`

**Gherkin scenarios:** _(pending spec approval)_

---

## Related

- `artifacts/specs/aces-skill-spec-schema/spec.md` — the ACES governance loaded via this mechanism
- `artifacts/specs/aces-spec-designer-composition/spec.md` — first concrete use of this mechanism
- `artifacts/specs/sdd-plugin/governances/sdd-principles.md` — governance loaded cross-plugin by ACES
