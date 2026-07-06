---
name: tavern-plugin-storefront
status: active
todos:
  - content: "DONE: re-open tavern node (root cyberplace implemented->draft); unfreeze tavern.feature"
    status: completed
  - content: "Rewrite tavern spec.md README + tavern.feature: crew roster SOURCE = marketplace.json entries tagged 'crew' (KEEP crews; cyberfleet Crimp recruits via cyberplace CLI). Reconcile marketplace/README + glossary. Seed marketplace.json tags."
    status: in_progress
  - content: "Spec gate: cold sdd-spec-judge 3-lens, re-freeze tavern.feature, root->approved"
    status: pending
  - content: "Impl website: SiteTitle top-nav override (Docs/SDD/Tavern) + crew card component (reads marketplace.json crew-tagged) + tavern index.md->mdx + adjust prebuild"
    status: pending
  - content: "Impl CLI+tests: repoint cyberplace tavern roster source to marketplace.json crew-tag; rewrite tavern.test.ts"
    status: pending
  - content: "Impl gate (cold judge vs frozen scenarios) -> root->implemented; root pnpm verify; build+eyeball website; handoff"
    status: pending
---

# CR: tavern-plugin-storefront — Tavern becomes the cyberplace plugin storefront

Approved plan: `~/.claude/plans/update-the-website-to-eventual-teapot.md`.

Redefine the Tavern end-to-end from a **crew roster** (0 live entries, sourced from awesome-skills.json) to **the cyberplace plugin storefront**: the website `/tavern` page shows one Core-Flywheel-style card per plugin in `.claude-plugin/marketplace.json` (aced, cyberfleet, quill, sdd, tmux), enriched from each `plugins/<name>/.claude-plugin/plugin.json` + skill/agent dir counts. Add a multi-item top nav (Docs/SDD/Tavern) via a Starlight SiteTitle override. **Retire crews** (CLI `cyberplace tavern` repoints to plugins; delete crew roster/render codegen).

Spec-governed: re-open the frozen `.agents/specs/cyberplace/marketplace/tavern/tavern.feature` (root cyberplace spec is `implemented` -> `draft`), rewrite spec+suite, re-gate.

Data: never add fields to marketplace.json entries (remote `$schema`); card richness from plugin.json + dir counts. Cards decouple the web page from the CLI render (page is now a build-time Astro component, not marker codegen). Extract pure `readMarketplacePlugins(root)` so vitest verifies the mapping without Astro.

Ledger shard: `tavern-plugin-storefront.a75a36.jsonl`.

## NEXT

Start explore. Re-open root spec (implemented->draft), unfreeze tavern.feature, rewrite spec.md + tavern.feature for the plugin-storefront behavior. Then spawn cold spec-judge, spec gate. Impl (website + CLI + tests) can build in parallel against the rewritten frozen suite.
