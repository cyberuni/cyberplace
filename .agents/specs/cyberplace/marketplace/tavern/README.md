---
spec-type: behavioral
concept: [discovery]
---

# tavern — the crew storefront

**New behavior** (this CR). The Tavern is the dedicated place to browse and install **crews** —
marketplace entries that are installable persona plugins/skills with a personated gateway skill
(recruitable spaceship crews). `.feature` authored later in the explore grill. No `.feature` yet.

## Use Cases

- **crew facet on the catalog** — mark a `awesome-skills.json` entry as a crew (a reserved `crew`
  tag or a new `highlights.type: crew` — the shape is a `design/decisions` call, confirm-not-guess);
  validated in `src/awesome/lib.ts`.
- **filter to crews** — `cyberplace awesome find --crew` (or `--type crew`) returns only crew
  entries; this is the "search filter" a user could use even before a dedicated page exists.
- **the storefront** — a Starlight section `apps/website/src/content/docs/tavern/` (registered in
  `astro.config.mjs`) rendering the crew roster from the crew-facet entries (mirror
  `src/awesome/render.ts`'s marker block), each card showing the crew, its gateway persona, and the
  install command.

**Seam (depend on intent, not slug — ADR-0021):** Mission A's **Crimp** persona (in the cyberfleet
project) recruits by delegating to the crew-filtered catalog query this unit defines; it depends on
"a crew-filtered `awesome find`", not on the Tavern node's name.

**Non-goals:** the Tavern does not deploy crews (that is cyberfleet's operator) or tune them (Tuner);
it browses and installs.
