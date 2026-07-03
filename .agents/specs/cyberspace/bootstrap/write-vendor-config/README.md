---
spec-type: behavioral
concept: [bootstrap]
---

# write-vendor-config — write per-harness agent config directly

Write each supported agent harness's configuration file from `AGENTS.md` **by hand**, without the
`universal-plugin` CLI — the manual fallback the `init` skill routes to when the user declines running `npx`,
and a standalone entry when a user wants the direct-write path.

## Use Cases

**Fit:** strong — `write-vendor-config` makes a genuine activation decision (the by-hand path vs. the
CLI-offload path that `init` prefers) and carries non-deterministic judgment (which harnesses are present, how
each vendor's file is shaped, when an existing vendor file already matches). All four eval layers carry signal.

**Subject** — writing the per-harness config directly from `AGENTS.md`:

- **Detect the harnesses in play** — write config only for the harnesses the project actually targets (a vendor
  directory present, a vendor file already there, or the user names them), not blindly all four.
- **Write each vendor's file from `AGENTS.md`** — Claude Code (`CLAUDE.md`), Cursor (prefer `.cursor/rules/`,
  falling back to a legacy `.cursorrules` only when the repo already uses it), Codex, and GitHub Copilot
  (`.github/copilot-instructions.md`), each in that vendor's shape,
  grounded in `AGENTS.md` rather than invented.
- **Stay idempotent** — leave a vendor file that already matches unchanged; ask before overwriting one whose
  content substantively differs.
- **Never require `npx`** — this is the no-CLI path; do not shell out to `universal-plugin`.

**Non-goals** — the preferred CLI-offload wiring is `init`'s step 2 via the `universal-plugin` CLI (this skill
is only the decline fallback / explicit by-hand path); authoring `AGENTS.md` itself is `init`; publishing or
upgrading a cross-vendor plugin is `publish-universal-plugin` / `upgrade-universal-plugin`.

Every scenario in [`write-vendor-config.feature`](./write-vendor-config.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **trigger on the by-hand wiring path** | fires when `init` routes here on npx-decline, or on a direct "write my vendor config by hand" request; defers CLI-offload wiring back to `init` |
| **detect harnesses in play** | writes only for targeted harnesses, not blindly all four |
| **write each vendor file from AGENTS.md** | each vendor's file in its own shape, grounded in AGENTS.md |
| **idempotent + ask-before-overwrite** | leaves a matching file unchanged; asks before overwriting a differing one |
| **no npx** | never shells out to the universal-plugin CLI |
