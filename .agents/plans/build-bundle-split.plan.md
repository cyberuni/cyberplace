---
name: build-bundle-split
status: active
todos:
  - content: "Explore: grill spec + suite — build/bundle split, workspace pin + doc-example ignore"
    status: completed
  - content: "Spec gate: freeze build.feature (narrowed) + bundle.feature (new) — self-asserted approve"
    status: completed
  - content: "Deliver: implement plugin bundle (workspace source + doc-example ignore) + narrow build src; verification per frozen scenario"
    status: pending
  - content: "Impl gate: cold sdd-impl-judge over frozen scenarios; pnpm verify"
    status: pending
  - content: "Handoff: PR; file follow-up CRs (builder automation + root version-script wiring; de-placeholder cyberlegion prose)"
    status: pending
---

# build-bundle-split — release-time workspace pin resolution via a build/bundle split

CR against the `universal-plugin` project spec. Source: github issue #84.

## NEXT

Spec gate DONE (self-asserted approve, `by: agent`; user to ratify in-session — auto-spec leash).
Both `.feature` frozen. Next: **deliver** — build the impl against the frozen suite.

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
