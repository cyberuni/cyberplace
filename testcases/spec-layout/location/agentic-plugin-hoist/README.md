# location — agentic plugin (hoist)

**Input** (a shippable agent plugin; its folders are fixed by the plugin format):
```
plugins/myplugin/
  .plugin/plugin.json   skills/   agents/
```
**Detected:** an agentic plugin (`.plugin/` + `skills/` + `agents/`).
**Choice:** location **hoisted** → `<repo>/.agents/specs/myplugin/` (the spec must not ship inside the
distributable). Strategy `capability-first` (legibility over the fixed source layout).
**Full real example:** `.agents/specs/aced/` (the ACED proof). This fixture is the minimal generic case.
