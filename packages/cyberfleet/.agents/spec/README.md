# cyberfleet CLI — the fleet layer over cyberlegion

`cyberfleet` turns the metaphor-free `cyberlegion` mechanism (spawn a session, carry mail, identify
peers, surface mail) into a **fleet** view: ships, missions, and the Council. It **depends up** on
`cyberlegion` and adds only the fleet-specific verbs — it does **not** re-expose the mechanism.

This project (`packages/cyberfleet`) is the **CLI half** — the deterministic fleet engine. The
persona layer that decides *when* and *how* an agent reaches for the fleet (the `fleet` gateway
personas and the `crew` recruit/tune personas) is the sibling `cyberfleet-plugin` project
(`../../.agents/specs/cyberfleet-plugin`, source `plugins/cyberfleet`), which calls this CLI by
**intent**, never by its command slugs.

Fleet verbs (what cyberfleet owns):

- **`cyberfleet mode`** — report ship (a spawned unit worktree) vs command-center, and the shared
  fleet root.
- **`cyberfleet missions`** — the Council view: ships × mission × gate × leash, derived from SDD
  state (the one place cyberfleet reads SDD).
- **`cyberfleet jump <peer>`** — focus a ship's session pane, or print its worktree path to `cd`
  into.
- **`cyberfleet pause <peer>`** — flip a ship record to `status: paused` (a marker only, not the SDD
  `pause-mission` checkpoint — that gap is flagged).
- **`cyberfleet gate approve`** — stubbed; a human ratification is not safely relayable through this
  CLI (the relayed-ratification seam).

The mechanism — unit, mail, unit spawn/close, surfacing — was **extracted into
`cyberlegion`** (`../../../cyberlegion/.agents/spec/`). A fleet persona runs those verbs directly:
`cyberlegion unit register`, `cyberlegion mail send`/`inbox`/`read`, `cyberlegion unit
spawn`/`close`. cyberfleet no longer describes them.

Squad note: the fleet verbs are deterministic `cyberfleet` CLI behaviors (SDD-default + a script
harness — boolean scenarios, no rubric). They are currently **implemented but not yet captured as
behavioral spec nodes** (a known backfill gap — see `spec.md`). The agent-behavior nodes (ACED —
activation and judgment) are in the `cyberfleet-plugin` project.
</content>
