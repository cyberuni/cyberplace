import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import { runChecks } from '../../../skills/audit-skill/scripts/validate-skills.mts'

function withTempSkill(content: string, check: (skillFile: string) => void): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-skill-'))
  const skillDir = path.join(tempDir, 'skills', 'sample-skill')
  fs.mkdirSync(skillDir, { recursive: true })
  const skillFile = path.join(skillDir, 'SKILL.md')
  fs.writeFileSync(skillFile, content)

  try {
    check(skillFile)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

const skillFrontmatter = `---
name: sample-skill
description: "Use this skill when the user wants a validator regression test for shell-expanded references."
---

# Sample Skill

## Steps
`

test('S4 ignores shell variable references in code blocks', () => {
  withTempSkill(`${skillFrontmatter}
\`\`\`bash
SKILL_DIR=$(pwd)
node "$SKILL_DIR/scripts/detect-state.mts"
node "\${SKILL_DIR}/scripts/scaffold-workflows.mts"
node "\$(pwd)/scripts/validate-skills.mts"
\`\`\`
`, (skillFile) => {
    const result = runChecks(skillFile)
    const s4Warnings = result.warnings.filter(finding => finding.checkId === 'S4')
    assert.equal(s4Warnings.length, 0)
  })
})

test('S4 still warns for missing literal bundled files', () => {
  withTempSkill(`${skillFrontmatter}
\`\`\`bash
node scripts/missing-helper.mts
\`\`\`
`, (skillFile) => {
    const result = runChecks(skillFile)
    const s4Warnings = result.warnings.filter(finding => finding.checkId === 'S4')
    assert.equal(s4Warnings.length, 1)
    assert.match(s4Warnings[0]?.evidence ?? '', /scripts\/missing-helper\.mts/)
  })
})
