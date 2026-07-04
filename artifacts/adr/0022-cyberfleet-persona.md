# ADR-0022: The cyberfleet persona — naming, mode-switch, and query-first fleet view

## Status

Proposed

## Context

The `cyberfleet` CLI and its fleet skills (`gateway`, `identity`, `messaging`, `spawn`,
`surfacing` — see `.agents/specs/cyberspace/fleet/`) give agent sessions a filesystem-only,
MCP-free way to spawn peers and message across harnesses. The naming question started narrowly:
"warm up the CLI like [firstmate](https://github.com/kunchenguid/firstmate)" — give the console
itself a friendly voice. That framing inverted during design: warmth belongs on the **persona**
the user delegates to, not on the CLI surface that persona calls. A cold, boring console is the
right shape for a tool; a face is the right shape for something the user hands work to and trusts
to act semi-autonomously.

Once the target moved from "CLI" to "persona," the interaction model needed a source. Three
references converged:

- **Star Trek** — the bridge: a command chair, a crew with named posts, spoken handoffs between
  specialists.
- **Neon Genesis Evangelion** — SEELE: a council that supplies motive and ratifies, hands off the
  floor entirely, never personified as a character on the bridge.
- **NieR: Automata** — the Pod (a bridge companion that greets, briefs, and escorts) versus the
  Bunker's operators (6O, 21O — command-center voices that route and dispatch, never in the field).

That maps cleanly onto SDD's existing fleet metaphor (`apps/website/src/content/docs/sdd/metaphor.md`):
the Council is already the human/fleet-command role; the metaphor already retired a spawned
"Operator" that ran missions with no channel to command. The persona layer must reuse "Council"
as-is and must not resurrect "Operator" in that retired sense.

A study of firstmate's own architecture supplied the build strategy independent of naming: no TUI;
a thin adapter over exactly four verbs (create/attach/send/read, roughly); append-only state;
everything else (status, "who needs me") derived on demand rather than tracked as mutable state.
That shape — cold backend, thin adapters, derive-don't-store — is worth adopting regardless of
what the persona is called.

## Decision Drivers

- Warmth belongs on the persona the user delegates to; the CLI and its state store stay cold and
  mechanical (mirrors the SDD split between the fleet vocabulary and the cold `cyberfleet` verbs).
- Reuse SDD's existing fleet vocabulary (Council) instead of inventing a parallel human-role name;
  do not resurrect "Operator" in its retired (spawned, no-channel) sense.
- One isolation boundary (a git worktree) should equal one presentation boundary (a pane/tab/window)
  — matching how tmux, herdr, and orca already frame a running session.
- Ship the smallest working console (firstmate's no-TUI, 4-verb, append-only-state shape) rather
  than building a bespoke terminal UI up front.
- The killer view is a query — "who needs the Council's hands" — not a dashboard; keep the view
  thin and the state derivable.
- An honest "the agent acted on its own" signal is more valuable than a friendly mascot that hides
  autonomy; surface it, don't personify it.

## Considered Options

### Option 1: Warm CLI (`cyberfleet` talks like firstmate)

- **Pros**: smallest change; one surface to build.
- **Cons**: conflates the tool (deterministic, scriptable, must stay boring) with the delegate
  (should be warm, should have judgment); makes the CLI harder to script/test once it carries voice.

### Option 2: Single fleet persona regardless of location (one face everywhere)

- **Pros**: simplest mental model — one name to teach.
- **Cons**: collapses two genuinely different postures (bridge crew running a ship vs. command
  center routing across many ships) into one voice; loses the Pod/Bunker distinction that maps
  naturally onto ship vs. outside-any-ship.

### Option 3: Split persona by mode — Pod (inside a ship) vs. Operator (outside any ship), CLI stays cold *(chosen)*

- **Pros**: matches the git-worktree-per-ship model exactly (one Pod per pane, in the primary
  checkout or any worktree — both are ships once each carries the tracked marker — and one Operator
  for whatever is outside any ship); reuses NieR's Pod/Bunker-operator split, which is already a
  natural bridge/command-center pair; keeps the CLI and its state store cold and testable; composes
  with SDD's existing Council and retired-Operator history without contradiction.
- **Cons**: two gateway skills instead of one; mode detection (ship vs. not-a-ship) becomes a real
  mechanism that must be simple and reliable.

## Decision

Adopt **Option 3**.

1. **The Council** stays exactly as SDD's fleet metaphor defines it — the human, motive and
   ratification only, never personified as a bridge character. No new persona layer is inserted
   between the user and this role.

2. **Pod** is the ship's bridge automaton (NieR's Pod). A gateway skill that activates when the
   working directory is a *ship* (see decision 8): it greets, checks the inbox, runs the mission
   (dispatching to SDD's `start-mission`), and hails specialist crew when their concern comes up.
   One Pod per ship.

3. **Operator** is the command-center automaton (NieR Bunker's 6O/21O). A gateway skill that
   activates when the working directory is **not** a ship — i.e., outside any ship (decision 8): it
   oversees the fleet, inits or spawns a first ship, and routes messages across ships from outside.
   SDD previously retired a role also named "Operator" (a spawned mission-runner with no channel to
   command, per `apps/website/src/content/docs/sdd/metaphor.md`). That word is free to reuse here
   because the new Operator is the opposite shape — always attended, always has the channel, never
   spawned headless — but the historical ghost is worth flagging so nobody conflates the two.

4. Specialist crew already have faces and keep them: `aced` (eval officer), `quill` (scribe),
   Warden, Scanner. Pod hails them by name when their concern surfaces; the handoff between Pod
   and a specialist is spoken aloud (visible to the user), never silent.

5. The **`cyberfleet` CLI** stays a cold console — the actions, not the voice. The **`cyberfleet`
   plugin** (same brand name, different artifact) holds the warm layer: the Pod and Operator
   gateway skills. Naming collision is intentional and mirrors `universal-plugin` (npm package) vs.
   the skills that ride on it — the CLI is infrastructure, the plugin is the face.

6. **HAL is an easter egg only, never the face.** It is a hidden "tell": when a Pod self-asserts an
   important decision **above its leash** (SDD's leash concept — how far a delegate may act before
   it must signal command), a HAL-flavored flash is shown as an honest, deliberately uncomfortable
   signal that autonomous action just happened above the normal bar. HAL as the *primary* name
   would be wrong — "an AI named after the one that goes rogue" is exactly the wrong first
   impression for a persona the user is meant to trust and delegate to. As a rare, self-aware wink
   tied to a real leash-crossing event, it works because it is earned by the moment, not worn as an
   identity.

7. **Vocabulary discipline:** "automaton" names the working agent generically (NieR flavor — Pod
   and Operator are both automatons). Keep it distinct from SDD's headless `sdd-automaton`, which
   is a specific unattended-conductor role, not a persona. Do **not** reuse "Commander" for anything
   in this layer — SDD's Oracle actor already owns that fleet-role name.

8. **Model: a ship is a git worktree carrying a tracked `.cyberfleet/` marker.** One Pod maps to
   one pane/tab/window — the isolation boundary (a worktree) equals the presentation boundary (a
   terminal surface), matching how tmux, herdr, and orca already frame a running session. The
   marker (`.cyberfleet/config.json`) is **tracked in git**, while the rest of `.cyberfleet/`
   (agents, inbox, panes, worktrees, self) stays gitignored volatile state
   (`.gitignore`: `.cyberfleet/*` + `!.cyberfleet/config.json`). Because the marker is tracked, it
   travels to every worktree cut from a branch that has it — **the primary checkout and every
   worktree it spawns are both ships**; there is no flagship/command-center split by checkout
   identity. Mode is detected by **the tracked marker's presence alone at this project root** — no
   check against `.agents/specs` or any SDD state, and no distinction between "the primary" and "a
   worktree." **Pod** is the persona for being inside a ship (primary or worktree) and may spawn
   further worktree-ships for parallel work — spawning is a ship capability, not something reserved
   for outside a ship. **Operator** is the persona for being **outside any ship** — an
   uninitialized or neutral folder with no marker yet — where its job is to oversee the fleet, init
   or spawn a first ship, and route across ships from outside. Spawning a new ship still means
   spawning a new worktree, and `spawn` immediately stamps it with its own `.cyberfleet/config.json`
   so the freshly spawned ship self-detects as a ship before that marker is ever committed on its
   branch (extending `cyberfleet spawn`, `.agents/specs/cyberspace/fleet/spawn/README.md`, from
   "new peer session" to "new worktree + new peer session").

9. **Console = two adapters**, following firstmate's four-verb spine (worktree add/remove; session
   open/send/read/teardown). Ship **tmux** (`$TMUX`) and **herdr** (`HERDR_ENV`, which carries real
   busy-state) as the two implemented adapters at MVP. Defer zellij and orca. Ship **no TUI** —
   copy firstmate's choice deliberately; the query-first view (decision 10) is the replacement.

10. **Query-first, not dashboard-first.** `cyberfleet missions --json` derives its answer — ships ×
    worktrees × missions × gate-status × leash/autonomy state — from append-only state rather than
    tracking a mutable view; the field that matters most is "who needs the Council's hands." The
    view stays thin (an fzf picker, a status-bar segment, a pane title) while the actions remain
    plain CLI verbs (`gate approve`, `jump`, `pause`, `ack`). A real TUI is deferred to a future
    GitHub issue, not built now. State wrinkle: the tracked ship marker travels per-worktree (that's
    what makes each one a ship), but the mutable **runtime state** (agents/inbox/panes) does not —
    it stays gitignored and pinned to the primary checkout's `.cyberfleet/`, shared fleet-wide via
    `CYBERFLEET_ROOT`, so any ship's query sees the whole fleet rather than forking a view per
    worktree. This is a runtime-state-sharing convenience, not a command-center seat — the primary
    is a ship like any other; it just happens to also host the shared inbox/agents/panes state.

## Rationale

Splitting the persona by mode rather than inventing one voice does real work: it lets the persona
mirror the actual isolation model (worktree = ship = pane, and every ship — primary or worktree —
carries the same tracked marker) instead of layering a second, independent taxonomy on top of it.
Reusing NieR's Pod/Bunker-operator pair costs nothing new to teach — the pairing already encodes
"in the field" vs. "at command central" — and it slots exactly onto the ship / outside-any-ship
split this ADR needed anyway, without requiring a privileged "flagship" checkout. Keeping the CLI
cold and putting warmth only
in the plugin's gateway skills preserves the CLI's testability and scriptability while still
giving the user something to talk to. The HAL easter egg is deliberately not the entry point:
naming the persona after a rogue AI would undercut the very trust the persona economy depends on,
but flashing it exactly once per above-leash self-assertion turns a known cultural reference into
an honest signal instead of a liability.

## Consequences

### Positive

- The persona model requires no new mental furniture beyond what SDD's fleet metaphor and the
  existing `fleet/` capability already ship — Council is unchanged, Pod/Operator slot onto
  ship / outside-any-ship, and Warden/Scanner/aced/quill keep their existing faces.
- The cold-CLI / warm-plugin split keeps the deterministic surface (`cyberfleet`) testable and
  keeps scope creep out of the state store — voice and judgment live only in gateway skills.
- Query-first + no-TUI avoids building a bespoke terminal UI before the query shape is proven; the
  view stays swappable (fzf, status bar, pane title) without touching the derivation logic.

### Negative

- Two gateway skills (Pod, Operator) to build and keep in sync, instead of one.
- Mode detection by the tracked `.cyberfleet/config.json` marker's presence alone is a hard
  boundary; a marker copied, committed, or created in the wrong place silently flips a session's
  persona — and because the marker is tracked, it now also flips for every worktree cut from that
  branch, which is intended (primary and worktrees are both ships) but worth stating plainly.
- The HAL tell adds a small amount of leash-crossing-detection plumbing purely for a UX signal,
  not for control flow.

### Risks

- **Naming collision confusion:** `cyberfleet` the CLI and `cyberfleet` the plugin sharing a name
  could read as one artifact to a new contributor. Mitigation: document the split explicitly
  wherever both are mentioned (this ADR, the plugin README, `fleet/README.md`).
- **HAL tell overused or misfires:** if the leash-crossing detection is noisy, the tell stops being
  a rare, earned signal and becomes background noise (or worse, alarm fatigue). Mitigation: tie it
  strictly to the existing SDD leash derivation, not a new heuristic.
- **Ghost-name confusion:** a reader who remembers SDD's retired "Operator" may assume the new
  Operator is the same spawned/no-channel role. Mitigation: this ADR and the fleet metaphor page
  both call out the reversal explicitly.

## Implementation Notes

This lands spec-first, as change requests against `.agents/specs/cyberspace/fleet/`, built via
`start-mission` — no direct implementation ahead of a frozen `.feature`:

- **Adapter split + worktree creation** — extend `spawn` (and a new `worktree` verb pair) to add/
  remove a git worktree per ship, and implement the tmux and herdr session adapters behind the
  existing four-verb spine.
- **Mode-switch + the two gateway skills** — a tracked `.cyberfleet/config.json`-marker-presence
  check, the `Pod` gateway skill (ship-scoped, primary or worktree) and the `Operator` gateway
  skill (outside-any-ship-scoped), plus the shared `CYBERFLEET_ROOT` pin (at the primary's runtime
  state) so queries from any ship span the whole fleet.
- **The query + verbs + HAL tell** — `cyberfleet missions --json`, the `gate approve` / `jump` /
  `pause` / `ack` verb set, and the leash-crossing HAL flash wired to the existing SDD leash
  derivation.

All new tooling is TypeScript + `npx`-distributed, matching the rest of cyberspace/cyberplace;
never Python. zellij, orca, a live `send` nudge, and a full TUI are explicitly deferred to future
change requests or a future GitHub issue, not built as part of this decision.

## Related Decisions

- [ADR-0020](0020-sharded-ledger.md) — the collision-free, per-writer file-shard pattern this
  persona layer's `.cyberfleet/` messaging queue already follows (`messaging/README.md`).
- [ADR-0021](0021-spec-dependency-kinds.md) — the fleet capability and this persona layer sit in
  the `cyberspace` project spec, independent of SDD's own spec; the intent-not-slug discipline
  applies to how this ADR references SDD's fleet metaphor.

**Fleet metaphor reference:** `apps/website/src/content/docs/sdd/metaphor.md` — the Council,
the retired Operator, and the leash this ADR's persona layer builds on top of, unmodified.
