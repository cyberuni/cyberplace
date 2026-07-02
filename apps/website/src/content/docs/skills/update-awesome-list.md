---
title: update-awesome-list
description: Add or update a curated awesome-list entry, including summaries and README sync.
---

**Trigger:** "add this repo to the awesome list", "recommend this skill in our awesome list", "update the awesome list"

Adds or updates entries in the current repo's `awesome-skills.json`, then regenerates the README's awesome-list section.

## Choosing the entry unit

Inspect the target repo first — do not assume. Ask whether the user wants:

- the whole repo as an entry
- one or more specific skills as entries
- a repo entry with highlighted skills

For a broad-catalog repo (more than 12 public skills), recommend adding specific skills or highlights instead of the whole repo.

```bash
npx cyberplace@<version> awesome inspect owner/name
npx cyberplace@<version> awesome inspect owner/name --query "release"
```

## Editing rules

- Repo recommendations live under the top-level `repos` object, keyed by `owner/name`
- Skill recommendations live under `skills`, keyed by `owner/name::skill-name`
- Every entry gets a neutral `summary` and a separate `why_recommended`
- Tags are short, lower-kebab-case
- Repo entries may include typed `highlights` (`type`, `key`, `summary`, `why_recommended`, `tags`)

## Finish

```bash
npx cyberplace@<version> awesome render
```

Regenerates the README's bounded awesome-list section from `awesome-skills.json` so it never drifts by hand.

## Install

```bash
npx skills add cyberuni/cyberplace --skill update-awesome-list
```

## Related

- [find-awesome-skill](/skills/find-awesome-skill/) — the skill that reads what this one writes
- [configure-awesome-sources](/skills/configure-awesome-sources/) — configure which repos are searched
