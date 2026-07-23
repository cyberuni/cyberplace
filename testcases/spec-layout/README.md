# testcases/spec-layout — per-strategy validation fixtures

Each case documents an **input project** (a described tree) and the **expected backfilled spec tree**
(`<case>/expected/`, validated by `check-spec-state --root`). They prove each `design/spec-layout.md`
strategy produces a clean, declared tree, and double as the `scaffold-project-spec` acceptance set.

| Case | Strategy | Location | Validates |
|---|---|---|---|
| `capability-first/domain-service` | capability-first | colocated | S1 default over a domain service |
| `mirror-source/feature-first` | mirror-source | colocated | S2 clean mirror, boundary-aligned depth |
| `mirror-source/layer-organized` | (warned → capability-first) | colocated | S2 cautionary — mirror over a layer tree is redirected |
| `bounded-context/multi-context` | bounded-context | colocated | S3 contexts + glossary + context-map |
| `layered/clean-app` | layered | colocated | S4 layers = descriptive; behavior nests inside |
| `doc-envelope/docs-project` | doc-envelope | colocated | S5 arc42 sections; only runtime/quality are behavioral |
| `location/agentic-plugin-hoist` | capability-first | hoisted | hoist out of a shippable plugin (ACED is the full example) |
| `location/monorepo` | capability-first | monorepo-member | multi-project backfill (one tree per package + outer) |

Validate all: `node plugins/sdd/skills/spec-gate/scripts/check-spec-state.mts --root testcases/spec-layout`
