---
name: publish-universal-plugin
description: Use this skill whenever the user wants to publish, release, submit, or share a plugin to the universal plugin marketplace so it works across Claude Code, Cursor, Codex, and GitHub Copilot CLI. Trigger on phrases like "publish my plugin", "submit to marketplace", "release plugin", "list my plugin", "share my plugin", or any mention of getting a plugin into the universal registry. The plugin should already be packaged before using this skill.
---

# Publish Universal Plugin

Guides adding an already-packaged plugin to a marketplace repo by opening a pull request. Each vendor runtime may have its own marketplace manifest file inside the marketplace repo — update every one that exists.

**Default marketplace repo:** `cyberuni/marketplace` (adjust if the user targets a different one)

## Overview

Publishing has three steps:

1. **Pre-flight** — validate the plugin is ready
2. **Prepare entries** — build the entry for each vendor marketplace file that exists
3. **Submit PR** — one PR that updates all relevant marketplace files

Work through each step in order. Do not skip pre-flight even if the user says the plugin is ready.

---

## Step 1: Pre-flight validation

Run these checks against the plugin directory. Stop and fix any failures before continuing.

### 1a. Required metadata

Read the plugin's root `plugin.json`. Verify:

- `name` — present, kebab-case (no spaces, no uppercase)
- `version` — present, valid semver (`x.y.z`)
- `description` — present, at least 10 characters
- `author` — present (string or `{name, email}` object)
- `homepage` or `repository` — at least one present
- `license` — present (SPDX identifier, e.g. `MIT`, `Apache-2.0`)

### 1b. Vendor manifest files

Each runtime expects its manifest at a specific path. Check all targeted runtimes and verify each has at minimum a `name` field:

| Runtime | Expected path |
|---|---|
| Claude Code | `.claude-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |
| Codex | `.codex-plugin/plugin.json` |
| GitHub Copilot CLI | `plugin.json` (root) |

See `references/vendor-requirements.md` for required fields and hook casing rules per vendor.

### 1c. Hook casing check

If the plugin has hooks, verify each vendor manifest uses the correct event name casing:

- Claude Code and Codex: **PascalCase** (`SessionStart`, `PreToolCall`)
- Cursor and GitHub Copilot CLI: **camelCase** (`sessionStart`, `preToolCall`)

Mixed casing causes silent hook failures at runtime.

### 1d. Skills check (if present)

If the plugin ships skills, each `skills/<name>/SKILL.md` must exist with valid YAML frontmatter containing at minimum `name` and `description`.

### 1e. Report

List what passed and what failed. Do not proceed to Step 2 until all checks pass.

---

## Step 2: Prepare marketplace entries

### 2a. Detect which vendor marketplace files exist

Clone or check out the marketplace repo locally, then look for vendor marketplace files:

| File | Runtime |
|---|---|
| `.claude-plugin/marketplace.json` | Claude Code |
| `.cursor-plugin/marketplace.json` | Cursor |

Only prepare entries for files that actually exist — do not create new vendor marketplace files.

### 2b. Claude Code entry (`.claude-plugin/marketplace.json`)

The richer format. Use this shape:

```json
{
  "name": "<plugin-name>",
  "source": {
    "source": "url",
    "url": "<git-clone-url>.git"
  },
  "description": "<one-line description>",
  "author": { "name": "<author>" },
  "homepage": "<URL>",
  "repository": "<git-clone-url>",
  "license": "<SPDX identifier>",
  "category": "<category>"
}
```

**`source`** — use `"source": "url"` with the `.git` clone URL for public repos. Other options: `github` (sparse checkout), `git` (with ref/path), `file`, `directory`.

**`category`** — choose closest: `research`, `skills`, `setup`, `productivity`, `plugin-authoring`.

**`skills`** — if the plugin ships skills users invoke directly, list their relative paths:
```json
"skills": ["./skills/my-skill"]
```

**`strict`** — set `false` unless the plugin requires exact version pinning.

Omit optional fields rather than leaving them empty.

### 2c. Cursor entry (`.cursor-plugin/marketplace.json`)

The simpler format — only three required fields:

```json
{
  "name": "<plugin-name>",
  "source": {
    "source": "url",
    "url": "<git-clone-url>.git"
  },
  "description": "<one-line description>"
}
```

The `source` field supports the same options as Claude Code (`url`, `github`, `git`, `file`, `directory`).

### 2d. Update scenario

If the plugin is already listed (this is an update), find its existing entry, update changed fields, and preserve any curator-added fields not in the standard shape. Do not overwrite `publishedAt` if present — add `"updatedAt": "<today>"` instead.

Show all prepared entries to the user and ask them to confirm before proceeding.

---

## Step 3: Submit PR

Use the `gh` CLI. Confirm commands that affect shared state before running.

### 3a. Get the marketplace repo locally

If the user has write access (org member), work directly:

```bash
gh repo clone cyberuni/marketplace
cd marketplace
```

If a fork is needed:

```bash
gh repo fork cyberuni/marketplace --clone --remote
cd marketplace
git fetch upstream && git merge upstream/main
```

### 3b. Create a branch

```bash
git checkout -b add-<plugin-name>
```

### 3c. Edit all detected marketplace files

For each vendor marketplace file detected in Step 2a, append the plugin entry to its `plugins` array. Preserve formatting and all existing entries exactly. Stage all changed files together.

### 3d. Commit and push

```bash
git add .claude-plugin/marketplace.json .cursor-plugin/marketplace.json  # whichever exist
git commit -m "feat: add <plugin-name> v<version>"
git push origin add-<plugin-name>
```

### 3e. Open the PR

```bash
gh pr create \
  --repo cyberuni/marketplace \
  --title "Add <plugin-name> v<version>" \
  --body "$(cat <<'EOF'
## Plugin

**Name:** <plugin-name>
**Version:** <version>
**Author:** <author>
**License:** <license>
**Category:** <category>

## Description

<description>

## Runtimes

- [x] Claude Code
- [x] Cursor
- [ ] Codex  (no marketplace file)
- [ ] GitHub Copilot CLI  (no marketplace file)

## Marketplace files updated

- `.claude-plugin/marketplace.json`
- `.cursor-plugin/marketplace.json`

## Links

- Homepage: <homepage>
- Repository: <repository>

## Checklist

- [ ] All targeted vendor manifests present and valid
- [ ] Hook event casing correct per vendor
- [ ] Semver version string
- [ ] SPDX license identifier
- [ ] Entry appended to each detected marketplace file
EOF
)"
```

Return the PR URL to the user when done.

---

## Common failure modes

| Problem | Fix |
|---|---|
| Hook events silently don't fire | Check casing: Claude Code/Codex need PascalCase, Cursor/Copilot CLI need camelCase |
| Codex rejects manifest | `version` and `description` are required by Codex |
| PR rejected: missing source link | Add `homepage` or `repository` to plugin.json |
| Name conflict in marketplace | Check existing entries in each marketplace file first |
| Plugin loads but skills missing | Add `skills` array to the Claude Code marketplace entry |

---

## Reference files

- `references/vendor-requirements.md` — required fields and hook casing rules per runtime
