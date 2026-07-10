# cyberlegion CLI — architecture realignment (design)

> Proposal · unratified. Supersedes `cyberlegion-identity-presence-split` (a doc-only node split).
> Hosted eyeball reference: the artifact rendered from this design.

## Origin

The picked mission was `cyberlegion-identity-presence-split` — the sdd-warden flagged `identity/`
oversized (43 > 40) and proposed carving a `presence/` node out of it. Working the split surfaced a
deeper problem: **the spec is organized on an invented axis** (`surfacing`, `wake`) that matches no
CLI command, while the CLI itself already *is* a capability decomposition arranged for agent friction
(AXI). The split was chasing a symptom. The real fix is to realign the spec to the architecture and,
where the command tree is itself wrong, fix the command tree.

## The charter this is measured against

From the root spec: **the CLI is pure mechanism** — "it never selects a backend and never invokes a
harness subagent tool; routing (warm-peer vs cold-subagent vs run-inline) is the caller's judgment."
The Legate (the plugin) is the routing brain. Every decision below is derived from holding the CLI to
that line.

## The spine — three nouns: class → instance → location

The `identity? session? owner? agent?` tangle dissolves once these are kept distinct:

- **`agent`** — a *definition*: a reusable template on disk (`.agents/agents/*.md`).
- **`unit`** — an *instance*: a spawned, registered agent — its own record, its own inbox. The thing
  you address.
- **`pane`** — a *location*: where a unit runs, over a multiplexer. Managed by the `mux` layer.

## Two layers, one-way dependency

cyberlegion does two separable jobs:

1. **Multiplexer management** (`mux`) — a unit-agnostic pane abstraction over tmux/herdr (open, close,
   list, read, write, focus, probe). You could run `btop` in a pane and never touch a unit. This is
   the existing `console/` code.
2. **Legion management** — units, mail, agent-defs, presence, built *on* the mux.

They ship together (splitting the package buys little) but the dependency runs **one way only**:
legion → mux. The mux layer carries zero unit knowledge (DIP: legion depends on the pane
*abstraction*, not the reverse). `dispatch` — routing — lives a layer *above* legion, in the plugin.

```
plugin · Legate      dispatch (warm/cold/inline routing, wake-vs-wait policy)
      ▲ composes — the CLI never selects a backend
legion               unit · mail · agent(defs) · attach · init · admin
      ▲ depends on the pane abstraction
mux                  doctor · mode  (+ internal open/close/read/write/focus)
```

## Capabilities — one node per command group, plus a node per real layer

`mux` earns a node as a genuine dependency boundary. `surfacing`/`wake` never were layers — just
bundles of `mail` verbs — so they dissolve. Result: `mux · unit · mail · agent · attach · init ·
admin`.

| Node | Verbs | Owns |
|---|---|---|
| **mux** | doctor, mode (+ internal open/close/list/read/write/focus) | the pane abstraction over tmux/herdr |
| **unit** | register `--standing`, whoami, who, prune, spawn, close, focus, read, nudge | the instance registry + lifecycle |
| **mail** | send, inbox, read, ack, delete, await, watch, hook | the store + the universal return channel |
| **agent** | list, show, resolve, path | reusable definitions (the class) |
| **attach** | attach, `--clear` (`--follow` later) | the human's read-pane (attention pointer) |
| **init** | init | onboarding: detect harness, wire hook, advise attach |
| **admin** | migrate | hub-state maintenance |

Hot-path top-level aliases stay: `who` · `send` · `inbox` · `spawn` · bare-status (AXI #8).

`nudge` is *legion*: at the mux level it is just `write` (send-keys) with a doorbell meaning.

## Migration from today's commands

| Today | Change | Becomes | Why |
|---|---|---|---|
| `identity *` | rename | `unit *` | It was always the unit registry, not "identity". |
| `identity owner --handle` | fold | `unit register --standing` | A standing recipient is the sibling of `register`. |
| `identity who` + `session list` | merge | `unit who` | Two names for one list. |
| `identity bind-main` / `main` | rename | `attach` / `--clear` | Not a record — a presence pane / attention pointer. |
| `session spawn` / `close` | move | `unit spawn` / `close` | Unit lifecycle composes the mux; no "session" noun. |
| `session focus/read/nudge` | move | `unit focus/read/nudge` | `nudge` = legion over `mux.write`; rest poke a unit's pane. |
| `admin doctor` / `mode` | move | `mux doctor` / `mode` | Multiplexer probes. |
| `admin install` | fold | `init` (+ `mail hook`) | Hook wiring is onboarding; `surfacing` dissolves here. |
| node `surfacing` / `wake` | dissolve | `mail` · `mux` | Never layers — just `mail` verbs + a mux probe. |
| `dispatch *` | to plugin | Legate | Routing is judgment; the CLI must not select a backend. |
| `dispatch prep`/`collect` + `Store.result` slot | drop | — | Dominated: Task-result wins on cost, mail wins on uniformity. |

## Delegation & return — prefer wake over wait

Waiting holds a turn hostage. The legion already has wake paths (the surfacing hook injects a reply
on the next turn; the harness re-invokes on subagent completion). So delegation is
**fire-and-be-woken** by default; `--wait` / `await` is the demoted fallback for no-hook contexts.

| Backend | Who waits | Return channel | Return address |
|---|---|---|---|
| warm unit | CLI blocks on mail *(fallback)* | mail reply to the brief | inherent — brief-mail carries `from` + `thread` |
| cold subagent · perf | harness (Task tool) | harness Task result — free, validate inline | none — the harness is the channel |
| cold subagent · uniform | woken by surfacing | mail, `--from <label>` | baked at spawn — one-way, no handshake |
| inline | nobody | in-hand | — |

**No round-trip handshake, ever.** The return address rides one-way: inherent in the brief-mail
(warm), baked into the instruction at spawn (cold), or read from the worker's own `spawnedBy`. The
worker never asks where to reply.

The result-slot (`prep`/`collect` + the `Store.result` domain) is **dropped**: it's dominated by the
harness Task result (cheaper) and by mail (uniform, durable). Its schema check moves onto mail receive
(`mail read`/`await --verdict-schema`).

## The mail model (email terms)

`to` and `thread` are different fields with different jobs.

| Email | cyberlegion | Role |
|---|---|---|
| To: | `to` | **Address** — which mailbox (`resolveRecipient` → agent id) |
| Subject: | `subject` | human title (optional) |
| Message-ID | `id` | this message's unique id |
| In-Reply-To | `replyTo` | "this answers message X" |
| References | `thread` | **Correlation** — a minted unique token; `await --thread t` matches exactly this exchange |

The reply carries both: `to` so it arrives, `thread` so it's recognized among many in flight. A
subject can collide; a minted thread cannot.

## Invariants (fall out of the model)

1. **Identity is the mailbox.** Mail is keyed by agent id; `register` mints the id. A mailbox is
   intrinsic to being a unit — no `mailbox create` verb, ever. Mailbox lifecycle = unit lifecycle.
2. **Receiving requires registration; sending is free.** `resolveRecipient` throws on an unknown
   *recipient*; `from?.handle ?? fromId` lets any label send. Reachable ⇒ registered unit; send-only
   ⇒ no identity (the cold subagent).
3. **Prefer wake over wait.** The surfacing hook and harness notification wake you; blocking is the
   labeled fallback, never the spine.
4. **The return address rides one-way.** Reply-to-brief, bake-at-spawn, or `spawnedBy` lookup — all
   zero round-trips. The two-message handshake is never used.
5. **Mechanism is the CLI's; routing is the Legate's.** The CLI exposes the warm and cold/inline
   primitives but never *chooses* between them.

### Proof — the orchestrator needs a mailbox

A worker returns its result with `to = <orchestrator id>`. Delivery runs `resolveRecipient(to)`,
which **throws on an unknown recipient — no partial write**. So for any reply to be deliverable the
orchestrator must resolve as a registered recipient; and since registration *is* mailbox creation, it
simply has to be a registered unit — a session, or `--standing` when headless with no pane. ∎

## Deferred (written down · not this CR)

- **`attach --follow`** — auto-move the read-pane via tmux focus-events (the attention pointer made
  automatic). Manual stays the default.
- **`mail read`/`await --verdict-schema`** — validate a result on receive (where `collect`'s schema
  check lands now the result-slot is gone).

## Scope of the realignment CR(s)

This is bigger than the split it supersedes. It carries: (a) an ADR reversing the concept-axis
placement decision for cyberlegion; (b) a spec-node realignment (`mux · unit · mail · agent · attach ·
init · admin`; `surfacing`/`wake` dissolved); (c) a real CLI change (`identity`→`unit`, `session`
folded, `owner`→`register --standing`, `bind-main`→`attach`, `doctor`/`mode`→`mux`); (d) moving
`dispatch` to the plugin and deleting the `Store.result` slot. Sequence and per-CR splitting are the
first mission decisions.
