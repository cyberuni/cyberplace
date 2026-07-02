---
name: project_sdd_domain_type_resolution
description: SDD plugin delegates resolve by domain-type (artifact-type axis), not the spec folder name; fixed the bug where ACED never fired
metadata:
  type: project
---

SDD plugin resolution matches a spec's **`domain-type`** frontmatter field (artifact-type axis: `skill | subagent | command | agents-section | …`) against each registered plugin's `domains[]` — **not** the `DOMAIN`/implementation-folder name.

**Why:** plugin `domains[]` enumerate artifact *types*; the operator was matching them against the free-form folder name, which never coincides. So every agent-config spec fell through to SDD defaults and ACED never resolved despite being correctly registered in `.agents/universal-plugin.json`. Fixed in `fix(sdd): resolve plugin delegates by domain-type, not folder name`.

**How to apply:** `domain-type` is owned by `create-spec` (set once at scaffold, producers never write it), lives in `lifecycle-governance` schema, ownership in `ownership-governance`, resolution rule in `plugin-contract-governance`, matched in `sdd-operator` Step 1. Absent/unmatched `domain-type` → SDD defaults (correct for plain-code). Existing pre-fix drafts lack the field and must be backfilled to route to ACED. Related: [[project_aces_spec]], [[project_sdd_operator_builder_fabrication]].
