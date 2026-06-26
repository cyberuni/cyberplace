# harness/ — engineering & distribution harness

The project's standing engineering & distribution harness — **the forge loop's
subject**. This folder is the spec-level abstraction of `package.json`, the CI YAML, and
`CONTRIBUTING.md`: it describes what SDD is built and shipped *with*. The actual
`plugins/sdd/package.json`, `.github/workflows/*.yml`, marketplace manifests, and
`.changeset/` files are the code-level artifacts it abstracts. `harness/` pairs with
`forge/` exactly as `corpus/` pairs with `formation/`: the forge loop (step 5) raises CRs
that evolve this subject. It references the monorepo-level agent configuration and owns
only the SDD-specific bits.

## What it owns

- **Toolchain (+ what each is for).** The harness names the engineering tools and the role
  each plays; it does not pin a stack the project must adopt — the repo's existing
  configuration is the source of truth.
- **CI/CD.** The pipelines that gate every change and publish releases.
- **Distribution / release.** How the SDD plugin reaches users — the marketplace manifest,
  changeset-driven versioning, and the public skill/agent manifest.
- **Contribution.** The commit discipline and contributor workflow specific to SDD work.
- **Contract-registry init-WRITE.** The install-time write of a plugin's `sdd-plugins`
  entry into `.agents/universal-plugin.json` (the **shape** of that entry lives in
  `../design/specialists-and-bundles.md`; the **read/resolution** lives in `../mission/`).
- **Public skill manifest.** The plugin's declaration of which skills and agents it exposes.

## Toolchain

The SDD plugin is authored as markdown skills and agents plus TypeScript verification
scripts; it is not a compiled npm package, so it carries no bundler of its own. It inherits
the monorepo toolchain and adds only SDD-specific verification.

| Tool | Role |
|---|---|
| **pnpm** (`pnpm@11`, Node `>=22`) | workspace package manager for the monorepo |
| **turbo** | task runner — `build`, `test`, `typecheck`, `verify` fan out across packages |
| **biome** | lint + format (`pnpm check` writes fixes, `pnpm lint` checks only) |
| **vitest** | unit tests for the `cyber-skills` package; built first via **tsdown** (CLI bundler) |
| **node `--experimental-strip-types`** | runs the SDD spec-verification `*.mts` scripts directly, no build step |
| **changesets** | version + changelog management for published packages |
| **husky + commitlint** (`@commitlint/config-conventional`) | enforce Conventional Commits at commit time |
| **knip** | dead-code / unused-dependency detection |

SDD-specific verification is the `verify:specs` script: it runs the spec-state checker
(`check-spec-state.mts`), the `.feature` checker (`check-feature.mts`), and the operator
test (`sdd-operator.test.mts`) under `plugins/sdd/skills/validate-spec/scripts/` and
`plugins/sdd/agents/`. These enforce legal frontmatter-state tuples and boolean Gherkin
mechanically, independent of the human gate.

## CI/CD

- **Pull requests** (`.github/workflows/pull-request.yml`) — on `opened`/`synchronize`, run
  the shared `cyberuni/.github` `pnpm-verify.yml` reusable workflow on `ubuntu-latest`
  (`skip-playwright: true`). This is `pnpm verify` (typecheck + lint + test + audit), the
  same command contributors run locally; it gates every change to `plugins/sdd/`.
- **Release** (`.github/workflows/release.yml`) — on push to `main`, re-run `pnpm-verify`,
  then the shared `pnpm-release-changeset.yml` workflow (`changeset publish`) with
  `id-token`, `contents`, and `pull-requests` write permissions and inherited secrets.

## Distribution / release

- **Marketplace manifest.** The SDD plugin is distributed through agent marketplaces, not
  `npm publish`: `plugins/sdd/package.json` is `private`. Listings live in
  `.claude-plugin/marketplace.json` and `.cursor-plugin/marketplace.json`.
- **Public skill manifest.** `plugins/sdd/.plugin/plugin.json` declares `name: "sdd"`, its
  description, and the `skills: ./skills` and `agents: ./agents` pointers — the contract for
  what the plugin exposes to a host agent runtime.
- **Versioning.** Changesets under `.changeset/` drive the version bump and changelog;
  `changeset publish` runs from the release workflow on `main`.

## Contribution

SDD work follows the repo's commit discipline (registered as a SessionStart hook): one
coherent, independently revertable unit of work per commit; Conventional Commit prefixes
(`feat:`/`fix:`/`refactor:`/`test:`/`docs:`/`chore:`); stage only this unit's files; never
commit with red tests. An SDD gate-transition commit stages the **whole spec folder**
(`spec.md` and the sibling `.feature`), never `spec.md` alone.

## Contract-registry init-WRITE

A domain plugin's `init-<plugin>` skill writes that plugin's `sdd-plugins[]` entry into
`.agents/universal-plugin.json` at install/upgrade/re-run time. This folder owns the write;
the entry **shape** (the five-role map and governance bindings) is owned by
`../design/specialists-and-bundles.md`, and **resolving** an entry at runtime is owned by
`../mission/`.

The write is idempotent and self-reconciling:

1. Read `.agents/universal-plugin.json`; create it as `{}` if missing.
2. If the file exists but contains malformed JSON, **fail with an error and stop — do not
   overwrite** (a partial write could destroy other plugins' valid entries; fail loudly and
   let a human repair it).
3. Find the entry whose `name` matches this plugin; replace it if present, append it if not.
4. Reconcile a stale entry against the plugin's own version: on a `version` mismatch, update
   `version` and bring `roles`/`governances` to the current plugin shape; rewrite an
   old-shape entry to the role-map shape.
5. Write back without reordering or reformatting other entries.

Version reconciliation is the init skill's job at install/upgrade/re-run, so the runtime
resolver in `../mission/` only ever reads a current-shape entry and never compares versions.

## Behavior

Unit scenarios for harness behavior (CI gating, idempotent init-write, fail-closed on a
corrupt registry, marketplace-manifest validity) **colocate** in this folder. Cross-capability
outcomes (e.g. a plugin registers and the operator later resolves its delegates) live in
`../acceptance/`.

## Source

- `sdd-plugin` — residual packaging/distribution only (the SDD project description itself
  moved to `../spec.md` and `../design/`)
- `sdd-contract-registry` — the init-WRITE behavior only (shape → `../design/`; read → `../mission/`)
- new — toolchain rationale, CI/CD, release, and contribution content
