# Conclusion — Plugin Consumption Leveling (June 2026)

## Question

When a plugin is installed via one vendor's marketplace (e.g., Claude Code), can it be made available across other vendors (Cursor, Codex, GitHub Copilot CLI)? Is "install once, use everywhere" achievable, or does cross-vendor availability require explicit sync?

## Verdict

**"Install once, use everywhere" is not achievable at the OS or runtime level. Each vendor's plugin cache is fully isolated. Cross-vendor availability requires explicit sync — either via community tools or a `prepare` skill shipped with the plugin.**

The two practical paths:

**Path A — Project-scoped skills (zero-config, universal):**
Install skills at project scope (`./skills/<name>/SKILL.md`). Every Tier 1 vendor and 32+ tools that support the Agent Skills standard (agentskills.io) pick them up automatically with no sync required. This is the correct architecture for plugins that want cross-vendor reach without user friction.

**Path B — Global cache sync (`prepare` skill or manual tool):**
For globally-installed skills (vendor cache), sync must be explicit. The right design is a `prepare` skill inside the plugin that:
- Detects which other vendor runtimes are present on the machine
- Copies or symlinks skill files to the correct vendor-specific paths
- Translates hook event casing per vendor (PascalCase for Claude Code/Codex; camelCase for Cursor/Copilot CLI)
- Is idempotent (safe to re-run on update)

Community tools exist for manual sync (ecc2cursor, acplugin, plugin-portability), but they require user action after each install. A `prepare` skill embedded in the plugin removes that friction if Claude Code's marketplace fires a post-install hook.

## Confidence

**High** for the isolation finding (each vendor's cache paths are documented; no shared directory is documented anywhere). **High** for project-scoped skills as the zero-config solution. **Medium** for `prepare` skill viability — depends on whether Claude Code fires a post-install hook that can trigger it. **Low** for community tool maturity — ecc2cursor, acplugin, and plugin-portability are early-stage projects.

## Strongest supporting evidence

- Vendor install paths are all under vendor-specific home directories (`~/.claude/`, `~/.cursor/`, `~/.codex/`, `~/.agents/`) with no documented cross-vendor reads
- agentskills.io confirms 32+ tools read `skills/<name>/SKILL.md` at project scope
- ecc2cursor exists and works, confirming the gap is real enough that community tooling was built to fill it

## Strongest counterevidence / caveats

- If Claude Code does not fire a post-install hook, the `prepare` skill can only run when the user manually invokes it — reducing it to another manual step
- Community tools (ecc2cursor, acplugin) are not officially maintained by any vendor; they may lag behind vendor updates
- agentskills.io's 32+ adopter count has not been independently verified from primary vendor docs

## What is not supported

- A single marketplace install that automatically propagates to all vendors
- Any OS-level mechanism (XDG_DATA_DIRS, symlinks, env vars) that creates cross-vendor plugin sharing
- A shared global skills directory across vendors (agentskills.io defines the format, not a shared location)

## Where evidence is thin

- Whether Claude Code's marketplace supports a post-install hook that would allow `prepare` to run automatically
- Whether Linux Foundation AAIF intends to standardize a shared global skills directory as a follow-on to the SKILL.md format adoption

## Recheck triggers

- If Claude Code publishes post-install hook documentation for marketplace plugins
- If agentskills.io or AAIF proposes a shared global skills directory convention (e.g., `~/.agent-skills/`)
- If ecc2cursor, acplugin, or plugin-portability achieve official vendor backing
- If any Tier 1 vendor adds cross-vendor plugin discovery to their roadmap
