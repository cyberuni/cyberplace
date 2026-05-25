# Research

Durable reference material for architecture and governance decisions. Use this when you need **evidence, surveys, and ecosystem context** — not the normative rules themselves.

## How this relates to other docs

| Artifact | Role | Loaded by agents via CLI? |
| --- | --- | --- |
| **`governances/*.md`** | Version-pinned **standards** (what is correct) | Yes — `governance show <name>` |
| **`docs/adr/*.md`** | **Decisions** with rationale and consequences | No — read from repo |
| **`docs/research/*.md`** | **Background research** supporting ADRs and governances | No — read from repo |

Governances, Discipline sections, and public Skills follow **agent-first** authoring: dense normative bodies, self-contained (no links to other repository files), references at end via `governance show` or external URLs. Research holds tables, repo surveys, issue links, and discussion summaries that must not be inlined into those bodies. ADRs record **why**; governances record **what**. See [ADR-0001](../adr/0001-governance-vs-discipline-taxonomy.md#governance-content-boundaries), [ADR-0003](../adr/0003-agent-first-authoring.md), and [ADR-0004](../adr/0004-cyber-skills-cli-output.md) (CLI output patterns split from `agent-tool-output` governance).

## Naming

Use `YYYY-MM-<topic>.md` (for example `2026-05-skill-ecosystem-landscape.md`). One topic per file. When research leads to a decision, link the ADR from the research file; ADRs link to the governance they inform.

## Index

| Date | Document | Informs |
| --- | --- | --- |
| 2026-05 | [Skill ecosystem landscape](2026-05-skill-ecosystem-landscape.md) | `skill-repo-structure` governance, ADR-0002, future `init-skill-repo` |
| 2026-05 | [cyber-skills supply chain threat model](2026-05-cyber-skills-supply-chain-threat-model.md) | README install guidance, `init` / `init-commit-discipline` skills, hook register |

## Adding research

1. Create `docs/research/YYYY-MM-<topic>.md` with sources, findings, and open questions.
2. Add a row to the index table above.
3. Link from the relevant **ADR** (not from governance bodies — governances do not link back to repo paths).
4. When findings become policy, extract the decision into a governance or ADR — do not let research and governance diverge silently.
