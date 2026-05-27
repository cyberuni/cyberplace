---
"cyber-skills": minor
---

Add `skill.json` sidecar support for install-time skill metadata. Skills can declare `distribution.install_via: package_manager` in a `skill.json` file alongside `SKILL.md` to prevent source-based installs via `skills add org/repo`. Skills flagged as package-managed are skipped with a hint to use `skills add <package-name>` instead. Also exports `SkillManifest` type and `readSkillManifest`/`isPackageManaged` utilities.
