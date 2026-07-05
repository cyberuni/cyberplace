# 0003 — Adopt the AXI output contract (principles #1–#6, #8–#10)

**Status:** accepted
**Date:** 2026-07-04

## Context

[AXI](https://github.com/kunchenguid/axi) (Agent Experience Interface) is a design framework for
agent-native CLI tools that treats the agent's token budget as a first-class constraint. It codifies
ten principles: token-efficient [TOON](https://toonformat.dev/) output, minimal default schemas,
content truncation with a `--full` escape, pre-computed aggregates, definitive empty states,
structured errors / exit codes / no prompts / fail-loud, ambient context (a session-hook setup
command plus an installable Agent Skill), content-first no-argument behavior, next-step suggestions,
and consistent per-subcommand help.

`universal-plugin` is consumed almost entirely by AI agents (build/validate/init in an agent's
project loop, `governance show` to pull a contract by name). Its output today is human-prose-first
with `--format json` as the structured escape — the inverse of what an agent wants.

## Decision

Adopt AXI principles **#1–#6 and #8–#10** as a shared output contract across every command
(`plugin build`, `plugin validate`, `plugin init`, `governance show/list`). The contract is stated
once in a new **`axi/`** reference node and referenced by each behavioral node, which carries the
concrete conformance scenarios.

Two contract choices worth recording:

- **TOON is the default; `--format json` stays.** AXI wants the token-efficient shape as the
  *default*, not the only format. The pre-existing `--format json` scenarios are preserved as an
  explicit escape hatch — nothing is narrowed away.
- **Stream discipline.** stdout carries only the machine result (the TOON or JSON payload, *including*
  its aggregate summary); stderr carries the human affordances (the next-step line, warnings,
  structured errors). This keeps `--format json | jq` and TOON parsing clean.

Principle **#7 (ambient context)** is **out of scope here and deferred** to a follow-up change
request. Its two surfaces cross this package's charter boundary (ADR-0001): session-hook wiring is
the `cyberplace` package's concern and an installable Agent Skill is the `cyberspace` / `aced`
plugins' — folding either into this deterministic build engine would re-merge concerns the realign
deliberately split. The follow-up CR routes #7 to those packages, most likely as a thin
`universal-plugin` setup command that *delegates* to the cyberplace hook + cyberspace skill rather
than owning them.

## Consequences

- The `approved` spec **re-opens to `draft`**: the four behavioral `.feature` files unfreeze so their
  scenarios can be rewritten to assert the AXI contract explicitly (TOON default, aggregates,
  empty states, next-step, fail-loud, content-first), then re-freeze at the spec gate. The re-open
  was ratified by the user in-session.
- `plugin build` and `governance` are **implemented** — their observable output genuinely changes
  (default → TOON, aggregates, next-step, `governance show` truncation), so both must be
  re-implemented and re-verified at the impl gate. `plugin validate` and `plugin init` remain
  spec-first (ADR-0001), now with AXI-shaped contracts.
- **Content-first (#8)** is satisfied at the group level without new commands: `governance` with no
  subcommand runs `list`; the `plugin` group with no subcommand runs `validate` (the project's live
  status). Bare `universal-plugin` stays a pure dispatcher and shows help.
- **`plugin init` becomes non-interactive by default (#6):** it never prompts; `--yes` degrades to a
  compatibility no-op. Existing `--yes` scenarios keep passing.
- A new cross-cutting **`concept: axi`** groups the contract node and every behavioral node in the
  by-concept index.
