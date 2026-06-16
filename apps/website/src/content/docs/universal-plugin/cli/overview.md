---
title: CLI Overview
description: The universal-plugin CLI — commands and output formats.
---

The `universal-plugin` CLI transforms a canonical `.plugin/plugin.json` into vendor-specific manifests.

## Invocation

Always pin to an exact version in hooks and CI:

```bash
# One-off
npx universal-plugin@latest --help

# Scripting (pin)
npx universal-plugin@$(npm view universal-plugin version) <command>
```

## Commands

| Command | Purpose |
|---|---|
| [`build`](/cli/build/) | Generate vendor manifests from `.plugin/plugin.json` |

## Output formats

Most subcommands accept `--format`:

| Value | Consumer | Output |
|---|---|---|
| _(default)_ | Humans | Tables, aligned fields |
| `--format json` | Scripts / pipelines | Flat JSON |

`--json` is a deprecated alias for `--format json`.
