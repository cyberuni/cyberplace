---
spec-type: behavioral
concept: [discovery]
---

# tavern — the crew storefront

The **Tavern** is the dedicated place to browse and install **crews** — catalog entries that ship an
installable **persona gateway skill** (`metadata.persona`), i.e. recruitable spaceship crews you
command through their persona. It is a **discovery + install** surface only: it does not deploy a
crew (that is cyberfleet's Operator), tune one (Tuner), or recruit through the persona (Crimp).

Two facets ship together:

- a CLI command — **`cyberplace tavern`** — that lists the crews in the catalog, and
- a website storefront — a Starlight section at `apps/website/src/content/docs/tavern/` — that
  renders the same crew roster for humans.

A crew is marked by a **reserved `crew` tag** in the entry's existing `tags[]` (no catalog schema
change — `crew` is a convention the Tavern keys on). The tag is author-asserted; the crew's defining
trait is that it ships a persona gateway skill, but the Tavern does not deep-validate the persona
this CR (author-asserted, a possible later hardening).

## Use Cases

**Subject** — browsing and installing crews from the curated catalog, by CLI and on the website.

- **List the crews (`cyberplace tavern`).** Reads the resolved catalog (same sources as `awesome`),
  selects entries carrying the `crew` tag, and renders a roster — each crew showing its name/repo,
  summary, and the derived install command (`npx skills add <repo>` / `--skill`). Non-crew entries
  are excluded.
- **Filter the roster (`cyberplace tavern <query>`).** Narrows the crew roster by free-text match
  (reuses the `awesome` search scoring, scoped to crews).
- **Output formats.** `--format text | json`, consistent with the `awesome` command group: `text`
  (default) a human roster, `json` structured crew records. (`agent` is accepted as an alias of
  `text` — the two render identically for a read-only listing today.)
- **Empty tavern.** When the catalog has no `crew`-tagged entries, `cyberplace tavern` reports an
  empty roster gracefully (exit 0, an explicit "no crews" line) — never an error.
- **The website storefront.** `apps/website/src/content/docs/tavern/` renders the crew roster (each
  crew with its install command), registered in the `astro.config.mjs` sidebar so the Tavern is a
  navigable place, not just a CLI.

**Non-goals (boundaries):**

- The Tavern **lists and points to install** — it does not itself deploy, tune, or recruit. Those
  are cyberfleet concerns (Operator / Tuner / Crimp); the seam is the crew-filtered catalog query,
  depended on by intent, not by this node's slug (ADR-0021).
- No catalog **schema change** — `crew` is a reserved tag, not a new field or `highlights.type`.
- No deep **persona validation** this CR — the `crew` tag is author-asserted.
