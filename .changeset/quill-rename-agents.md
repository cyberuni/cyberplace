---
"cyber-skills": patch
---

Rename quill's production-chain agents to reflect their roles: `quill-implementer` → `quill-judge` (the impl-judge) and `quill-writer` → `quill-spec-writer` (disambiguated from the impl-producer `quill-doc-writer`). Projects that registered quill via `init-quill` should re-run it to refresh the role-map entry.
