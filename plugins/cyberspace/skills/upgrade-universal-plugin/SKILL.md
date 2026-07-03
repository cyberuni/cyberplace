---
name: upgrade-universal-plugin
description: Use this skill when upgrading pinned `npx universal-plugin@<version>` calls across a project to a newer version.
---

# Upgrade Universal Plugin

## When to use

When the user wants to bump the pinned `universal-plugin` version in hook commands, SKILL.md files, docs, or any other project files from the current pinned version to a target version (latest or a specific semver).

## Instructions

### Step 1 — Resolve the target version

If the user supplied a version (e.g. `2.1.0`), use it directly.

Otherwise, fetch the latest published version:

```bash
npm view universal-plugin version
```

### Step 2 — Find all pinned calls

Search the project for every occurrence of `npx universal-plugin@`:

```bash
grep -rn "npx universal-plugin@" . \
  --include="*.md" --include="*.json" --include="*.yaml" --include="*.yml" \
  --include="*.ts" --include="*.js" \
  | grep -v node_modules
```

Report a summary: how many files, which files, and the versions currently pinned.

If zero occurrences are found, report that there is nothing to upgrade and stop — do not modify files or create a commit.

### Step 3 — Confirm with the user

Show the list of files and the planned replacement, then ask for confirmation before making any changes.

Example summary:

```text
Found npx universal-plugin@1.2.3 in 4 files:
  <skill>/SKILL.md (2 occurrences)
  <hooks-file> (1 occurrence)
  <docs-file> (1 occurrence)

Replace all with npx universal-plugin@1.5.0? (y/n)
```

### Step 4 — Apply replacements

For each confirmed file, replace every `npx universal-plugin@<old-version>` with `npx universal-plugin@<target-version>`.

Only replace within the same major version by default — cross-major bumps may include breaking changes. Warn the user and ask for explicit confirmation before replacing across major versions.

```bash
# Dry-run first (review output before applying)
grep -rn "npx universal-plugin@" <file> | head -20
```

Apply with the Edit tool, not `sed`, so each change is reviewable.

### Step 5 — Verify

Re-run the search from Step 2 and confirm no old version strings remain (within the same major).

```bash
grep -rn "npx universal-plugin@" . \
  --include="*.md" --include="*.json" --include="*.yaml" --include="*.yml" \
  --include="*.ts" --include="*.js" \
  | grep -v node_modules
```

### Step 6 — Commit

Commit the changes following the project commit discipline:

```text
chore: upgrade npx universal-plugin pin to @<target-version>
```
