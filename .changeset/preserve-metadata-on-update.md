---
"cyber-skills": patch
---

Preserve local frontmatter `metadata` block when running `skills update`. Previously, updating an installed skill overwrote the file entirely, discarding any locally added metadata fields such as `metadata: internal: true`.
