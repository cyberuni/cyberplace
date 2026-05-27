import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { addSkill } from './add.js'
import { getLockEntry } from './lock.js'
import { fetchAndInstallSkill } from './remote.js'

vi.mock('./remote.js', async (importOriginal) => {
	const mod = await importOriginal<typeof import('./remote.js')>()
	return { ...mod, fetchAndInstallSkill: vi.fn() }
})

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

function mockFetchInstall(skills: Array<{ name: string; content?: string }>) {
	vi.mocked(fetchAndInstallSkill).mockImplementation(async (_provider, _spec, installDir) => {
		return skills.map(({ name, content = `---\nname: ${name}\n---` }) => {
			const dest = path.join(installDir, name, 'SKILL.md')
			fs.mkdirSync(path.dirname(dest), { recursive: true })
			fs.writeFileSync(dest, content)
			return { name, content, skillPath: `skills/${name}/SKILL.md`, hash: 'fakehash' }
		})
	})
}

test('addSkill installs a single skill from GitHub repo', async () => {
	mockFetchInstall([{ name: 'commit', content: '---\nname: commit\ndescription: commit skill\n---\n# Commit' }])

	const result = await addSkill('cyberuni/cyber-skills:commit', { root })

	expect(result.installed).toHaveLength(1)
	expect(result.installed[0]!.name).toBe('commit')

	const skillFile = path.join(root, '.agents', 'skills', 'commit', 'SKILL.md')
	expect(fs.existsSync(skillFile)).toBe(true)
})

test('addSkill records entry in lock file', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('cyberuni/cyber-skills:commit', { root })

	const entry = getLockEntry(root, 'project', 'commit')
	expect(entry).not.toBeNull()
	expect(entry!.source).toBe('cyberuni/cyber-skills')
	expect(entry!.sourceType).toBe('github')
})

test('addSkill installs all skills when no skill name given', async () => {
	mockFetchInstall([{ name: 'commit' }, { name: 'add-changeset' }])

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

test('addSkill uses configured GitLab provider when pattern matches', async () => {
	const { addProvider } = await import('./config.js')
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/*')

	mockFetchInstall([{ name: 'commit' }])

	await addSkill('mycompany/skills:commit', { root })

	const provider = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[0]
	expect(provider).toMatchObject({ type: 'gitlab', url: 'https://gitlab.mycompany.com' })
})

test('addSkill uses GitHub default when no provider pattern matches', async () => {
	const { addProvider } = await import('./config.js')
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/*')

	mockFetchInstall([{ name: 'commit' }])

	await addSkill('cyberuni/cyber-skills:commit', { root })

	const provider = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[0]
	expect(provider).toBeNull()
})

test('addSkill creates symlink in skills/ for project scope', async () => {
	mockFetchInstall([{ name: 'commit', content: '---\nname: commit\ndescription: commit skill\n---\n# Commit' }])

	await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	const symlinkPath = path.join(root, 'skills', 'commit')
	expect(fs.existsSync(symlinkPath)).toBe(true)
	expect(fs.lstatSync(symlinkPath).isSymbolicLink()).toBe(true)
})

test('addSkill does not create symlink for global scope', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'global' })

	const symlinkPath = path.join(root, 'skills', 'commit')
	expect(fs.existsSync(symlinkPath)).toBe(false)
})

test('addSkill skips symlink and returns notification when skills/<name> is a real directory', async () => {
	const realSkillDir = path.join(root, 'skills', 'commit')
	fs.mkdirSync(realSkillDir, { recursive: true })
	fs.writeFileSync(path.join(realSkillDir, 'SKILL.md'), '---\nname: commit\n---')

	mockFetchInstall([{ name: 'commit' }])

	const result = await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	expect(result.skippedSymlinks).toHaveLength(1)
	expect(result.skippedSymlinks[0]!.name).toBe('commit')
	// real dir should remain untouched
	expect(fs.lstatSync(realSkillDir).isSymbolicLink()).toBe(false)
})

test('addSkill updates existing symlink in skills/ on re-install', async () => {
	// pre-create a symlink pointing somewhere else
	const skillsDir = path.join(root, 'skills')
	fs.mkdirSync(skillsDir, { recursive: true })
	const oldTarget = path.join(root, '.agents', 'skills', 'old')
	fs.mkdirSync(oldTarget, { recursive: true })
	fs.symlinkSync(oldTarget, path.join(skillsDir, 'commit'))

	mockFetchInstall([{ name: 'commit' }])

	const result = await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	expect(result.skippedSymlinks).toHaveLength(0)
	const stat = fs.lstatSync(path.join(skillsDir, 'commit'))
	expect(stat.isSymbolicLink()).toBe(true)
})

test('addSkill installs only skills matching the skills filter', async () => {
	mockFetchInstall([{ name: 'commit' }, { name: 'audit-skill' }])

	const result = await addSkill('cyberuni/cyber-skills', { root, skills: ['commit', 'audit-skill'] })
	expect(result.installed).toHaveLength(2)
	expect(result.installed.map((s) => s.name)).toEqual(['commit', 'audit-skill'])

	const missing = path.join(root, '.agents', 'skills', 'add-changeset', 'SKILL.md')
	expect(fs.existsSync(missing)).toBe(false)
})
