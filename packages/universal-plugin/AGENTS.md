# AGENTS.md — universal-plugin

## Architecture

### Screaming Architecture

Folders are named after **domain concepts**, not technical roles. A new reader should be able to guess what the package does just from the directory names.

- `src/governance/` — governance file handling
- `src/build/` — plugin build logic

Add new top-level folders only when a new domain concept warrants it. Do **not** create generic folders like `src/utils/`, `src/helpers/`, `src/services/`, or `src/common/`.

### Clean Architecture

Dependencies flow **inward only**: outer layers may import inner layers; inner layers must never import outer layers.

```
cli (entry / interface)
  └── application (use cases, orchestration)
        └── domain (pure logic, types, rules)
```

| Layer | Folder pattern | Allowed imports |
|-------|---------------|-----------------|
| Interface / CLI | `<domain>/cli.ts` | application, domain |
| Application | `<domain>/<domain>.ts` | domain only |
| Domain | types, pure functions | nothing (no Node, no I/O) |
| Infrastructure | `<domain>/fs.ts`, `<domain>/http.ts` | domain only |

**Rules:**
- Domain code must be pure — no filesystem, network, or process calls.
- CLI files wire together application + infrastructure; they own side effects.
- Infrastructure adapters implement domain-defined interfaces; they do not define them.
- Cross-domain imports are allowed only at the application layer and above.
