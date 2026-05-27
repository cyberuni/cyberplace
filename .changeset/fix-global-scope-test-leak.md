---
"cyber-skills": patch
---

Add optional `home` parameter to `AddOptions` and `getInstallDir` to allow overriding the home directory in tests, preventing the global-scope install path from leaking into the real `~/.agents/skills`.
