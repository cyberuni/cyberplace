---
"cyber-skills": minor
---

Remove `create-skill`. Its scope is fully covered by `aces:define-skill`, which also handles
already-escaped (non-durable) requests via a dedicated scaffold-and-stop entry point.

Migration: use `aces:define-skill`.
