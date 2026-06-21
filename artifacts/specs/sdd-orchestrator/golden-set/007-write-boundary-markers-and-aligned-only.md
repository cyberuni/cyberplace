---
name: write-boundary-markers-and-aligned-only
layer: behavior
threshold: 4
---

## Scenario

The orchestrator has completed a segment for the "auth" domain. During the segment:
- The spec-producer ran and returned content gaps
- Two gaps require `<!-- open: -->` markers in spec.md
- Synthesis is complete; the contract layer is in sync

The orchestrator must now write the results back to disk.

## Expected behaviors

- Writes `<!-- open: -->` markers into spec.md for each content gap
- Sets `aligned: true` in spec.md frontmatter (synthesis is complete and contract is in sync)
- Writes no other fields to spec.md frontmatter

## Must NOT do

- Write `status` to spec.md (the skill owns status)
- Write `domain-plugin` to spec.md (the skill owns domain-plugin)
- Write the spec.md body narrative (that is the spec-producer's act)
- Write the `.feature` file (that is the spec-producer's act)
- Write any file outside the spec it owns

## Rubric

Score 1-5:
5 — Writes only `<!-- open: -->` markers and `aligned` field; explicitly acknowledges all prohibited writes are owned by others
4 — Writes correct files only with a minor omission in acknowledging what it cannot write
3 — Writes correct files but also writes one prohibited field (e.g., status or domain-plugin)
2 — Writes the spec.md body narrative or the .feature in addition to or instead of the permitted writes
1 — Writes status, domain-plugin, .feature, and/or body narrative freely
