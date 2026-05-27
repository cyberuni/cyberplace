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

function mockFetchInstall(
	skills: Array<{ name: string; content?: string; manifest?: import('../skill/manifest.js').SkillManifest | null }>,
) {
	vi.mocked(fetchAndInstallSkill).mockImplementation(async (_provider, _spec, installDir) => {
		return skills.map(({ name, content = `---\nname: ${name}\n---`, manifest = null }) => {
			const dest = path.join(installDir, name, 'SKILL.md')
			fs.mkdirSync(path.dirname(dest), { recursive: true })
			fs.writeFileSync(dest, content)
			return { name, content, skillPath: `skills/${name}/SKILL.md`, hash: 'fakehash', manifest }
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

test('addSkill creates symlink in agents/skills/ for project scope', async () => {
	mockFetchInstall([{ name: 'commit', content: '---\nname: commit\ndescription: commit skill\n---\n# Commit' }])

	await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	const symlinkPath = path.join(root, 'agents', 'skills', 'commit')
	expect(fs.existsSync(symlinkPath)).toBe(true)
	expect(fs.lstatSync(symlinkPath).isSymbolicLink()).toBe(true)
})

test('addSkill does not create symlink for global scope', async () => {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-add-home-'))
	try {
		mockFetchInstall([{ name: 'commit' }])

		await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'global', home })

		const symlinkPath = path.join(root, 'agents', 'skills', 'commit')
		expect(fs.existsSync(symlinkPath)).toBe(false)
	} finally {
		fs.rmSync(home, { recursive: true, force: true })
	}
})

test('addSkill skips symlink and returns notification when agents/skills/<name> is a real directory', async () => {
	const realSkillDir = path.join(root, 'agents', 'skills', 'commit')
	fs.mkdirSync(realSkillDir, { recursive: true })
	fs.writeFileSync(path.join(realSkillDir, 'SKILL.md'), '---\nname: commit\n---')

	mockFetchInstall([{ name: 'commit' }])

	const result = await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	expect(result.skippedSymlinks).toHaveLength(1)
	expect(result.skippedSymlinks[0]!.name).toBe('commit')
	// real dir should remain untouched
	expect(fs.lstatSync(realSkillDir).isSymbolicLink()).toBe(false)
})

test('addSkill updates existing symlink in agents/skills/ on re-install', async () => {
	// pre-create a symlink pointing somewhere else
	const agentsSkillsDir = path.join(root, 'agents', 'skills')
	fs.mkdirSync(agentsSkillsDir, { recursive: true })
	const oldTarget = path.join(root, '.agents', 'skills', 'old')
	fs.mkdirSync(oldTarget, { recursive: true })
	fs.symlinkSync(oldTarget, path.join(agentsSkillsDir, 'commit'))

	mockFetchInstall([{ name: 'commit' }])

	const result = await addSkill('cyberuni/cyber-skills:commit', { root, scope: 'project' })

	expect(result.skippedSymlinks).toHaveLength(0)
	const stat = fs.lstatSync(path.join(agentsSkillsDir, 'commit'))
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

// git-url support

test('addSkill installs from bare HTTPS git URL', async () => {
	mockFetchInstall([{ name: 'commit' }])

	const result = await addSkill('https://github.com/cyberuni/cyber-skills', { root })
	expect(result.installed).toHaveLength(1)
	expect(result.installed[0]!.name).toBe('commit')
})

test('addSkill with bare git URL stores normalized cloneUrl as lock source', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://github.com/cyberuni/cyber-skills', { root })

	const entry = getLockEntry(root, 'project', 'commit')
	expect(entry!.source).toBe('https://github.com/cyberuni/cyber-skills')
	expect(entry!.sourceType).toBe('custom')
})

test('addSkill with GitHub browser URL stores source with #branch', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://github.com/cyberuni/cyber-skills/tree/develop', { root })

	const entry = getLockEntry(root, 'project', 'commit')
	expect(entry!.source).toBe('https://github.com/cyberuni/cyber-skills#develop')
	expect(entry!.sourceType).toBe('github')
})

test('addSkill with GitLab URL infers gitlab provider and sourceType', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://gitlab.com/owner/repo/-/tree/main', { root })

	const provider = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[0]
	expect(provider).toMatchObject({ type: 'gitlab', url: 'https://gitlab.com' })

	const entry = getLockEntry(root, 'project', 'commit')
	expect(entry!.sourceType).toBe('gitlab')
})

test('addSkill with self-hosted GitLab URL uses detected host', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://git.mycompany.com/team/repo/-/tree/feature', { root })

	const provider = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[0]
	expect(provider).toMatchObject({ type: 'gitlab', url: 'https://git.mycompany.com' })
})

test('addSkill with git URL uses branch from URL over AddOptions.branch', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://github.com/owner/repo/tree/feature', { root, branch: 'main' })

	const branchArg = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[3]
	expect(branchArg).toBe('feature')
})

test('addSkill with bare git URL falls back to AddOptions.branch', async () => {
	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://github.com/owner/repo', { root, branch: 'develop' })

	const branchArg = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[3]
	expect(branchArg).toBe('develop')
})

test('addSkill with git URL: config provider overrides path-based hint', async () => {
	const { addProvider } = await import('./config.js')
	addProvider(root, 'project', 'https://git.mycompany.com', 'github', 'myteam/*')

	mockFetchInstall([{ name: 'commit' }])

	await addSkill('https://git.mycompany.com/myteam/repo/-/tree/main', { root })

	const provider = vi.mocked(fetchAndInstallSkill).mock.calls[0]?.[0]
	expect(provider).toMatchObject({ type: 'github', url: 'https://git.mycompany.com' })
})

test('addSkill skips package-managed skill and reports it', async () => {
	const pkgManifest = { distribution: { install_via: 'package_manager', package: { name: 'cyber-asana' } } }
	mockFetchInstall([{ name: 'normal-skill' }, { name: 'pkg-skill', manifest: pkgManifest }])

	const result = await addSkill('cyberuni/cyber-asana', { root })

	expect(result.installed).toHaveLength(1)
	expect(result.installed[0]!.name).toBe('normal-skill')
	expect(result.skippedPackageManaged).toHaveLength(1)
	expect(result.skippedPackageManaged[0]!.name).toBe('pkg-skill')
	expect(result.skippedPackageManaged[0]!.packageName).toBe('cyber-asana')
})

test('addSkill skips package-managed skill for git URL spec', async () => {
	const pkgManifest = { distribution: { install_via: 'package_manager', package: { name: 'cyber-asana' } } }
	mockFetchInstall([{ name: 'pkg-skill', manifest: pkgManifest }])

	const result = await addSkill('https://github.com/cyberuni/cyber-asana', { root })

	expect(result.installed).toHaveLength(0)
	expect(result.skippedPackageManaged).toHaveLength(1)
	expect(result.skippedPackageManaged[0]!.name).toBe('pkg-skill')
})

test('addSkill does not skip package-managed skill when installed via npm', async () => {
	const { installNpmPackage } = await import('./npm.js')
	const mockInstall = vi.mocked(installNpmPackage)

	const fakeSkillsDir = path.join(root, 'node_modules', 'cyber-asana', 'skills')
	const fakeSkillDir = path.join(fakeSkillsDir, 'my-asana-skill')
	fs.mkdirSync(fakeSkillDir, { recursive: true })
	fs.writeFileSync(path.join(fakeSkillDir, 'SKILL.md'), '---\nname: my-asana-skill\n---')

	mockInstall.mockReturnValueOnce({
		packageName: 'cyber-asana',
		installedDir: path.join(root, 'node_modules', 'cyber-asana'),
		skillsDir: fakeSkillsDir,
		packageManager: 'npm' as const,
	})

	const result = await addSkill('cyber-asana', { root })
	expect(result.installed).toHaveLength(1)
	expect(result.skippedPackageManaged).toHaveLength(0)
})
