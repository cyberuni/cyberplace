# Governances

Versioned agent-tool contracts shipped with the `cyberplace` npm package. Content is frozen to the installed package version.

These artifacts are **governance** — version-pinned, auditable standards loaded on demand via CLI. Session **discipline** (for example commit habits injected by hooks) is a separate layer.

## Consumption

Do not link to these files from SKILL.md. Load governances through the CLI:

```bash
# List available governances
npx cyberplace@<version> governance list

# Show governance body (agents: read stdout)
npx cyberplace@<version> governance show agent-tool-output

# Agent-optimized output
npx cyberplace@<version> governance show agent-tool-output --format agent
```

Always pin an exact version from `npm view cyberplace version`.

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
| `universal-plugin` | Pointer to the universal plugin format, maintained by the `universal-plugin` repository |

## Moved

These governances now ship from the package that owns their subject
(repobuddy/buddy-agent-harness#122). `governance show <name>` prints a one-line notice naming the
new owner and exits non-zero; it is a forwarder kept for one release and removed once the callers
migrate. `governance list` no longer lists them.

| Name | Now owned by | Read it at |
| ---- | ------------ | ---------- |
| `skill-design` | `cyber-aced` | [`plugins/aced/governances/skill-design.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-design.md) |
| `skill-repo-structure` | `cyber-aced` | [`plugins/aced/governances/skill-repo-structure.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-repo-structure.md) |
| `agent-tool-output` | `cyber-aced` | [`plugins/aced/governances/agent-tool-output.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/agent-tool-output.md) |
| `cli-resolution` | `cyber-aced` | [`plugins/aced/governances/cli-resolution.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/cli-resolution.md) |

A skill no longer reads a moved governance through this CLI. `universal-plugin plugin build` copies
it into `<skill>/references/governances/<name>.md` from the owning package, and the skill reads that
committed copy.

For cyberplace CLI output archetypes (`output()` helper, subcommand inventory, markdown-on-stdout for `governance show`), see [ADR-0004](../../../artifacts/adr/0004-cyberplace-cli-output.md).
