---
"cyber-skills": minor
---

Restructure CLI commands into a domain-based subcommand hierarchy.

Old flat commands are replaced by grouped subcommands:

Migration:
- `run-hook <name>` → `hook run <name>`
- `register-hooks --set <set>` → `hook register --set <set>`
- `inject-commit-discipline --commit-skill <name>` → `commit inject --commit-skill <name>`
- `skill-source <name>` → `skill source <name>`

New commands added: `audit validate`, `awesome find`, `awesome inspect`, `awesome render`, `awesome sources list|add|remove|disable|enable`, `commit resolve-skill`.
