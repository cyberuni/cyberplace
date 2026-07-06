# cyberplace

[![CI](https://github.com/cyberuni/cyberplace/actions/workflows/release.yml/badge.svg)](https://github.com/cyberuni/cyberplace/actions/workflows/release.yml)

Universal toolbox in the Cyber Era — a skill library, CLI, and plugin marketplace for AI coding agents (Claude Code, Cursor, Codex, GitHub Copilot CLI).

## Quick start

No install required — run the CLI with `npx`:

```sh
# Install every skill from a repo
npx cyberplace add cyberuni/cyberplace

# Install one skill by name
npx cyberplace add cyberuni/cyberplace:commit

# Search, list, and update
npx cyberplace find commit
npx cyberplace list
```

See [`packages/cyberplace`](packages/cyberplace/readme.md) for the full command reference.

## Packages

| Package                                                   | Description                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| [`cyberplace`](packages/cyberplace)                       | Opinionated skills, hooks, and workflows for AI agents + the CLI      |
| [`universal-plugin`](packages/universal-plugin)           | Build tool for plugins that work across Claude Code, Cursor, and Codex |
| [`cyberlegion`](packages/cyberlegion)                     | Harness-agnostic agent session spawning, messaging, and dispatch      |
| [`cyberfleet`](packages/cyberfleet)                       | Harness-agnostic, MCP-free inter-agent sessions and messaging         |

## Plugins

The repo doubles as a plugin marketplace (`.claude-plugin/marketplace.json`). Notable plugins in [`plugins/`](plugins):

| Plugin              | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `sdd`               | Spec-Driven Development — behavioral specs (spec.md + .feature)           |
| `aced`              | Agent Config Evaluation & Development — spec, evaluate, improve configs   |
| `quill`             | Documentation SDD plugin — verify guides and reference docs against specs |
| `cyberspace`        | Research and design toolkit for universal plugins                        |
| `cyberfleet`        | Fleet persona layer (Pod, Operator) for the cyberfleet CLI              |
| `cyberlegion`       | Agent session spawning, messaging, and dispatch — the Legion and Legate  |
| `commit-discipline` | Commit-discipline hooks and workflow                                     |

## Development

This is a pnpm + turbo monorepo.

```sh
pnpm install
pnpm build      # build all packages
pnpm verify     # typecheck + lint + test + audit — run before committing
```

See [`AGENTS.md`](AGENTS.md) for architecture and contributor guidance.

## License

[MIT](LICENSE)
