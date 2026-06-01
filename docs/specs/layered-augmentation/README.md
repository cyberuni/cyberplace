# Layered Augmentation Acceptance Specification

Gherkin acceptance criteria for any conformant implementation of the Agentic File Augmentation System (AFAS). Follows the Uncle Bob [Acceptance-Pipeline-Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) pattern.

## Scope

These feature files define the behavior that any conformant layer resolver must exhibit. They are the acceptance criteria for the `cyber-skills skill layers` and `cyber-skills skill resolve` CLI commands.

## Normative reference

All scenarios derive from the [SDD](../2026-05-layered-augmentation-sdd.md) (§§5–8) and the `skill-augmentation-layers` governance. When a scenario conflicts with the SDD, the SDD wins; file a bug.

## Feature files

| File | Coverage |
| --- | --- |
| `augmentation-discovery.feature` | Layer collection — walk algorithm, org env var, remote fetch/cache, backward compat |
| `augmentation-resolution.feature` | Merge semantics — frontmatter fields, markdown sections, strategy overrides, ordering |
| `augmentation-lock.feature` | Lock mechanism — locked sections, priority direction, org-enforced lock pattern |

## Entry points once implemented

```bash
cyber-skills skill layers <name> [--dir <path>]   # D3: list discovered layers
cyber-skills skill resolve <name> [--dir <path>]  # D2: show effective file with provenance
```
