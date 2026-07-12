---
name: resync-local-plugins
description: "Use this skill after committing changes to this repo's plugins or skills, to re-pin the local-directory cyberplace marketplace so the installed plugins reflect the new HEAD. Triggers: 'resync the plugins', 'the marketplace is stale', 'my skill edit isn't loading', 'update the local plugins', after landing a commit under plugins/."
metadata:
  internal: true
---

# Resync Local Plugins

This repo's `cyberplace` Claude Code marketplace is a **`directory` source** pointing at the local working tree. A directory marketplace snapshots at the **committed git HEAD**, not the working tree — so uncommitted plugin/skill edits never go live, and installed plugins stay pinned to whatever HEAD was current when they were last installed. Run this after committing plugin/skill changes to move the pin forward.

## Preconditions

- Your plugin/skill edits are **committed** (this reads HEAD, not the working tree). Uncommitted edits are invisible — commit first.
- The `cyberplace` marketplace is a directory source at this repo. Confirm:
  ```bash
  claude plugin marketplace list        # cyberplace → Source: Directory (…/cyberplace)
  ```
  If it still points at GitHub, repoint it first: `claude plugin marketplace remove cyberplace && claude plugin marketplace add "$(git rev-parse --show-toplevel)"`.

## Steps

1. **Re-snapshot the marketplace** to current HEAD:
   ```bash
   claude plugin marketplace update cyberplace
   ```

2. **Re-pin every installed `@cyberplace` plugin.** Plain `install` is idempotent and will NOT move the pin — you must uninstall then install:
   ```bash
   for p in $(claude plugin list 2>/dev/null | grep -oE '[a-z-]+@cyberplace' | cut -d@ -f1 | sort -u); do
     claude plugin uninstall "${p}@cyberplace"
     claude plugin install   "${p}@cyberplace"
   done
   ```

3. **Verify** every pin now matches HEAD:
   ```bash
   HEAD=$(git rev-parse --short=12 HEAD)
   python3 -c "
   import json
   d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'))
   def walk(o):
       if isinstance(o,dict):
           for k,v in o.items():
               if '@cyberplace' in str(k):
                   print(k,'=>',v[0]['version'] if isinstance(v,list) else v)
               walk(v)
   walk(d)"
   echo "HEAD: $HEAD"
   ```
   Every `@cyberplace` line must equal HEAD.

4. **Tell the user to restart.** Plugins load only at `claude` **process** startup — `/new` and `/clear` reset the conversation but do NOT reload plugins. The re-pin takes effect only after they fully quit and relaunch the `claude` process.

## Notes

- Do not push or commit anything here — this only touches local plugin install state (`~/.claude/plugins/`), never the repo.
- If a plugin fails to reinstall, report which one and stop; do not leave the set half-pinned.
