---
"cyber-skills": patch
---

Retire the project-private `audit-skill` skill in favor of `improve-skill`, which already covered its full checklist plus fix-application (Q13–Q16 agentskills.io checks, `references/check-definitions.md`, apply-fixes step). `improve-skill` moves from `plugins/universal-plugin/skills/improve-skill` to `plugins/aces/skills/improve-skill`, installable as `npx skills add cyberuni/cyber-skills --skill aces/improve-skill`. The CLI's `audit validate` follow-up message now points at `improve-skill`.
