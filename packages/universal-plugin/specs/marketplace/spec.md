# Marketplace Domain Spec

**Status:** Planned
**Commands:** `universal-plugin marketplace publish`, `universal-plugin marketplace register`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The marketplace domain publishes plugins and registers them in a discoverable index. `publish` packages and uploads a plugin to a registry; `register` declares an existing npm package or GitHub repo as a plugin in the marketplace index without uploading.

---

## Why

Plugin authors need a way to make their plugins discoverable via `universal-plugin search`. Without a publish/register step, plugins exist only as private repos or unlisted npm packages. The marketplace closes this gap by providing a lightweight index that `search` queries.

---

## Design decisions

### Two distinct operations

| Command | When to use |
|---|---|
| `publish` | Author controls packaging; CLI bundles and uploads |
| `register` | Plugin already published to npm or GitHub; add it to the index |

Most plugin authors will use `register` (point the index at an existing npm package). `publish` is for workflows where the CLI manages the upload step.

### Authentication

Both commands require authentication with the marketplace registry. Auth token is read from:
1. `UNI_PLUGIN_TOKEN` environment variable
2. `~/.agents/universal-plugin-auth.json`

If neither is present, the command prompts for a token interactively (TTY only) or exits 1 with an error in non-interactive mode.

### `publish` validates before uploading

`publish` runs the same validation as `universal-plugin validate` before uploading. If validation fails, nothing is uploaded and the process exits 1.

### `register` validates the package exists

`register` checks that the declared npm package or GitHub repo is publicly accessible before adding it to the index. An inaccessible package is an error (exit 1).

### Dry run

Both commands support `--dry-run`: resolve, validate, and report what would be sent — without uploading or modifying the index.

### Registry URL

Defaults to the official marketplace registry. Override with `--registry <url>` for self-hosted or staging registries.

### Output

**`publish`:**

```
Validating plugin...
Uploading my-plugin@1.0.0...
Published: https://registry.example.com/plugins/my-plugin
```

**`register`:**

```
Checking npm package @myorg/my-plugin...
Registered: https://registry.example.com/plugins/my-plugin
```

With `--format json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "url": "https://registry.example.com/plugins/my-plugin"
}
```

---

## Command surface

### `universal-plugin marketplace publish`

```
universal-plugin marketplace publish [--registry <url>] [--dry-run] [--yes]
                                [--root <path>] [--format <format>]
```

**Exit codes:** `0` = published; `1` = validation failure, auth error, or upload error

---

### `universal-plugin marketplace register`

```
universal-plugin marketplace register <spec> [--registry <url>] [--dry-run]
                                        [--format <format>]
```

`<spec>` is an npm package name (`@scope/package`) or a GitHub repo (`org/repo`).

**Exit codes:** `0` = registered; `1` = package not found, auth error, or index write error

---

**Gherkin scenarios:** `marketplace.feature` (planned)
