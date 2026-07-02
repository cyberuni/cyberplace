---
"cyber-skills": minor
---

Add `aced:define-agent` skill for creating and improving agent definitions. Guides users through three modes — **Delegated** (subagent only), **Invokable** (dual-mode: subagent + in-context persona via a companion command), and **In-context only** — and asks upfront about placement (user-global, project, or plugin). Scaffolds the canonical file under `.agents/agents/`, creates runtime symlinks, and for Invokable mode generates a thin companion command file.
