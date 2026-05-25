import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { globToRegExp, listSkills } from './list.js'

test('globToRegExp matches glob patterns', () => {
	expect(globToRegExp('init-*').test('init-commit-discipline')).toBe(true)
	expect(globToRegExp('init-*').test('init')).toBe(false)
	expect(globToRegExp('audit-skill').test('audit-skill')).toBe(true)
})

test('listSkills includes package skills and filters with grep', () => {
	const skills = listSkills(process.cwd(), { grep: 'init-*' })
	expect(skills.every((s) => s.name.startsWith('init-'))).toBe(true)
	expect(skills.some((s) => s.name === 'init-commit-discipline')).toBe(true)
})

test('listSkills discovers repo and global skills with repo taking precedence', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-list-root-'))
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-list-home-'))
	try {
		const repoSkillDir = path.join(root, '.agents', 'skills', 'init-repo-only')
		fs.mkdirSync(repoSkillDir, { recursive: true })
		fs.writeFileSync(
			path.join(repoSkillDir, 'SKILL.md'),
			'---\nname: init-repo-only\ndescription: Repo-local init skill.\n---\n',
		)

		const globalSkillDir = path.join(home, '.agents', 'skills', 'init-global-only')
		fs.mkdirSync(globalSkillDir, { recursive: true })
		fs.writeFileSync(
			path.join(globalSkillDir, 'SKILL.md'),
			'---\nname: init-global-only\ndescription: Global init skill.\n---\n',
		)

		const sharedGlobalDir = path.join(home, '.agents', 'skills', 'init-shared')
		fs.mkdirSync(sharedGlobalDir, { recursive: true })
		fs.writeFileSync(path.join(sharedGlobalDir, 'SKILL.md'), '---\nname: init-shared\ndescription: Global copy.\n---\n')

		const sharedRepoDir = path.join(root, 'skills', 'init-shared')
		fs.mkdirSync(sharedRepoDir, { recursive: true })
		fs.writeFileSync(path.join(sharedRepoDir, 'SKILL.md'), '---\nname: init-shared\ndescription: Repo copy.\n---\n')

		const skills = listSkills(root, { grep: 'init-*', home })

		expect(skills.find((s) => s.name === 'init-repo-only')).toEqual({
			name: 'init-repo-only',
			description: 'Repo-local init skill.',
			foundIn: 'repo',
		})
		expect(skills.find((s) => s.name === 'init-global-only')).toEqual({
			name: 'init-global-only',
			description: 'Global init skill.',
			foundIn: 'global',
		})
		expect(skills.find((s) => s.name === 'init-shared')).toEqual({
			name: 'init-shared',
			description: 'Repo copy.',
			foundIn: 'repo',
		})
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
		fs.rmSync(home, { recursive: true, force: true })
	}
})
