---
spec-type: behavioral
concept: [canonical-manifest, axi]
---

# plugin init — scaffold a new plugin project

`universal-plugin plugin init` scaffolds a new plugin project — a canonical `.plugin/plugin.json` and,
optionally, the standard plugin directories. It is the entry point that produces the source-of-truth
manifest the rest of the `plugin` group operates on. Follows the AXI output contract
([../../axi/](../../axi/README.md)).

> **Spec-first / impl-deferred.** No `init` command ships yet (`src/cli.ts` registers no `init`,
> there is no `src/init/` domain). This node is a frozen contract; the impl gate withholds
> certification until it is built.

## Use Cases

**Subject** — creating a new plugin project's canonical manifest and scaffolding:

- **Non-interactive by default** — `plugin init` never prompts interactively, with or without
  `--yes`; it writes `.plugin/plugin.json` with sensible defaults, including a `name` (the project
  directory name unless `--name` overrides it). `--yes` is a compatibility no-op kept for scripts
  that already pass it.
- **`--vendor` seeds extensions** — each `--vendor <id>` adds a `vendorExtensions.<id>` stub to the
  canonical manifest.
- **`--scaffold` creates standard dirs** — `skills/`, `agents/`, `governances/`, `commands/`; without
  `--scaffold`, only the manifest is created.
- **Guarded overwrite** — an existing `.plugin/plugin.json` fails with a message pointing at
  `--force`; `--force` overwrites it.
- **Default TOON output with aggregate** — the default (no `--format`) result is a TOON row per
  created file plus an aggregate `created N`; `--format json` stays the escape hatch, returning the
  list of `created` files and also suppressing prompts (redundantly-safe, since init never prompts).
- **Next-step suggestion** — a successful init ends with a stderr next-step line pointing at adding
  skills and running `plugin build`.
- **Fail-loud unknown flags** — an unrecognized flag exits 1 and stderr names it.
- **`--help`** — prints a concise synopsis, flags, and one example, exit 0.

**Non-goals** — deriving vendor manifests (`plugin build`); checking a manifest (`plugin validate`);
installing or publishing plugins (the `cyberplace` package).

Every scenario in [`init.feature`](./init.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **manifest defaults** | non-interactive scenarios write manifest with a `name`; directory-name default; `--name` override |
| **`--vendor` seeds extensions** | each `--vendor` adds a `vendorExtensions.<id>` stub |
| **`--scaffold` creates dirs** | scaffold creates skills/agents/governances/commands; without it, manifest only |
| **guarded overwrite** | existing manifest fails pointing at `--force`; `--force` overwrites |
| **non-interactive by default** | no-`--yes`/no-`--format` run shows no prompt; `--yes` is a no-op |
| **default TOON output** | successful init prints a TOON row per created file plus the `created N` aggregate |
| **`--format json`** | json returns `created` array incl. `.plugin/plugin.json`; also suppresses prompts (redundant-safe) |
| **next-step suggestion** | successful init ends with a stderr pointer to add skills then run `plugin build` |
| **fail-loud unknown flag** | `--frobnicate` exits 1 and stderr names the flag |
| **`--help`** | exits 0 with a synopsis, flags, and one example on stdout |
