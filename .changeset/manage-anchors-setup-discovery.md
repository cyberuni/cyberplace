---
"cyberplace": minor
---

SDD's `manage` skill regroups its top-level menu: `manage-spec-anchors` now lives under a new **Setup & discovery** group (alongside `backfill-project-spec`) instead of **Housekeeping**, since anchor config is a prerequisite for a project being discoverable at all. The `sdd` gateway also now offers `manage-spec-anchors` alongside `backfill-project-spec` when it finds no spec for a target project, rather than assuming the project was never scaffolded.
