# CLI Resolution

Rules for invoking a Node CLI that may be installed globally, repo-locally, or not at all. Apply when authoring a skill that depends on a released npm binary (e.g. `cyber-asana`, `cyber-skills`).

## Resolution order

Resolve the CLI once at the start of the skill workflow. Try each tier in order; stop at the first that succeeds.

### Tier 1 — PATH

```bash
command -v <bin> >/dev/null 2>&1 && <bin> --version >/dev/null 2>&1
```

Use the bare binary name for all subsequent calls if this succeeds.

### Tier 2 — package manager exec

Detect the package manager from the lock file present in the subject repo root:

| Lock file | Command prefix |
| --- | --- |
| `pnpm-lock.yaml` | `pnpm exec <bin>` |
| `yarn.lock` | `yarn exec <bin>` |
| `bun.lock` or `bun.lockb` | `bunx <bin>` |
| none of the above | `npm exec <bin> --` |

Test the resolved prefix:

```bash
<prefix> --version >/dev/null 2>&1
```

Use the prefix for all subsequent calls if this succeeds.

Note: `npm exec <bin> --` requires the `--` separator before any arguments to the binary.

### Tier 3 — npx bootstrap

Use `npx` only when Tier 1 and Tier 2 both fail. Always pin an exact version:

```bash
npx --yes <pkg>@<exact-version> <subcommand>
```

Get the exact version: `npm view <pkg> version`.

`npx` at this tier installs once and caches; do not use it as the steady-state invocation path.

## Error handling

If all three tiers fail, surface a clear error — do not proceed silently:

```
Error: <bin> not found. Install with:
  npm install -g <pkg>          # global
  pnpm add -D <pkg>             # repo-local devDependency
```

## Skill authoring pattern

Embed a resolution block at the start of any skill workflow that depends on a Node CLI:

```bash
# Resolve <bin>
if command -v <bin> >/dev/null 2>&1 && <bin> --version >/dev/null 2>&1; then
  CMD="<bin>"
elif [ -f pnpm-lock.yaml ] && pnpm exec <bin> --version >/dev/null 2>&1; then
  CMD="pnpm exec <bin>"
elif [ -f yarn.lock ] && yarn exec <bin> --version >/dev/null 2>&1; then
  CMD="yarn exec <bin>"
elif { [ -f bun.lock ] || [ -f bun.lockb ]; } && bunx <bin> --version >/dev/null 2>&1; then
  CMD="bunx <bin>"
elif npm exec <bin> -- --version >/dev/null 2>&1; then
  CMD="npm exec <bin> --"
else
  echo "Error: <bin> not found. Install with: npm install -g <pkg>" >&2
  exit 1
fi
# Use $CMD for all subsequent invocations
$CMD <subcommand>
```

Replace `<bin>` with the CLI binary name and `<pkg>` with the npm package name (they differ when the binary name differs from the package name).

## Rules

- Never hardcode `node_modules/.bin/<bin>` — this path is implementation-specific and breaks across workspaces and package managers.
- Never rely on repo-specific package scripts (e.g. `pnpm cyber-asana`) — these are local conventions, not portable.
- Always pin an exact version when using Tier 3 (`npx --yes <pkg>@<exact>`).
- Prefer Tier 1 or Tier 2 as the steady-state path; treat Tier 3 as one-time bootstrap only.

## References

- `governance show skill-design` — SKILL.md authoring rules
