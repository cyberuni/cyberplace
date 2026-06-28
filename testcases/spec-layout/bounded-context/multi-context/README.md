# bounded-context (DDD) — multi-context

**Input** (a multi-team domain with distinct subdomains + a shared term that means different things):
```
shop/
  ordering/   inventory/   identity/
  CODEOWNERS (3 teams)
```
**Detected:** multiple bounded contexts / owners; vocabulary differs per context.
**Choice:** strategy `bounded-context`, location `colocated`. Adds a **glossary** + a **context-map**.
**Expected:** one descriptive-index folder per context, behavioral leaves inside; context-map in design/.
