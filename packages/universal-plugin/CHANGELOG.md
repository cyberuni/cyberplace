# universal-plugin

## 0.2.0

### Minor Changes

- c6bc08a: Add `publish sync-version` command to sync the `version` field in `.plugin/plugin.json` from the npm package declared by a new `packagePath` field. Run `universal-plugin publish sync-version` after `changeset version` to keep the plugin manifest version in sync with the npm package. Also fixes the `build` command to strip `packagePath` from generated vendor manifests.
- 1100fa3: Add initial `universal-plugin` CLI with cross-vendor plugin management commands.

  New commands:
  - `prepare` — diffs the current vendor's installed plugins against the last snapshot and writes pending cross-vendor sync actions to state.
  - `sync apply <actionId>` — executes a pending install, update, or remove action using the target vendor's registered CLI command (or emits a manual instruction when none is configured).
  - `governance show <name>` / `governance list` — resolves and displays governance files by scope (global → project).
  - `asset-store` — manages the local store of downloaded plugin assets.
  - `self-update` — rewrites `universal-plugin` version pins in hook files when a newer version is detected.
  - `clean` — removes the local asset store directory.

  Supporting modules added: state file schema with tolerant reader and mutation helpers, vendor registry with bundled defaults and user-override support, source registry with store-path derivation for npm / GitHub / GitLab / URL sources.
