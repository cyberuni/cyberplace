---
title: Supply Chain
description: Understanding the two-surface supply chain and how to pin each one.
---

cyber-skills has **two independent delivery surfaces**:

| Surface | Source | Pinning |
| ------- | ------ | ------- |
| **Skills** (`SKILL.md` files) | GitHub — `cyberuni/cyber-skills` repo | `skills-lock.json` or `pnpm add -D cyber-skills` |
| **CLI** (`cyber-skills` binary) | npm — `cyber-skills` package | `npx cyber-skills@<exact-version>` |

A malicious or accidental change to either surface can affect agent behavior. Treat them separately.

## Trust tiers

### Solo / quick start

```bash
npx skills add cyberuni/cyber-skills --skill init -g
```

Pulls from the live default branch. Convenient; no lock file. Acceptable for personal use where you trust the repo directly.

### Teams (recommended)

```bash
# Install project-scoped
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline

# Commit the lock file
git add skills-lock.json && git commit -m "chore: pin cyber-skills skill versions"

# Restore from lock on CI or a fresh clone
npx skills ci
# or
npx skills experimental_install
```

`skills-lock.json` records the exact commit SHA each skill was installed from. Anyone who runs `npx skills ci` gets the same files you reviewed.

### Strongest coupling

```bash
pnpm add -D cyber-skills
npx skills add ./node_modules/cyber-skills --skill init --skill init-commit-discipline
```

Skill files and the CLI come from the same npm release. The `package.json` version is your lock. Use this when you want a single audit surface.

## CLI pinning

Never use `@latest` in hooks or CI — it resolves at runtime and can pull in breaking changes:

```bash
# Bad — resolves to whatever is latest at run time
npx cyber-skills@latest hook run …

# Good — resolves once, stored in the hook registration
npx cyber-skills@0.3.0 hook run …
```

The `init-commit-discipline` skill resolves the current npm version and writes it into the hook. Re-run the skill after upgrading to bump the pin.

## Threat model

The full supply chain threat model is documented in [`docs/research/2026-05-cyber-skills-supply-chain-threat-model.md`](https://github.com/cyberuni/cyber-skills/blob/main/docs/research/2026-05-cyber-skills-supply-chain-threat-model.md) in the source repository.
