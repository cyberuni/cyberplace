---
name: write-vendor-config
description: Use this skill to write per-harness agent config files (CLAUDE.md, Cursor, Codex, Copilot) directly from AGENTS.md by hand, without the universal-plugin CLI. Use when wiring vendor config manually, when npx is unavailable or declined, or when a user asks to set up the harness config files directly rather than via the tool.
---

# write-vendor-config — write per-harness agent config directly

Write each targeted agent harness's configuration file from `AGENTS.md` **by hand**, without the
`universal-plugin` CLI. This is the manual fallback the `init` skill routes to when the user declines running
`npx`, and a standalone entry when someone wants the by-hand path.

The preferred wiring is `init`'s CLI-offload step (`universal-plugin sync`) — if the user is fine running the
CLI, that path is better and this skill defers to it. This skill exists for the no-CLI case.

## 1. Detect the harnesses in play

Write config only for the harnesses the project actually targets — do not blindly write all four. Treat any of
these as a signal that a harness is targeted:

- a vendor directory is present (`.cursor/`, `.codex/`, `.github/`),
- a vendor config file already exists, or
- the user names the harnesses to configure.

If **no harness can be detected and the user named none**, ask which harnesses to configure rather than writing
files blindly.

## 2. Write each vendor's file from AGENTS.md

For each targeted harness, write its config file in that vendor's own shape, grounded in `AGENTS.md` rather than
invented:

| Harness | File |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | prefer `.cursor/rules/`; use a legacy `.cursorrules` only when the repo already uses it |
| Codex | the Codex agent-config file the repo uses |
| GitHub Copilot | `.github/copilot-instructions.md` |

Derive each file's content from `AGENTS.md`; do not fabricate rules the source does not contain.

## 3. Stay idempotent

- If a targeted vendor file **already matches** what you would write, leave it unchanged.
- If it **substantively differs**, ask the user before overwriting it — never overwrite silently.

## 4. Never shell out to the CLI

This is the no-CLI path. Write the files directly with your file tools. Do **not** invoke `npx universal-plugin`
or any `universal-plugin` subcommand — offloading to the CLI is `init`'s step, not this skill's.

## Report

State which harnesses were detected or named, which vendor files were written, updated, left unchanged, or
skipped pending confirmation, and confirm no CLI was invoked.
