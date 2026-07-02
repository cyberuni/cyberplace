---
title: configure-awesome-sources
description: Add, remove, or inspect the awesome-list sources used for curated skill discovery.
---

**Trigger:** "add an awesome source", "configure skill discovery sources", "why isn't find-awesome-skill finding anything"

Manages the layered source configuration `find-awesome-skill` searches.

## Layers

1. `.agents/awesome-skill-sources.local.json` — repo-private, should stay gitignored
2. `.agents/awesome-skill-sources.json` — team/company shared, committed
3. `~/.agents/awesome-skill-sources.json` — user-global defaults

Each file:

```json
{
  "version": 1,
  "sources": [{ "repo": "owner/name", "path": "awesome-skills.json" }],
  "disabled_sources": [{ "repo": "owner/name", "path": "awesome-skills.json" }]
}
```

Use `disabled_sources` to suppress an inherited source — there is no `enabled` field. A repo-shared disable wins over a user-global source.

## Operations

```bash
npx cyberplace@<version> awesome sources list
npx cyberplace@<version> awesome sources add owner/name --layer repo --path awesome-skills.json
npx cyberplace@<version> awesome sources disable owner/name --layer repo --path awesome-skills.json
npx cyberplace@<version> awesome sources enable owner/name --layer repo --path awesome-skills.json
npx cyberplace@<version> awesome sources remove owner/name --layer repo --path awesome-skills.json
```

## Install

```bash
npx skills add cyberuni/cyberplace --skill configure-awesome-sources -g
```

## Related

- [find-awesome-skill](/skills/find-awesome-skill/) — the skill that consumes this configuration
- [update-awesome-list](/skills/update-awesome-list/) — curate a repo's own `awesome-skills.json` entries
