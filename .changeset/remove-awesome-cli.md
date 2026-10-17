---
"cyberplace": minor
---

Remove the `cyberplace awesome` command group (`find`, `inspect`, `render`, `sources`) and the curated `awesome-skills.json` catalog it read. The feature had no remaining users after the awesome-skills plugins were dropped. Use `cyberplace find` to search marketplaces for skills. Skill installs from other repos still read a repo's own `awesome-skills.json` skill index when it has one.
