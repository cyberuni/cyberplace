---
"cyberplace": minor
---

The `aced-spec-designer` agent now owns its quality loop internally. After writing eval artifacts, the designer invokes `aced-spec-validator`, revises only the affected files on failure, and repeats up to three times — surfacing questions to the user only when genuinely needed. The `aced create-spec` skill is now a thin entry point that invokes the designer and relays its `QUALITY_GATE` and `ITERATIONS` summary.
