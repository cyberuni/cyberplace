# write-vendor-config

Write per-harness agent config files (`CLAUDE.md`, Cursor, Codex, Copilot) directly from `AGENTS.md` **by
hand**, without the `universal-plugin` CLI. The manual fallback `init` routes to when the user declines `npx`.

## When to use

- Wiring the per-harness config manually, without the CLI
- `npx` is unavailable or the user declined it
- A user asks to set up the vendor config files directly

## What it does

- Detects which harnesses the project targets (vendor dir/file present, or the user names them); asks when none
  can be detected.
- Writes each targeted vendor's file in its own shape, grounded in `AGENTS.md`.
- Stays idempotent — leaves a matching file unchanged, asks before overwriting a differing one.
- Never shells out to the `universal-plugin` CLI.

The preferred wiring is `init`'s CLI-offload step; this skill is the by-hand path for when the CLI isn't used.

## Install

```bash
npx skills add cyberuni/cyberplace --skill write-vendor-config
```
