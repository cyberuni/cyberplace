# decisions — cyberplace ADR log

Append-only, descriptive, ungated project-scope decisions. The project sibling of a unit's
`<unit>.solution.md`. Organize no node as an ADR body — this folder only logs decisions.

Decisions (marketplace / Tavern grill):

- **crew facet shape** — DECIDED: a reserved `crew` tag in a **marketplace-manifest**
  (`.claude-plugin/marketplace.json`) plugin entry's `tags[]`; **no** marketplace-manifest schema
  change. Superseded-in-place by CR `tavern-plugin-storefront`: the original grill chose this shape
  over a `highlights.type: crew` on the *awesome catalog* (only `RepoEntry` carried `highlights`);
  the roster source has since moved from the awesome catalog to the marketplace manifest, but the
  `tags[]`-marker shape carries over unchanged.
- **Tavern interface** — DECIDED: a dedicated top-level `cyberplace tavern` command (not an
  `awesome find --crew` flag), plus a Starlight storefront page shipped in the same CR.
- **crew qualification** — DECIDED: a marketplace-manifest plugin entry is a crew iff it ships an
  installable persona gateway skill (`metadata.persona`); the `crew` tag is author-asserted (no deep
  validation this CR). Superseded-in-place by CR `tavern-plugin-storefront`: qualification now reads
  against marketplace-manifest plugin entries, not awesome-catalog entries.
- **Tavern surface** — DECIDED: a Starlight top-nav storefront projecting the crew-tagged
  **marketplace manifest**, not a second governed source. Superseded-in-place by CR
  `tavern-plugin-storefront`: the roster projected is now the marketplace manifest, replacing the
  earlier crew-tagged-catalog framing.

Decisions (marketplace charter + AXI grill — CR `cyberplace-marketplace-axi`):

- **charter = marketplace interaction only** — DECIDED: cyberplace's charter is *interacting with the
  cyberplace universal agentic plugin/skill marketplace* (discover, acquire, source, share). The
  authoring/quality code it inherited from `cyber-skills` (`audit/`, `commit/`, `hook/`, `skill/`) and
  `universal-plugin` (`governance/`) is **out-of-charter tenant code** — present in the package but not
  cyberplace's concern — flagged for later relocation, not backfilled here. See root `spec.md` →
  **Out-of-charter tenants**.
- **adopt the AXI output contract** — DECIDED: adopt [AXI](https://github.com/kunchenguid/axi)
  principles **#1–#6 and #8–#10** as a shared output contract across every marketplace command, stated
  once in a new [`axi/`](../../axi/README.md) reference node and referenced by each behavioral node
  (which carries the concrete conformance scenarios). This is the **same** contract
  `packages/universal-plugin` adopted (its ADR-0003) — cyberplace shares the shape rather than
  re-deriving it. A new cross-cutting `concept: axi` groups the contract node and every marketplace
  node in the by-concept index. TOON becomes the default output; `--format json` stays the explicit
  escape hatch (nothing narrowed away).
- **defer AXI #7 (ambient context)** — DECIDED: #7 (a session-hook setup command + an installable Agent
  Skill) is out of scope here. It is entangled with cyberplace's own surfaces — `cyberplace add` *is*
  the skill-installer #7 describes, and session-hook wiring is the out-of-charter `hook/` tenant —
  routed to a follow-up CR.
- **spec-only delivery; impl trails** — DECIDED: this CR delivers the spec + a frozen AXI-asserting
  suite and **withholds the impl gate**; the shipped bin still emits prose + `--format json` and prompts
  interactively. Making the CLI emit AXI output (TOON default, aggregates, next-step, non-interactive
  `registry`) is a follow-up impl mission. Mirrors the universal-plugin precedent (`b20e69c`).
