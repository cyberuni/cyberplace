import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { repairPrivateSkills, validatePrivateSkills } from './repair.js'

function withTempRepo(check: (root: string) => void): void {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repair-private-skills-'))
	try {
		check(root)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
}

test('repairPrivateSkills removes repo-private symlinks into public skills', () => {
	withTempRepo((root) => {
		const publicSkillDir = path.join(root, 'skills', 'create-skill')
		const privateSkillsDir = path.join(root, '.agents', 'skills')
		fs.mkdirSync(publicSkillDir, { recursive: true })
		fs.mkdirSync(privateSkillsDir, { recursive: true })
		fs.writeFileSync(path.join(publicSkillDir, 'SKILL.md'), '---\nname: create-skill\ndescription: x\n---\n')
		fs.symlinkSync(publicSkillDir, path.join(privateSkillsDir, 'create-skill'))

		const result = repairPrivateSkills(root)

		expect(result.changed).toBe(true)
		expect(result.actions.some((action) => action.action === 'removed_public_symlink')).toBe(true)
		expect(fs.existsSync(path.join(privateSkillsDir, 'create-skill'))).toBe(false)
	})
})

test('repairPrivateSkills restores metadata.internal on repo-private skills', () => {
	withTempRepo((root) => {
		const skillDir = path.join(root, '.agents', 'skills', 'audit-skill')
		fs.mkdirSync(skillDir, { recursive: true })
		fs.writeFileSync(
			path.join(skillDir, 'SKILL.md'),
			'---\nname: audit-skill\ndescription: "Use this skill when testing."\n---\n\n# Audit\n',
		)

		const result = repairPrivateSkills(root)
		const updated = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8')

		expect(result.changed).toBe(true)
		expect(result.actions.some((action) => action.action === 'updated_metadata')).toBe(true)
		expect(updated).toContain('metadata:\n  internal: true')
	})
})

test('validatePrivateSkills reports repo-private symlinks into public skills', () => {
	withTempRepo((root) => {
		const publicSkillDir = path.join(root, 'skills', 'create-skill')
		const privateSkillsDir = path.join(root, '.agents', 'skills')
		fs.mkdirSync(publicSkillDir, { recursive: true })
		fs.mkdirSync(privateSkillsDir, { recursive: true })
		fs.writeFileSync(path.join(publicSkillDir, 'SKILL.md'), '---\nname: create-skill\ndescription: x\n---\n')
		fs.symlinkSync(publicSkillDir, path.join(privateSkillsDir, 'create-skill'))

		const result = validatePrivateSkills(root)

		expect(result.ok).toBe(false)
		expect(result.issues.some((issue) => issue.issue === 'public_skill_symlink')).toBe(true)
	})
})

test('repairPrivateSkills keeps agents/ symlinks and records kept_agents_symlink', () => {
	withTempRepo((root) => {
		const authoredDir = path.join(root, 'agents', 'skills', 'my-skill')
		const privateSkillsDir = path.join(root, '.agents', 'skills')
		fs.mkdirSync(authoredDir, { recursive: true })
		fs.mkdirSync(privateSkillsDir, { recursive: true })
		fs.writeFileSync(path.join(authoredDir, 'SKILL.md'), '---\nname: my-skill\ndescription: local\n---\n')
		fs.symlinkSync(authoredDir, path.join(privateSkillsDir, 'my-skill'))

		const result = repairPrivateSkills(root)

		expect(fs.existsSync(path.join(privateSkillsDir, 'my-skill'))).toBe(true)
		expect(result.actions.some((a) => a.action === 'kept_agents_symlink')).toBe(true)
		expect(result.changed).toBe(false)
	})
})

test('validatePrivateSkills accepts agents/ symlinks without issues', () => {
	withTempRepo((root) => {
		const authoredDir = path.join(root, 'agents', 'skills', 'my-skill')
		const privateSkillsDir = path.join(root, '.agents', 'skills')
		fs.mkdirSync(authoredDir, { recursive: true })
		fs.mkdirSync(privateSkillsDir, { recursive: true })
		fs.writeFileSync(path.join(authoredDir, 'SKILL.md'), '---\nname: my-skill\ndescription: local\n---\n')
		fs.symlinkSync(authoredDir, path.join(privateSkillsDir, 'my-skill'))

		const result = validatePrivateSkills(root)

		expect(result.ok).toBe(true)
		expect(result.issues.length).toBe(0)
	})
})

test('validatePrivateSkills allows local augmentation directories without SKILL.md', () => {
	withTempRepo((root) => {
		const skillDir = path.join(root, '.agents', 'skills', 'commit-work')
		fs.mkdirSync(skillDir, { recursive: true })
		fs.writeFileSync(path.join(skillDir, 'SKILL.local.md'), '# local augmentation\n')

		const result = validatePrivateSkills(root)

		expect(result.ok).toBe(true)
		expect(result.issues.length).toBe(0)
	})
})
