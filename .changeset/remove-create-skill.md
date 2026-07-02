---
"cyberplace": minor
---

Remove `create-skill`. Its scope is fully covered by `aced:define-skill`, which also handles
already-escaped (non-durable) requests via a dedicated scaffold-and-stop entry point.

Migration: use `aced:define-skill`.
