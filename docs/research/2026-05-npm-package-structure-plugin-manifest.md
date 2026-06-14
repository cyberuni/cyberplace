# npm Package Structure for Skills and Plugin Packages (May 2026)

Informs the `skill-repo-structure` governance and a potential proposal to `vercel-labs/open-plugin-spec` and `agentskills/agentskills` for unifying skill and plugin packages under a single `.plugin/plugin.json` manifest.

**Related:**

- [ADR-0002: External governance federation](../adr/0002-external-governance-federation.md)
- [Skill ecosystem landscape](2026-05-skill-ecosystem-landscape.md)
- Governance: `governance show skill-repo-structure`

---

## Question

What is the minimum file structure coupling needed to satisfy all consumer needs for a skills/plugin npm package, and is the "everything is a plugin" model (`.plugin/plugin.json` as sole source of truth) sound? What does the community already agree or disagree on?

---

## Findings

### The three-layer abstraction

The ecosystem has implicitly converged on three distinct abstraction levels that serve different consumers:

| Layer | File | Consumer | When |
| --- | --- | --- | --- |
| **Atomic skill** | `SKILL.md` | Agent runtime | On task activation |
| **Package manifest** | `.plugin/plugin.json` | Installers (any language) | On install/sync |
| **Distribution metadata** | `package.json` | Registry (npm, etc.) | On publish/resolve |

These layers are independent. The manifest travels with the tarball; `package.json` stays with the registry. A Go or Python installer can read `.plugin/plugin.json` without touching Node.

---

### Approach comparison

| Approach | Pros | Cons |
| --- | --- | --- |
| **Fixed paths only** (`skills/`, `.claude-plugin/`, etc.) | Zero-config, familiar | Layout coupling, no path override, grows rigid as package evolves |
| **`package.json#exports` subpath** | Standard npm pattern | Requires Node runtime; only meaningful for JS modules; markdown/scripts/binaries don't fit |
| **`package.json` custom field** (`agentPlugin`, `skills`) | VS Code precedent | Overloads a JS ecosystem construct; any non-npm registry ignores it |
| **`.plugin/plugin.json` manifest** | Language-neutral, decoupled, vendor-neutral canonical path | Extra indirection; needs tooling to enforce non-duplication with SKILL.md |
| **`.plugin/plugin.json` + convention fallback** | Best of both: zero-config for simple cases, override for complex ones | Two code paths for discovery in tool implementations |

**Winner: manifest + convention fallback.** This is exactly the model `vercel-labs/open-plugin-spec` landed on — convention paths (`skills/`, `commands/`, etc.) are auto-discovered when present; the manifest overrides them.

---

### "Everything is a plugin" model

The core proposal: a skills-only npm package is structurally a plugin whose manifest declares only a `skills` key. There is no separate "skill package" type.

```
skills package     →  plugin { "skills": "./skills/" }
full plugin        →  plugin { "skills", "agents", "commands", "hooks", "mcpServers" }
governance package →  plugin { "governances": "./governances/" }
rules package      →  plugin { "rules": "./rules/" }
```

**Evidence for this model:**

- agentskills#129 (xtfer): "Big +1 on plugin-like packaging across ecosystems — sub-agents, skills, hooks, and rules should be seamlessly linked and bundled." Directly proposes this model.
- `vercel-labs/open-plugin-spec` implements exactly this: any component type can be present or absent; the manifest is the declaration.
- Trail of Bits `trailofbits/skills` already uses `plugins/<bundle>/skills/<name>/` — treating the plugin as the outer container.

**One nuance:** `SKILL.md` as a standalone file remains valid for direct path references, git submodule inclusion, and manual install without any package wrapping. The plugin model applies to *packaged distribution*, not to the atomic skill unit itself.

---

### `package.json` role: distribution metadata only

The minimum safe set of `package.json` fields for a skills/plugin package:

```json
{
  "name": "@cyberuni/cyber-skills",
  "version": "1.2.0",
  "license": "MIT",
  "files": ["skills/", ".plugin/", ".claude-plugin/", ".cursor-plugin/", "governances/"],
  "keywords": ["agent-skills", "plugin", "claude", "cursor"],
  "exports": {
    "./package.json": "./package.json"
  }
}
```

The `./package.json` export is a JS-consumer convenience for root path resolution (`import.meta.resolve('pkg/package.json')` → `path.dirname(...)`). Non-JS consumers ignore it.

**Not in `package.json`:** skill/plugin semantics, `main`, `module`, `exports` subpaths for skill content. This avoids the VS Code mistake of overloading the distribution manifest with runtime semantics.

---

### npm as a language-neutral delivery substrate

npm is already used to ship purely language-neutral content with no complaint:
- Font packages (`@fontsource/*`) — CSS + WOFF files
- Icon sets (`@heroicons/*`) — SVGs only
- WASM packages — Go/Rust compiled binaries

The coupling that matters is: does consuming the package require running Node? With no `main`, `exports` (other than `./package.json`), or postinstall scripts, the answer is no. Any language's HTTP client can fetch from the npm registry API, and any tarball extractor can unpack the files.

A future non-npm registry (OCI-based, pip-based, a dedicated skills registry) can distribute the same tarball. `.plugin/plugin.json` travels with the content; `package.json` stays in the npm layer.

---

### Manifest naming: the agent-confusion problem

agentskills#226 (AlissonSteffens) identified a practical hazard: names like `skill.json` or `skills.json` at the repo root cause agents to consume the file as skill content rather than as tooling metadata, because the name pattern-matches to `SKILL.md`. The author built `sklz.json` specifically to avoid this.

**Implication for manifest naming:** `.plugin/plugin.json` is safe — it lives in a hidden directory with a plugin-specific name. `skill.json` at the package root is not safe.

agentskills#213 proposes `skill.json` at the package root as a package-level companion to SKILL.md, but the community comment immediately flagged: "out of sync json files will shadow the actual skill function/capabilities." The `.plugin/plugin.json` approach avoids this because it is strictly an *index* (WHERE skills are), never *content* (WHAT skills do). SKILL.md remains the authoritative runtime source; the manifest only points to it.

---

## Active threads and community positions

### Agreements

| Issue | Author | Position | Quote |
| --- | --- | --- | --- |
| [agentskills#129](https://github.com/agentskills/agentskills/issues/129) | xtfer | Plugin-like packaging unifying skills, sub-agents, hooks, rules | "sub-agents, skills, hooks, and rules should be seamlessly linked… plugin-like packaging bundles lifecycle" |
| [agentskills#226](https://github.com/agentskills/agentskills/issues/226) | AlissonSteffens | Language-agnostic manifest, not coupled to npm | "A team with a mixed-language monorepo has no reason to have a `package.json` just to manage skills" |
| [agentskills#255](https://github.com/agentskills/agentskills/issues/255), comment by xtfer | xtfer | Package-first, not directory-scanning-first | "Skills are almost ALWAYS distributed as a package… `skill.json` is a drop-in fix for any project containing skills" |
| [vercel-labs/open-plugin-spec#4](https://github.com/vercel-labs/open-plugin-spec/issues/4) | cloud-on-prem, fboldo | Open plugin spec as the right cross-vendor abstraction | "I would love to see `open-plugin-spec` adopted as an industry standard" |
| [oiap](https://github.com/fboldo/oiap) | fboldo | TypeScript SDK implementing open-plugin-spec already | "write AI agent plugins once and export to multiple agent harnesses" |

### Disagreements and counterarguments

| Counterargument | Source | Our response |
| --- | --- | --- |
| **Manifest drift / out-of-sync shadowing** — a `skill.json` / manifest can fall out of sync with SKILL.md and shadow real content | agentskills#213 comment | Addressed by strict separation of concerns: the manifest is an *index* (paths only), never a *content* copy. SKILL.md is always authoritative for agents. The manifest is machine-updated by the install tool. |
| **Spec won't dictate a package manager** — maintainers explicitly won't endorse one solution | agentskills#338 maintainer | Our proposal is about the *package format* (what files a package ships), not about which CLI installs them. The spec doesn't need to endorse one CLI. |
| **`package.json` is sufficient for JS projects** — the `agentskills` field or `exports` is simpler if you're already in the npm ecosystem | agentskills#81 (not fetched) | True for JS-only consumers. The `.plugin/plugin.json` approach is additive — a JS project can have both. The manifest is for cross-language consumers; `package.json` serves the npm registry. |
| **Security risk from script execution in plugin hooks** | akm philosophy (issue #338 ADR table) | The manifest is a *declaration* file, not an executor. It points to hook scripts but never runs them. Execution policy is the installer's responsibility, same as `npm run`. |
| **Vendor adoption is uncertain** — open-plugin-spec may not be adopted | vercel-labs/open-plugin-spec#4 | The `.plugin/plugin.json` path costs essentially nothing to add alongside existing `.claude-plugin/` and `.cursor-plugin/` directories. It is a forward-compatible addition, not a replacement. |

---

## The most impactful posting target

**Primary: `vercel-labs/open-plugin-spec`** — This is the repo where the plugin manifest standard is being defined. The proposal to treat skills-only packages as "plugins with only a skills component" strengthens the spec's scope and provides a clear migration path for existing skill-only repos. A well-argued issue here reaches both the Vercel team and the cross-vendor community.

**Secondary: `agentskills/agentskills`** — Cross-reference the open-plugin-spec post. The relevant framing here is that "a skill package IS a plugin" — which answers the long-running question in #129, #213, #226, #338 about what the package-level story should be.

---

## Open questions

- Should `.plugin/plugin.json` include a `format_version` field so tools can handle schema evolution?
- Should the spec explicitly require that the manifest is a pure *index* (no content duplication from SKILL.md) to prevent the drift problem?
- Should `governances/` be proposed as a standard component type in open-plugin-spec, or kept as a cyber-skills extension?
- When a vendor-specific manifest (`.claude-plugin/plugin.json`) conflicts with the neutral manifest (`.plugin/plugin.json`), what is the merge semantics — override or extend?

---

## Sources

- [agentskills/agentskills#129](https://github.com/agentskills/agentskills/issues/129) — plugin-like packaging across ecosystems
- [agentskills/agentskills#213](https://github.com/agentskills/agentskills/issues/213) — `skill.json` package-level metadata proposal
- [agentskills/agentskills#226](https://github.com/agentskills/agentskills/issues/226) — language-agnostic skill manifest (sklz)
- [agentskills/agentskills#255](https://github.com/agentskills/agentskills/issues/255) — `.well-known` discovery proposal
- [agentskills/agentskills#338](https://github.com/agentskills/agentskills/issues/338) — package manager guidance ADR
- [vercel-labs/open-plugin-spec#4](https://github.com/vercel-labs/open-plugin-spec/issues/4) — vendor adoption question
- [vercel-labs/open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec) — plugin manifest spec
- [open-plugins.com/specification](https://open-plugins.com/plugin-builders/specification) — open plugin spec documentation
- [agentskills.io/specification](https://agentskills.io/specification) — individual skill format spec
- [ivanzwb/agent-skills](https://github.com/ivanzwb/agent-skills) — SKILL framework with manifest.json
- [fboldo/oiap](https://github.com/fboldo/oiap) — TypeScript SDK implementing open-plugin-spec
- [arxiv:2604.16911](https://arxiv.org/html/2604.16911v1) — Skilldex: hierarchical scope-based skill package management
