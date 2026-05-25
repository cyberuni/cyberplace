# Agent Tool Output

Rules for scripts, hooks, and CLIs that AI agents invoke. Apply when authoring skill `scripts/`, documenting CLI commands in SKILL.md, or building tools in the cyber-skills CLI.

## Why

Agents parse stdout programmatically. Mixing human prose, progress spinners, or prompts on stdout causes misreads, brittle parsing, and silent failures. Separate machine contracts from human diagnostics.

## Agent-native tools

Use for skill `scripts/`, hook runtime commands, and any tool where the primary consumer is always an agent.

### Stdout is the machine contract

- Emit **one JSON value** per run, or silence on success with no payload.
- Use `process.stdout.write(JSON.stringify(result) + '\n')` — never `console.log` for contract output.
- No prose, tables, progress bars, or ANSI decoration on stdout in default mode.

### Stderr is human/diagnostic

- Use `console.warn`, `console.error`, or `process.stderr.write` for diagnostics.
- Gate tables, progress, and verbose human output behind a `--verbose` flag.

### Files hold durable state

- Write artifacts to disk; stdout JSON names paths or fields only.
- Agents read artifact files by path (from stdout JSON or SKILL.md), not by scraping stdout prose.

### Skills present; tools record

- SKILL.md tells the agent which file or JSON field to read.
- The agent summarizes results for the user — the tool does not format user-facing prose on stdout.

### Autonomous runs

- Document `--yes` or an equivalent non-interactive flag when the tool can prompt.
- Never put interactive prompts on stdout.
- Agents must be able to run the tool without human input.

### Exit codes

- `0` = success.
- Non-zero = failure; include a concise error on stderr.

## Dual-audience CLI

Use for command-line tools used by both humans and agents (e.g. `cyber-skills` subcommands).

### Default stdout = human-readable

- Tables, aligned fields, and prose summaries are fine for interactive terminal use.

### `--json` = machine contract

- Agents **must** pass `--json` when they need structured output.
- `--json` stdout is the only machine-parseable contract; default stdout is not.
- SKILL.md must instruct agents to use `--json`, not to parse default prose or tables.

### Stderr and verbosity

- Errors and validation failures go to stderr.
- Optional human status (dry-run summaries, registration tables) goes to stderr when `--verbose` is set.

### Same non-interactive and exit-code rules

- Document `--yes` / non-interactive paths where prompts exist.
- Exit `0` on success; non-zero on failure.

## SKILL.md authoring

When a skill documents commands agents run:

- Tell agents which flag produces machine output (`--json` for dual-audience CLI).
- Do **not** instruct agents to parse default stdout prose, summary tables, or generic "script output" as data.
- Prefer: "read `<artifact-path>`" or "parse stdout JSON" or "run with `--json` and parse the array."

## Reference implementations (cyber-skills package)

Patterns specific to this package — not general guidance for all skill authors:

| Pattern | Example |
| ------- | ------- |
| Dual-audience `--json` | `output()` helper — default human tables/fields; `--json` emits structured JSON |
| Always-JSON stdout | `hook run` — SessionStart payload via `process.stdout.write` |
| Agent loads governance | `governance show agent-tool-output` — markdown body on stdout for agent consumption |
| Agent search | `awesome find "<query>" --json` — agents pass `--json`; default output is human prose |

When adding cyber-skills workflows to a skill, prefer `npx cyber-skills@<version> …` CLI subcommands over new bundled `scripts/`.
