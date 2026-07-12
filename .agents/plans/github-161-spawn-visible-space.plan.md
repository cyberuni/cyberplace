---
cr: github-161-spawn-visible-space
source: https://github.com/cyberuni/cyberplace/issues/161
target-spec: packages/cyberlegion/.agents/spec
status: active
todos:
  - content: "intake — CR opened, leash recorded, plan scaffolded"
    status: completed
  - content: "explore — draft mux + lifecycle spec diff; spike the code change"
    status: pending
  - content: "spec gate — reconcile frozen mux default scenario + README; freeze"
    status: pending
  - content: "deliver — session.ts conditional default, cli.ts, tmux adapter workspace->new-window; per-scenario verify"
    status: pending
  - content: "impl gate — cold impl-judge over frozen scenarios; root pnpm verify"
    status: pending
  - content: "handoff — PR that Closes #161; mail legate"
    status: pending
---

# github-161 — spawn defaults a ship to its own VISIBLE space

**CR:** https://github.com/cyberuni/cyberplace/issues/161

Two coupled defects in `cyberlegion unit spawn` placement:

1. `--at` defaults to `tab` unconditionally → new-worktree ships pile nondeterministically
   into the currently-focused herdr workspace. Fix: a **new-worktree** spawn (not `--cwd`)
   defaults `--at` to `workspace` (own isolated, visible space, mapped per-mux). `--cwd`
   spawns keep the `tab` default. Explicit `--at` always overrides.
2. tmux `--at workspace` maps to `new-session -d` — an invisible detached session. Fix:
   map to `new-window -d` (visible in the status bar, `select-window`-able, no focus-steal).
   Under tmux `workspace` and `tab` collapse to *window* (tmux has no Workspace tier).

## Spec surface

- **mux/mux.feature** (frozen) — RE-OPEN the `omitting --at defaults to tab` scenario
  (now conditional on spawn mode); ADD tmux `--at workspace` → visible window (not detached
  session). Reconcile `mux/README.md` concept table + prose ("tmux maps workspace → Session"
  is now false → Window).
- **unit/lifecycle/lifecycle.feature** (frozen) — ADD: new-worktree spawn with no `--at`
  defaults to own visible space (workspace); `--cwd` spawn with no `--at` stays tab;
  explicit `--at` honored either way. (Additive — self-clears.)

## Code

- `session.ts` ~line 141-171 — resolve the default per spawn mode: new-worktree branch
  `input.at ?? 'workspace'`, `--cwd` branch `input.at ?? 'tab'`.
- `cli.ts` ~line 228 — drop the hard `.default('tab')` on `--at` so `opts.at` is undefined
  when unset (session.ts owns the mode-keyed default).
- `console/session.tmux.ts:16` — `workspace` → `new-window -d` (collapses with `tab`).
- herdr `workspace` mapping already correct (`herdr worktree create`), unchanged.

## Coordination

Base includes #158/PR #160 (focus beaming) — merged. tmux focus now uses
`switch-client`/`select-window`/`select-pane`, which RELIES on ships being windows not
detached sessions; the tmux `workspace` → window change reinforces it. Sibling ship `bunker`
(#159 mail, #162 verify-effect) touches nudge/mail delivery in the same adapter files —
different functions, soft overlap; don't collide.

## NEXT

Explore: dispatch/author the mux + lifecycle spec diff, spike the code change on both
adapters (herdr already correct; tmux new-window), run cyberlegion tests to validate, then
dispatch the cold spec-judge and take the spec gate.
