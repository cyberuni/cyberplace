---
title: Installation
description: How to install and run universal-plugin.
---

## Run without installing

Always pin to an exact version in scripts and hooks — never use `@latest`:

```bash
# Explore (one-off)
npx universal-plugin@latest --help

# Scripts and CI (pin to current version)
npx universal-plugin@$(npm view universal-plugin version) build
```

## Install globally

```bash
npm install -g universal-plugin
universal-plugin plugin build
```

## Install as a dev dependency

```bash
npm install --save-dev universal-plugin
# or
pnpm add -D universal-plugin
```

Then use it from `package.json` scripts:

```json
{
  "scripts": {
    "build:plugin": "universal-plugin plugin build",
    "postinstall": "universal-plugin plugin build"
  }
}
```

## Requirements

- Node.js >= 22
- A `.plugin/plugin.json` at the plugin root (see [Introduction](/getting-started/introduction/))
