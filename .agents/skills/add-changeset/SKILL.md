---
name: add-changeset
description: "Use this skill when a published-package change needs a changeset (monorepos supported)."
metadata:
  internal: true
---

# Add Changeset

## When to Add One

**Add a changeset when the change:**
- Fixes a bug in a published package (`patch`)
- Adds a new feature or public API (`minor`)
- Breaks an existing API or removes something (`major`)
- Updates a dependency in a way users need to know about (`patch`)
- **Changes a published package's shipped agent configuration** — a skill (`SKILL.md`), a subagent/agent definition, or a plugin manifest that the package ships (bump per the nature of the change; see below)

**A package's public surface is not only code.** Several packages here ship **agent configuration**
— skills, subagent/agent definitions, plugin manifests — as their actual product (e.g. `cyber-sdd`
ships `skills/`, `agents/`, and the `.plugin`/`.claude-plugin`/`.codex-plugin` manifests). Whatever a
package declares in its `package.json#files` is its **public surface**, so a change to that shipped
agent configuration is user-facing and needs a changeset **the same as a code change — even though it
is authored in Markdown, not TypeScript**. A shipped `SKILL.md` or agent definition is the product, not
documentation *about* it. Bump type still follows the **nature** of the change (see step 3).

**Do nothing when:**
- The change is `ci:`, `chore:`, `test:`, or an internal refactor with no API/behavior change
- The only changed files are in `examples/`, `docs/`, or non-published packages (check `private: true` and `"ignore"` in `.changeset/config.json`)
- The only changed files are **repo-internal agent configuration** — a skill marked `metadata: internal: true`, anything under `.agents/` (contributor tooling, SDD specs, ledgers, plans), or any agent-config file **outside the owning package's `package.json#files` surface**; none of it ships
- The only changed files are tests or Storybook stories
- The change is build-process, CI/CD, or development tooling only
- The only dependency changes are `devDependencies`

Tell the user no changeset is needed and why.

## Steps

### 1. Detect the setup

```bash
# Confirm changesets is initialized
ls .changeset/config.json
```

Read `.changeset/config.json` to find:
- `"fixed"` — packages that share the exact same version; bumping one bumps all
- `"linked"` — packages that share the highest bump type but keep independent versions
- `"ignore"` — packages excluded from versioning
- `"access"` — `"public"` means scoped packages publish publicly

### 2. Identify affected packages

First, determine which changes to look at:

```bash
# Check for staged changes
git diff --cached --name-only

# Check for unstaged changes
git diff --name-only
```

**Scope selection rules (in priority order):**

1. **Staged changes exist** → use `git diff --cached --name-only`
2. **Only unstaged changes exist** → use `git diff --name-only`
3. **No local changes** → compare HEAD to base branch: `git diff --name-only origin/main...HEAD`

In a monorepo (has `pnpm-workspace.yaml`, `workspaces` in root `package.json`, or `bun.workspace.ts`), map changed files to their owning package (find nearest `package.json` above each changed file). Apply `fixed` group rules: if any package in a fixed group is affected, all are.

**Markdown agent-config files count too.** A changed `SKILL.md`, agent definition, or plugin manifest maps to its owning package exactly like a code file — do not skip it because it is Markdown. Then confirm it is on the package's **shipped surface**: it must match a pattern in that package's `package.json#files` (e.g. `cyber-sdd`'s `skills`/`agents`/`.plugin`). A change to an agent-config file **outside** that surface (a repo-internal `.agents/` skill, an `internal: true` skill, a spec/ledger) ships nothing and is a do-nothing case.

In a single-package repo, the root package is always the affected package.

### 2a. Extract context from commit messages

When scope is **no local changes** (case 3), also read recent commits for context:

```bash
# Commits on this branch not yet on base
git log origin/main..HEAD --oneline
```

Parse conventional commit prefixes to inform bump type and summary:

| Prefix | Implication |
|---|---|
| `feat:` / `feat(scope):` | at least `minor` |
| `fix:` / `fix(scope):` | at least `patch` |
| `BREAKING CHANGE:` footer or `!` after type | `major` |
| `chore:`, `ci:`, `test:`, `docs:` | no changeset needed |

Use the commit message body / subject as a starting point for the changeset summary, rewritten to be user-facing (imperative mood, no implementation details).

### 3. Determine bump type

| Change type | Bump |
|---|---|
| Removes or renames public API, breaks existing usage | `major` |
| Removes/renames a shipped skill or agent, or breaks its documented behavior contract | `major` |
| Adds new exported function, class, option, or command | `minor` |
| Adds a shipped skill/agent, or a new documented behavior to an existing one | `minor` |
| Bug fix, internal refactor, dependency update | `patch` |
| Fixes or clarifies a shipped skill/agent's behavior without changing its contract | `patch` |

> **A stricter shipped-agent-config check is not automatically breaking.** Judge it by consumer
> impact like any change: a new **non-blocking** check, warning, or advisory a shipped skill/agent
> emits **adds** behavior without breaking existing usage, so it is `minor` (`patch` if it only
> refines an existing message). Only a change that makes a previously-passing input **fail** — a new
> hard block, a removed capability, a renamed invocation — is `major` (`minor` pre-1.0).

> **Pre-1.0 rule:** For packages on `0.x`, use `minor` for breaking changes — this is standard semver for pre-release packages. Only assign `major` to packages at `1.0.0` or higher.

When unsure between minor and patch, ask the user.

### 4. Write the changeset file

Choose a descriptive kebab-case filename that reflects the change (e.g. `fix-button-accessibility.md`, `add-retry-option.md`). Fall back to a random two-word slug (adjective + animal, e.g. `fuzzy-wolves`) when no obvious name fits or to avoid a conflict. Do not use the `changeset` CLI — write the file directly.

```markdown
---
"package-name": patch
---

Add `retry` option to fetch client.
```

- Filename: `.changeset/<name>.md`
- Each affected package gets one line in the frontmatter: `"<name>": <major|minor|patch>`
- For packages in a `fixed` group, list every package in the group with the same bump type
- The body is the user-facing summary (see summary rules below)

**Summary** — appears verbatim in `CHANGELOG.md`: imperative mood, user-facing effect, ends with a period, code identifiers in backticks, no internal file names or commit SHAs. For breaking changes, add a `Migration:` bullet list.

### 5. Commit the changeset

Only commit the changeset automatically when there were **no local changes** at the start (scope case 3 — branch diff). In that case:

```bash
git add .changeset/
git commit -m "docs: add changeset"
```

If staged or unstaged changes existed (scope cases 1 or 2), tell the user the changeset file has been created and let them include it in their own commit.

## Verification

- [ ] File exists in `.changeset/` with a descriptive or slug filename
- [ ] Frontmatter lists all affected packages with the correct bump type
- [ ] All packages in any `fixed` group are included together
- [ ] Summary is consumer-focused — no internal file names or commit SHAs
- [ ] Code identifiers are wrapped in backticks
- [ ] Summary ends with a period
- [ ] Breaking changes include migration steps
