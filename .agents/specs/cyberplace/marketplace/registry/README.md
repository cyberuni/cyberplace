---
spec-type: behavioral
concept: [acquire, axi]
---

# registry — acquire skills and configure their sources

The **registry** is the acquire-and-source capability behind `cyberplace add / remove / update /
list / find` and `cyberplace config provider` — installing skills and plugins from a GitHub/GitLab
repo (`org/repo[:skill]`), a git URL, or an npm package, tracking them in a scope-aware lock file
(project `.agents/cyberplace-lock.json` or global `~/.agents/cyberplace-lock.json`), and letting a
user point the CLI at custom sources. `cyberplace migrate` carries forward a legacy `npx skills`
lock file into the cyberplace lock. Source: `packages/cyberplace/src/registry/`.

## Use Cases

**Subject** — installing, removing, updating, and listing skills from the marketplace; searching
marketplaces for candidates; configuring the source providers a spec resolves against; migrating a
legacy lock file.

**Non-goals (boundaries):** curated catalog search of the awesome list is `../awesome-list/`; the
crew storefront is `../tavern/`; #7 ambient-context (an auto session-hook and registry-as-
installable-skill) is **deferred**, not this node; this node freezes the AXI output contract for
registry — actually making the shipped CLI emit it (and stop prompting) is impl-deferred (see
below).

| Use case | Trigger / inputs | Outcome |
|---|---|---|
| Install a skill | `cyberplace add <org/repo[:skill]｜git-url｜npm-package>` (`--global`/`--project`, `--branch`, `--yes`) | Skill files land under the resolved install dir; a lock entry is written; a project-scope install also gets a `skills/<name>` symlink unless one collides with a real directory; a package-managed skill is skipped with an npm install hint instead |
| Remove a skill | `cyberplace remove <name>` (`--global`/`--project`) | The skill's installed files and its lock entry are deleted; removing a name that is not installed is a definitive no-op message, exit 0 |
| Update a skill | `cyberplace update [name] [--all]` (`--global`/`--project`, `--branch`) | The named skill (or every locked skill with `--all`/name omitted) is re-fetched from its recorded source and the lock entry refreshed |
| List installed skills | `cyberplace list` (`--global`/`--project`, `--format`) | Every locked skill's name, source, and source type, scoped to project or global |
| Find skills | `cyberplace find [query]` (`--in <org/repo>`, `--limit`, `--format`) | Marketplace matches (default `https://skills.sh` plus any configured `marketplace` providers) with a ready-to-run install command; `--in` scopes the search to one repo's own skills |
| Configure source providers | `cyberplace config provider add\|remove\|list <url>` (`--global`/`--project`, `--type`, `--match`) | A provider (`github｜gitlab｜custom｜marketplace`, optional `--match` glob) is added to, removed from, or listed from `.agents/cyberplace.json` (project) or `~/.agents/cyberplace.json` (global) |
| Migrate a legacy lock | `cyberplace migrate` (`--global`, `--dry-run`) | Entries from a legacy `skills-lock.json` are copied into `.agents/cyberplace-lock.json` (skipping names already present); `--dry-run` reports the plan without writing |

Follows the AXI output contract (`../../axi/README.md`).

**Impl trails the AXI contract.** The shipped registry already emits human prose plus a
`--format json` escape hatch, but `add`/`remove`/`update` still run an interactive skill-select and
scope-select prompt in a TTY (`registry/prompt.ts`) whenever a repo spec has no skill and no scope
flag is given. Only the AXI output surface (TOON default, minimal-schema rows, truncation +
`--full`, pre-computed aggregates, next-step lines) and the non-interactive-by-default behavior
(#6) are unbuilt. The impl gate withholds certification on this node until a follow-up mission
delivers the build.
