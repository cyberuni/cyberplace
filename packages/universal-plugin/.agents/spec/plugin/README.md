# plugin — the plugin-project command group

The `plugin` command group operates on a plugin project. One canonical `.plugin/plugin.json` is the
source of truth for what the plugin *is*; `build` / `validate` / `init` turn it into what each vendor
expects and keep it well-formed, and `deps` manages what the plugin *depends on*:

- [`build/`](./build/README.md) — `universal-plugin plugin build` derives per-vendor manifests
  (dev-consumable form; no pins).
- [`deps/`](./deps/README.md) — `universal-plugin plugin deps ls | up | add | remove | scan` manages
  the `npx <pkg>[@<spec>]` package dependencies the plugin's skills invoke, against the managed list
  `.plugin/deps.json` declares.
- [`validate/`](./validate/README.md) — `universal-plugin plugin validate` checks the canonical
  manifest against the schema and vendor rules.
- [`init/`](./init/README.md) — `universal-plugin plugin init` scaffolds a new plugin project.

> **Name note.** This `plugin` group is the manifest **authoring** engine (build / validate / init).
> It is **not** the old `plugin` install/registry verbs (`add` / `remove` / `update` / `find` /
> `search` / `list` / `migrate`) — those moved to the `cyberplace` package. The name was freed by
> that move and reused here.

This is a descriptive group index (no `spec-type` marker) — the behavior lives in the three unit
nodes below.
