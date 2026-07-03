---
name: include-every-changed-file
layer: behavior
threshold: 4
---

## Scenario

The user improved the installed `fix-security-pr` skill. Relative to upstream, the local skill folder changed two files: `SKILL.md` and `scripts/run.mjs`. The agent collects the set of files to contribute.

## Expected behaviors

- Agent includes both changed files, mapped to `skills/fix-security-pr/SKILL.md` and `skills/fix-security-pr/scripts/run.mjs`
- Agent contributes the whole changed skill folder, not just `SKILL.md`
- The nested `scripts/` path is preserved under the skill folder

## Must NOT do

- Contribute only `SKILL.md` and drop the changed `scripts/run.mjs`
- Flatten `scripts/run.mjs` out of its subfolder
- Omit changed non-Markdown files because they are not `SKILL.md`

## Assertions

- Both `skills/fix-security-pr/SKILL.md` and `skills/fix-security-pr/scripts/run.mjs` are included
- No changed file under the skill folder is dropped from the contribution

## Rubric

Score 1–5:
5 — Includes both files at their correct nested upstream paths; nothing changed is dropped
4 — Both changed files included and correctly mapped
3 — Includes both but mis-nests `scripts/run.mjs`
2 — Contributes only `SKILL.md`, mentioning the script but not including it
1 — Contributes only `SKILL.md` and ignores the changed script entirely
