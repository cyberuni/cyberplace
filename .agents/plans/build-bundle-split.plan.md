---
name: build-bundle-split
status: active
todos:
  - content: "Explore: grill spec + suite — build/bundle split, workspace pin + doc-example ignore"
    status: completed
  - content: "Spec gate: freeze build.feature (narrowed) + bundle.feature (new) — self-asserted approve"
    status: completed
  - content: "Deliver: implement plugin bundle (workspace source + doc-example ignore) + narrow build src; verification per frozen scenario"
    status: completed
  - content: "Impl gate: cold sdd-impl-judge over frozen scenarios; pnpm verify"
    status: completed
  - content: "Handoff: push + PR #85; follow-ups #86/#87/#88/#89; detached Warden spawned"
    status: completed
---

# build-bundle-split — release-time workspace pin resolution via a build/bundle split

CR against the `universal-plugin` project spec. Source: github issue #84.

## NEXT

Spec gate + deliver + impl gate DONE. Commits on branch `build-bundle-split`:
`3285861` (spec gate), `d7abf28` (impl gate). `pnpm verify` GREEN (19/19). bundle 20/20 frozen scenarios
pass; project stays `approved` (build's 3 AXI scenarios pre-existing/tracked). Placement final (no relocate).

**Handoff DONE:**
- PR **#85** opened (closes #84), branch `build-bundle-split` pushed.
- Follow-up issues filed: **#86** builder automation · **#87** root version-script wiring ·
  **#88** de-placeholder cyberlegion prose · **#89** implement build's AXI output surface (→ lets the
  project advance `approved`→`implemented`).
- `sdd:sdd-warden` spawned detached (post-mission formation pass; not gating).

Mission complete pending PR #85 review/merge + doctrine distillation. Keep this plan until then.

Deliver plan (delegate build to a sonnet impl-producer):
- New `packages/universal-plugin/src/bundle/` (domain `bundle.ts` + `cli.ts`), reusing `src/pin/`
  (`extractPins`, `PinFs`, `resolveSkillsDir`) via the `RegistryClient` DIP seam — a
  **WorkspaceVersionSource** that reads `packages/<pkg>/package.json` instead of `fetch`. Screaming +
  clean architecture per `packages/universal-plugin/CLAUDE.md` (domain pure, cli owns I/O).
- Doc-example ignore: a **pin-exempt** marker on a skill (frontmatter) → skill skipped entirely.
- External (non-workspace) pins skipped; missing-manifest fails loud.
- Narrow `src/build/`: remove pin resolution from build (drop `--registry/--range/--package/--allow-major/--skip-pins`);
  build derives manifests only. Keep `src/pin/` (bundle inherits it).
- Register `bundle` verb in the CLI. AXI output (TOON pins rows + aggregate, `--format json`, `--full`,
  empty state, next-step, fail-loud, `--help`). One verification per frozen scenario.
- `pnpm verify` (root, not package-only — catches knip + brief safety).

## Frozen contract
- `plugin/bundle/bundle.feature` (NEW, @frozen) — release materializer.
- `plugin/build/build.feature` (narrowed, re-@frozen) — manifests only, no pins.

Impl surface: `packages/universal-plugin/src/{bundle,build,pin}/`. CLI entry: `src/cli.ts`.

## Follow-up CRs (held OUT of this CR)
1. **Builder automation** — run `build` on agent-config edit + a pre-commit guard / dev-local
   invocation form (the ergonomic dev loop; `cyberplace` hook domain, different artifact-type).
2. **Root version-script wiring** — `"version": "changeset version && universal-plugin plugin bundle … && git add -A"`.
3. **De-placeholder prose** — reword the stale "not-yet-published / placeholder" notes in cyberlegion
   `legate` / `manage-inbox` skills (content change, not universal-plugin behavior).

## CR
https://github.com/cyberuni/cyberplace/issues/84
