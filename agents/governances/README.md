# Governances

Versioned agent-tool contracts shipped with the `cyber-skills` npm package. Content is frozen to the installed package version.

These artifacts are **governance** — version-pinned, auditable standards loaded on demand via CLI. Session **discipline** (for example commit habits injected by hooks) is a separate layer.

## Consumption

Do not link to these files from SKILL.md. Load governances through the CLI:

```bash
# List available governances
npx cyber-skills@<version> governance list

# Show governance body (agents: read stdout)
npx cyber-skills@<version> governance show agent-tool-output

# Agent-optimized output
npx cyber-skills@<version> governance show agent-tool-output --format agent
```

Always pin an exact version from `npm view cyber-skills version`.

## Agent-first authoring

Governances load into agent context on demand. Write them **agent-first**:

- **Dense and concise** — imperative must / should / do not rules; no tutorials or surveys in the body
- **Self-contained** — no links to other repository files; agent completes the workflow from stdout alone
- **References at end** — cross-governance `governance show` commands and external HTTPS URLs only in `## References`
- **No rationale sections** — do not include `## Why`, `## Rationale`, `## Background`, or causal "because…" prose; ADRs record **why**, governances record **what**

Do not embed reference-repo catalogs, issue surveys, or illustrative examples in governances. Keep surveys and decision rationale in ADRs and research.

## Available governances

| Name | Purpose |
| ---- | ------- |
| `skill-design` | SKILL.md authoring — agent-first structure, placement, patterns, progressive disclosure, deterministic extraction |
| `skill-repo-structure` | Skill library repo layout — archetypes, manifests, CI, discipline sections, contributor conventions |
| `agent-tool-output` | General output rules for scripts, hooks, and CLIs that agents invoke |

For cyber-skills CLI output archetypes (`output()` helper, subcommand inventory, markdown-on-stdout for `governance show`), see [ADR-0004](../docs/adr/0004-cyber-skills-cli-output.md).
