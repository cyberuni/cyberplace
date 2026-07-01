---
title: Commands
description: User-invocable slash-command workflows — how they differ from auto-invoked skills, cross-harness compatibility, and plugin support.
---

**Commands** are skills invoked explicitly by the user via `/name`, never triggered automatically by the model. Use them for workflows that should only run when you choose — deployments, releases, or any operation where accidental auto-invocation would be disruptive.

## How commands differ from skills

Regular skills have a `description` field that agents read to decide when to load the skill automatically. Commands suppress that automatic invocation:

|                        | Auto-invoked by model      | User-invoked via `/name` |
| ---------------------- | -------------------------- | ------------------------ |
| **Skill** (`SKILL.md`) | ✅ when description matches | ✅                        |
| **Command**            | ❌                          | ✅                        |

## Two mechanisms

### 1. `commands/` folder (legacy, wider support)

Place a markdown file in `.claude/commands/` (project) or `~/.claude/commands/` (user):

```
.claude/commands/
  deploy.md       → /deploy
  release.md      → /release
```

The file content is the skill body. Frontmatter (`description`, `allowed-tools`) is supported. The model never auto-invokes these — they are user-only by design.

Claude Code marks `commands/` as deprecated in favor of `SKILL.md` files, but it still works and is the more portable choice today (see [harness compatibility](#harness-compatibility) below).

### 2. `disable-model-invocation: true` (modern, not universal)

Add the frontmatter field to any `SKILL.md`:

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---
```

This prevents automatic loading while keeping the skill accessible via `/deploy`. It is the recommended approach in Claude Code's own documentation, but not all harnesses support it.

## Harness compatibility

### Standalone skills

| Harness                | `disable-model-invocation` in `SKILL.md`                      | `commands/` folder            |
| ---------------------- | ------------------------------------------------------------- | ----------------------------- |
| **Claude Code**        | ✅                                                             | ✅ (deprecated, still works)   |
| **Cursor**             | ⚠️ bug: hides plugin-delivered skills from `/` menu (Mar 2026) | —                             |
| **Windsurf**           | ✅                                                             | —                             |
| **GitHub Copilot CLI** | ❌ (skills)                                                    | ✅ (reads `.claude/commands/`) |
| **Codex CLI**          | ❌ (uses `agents/openai.yaml` instead)                         | —                             |
| **Gemini CLI**         | ❌                                                             | —                             |

### Plugin commands

Inside a [universal plugin](/governances/universal-plugin/), a `commands/` subfolder creates user-invocable slash commands across harnesses:

| Component   | Claude Code      | Cursor   | Codex            |
| ----------- | ---------------- | -------- | ---------------- |
| `skills/`   | ✅ native         | ✅ native | ✅ native         |
| `commands/` | ✅ native         | ✅ native | silently ignored |
| `agents/`   | ✅ native         | ✅ native | silently ignored |
| `rules/`    | silently ignored | ✅ native | silently ignored |

Because Cursor supports `commands/` natively in plugins, and the `disable-model-invocation: true` frontmatter field has a known bug in Cursor (plugin-delivered skills with this flag are hidden from the `/` menu), the `commands/` folder is the safer choice for cross-harness plugin commands targeting both Claude Code and Cursor.

**Recommendation:** Use `commands/` inside your plugin for user-only workflows. When the Cursor bug is resolved and `disable-model-invocation: true` has stable cross-harness support, you can migrate commands to `skills/` with the frontmatter flag.

## Related

- [Agent Configuration](/concepts/agent-configuration/) — the full picture of skills, commands, and rules
- [Universal Plugin governance](/governances/universal-plugin/) — plugin component table and distribution
- [Claude Code skills docs](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill) — `disable-model-invocation` reference
