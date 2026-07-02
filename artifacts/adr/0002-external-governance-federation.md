# ADR-0002: External Governance Federation

## Status

Proposed

## Context

cyberplace ships version-pinned governances under `governances/` loadable via `governance show <name>`. Some standards belong in **domain repos** — for example `changeset-authoring` in [repobuddy/agent-changesets](https://github.com/repobuddy/agent-changesets) — not in the core cyberplace package.

We explored loading external governances by:

1. Resolving paths from `skills-lock.json` / installed skill directories
2. Reading files under `node_modules/...`

Both approaches fail without a **stable install artifact**:

- Skill repos are often consumed via `npx skills add owner/repo`, not npm packages
- Install paths vary by agent, scope (global vs project), and CLI version
- Referencing `node_modules` is fragile and not a contract

The [Agent Skills](https://agentskills.io) ecosystem is converging on **manifest + packaged artifacts + digest pinning** ([agentskills#255](https://github.com/agentskills/agentskills/issues/255), [PR #254](https://github.com/agentskills/agentskills/pull/254)) rather than ad hoc filesystem layout. Maintainers closed [packaging guidance #338](https://github.com/agentskills/agentskills/issues/338) without endorsing a single package manager — ecosystem convergence first.

Background survey: [docs/research/2026-05-skill-ecosystem-landscape.md](../research/2026-05-skill-ecosystem-landscape.md).

## Decision Drivers

- **Stable contracts** — governances must resolve the same way for humans, CI, and agents
- **No node_modules coupling** — install layout is not an API
- **Align with agentskills distribution direction** — manifest, digest, optional npm package
- **Minimal scope now** — ship domain governances in their home repos; defer federation CLI

## Considered Options

### Option 1: Skill-path / lockfile resolution

Resolve `governance show changeset-authoring --from-skill add-changeset` by walking `skills-lock.json` to a checkout path.

- **Pros**: Works without npm publish; quick to prototype
- **Cons**: Paths differ per machine; breaks for global vs project install; not version-pinned to a package release

### Option 2: Repo manifest (`.cyberplace/plugins.json`)

Consumer repo lists governance paths explicitly.

- **Pros**: Explicit, offline-friendly
- **Cons**: Still needs a defined root for each plugin; doesn't solve unpublishable skill-only repos without manual paths

### Option 3: npm-packaged skill repos + future federation CLI (chosen direction, deferred)

Domain repos publish npm packages with `governances/` and optional tiny CLI; cyberplace adds federation later (`governance show <name> --package @scope/pkg` or clibuilder plugin).

- **Pros**: Version-pinned; matches Changesets/npm release workflows; aligns with agentskills digest/lock story
- **Cons**: Requires publish setup in each domain repo; implementation not started

### Option 4: clibuilder plugin on cyberplace CLI immediately

Migrate CLI to clibuilder and register plugins from dependencies.

- **Pros**: Unified extensibility (repobuddy pattern)
- **Cons**: Large migration; premature before domain packages exist

## Decision

**Defer external governance federation** in cyberplace until domain skill repos ship as **npm packages** (or agentskills distribution RFC provides an equivalent manifest + digest contract).

**Until then:**

1. Domain repos (for example `repobuddy/agent-changesets`) add co-located `governances/*.md` and skills reference them **from the same repo checkout** — a temporary exception to “always use `governance show`” for that repo only
2. cyberplace core governances remain under `governances/` and load via `governance show`
3. Track federation implementation in a GitHub issue; design against Option 3, not Options 1–2

## Rationale

Options 1 and 2 encode install layout as API surface. That conflicts with how `npx skills add` and multi-agent paths work today and fights the direction of agentskills distribution work. Publishing domain repos as npm packages (even skills-only metadata packages) gives semver, `files` globs, and package resolution without scraping `node_modules` trees manually.

Option 4 is valuable later if cyberplace adopts clibuilder broadly; it is not required to unblock `changeset-authoring` living in agent-changesets.

## Consequences

### Positive

- Clear blocker documented — no half-built federation
- agent-changesets can land `governances/changeset-authoring.md` without waiting for cyberplace CLI work
- Future federation aligns with ecosystem manifest/digest patterns

### Negative

- Split loading models temporarily (cyberplace CLI vs co-located files in domain repos)
- Domain repos that want federation must add npm publish setup

### Risks

- Temporary co-located governance exception may linger — mitigate by noting expiry in domain repo README and linking this ADR

## Implementation Notes

**Now:**

- PR to `repobuddy/agent-changesets`: add `governances/changeset-authoring.md`
- Issue in `cyberplace`: “External governance federation” referencing this ADR

**Later (when unblocked):**

- Publish `@repobuddy/agent-changesets` (or equivalent) with `governances/` in `files`
- Extend `governance show` with package-based resolution
- Optionally evaluate clibuilder plugin registration after repobuddy CLI patterns are updated for modern ESM stack

**Pinned npx for cyberplace itself** remains a repo/ADR concern — not a shipped governance — see research doc.

## Related Decisions

- [ADR-0001](0001-governance-vs-discipline-taxonomy.md) — governance vs discipline taxonomy
- Research: [2026-05-skill-ecosystem-landscape.md](../research/2026-05-skill-ecosystem-landscape.md)
- Governance: `skill-repo-structure` — repo layout including optional `governances/`
