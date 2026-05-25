# Governances

Versioned agent-tool contracts shipped with the `cyber-skills` npm package. Content is frozen to the installed package version.

These artifacts are **governance** documents per [ADR-0001](../docs/adr/0001-governance-vs-discipline-taxonomy.md).

## Consumption

Do not link to these files from SKILL.md. Load governances through the CLI:

```bash
# List available governances
npx cyber-skills@<version> governance list

# Show governance body (agents: read stdout)
npx cyber-skills@<version> governance show agent-tool-output

# Structured output
npx cyber-skills@<version> governance show agent-tool-output --json
```

Always pin an exact version from `npm view cyber-skills version`.

Governances are loaded into agent context on demand. Keep them **normative and concise** — no reference-repo catalogs, issue surveys, or illustrative examples. Put those in [`docs/research/`](../docs/research/README.md). ADRs record **decisions**; research records **evidence**. Policy: [ADR-0001 — Governance content boundaries](../docs/adr/0001-governance-vs-discipline-taxonomy.md#governance-content-boundaries).

## Available governances

| Name | Purpose |
| ---- | ------- |
| `skill-design` | SKILL.md authoring — principles, progressive disclosure, placement, deterministic extraction |
| `skill-repo-structure` | Skill library repo layout — archetypes, manifests, CI, contributor conventions |
| `agent-tool-output` | Output rules for scripts, hooks, and CLIs that agents invoke |
