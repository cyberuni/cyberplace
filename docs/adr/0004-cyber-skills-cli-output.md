# ADR-0004: cyber-skills CLI Output Architecture

## Status

Accepted

## Context

The `cyber-skills` CLI serves both terminal users and agents invoking subcommands from skills. Agents parse stdout programmatically; humans expect tables, aligned fields, and prose summaries.

General output rules for agent-invoked tools live in the version-pinned governance `agent-tool-output`, loaded via `governance show agent-tool-output`. That governance must stay normative and self-contained for skill authors (per [ADR-0003](0003-agent-first-authoring.md)). Package-specific patterns — which subcommands use which output mode, the shared `output()` helper, and when default stdout is the agent contract — belong in a contributor-facing decision record, not in the governance body.

## Decision Drivers

- **Separation of concerns** — general rules in governance; repo-specific CLI mapping in ADR.
- **Agent-first governances** — no cyber-skills implementation tables in agent-loaded standards.
- **Dual audience** — most subcommands must remain pleasant for humans while offering `--format json` for agents.
- **Hook runtime** — SessionStart hooks are agent-only; always-JSON stdout is appropriate.
- **Governance loading** — agents load governance bodies via `governance show <name>` without `--format json`; default stdout is the markdown contract.

## Considered Options

### Option 1: Single always-JSON CLI

All subcommands emit JSON on stdout by default.

- **Pros**: One agent contract; simple parsing.
- **Cons**: Poor human UX at the terminal; breaks interactive discovery workflows.

### Option 2: Single dual-audience pattern everywhere

All subcommands use `output()` with `--format json`; including `governance show` default mode.

- **Pros**: Uniform `--format json` rule in governance.
- **Cons**: Forces agents to parse JSON wrappers to read governance markdown; extra friction for the most common agent load path.

### Option 3: Three output archetypes (chosen)

Map each subcommand to one of: dual-audience (`output()`), always-JSON (hook runtime), or markdown-on-stdout (`governance show` default).

- **Pros**: Matches current implementation; optimizes each use case; keeps general governance simple with one documented exception.
- **Cons**: Contributors must know which archetype applies when adding commands.

## Decision

Adopt **three output archetypes** for the cyber-skills CLI:

| Archetype | When | Agent contract | Implementation |
| --- | --- | --- | --- |
| **Dual-audience** | Most subcommands (`audit`, `awesome`, `commit`, `governance list`, `hook register`, …) | Pass `--format json`; parse stdout JSON | `output(data, readable)` in `src/output.ts` |
| **Always-JSON** | Agent-only runtime hooks | Single JSON value on stdout | `hook run` via `process.stdout.write` in `src/hook/runtime/inject-instructions.ts` |
| **Markdown-on-stdout** | `governance show <name>` default mode | Read markdown body from default stdout (no `--format json`) | `src/governance/cli.ts` — intentional exception; skills document this explicitly |

General rules for skill `scripts/` and dual-audience CLIs remain in governance `agent-tool-output`. This ADR records how cyber-skills applies them.

## Rationale

Option 3 preserves human-friendly default output for discovery and day-to-day CLI use while giving agents a stable structured path via `--format json`. `governance show` without `--format json` keeps the primary agent workflow for loading standards a single command whose stdout is the authoritative markdown body. Hook runtime stays always-JSON because humans never invoke it interactively.

## Consequences

### Positive

- Governance body stays general and agent-first; no package-specific tables.
- Contributors have an explicit subcommand inventory and helper contract.
- Audit checks Q10–Q12 continue to enforce general rules from governance without coupling to CLI internals.

### Negative

- Three patterns to learn when adding new subcommands.
- `governance show` default mode is an exception to the dual-audience `--format json` default rule — SKILL.md must document it per governance.

### Risks

- New subcommands may pick the wrong archetype — mitigated by this ADR inventory and code review.

## Implementation Notes

### `output()` helper (`src/output.ts`)

- When `--format json` is in `process.argv`, emit `JSON.stringify(data)` to stdout.
- `--json` is accepted as a hidden backward-compat alias; new code and skill docs must use `--format json`.
- Otherwise run the `readable()` callback (human tables via `printFields` / `printTable`, or prose).
- Errors go to stderr; exit non-zero on failure.

### Verbosity

- `--verbose` gates human diagnostics on stderr (for example dry-run summaries in `hook register`, status in `commit inject`).

### Prefer CLI over skill scripts

When adding cyber-skills workflows to a skill, prefer `npx cyber-skills@<version> …` CLI subcommands over new bundled `scripts/`.

### Subcommand inventory

| Pattern | Example |
| --- | --- |
| Dual-audience `--format json` | `awesome find "<query>" --format json` — agents pass `--format json`; default output is human prose |
| Dual-audience `--format json` | `audit validate --path skills/my-skill --format json` |
| Always-JSON stdout | `hook run` — SessionStart payload via `process.stdout.write` |
| Markdown-on-stdout | `governance show agent-tool-output` — markdown body on stdout for agent consumption |
| Dual-audience `--format json` | `governance show agent-tool-output --format json` — structured wrapper when programmatic metadata is needed |

## Related Decisions

- [ADR-0001: Governance vs Discipline Taxonomy](0001-governance-vs-discipline-taxonomy.md) — governance load model
- [ADR-0003: Agent-first Authoring](0003-agent-first-authoring.md) — why CLI specifics moved out of governance
