---
name: cyberplace-backfill-tavern
todos:
  - content: "backfill: scaffold cyberplace root spec.md + envelope (capability-first, narrow)"
    status: completed
  - content: "backfill: marketplace capability + awesome-list (backfill stub) + tavern (new stub)"
    status: completed
  - content: "grill: fill tavern.feature — crew storefront + `crew` tag + `cyberplace tavern` cmd"
    status: completed
  - content: "grill: fill/split awesome-list.feature — backfilled discovery (find/inspect/render/sources)"
    status: deferred
  - content: "spec gate: cold spec-judge (tavern), freeze tavern.feature, status:approved"
    status: completed
  - content: "deliver: `crew` tag + `cyberplace tavern` command (cli/lib) + Starlight tavern page"
    status: completed
  - content: "impl gate: cold impl-judge per frozen scenario"
    status: completed
  - content: "handoff: branch cyberplace-backfill-tavern -> PR #64 (MERGED); Mission A follow-up filed"
    status: completed
  - content: "FOLLOW-UP CR: de-dup deriveInstallCommand in awesome/render.ts onto the awesome/lib.ts export"
    status: pending
  - content: "FOLLOW-UP: awesome-list backfill (deferred stub -> full node) when demanded"
    status: pending
  - content: "FOLLOW-UP: Mission A — Crimp + Tuner personas in the cyberfleet spec"
    status: completed
---

# cyberplace-backfill-tavern

Backfill a NEW cyberplace project spec (none existed) and add the **Tavern**
crew storefront node. Narrow: stand up `spec.md` + the `marketplace` capability
only; the other cyberplace domains (audit/commit/governance/hook/registry/skill)
are named in the placement map as planned homes, backfilled later by demand.

- **Project:** `.agents/specs/cyberplace/`, `project-path: packages/cyberplace`
  (published CLI, hoisted spec — matches corpus). Strategy: **capability-first**
  (user-ratified).
- **New behavior (Tavern):** a reserved `crew` tag on catalog entries
  (`packages/cyberplace/awesome-skills.json`, no schema change), a dedicated
  top-level `cyberplace tavern` command (lists/filters the crew roster) in
  `src/awesome/` + `cli.ts`, and a Starlight storefront section
  `apps/website/src/content/docs/tavern/`. A crew = an entry shipping a persona
  gateway skill (`metadata.persona`).
- **Backfilled behavior (awesome-list):** the existing `awesome`
  find/inspect/render/sources discovery — reverse-engineered from source, not
  re-grilled for intent.
- **Seam:** Mission A's **Crimp** persona delegates to the `cyberplace tavern`
  crew query — depend on the query intent (a crew-filtered roster), not this
  node's slug (ADR-0021).

## NEXT

**MISSION LANDED.** Both gates passed and the deliver commit merged via **PR #64**
(`cyberplace = implemented`, `tavern.feature` @frozen, ledger shard
`cyberplace-backfill-tavern.d3a68e.jsonl`). The Mission A follow-up (Crimp+Tuner)
was filed and executed as **`fleet-crew-personas`** (PR #65). Brief is
retirement-eligible pending doctrine distillation.

Two follow-up CRs remain, both **separate change requests, not this mission**:
1. **de-dup `deriveInstallCommand`** — still duplicated (`src/awesome/lib.ts:146`
   private `function`, and `src/awesome/render.ts:36`). Export it from `lib.ts` and
   import in `render.ts`. Small, self-contained cleanup.
2. **awesome-list backfill** — the deferred draft stub becomes a full node only
   when demanded; not triggered.
