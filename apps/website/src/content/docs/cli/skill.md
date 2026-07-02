---
title: skill
description: List, validate, and repair skills in the repo and global install.
---

Utilities for managing skills on disk — listing, validating repo-private skills, and repairing their metadata.

## Commands

### `skill list`

List skills from the repo, global install, and the `cyberplace` package:

```bash
npx cyberplace@<version> skill list
npx cyberplace@<version> skill list --grep "init-*"
npx cyberplace@<version> skill list --format agent
npx cyberplace@<version> skill list --format json
```

### `skill validate-private`

Check that repo-private skills under `.agents/skills/` have `metadata: internal: true` and no erroneous symlinks into `skills/`:

```bash
npx cyberplace@<version> skill validate-private
```

### `skill repair-private`

Fix repo-private skills — sets `metadata: internal: true` and removes bad symlinks. Called by the `init` skill after writing `AGENTS.md`:

```bash
npx cyberplace@<version> skill repair-private
```

### `skill source`

Find the source repo of an installed skill:

```bash
npx cyberplace@<version> skill source commit-work
```

## Usage notes

- `skill list --grep` accepts a glob pattern — useful for discovering `init-*` companion skills.
- `skill repair-private` is idempotent; safe to run multiple times.
- Do not read `.agents/skills/` manually to check for `internal: true` — use `validate-private` instead.
