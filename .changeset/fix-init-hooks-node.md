---
"cyber-skills": patch
---

Fix `init` hooks to run via `npx cyber-skills run-hook` instead of local bash scripts, so they work cross-platform and in repos that don't have `.agents/hooks/` scripts.
