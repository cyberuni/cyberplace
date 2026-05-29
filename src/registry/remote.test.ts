import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { computeHash, fetchAndInstallSkill, fetchMarketplace, fetchSkillContent, listRepoSkills } from './remote.js'
import type { RepoSpec } from './spec.js'

let root: string
let cloneSimDir: string

function seedSkillDir(baseDir: string, skillDir: string, files: Record<string, string>) {
	const fullDir = path.join(baseDir, skillDir)
	fs.mkdirSync(fullDir, { recursive: true })
	for (const [name, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(fullDir, name), content)
	}
}

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-github-'))
	cloneSimDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-clone-sim-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	fs.rmSync(cloneSimDir, { recursive: true, force: true })
	vi.restoreAllMocks()
})

test('computeHash returns consistent sha256 hex', () => {
	const hash = computeHash('hello')
	expect(hash).toHaveLength(64)
	expect(computeHash('hello')).toBe(hash)
	expect(computeHash('world')).not.toBe(hash)
})

test('fetchSkillContent fetches from GitHub raw URL', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('# SKILL content'),
		}),
	)

	const content = await fetchSkillContent(null, 'org', 'repo', 'skills/commit/SKILL.md')
	expect(content).toBe('# SKILL content')
	const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
	expect(url).toContain('raw.githubusercontent.com/org/repo/main/skills/commit/SKILL.md')
})

test('fetchSkillContent uses GitLab raw URL for gitlab provider', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('# content'),
		}),
	)

	await fetchSkillContent(
		{ url: 'https://gitlab.mycompany.com', type: 'gitlab' },
		'org',
		'repo',
		'skills/commit/SKILL.md',
	)
	const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
	expect(url).toContain('gitlab.mycompany.com/org/repo/-/raw/main/skills/commit/SKILL.md')
})

test('fetchSkillContent throws on non-ok response', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }))

	await expect(fetchSkillContent(null, 'org', 'repo', 'skills/commit/SKILL.md')).rejects.toThrow('404')
})

test('listRepoSkills uses awesome-skills.json when available', async () => {
	const awesomeData = [{ name: 'commit', skillPath: 'skills/commit/SKILL.md' }]
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(awesomeData),
		}),
	)

	const skills = await listRepoSkills(null, 'org', 'repo')
	expect(skills).toHaveLength(1)
	expect(skills[0]!.name).toBe('commit')
	expect(skills[0]!.skillPath).toBe('skills/commit/SKILL.md')
})

test('listRepoSkills falls back to GitHub API when awesome-skills.json absent', async () => {
	const githubResponse = [
		{ name: 'commit', type: 'dir' },
		{ name: 'add-changeset', type: 'dir' },
		{ name: 'README.md', type: 'file' },
	]
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' }) // awesome-skills.json missing
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(githubResponse) })
			.mockResolvedValueOnce({ ok: false, status: 404 }), // agents/skills missing
	)

	const skills = await listRepoSkills(null, 'org', 'repo')
	expect(skills).toHaveLength(2)
	expect(skills.map((s) => s.name)).toEqual(['commit', 'add-changeset'])
})

test('listRepoSkills lists agents/skills/ when skills/ is missing via GitHub API', async () => {
	const agentsResponse = [
		{ name: 'commit', type: 'dir' },
		{ name: 'audit-skill', type: 'dir' },
	]
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ version: 1, repos: {} }) }) // catalog, not index
			.mockResolvedValueOnce({ ok: false, status: 404 }) // skills/ missing
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(agentsResponse) }),
	)

	const skills = await listRepoSkills(null, 'cyberuni', 'cyber-skills')
	expect(skills).toHaveLength(2)
	expect(skills.every((s) => s.skillPath.startsWith('agents/skills/'))).toBe(true)
})

test('listRepoSkills includes skills from agents/skills/ via GitHub API', async () => {
	const skillsResponse = [{ name: 'commit', type: 'dir' }]
	const agentsResponse = [
		{ name: 'internal-tool', type: 'dir' },
		{ name: 'commit', type: 'dir' }, // duplicate — should be skipped
	]
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 404 }) // awesome-skills.json missing
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(skillsResponse) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(agentsResponse) }),
	)

	const skills = await listRepoSkills(null, 'org', 'repo')
	expect(skills).toHaveLength(2)
	expect(skills.find((s) => s.name === 'commit')?.skillPath).toBe('skills/commit/SKILL.md')
	expect(skills.find((s) => s.name === 'internal-tool')?.skillPath).toBe('agents/skills/internal-tool/SKILL.md')
})

test('fetchAndInstallSkill copies SKILL.md and sibling files via sparse clone', async () => {
	seedSkillDir(cloneSimDir, 'skills/commit', {
		'SKILL.md': '---\nname: commit\n---\n# Commit',
		'README.md': '# Readme',
	})

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', undefined, cloneSimDir)

	expect(installed).toHaveLength(1)
	expect(installed[0]!.name).toBe('commit')
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.md'))).toBe(true)
	expect(fs.existsSync(path.join(root, 'commit', 'README.md'))).toBe(true)
})

test('fetchAndInstallSkill excludes *.local.* files', async () => {
	seedSkillDir(cloneSimDir, 'skills/commit', {
		'SKILL.md': '# Commit',
		'README.md': '# Readme',
		'SKILL.local.md': 'local overrides',
		'config.local.json': '{}',
	})

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', undefined, cloneSimDir)

	expect(installed).toHaveLength(1)
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.md'))).toBe(true)
	expect(fs.existsSync(path.join(root, 'commit', 'README.md'))).toBe(true)
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.local.md'))).toBe(false)
	expect(fs.existsSync(path.join(root, 'commit', 'config.local.json'))).toBe(false)
})

test('fetchAndInstallSkill installs all skills when no skill name given', async () => {
	const awesomeData = [
		{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
		{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
	]
	vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(awesomeData) }))
	seedSkillDir(cloneSimDir, 'skills/commit', { 'SKILL.md': '# commit' })
	seedSkillDir(cloneSimDir, 'skills/add-changeset', { 'SKILL.md': '# add-changeset' })

	const spec: RepoSpec = { type: 'repo', owner: 'cyberuni', repo: 'cyber-skills', raw: 'cyberuni/cyber-skills' }
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', undefined, cloneSimDir)

	expect(installed).toHaveLength(2)
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.md'))).toBe(true)
	expect(fs.existsSync(path.join(root, 'add-changeset', 'SKILL.md'))).toBe(true)
})

test('fetchAndInstallSkill respects skillFilter when no skill in spec', async () => {
	const awesomeData = [
		{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
		{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
		{ name: 'audit-skill', skillPath: 'skills/audit-skill/SKILL.md' },
	]
	vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(awesomeData) }))
	seedSkillDir(cloneSimDir, 'skills/commit', { 'SKILL.md': '# commit' })
	seedSkillDir(cloneSimDir, 'skills/audit-skill', { 'SKILL.md': '# audit' })

	const spec: RepoSpec = { type: 'repo', owner: 'cyberuni', repo: 'cyber-skills', raw: 'cyberuni/cyber-skills' }
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', ['commit', 'audit-skill'], cloneSimDir)

	expect(installed).toHaveLength(2)
	expect(installed.map((s) => s.name)).toEqual(['commit', 'audit-skill'])
	expect(fs.existsSync(path.join(root, 'add-changeset', 'SKILL.md'))).toBe(false)
})

test('fetchAndInstallSkill ignores skillFilter when skill in spec', async () => {
	seedSkillDir(cloneSimDir, 'skills/commit', { 'SKILL.md': '# skill' })

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', ['other-skill'], cloneSimDir)
	expect(installed).toHaveLength(1)
	expect(installed[0]!.name).toBe('commit')
})

test('fetchAndInstallSkill finds skill in agents/skills/ when not in skills/', async () => {
	seedSkillDir(cloneSimDir, 'agents/skills/internal-tool', {
		'SKILL.md': '---\nname: internal-tool\n---\n# Internal Tool',
	})

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'internal-tool',
		raw: 'cyberuni/cyber-skills:internal-tool',
	}
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', undefined, cloneSimDir)

	expect(installed).toHaveLength(1)
	expect(installed[0]!.name).toBe('internal-tool')
	expect(installed[0]!.skillPath).toBe('agents/skills/internal-tool/SKILL.md')
	expect(fs.existsSync(path.join(root, 'internal-tool', 'SKILL.md'))).toBe(true)
})

test('fetchAndInstallSkill prefers skills/ over agents/skills/ when both exist', async () => {
	seedSkillDir(cloneSimDir, 'skills/commit', { 'SKILL.md': '---\nname: commit\n---\n# from skills/' })
	seedSkillDir(cloneSimDir, 'agents/skills/commit', { 'SKILL.md': '---\nname: commit\n---\n# from agents/skills/' })

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', undefined, cloneSimDir)

	expect(installed).toHaveLength(1)
	expect(installed[0]!.skillPath).toBe('skills/commit/SKILL.md')
	expect(fs.readFileSync(path.join(root, 'commit', 'SKILL.md'), 'utf8')).toContain('from skills/')
})

test('fetchMarketplace returns parsed marketplace when found', async () => {
	const marketplace = { plugins: [{ name: 'p', description: 'd', skills: ['./skills/commit'] }] }
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(marketplace) }))

	const result = await fetchMarketplace(null, 'org', 'repo')
	expect(result).toEqual(marketplace)
	const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
	expect(url).toContain('.claude-plugin/marketplace.json')
})

test('fetchMarketplace returns null when not found (404)', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
	expect(await fetchMarketplace(null, 'org', 'repo')).toBeNull()
})

test('fetchMarketplace returns null on network error', async () => {
	vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
	expect(await fetchMarketplace(null, 'org', 'repo')).toBeNull()
})
