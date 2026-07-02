---
"cyberplace": minor
---

Remove bundled skills from the npm package.

Skills previously shipped under `skills/` inside the `cyberplace` npm package are no longer included. They now live in plugin-specific directories in the source repository and must be installed via `npx cyberplace add` or the `skills` CLI.

Migration: replace any direct file references to the bundled skills with `npx cyberplace add cyberuni/cyberplace:<skill-name>`.
