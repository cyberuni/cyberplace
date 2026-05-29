---
name: create-universal-plugin
description: Use this skill when the user asks to create a universal plugin for Cursor and Claude Code.
metadata:
  internal: true
---

# Create Universal Plugin

Scaffold a single plugin directory that works in both Cursor and Claude Code. Both agents read `skills/<name>/SKILL.md` identically; the only differences are manifest paths, MCP filename, and hook schema.

## Agent landscape

| Agent | Plugin system | SKILL.md compatible? |
|-------|--------------|---------------------|
| Claude Code | `.claude-plugin/plugin.json` | Yes |
| Cursor | `.cursor-plugin/plugin.json` | Yes |
| Amp (Sourcegraph) | `.agents/skills/` convention | Partial — same format, different install path |
| Gemini CLI, Continue.dev, Codex CLI, OpenCode | Distinct formats | No |

## Step 1 — Determine scope

Default to **team** unless the user specifies otherwise.

| Scope | Claude Code | Cursor |
|-------|-------------|--------|
| Personal | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink |
| **Team (default)** | npm private package | Cursor Teams: admin imports GitHub repo |
| Public | PR to `anthropics/claude-plugins-official` (open source) | Submit to `cursor.com/marketplace/publish` (open source) |

## Step 2 — Determine components

Infer from context; ask only if ambiguous. Always scaffold at least one skill.

| Component | Directory | Cross-agent? | Notes |
|-----------|-----------|-------------|-------|
| Skills | `skills/<name>/SKILL.md` | Yes | Identical format |
| Commands | `commands/<name>.md` | Yes | Compatible format |
| Agents | `agents/<name>.md` | Yes | Compatible format |
| MCP | `.mcp.json` + `mcp.json` symlink | Yes | Symlink avoids drift |
| Hooks | `hooks/hooks.json` | Partial | Incompatible schemas (see Step 4) |
| Rules | `rules/<name>.mdc` | No | Cursor-only always-on injection |

**Rules vs. skills:** Skills are triggered by situation and work in both agents. Rules inject always-on into every Cursor interaction. For cross-agent always-on guidance, use `AGENTS.md` (both agents read it). Only scaffold `rules/` when the user explicitly needs always-on behavior, and always bundle a `commands/setup.md` that merges rule content into the project's `AGENTS.md` — after that, the `.mdc` files are redundant.

## Step 3 — Scaffold the directory

```
<plugin-name>/
├── .claude-plugin/
│   └── plugin.json           ← Claude Code manifest
├── .cursor-plugin/
│   └── plugin.json           ← Cursor manifest (identical content)
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── commands/
│   ├── setup.md              ← post-install setup (scaffold when rules/ included)
│   └── <cmd-name>.md
├── agents/
│   └── <agent-name>.md
├── rules/
│   └── <rule-name>.mdc       (only if always-on guidance requested)
├── hooks/
│   ├── hooks.json            (Claude Code format)
│   └── <impl>.sh             (shared implementation script)
├── .mcp.json                 (MCP config — source of truth)
├── mcp.json -> .mcp.json     (symlink; Cursor reads this)
└── README.md
```

Both `plugin.json` files have identical content:

```json
{
  "name": "<plugin-name>",
  "description": "<description>",
  "version": "1.0.0",
  "author": { "name": "<author>" }
}
```

## Step 4 — Populate templates

**Skill (`skills/<name>/SKILL.md`):**
```markdown
---
name: <skill-name>
description: Use this skill when <trigger>. <One-line summary.>
---

# <Title>

## When to use
<conditions>

## Instructions
1. First step
2. Second step
```

**Command (`commands/<name>.md`):**
```markdown
---
description: <Short description shown in help>
argument-hint: [optional-arg]
allowed-tools: [Read, Bash]
---
# <Command Title>
<instructions>
```

**Agent (`agents/<name>.md`):**
```markdown
---
name: <agent-name>
description: Use this agent to <when to invoke>.
model: sonnet
---
<agent instructions>
```

**Rule (`rules/<name>.mdc`, always-on only):**
```markdown
---
description: <rule description>
globs: ["**/*"]
alwaysApply: true
---
# <Rule Title>
<guidance — same content will be merged into AGENTS.md by the setup command>
```

**Setup command (`commands/setup.md`, required when `rules/` is included):**
```markdown
---
description: Post-install setup — merge always-on plugin guidance into project AGENTS.md
---
# Plugin Setup

Run once after installing the plugin.

## Instructions

1. Read all `.mdc` files under this plugin's `rules/` directory
2. Strip YAML frontmatter from each file
3. Append the remaining content as a new `## <plugin-name>` section in the project's `AGENTS.md`
4. Confirm the merge completed
5. The `rules/*.mdc` files are now redundant — both Cursor and Claude Code read from `AGENTS.md`.
   Delete them if desired.
```

**Hooks — Claude Code (`hooks/hooks.json`):**

Claude Code and Cursor use incompatible schemas:

| Aspect | Claude Code | Cursor |
|--------|-------------|--------|
| Event names | PascalCase (`PreToolUse`) | camelCase (`preToolUse`) |
| Required top-level key | none | `"version": 1` |
| Plugin root env var | `CLAUDE_PLUGIN_ROOT` | not available |

Scaffold `hooks/hooks.json` for Claude Code. Extract shared logic into `hooks/<impl>.sh`. For Cursor hooks, instruct the user to add an entry in `.cursor/hooks.json` at the project root pointing to the same script.

Claude Code (`hooks/hooks.json`):
```json
{
  "description": "<plugin-name> hooks",
  "hooks": {
    "PreToolUse": [
      { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/<impl>.sh\"", "timeout": 10 }
    ],
    "PostToolUse": [],
    "Stop": [],
    "UserPromptSubmit": []
  }
}
```

Cursor (user adds to `.cursor/hooks.json` at project root):
```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      { "type": "command", "command": "<plugin-path>/hooks/<impl>.sh", "timeout": 10 }
    ]
  }
}
```

**MCP (`.mcp.json`):**
```json
{
  "<server-name>": {
    "type": "http",
    "url": "https://...",
    "headers": {}
  }
}
```

## Step 5 — Create MCP symlink (if MCP included)

```bash
cd <plugin-name>
ln -sf .mcp.json mcp.json
```

`.mcp.json` is the source of truth; Cursor reads `mcp.json` via the symlink. Never commit `mcp.json` as a regular file. If the repo needs explicit symlink tracking:

```
# .gitattributes
mcp.json symlink
```

## Step 6 — Audit the plugin's skills

```bash
npx cyber-skills@<version> audit validate --path <plugin-name>/skills/<skill-name>
```

Fix any CRITICAL findings. Then invoke **audit-skill** for full review (Q6–Q12, E3–E8, P1–P3).

## Step 7 — Install locally for testing

```bash
# Claude Code
ln -sf "$(pwd)/<plugin-name>" ~/.claude/plugins/local/<plugin-name>

# Cursor
ln -sf "$(pwd)/<plugin-name>" ~/.cursor/plugins/local/<plugin-name>
# Then reload: Cursor → Developer: Reload Window
```

## Step 8 — Distribution

Distribute per scope from Step 1. For team distribution via npm, the plugin directory must be the package root — both `.claude-plugin/` and `.cursor-plugin/` must be present at the npm package root.
