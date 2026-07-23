---
"cyberplace": patch
---

Fix `readMarketplacePlugins` crashing on plugins whose marketplace `source` is an npm descriptor object instead of a local-directory string. npm-sourced plugins now render with a `npm:<package>` source label and an npmjs.com link.
