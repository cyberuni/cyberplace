# discover-specs

The concrete engine for SDD **spec discovery**. A non-user-invocable skill carrying a self-contained `.mts`
script that scans the three SDD spec locations, filters candidates by the lifecycle `status` shape,
parses each `spec.md`'s frontmatter only, and emits a TOON list of the specs found.

- **Skill contract:** [`SKILL.md`](./SKILL.md)
- **Script:** [`scripts/discover-specs.mts`](./scripts/discover-specs.mts)
- **Tests:** [`scripts/discover-specs.test.mts`](./scripts/discover-specs.test.mts) (`node:test`)

```bash
node scripts/discover-specs.mts --root . --format toon
```
