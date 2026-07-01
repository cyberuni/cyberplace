---
title: create-spec
description: Scaffold a spec.md and .feature file for a new domain.
---

Scaffolds `specs/<domain>/spec.md` and `specs/<domain>/<domain>.feature` for a new or existing domain.

## When to use

- Starting a new feature or command group
- Backfilling a spec for an existing domain that has no spec yet (the skill infers from existing code + tests)
- Saying **"create spec for X"** or **"write spec"** in Claude Code

## What it produces

Two files per domain:

| File | Purpose |
|---|---|
| `specs/<domain>/spec.md` | Describes What, Why, command surface, links to `.feature` |
| `specs/<domain>/<domain>.feature` | Gherkin scenarios for success and failure cases |

The spec starts with `Status: Draft`.

## How it works

### New feature

The skill asks you for What, Why, and the command surface. It does not scaffold until you have at least a draft answer for each.

### Backfill (implementation exists)

The skill reads existing source files and tests to infer What, Why, design decisions, and command surface. It presents the inferred content and asks you to review before writing.

## After creation

Run `validate-spec` before committing. The skill does this automatically as step 6 of its process.

Commit with:
```
docs(specs): add <domain> spec
```
