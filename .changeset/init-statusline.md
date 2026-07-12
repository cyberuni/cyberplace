---
"@cyberplace/sdd-plugin": minor
---

Add a user-invocable `sdd:init` onboarding skill and an opt-in mission statusline.

- **New `sdd:init` skill** — the onboarding front door for an SDD project (parallel to
  `sdd:sdd` and `sdd:manage`). v1 offers one opt-in convenience: the **mission statusline**.
  It asks whether to enable it and, if so, whether the mission status renders on its **own line**
  or the **same line** as any existing status line, then wires a `statusLine` command into
  **project** `.claude/settings.json` (never global) via a mechanical engine
  (`wire-statusline.mts`) that **composes with — never stomps** an existing status line, is
  idempotent, and gitignores the status file when the folder is a git repo. A decline writes
  nothing.
- **The conductor surfaces the phase.** During the mission loop only, `start-mission` overwrites
  `.agents/sdd/statusline` with the current phase on each transition and clears it on every exit
  path (handoff / pause / abort). The value is best-effort, written only while a mission is in
  flight (no heartbeat, static staleness), and is distinct from the lifecycle `status` field.
- **`sdd:manage`** routes a "set up / configure the statusline" request to `init` under its
  Setup & discovery group.
