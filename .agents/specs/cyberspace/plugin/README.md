# plugin/ — author, publish, and upgrade cross-vendor plugins

The lifecycle of a universal agent plugin — one authored artifact that ships across Claude Code, Cursor, Codex,
and GitHub Copilot CLI — backed by the `universal-plugin` npm CLI so the work is offloaded to the tool rather
than done by hand for token efficiency.

Units *(behavioral — to be backfilled on demand)*:

- **`universal-plugin`** — scaffold and build a cross-vendor plugin from a single source using the CLI.
- **`publish-universal-plugin`** — publish a packaged plugin to the universal marketplace across runtimes.
- **`upgrade-universal-plugin`** — bump pinned `npx universal-plugin@<version>` calls across a project.
