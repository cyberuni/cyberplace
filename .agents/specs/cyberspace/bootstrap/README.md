# bootstrap/ — initialize harness-agnostic agent config

Getting a project ready for agent-assisted development, independent of which harness the agent runs in:
analyze the codebase and write/refresh `AGENTS.md`, wire the vendor-specific config (CLAUDE.md symlink, vendor
skill directories), repair repo-private skills, and suggest companion setup the project has not already
declined (SDD, registering ACED as an SDD plugin).

Units:

- **`init`** *(behavioral — to be authored in explore)* — the harness-agnostic agent-config initializer.
  Migrated from the retired `skill-authoring/init`, extended to suggest SDD + ACED-plugin registration
  (chaining `aced/init-aced`) unless the project has declined, remembering that decision via harness memory
  where available and degrading to asking where it is not.
