---
name: update-awesome-list
description: Use this skill when adding or updating a curated awesome-list entry, including summaries and README sync.
---

# Update Awesome List

Add or update entries in the current repo's `awesome-skills.json`, then regenerate the README awesome-list section.

## Entry target

When the user gives a repo, do not assume the right recommendation unit. Inspect first, then ask whether they want:

- the whole repo as an entry
- one or more specific skills as entries
- a repo entry with highlighted skills

If the repo has many public skills, tell the user the exact count when available. If the count is greater than 12, tell the user it appears to be a broad-catalog repo and recommend adding specific skills, while still allowing:

- repo only
- repo with highlights
- specific skills only

Use natural-language narrowing when the user wants help selecting standout skills or highlights.

Inspect the repo with the bundled helper:

```bash
npx cyber-skills@<version> awesome inspect owner/name
```

Narrow by query when needed:

```bash
npx cyber-skills@<version> awesome inspect owner/name --query "release"
```

## Editing rules

1. Edit `awesome-skills.json`.
2. Store repo recommendations under the top-level `repos` object, keyed by normalized repo id (`owner/name`).
3. Store skill recommendations under the top-level `skills` object, keyed by canonical skill id (`owner/name::skill-name`).
4. Keep the embedded `repo` and `skill` values consistent with the object key.
5. Store a neutral `summary` for what the repo or skill does.
6. Store a separate `why_recommended` note for why the user or agent recommends it.
7. Keep tags short and lower-kebab-case.
8. Repo entries may include typed `highlights` using:

```json
{
  "type": "skill",
  "key": "audit-skill",
  "summary": "Audit SKILL.md structure, quality, and security.",
  "why_recommended": "Strong review rubric before installing or publishing skills.",
  "tags": ["audit", "security"]
}
```

## Finish

After editing, regenerate the README bounded section so the human-facing list stays in sync with `awesome-skills.json`:

```bash
npx cyber-skills@<version> awesome render
```
