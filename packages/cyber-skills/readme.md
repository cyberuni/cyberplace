# cyber-skills

[![npm version](https://img.shields.io/npm/v/cyber-skills.svg)](https://www.npmjs.com/package/cyber-skills)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Opinionated skills, hooks, and workflows for AI agents (Claude Code, Cursor, Codex).

## Usage

No install required — run with `npx`:

```sh
npx cyber-skills <command>
```

Or pin to an exact version for reproducible hooks:

```sh
npx cyber-skills@0.7.0 <command>
```

## Commands

### Skill registry

```sh
# Install skills from a GitHub repo or npm package
npx cyber-skills add cyberuni/cyber-skills          # all skills from a repo
npx cyber-skills add cyberuni/cyber-skills:commit   # one skill by name
npx cyber-skills add @my-org/my-skills              # from an npm package
npx cyber-skills add --global cyberuni/cyber-skills # install to ~/.agents/skills

# Search for skills
npx cyber-skills find commit
npx cyber-skills find --in your-org/my-skills tdd

# List installed skills
npx cyber-skills list

# Update installed skills
npx cyber-skills update            # all
npx cyber-skills update commit     # one by name

# Remove a skill
npx cyber-skills remove commit
```

### Hooks

Register a session-start instruction hook in agent settings (`.claude/settings.json`, `.cursor/hooks.json`):

```sh
# Inject a file as context on every session start
npx cyber-skills hook register --name my-rules --file AGENTS.md

# Inject a glob of files
npx cyber-skills hook register --name docs --glob "docs/**/*.md"

# Extract a specific section from a markdown file
npx cyber-skills hook register \
  --name commit-discipline \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

Run a hook (called by the agent on `SessionStart`):

```sh
npx cyber-skills hook run --name my-rules --file AGENTS.md
npx cyber-skills hook run --name commit-discipline --extract AGENTS.md --heading "Commit Discipline"
```

### Governances

Version-pinned agent-tool contracts. Agents read these at runtime via `governance show`.

```sh
npx cyber-skills governance list
npx cyber-skills governance show skill-design
npx cyber-skills governance show agent-tool-output
```

Available governances: `agent-tool-output`, `cli-resolution`, `skill-design`, `skill-repo-structure`, `universal-plugin`.

### Skill utilities

```sh
# List skills visible to agents (repo, global, package)
npx cyber-skills skill list

# Find which source repo an installed skill came from
npx cyber-skills skill source commit

# Validate repo-private skills under .agents/skills/
npx cyber-skills skill validate-private
npx cyber-skills skill repair-private
```

### Audit

Validate a skill against structural and quality checks (S1–S5, Q1–Q5, Q10–Q11, E1–E2, E6, E9):

```sh
npx cyber-skills audit validate --path .agents/skills/my-skill
npx cyber-skills audit validate            # all skills in the repo
```

### Output formats

Most commands accept `--format`:

| Value   | Use case                              |
|---------|---------------------------------------|
| `text`  | Human-readable (default)              |
| `json`  | Machine-readable structured output    |
| `agent` | Optimized for agent stdout parsing    |

## Shipped skills

The package bundles a curated set of skills installable via `npx cyber-skills add cyberuni/cyber-skills`. See the [full list](https://cyberuni.github.io/cyber-skills/skills/overview/) on the docs site.

## License

MIT
