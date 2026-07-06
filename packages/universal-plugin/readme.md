# universal-plugin

[![npm version](https://img.shields.io/npm/v/universal-plugin.svg)](https://www.npmjs.com/package/universal-plugin)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Universal AI agent plugin build tool. Author one canonical plugin manifest (`.plugin/plugin.json`) and generate vendor-specific manifests for Claude Code, Cursor, Codex, and GitHub Copilot CLI.

## Usage

No install required — run with `npx`:

```sh
npx universal-plugin <command>
```

Or pin to an exact version for reproducible builds:

```sh
npx universal-plugin@0.2.0 <command>
```

## Commands

### plugin — author the canonical manifest

```sh
# Generate vendor manifests from .plugin/plugin.json
npx universal-plugin plugin build
```

`validate` and `init` are specified but implementation is deferred.

### sync — cross-vendor plugin sync

```sh
# Detect cross-vendor sync actions from a vendor's manifest
npx universal-plugin prepare <vendor-id>              # e.g. claude-code
npx universal-plugin prepare <vendor-id> --scope project --root <path>
npx universal-plugin prepare <vendor-id> --dry-run    # print action count without writing state

# Apply a pending sync action
npx universal-plugin sync apply <action-id>
```

### publish

```sh
# Sync version from packagePath/package.json into .plugin/plugin.json
npx universal-plugin publish sync-version
```

### governance

Version-pinned agent-tool contracts, read at runtime.

```sh
npx universal-plugin governance list
npx universal-plugin governance show plugin-design
```

### Housekeeping

```sh
npx universal-plugin clean                            # remove the asset store
npx universal-plugin self-update <version>            # update the version pin in hook files
```

## License

MIT
