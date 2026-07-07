# CR-B — relay-governance (design)

Third of three CRs (A1 → A2 → B). A1 gave a frameless agent a durable standing inbox; A2 gave the
human the read path (surfacing + owner mailbox). B is the **contract** that routes a headless agent's
report/ask to the right transport.

## Why

The headless "batch `needsInput` and relay up" rule was duplicated across `headless-legate`,
`sdd-automaton`, and `dispatch-governance`, and it was **wrong for a bare cron session** — a
top-level scheduler-started agent has no spawner frame to return `needsInput` to. Its only path is to
push mail to a durable owner inbox and exit (A1) → surface to the human (A2). Factor one contract,
keyed on the reporting agent's own lifecycle.

## What (plugin artifacts — authored directly)

The `cyberlegion` **plugin** spec is `status: draft` with `.feature` suites explicitly *owed* (none
`@frozen`); its skills were authored ahead of their suite. CR-B follows that pattern — no frozen-suite
gate (the full `dispatch.feature` remains separately owed); the descriptive `dispatch/` spec prose is
updated to keep it in sync.

- **New `plugins/cyberlegion/skills/relay-governance/SKILL.md`** (+README) — the report/ask contract:
  one probe ("who collects my return?"), three lifecycle classes (subagent → return `needsInput`;
  spawned peer/channel → packet or mail-thread reply; bare top-level/cron → `mail send` to the
  standing owner + exit). Frameless recipient resolution (`--report-to` → `$CYBERLEGION_OWNER` → hub
  standing owner) and **fail-loud** when none resolves. "Read is a deliberate ack; surfacing is not a
  receipt."
- **Slim `plugins/cyberlegion/agents/headless-legate.md`** — drop the restated batch/`run-inline`
  prose (now in relay-governance); keep the muster loop (fan-out N briefs, concurrency cap, collect
  all), stateless-per-muster, no-Legate-spawns-Legate; load `relay-governance`.
- **Rewire `plugins/cyberlegion/skills/dispatch-governance/SKILL.md`** — the `needsInput` result note
  loads `relay-governance` for transport; dispatch keeps owning *strategy* (channel/run-inline/
  subagent), relay owns *how the result gets home*.
- **New user-facing `plugins/cyberlegion/skills/manage-inbox/SKILL.md`** (+README) — the human's
  owner-mailbox surface (list/read/ack/reply via `mail --owner`); read is a deliberate ack.
- **`.agents/specs/cyberlegion-plugin/dispatch/README.md`** — describe relay-governance as a covered
  concern (placement map: relay is a dispatch-node concern) + a behavior-map row.

## Follow-ups (out of scope)
- `sdd-automaton` and the aced judges adopting `relay-governance` (they carry the same duplicated
  prose) — cross-plugin, separate CR once this lands.
- The full owed `dispatch.feature` / `gateway.feature` suites for the plugin — pre-existing owed work.
- A headless opt-out so a frameless *autonomous* session (no `spawnedBy`) can suppress owner-mail
  surfacing (the A2 architect observation).
