---
"cyberplace": minor
---

Replace the `sdd` plugin's implementation with the conductor/`sdd-automaton` design (previously staged at `plugins/sdd-new`). The plugin still installs as `sdd`, but its skill set has changed: `start-mission`, `spec-gate`, `discover-specs`, `discover-plans`, `pause-mission`, `resume-mission`, `manage`, `manage-spec-anchors`, `concept-index`, `place-node`, `plan-retirement`, `resolve-governances`, and `resolve-durability` replace the old `create-spec`, `validate-spec`, `revise-spec`, `split-spec`, `dedupe-specs`, `spec-digest`, `spec-governance`, `render-spec-graph`, and `plan-producer-governance` skills. Reinstall the plugin to pick up the new skill set.
