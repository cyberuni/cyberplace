---
name: init
description: Use this skill when initializing or improving an AGENTS.md file with codebase documentation for AI coding assistants.
---

Analyze this codebase and create or improve an AGENTS.md file, then symlink CLAUDE.md to it.

## AGENTS.md structure

Prefix the file with:

```markdown
# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.
```

Then add sections in this order:

1. **Skill Augmentations** — always first. Use this exact content:

```markdown
## Skill Augmentations

When reading any `SKILL.md` file, always check whether a `SKILL.local.md` exists in the same directory. If it does, treat its contents as additional instructions that extend the base skill. Local augmentations take precedence over the base skill where they conflict.
```

2. **Discipline sections** (when present, e.g. `## Commit Discipline`) — agent-first: dense normative rules in the body, `### References` at section bottom for commit-helper skills and `governance show` pointers. Load `npx cyber-skills@<exact> governance show skill-repo-structure` for the Discipline sections rules (see **Ensure cyber-skills CLI**).
3. Other sections only when grounded in existing project files (see usage notes below).

## Usage notes

- If there's already an AGENTS.md, compare each section you would add against what is already there. When content differs — not just missing, but substantively different — ask the user whether to update that section before changing it. Do not overwrite existing sections silently.
- If sections are missing entirely, add them without asking.
- Avoid listing every component or file structure that can be easily discovered.
- Do not make up sections like "Common Development Tasks" or "Tips for Development" unless that content appears in existing project files.
- If there are Cursor rules (in `.cursor/rules/` or `.cursorrules`) or Copilot rules (in `.github/copilot-instructions.md`), include the important parts.

## Ensure cyber-skills CLI

Before any subcommand:

1. Resolve exact semver: `npm view cyber-skills version` (never `@latest`, never a literal `<version>` placeholder).
2. Run `npx cyber-skills@<exact> <subcommand>`.

If step 2 fails (npx install prompt, `command not found`, or other non-zero exit):

1. Tell the user the workflow needs to download `cyber-skills@<exact>` from npm (no `package.json` change).
2. **Ask** whether to install.
3. After yes, use `npx --yes cyber-skills@<exact> <subcommand>` for the rest of this workflow.
4. If the user declines npx, ask whether to add `cyber-skills@<exact>` as a devDependency instead. Note drawbacks: it modifies `package.json` and may need ignoring in unused-dependency tools (e.g. `knip`). If they decline both, skip CLI steps.

## Repo-internal skills

After writing AGENTS.md, repair repo-private skills with the CLI — do not read each `SKILL.md` under `.agents/skills/` manually.

Run `npx cyber-skills@<exact> skill repair-private` (see **Ensure cyber-skills CLI**). Use `npx cyber-skills@<exact> skill validate-private` to check without writing.

This sets `metadata: internal: true` on repo-private skills and removes erroneous symlinks into `skills/`.

**Ongoing rule:** When writing or editing any `SKILL.md` under `.agents/skills/`, always include `metadata: internal: true` in the frontmatter.

## CLAUDE.md symlink

Symlink `CLAUDE.md` → `AGENTS.md`; if `CLAUDE.md` is a regular file, merge it into `AGENTS.md` first.

## Follow-up init skills

After init completes, discover companion `init-*` skills with `npx cyber-skills@<exact> skill list --grep 'init-*'` (or `npx --yes …` after install consent — see **Ensure cyber-skills CLI**).

List any found skills with a one-line summary from each skill's description. Ask the user whether they also want to run any of them.
