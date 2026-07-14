# cyberfleet

[![npm version](https://img.shields.io/npm/v/cyberfleet.svg)](https://www.npmjs.com/package/cyberfleet)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The fleet layer on top of [cyberlegion](../cyberlegion). It carries only fleet-specific logic — ships, missions, and the Council view — derived from SDD state. The mechanism verbs (register, send, inbox, spawn, prune, …) are **not** re-exposed here; run those directly through the `cyberlegion` CLI it depends upon.

## Usage

No install required — run with `npx`:

```sh
npx cyberfleet <command>
```

Or pin to an exact version:

```sh
npx cyberfleet@0.1.0 <command>
```

## Commands

```sh
# Who needs the Council's hands — ships × mission × gate × leash, derived from SDD state
npx cyberfleet missions
npx cyberfleet missions --agents-root <path>

# Select/focus a ship's session (tmux pane), or print its worktree path to cd into
npx cyberfleet jump <peer>

# Pause a ship's mission — a cyberfleet-level status marker only (NOT the SDD pause-mission checkpoint)
npx cyberfleet pause <peer>

# SDD gate operations
npx cyberfleet gate approve <cr> <gateName>   # Council ratification — STUBBED, not safely relayable via CLI
```

`<peer>` accepts a handle, id, or worktree branch / CR ref.

## Global options

| Option              | Description                                                        |
|---------------------|-------------------------------------------------------------------|
| `--root <path>`     | cyberlegion hub root (overrides the global hub / `$CYBERLEGION_ROOT`) |
| `--space <path>`    | Alias for `--root`                                                 |
| `--format <format>` | Output format: `toon` (default) or `json`                         |

## Notes

- **`pause` is not a mission checkpoint.** It only flips a ship's `AgentRecord.status`. To checkpoint an actual mission (rewrite the plan brief's todos / `## NEXT` anchor), run `sdd:pause-mission` in-session.
- **`gate approve` is stubbed.** Human-attributed Council ratification cannot be safely relayed through this CLI.

## License

MIT
