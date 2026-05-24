---
name: patch-skill
description: Use this skill when contributing local improvements to an installed skill back to its source repo via PR.
---

# Patch Skill

When you have improved a skill you installed from another repo, this skill guides you through contributing that improvement back to the source via a pull request.

## When to use

- You modified a skill file (global `~/.agents/skills/<name>/SKILL.md` or repo-internal `.agents/skills/<name>/SKILL.md`) and want to send the improvement upstream
- The skill was installed from a public repo tracked in `skills-lock.json`

Do NOT use for repo-public skills (`skills/<name>/SKILL.md`) — if you're the author, this repo IS the source.

## Steps

### 1. Identify the skill to patch

From context or ask the user. Then look up its origin in `skills-lock.json` at the repo root:

```bash
cat skills-lock.json | jq '.skills["<skill-name>"]'
```

Fields to extract: `source` (`owner/repo`), `sourceType`, `skillPath` (path within that repo).

If there is no entry in `skills-lock.json`, ask the user for the source repo (`owner/repo`) and the skill's path within it.

### 2. Find the local skill file

Check which location holds the skill:

| Kind | Location |
|---|---|
| Global | `~/.agents/skills/<name>/SKILL.md` |
| Repo internal | `.agents/skills/<name>/SKILL.md` |

Never include `SKILL.local.md` in the PR — local augmentations stay local.

### 3. Diff against source

Fetch the current upstream version and compare:

```bash
gh api repos/<owner>/<repo>/contents/<skillPath> --jq '.content' | base64 -d > /tmp/skill-source.md
diff /tmp/skill-source.md <local-path>
```

- **No diff** → nothing to contribute; tell the user and stop
- **Diff found** → show the diff and ask for confirmation before proceeding

### 4. Check write access

```bash
gh api repos/<owner>/<repo> --jq '.permissions.push'
```

- `true` → create branch directly on the source repo
- `false` → fork first: `gh repo fork <owner>/<repo> --clone=false`, then use `<your-username>/<repo>` for the branch

### 5. Create branch and push

```bash
# Get HEAD SHA of default branch
HEAD_SHA=$(gh api repos/<owner>/<repo>/git/refs/heads/main --jq '.object.sha')

# Create branch: patch/<skill-name>-<short-slug>
gh api repos/<owner>/<repo>/git/refs \
  --method POST \
  --field ref="refs/heads/patch/<skill-name>-<short-slug>" \
  --field sha="$HEAD_SHA"

# Get current file SHA (needed for the PUT)
FILE_SHA=$(gh api repos/<owner>/<repo>/contents/<skillPath> --jq '.sha')

# Push the updated file
gh api repos/<owner>/<repo>/contents/<skillPath> \
  --method PUT \
  --field message="fix(<skill-name>): <description>" \
  --field content="$(base64 -w 0 <local-path>)" \
  --field sha="$FILE_SHA" \
  --field branch="patch/<skill-name>-<short-slug>"
```

If the skill has files in `scripts/` that were also changed, offer to include them or suggest opening an issue for larger-scope changes.

### 6. Open PR

```bash
gh pr create \
  --repo <owner>/<repo> \
  --base main \
  --head patch/<skill-name>-<short-slug> \
  --title "fix(<skill-name>): <description>" \
  --body "$(cat <<'EOF'
## Summary

<what changed and why>

## Test plan

- [ ] Run audit-skill against <skill-name> and confirm all checks pass

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 7. Report

Output the PR URL. Note: once the PR is merged, run `npx skills update` to refresh the `skills-lock.json` hash.

## What NOT to do

- Do not include `SKILL.local.md` content in the PR
- Do not push without showing the diff and getting user confirmation
- Do not create a PR if the diff is empty
