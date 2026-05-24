---
name: migrate-repo-rename
description: Use this skill when a repo, package, or namespace rename requires migrating old references and local state.
---

# Migrate Repo Rename

## When to use

- The user says a repository was renamed and wants old references migrated.
- The user asks to migrate a package rename, org or namespace rename, or move old references after a rename.
- Local tooling still points at the old repo name even though tracked files were partly updated.
- The user mentions memory, history, cached state, or agent configuration that may still reference the old name.
- You need to verify whether the rename is complete across docs, package metadata, generated files, agent-local state, and git state.

## Steps

### 1. Establish the rename boundary

Identify the old and new repository names first. Decide whether the request is about tracked project content, local developer state, or both, because tracked files belong in commits while local git metadata usually does not.

### 2. Audit tracked references before editing

Search the working tree for the old repo name, package name, install path, and any obvious shorthand derived from the old name. Check package metadata, README/install instructions, generated lock or catalog files, workflow names, CLI names, and any user-agent strings used by scripts.

<!-- TODO: extract to scripts/audit-rename-targets.mts -->

### 3. Audit agent-local memory and config if present

Check for local memory, cache, session history, agent settings, or connector metadata that may still store the old name. Only inspect locations that are relevant to the active agent or explicitly mentioned by the user. Treat these as local migration state unless the user asks to persist the updates into tracked project files.

<!-- TODO: extract to scripts/audit-agent-local-state.mts -->

### 4. Audit git state separately when the repo uses git

If `.git/` exists, inspect git history and local config to distinguish already-migrated tracked content from stale local metadata. Check remotes, branch tracking, PR metadata in `.git/config`, and any ref or reflog state that still carries the old name. Skip git-only checks when the workspace is not a git repository or when the current agent does not surface that state.

<!-- TODO: extract to scripts/audit-local-git-state.mts -->

### 5. Change only the state that should move

Patch tracked files only when current checked-in content still references the old name. Update agent-local memory, cache, or config only when it clearly belongs to the renamed repo, package, or namespace. If git state exists, update local git config only for stale convenience metadata such as branch PR mappings or remote URLs. Preserve commit history; a rename migration should carry old history forward, not erase it.

### 6. Verify completeness from both angles

Re-run the searches against the working tree plus any agent-local or git-local files you changed. Confirm that current content no longer references the old name, and summarize any historical references that remain only in past commits or local history so they are not mistaken for migration gaps.

<!-- TODO: extract to scripts/verify-rename-migration.mts -->

## What NOT to do

- Do not rewrite git history just to remove old names from past commits unless the user explicitly asks for that high-risk operation.
- Do not assume every agent stores memory, cache, or history in the same place; inspect only relevant locations.
- Do not treat `.git/config` edits as tracked repo changes.
- Do not assume a rename is incomplete because old names still appear in historical commits.
