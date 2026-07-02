---
"cyberplace": minor
---

The `sdd` plugin's `manage-spec-anchors` config now supports `**` in an anchor pattern, matching zero or more directory levels (any depth). This lets a custom anchor name a root whose specs sit at varying depth beneath it, e.g. `archive/**`.
