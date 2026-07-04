# cyberfleet — harness-agnostic agent sessions + messaging, MCP-free

## Context

You want, for the cyberspace foundation, a way to **create new agent sessions and
message between them** — where a Claude Code session can talk to a Cursor or Codex session
and back — controllable from inside a harness, and **without MCP** (security: no server, no
port, no daemon). This replaces `mcp-agent-mail`.

The reference (`kunchenguid/firstmate`) confirms the shape: **filesystem state + shell/CLI
interface + hook surfacing**. That is MCP-free (any harness can run a shell command) and
harness-agnostic (nobody speaks a vendor protocol — just shared files + one CLI). This repo
already has both pillars: an MCP-free CLI (commander, domain-per-folder) and a per-vendor hook
mapping (`build-definition.ts` / `vendors.json`) that already spans Claude/Cursor/Codex.

## Decisions (locked)

| Axis | Choice |
|---|---|
| Metaphor / verbs | **fleet** — sessions are ships; verbs stay literal for agent legibility |
| Engine home | **new `packages/cyberfleet` CLI package** — runtime orchestration is a 3rd concern, distinct from cyberplace (marketplace) and universal-plugin (plugin authoring) |
| Skill + hooks home | **cyberspace plugin** — comms is base infra the specialized plugins (SDD, ACED, Quill) build on; that is cyberspace's stated role |
| Transport | **project-scoped `.cyberfleet/`** at repo root, gitignored |
| Delivery | **pull via hooks** — SessionStart injects unread inbox; PostToolUse re-checks (Claude/Codex). No daemon. Live `send` nudge + watcher = phase 2 |
| Process | **SDD mission, spec-first** — new `fleet/` capability in the cyberspace spec, `.feature` behavior, gate, then build impl |

Naming hierarchy: **cyberuni** (family) → **cyberplace** (repo + marketplace CLI) →
**cyberspace** (foundation plugin); **cyberfleet** = the new runtime-orchestration CLI, a peer
of universal-plugin. The cyberspace `fleet` skill offloads to the `cyberfleet` CLI exactly as
today's cyberspace skills offload to the `universal-plugin` CLI.

## Architecture (three layers)

```
transport  .cyberfleet/  (files; source of truth; git-diffable, no server)
interface  cyberfleet <cmd>  (the only executable surface — a shell command, so MCP-free + harness-agnostic)
surfacing  hooks: SessionStart injects inbox; PostToolUse re-checks (Claude/Codex)
```

Cross-harness works because a Claude session addressing a Cursor peer just writes a file into
`.cyberfleet/inbox/<cursor-id>/`; the Cursor session's `sessionStart` hook (mapped by
`vendors.json`) runs the same `cyberfleet inbox --hook` and picks it up. No vendor-specific
protocol anywhere.

### Break points already solved (from design pass)

- **Self-identity recall** (no env var a process can set for itself): pane-keyed self file
  `panes/<TMUX_PANE>.id`; `$TMUX_PANE` is present on every in-tmux call → self-recovering,
  single-writer, collision-free. Non-tmux fallback: `$CYBERFLEET_AGENT_ID` / `.cyberfleet/self`.
- **Harness detection**: `tmux display-message -p '#{pane_current_command}'` → `claude` /
  `cursor-agent` / `codex` (robust, no env guessing); `--harness` overrides.
- **Message ordering + collision-free** (shared worktree doctrine, ADR-0020): filename
  `<epochMs>-<hex>.json` → lexical sort == chronological, hex suffix never clobbers.
- **Ack without races**: recipient is the sole writer of its own read-state — ack = move
  `inbox/<me>/<msg>.json` → `inbox/<me>/read/<msg>.json`. No shared mutable file exists.
- **Liveness/GC**: `lastSeen` heartbeat on every CLI call + tmux pane-existence death signal;
  `cyberfleet prune` marks `exited` and sweeps read mail.
- **Brief delivery on spawn**: via the spawnee's SessionStart hook, **not** `send-keys` —
  robust to prompt state (firstmate types into the pane; we don't).

## `.cyberfleet/` schema (one logical writer per file)

```
.cyberfleet/
  agents/<id>.json            # writer = the agent (self)
  panes/<pane>.id             # writer = the one pane; text file = the agent id
  inbox/<recipient-id>/
      <epochMs>-<hex>.json    # writer = sender (unique hex → never clobbers)
      read/<epochMs>-<hex>.json  # writer = recipient only (ack = move here)
  data/<id>/brief.md          # writer = spawner; injected at spawnee SessionStart
  data/<id>/report.md         # phase 2
  threads/                    # phase 2
```

- `agents/<id>.json`: `id`, `handle`, `harness` (claude|cursor|codex), `cwd`, `worktree`
  ({root,branch}), `tmux` ({pane,window,session}|null), `pid?`,
  `status` (spawning|active|idle|stale|exited), `createdAt`, `lastSeen`, `brief?`, `spawnedBy?`.
- `inbox/.../<epochMs>-<hex>.json`: `id`, `from`, `fromHandle`, `to`, `subject?`,
  `body` | `bodyRef`, `thread?`, `replyTo?`, `ts`, `sentAt`.

## `cyberfleet` CLI surface

Standalone binary (verbs are top-level; the whole tool *is* fleet). Markdown output via a
shared output helper (JSON hurts agent reasoning — the repo's CLI-output research); `--space`/
`--root` override the transport root.

- `cyberfleet register [--handle <h>] [--harness <c|cu|co>]` → resolve identity, write
  `agents/<id>.json` + `panes/<pane>.id`, print id + handle.
- `cyberfleet who [--all] [--stale]` → markdown table of the registry.
- `cyberfleet send --to <handle|id> [--subject <s>] [--body <t> | --body-file <path|->]
  [--thread <id>] [--reply-to <msg>]` → write one inbox file.
- `cyberfleet inbox [--unread] [--from <id>] [--hook --event <SessionStart|PostToolUse>]`
  → markdown list; `--hook` emits the SessionStart JSON payload instead.
- `cyberfleet read <msg-id> [--all]` → print body, move msg → `read/`.
- `cyberfleet spawn --harness <h> --task <t|-> [--handle <h>] [--brief-file <p>]` → tmux split,
  pre-register spawnee, write brief, launch the harness CLI.
- `cyberfleet prune` → GC stale agents, sweep read mail.
- `cyberfleet install --agent <harness>` → wire the hooks into that harness's config (see below).
- `cyberfleet watch` → **phase 2**, zero-token bash poll + nudge.

## Spawn (generalizes the tmux `new-right` script)

1. `PANE=$(tmux split-window -h -c "$PWD" -P -F '#{pane_id}')`.
2. Pre-register spawnee: allocate id, write `agents/<id>.json` (harness, tmux.pane=PANE,
   status=spawning, spawnedBy=self), write `panes/<PANE>.id`, write `data/<id>/brief.md`.
3. `tmux send-keys` the launch: claude → `claude`, cursor → `cursor-agent`, codex → `codex`
   (keep a per-harness launch map; exact non-Claude commands verify at build).
4. The spawnee's SessionStart hook resolves self by pane → finds pre-registered id + brief →
   injects `brief.md` + unread inbox, flips status to active. The brief travels via the hook,
   never via typed keystrokes.

## Surfacing / hook wiring

- **Emitter** (cyberfleet owns it), mirroring `hook/runtime/inject-instructions.ts`:
  `cyberfleet inbox --hook --event <...>` resolves self, reads unread inbox, emits the existing
  `{ hookSpecificOutput: { hookEventName, additionalContext } }` payload. Do **not** add a
  generic `--command` source to cyberplace's `hook` domain (arbitrary-exec surface).
- **Registration** reuses the per-vendor mapping the repo already has (`build-definition.ts` +
  `vendors.json`): SessionStart → claude `SessionStart`, cursor `sessionStart`, codex
  `SessionStart`; PostToolUse → claude + codex only (Cursor omitted). Two wiring paths:
  - **Plugin auto-wire (MVP primary):** the cyberspace plugin ships `hooks/hooks.json` (built
    per-vendor by the universal-plugin build) whose body is `npx cyberfleet@<ver> inbox --hook
    --event <...>`. Installing the plugin wires every detected harness.
  - **Manual `cyberfleet install --agent` (CLI path):** reuses cyberplace's hook-registration
    engine. **Integration task:** extract `registerHooks()` + the vendor event mapping into a
    shared module both `cyberplace` and `cyberfleet` import (or, MVP-cheap, `cyberfleet install`
    shells out to `cyberplace hook register`). Flag: this is the one real cross-package seam.
- **Validate at build:** confirm Cursor `sessionStart` and Codex accept `additionalContext`,
  and that PostToolUse injection is honored, before relying on mid-session surfacing.

## MVP vs phase 2

**MVP:** identity (`register`/`who` + pane self-id + harness detect) · messaging
(`send`/`inbox`/`read` + ack-by-move) · SessionStart inbox injection · tmux `spawn` with
brief-via-hook · `.cyberfleet/` gitignored · the `fleet` gateway skill · plugin auto-wire.
All files + CLI, no server.

**Phase 2:** PostToolUse hardening · live `send` tmux nudge · `cyberfleet watch` · threads +
`report.md` · `~/.cyberfleet/<project-hash>` cross-worktree/cross-repo root · Copilot CLI ·
standalone `install --agent` (if not done in MVP).

## Files to create / modify

**New package `packages/cyberfleet/`** (mirror `packages/cyberplace` layout: `bin/` shim →
tsdown-built `dist/cli.mjs`, `package.json`, tsconfig):
- `src/cli.ts` (commander program; top-level verbs)
- `src/paths.ts` (resolve `.cyberfleet` root + subdirs)
- `src/identity.ts` (harness detect + self-resolve)
- `src/registry.ts` (agents CRUD, who, prune)
- `src/message.ts` (send / inbox / read / ack)
- `src/spawn.ts` (tmux spawn per harness)
- `src/runtime/inject-inbox.ts` (hook emitter)
- `src/output.ts` (markdown helpers — copy/share cyberplace's)
- co-located `*.test.ts` for identity, message, registry, spawn

**Modify:**
- `packages/cyberplace/src/hook/register.ts` — export `registerHooks(defs, opts)` for reuse
  (or extract the vendor-mapping + register engine into a shared module both CLIs import)
- root `.gitignore` — add `.cyberfleet/`
- `pnpm-workspace.yaml` / `turbo.json` — register the new package

**Skill (cyberspace plugin) — create** (author via ACED `define-skill`):
- `plugins/cyberspace/skills/fleet/SKILL.md` — gateway: register on start, check inbox, ack,
  send etiquette, spawn a peer; harness-agnostic; note the Cursor PostToolUse gap.
- `plugins/cyberspace/skills/fleet/README.md`
- plugin `hooks/hooks.json` (built per-vendor) pointing at `cyberfleet inbox --hook`

**Spec nodes — new top-level `fleet/` capability** (per the cyberspace placement rule: a new
capability is a top-level folder, never nested under bootstrap/plugin):
- `.agents/specs/cyberspace/fleet/README.md` (descriptive index)
- `.agents/specs/cyberspace/fleet/identity/{README.md,identity.feature}`
- `.agents/specs/cyberspace/fleet/messaging/{README.md,messaging.feature}`
- `.agents/specs/cyberspace/fleet/spawn/{README.md,spawn.feature}`
- `.agents/specs/cyberspace/fleet/surfacing/{README.md,surfacing.feature}`
- modify `.agents/specs/cyberspace/spec.md` — add fleet to the Capability map + Placement map

## Execution (SDD, spec-first)

1. `start-mission` on the cyberspace project (`.agents/specs/cyberspace/`) — open a change
   request for the new `fleet/` capability. Author `spec.md` + `.feature` behavior per node
   (identity, messaging, spawn, surfacing). Spec gate → freeze.
2. Build impl from the frozen spec: the `cyberfleet` CLI package + the `fleet` skill + hook
   wiring. Impl gate.
3. The engine (`cyberfleet` package) is the impl the `fleet` capability offloads to — spec the
   behavior, not the impl (do not hand-author against a spec at runtime).

## Verification (end-to-end)

- **Unit:** `pnpm --filter=cyberfleet test` — identity resolution, ack-by-move collision-free,
  inbox ordering, harness detection.
- **Two-session smoke (same harness):** in tmux, session A `cyberfleet register --handle a`;
  `cyberfleet spawn --harness claude --task "reply to a"` → session B autostarts, its
  SessionStart hook injects the brief; B runs `cyberfleet send --to a --body "done"`; A's next
  `cyberfleet inbox --unread` (or SessionStart) shows it. Ack with `cyberfleet read`.
- **Cross-harness:** repeat with `--harness cursor` for B; confirm A (claude) ↔ B (cursor)
  exchange via the shared `.cyberfleet/` files and each harness's own sessionStart hook.
- **Hook payload:** run `cyberfleet inbox --hook --event SessionStart` and confirm the emitted
  JSON matches the shape the repo already emits; verify Cursor + Codex accept it.
- **MCP-free check:** confirm no process persists after commands return (`ps`), no port opened,
  state is only files under `.cyberfleet/`.
- Repo gate before commit: `pnpm verify` (typecheck + lint + test + audit).
```
