---
"cyber-skills": minor
---

Add support for full git URLs in `skills add` and `skills update`.

Pass any HTTPS or SSH clone URL directly, including browser-copy branch URLs from GitHub (`/tree/`), GitLab (`/-/tree/`), and Gitea/Forgejo/Gogs (`/src/branch/`). Provider type is detected from the URL path structure so self-hosted instances work without extra configuration. The `update` command re-fetches from the stored URL automatically.
