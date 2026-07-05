# Glossary — universal-plugin

Terms used across this spec. A flat reference doc (not a scanned node).

- **canonical manifest** — the single source-of-truth plugin descriptor at `.plugin/plugin.json`.
  Holds shared fields (`name`, `version`, `description`, `skills`, …), a `vendorExtensions` object
  keyed by vendor id, and an optional `$schema`. Everything the CLI derives comes from this file.
- **vendor** — a target AI-agent runtime: `claude-code`, `cursor`, `codex`, `copilot-cli`. Each
  expects its manifest at a different path and shape.
- **vendor manifest** — the per-vendor output file the build derives from the canonical manifest
  (e.g. `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`). `vendorExtensions` and `$schema`
  are stripped; the vendor's own `vendorExtensions.<vendor>` fields are merged over the shared fields.
- **vendorExtensions** — the object in the canonical manifest mapping a vendor id to the fields only
  that vendor needs. Merged at build time (vendor wins on conflict), stripped from output.
- **governance** — a named, version-pinned contract document (a `<name>.md`) that agents resolve by
  name rather than by path. `governance show` / `list` resolve these.
- **scope** — a location a governance document may live, resolved in a fixed precedence. For a plain
  name: `managed` → `project` → `local` → `user` → `package`. A namespaced `plugin/asset` lookup adds
  the `store` scope (the local asset-store) after the override scopes. Highest-precedence match wins.
  - **managed** — an OS-level, write-protected system dir (`/etc/universal-plugin/governances`, or the
    platform equivalent).
  - **project** — `<root>/governances/`.
  - **local** — `<root>/.agents/governances/`.
  - **user** — `~/.agents/governances/`.
  - **package** — the `governances/` dir shipped inside the `universal-plugin` package.
  - **store** — the local asset-store, reached only for a namespaced `plugin/asset` lookup.
