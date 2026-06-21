---
status: draft
blocked-by: []
---

# Agent Governance Composition

---

## What

Any textual agent configuration file with frontmatter — agent definitions, skills, commands, discipline hooks, or any markdown-based artifact — can declare a list of governance dependencies via a `requires_governances` frontmatter field. `universal-plugin build` reads this field, resolves each governance, and embeds the content inline in the built output — so governance is present in the agent's context from the first message, with no extra tool calls at invocation time.

A governance reference uses the syntax `<plugin>:<governance-name>` for cross-plugin references, or `<governance-name>` for intra-plugin references.

---

## Why

Currently, agents that need governance knowledge must issue `governance show <name>` as their first action. This has a real cost:

- Each `governance show` call is a round trip — 3 governances = 3 extra tool calls before any work starts. Noticeable latency.
- The instruction to "run governance show first" lives in prose — it can be omitted by authors or skipped by inattentive agents.
- Cross-plugin references have no standard syntax.

Build-time embedding eliminates the tool-call overhead entirely. Governance content is in context from the first message. No harness cooperation required — `universal-plugin build` handles it at plugin build time.

---

## Design decisions

### Reference syntax: `<plugin>:<name>` vs URL vs path

Chose `<plugin>:<name>` (e.g., `sdd:sdd-principles`, `aces:skill-spec-schema`) over file paths or URLs because:
- Stable across plugin version upgrades (resolved at build time from installed plugin)
- Readable in agent definition YAML/JSON without tooling
- Consistent with how skills are namespaced (`aces:create-spec`)

Paths were rejected: fragile across installs. URLs were rejected: offline-unfriendly, caching complexity.

### Manifest field in agent definition vs separate file

Manifest is declared inline in the agent definition file (a `requires_governances` field) rather than a sidecar file. Keeps the source agent definition self-contained. A sidecar is only warranted when the list exceeds what fits readably inline (rare).

### Embed order: declaration order

Governances are embedded in declaration order. Later entries can reference concepts introduced by earlier entries. Authors are responsible for ordering.

### Failure on missing governance

If a declared governance cannot be resolved during build (plugin not installed, name typo), `universal-plugin build` fails with a clear error rather than silently producing an agent definition that lacks the knowledge. Silent degradation is worse than a loud failure.

### Build-time vs runtime

Embedding at build time (not runtime injection) was chosen because:
- cyber-skills and universal-plugin do not control the agent harness (Claude Code, Cursor, Codex) — runtime injection would require harness support that cannot be assumed
- Build-time embedding requires no harness cooperation; the output is a standard agent definition file with content already inlined
- Token cost of the governance content is the same either way; build-time avoids the additional tool-call overhead of runtime loading

---

## Command surface / API

Any textual agent configuration file with frontmatter (illustrative examples):

Agent definition (YAML):

```yaml
name: aces-spec-designer
description: "..."
requires_governances:
  - sdd:sdd-principles
  - sdd:spec-template
  - aces:skill-spec-schema
```

Skill (markdown frontmatter):

```markdown
---
name: create-spec
description: "..."
requires_governances:
  - sdd:sdd-principles
  - aces:skill-spec-schema
---
```

Command or discipline hook (markdown frontmatter):

```markdown
---
requires_governances:
  - sdd:sdd-principles
---
```

At `universal-plugin build` time:

```
universal-plugin build
  → reads agent definition source
  → resolves sdd:sdd-principles
      → looks up "sdd" plugin install location
      → reads <sdd-plugin>/governances/sdd-principles.md
  → resolves sdd:spec-template, aces:skill-spec-schema (same pattern)
  → embeds all three inline in the built agent definition
  → writes output to dist/ (or configured output path)
```

The built output contains the governance content directly — no `requires_governances` field, no tool calls needed at invocation time.

CLI for manual inspection (existing `governance show`, extended):

```
universal-plugin governance show sdd:sdd-principles   # cross-plugin
universal-plugin governance show sdd-principles        # intra-plugin (current behavior)
```

**Error cases (at build time):**
- Plugin not found → `Error: governance plugin "sdd" is not installed`
- Governance name not found → `Error: governance "sdd-principles" not found in plugin "sdd"`

**Gherkin scenarios:** _(pending spec approval)_

---

## Related

- `artifacts/specs/aces-skill-spec-schema/spec.md` — the ACES governance loaded via this mechanism
- `artifacts/specs/aces-spec-designer-composition/spec.md` — first concrete use of this mechanism
- `artifacts/specs/sdd-plugin/governances/sdd-principles.md` — governance loaded cross-plugin by ACES
