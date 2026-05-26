# update-awesome-list

Add or update a curated awesome-list entry and sync the README awesome-skills section.

## When to use

Use this skill when curating skills for discovery in this repo or a similar awesome-list workflow.

Good triggers include:

- "Add this repo to the awesome list"
- "Update the awesome-skills entry for X"
- "Regenerate the README skills table"

## What it does

The skill inspects target repos, confirms whether to list the whole repo or specific skills, edits `awesome-skills.json`, and regenerates the bounded README section:

```bash
pnpm render:awesome-list
```

## Install

```bash
npx skills add cyberuni/cyber-skills --skill update-awesome-list
```
