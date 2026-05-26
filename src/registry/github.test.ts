import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { computeHash, fetchAndInstallSkill, fetchMarketplace, fetchSkillContent, listRepoSkills } from './github.js'
import type { RepoSpec } from './spec.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-github-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
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
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(githubResponse) }),
	)

	const skills = await listRepoSkills(null, 'org', 'repo')
	expect(skills).toHaveLength(2)
	expect(skills.map((s) => s.name)).toEqual(['commit', 'add-changeset'])
})

test('fetchAndInstallSkill installs a single named skill', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: commit\n---\n# Commit'),
		}),
	)

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	const installed = await fetchAndInstallSkill(null, spec, root)

	expect(installed).toHaveLength(1)
	expect(installed[0]!.name).toBe('commit')
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.md'))).toBe(true)
})

test('fetchAndInstallSkill installs all skills when no skill name given', async () => {
	const awesomeData = [
		{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
		{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
	]
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(awesomeData) }) // awesome-skills.json
			.mockResolvedValue({ ok: true, text: () => Promise.resolve('# skill content') }),
	)

	const spec: RepoSpec = { type: 'repo', owner: 'cyberuni', repo: 'cyber-skills', raw: 'cyberuni/cyber-skills' }
	const installed = await fetchAndInstallSkill(null, spec, root)

	expect(installed).toHaveLength(2)
	expect(fs.existsSync(path.join(root, 'commit', 'SKILL.md'))).toBe(true)
	expect(fs.existsSync(path.join(root, 'add-changeset', 'SKILL.md'))).toBe(true)
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

test('fetchAndInstallSkill respects skillFilter when no skill in spec', async () => {
	const awesomeData = [
		{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
		{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
		{ name: 'audit-skill', skillPath: 'skills/audit-skill/SKILL.md' },
	]
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(awesomeData) })
			.mockResolvedValue({ ok: true, text: () => Promise.resolve('# skill') }),
	)

	const spec: RepoSpec = { type: 'repo', owner: 'cyberuni', repo: 'cyber-skills', raw: 'cyberuni/cyber-skills' }
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', ['commit', 'audit-skill'])

	expect(installed).toHaveLength(2)
	expect(installed.map((s) => s.name)).toEqual(['commit', 'audit-skill'])
	expect(fs.existsSync(path.join(root, 'add-changeset', 'SKILL.md'))).toBe(false)
})

test('fetchAndInstallSkill ignores skillFilter when skill in spec', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('# skill') }))

	const spec: RepoSpec = {
		type: 'repo',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		skill: 'commit',
		raw: 'cyberuni/cyber-skills:commit',
	}
	// filter is irrelevant when spec.skill is set
	const installed = await fetchAndInstallSkill(null, spec, root, 'main', ['other-skill'])
	expect(installed).toHaveLength(1)
	expect(installed[0]!.name).toBe('commit')
})
