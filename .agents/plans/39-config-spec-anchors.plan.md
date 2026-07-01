---
name: "spec-anchors: configurable extra spec anchors + a manage skill to curate them"
overview: "CR against the sdd project spec (GitHub #39). Reframes #39's rejected `spec-layout` frontmatter into configurable EXTRA scan anchors declared in a persistent `.agents/sdd/spec-anchors.toml`, on top of the three fixed conventions. discover-specs reads the config and merges declared anchors into its scan (absence of the file = today's behavior byte-for-byte). Plus a user-facing management skill routed through the manage gateway (Housekeeping): list the fixed anchors (explained) + custom anchors, CRUD the custom anchors, induce an anchor pattern from a sample path, and preview which project(s) it matches before saving. Overturns a frozen, ADR-backed invariant — the `discovery.feature` 'consults no path registry' scenario + the README 'pure derivation, no drift' claim — so it re-opens the frozen discovery.feature (user-ratified) and pre-authorizes the Clearance narrowing. New ADR-0019 partially supersedes ADR-0017's no-registry clause."
todos:
  - id: config-format
    content: "Explore (build-to-learn): decide spec-anchors.toml schema (repo-relative dir vs <project>-glob capture), fixed-always + config-adds precedence, no-config back-compat, malformed handling. Prototype the config reader."
    status: pending
  - id: discovery-spec
    content: "Explore: re-open (ratified) & revise corpus/discovery/discovery.feature + README — replace the 'no path registry' scenario, add config-anchor recognition scenarios, keep status-shape + frontmatter-only + TOON."
    status: pending
  - id: anchors-node
    content: "Explore: new corpus/spec-anchors/ node (README + spec-anchors.feature) — config format; list fixed(explained)+custom; CRUD custom; induce-pattern-from-path; dry-run match preview."
    status: pending
  - id: manage-node
    content: "Explore: revise gateway/manage/manage.feature + README + manage/SKILL.md routing — add Housekeeping route 'configure the spec anchors' → the new engine."
    status: pending
  - id: adr
    content: "Explore/deliver: write artifacts/adr/0019-configurable-extra-spec-anchors.md; partially supersede ADR-0017 no-registry clause."
    status: pending
  - id: spec-gate
    content: "Spec gate: spawn cold sdd-spec-judge over the three touched nodes; on approve freeze each .feature (re-freeze discovery, freeze spec-anchors + manage), record gate lines in .agents/specs/sdd/ledger.jsonl, set status approved."
    status: pending
  - id: impl-discovery
    content: "Deliver: discover-specs.mts reads .agents/sdd/spec-anchors.toml (no-deps TOML), merges anchors into scan, name derivation for anchored specs; extend discover-specs.test.mts (incl. no-config back-compat)."
    status: pending
  - id: impl-anchors
    content: "Deliver: new plugins/sdd-new/skills/manage-spec-anchors/ (SKILL user-invocable:false internal:true, README, scripts/manage-spec-anchors.mts: --list/--add/--remove/--edit/--induce/--preview) + node:test."
    status: pending
  - id: impl-manage-wire
    content: "Deliver: wire manage/SKILL.md routing table + Housekeeping group to the new engine."
    status: pending
  - id: reconcile
    content: "Deliver: reconcile the 'three fixed locations' claim across corpus/README, lifecycle-governance, backfill/start-mission/resume-mission/sdd SKILLs, design/spec-structure.md."
    status: pending
  - id: impl-gate
    content: "Impl gate: spawn cold sdd-implementer over frozen scenarios; run node:test + pnpm verify; advance to implemented only when every frozen scenario's verification passes."
    status: pending
  - id: handoff
    content: "Handoff: Warden placement pass; commit per unit (ADR; discovery revise; spec-anchors node+engine; manage wire; reconcile); PR; close #39 with reframe rationale."
    status: pending
---

## NEXT

▶ START — intake done (this brief scaffolded, branch `github-39-spec-anchors`). Next: explore step 1
— run `resolve-governances` over the three touched nodes, get the user's **ratified re-open** of the
frozen `corpus/discovery/discovery.feature`, then build-to-learn the config format (`config-format`
todo) and author the three nodes' specs + suites.

## CR

GitHub issue #39 — "Support spec-layout frontmatter for alternative spec paths". Reframed (with the
user) from a rejected frontmatter field to configurable extra scan anchors + a manage skill to curate
them. **Pre-authorized hard-floor breaks:** (1) **freeze re-open** of `discovery.feature` — ratified
by the user in-session; (2) **Clearance** — the frozen "discovery consults no path registry" scenario
is narrowed/replaced. New **ADR-0019** partially supersedes ADR-0017's no-stored-registry clause.
