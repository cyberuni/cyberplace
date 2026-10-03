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

## Plugins

The repo doubles as a plugin marketplace (`.claude-plugin/marketplace.json`). Notable plugins in [`plugins/`](plugins):

| Plugin              | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `cyberspace`        | Research and design toolkit for universal plugins                        |
| `commit-discipline` | Commit-discipline hooks and workflow                                     |

### Plugins hosted elsewhere

These moved to their own repos and are still installable from this marketplace, which
references them by `git-subdir`:

| Plugin        | Home                                                              |
| ------------- | ----------------------------------------------------------------- |
| `sdd`         | [cyberuni/cyber-sdd](https://github.com/cyberuni/cyber-sdd) (npm `cyber-sdd`) |
| `aced`        | [cyberuni/cyber-sdd](https://github.com/cyberuni/cyber-sdd)       |
| `quill`       | [cyberuni/cyber-sdd](https://github.com/cyberuni/cyber-sdd)       |
| `cyberlegion` | [cyberuni/cyberlegion](https://github.com/cyberuni/cyberlegion)   |
| `cyberfleet`  | [cyberuni/cyberfleet](https://github.com/cyberuni/cyberfleet)     |

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
