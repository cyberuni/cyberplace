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
  - content: "DONE spec gate: cold judge ALIGNED true (round 1 architect caught leftover awesome-catalog framing; fixed); froze tavern.feature, root->approved; committed eead5b5"
    status: completed
  - content: "DONE impl: website SiteTitle top-nav + TavernStorefront crew cards + index.mdx; CLI readCrewPlugins over marketplace.json; deleted render.ts/lib.ts; 10 tests green"
    status: completed
  - content: "DONE impl gate: cold sdd-impl-judge PASS (11 targeted scenarios; AXI deferred per banner); root->implemented; root pnpm verify green (16/16)"
    status: completed
  - content: "Handoff: commit impl unit; spawn detached Warden; PR is user's (repo pattern)"
    status: in_progress
---

# CR: tavern-plugin-storefront — Tavern becomes the cyberplace plugin storefront

Approved plan: `~/.claude/plans/update-the-website-to-eventual-teapot.md`.

Redefine the Tavern end-to-end from a **crew roster** (0 live entries, sourced from awesome-skills.json) to **the cyberplace plugin storefront**: the website `/tavern` page shows one Core-Flywheel-style card per plugin in `.claude-plugin/marketplace.json` (aced, cyberfleet, quill, sdd, tmux), enriched from each `plugins/<name>/.claude-plugin/plugin.json` + skill/agent dir counts. Add a multi-item top nav (Docs/SDD/Tavern) via a Starlight SiteTitle override. **Retire crews** (CLI `cyberplace tavern` repoints to plugins; delete crew roster/render codegen).

Spec-governed: re-open the frozen `.agents/specs/cyberplace/marketplace/tavern/tavern.feature` (root cyberplace spec is `implemented` -> `draft`), rewrite spec+suite, re-gate.

Data: never add fields to marketplace.json entries (remote `$schema`); card richness from plugin.json + dir counts. Cards decouple the web page from the CLI render (page is now a build-time Astro component, not marker codegen). Extract pure `readMarketplacePlugins(root)` so vitest verifies the mapping without Astro.

Ledger shard: `tavern-plugin-storefront.a75a36.jsonl`.

## NEXT

CR essentially complete. cyberplace = `implemented` (spec:approve;impl:approve). Both gates passed, root pnpm verify green. Commits: `eead5b5` (spec+seed) + the impl unit. Only cyberfleet is a crew today (1 card, grows as plugins are `crew`-tagged in marketplace.json).

Remaining handoff: commit impl unit; spawn detached Warden formation pass; PR is the user's to open (repo pattern: `git push -u origin tavern-plugin-storefront` → PR). Follow-ups (noted, not filed): (1) build the tavern AXI CLI surface (TOON/aggregate/etc — still deferred per banner); (2) add a malformed-manifest fail-loud scenario; (3) export a cyberplace `tavern` lib module so TavernStorefront reuses `readCrewPlugins` instead of re-deriving the crew filter.
