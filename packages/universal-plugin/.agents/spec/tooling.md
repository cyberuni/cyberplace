# Tooling — universal-plugin

Build, test, and packaging surface for the `universal-plugin` package. A flat reference doc (not a
scanned node).

- **Language / build** — TypeScript, bundled to a single `dist/cli.mjs` by **tsdown**. The tracked
  `bin/universal-plugin.mjs` is a slim shim that delegates to `dist/cli.mjs`.
- **Tests** — **vitest**. Unit tests per domain follow the `cli.ts` / `<domain>.ts` / `fs.ts` clean
  layering (pure domain logic, injected `fs`); smoke tests in `src/bin/` run the compiled binary via
  `spawnSync` and assert observable CLI behavior (exit codes, stdout, stderr).
- **Lint / format** — **biome**.
- **Dead-code** — **knip**.
- **Release** — **changesets** (the package is published; `publishConfig` set).
- **Publish allowlist** — `package.json` `files: ["bin","dist","governances"]`. This is the sole
  safeguard keeping the colocated `.agents/spec/` out of the published tarball; it must stay an
  allowlist, never regress to an `.npmignore`-style denylist.

## Architecture (see `packages/universal-plugin/AGENTS.md`)

- **Screaming architecture** — top-level `src/` folders are named after domain concepts, not
  technical roles. No `utils/` / `helpers/` / `services/` / `common/`.
- **Clean architecture** — dependencies flow inward only: `cli.ts` (interface) → `<domain>.ts`
  (application/domain, pure) ← `fs.ts` (infrastructure). Domain code touches no filesystem, network,
  or process.
