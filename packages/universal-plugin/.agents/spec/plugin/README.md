# plugin — the manifest command group

The `plugin` command group is the canonical-manifest engine. One canonical `.plugin/plugin.json` is
the source of truth; these verbs turn it into what each vendor expects and keep it well-formed:

- [`build/`](./build/README.md) — `universal-plugin plugin build` derives per-vendor manifests.
- [`validate/`](./validate/README.md) — `universal-plugin plugin validate` checks the canonical
  manifest against the schema and vendor rules.
- [`init/`](./init/README.md) — `universal-plugin plugin init` scaffolds a new plugin project.

> **Name note.** This `plugin` group is the manifest **authoring** engine (build / validate / init).
> It is **not** the old `plugin` install/registry verbs (`add` / `remove` / `update` / `find` /
> `search` / `list` / `migrate`) — those moved to the `cyberplace` package. The name was freed by
> that move and reused here.

This is a descriptive group index (no `spec-type` marker) — the behavior lives in the three unit
nodes below.
