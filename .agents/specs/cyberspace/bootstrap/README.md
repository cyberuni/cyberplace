# bootstrap/ — initialize harness-agnostic agent config

Getting a project ready for agent-assisted development, independent of which harness the agent runs in:
analyze the codebase and write/refresh `AGENTS.md`, wire the vendor-specific config (CLAUDE.md symlink, vendor
skill directories), repair repo-private skills, and suggest companion setup the project has not already
declined (SDD, registering ACED as an SDD plugin).

Units:

- [**`init`**](./init/README.md) *(behavioral)* — the harness-agnostic agent-config initializer: write
  `AGENTS.md`, wire the per-harness config via the `universal-plugin` CLI, and suggest SDD then ACED
  registration, honoring prior declines.
- [**`write-vendor-config`**](./write-vendor-config/README.md) *(behavioral)* — the by-hand per-harness config
  writer; the manual fallback `init` routes to when the user declines the `universal-plugin` CLI.
