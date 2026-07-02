---
title: Skill Repo Structure
description: Rules for organizing a repository that ships one or more agent skills.
---

**Load:** `npx cyberplace@<version> governance show skill-repo-structure`

Rules for organizing a **repository that ships one or more Agent Skills** — directories, manifests, contributor internals, and CI.

## Repo archetypes

### Collection

Skills only — publish via `npx skills add owner/repo`.

```text
LICENSE
README.md
skills/
  <skill-name>/
    SKILL.md
    README.md
```

### Maintained library

Collection plus validation and install hygiene. Add:

- `AGENTS.md` (and `CLAUDE.md` symlink for Claude Code)
- CI that runs `npx cyberplace@<version> audit validate` on PRs touching `skills/`
- Documented install commands in README
- Optional committed `skills-lock.json`

### Tooling library

Maintained library plus npm CLI, governances, or hooks shipped from the same repo. Add as needed:

```text
governances/    # version-pinned standards
src/            # CLI source
package.json    # publishable bin
.changeset/     # if using Changesets
```

Requires a single documented verify command in `AGENTS.md` (typecheck + lint + test + audit).

### Plugin bundle

Skills grouped under named bundles for Claude/plugin marketplaces.

```text
plugins/
  <bundle-name>/
    skills/<skill-name>/SKILL.md
    .claude-plugin/
```

## Required for any public skill repo

1. `LICENSE` at repo root
2. Public skills under `skills/<name>/SKILL.md`
3. Each skill complies with agentskills.io spec (`name` matches directory; valid frontmatter)
4. Each public skill has `README.md` alongside `SKILL.md` (when to use, what it does, install command)
5. No loose `SKILL.md` at repo root or outside a named skill directory
6. Root `README.md` with `npx skills add …` install instructions

## Contributor conventions

| Placement | Location | Notes |
| --------- | -------- | ----- |
| **User** | `~/.agents/skills/<name>/` | Not in the skill repo |
| **Project private** | `.agents/skills/<name>/` | `metadata: internal: true`; not shipped in `npx skills add` |
| **Project public** | `skills/<name>/` | Installed by consumers |

- Upstream patches from a local install map to `skills/<name>/…` in the source repo — never `.agents/skills/` upstream

## Discipline sections in AGENTS.md

`## Commit Discipline` and similar sections are **agent-first**:

- Dense normative rules in the body — no links to other files
- `### References` at section bottom — commit-helper skill name and `governance show` one-liners only
- Do not paste full governance bodies into `AGENTS.md`

Use `init-commit-discipline` to inject commit discipline.

## Optional manifests

| File | When |
| ---- | ---- |
| `skills-lock.json` | Reproducible skill installs |
| `skills.sh.json` | Listing on skills.sh |
| `.claude-plugin/marketplace.json` | Claude plugin UX |
| `governances/` | Repo ships version-pinned standards |

## Anti-patterns

- Duplicating a skill in both `skills/` and `.agents/skills/` without a documented reason
- Bloating `AGENTS.md` with full governance bodies — use `governance show` pointers instead
- Rationale prose in governances, discipline sections, or public skills
- `## Why`, `## Rationale`, `## Background` sections in agent-loaded artifacts
- Committing `SKILL.local.md` or secrets into public skill trees
- Running no CI on skill-only repos that accept external PRs
