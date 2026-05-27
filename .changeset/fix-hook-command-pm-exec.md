---
"cyber-skills": patch
---

Fix `cyber-skills hook register` to use the repo's package manager exec wrapper (`pnpm exec`, `yarn exec`, `bunx`, or `npm exec`) instead of a hardcoded `node_modules/.bin` path. Falls back to pinned `npx` when no lock file is detected.
