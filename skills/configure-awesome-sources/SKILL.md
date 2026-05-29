---
name: configure-awesome-sources
description: Use this skill when adding, removing, or inspecting the awesome-list sources used for curated skill discovery.
---

# Configure Awesome Sources

Manage the layered source configuration used by `find-awesome-skill`.

## Layers

Configuration files are loaded from:

1. `.agents/awesome-skill-sources.local.json`
2. `.agents/awesome-skill-sources.json`
3. `~/.agents/awesome-skill-sources.json`

The local private file should stay gitignored.

Each file uses:

```json
{
  "version": 1,
  "sources": [
    { "repo": "owner/name", "path": "awesome-skills.json" }
  ],
  "disabled_sources": [
    { "repo": "owner/name", "path": "awesome-skills.json" }
  ]
}
```

Use `disabled_sources` to suppress inherited sources. Do not use an `enabled` field.

## Operations

List effective sources:

```bash
npx cyber-skills@<version> awesome sources list
```

Add a source:

```bash
npx cyber-skills@<version> awesome sources add owner/name --layer repo --path awesome-skills.json
```

Disable an inherited source:

```bash
npx cyber-skills@<version> awesome sources disable owner/name --layer repo --path awesome-skills.json
```

Enable a disabled source:

```bash
npx cyber-skills@<version> awesome sources enable owner/name --layer repo --path awesome-skills.json
```

Remove a direct source:

```bash
npx cyber-skills@<version> awesome sources remove owner/name --layer repo --path awesome-skills.json
```

## Guidance

- Use `local` for repo-private personal overrides.
- Use `repo` for team or company shared defaults in the current repository.
- Use `global` for user-wide defaults.
- If a repo-shared config disables a source, that suppression should win over a user-global source entry.
