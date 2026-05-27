---
"cyber-skills": minor
---

Add `bun` to the `PackageManager` type. `detectPackageManager` now detects `bun.lock` and `bun.lockb` lock files and returns `'bun'`. `installNpmPackage` installs with `bun add -d`.
