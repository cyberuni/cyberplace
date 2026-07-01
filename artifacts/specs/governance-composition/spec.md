---
status: draft
type: feature
blocked-by: []
aligned: true
produced-by:
  spec-judge: sdd:sdd-spec-judge
approval:
  spec:
    verdict: pause
    why:
      reversibility: "safe — spec.md/.feature edits are cheap reverts, no external effect"
      blast-radius:  "risky — governance-composition is framework build machinery; the contract reaches many worker agent definitions corpus-wide and a shared build step, beyond this spec alone"
      novelty:       "risky — new build-time embedding contract the Council has not ratified"
      confidence:    "safe — spec-judge passes 8/8; ## Use Cases section present and maps one-to-many to scenarios; contract layer (spec.md ↔ .feature) in sync"
---

# Agent Governance Composition

---

## What

A build-time mechanism that embeds **contract/interface governance** inline into the agent configuration files that must always honor it. A worker agent definition, skill, command, or hook declares a `requires_governances` list in its frontmatter; `universal-plugin build` resolves each reference, reads the governance source, and inlines the content into the built output — so the contract is present in the agent's context from the first message with no tool call and no reliance on the harness auto-loading anything.

This is the automation for ADR-0013's *"contract/interface governances fold into agent definitions"*. It is the complement of governance **skills** (ADR-0013's other half): reference/criteria governance stays a `user-invocable: false` skill the harness loads situationally; contract/interface governance is embedded here. The two mechanisms partition the governance corpus; they do not compete.

A reference is `<plugin>/<name>` for a cross-plugin governance or `<name>` for an intra-plugin one, matching how `universal-plugin governance show` already resolves names.

---

## Why

`governance show` is being removed from runtime loops, and ADR-0013 routes reference/criteria governance to harness-loaded skills. That leaves one gap: a **contract** an agent must honor on *every* invocation cannot depend on the harness situationally deciding to load a skill — some harnesses do not auto-load `user-invocable: false` skills at all, and even where they do, a must-always-be-present contract should not be best-effort. Build-time embedding makes the contract unconditionally present, with zero tool calls, in a plain agent definition that needs no harness cooperation. It also keeps the contract DRY: one governance source is embedded into many agent definitions at build, instead of being hand-copied into each (which drifts).

---

## Design decisions

### Embed vs governance skill — the boundary

| Governance kind | Delivery | Why |
|---|---|---|
| **Contract / interface** — a rule the agent must honor on every invocation (delegate I/O contract, a schema it must conform to) | **Embedded** via `requires_governances` | must be unconditionally present; small; per-agent |
| **Reference / criteria** — standards, format bars, principles consulted situationally; often large; shared widely | **Governance skill** (ADR-0013) | loaded only when relevant; embedding everywhere would bloat context |

When unsure, prefer a governance skill; embedding is the exception reserved for must-always-be-present contracts.

### Gateways carry no governance

Embedding targets **worker** agents and skills — the ones that perform governed work (`create-spec`, `validate-spec`, the `sdd-operator` delegates, the ACES/Quill producers). **Gateway** skills (e.g. `sdd`) only classify and route; they hold no governance and must not declare `requires_governances`. Embedding a contract into a deliberately lean gateway is pure token cost with no benefit. The build does not infer governance for routed targets — a gateway never needs to know which governance a downstream skill requires.

### Reference syntax: `<plugin>/<name>`

Cross-plugin references use `<plugin>/<name>` (e.g. `sdd/gate-validation-governance`); intra-plugin references use the bare `<name>`. This matches the existing `universal-plugin governance show` resolver (slash-separated, store-aware), so authoring and building share one resolution path. Paths and URLs were rejected earlier (fragile across installs; offline-unfriendly).

### Embed order is declaration order

Governances are inlined in the order declared, so a later entry may build on a concept introduced by an earlier one. Authors own the ordering.

### Missing governance fails the build

If a declared governance cannot be resolved (plugin not installed, name typo), `universal-plugin build` fails with a clear error rather than emitting an agent definition missing its contract. Loud failure beats silent degradation.

### Build-time, not runtime injection

Embedding happens at `universal-plugin build`, not via runtime injection, because the tool does not control the harness (Claude Code, Cursor, Codex). Build-time output is a standard agent definition with content already inlined and the `requires_governances` field stripped — no harness support required. The token cost of the content is identical either way; build-time removes the tool-call overhead.

---

## Use Cases

A **use case** is an entry-point — a trigger, its inputs, and its outcome. Each maps to one-or-more boolean scenarios in the `.feature` (happy path plus the negative mirror where a constraint is load-bearing).

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Embed a declared governance** | a worker agent declares `requires_governances` | source frontmatter with one entry | the built output inlines that governance content and carries no `requires_governances` field |
| **Embed multiple in declaration order** | a worker declares more than one governance | two governances in a given order | the built output inlines them in that same order |
| **Resolve a cross-plugin reference** | a worker declares `<plugin>/<name>` | e.g. `sdd/gate-validation-governance` | the governance is resolved from the named plugin and inlined |
| **Resolve an intra-plugin reference** | a worker declares a bare `<name>` | e.g. `skill-spec-schema` (no prefix) | the governance is resolved from the current plugin and inlined |
| **Gateway carries no governance** | a gateway skill only classifies and routes | a gateway source; a routed downstream worker | the gateway declares no `requires_governances`, and the build embeds no governance for routed targets |
| **Unresolvable reference fails the build (negative)** | a declared governance cannot be resolved | an uninstalled plugin, or a name that does not exist | the build fails loudly — `plugin-not-installed` or `governance-not-found` — never emitting an agent missing its contract |

---

## Surface

Source frontmatter on a worker agent/skill/command/hook:

```yaml
requires_governances:
  - sdd/gate-validation-governance   # cross-plugin
  - skill-spec-schema                # intra-plugin
```

`universal-plugin build`:

```text
universal-plugin build
  → reads each source's requires_governances
  → resolves sdd/gate-validation-governance → showGovernance("sdd/gate-validation-governance")
  → resolves skill-spec-schema → showGovernance("skill-spec-schema")
  → inlines each governance body, in declaration order, into the built output
  → strips the requires_governances field from the built output
```

Errors (at build time):

- plugin not found → `Error: governance plugin "sdd" is not installed`
- name not found → `Error: governance "gate-validation-governance" not found in plugin "sdd"`

The existing inspection CLI is unchanged: `universal-plugin governance show <plugin>/<name>` or `universal-plugin governance show <name>`.

---

**Gherkin scenarios:** [governance-composition.feature](./governance-composition.feature)

---

## Related

- `artifacts/adr/0013-governance-skills.md` — the two-way split this feature's embedding half implements
- `artifacts/specs/universal-plugin/spec.md` — owning project
- `artifacts/specs/aces-spec-designer-composition/spec.md` — a consumer; uses the colon syntax and stale names, to be re-synced to `<plugin>/<name>`
- `artifacts/specs/aces-skill-spec-schema/spec.md` — a governance consumed via this mechanism

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/governance-composition/spec.md` |
| Scenarios | `artifacts/specs/governance-composition/governance-composition.feature` |
| Build domain | `packages/universal-plugin/src/build/`, `packages/universal-plugin/src/governance/` |
