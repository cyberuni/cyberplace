# Skill Repo Structure

Rules for organizing a **repository that ships one or more Agent Skills** — directories, manifests, contributor internals, and CI. Apply when creating a skill library, running `init-skill-repo`, or auditing whether a repo is a well-formed skill collection.

This governance covers **repo layout**. Per-skill authoring rules live in **skill-design**; per-skill format baseline is [agentskills.io](https://agentskills.io/specification).

## Relationship to other standards

| Layer | Source | This governance |
| --- | --- | --- |
| Single skill format | [agentskills.io specification](https://agentskills.io/specification) | **Must comply** — do not redefine `SKILL.md` or optional skill folders |
| Skill content quality | `governance show skill-design` | Complements — placement kind, progressive disclosure |
| Skill security | `governance show skill-security` (when shipped) | Complements — content in `SKILL.md` and `scripts/` |
| Org operational governance | [OWASP AST09](https://owasp.org/www-project-agentic-skills-top-10/) | **Out of scope** — inventory, approval, audit at enterprise level |
| Ecosystem survey | `docs/research/2026-05-skill-ecosystem-landscape.md` (repo checkout) | Reference repos and RFC links — **not** in this governance |

External governance federation is deferred per [ADR-0002](../../docs/adr/0002-external-governance-federation.md). Reference implementations by archetype live in the research doc — do not duplicate repo links here.

## Why

The agentskills spec defines **one skill folder**, not how to run a skill **library** repo. Popular collections diverge (flat `skills/`, plugin bundles, npm toolchains). This governance encodes **archetypes** and **required vs optional** artifacts so agents and contributors scaffold consistently — without forcing every repo to match cyber-skills’ full toolchain.

## Repo archetypes

Pick the **primary** archetype. Hybrid repos are fine if each layer is intentional.

### Collection

Skills only — publish via `npx skills add owner/repo`.

**Typical layout:**

```text
LICENSE
README.md
skills/
  <skill-name>/
    SKILL.md
```

**Optional:** `skills.sh.json`, `.claude-plugin/marketplace.json`, `template/`, `spec/` (pointer to agentskills.io).

### Maintained library

Collection plus validation and install hygiene.

**Add:**

- `AGENTS.md` (and `CLAUDE.md` → symlink when using Claude Code)
- CI that runs skill validation on PRs touching `skills/`
- Documented install commands in README
- Optional committed `skills-lock.json` when the repo dogfoods `npx skills add`

**Validate with:**

```bash
npx cyber-skills@<version> audit validate
```

### Tooling library

Maintained library plus npm CLI, governances, or hooks shipped from the same repo.

**Add (as needed):**

```text
governances/           # version-pinned standards (cyber-skills pattern)
src/                   # CLI source
package.json           # publishable bin
.changeset/            # if npm releases use Changesets
```

**Require:** a single documented verify command in AGENTS.md (typecheck + lint + test + audit, or equivalent for the stack).

### Plugin bundle

Skills grouped under named bundles for Claude/plugin marketplaces.

**Layout:**

```text
plugins/
  <bundle-name>/
    skills/
      <skill-name>/
        SKILL.md
    .claude-plugin/
```

Do not treat plugin-bundle layout as the default — most repos use flat `skills/<name>/`.

## Required for any public skill repo

1. **`LICENSE`** at repo root.
2. **Public skills under `skills/<name>/SKILL.md`** (or documented bundle path for plugin archetype).
3. **Each skill complies** with agentskills.io: `name` matches directory; valid frontmatter; optional folders only as `scripts/`, `references/`, `assets/` unless documented otherwise.
4. **No loose `SKILL.md`** at repo root or outside a named skill directory.
5. **README** with install instructions (`npx skills add …`) for consumer-facing repos.

## Recommended for maintained and tooling libraries

| Artifact | Purpose |
| --- | --- |
| `AGENTS.md` | Agent-facing commands, architecture, pointers to governances |
| `.agents/skills/` | Repo-internal contributor skills (`metadata: internal: true`) |
| `skills.sh.json` | skills.sh groupings and install scopes |
| `.claude-plugin/marketplace.json` | Claude plugin marketplace groupings |
| CI on `skills/` | Block merges that fail `audit validate` |
| `awesome-skills.json` | Curated discovery (cyber-skills-specific; optional elsewhere) |

## Contributor and patch conventions

These extend **skill-design** placement rules for library repos:

| Kind | Location | Notes |
| --- | --- | --- |
| **Global** | `~/.agents/skills/<name>/` | User machine; not in the skill repo |
| **Repo internal** | `.agents/skills/<name>/` | `metadata: internal: true`; not shipped in `npx skills add` public tree |
| **Repo public** | `skills/<name>/` | Installed by consumers |

**Upstream patches** from a local install always map to `skills/<name>/…` in the source repo — never `.agents/skills/` in upstream.

**`SKILL.local.md`** stays local; never commit to public `skills/` or push upstream.

## Optional manifests (do not require all)

| File | When |
| --- | --- |
| `skills-lock.json` | Repo records installed skills for reproducibility |
| `skills.sh.json` | Listing on skills.sh with groupings/scopes |
| `.claude-plugin/marketplace.json` | Claude plugin UX |
| `governances/` | Repo ships version-pinned standards loadable via `governance show` |

Watch [agentskills distribution RFCs](https://github.com/agentskills/agentskills/issues/255) for future `.well-known` manifests and packaged artifacts — prefer **digest + lockfile** over ad hoc path scraping.

Supply-chain threats for cyber-skills consumers (GitHub skills vs npm CLI): [docs/research/2026-05-cyber-skills-supply-chain-threat-model.md](../docs/research/2026-05-cyber-skills-supply-chain-threat-model.md).

## Anti-patterns

- Duplicating the same skill in `skills/` and `.agents/skills/` without a documented reason
- Bloating AGENTS.md with full governance bodies — use `governance show` pointers instead
- Embedding reference repo links or surveys in governances — use `docs/research/` instead
- Assuming `node_modules` or install paths for loading governances from other repos
- Running no CI on skill-only repos that accept external PRs
- Committing `SKILL.local.md` or secrets into public skill trees

## Detecting a skill repo

Treat a repository as a **skill repo** when any of:

- `skills/**/SKILL.md` exists (or `plugins/**/skills/**/SKILL.md` for bundle archetype)
- README or package scripts document `audit validate` / skill validation
- Primary purpose is distributing Agent Skills (not an application that happens to have one skill)

Use **`init-skill-repo`** (when shipped) to scaffold and wire disciplines for this profile.

## Verification

| Archetype | Minimum check |
| --- | --- |
| Collection | Manual or `skills-ref validate` per skill |
| Maintained / tooling | `npx cyber-skills@<version> audit validate` in CI |
| Tooling library | Full repo verify command documented in AGENTS.md |

Full quality review (Q6–Q12, E3–E8): run the **audit-skill** agent skill after mechanical validation passes.
