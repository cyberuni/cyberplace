# upgrade-universal-plugin skill

Upgrades all pinned `npx universal-plugin@<version>` calls across a project to the latest or a specific version.

## When to use

When you need to bump the `universal-plugin` version pin in hook files, SKILL.md files, docs, or any other project files.

## What it does

1. Resolves the target version (latest from npm, or user-supplied semver)
2. Finds every `npx universal-plugin@<version>` occurrence across the project
3. Confirms the replacement plan with the user
4. Applies changes using the Edit tool (reviewable diffs)
5. Verifies no old pins remain, then commits

Cross-major bumps require explicit confirmation.

## Install

```bash
npx skills add cyberuni/universal-plugin --skill upgrade-universal-plugin
```
