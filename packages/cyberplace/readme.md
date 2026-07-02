# cyberplace

[![npm version](https://img.shields.io/npm/v/cyberplace.svg)](https://www.npmjs.com/package/cyberplace)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Opinionated skills, hooks, and workflows for AI agents (Claude Code, Cursor, Codex).

## Usage

No install required — run with `npx`:

```sh
npx cyberplace <command>
```

Or pin to an exact version for reproducible hooks:

```sh
npx cyberplace@0.7.0 <command>
```

## Commands

### Skill registry

```sh
# Install skills from a GitHub repo or npm package
npx cyberplace add cyberuni/cyberplace          # all skills from a repo
npx cyberplace add cyberuni/cyberplace:commit   # one skill by name
npx cyberplace add @my-org/my-skills              # from an npm package
npx cyberplace add --global cyberuni/cyberplace # install to ~/.agents/skills

# Search for skills
npx cyberplace find commit
npx cyberplace find --in your-org/my-skills tdd

# List installed skills
npx cyberplace list

# Update installed skills
npx cyberplace update            # all
npx cyberplace update commit     # one by name

# Remove a skill
npx cyberplace remove commit
```

### Hooks

Register a session-start instruction hook in agent settings (`.claude/settings.json`, `.cursor/hooks.json`):

```sh
# Inject a file as context on every session start
npx cyberplace hook register --name my-rules --file AGENTS.md

# Inject a glob of files
npx cyberplace hook register --name docs --glob "docs/**/*.md"

# Extract a specific section from a markdown file
npx cyberplace hook register \
  --name commit-discipline \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

Run a hook (called by the agent on `SessionStart`):

```sh
npx cyberplace hook run --name my-rules --file AGENTS.md
npx cyberplace hook run --name commit-discipline --extract AGENTS.md --heading "Commit Discipline"
```

### Governances

Version-pinned agent-tool contracts. Agents read these at runtime via `governance show`.

```sh
npx cyberplace governance list
npx cyberplace governance show skill-design
npx cyberplace governance show agent-tool-output
```

Available governances: `agent-tool-output`, `cli-resolution`, `skill-design`, `skill-repo-structure`, `universal-plugin`.

### Skill utilities

```sh
# List skills visible to agents (repo, global, package)
npx cyberplace skill list

# Find which source repo an installed skill came from
npx cyberplace skill source commit

# Validate repo-private skills under .agents/skills/
npx cyberplace skill validate-private
npx cyberplace skill repair-private
```

### Audit

Validate a skill against structural and quality checks (S1–S5, Q1–Q5, Q10–Q11, E1–E2, E6, E9):

```sh
npx cyberplace audit validate --path .agents/skills/my-skill
npx cyberplace audit validate            # all skills in the repo
```

### Output formats

Most commands accept `--format`:

| Value   | Use case                              |
|---------|---------------------------------------|
| `text`  | Human-readable (default)              |
| `json`  | Machine-readable structured output    |
| `agent` | Optimized for agent stdout parsing    |

## Shipped skills

The package bundles a curated set of skills installable via `npx cyberplace add cyberuni/cyberplace`. See the [full list](https://cyberuni.github.io/cyberplace/skills/overview/) on the docs site.

## License

MIT
