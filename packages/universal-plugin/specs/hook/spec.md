# Hook Domain Spec

**Status:** Planned
**Commands:** `universal-plugin hook register`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The hook domain registers lifecycle hooks into vendor-specific configuration files. A hook wires a shell command to a lifecycle event so the agent runtime executes it automatically (e.g. run `universal-plugin prepare` after every install).

---

## Why

Each vendor stores hooks differently and uses different event naming conventions. Maintaining hook registrations by hand across vendors is error-prone. `universal-plugin hook register` reads a hook definition from the plugin manifest and writes the correct entries into each vendor's config file.

---

## Design decisions

### Hook definitions live in the manifest

Hooks are declared in `.plugin/plugin.json` under a `hooks` array. Each entry specifies the event name and command:

```json
{
  "hooks": [
    {
      "event": "PostInstall",
      "command": "universal-plugin prepare"
    }
  ]
}
```

`hook register` reads this array and writes vendor-specific entries.

### Event name translation

Vendors use different casing conventions for the same conceptual event:

| Vendor | Convention | Example |
|---|---|---|
| Claude Code | PascalCase | `PostInstall` |
| Codex | PascalCase | `PostInstall` |
| Cursor | camelCase | `postInstall` |
| Copilot CLI | camelCase | `postInstall` |

`hook register` translates the canonical PascalCase event name in the manifest to the correct casing for each target vendor.

### Vendor-specific output paths

| Vendor | Hook config path |
|---|---|
| Claude Code | `.claude/settings.json` |
| Cursor | `.cursor/hooks.json` |
| Codex | `.codex/hooks.json` |
| Copilot CLI | `.github/copilot/hooks.json` |

### `--vendor` limits registration to one runtime

Without `--vendor`, register writes hook entries for all declared vendors. With `--vendor <id>`, only that vendor's config is touched.

### Registration is idempotent

If the hook is already registered with the same command, the entry is not duplicated. If the command differs, the existing entry is updated.

### `--dry-run` previews without writing

Lists the files that would be modified and the entries that would be added or updated. Exits 0.

### Output

```
Registered PostInstall → .claude/settings.json (claude-code)
Registered postInstall → .cursor/hooks.json (cursor)
Done. 2 hook(s) registered.
```

With `--format json`:

```json
{
  "registered": [
    { "vendor": "claude-code", "event": "PostInstall", "file": ".claude/settings.json" },
    { "vendor": "cursor", "event": "postInstall", "file": ".cursor/hooks.json" }
  ]
}
```

---

## Command surface

```
universal-plugin hook register [--vendor <id>] [--dry-run] [--verbose]
                         [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — all hooks registered (or dry-run completed)
- `1` — manifest not found, unknown event name, or write error

**Gherkin scenarios:** `hook.feature` (planned)
