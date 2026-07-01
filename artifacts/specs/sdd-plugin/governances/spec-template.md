---
status: draft
priority: <1–n; lower number = higher priority>
blocked-by:
  - <spec-slug>   # omit section if no dependencies
aligned: false
---

# <Feature Name>

---

## What

<!-- What does this feature do? Describe observable behavior, not implementation. -->

---

## Why

<!-- What problem does this solve? Why is it needed now? What breaks or is painful without it? -->

---

## Design decisions

<!-- Key choices made during design. For each: what was chosen, what was rejected, and why. -->
<!-- Omit this section only if no non-obvious choices were made. -->

---

## Command surface / API

```
<command syntax with options>
```

**Exit codes / return values:**
- `0` — success
- `1` — <primary error case>

**Gherkin scenarios:** [<domain>.feature](./<domain>.feature)

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `specs/<domain>/spec.md` |
| Scenarios | `specs/<domain>/<domain>.feature` |
<!-- Add rows as plan, tasks, implementation, docs, etc. are created -->
