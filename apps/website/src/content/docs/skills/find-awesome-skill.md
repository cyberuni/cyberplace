---
title: find-awesome-skill
description: Search configured awesome-list sources and return curated skill recommendations with install commands.
---

**Trigger:** "find a skill for X", "is there a skill that can...", "how do I do X" (when it might already exist as a skill)

Searches the user's configured awesome-list sources, merges duplicates, and returns concise recommendations with exact install commands.

## Source layers

Sources are loaded in this order, deduped by `repo + path`:

1. `.agents/awesome-skill-sources.local.json`
2. `.agents/awesome-skill-sources.json`
3. `~/.agents/awesome-skill-sources.json`
4. The current repo's own `awesome-skills.json`, unless explicitly disabled

## Search

```bash
npx cyberplace@<version> awesome find "<query>" --format agent
```

Falls back to manual reasoning over the source layers when the CLI is unavailable, returns zero results, or the user asks which sources are searched — ranking by exact name match, then summary, then tag, then cross-source corroboration.

## Install

```bash
npx skills add cyberuni/cyberplace --skill find-awesome-skill -g
```

## Related

- [configure-awesome-sources](/skills/configure-awesome-sources/) — manage which sources this skill searches
- [update-awesome-list](/skills/update-awesome-list/) — add entries to a repo's own `awesome-skills.json`
