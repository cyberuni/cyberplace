# CR-2 migration map — cyberlegion spec-tree realignment

> Read-only analysis produced during CR-2 explore (per ADR-0024). The **contract** for the
> restructure: which scenarios move where, verbatim vs reference-rename vs genuine rewrite. Execution
> stopped before mutating the tree (whole-tree blast radius needs a ratified spec gate + the §Judgment
> calls below need the human).

## Freeze framing (correction to the raw analysis)

The raw map marks every command-noun change (`identity *`→`unit *`, `session *`→`unit *`,
`admin doctor`→`mux doctor`, `admin install`→`init`) as a "freeze-reopen risk." That is **too strict**.
Per **ADR-0021 / the spec-dependency doctrine** (`[[project_spec_dependency_doctrine]]`): a **pure
reference-rename** in a frozen `.feature` — the command noun changes but the behavior is identical —
is a **freeze-preserving reconcile** (a Warden move), **not** a narrowing re-open. So:

- **Reference-rename (freeze-preserving):** the ~95 "R" rows whose only delta is the command noun.
  Behavior unchanged ⇒ no re-open ratification; the conductor reconciles and re-freezes under the new
  node path. `gherkin-cli diff` will show `modified`, so each is examined and confirmed
  behavior-identical, not blindly swapped.
- **Genuine re-open (needs ratified re-open):** only where behavior actually changes — the `who`/`list`
  merge (output shape) and the `admin install`→`init` dedup (may narrow/replace existing init
  scenarios). These are the real gate-able edits.
- **Pure relocations (verbatim):** ~83 rows (mostly `mail`'s absorption of wake/surfacing) that never
  named a node — `git mv`-clean, freeze intact.

## Target node set (CR-2)

`mux · unit · mail · agent · attach · init · admin` — plus root `spec.md`. `dispatch/` is **out of
scope** (CR-4 moves it to the plugin); leave it untouched.

## Per-node counts (post-move, before dedup)

| Node | survives | migrated in | new to author | total | note |
|---|---|---|---|---|---|
| `mux/` | 0 | 15 (5 session + 10 wake) | ≥2 (`mode`) | ~17 | new node |
| `unit/` | 0 | 64 (38 identity + 26 session) | 0 | **64** | oversized (advisory) |
| `mail/` | 22 | 40 (24 surfacing + 16 wake) | 0 | **62** | oversized (advisory) |
| `agent/` | 27 | 0 | 0 | 27 | untouched |
| `attach/` | 0 | 8 (identity bind-main/main) | 0 | 8 | new node |
| `init/` | 10 | 3 (surfacing install) | 0 | 13 | absorbs install |
| `admin/` | 0 | 0 | ≥4 (`migrate`) | ~4 | new node, all new |
| `dispatch/` | 22 | — | — | 22 | out of scope |

## Per-node source → target

| Current | → target(s) |
|---|---|
| `identity/` (46) | `unit/` (38) + `attach/` (8) |
| `session/` (31) | `unit/` (26) + `mux/` (5: backend-select ×3, placement ×2) |
| `surfacing/` (27) | `mail/` (24, verbatim) + `init/` (3, install — dedup) |
| `wake/` (26) | `mail/` (16, verbatim: thread/delete/await/watch) + `mux/` (10: probe + doctor) |
| `mail/` (22) | stays; absorbs wake+surfacing mail verbs; retag `concept: wake`/`surfacing` |
| `agent/` (27) | unchanged |
| `init/` (10) | stays; absorbs `admin install` |
| `dispatch/` (22) | untouched (CR-4) |

## New scenarios to author (coverage gaps found)

- **`mux/`**: `admin mode`/`mux mode` has **zero** current spec coverage (`cli.ts:797` reports the
  detected `SessionAdapter` name). Author ≥2: "mode reports the detected backend", "mode reports
  'none' when no adapter selectable."
- **`admin/`**: `migrate` (`src/admin.ts` `migrateStore`, `cli.ts:809`) has **zero** coverage. Author
  ≥4: merge agents/messages/briefs into destination; skip ids already present; re-file messages into
  destination unread; best-effort (doesn't preserve read/unread split).
- **`attach/`**: none new (all 8 seeded from identity). `attach --follow` is deferred — author nothing
  for it now.

## Cross-reference updates

- **`spec.md:28-38`** capabilities table: replace `identity`/`session`/`wake`/`surfacing` rows with
  `mux`/`unit`/`attach`/`admin`; update `mail`/`init` descriptions; keep `dispatch` row.
- **`identity/`, `session/`, `surfacing/`, `wake/` READMEs** retire (their Non-goals cross-refs retire
  with them).
- **`mail/README.md:12`** — the "delivered in legion-wake … specified in wake/wake.feature" pointer
  becomes false; rewrite as native mail behavior (`concept: wake`).
- **`init/README.md:11,38-42`** — "installer lives in surfacing/", "admin doctor (wake/)", "owner/
  bind-main (identity/)" all reference gone nodes; rewrite (init owns install; doctor/mode → mux;
  owner → unit / attach).
- **`dispatch/README.md` + `dispatch.feature`** name `session spawn` and `wake/` (`mail await`) — NOT
  CR-2 scope, but go **stale** when session→unit lands. Known follow-up for CR-3/CR-4; don't silently
  forget.

## Judgment calls (need the human — why execution paused here)

1. **`who`/`list` merge (real re-open).** `identity who` aggregate = "N agents", fields
   handle/harness/status; `session list` = "N sessions", adds `pane`. Decide the single `unit who`
   output shape, then either fold `list` into `who` or keep it only if it asserts something new
   (`pane` presence). Don't ship both aggregate lines.
2. **`admin install` → `init` dedup (real re-open).** The 3 incoming install scenarios overlap
   existing `init.feature` (SessionStart/PostToolUse/no-dup) but add codex PostToolUse coverage init
   lacks. Reconcile — extend or replace, don't blind-append.
3. **`selectWakePath` (wake.feature L134-149) placement.** Pure routing decision function, tests no
   CLI command. Recommend `mux/` for CR-2 (least disruption) but flag as a likely **CR-4** move to the
   plugin alongside `dispatch` when routing leaves the CLI.
4. **Oversized `unit/` (64) and `mail/` (62).** `check-spec-structure` treats oversized as ADVISORY,
   not blocking. Accept for CR-2 + file a formation follow-up, OR sub-split now (`unit/` → registry vs
   lifecycle; `mail/` → core vs thread/await/watch). Recommend accept-advisory + follow-up to keep
   CR-2 scoped.

## Per-scenario contract

The full per-scenario table (source file :: scenario → target | VERBATIM/REFERENCE-RENAME/REWRITE)
was produced in the CR-2 explore analysis. Regenerate cheaply by re-reading the four dissolving
`.feature` files (`identity`, `session`, `surfacing`, `wake`) against the per-node source→target above;
the only genuine REWRITEs (behavior deltas) are the two in Judgment calls #1 and #2 — everything else
is reference-rename (freeze-preserving) or verbatim relocation.

## CR-4 — retired `dispatch/` contract (carried forward)

The `dispatch/` node (result-slot primitives) was **dissolved** in CR-4 — the whole node deleted, the
routing brain relocated to the Legate plugin governance. The retired scenario set is preserved here so
CR-5 (`legion-gateway-legate`) and the deferred `mail --verdict-schema` CR start from a carried
contract, not prose memory. Each retired behavior maps to where it now lives:

**prep — envelope allocation** (all DROPPED; the plugin composes primitives directly):
- prep mints an id, defaults thread to it, writes the brief into the Store → DROPPED (no Store brief slot; caller passes the brief inline)
- an explicit `--thread` overrides the default → DROPPED
- prep computes the result-file path without creating it → DROPPED (no result slot)
- prep builds the subagent instruction from a resolved agent def → **relocated to plugin**: `subagent-backend-governance` composes it from the `agent resolve` payload
- prep falls back to a generic instruction when no agent def is given → **relocated to plugin governance**
- prep spawns nothing (no session/pane/agent record) → moot (no prep)
- an unresolvable `--agent` name fails loud → preserved by `agent resolve`'s own fail-loud (frozen `agent.feature`)
- prep requires a brief source → **plugin governance** invariant (caller supplies a brief)

**Two result channels** (the load-bearing design, now the CLI's return model):
- subagent path result = a file the parent's Task tool waits on → **CHANGED**: subagent returns via **Task-result** (the harness returns its final message); no file
- channel path result = mail on the thread, never a file → **preserved**: warm peer returns via `mail await` (frozen `mail/wait/wait.feature`)

**collect** (all DROPPED — no result file to read):
- collect reads a written result file → returns validated DispatchResult → DROPPED
- collect on a dispatch with no result file yet errors clearly → DROPPED

**verdict schema** (all DEFERRED to the `mail --verdict-schema` CR; `validateVerdict` deleted):
- invalid JSON in the result body is an error
- a missing required key fails validation
- a primitive type mismatch fails validation
- an unreadable or invalid schema file is itself an error
  → the minimal validator: parse body as JSON; non-array object; every `required` key present; each
  present `properties` key's primitive type (`string|number|boolean`) matches. Deliberately not full
  JSON-Schema, no deps. Re-home onto the mail receive path (`awaitReply`/`mail read`) behind a
  `--verdict-schema <file>` flag when that CR runs.

**dispatch channel — CLI-driven convenience** (relocated to plugin governance composing `unit spawn` + `mail await`):
- channel without `--wait` spawns the peer and returns the envelope → **plugin**: `unit spawn` then return
- channel `--wait` spawns the peer and returns the validated DispatchResult once the reply arrives → **plugin**: `unit spawn` + `mail await`
- `unit spawn --agent` composes the def's realized launch → preserved in frozen `unit/lifecycle/lifecycle.feature`
- channel with no tmux/herdr available errors rather than running inline → **plugin** decision (mux probe → strategy)

**CLI never auto-routes** (preserved as a standing charter invariant, root `spec.md` + `agent`/`mux` non-goals):
- no dispatch verb accepts `--backend auto` or spawns a headless subprocess
- prep and collect never open a session or call a harness Task tool
