# 0001 — Realign universal-plugin to the build/derivation engine

**Status:** accepted
**Date:** 2026-07-04

## Context

The legacy spec at `packages/universal-plugin/specs/` described a monolithic CLI: build, validate,
init, prepare, governance, plugin-install (add/remove/find/…), hook, and marketplace. That predates
the repo's three-way concern split. Meanwhile the shipped code had drifted the other way — it
implements a cross-vendor **sync engine** (`prepare <vendor-id>` snapshot/diff, `sync apply`,
`self-update`, `publish sync-version`, `asset-store`, source/vendor registries, state) that no spec
covered. Neither the old spec nor the shipped surface matched the package's intended responsibility.

## Decision

`universal-plugin` owns exactly two concerns:

1. **The `plugin` command group** — `plugin build` (derive vendor manifests), `plugin validate`
   (check the canonical manifest), `plugin init` (scaffold a project).
2. **`governance`** — resolve governance documents by name across scopes.

Everything else is declared out:

- **marketplace / plugin-install / lifecycle-hook** → the `cyberplace` package.
- **agent-facing authoring skills** → the `cyberspace` / `aced` plugins.
- **the cross-vendor sync engine** → a non-goal **destined to leave** this package; its destination
  is a future decision, not made here.
- **`prepare` (design-doc post-install artifact-copy)** → dropped; not chartered.

The `plugin` command namespace is **reused**: the old `plugin` install/registry verbs moved to
`cyberplace`, so the name is free for the authoring verbs. `plugin/README.md` states the distinction.

## Consequences

- `build` re-nests from top-level `universal-plugin build` to `universal-plugin plugin build` — a
  breaking CLI change touching the smoke tests and any pinned `npx universal-plugin@… build` callers.
- `plugin validate` and `plugin init` are **spec-first**: frozen contracts with no implementation
  yet. The impl gate withholds certification for them; the root spec stays `approved`, not
  `implemented`, until they are built.
- The shipped sync engine keeps running but is un-chartered here; a follow-up mission must decide its
  home before this spec can claim to describe the whole package.
