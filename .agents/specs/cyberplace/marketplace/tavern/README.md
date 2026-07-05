---
spec-type: behavioral
concept: [discovery, axi]
---

# tavern — the crew-recruitment storefront

> Output follows the shared [AXI output contract](../../axi/README.md) (TOON default, aggregate,
> definitive empty state, next-step on stderr, fail-loud). **Impl trails the contract** — the shipped
> `cyberplace tavern` still emits prose + `--format json`; the impl gate is withheld until a follow-up
> mission builds the AXI surface.

The **Tavern** is the dedicated place to browse and recruit **crews** — recruitable spaceship crews
you command through their persona. It is a **discovery + point-to-recruit** surface only: it does not
deploy a crew (that is cyberfleet's Operator), tune one (Tuner), or recruit through the persona
(Crimp). cyberfleet's **Crimp recruits crews through this same `cyberplace` CLI** — the Tavern is the
storefront, Crimp is the buyer.

A crew is a **plugin listed in the cyberplace marketplace manifest** (`.claude-plugin/marketplace.json`)
marked by a **reserved `crew` tag** in the entry's `tags[]`. The marketplace manifest is the roster
source (not the awesome catalog — that is general skill discovery, `awesome-list`); the `crew` tag is
the convention the Tavern keys on, so a marketplace plugin is a crew iff it is tagged. The tag is
author-asserted; the crew's defining trait is that it ships a persona gateway skill, but the Tavern
does not deep-validate the persona this CR (a possible later hardening).

Two facets ship together:

- a CLI command — **`cyberplace tavern`** — that lists the crew-tagged marketplace plugins, and
- a website storefront — a Starlight section at `apps/website/src/content/docs/tavern/` — that renders
  the same roster as cards, reachable from the site **top navigation**.

## Use Cases

**Subject** — browsing and recruiting crews from the cyberplace marketplace, by CLI and on the website.

- **List the crews (`cyberplace tavern`).** Reads the marketplace manifest, selects entries carrying
  the `crew` tag, and renders a roster — each crew showing its name, description, and the derived
  recruit command (`cyberplace add <name>`); tags surface on the website card. Non-crew plugins are
  excluded.
- **Filter the roster (`cyberplace tavern <query>`).** Narrows the crew roster by free-text match over
  the crew-tagged plugins.
- **Output formats.** TOON by default (the AXI surface — name/description/recruit rows plus a
  pre-computed crew-count aggregate); `--format json` emits structured crew records; `--full` defeats
  truncation.
- **Empty tavern.** When the marketplace has no `crew`-tagged plugins, `cyberplace tavern` reports an
  empty roster gracefully (exit 0, `0 crews found`) — never an error.
- **The website storefront.** `apps/website/src/content/docs/tavern/` renders one **card per crew** —
  name, a badge, description, tags, and a link to the plugin source — reachable from the site **top
  nav** (and registered in the sidebar). The page reads the marketplace manifest at build time.

**Non-goals (boundaries):**

- The Tavern **lists and points to recruit** — it does not itself recruit, install, deploy, or tune.
  Those are cyberfleet concerns (Crimp / Operator / Tuner); the seam is the crew-filtered marketplace
  query, depended on by intent, not by this node's slug (ADR-0021).
- No **schema field invention** on the harness-facing manifest — `crew` is a reserved value in the
  entry's `tags[]`, not a bespoke top-level field.
- No deep **persona validation** this CR — the `crew` tag is author-asserted.
