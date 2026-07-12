---
cr: github-164-statusline-global-shadow
source: https://github.com/cyberuni/cyberplace/issues/164
target-spec: .agents/specs/sdd
status: active
todos:
  - content: "intake — CR opened, leash recorded (auto-all, low blast), plan scaffolded"
    status: completed
  - content: "explore — draft additive global-detection scenarios + README/SKILL prose; spike stdin replay"
    status: completed
  - content: "spec gate — cold sdd-spec-judge; classify-edit-class addOnly (self-clear, stays @frozen)"
    status: completed
  - content: "deliver — engine --detect + global-base compose + --no-global-base; tests; SKILL.md flow; rebase"
    status: in_progress
  - content: "impl gate — cold sdd-impl-judge per frozen scenario; pnpm verify"
    status: pending
  - content: "handoff — PR Closes #164; mail operator"
    status: pending
---

# github-164 — sdd:init statusline wiring silently shadows a global statusLine

**CR:** https://github.com/cyberuni/cyberplace/issues/164

`wire-statusline.mts` composes "never stomp" only against a `statusLine.command` in
**project** `.claude/settings.json`. Claude Code's project `statusLine` **replaces** the
global one (no merge), so when the user's statusline lives in global `~/.claude/settings.json`
and the project has none, the engine wraps an empty base — the wired project command shadows
the global line and the row renders blank.

## Fix intent

Before wiring, detect a global-level `statusLine.command`; **compose against it** (wrap the
global command as the base — stdin flows through the existing `__sdd_orig` substitution) by
default, and **surface the shadow + ask** at the skill level, with an opt-out that wires
without wrapping. HARD BOUNDARY (unchanged frozen scenario): never WRITE the global settings
file — detection is read-only.

## Spec surface

- **`.agents/specs/sdd/gateway/init/init.feature`** (frozen) — ADD a
  `# ---- Global statusline detection ----` section: detect global before wiring (read-only);
  fresh wire with no project statusLine composes the global command as base; wrapped base
  receives the piped status input; shadow surfaced + compose asked before wiring; declined
  global base wires without wrapping; project statusLine wins over global as base; malformed
  global settings treated as no global statusLine. All additive — self-clears, stays `@frozen`.
- **`.agents/specs/sdd/gateway/init/README.md`** — prose sync: global-detection behavior rows
  + Repo-scoped section notes read-only global detection.

## Code

- `plugins/sdd/skills/init/scripts/wire-statusline.mts` — `readStatusLineCommand(file)`
  (missing/malformed → undefined); `detectStatusLines` + `--detect` op (project
  absent|wired|foreign, global present|absent, shadow risk); fresh wire (no project
  `statusLine` key) uses the global command as base by default, `--no-global-base` opts out,
  `--global-settings <file>` overrides the path for tests; re-runs recover the wired base and
  never re-consult global (idempotency preserved).
- `plugins/sdd/skills/init/scripts/wire-statusline.test.mts` — additive tests per scenario.
- `plugins/sdd/skills/init/SKILL.md` — wiring step runs `--detect` first; on shadow risk
  surface + ask (compose default / shadow via `--no-global-base`); manual no-node fallback
  gets the same global handling; boundary reworded: global settings read-only, never written.

## NEXT

Explore: write the additive scenarios + prose, run the stdin-replay spike, then spec gate.
