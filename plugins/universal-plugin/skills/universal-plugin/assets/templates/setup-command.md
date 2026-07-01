---
description: Post-install setup — merge always-on plugin guidance into project AGENTS.md
---

# Plugin Setup

Run once after installing the plugin.

## Instructions

1. Read all `.mdc` files under this plugin's `rules/` directory
2. Strip YAML frontmatter from each file
3. Append the remaining content as a new `## <plugin-name>` section in the project's `AGENTS.md`
4. Confirm the merge completed
5. The `rules/*.mdc` files are now redundant. Delete them if desired.
