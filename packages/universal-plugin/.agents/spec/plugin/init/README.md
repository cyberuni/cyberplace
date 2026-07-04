---
spec-type: behavioral
concept: [canonical-manifest]
---

# plugin init — scaffold a new plugin project

`universal-plugin plugin init` scaffolds a new plugin project — a canonical `.plugin/plugin.json` and,
optionally, the standard plugin directories. It is the entry point that produces the source-of-truth
manifest the rest of the `plugin` group operates on.

> **Spec-first / impl-deferred.** No `init` command ships yet (`src/cli.ts` registers no `init`,
> there is no `src/init/` domain). This node is a frozen contract; the impl gate withholds
> certification until it is built.

## Use Cases

**Subject** — creating a new plugin project's canonical manifest and scaffolding:

- **Non-interactive defaults** — `plugin init --yes` writes `.plugin/plugin.json` with sensible
  defaults, including a `name` (the project directory name unless `--name` overrides it).
- **`--vendor` seeds extensions** — each `--vendor <id>` adds a `vendorExtensions.<id>` stub to the
  canonical manifest.
- **`--scaffold` creates standard dirs** — `skills/`, `agents/`, `governances/`, `commands/`; without
  `--scaffold`, only the manifest is created.
- **Guarded overwrite** — an existing `.plugin/plugin.json` fails with a message pointing at
  `--force`; `--force` overwrites it.
- **`--format json`** — suppresses interactive prompts and returns the list of `created` files.

**Non-goals** — deriving vendor manifests (`plugin build`); checking a manifest (`plugin validate`);
installing or publishing plugins (the `cyberplace` package).

Every scenario in [`init.feature`](./init.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **non-interactive defaults** | `--yes` writes manifest with a `name`; directory-name default; `--name` override |
| **`--vendor` seeds extensions** | each `--vendor` adds a `vendorExtensions.<id>` stub |
| **`--scaffold` creates dirs** | scaffold creates skills/agents/governances/commands; without it, manifest only |
| **guarded overwrite** | existing manifest fails pointing at `--force`; `--force` overwrites |
| **`--format json`** | json suppresses prompts; returns `created` array incl. `.plugin/plugin.json` |
