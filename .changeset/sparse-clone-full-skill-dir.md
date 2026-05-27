---
"cyber-skills": minor
---

Install all files in a skill directory (not just `SKILL.md`) when running `registry add` or `registry update`. Files matching `*.local.*` are excluded. Uses a sparse git clone so only the requested skill directories are fetched, keeping installs fast.
