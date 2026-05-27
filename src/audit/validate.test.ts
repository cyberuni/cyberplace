import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { runChecks } from './validate.js'

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

function withTempSkillAt(
	relativeDir: string,
	content: string,
	extraFiles: Record<string, string>,
	check: (skillFile: string) => void,
): void {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-skill-'))
	const skillDir = path.join(tempDir, relativeDir)
	const skillFile = path.join(skillDir, 'SKILL.md')
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(skillFile, content)
	for (const [name, src] of Object.entries(extraFiles)) {
		const target = path.join(tempDir, name)
		fs.mkdirSync(path.dirname(target), { recursive: true })
		fs.writeFileSync(target, src)
	}

	try {
		check(skillFile)
	} finally {
		fs.rmSync(tempDir, { recursive: true, force: true })
	}
}

function withTempSkillAndScripts(
	content: string,
	scripts: Record<string, string>,
	check: (skillFile: string) => void,
): void {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-skill-'))
	const skillDir = path.join(tempDir, 'skills', 'sample-skill')
	const scriptsDir = path.join(skillDir, 'scripts')
	fs.mkdirSync(scriptsDir, { recursive: true })
	fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content)
	for (const [name, src] of Object.entries(scripts)) {
		fs.writeFileSync(path.join(scriptsDir, name), src)
	}

	try {
		check(path.join(skillDir, 'SKILL.md'))
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
	withTempSkill(
		`${skillFrontmatter}
\`\`\`bash
SKILL_DIR=$(pwd)
node "$SKILL_DIR/scripts/detect-state.mjs"
node "\${SKILL_DIR}/scripts/scaffold-workflows.mjs"
node "$(pwd)/scripts/validate-skills.mjs"
\`\`\`
`,
		(skillFile) => {
			const result = runChecks(skillFile)
			const s4Warnings = result.warnings.filter((finding) => finding.checkId === 'S4')
			expect(s4Warnings.length).toBe(0)
		},
	)
})

test('S4 still warns for missing literal bundled files', () => {
	withTempSkill(
		`${skillFrontmatter}
\`\`\`bash
node scripts/missing-helper.mjs
\`\`\`
`,
		(skillFile) => {
			const result = runChecks(skillFile)
			const s4Warnings = result.warnings.filter((finding) => finding.checkId === 'S4')
			expect(s4Warnings.length).toBe(1)
			expect(s4Warnings[0]?.evidence ?? '').toMatch(/scripts\/missing-helper\.mjs/)
		},
	)
})

test('S4 warns when a public skill markdown link traverses outside the skill folder', () => {
	withTempSkillAt(
		path.join('skills', 'sample-skill'),
		`${skillFrontmatter}
See [threat model](../../docs/research/threat-model.md).
`,
		{},
		(skillFile) => {
			const result = runChecks(skillFile)
			const s4Warnings = result.warnings.filter((finding) => finding.checkId === 'S4')
			expect(s4Warnings.some((finding) => finding.evidence.includes('../../docs/research/threat-model.md'))).toBe(true)
		},
	)
})

test('S4 warns when a public skill references repo-local prose paths outside the skill folder', () => {
	withTempSkillAt(
		path.join('skills', 'sample-skill'),
		`${skillFrontmatter}
Read docs/research/threat-model.md before continuing.
`,
		{ 'docs/research/threat-model.md': '# Threat Model\n' },
		(skillFile) => {
			const result = runChecks(skillFile)
			const s4Warnings = result.warnings.filter((finding) => finding.checkId === 'S4')
			expect(s4Warnings.some((finding) => finding.evidence.includes('docs/research/threat-model.md'))).toBe(true)
		},
	)
})

test('S4 does not warn for repo-internal skills referencing repo-local paths', () => {
	withTempSkillAt(
		path.join('.agents', 'skills', 'sample-skill'),
		`${skillFrontmatter}
Read docs/research/threat-model.md before continuing.
`,
		{ 'docs/research/threat-model.md': '# Threat Model\n' },
		(skillFile) => {
			const result = runChecks(skillFile)
			const s4Warnings = result.warnings.filter(
				(finding) => finding.checkId === 'S4' && finding.evidence.includes('docs/research/threat-model.md'),
			)
			expect(s4Warnings.length).toBe(0)
		},
	)
})

test('Q10 warns when SKILL.md instructs parsing script output without mitigation', () => {
	withTempSkill(
		`${skillFrontmatter}
Run the helper and parse the script output to decide next steps.
`,
		(skillFile) => {
			const result = runChecks(skillFile)
			const q10 = result.warnings.filter((finding) => finding.checkId === 'Q10')
			expect(q10.length).toBe(1)
		},
	)
})

test('Q10 passes when --format json is documented', () => {
	withTempSkill(
		`${skillFrontmatter}
Run \`my-tool --format json\` and parse stdout JSON.
`,
		(skillFile) => {
			const result = runChecks(skillFile)
			const q10 = result.warnings.filter((finding) => finding.checkId === 'Q10')
			expect(q10.length).toBe(0)
		},
	)
})

test('Q11 warns for interactive scripts without --yes in SKILL.md', () => {
	withTempSkillAndScripts(
		`${skillFrontmatter}
Run \`node scripts/prompt.mjs\` when needed.
`,
		{
			'prompt.mjs': "import readline from 'node:readline'\nreadline.createInterface({ input: process.stdin })",
		},
		(skillFile) => {
			const result = runChecks(skillFile)
			const q11 = result.warnings.filter((finding) => finding.checkId === 'Q11')
			expect(q11.length).toBe(1)
		},
	)
})

test('Q12 warns when script uses console.log without stdout JSON contract', () => {
	withTempSkillAndScripts(
		`${skillFrontmatter}
Run \`node scripts/run.mjs --yes\`.
`,
		{ 'run.mjs': "console.log('done')\n" },
		(skillFile) => {
			const result = runChecks(skillFile)
			const q12 = result.warnings.filter((finding) => finding.checkId === 'Q12')
			expect(q12.length).toBe(1)
		},
	)
})

test('E9 fails when SKILL.md contains invisible Unicode controls', () => {
	withTempSkill(
		`${skillFrontmatter}
Review this hidden payload: scan\u200Bnow
`,
		(skillFile) => {
			const result = runChecks(skillFile)
			const e9 = result.criticals.filter((finding) => finding.checkId === 'E9')
			expect(e9.length).toBe(1)
			expect(e9[0]?.evidence ?? '').toContain('U+200B')
		},
	)
})

test('E9 fails when bundled scripts contain invisible Unicode controls', () => {
	withTempSkillAndScripts(
		`${skillFrontmatter}
Run \`node scripts/run.mjs --yes\`.
`,
		{ 'run.mjs': "console.log('safe')\u202E\n" },
		(skillFile) => {
			const result = runChecks(skillFile)
			const e9 = result.criticals.filter((finding) => finding.checkId === 'E9')
			expect(e9.length).toBe(1)
			expect(e9[0]?.evidence ?? '').toContain('scripts/run.mjs')
			expect(e9[0]?.evidence ?? '').toContain('U+202E')
		},
	)
})
