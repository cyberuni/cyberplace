---
spec-type: behavioral
concept: [bootstrap]
---

# init — initialize harness-agnostic agent config

Analyze a project and initialize its agent configuration to work across every major agent harness — write or
refresh `AGENTS.md`, wire the per-harness config through the `universal-plugin` CLI, merge/symlink `CLAUDE.md`,
repair repo-private skills, surface companion `init-*` skills, and suggest setting up SDD and registering ACED
as an SDD plugin unless the project has already declined.

## Use Cases

**Fit:** strong — `init` makes a genuine activation decision (general harness-agnostic onboarding vs. the narrow
`init-aced` registry write, vs. authoring/evaluating skills in ACED) and carries non-deterministic judgment
(which `AGENTS.md` sections are grounded enough to write, when an existing section differs enough to ask before
overwriting, how to phrase the SDD/ACED suggestions, and how to recall a prior decline), so all four eval
layers carry signal.

**Subject** — getting a project ready for agent-assisted development independent of the harness:

- **Author `AGENTS.md`** — analyze the codebase and write it, or compare against an existing one and ask before
  overwriting a section whose content substantively differs; add missing sections without asking; ground every
  section in real project files rather than inventing generic ones.
- **Wire cross-vendor config via the `universal-plugin` CLI** — offload the per-harness wiring (Claude Code,
  Cursor, Codex, Copilot CLI) to the tool for token efficiency rather than writing each vendor's files by hand.
  If the user declines running `npx`, route to the separate direct-write skill (the manual fallback).
- **Merge/symlink `CLAUDE.md` → `AGENTS.md`** — merging a pre-existing regular `CLAUDE.md` in first.
- **Repair repo-private skills** — set `metadata: internal: true` and fix erroneous symlinks via the CLI, not by
  reading each `SKILL.md` by hand.
- **Discover companion `init-*` skills** — list them with a one-line summary and offer to run them.
- **Suggest SDD, then ACED (gated)** — if SDD is not set up, suggest setting it up; once SDD is present (or the
  user accepts setting it up), suggest registering ACED as an SDD plugin by chaining `aced/init-aced`. ACED is
  only ever offered behind SDD, and not re-suggested when ACED is already registered.
- **Respect prior declines** — remember a declined SDD offer and a declined ACED offer **independently** via
  harness memory, and skip the matching suggestion on a later run; where the harness has no memory, ask again
  rather than assume.

**Non-goals** — registering ACED as an SDD plugin is `aced/init-aced` (init only *suggests and chains* it, never
writes the registry itself); authoring or evaluating a skill is ACED (`define-skill` / `improve` / `test-skill`);
publishing or upgrading a cross-vendor plugin is `publish-universal-plugin` / `upgrade-universal-plugin`;
setting up SDD itself is SDD's own setup, which init only suggests. The direct-write cross-vendor wiring used
when the user rejects `npx` is a separate fallback skill, not init's own step.

Every scenario in [`init.feature`](./init.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **trigger on a harness-agnostic onboarding request** | init fires on "initialize AGENTS.md" / "set up agent docs" / "make my config work across Cursor and Claude Code", and defers a registry-only, skill-authoring, or publish request to its sibling |
| **author AGENTS.md grounded** | writes grounded sections, adds missing ones silently, asks before overwriting a differing existing section |
| **wire cross-vendor config via the CLI** | offloads per-harness wiring to `universal-plugin`; on npx-decline routes to the direct-write fallback skill |
| **merge/symlink CLAUDE.md** | symlinks `CLAUDE.md` → `AGENTS.md`, merging a pre-existing regular file first |
| **repair repo-private skills** | fixes `metadata: internal: true` and symlinks via the CLI, not by hand |
| **discover companion init skills** | lists `init-*` skills and offers to run them |
| **suggest SDD then ACED, gated** | suggests SDD when absent; suggests ACED registration only once SDD is present or accepted |
| **respect prior declines independently** | skips a previously-declined SDD or ACED suggestion via harness memory; asks again where no memory exists |
