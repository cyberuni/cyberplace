---
"cyber-skills": minor
---

Remove bundled skills from the npm package.

Skills previously shipped under `skills/` inside the `cyber-skills` npm package are no longer included. They now live in plugin-specific directories in the source repository and must be installed via `npx cyber-skills add` or the `skills` CLI.

Migration: replace any direct file references to the bundled skills with `npx cyber-skills add cyberuni/cyber-skills:<skill-name>`.
