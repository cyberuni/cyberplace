# find-awesome-skill

Search configured awesome lists for curated skill recommendations with exact install commands.

## When to use

Use this skill when looking for vetted skills beyond the skills.sh leaderboard.

Good triggers include:

- "Find a skill for X"
- "Search awesome lists for deployment skills"
- "Is there a curated skill for …?"

## What it does

The skill searches layered awesome-list sources (local, project, user, and repo defaults), merges duplicates, and returns concise recommendations with `npx skills add` commands.

Primary CLI:

```bash
npx cyber-skills@<version> awesome find "<query>" --json
```

Configure sources with the `configure-awesome-sources` skill.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill find-awesome-skill
```
