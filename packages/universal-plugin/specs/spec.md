# universal-plugin

**Status:** In progress
**Issue:** [#3](https://github.com/cyberuni/universal-plugin/issues/3)

Behavioral specifications for the `universal-plugin` CLI. Each domain has its own subfolder with a narrative spec (`spec.md`) and Gherkin scenarios (`.feature`).

---

## What

`universal-plugin` is the CLI for universal AI agent plugin authoring, distribution, and consumption. It provides a single tool that works across all major AI agent runtimes (Claude Code, Cursor, Codex, Copilot CLI).

---

## Why

Two gaps exist in the current plugin authoring experience:

1. **Authoring gap:** No commands for validating, initializing, or preparing a plugin after install. Authors must do this manually per vendor.
2. **Referencing gap:** Agents and skills that need governance content grep for files at runtime using filesystem paths. There is no stable name-to-location contract — fragile when plugin structure changes.

`universal-plugin` closes both gaps with a full CLI covering the plugin lifecycle and a stable `governance` subcommand so agents resolve governance by name, not path.

---

## Goals

1. Full command surface covering the plugin lifecycle: build, validate, init, prepare, install/manage, governance, marketplace.
2. A stable `governance` subcommand so agents resolve governance by name, not path.
3. Internal contributor tooling (agents, skills, governances) built first and used to implement the rest.
4. Screaming architecture — one domain folder per command group.

---

## Architecture

### Source layout

```
src/
  build/        # compile canonical manifest into vendor-specific output
  validate/     # validate .plugin/plugin.json against schema and vendor rules
  governance/   # resolve and display governance documents by scope
  init/         # scaffold a new plugin project
  prepare/      # run after install/update to set up runtime artifacts
  marketplace/  # publish and register plugins
  plugin/       # add/remove/update/find/search/list/migrate installed plugins
  hook/         # register and manage lifecycle hooks
  cli.ts
  cli-options.ts
  output.ts
```

### Per-domain pattern (3-file)

Every domain follows the same structure:

| File | Responsibility |
|---|---|
| `cli.ts` | Commander adapter — parses args, calls domain logic, formats output |
| `<domain>.ts` | Pure domain logic — no I/O, fully unit-testable |
| `fs.ts` | Filesystem/network side effects — injected as a dependency |

### Testing

Unit tests use BDD/Gherkin descriptions and inject a mock `fs` — no real filesystem access:

```ts
describe('build plugin', () => {
  describe('Given a valid .plugin/plugin.json', () => {
    it('When building for claude-code, Then writes .claude-plugin/plugin.json', ...)
  })
})
```

Smoke tests (in `src/bin/`) run the compiled binary via `spawnSync` and test observable CLI behavior (exit codes, stdout, stderr).

---

## Command surface

| Command | Domain | Status |
|---|---|---|
| `universal-plugin build [--vendor <id>]` | [build](./build/spec.md) | Implemented |
| `universal-plugin governance show <name>` | [governance](./governance/spec.md) | Implemented |
| `universal-plugin governance list` | [governance](./governance/spec.md) | Implemented |
| `universal-plugin validate` | validate | Planned |
| `universal-plugin init` | init | Planned |
| `universal-plugin prepare` | prepare | Planned |
| `universal-plugin add <plugin>` | plugin | Planned |
| `universal-plugin remove <plugin>` | plugin | Planned |
| `universal-plugin update [plugin]` | plugin | Planned |
| `universal-plugin find <query>` | plugin | Planned |
| `universal-plugin search <query>` | plugin | Planned |
| `universal-plugin list` | plugin | Planned |
| `universal-plugin migrate` | plugin | Planned |
| `universal-plugin hook register` | hook | Planned |
| `universal-plugin marketplace publish` | marketplace | Planned |
| `universal-plugin marketplace register` | marketplace | Planned |

---

## Two-layer agent/skill system

### Layer 1 — Internal contributor tooling (`.agents/`)

Built first. Used to build and iterate on everything else. One pass per domain.

```
.agents/
  agents/
    domain-implementer.md
    spec-writer.md
    doc-writer.md
  skills/
    add-domain/SKILL.md
    add-spec/SKILL.md
  governances/
    screaming-architecture.md
    clean-architecture.md
```

### Layer 2 — Shipped with the plugin

```
commands/
  build.md
  validate.md
  init.md
  prepare.md
skills/
  universal-plugin/SKILL.md
agents/
  builder.md
  validator.md
  installer.md
```

Layer 1 is built before Layer 2. Each domain pass improves Layer 1 tooling, which is then used to implement the next domain.

---

## Naming conventions

| Layer | Convention | Examples |
|---|---|---|
| CLI commands / skills | short imperative verbs | `build`, `validate`, `init`, `prepare` |
| Agents | neutral role nouns | `builder`, `validator`, `installer`, `migrator` |
| Hooks | PascalCase | `PreBuild`, `PostBuild`, `PluginInstalled` |
| Error types | PascalCase noun phrases | `ManifestNotFound`, `ValidationFailed` |
| Config keys | camelCase noun phrases | `defaultVendors`, `pluginRoot`, `registryUrl` |

---

## Development process

- **Spec-first:** each domain starts with a spec (`spec.md` + `.feature`) before any implementation. See [cyberuni/spec-driven-development](https://github.com/cyberuni/spec-driven-development).
- **Layer 1 first:** build internal agents/skills, then use them to implement Layer 2.
- **Unit of work = one commit:** domain impl + spec + docs update together. Never batch unrelated concerns.
- **Iterate:** improve Layer 1 tooling on each domain pass.

---

## Tools

vitest, biome, tsdown, tsx, changeset, commitlint, husky, knip

---

## Open questions

1. **`commands/` vs `skills/` for slash invocation** — the correct distinction across Claude Code, Cursor, Codex, and Copilot CLI is unresolved. Produce an ADR or governance `slash-invocation.md` before implementing Layer 2 commands.

2. **`plugin.json` top-level `governances` field** — whether to add this to the canonical schema is a standards-track question. Not needed for the CLI; `universal-plugin governance` is the consumption-side solution. Propose to open-plugin-spec when the consumption pattern is proven.

3. **Scope path conventions** — the user-scope path (`~/.agents/governances/`) assumes a shared agents config directory. Align with whatever path `cyberplace` uses before shipping `governance show`. The managed scope path must be write-protected at the OS level to be a meaningful security boundary.

---

## Domain index

- [build](./build/spec.md) — compile canonical plugin manifest into vendor-specific output files
- [governance](./governance/spec.md) — resolve and display governance documents by name across scopes
- [validate](./validate/spec.md) — validate `.plugin/plugin.json` against schema and vendor rules
- [init](./init/spec.md) — scaffold a new plugin project
- [prepare](./prepare/spec.md) — post-install setup; copy runtime artifacts to vendor-expected paths
- [plugin](./plugin/spec.md) — add, remove, update, find, search, list, and migrate installed plugins
- [hook](./hook/spec.md) — register lifecycle hooks into vendor-specific config files
- [marketplace](./marketplace/spec.md) — publish and register plugins in the discoverable index
