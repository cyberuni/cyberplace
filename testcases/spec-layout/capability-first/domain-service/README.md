# capability-first — domain service

**Input** (a domain service, navigated by what it does):
```
orders-service/
  src/orders/   src/billing/   src/notifications/
  package.json  tsconfig.json
```
**Detected:** a domain decomposition is discernible; not a plugin, not a monorepo.
**Choice:** strategy `capability-first` (default), location `colocated` (`<project>/.agents/spec/`).
**Expected:** top-level folders scream the capabilities; behavioral leaves own their suites.
