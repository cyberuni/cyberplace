---
name: cyberplace-backfill-tavern
todos:
  - content: "backfill: scaffold cyberplace root spec.md + envelope (capability-first, narrow)"
    status: pending
  - content: "backfill: marketplace capability + awesome-list (backfill stub) + tavern (new stub)"
    status: pending
  - content: "grill: fill tavern.feature — crew storefront + crew facet + `awesome find --crew`"
    status: pending
  - content: "grill: fill/split awesome-list.feature — backfilled discovery (find/inspect/render/sources)"
    status: pending
  - content: "spec gate: cold spec-judge (marketplace nodes), freeze .feature"
    status: pending
  - content: "deliver: crew facet (awesome-skills.json + lib.ts + `find --crew`) + Starlight tavern page"
    status: pending
  - content: "impl gate: cold impl-judge per frozen scenario"
    status: pending
  - content: "handoff: branch cyberplace-backfill-tavern -> PR; file Mission A (Crimp+Tuner) follow-up"
    status: pending
---

# cyberplace-backfill-tavern

Backfill a NEW cyberplace project spec (none existed) and add the **Tavern**
crew storefront node. Narrow: stand up `spec.md` + the `marketplace` capability
only; the other cyberplace domains (audit/commit/governance/hook/registry/skill)
are named in the placement map as planned homes, backfilled later by demand.

- **Project:** `.agents/specs/cyberplace/`, `project-path: packages/cyberplace`
  (published CLI, hoisted spec — matches corpus). Strategy: **capability-first**
  (user-ratified).
- **New behavior (Tavern):** a `crew` facet on the awesome catalog
  (`packages/cyberplace/awesome-skills.json` — a `crew` tag or new
  `highlights.type: crew`), a `awesome find --crew` filter in
  `src/awesome/lib.ts`, and a Starlight storefront section
  `apps/website/src/content/docs/tavern/`.
- **Backfilled behavior (awesome-list):** the existing `awesome`
  find/inspect/render/sources discovery — reverse-engineered from source, not
  re-grilled for intent.
- **Seam:** Mission A's **Crimp** persona delegates to `awesome find --crew` —
  depend on the query intent, not this node's slug (ADR-0021).

## NEXT

Scaffold the backfill skeleton (root `spec.md` + `marketplace/` +
`marketplace/awesome-list/` + `marketplace/tavern/` stubs, `## Use Cases` only,
no `.feature`, `status: draft`). Then hand back per backfill step 6 — ask the
user: continue into the per-unit explore grill now, or defer. CR is additive/new
project; runs on branch `cyberplace-backfill-tavern` off `main`.
