import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { addSkill } from './add.js'
import { readConfig } from './config.js'
import { getLockEntry } from './lock.js'

// top-level mock so hoisting works correctly
vi.mock('./npm.js', async (importOriginal) => {
	const mod = await importOriginal<typeof import('./npm.js')>()
	return {
		...mod,
		installNpmPackage: vi.fn(),
	}
})

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-add-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	vi.restoreAllMocks()
	vi.clearAllMocks()
})

test('addSkill installs a single skill from GitHub repo', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: commit\ndescription: commit skill\n---\n# Commit'),
		}),
	)

	const result = await addSkill('cyberuni/cyber-skills:commit', { root })

	expect(result.installed).toHaveLength(1)
	expect(result.installed[0]!.name).toBe('commit')

	const skillFile = path.join(root, '.agents', 'skills', 'commit', 'SKILL.md')
	expect(fs.existsSync(skillFile)).toBe(true)
})

test('addSkill records entry in lock file', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: commit\n---'),
		}),
	)

	await addSkill('cyberuni/cyber-skills:commit', { root })

	const entry = getLockEntry(root, 'project', 'commit')
	expect(entry).not.toBeNull()
	expect(entry!.source).toBe('cyberuni/cyber-skills')
	expect(entry!.sourceType).toBe('github')
})

test('addSkill records skill in config file', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: commit\n---'),
		}),
	)

	await addSkill('cyberuni/cyber-skills:commit', { root })

	const config = readConfig(root, 'project')
	expect(config.skills?.['commit']).toBe('cyberuni/cyber-skills:commit')
})

test('addSkill installs all skills when no skill name given', async () => {
	const awesomeData = [
		{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
		{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
	]
	vi.stubGlobal(
		'fetch',
		vi.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(awesomeData) })
			.mockResolvedValue({ ok: true, text: () => Promise.resolve('---\nname: skill\n---') }),
	)

	const result = await addSkill('cyberuni/cyber-skills', { root })
	expect(result.installed).toHaveLength(2)
})

test('addSkill installs from npm package', async () => {
	const { installNpmPackage } = await import('./npm.js')
	const mockInstall = vi.mocked(installNpmPackage)

	// set up a fake installed npm package with skills
	const fakeSkillsDir = path.join(root, 'node_modules', '@myorg', 'skills', 'skills')
	const fakeSkillDir = path.join(fakeSkillsDir, 'my-skill')
	fs.mkdirSync(fakeSkillDir, { recursive: true })
	fs.writeFileSync(path.join(fakeSkillDir, 'SKILL.md'), '---\nname: my-skill\n---')

	mockInstall.mockReturnValueOnce({
		packageName: '@myorg/skills',
		installedDir: path.join(root, 'node_modules', '@myorg', 'skills'),
		skillsDir: fakeSkillsDir,
		packageManager: 'npm' as const,
	})

	const result = await addSkill('@myorg/skills', { root })
	expect(result.installed).toHaveLength(1)
	expect(result.installed[0]!.name).toBe('my-skill')
	expect(fs.existsSync(path.join(root, '.agents', 'skills', 'my-skill', 'SKILL.md'))).toBe(true)
})
