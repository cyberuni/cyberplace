---
name: init
description: Use this skill to initialize a project's agent configuration to work across every major agent harness — analyze the repo and write or improve AGENTS.md, wire the per-harness config, repair repo-private skills, and suggest setting up SDD and registering ACED. Use when onboarding a repository for AI coding agents, setting up agent documentation, or making agent config work across Claude Code, Cursor, Codex, and Copilot.
---

# init — initialize harness-agnostic agent config

Analyze this codebase and initialize its agent configuration so it works across **every major agent harness**
(Claude Code, Cursor, Codex, GitHub Copilot CLI), not just the one you happen to be running in.

Registering ACED as an SDD plugin is the ACED registry skill's job; authoring or evaluating a skill is ACED's
domain; publishing or upgrading a cross-vendor plugin is `publish-universal-plugin` / `upgrade-universal-plugin`.
This skill only *suggests* those — it does not perform them.

## 1. Author AGENTS.md

Analyze the codebase and create or improve `AGENTS.md`, grounded in real project files.

Prefix a new file with:

```markdown
# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.
```

Then add sections only when grounded in existing project files:

- **Discipline sections** (e.g. `## Commit Discipline`) — dense normative rules in the body, `### References` at
  the section bottom for helper skills and `governance show` pointers.
- Commands (build, lint, test), an architecture overview, and project-specific notes — only when they appear in
  real files.

**Usage rules:**

- If `AGENTS.md` already exists, compare each section you would add against what is there. When content
  **substantively differs** (not just missing), **ask the user before changing that section** — never overwrite
  silently.
- If sections are **missing entirely**, add them **without asking**.
- Do **not** invent sections like "Common Development Tasks" or "Tips for Development" unless that content
  appears in existing project files. Avoid listing every file/component that is easily discovered.
- If Cursor rules (`.cursor/rules/`, `.cursorrules`) or Copilot rules (`.github/copilot-instructions.md`) exist,
  fold the important parts in.

## 2. Wire the per-harness config

Offload the cross-vendor wiring to the **`universal-plugin` CLI** rather than writing each harness's files by
hand — it is faster and spends fewer tokens.

1. Resolve an exact version: `npm view universal-plugin version` (never `@latest`, never a literal placeholder).
2. Run `npx universal-plugin@0.2.1 sync` to generate the per-harness config (Claude Code, Cursor, Codex,
   Copilot) from `AGENTS.md` and the shared source.

**If the user declines running `npx`:** do not silently skip the wiring — route to the separate direct-write
skill (the manual fallback that writes each vendor's files itself).

## 3. Point CLAUDE.md at AGENTS.md

- If `CLAUDE.md` is a **regular file**, merge it into `AGENTS.md` first, then symlink `CLAUDE.md` → `AGENTS.md`.
- If `CLAUDE.md` is **absent**, symlink `CLAUDE.md` → `AGENTS.md` directly (nothing to merge).
- If `CLAUDE.md` is **already a correct symlink** to `AGENTS.md`, leave it unchanged (idempotent no-op).

## 4. Repair repo-private skills

Repair repo-private skills through the aced `manage` gateway's **repair-private-skills** engine — do not
read each `SKILL.md` under `.agents/skills/` by hand.

Load `manage` and route to `repair-private-skills`, or run its engine directly:

```bash
node "<aced repair-private-skills dir>/scripts/repair-private-skills.mts" --root . repair
```

Use `validate` in place of `repair` to check without writing. It sets `metadata: internal: true` on
repo-private skills and removes erroneous symlinks into `skills/`.

## 5. Surface companion init skills

Discover companion `init-*` skills (e.g. `init-commit-discipline`, the ACED registry skill). List each with a
one-line summary from its description and **ask** whether to run any — never run them silently.

## 6. Suggest SDD, then ACED (gated)

After the core setup, suggest the higher-level workflow setup, honoring what the project has already declined.

**Recall prior declines first.** Where the harness has a memory facility, recall whether this project previously
declined the SDD suggestion and whether it declined the ACED suggestion — **independently**. Where the harness
has **no** memory facility, do not assume a prior decline: **ask**.

- **SDD** — if SDD is not set up and the project has not previously declined it, suggest setting it up.
- **ACED** — ACED is an SDD plugin, so only suggest registering it **once SDD is present** (or the user accepts
  setting it up). When SDD is present, the project has not declined ACED, **and** ACED is not already
  registered, suggest registering ACED by chaining `aced/init-aced`. Do **not** suggest ACED when SDD is absent
  and unaccepted, when ACED was previously declined, or when ACED is already registered.

Record the user's decision so a later run does not re-nag: where the harness supports memory, remember a
declined SDD offer and a declined ACED offer separately; where it does not, simply ask again next time.

## Report

State what was written or changed in `AGENTS.md`, how the per-harness config was wired (CLI or direct-write
fallback), the `CLAUDE.md` outcome, what repo-private repair did, which companion skills were offered, and which
setup suggestions were made or skipped.
