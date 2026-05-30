---
title: CLI Overview
description: The cyber-skills CLI — commands, output formats, and pinning.
---

The `cyber-skills` CLI is used by skills under the hood. You can also invoke it directly for scripting and advanced workflows.

## Invocation

Always pin to an exact version — never use `@latest` in hooks or CI:

```bash
# Explore (OK for one-off investigation)
npx cyber-skills@latest --help

# Scripting (pin to current version)
npx cyber-skills@$(npm view cyber-skills version) <command>
```

## Commands

| Command | Purpose |
| ------- | ------- |
| [`audit`](/cli/audit/) | Validate skills against structural, quality, and security checks |
| [`governance`](/cli/governance/) | List and display version-pinned governance documents |
| [`hook`](/cli/hook/) | Register and run SessionStart instruction hooks |
| [`skill`](/cli/skill/) | List, validate, and repair skills |

## Output formats

Most subcommands accept `--format`:

| Value | Consumer | Output |
| ----- | -------- | ------ |
| _(default)_ | Humans | Tables, aligned fields, prose |
| `--format agent` | AI agents / LLMs | Terse text — lower token cost, better reasoning |
| `--format json` | Scripts / pipelines | Flat JSON for programmatic parsing |

Skills should use `--format agent`. Non-LLM automation should use `--format json`. `--json` is a deprecated alias for `--format json`.

## Pinning in hooks

The `init-commit-discipline` skill resolves the current npm version and writes it into the SessionStart hook command. After upgrading, re-run `init-commit-discipline` to bump the pin:

```bash
npx cyber-skills@0.3.0 hook register \
  --name commit-discipline \
  --event SessionStart \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```
