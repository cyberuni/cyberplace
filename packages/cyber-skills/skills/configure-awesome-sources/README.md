# configure-awesome-sources

Add, remove, or inspect awesome-list sources used by `find-awesome-skill`.

## When to use

Use this skill when curated skill discovery returns no results or you want custom awesome-list feeds.

Good triggers include:

- "Configure awesome skill sources"
- "Add an awesome list to search"
- "Which awesome lists does find-awesome-skill use?"

## What it does

The skill manages layered JSON config files:

- `.agents/awesome-skill-sources.local.json` (gitignored)
- `.agents/awesome-skill-sources.json`
- `~/.agents/awesome-skill-sources.json`

Each file lists GitHub repos and paths to `awesome-skills.json` catalogs, with optional `disabled_sources` to suppress inherited entries.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill configure-awesome-sources
```
