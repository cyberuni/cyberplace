# location — monorepo (multi-project)

**Input** (a monorepo with multiple package anchors):
```
repo/
  apps/web/{package.json,src}
  packages/ui/{package.json,src}
  package.json (workspaces)
```
**Detected:** a monorepo (`apps/`+`packages/`, multiple anchors).
**Choice:** offer to backfill **every package** (each hoisted to `<repo>/.agents/specs/<pkg>/`) plus the
**outer** project (`<repo>/.agents/spec/`). One detect→strategy→scaffold loop **per project**.
**Expected:** three roots — `specs/web/`, `specs/ui/`, and the outer `spec/`.
