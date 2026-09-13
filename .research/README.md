# Research

Working dossiers backing architecture and governance decisions. Use this when you need **evidence, surveys, and ecosystem context** — not the normative rules themselves.

## How this relates to other docs

| Artifact | Role | Loaded by agents via CLI? |
| --- | --- | --- |
| **`governances/*.md`** | Version-pinned **standards** (what is correct) | Yes — `governance show <name>` |
| **`artifacts/adr/*.md`** | **Decisions** with rationale and consequences | No — read from repo |
| **`.research/<topic>/`** | **Background research** supporting ADRs and governances | No — read from repo |

Governances, Discipline sections, and public Skills follow **agent-first** authoring: dense normative bodies, self-contained (no links to other repository files), references at end via `governance show` or external URLs. Research holds tables, repo surveys, issue links, and discussion summaries that must not be inlined into those bodies. ADRs record **why**; governances record **what**. See [ADR-0001](../artifacts/adr/0001-governance-vs-discipline-taxonomy.md#governance-content-boundaries), [ADR-0003](../artifacts/adr/0003-agent-first-authoring.md), and [ADR-0004](../artifacts/adr/0004-cyberplace-cli-output.md).

## Dossier layout

One directory per topic: `.research/<topic-slug>/`. Slugs are undated — a dossier accretes over time rather than being superseded by a new dated file.

| File | Role |
| --- | --- |
| `topic.md` | The question, scope (in/out), and source angles |
| `evidence.md` | Numbered claims (`E01`, `E02`, …) with source, date, status, confidence |
| `conclusion.md` | The verdict — the distilled, citable answer |
| `changes.md` | Dated log of what changed in the conclusion and why |
| `survey.md` | Optional: a separately distilled write-up when one was published from this dossier |

Not every dossier has all five. `conclusion.md` is the file other documents cite.

## Index

| Topic | Informs |
| --- | --- |
| [activation-frontmatter](activation-frontmatter/) | Upstream `activation.lifecycle` proposal (agentskills#57), `skill-design` governance, ADR-0005 |
| [agent-extension-nomenclature](agent-extension-nomenclature/) | ADR-0006 ("Agent Extension" as the cross-layer term) |
| [agent-harness-landscape](agent-harness-landscape/) | The `agent-harness-landscape` skill; any content comparing agent harnesses |
| [agent-plan-persistence](agent-plan-persistence/) | ADR-0015, SDD `provenance-model`, the plan/ledger/cursor design |
| [agent-session-wake](agent-session-wake/) | cyberfleet comms-wake PoC, inter-session messaging, future fleet wake-seam ADR |
| [cfg-derivation-direction](cfg-derivation-direction/) | `sdd:spec-format-governance` + `sdd:suite-format-governance` backfill rule; any corpus-wide uplift of behavioral nodes to the four-section shape |
| [change-review-set](change-review-set/) | Issue #453 — deriving the document set a change pulls into review; `blast-estimate` boundary, a prospective skill-folder guard and spec-node artifact declaration |
| [cli-output-format](cli-output-format/) | `agent-tool-output` governance, ADR-0004 |
| [cross-project-knowledge-sharing](cross-project-knowledge-sharing/) | Cross-repo governance federation |
| [documentation-craft](documentation-craft/) | quill's doc-integrity criteria, the doc spec's prerequisite declaration, a prospective formation-loop check for cross-page claim overlap |
| [gherkin-ui-testing](gherkin-ui-testing/) | SDD scenario/suite format |
| [hook-event-survey](hook-event-survey/) | `hook` domain, cross-runtime hook registration |
| [impl-judge-independence](impl-judge-independence/) | ADR-0016, SDD impl gate, `autonomy-rubric` |
| [open-plugin-spec-comparison](open-plugin-spec-comparison/) | ADR-0007, `universal-plugin` governance |
| [partial-skill-vocabulary](partial-skill-vocabulary/) | ADR-0001, ADR-0013, ADR-0014, ADR-0006 (evidence only — does not reopen them) |
| [plugin-consumption-leveling](plugin-consumption-leveling/) | Plugin consumption tiers |
| [plugin-schema](plugin-schema/) | ADR-0007, `universal-plugin` governance |
| [prepare-skill-design](prepare-skill-design/) | `skill-design` governance |
| [skill-description-dual-purpose](skill-description-dual-purpose/) | `agent-configuration/skills/direct-skill` website page — why Direct Invocation skills default to `user-invocable: false` |
| [skill-description-guidelines](skill-description-guidelines/) | `description` length/structure checks in `improve-skill` |
| [skill-ecosystem-landscape](skill-ecosystem-landscape/) | `skill-repo-structure` governance, ADR-0002, future `init-skill-repo` |
| [skill-kind-axes](skill-kind-axes/) | Issue #380, ADR-0031 (`user-invocable: false` ≠ partial skill) |
| [skill-package-manifest](skill-package-manifest/) | `skill-repo-structure` governance; draft proposal to `vercel-labs/open-plugin-spec` |
| [supply-chain-threat-model](supply-chain-threat-model/) | README install guidance, `init` / `init-commit-discipline` skills, hook register |
| [terminal-multiplexers](terminal-multiplexers/) | cyberlegion multiplexer backend selection |
| [universal-plugin](universal-plugin/) | `universal-plugin` governance, ADR-0007, `create-universal-plugin` skill |
| [use-case-elicitation](use-case-elicitation/) | SDD `spec-format-governance` (`## Use Cases` naming), `spec-producer-governance` (discovery step design) |
| [work-decomposition-cr-parallelism](work-decomposition-cr-parallelism/) | ADR-0025, ADR-0026, SDD `.agents/specs/sdd/mission-graph/` |

## Adding research

1. Create `.research/<topic-slug>/` with `topic.md`, then accumulate `evidence.md` as sources are read.
2. Write `conclusion.md` once the question is answered; log later revisions in `changes.md`.
3. Add a row to the index table above.
4. Link from the relevant **ADR** (not from governance bodies — governances do not link back to repo paths).
5. When findings become policy, extract the decision into a governance or ADR — do not let research and governance diverge silently.
