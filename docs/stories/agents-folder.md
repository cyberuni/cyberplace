# Story: `agents/` as Standard Authoring Folder for Public Skills

## Context

Currently, public skills live in `skills/` and governances in `governances/` at the repo root — scattered top-level dirs. The goal is to consolidate all AI-agent-facing authored content under `agents/` (visible, not hidden), symlinked into `.agents/` for AI agent discovery. The `update` command must skip `.agents/skills/<name>` entries that are symlinks (since those are locally authored, not installed from a remote source).

Note: `remote.ts` already handles `agents/skills/` in `listRepoSkills` and `fetchAndInstallSkill` (added in anticipation of this migration). `awesome-skills.json` uses `skills/<name>/SKILL.md` paths — needs updating.

## Changes

### 1. File/directory migration

Move all real-directory (authored) skills:
- `skills/<name>/` → `agents/skills/<name>/` for each non-symlink dir in `skills/`

Move governances:
- `governances/*.md` → `agents/governances/*.md`

Create AI-agent discovery symlinks:
- `.agents/skills/<name>` → `../../agents/skills/<name>` for each moved public skill

Remove now-stale symlinks:
- `skills/add-changeset`, `skills/create-issue`, `skills/fix-security-pr`, `skills/merge-dep-prs` (these pointed `.agents/skills/<name>` — will move to `agents/skills/` via `tryCreateSkillsSymlink` update below)

### 2. `src/skill/list.ts` — scan `agents/skills/`

Replace the `skills/` source entry with `agents/skills/`:

```ts
{ dir: join(root, 'agents', 'skills'), foundIn: 'repo' },           // was 'skills'
// ...
{ dir: join(getPackageRoot(), 'agents', 'skills'), foundIn: 'package' },  // was 'skills'
```

Keep `.agents/skills/` first (private skills override public ones by name).

### 3. `src/governance/load.ts` — look in `agents/governances/`

Change `governancesDir()`:
```ts
function governancesDir(): string {
  return path.join(getPackageRoot(), 'agents', 'governances')
}
```

### 4. `src/registry/add.ts` — `tryCreateSkillsSymlink` to `agents/skills/`

Change symlink destination from `skills/` to `agents/skills/`:
```ts
const symlinkPath = join(root, 'agents', 'skills', name)    // was: 'skills', name
// ...
fs.mkdirSync(join(root, 'agents', 'skills'), { recursive: true })  // was: 'skills'
```

### 5. `src/registry/npm.ts` — check `agents/skills/`

In `installNpmPackage`, change the `skillsDir` resolution:
```ts
const skillsDir = fs.existsSync(join(installedDir, 'agents', 'skills'))
  ? join(installedDir, 'agents', 'skills')
  : fs.existsSync(join(installedDir, 'skills'))
    ? join(installedDir, 'skills')     // backward compat for old packages
    : null
```

### 6. `package.json` `files` — ship `agents/`

```json
"files": [
  "bin",
  "dist",
  "agents"
]
```

(Remove `skills` and `governances`; ship the whole `agents/` tree)

### 7. `awesome-skills.json` — update `skillPath` values

Update each `skillPath` in the highlights from `skills/<name>/SKILL.md` → `agents/skills/<name>/SKILL.md`.

### 8. `src/registry/update.ts` — skip symlinks

Add `skipped: boolean` to `UpdateResult`:
```ts
export interface UpdateResult {
  name: string
  updated: boolean
  skipped: boolean   // NEW
  message: string
}
```

In `updateSkill()`, after lock-entry lookup, before reading metadata:
```ts
const skillDir = join(getInstallDir(root, scope), name)
if (fs.existsSync(skillDir) && fs.lstatSync(skillDir).isSymbolicLink()) {
  return { name, updated: false, skipped: true, message: `Skill '${name}' is a local symlink — skipped` }
}
```

All other returns get `skipped: false`.

In `updateAllSkills()`, inside the git-batch loop, filter symlinks before building `metadataMap`:
```ts
const symlinkSkipped: UpdateResult[] = []
const activeNames: string[] = []
for (const name of names) {
  const skillDir = join(installDir, name)
  if (fs.existsSync(skillDir) && fs.lstatSync(skillDir).isSymbolicLink()) {
    symlinkSkipped.push({ name, updated: false, skipped: true, message: `Skill '${name}' is a local symlink — skipped` })
  } else {
    activeNames.push(name)
  }
}
results.push(...symlinkSkipped)
if (activeNames.length === 0) continue
// ... rest uses activeNames ...
```

In `src/registry/cli.ts` update display: `r.skipped ? '~' : r.updated ? '+' : '!'`.

### 9. `src/skill/repair.ts` — allow `agents/` symlinks

Add `'kept_agents_symlink'` to `RepairAction.action` union.

In `repairPrivateSkills()`, inside the `if (stat.isSymbolicLink())` block, after `if (inPublicTree)`:
```ts
const agentsSkillsDir = path.join(root, 'agents', 'skills')
const inAgentsTree =
  resolved === path.join(agentsSkillsDir, entry.name) ||
  resolved.startsWith(`${agentsSkillsDir}${path.sep}`)
if (inAgentsTree) {
  actions.push({ skill: entry.name, action: 'kept_agents_symlink', details: `${skillDir} -> ${resolved}` })
  continue   // skip metadata-enforcement for symlinked authored skills
}
```

Same pattern in `validatePrivateSkills()` — after `if (inPublicTree)` push, add:
```ts
if (inAgentsTree) continue
```

### 10. Tests

Update any test that hardcodes `skills/` paths to use `agents/skills/`. Key test files:
- `src/registry/add.test.ts` — `tryCreateSkillsSymlink` creates `agents/skills/<name>`
- `src/skill/repair.test.ts` — add `kept_agents_symlink` tests; existing `skills/`-symlink removal tests still pass
- `src/registry/update.test.ts` — add symlink-skip tests; add `skipped: false` to existing `UpdateResult` assertions

## Verification

```bash
pnpm verify   # typecheck + lint + test + test:audit
```

Manual smoke test:
```bash
node bin/cyber-skills.mjs skill list            # all public skills appear
node bin/cyber-skills.mjs governance list       # all governances appear
node bin/cyber-skills.mjs governance show skill-design
ls -la .agents/skills/audit-skill              # shows symlink → ../../agents/skills/audit-skill
node bin/cyber-skills.mjs skill validate-private
```
