# Draft Post: vercel-labs/open-plugin-spec

**Target:** New issue on [vercel-labs/open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec)

**Suggested title:** `Proposal: treat skill-only packages as plugins — .plugin/plugin.json as the single source of truth`

*Note: the title is deliberately firm — the proposal is clear. The body tone is deliberately collaborative.*

---

## Post body

Thanks for building this — the convergence of `.claude-plugin/` and `.cursor-plugin/` into a vendor-neutral `.plugin/plugin.json` feels like exactly the right structural move, and the fallback-to-convention model (auto-discover `skills/`, `commands/`, etc. when no manifest is present) handles the zero-config case nicely.

I've been working through the packaging design for [cyberuni/cyber-skills](https://github.com/cyberuni/cyber-skills) and landed on a few positions I think could strengthen the spec and resolve some long-running questions in the agentskills community (#129, #213, #226, #338). Sharing them here in case they're useful.

---

### Idea 1: a skills-only package is just a plugin

There's currently an implicit distinction between "skill packages" (a `skills/` folder, maybe a `marketplace.json`) and "plugins" (the full bundle with `.claude-plugin/plugin.json`). I think collapsing that distinction makes the model simpler for both authors and tools:

> A skills-only package is a plugin whose manifest declares only a `skills` key.

```json
{
  "name": "my-skill-library",
  "version": "1.0.0",
  "skills": "./skills/"
}
```

That's a complete `.plugin/plugin.json` for a skills-only package. Nothing more needed. The consumer (installer, agent harness) reads the manifest, finds what components are declared, and loads them — same code path as a full plugin.

The component type becomes a manifest key, not a package category. A governance package is a plugin with `"governances": "./governances/"` (This is something I'm working on in [cyberuni/cyber-skills](https://github.com/cyberuni/cyber-skills) and not something concrete enough to talk about yet.). A rules-only package is a plugin with `"rules": "./rules/"`. One lookup, no special-casing.

This would also address agentskills#129 (@xtfer's request for plugin-like packaging that bundles sub-agents, skills, hooks, and rules under one distribution unit) and largely make agentskills#213's `skill.json` proposal redundant — the package-level manifest is already here in `.plugin/plugin.json`.

---

### Idea 2: the manifest is an index, not a content mirror

One concern that came up in agentskills#213 about package-level manifests is worth taking seriously: if a manifest duplicates content from `SKILL.md` frontmatter, it can fall out of sync and shadow real content.

I think the cleanest answer is to make the spec explicit about what the manifest is allowed to contain:

> **The manifest is a pure index.** It declares WHERE components are. It never duplicates or overrides WHAT those components say. `SKILL.md` remains the authoritative source for everything agents read.

Concretely: the `skills` key in the manifest points to a directory path (or an array of paths). It does not repeat `name`, `description`, or any frontmatter field — those live exclusively in `SKILL.md`. A tool that builds a search index reads SKILL.md; the manifest just tells it where to look.

By that rule, there's nothing to go out of sync, because the manifest contains only paths.

---

### Idea 3: keep `package.json` as the delivery envelope, nothing more

VS Code loaded plugin semantics into `package.json` via `contributes`, but that made sense because VS Code extensions are JS packages by definition. Skills and plugins are language-neutral — they can contain Python scripts, Go binaries, shell scripts, and markdown with zero JS involved.

A cleaner separation might be:

| File                  | Role                                                  | Required by      |
| --------------------- | ----------------------------------------------------- | ---------------- |
| `.plugin/plugin.json` | Plugin manifest — component paths, version, metadata  | The plugin spec  |
| `package.json`        | Distribution metadata — name, version, files, license | The npm registry |

Nothing plugin-specific would live in `package.json`. The one JS-ecosystem addition worth keeping is:

```json
"exports": { "./package.json": "./package.json" }
```

This is not a plugin concern — it is a root resolution convenience. When the package is installed via npm, pnpm, yarn, or bun, JS-based tooling uses `import.meta.resolve('my-plugin/package.json')` (or `require.resolve`) to locate `package.json`, then derives the package root as `path.dirname(...)`. From there it can find `.plugin/plugin.json` at `<root>/.plugin/plugin.json`. Without this export, Node's package resolution may block the import or require traversal up to the package root. Non-JS installers resolve the package root through their own mechanisms and can ignore this field entirely.

This treats npm as a delivery channel (like Homebrew bottles or OCI layers) rather than a semantic dependency. When a future non-npm registry emerges, `.plugin/plugin.json` travels with the tarball unchanged; `package.json` stays with the registry as its concern.

---

### What I'd love to see clarified in the spec

Concretely, the things that would help most:

1. **Clarify** that a plugin can contain any subset of component types — including exactly one. A skills-only plugin is valid and complete, not a "lesser" artifact.
2. **Clarify** that the manifest is a pure path index — it does not duplicate or override content declared inside component files (`SKILL.md`, etc.).
3. **Recommend** (not require) that `package.json` carry no plugin-specific semantics beyond what the npm registry needs.
4. **Document** the merge semantics between `.plugin/plugin.json` and `.<vendor>-plugin/plugin.json`: vendor-specific entries win on conflict, but do not suppress undeclared keys from the neutral manifest.

---

### Prior art and community support

- **agentskills#129** (@xtfer) — direct request for plugin-like packaging unifying skills, sub-agents, hooks, and rules. One reply: "+1 on plugin-like packaging."
- **agentskills#226** (@AlissonSteffens) — language-agnostic skill manifest proposal (sklz). Independently converges on the same need: a language-neutral, dedicated manifest that does not couple to `package.json`. Also identifies the agent-confusion hazard of naming manifests `skill.json` or `skills.json` — `.plugin/plugin.json` sidesteps this completely.
- **agentskills#338** (maintainer): "the ecosystem must converge" on a solution; the spec will not dictate one. This spec is positioned to be that convergence point — not for installers, but for the *package format* that all installers can read.
- **trailofbits/skills** — already uses `plugins/<bundle>/skills/<name>/` in production, treating the plugin as the outer container.
- **oiap** (@fboldo) — TypeScript SDK implementing this spec for cross-harness plugin export, confirming the spec has traction beyond Vercel/Cursor/Claude.
- **cyber-skills** — doing something similar in TypeScript, focused on the skills side: reading and resolving `.plugin/plugin.json` from installed npm packages, validating skill structure, and surfacing skills to agent runtimes. Happy to contribute any of this back into `skills`, `open-plugin-spec`, or a shared utility package if there's appetite for it.

---

### Anticipated pushback — and my take

**"npm coupling is a problem for language-neutral skills."**
Only if the plugin manifest lives in `package.json`. With `.plugin/plugin.json` as the manifest, any language can read it; npm is just the delivery channel. The coupling is in the installer, not in the package format.

**"Adding another file feels like more complexity, not less."**
Fair concern. But the alternative is vendor-specific files multiplying indefinitely (`.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`, …) with no shared schema and no path to convergence. One shared file that all compliant tools read, with vendor-specific files demoted to optional overrides, seems like the better tradeoff.

**"Script execution in plugin hooks is a security risk."**
Agreed — which is why the manifest should be a *declaration*, not an executor. It points to hook scripts; it never runs them. Execution policy (sandboxing, confirmation prompts, allow-lists) is the installer's concern — the same contract `npm run` has with `package.json#scripts`. Worth being explicit about this in the spec.

**"Why not just use `package.json` for the manifest? That's simpler for JS projects."**
For JS-only consumers, sure. But a Python developer, a Go CLI author, or a team with a mixed-language monorepo has no reason to pull in a `package.json` just to declare skill paths. The two-file model scales to both audiences: a JS project ships both, a non-JS project ships only `.plugin/plugin.json`.

---

Curious whether others have run into the same friction, and whether there's appetite to move any of this toward normative language in the spec.
