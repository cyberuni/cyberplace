---
"cyber-skills": minor
---

The `init` skill now checks for missing vendor skill symlinks after writing `AGENTS.md`. For each skill in `.agents/skills/`, it ensures a corresponding symlink exists in every vendor skill directory present in the repo (`.claude/skills/`, `.cursor/skills/`, `.opencode/skills/`), creating missing directories and symlinks as needed.
