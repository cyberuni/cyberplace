import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { fetchAndInstallSkill } from './github.js'
import { setLockEntry } from './lock.js'
import { updateAllSkills, updateSkill } from './update.js'

vi.mock('./github.js', async (importOriginal) => {
	const mod = await importOriginal<typeof import('./github.js')>()
	return { ...mod, fetchAndInstallSkill: vi.fn() }
})

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-update-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	vi.restoreAllMocks()
})

function setupFakeLockEntry(name: string, source = 'org/repo'): void {
	const skillDir = path.join(root, '.agents', 'skills', name)
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---\nname: ${name}\n---`)
	setLockEntry(root, 'project', name, {
		source,
		sourceType: 'github',
		skillPath: `skills/${name}/SKILL.md`,
	})
}

function mockFetchInstall(upstreamContent: string) {
	vi.mocked(fetchAndInstallSkill).mockImplementation(async (_provider, spec, installDir) => {
		const name = spec.skill ?? 'commit'
		const dest = path.join(installDir, name, 'SKILL.md')
		fs.mkdirSync(path.dirname(dest), { recursive: true })
		fs.writeFileSync(dest, upstreamContent)
		return [{ name, content: upstreamContent, skillPath: `skills/${name}/SKILL.md`, hash: 'fakehash' }]
	})
}

test('updateSkill re-fetches and updates the skill file', async () => {
	setupFakeLockEntry('commit', 'cyberuni/cyber-skills')
	mockFetchInstall('---\nname: commit\ndescription: updated\n---')

	const result = await updateSkill('commit', { root })
	expect(result.updated).toBe(true)

	const content = fs.readFileSync(path.join(root, '.agents', 'skills', 'commit', 'SKILL.md'), 'utf8')
	expect(content).toContain('updated')
})

test('updateSkill returns updated:false when skill not in lock', async () => {
	const result = await updateSkill('nonexistent', { root })
	expect(result.updated).toBe(false)
})

test('updateSkill preserves existing metadata block when upstream has none', async () => {
	const skillDir = path.join(root, '.agents', 'skills', 'commit')
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(
		path.join(skillDir, 'SKILL.md'),
		'---\nname: commit\ndescription: old\nmetadata:\n  internal: true\n---\n\nbody',
	)
	setLockEntry(root, 'project', 'commit', {
		source: 'cyberuni/cyber-skills',
		sourceType: 'github',
		skillPath: 'skills/commit/SKILL.md',
	})
	mockFetchInstall('---\nname: commit\ndescription: updated\n---\n\nbody')

	await updateSkill('commit', { root })

	const content = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8')
	expect(content).toContain('description: updated')
	expect(content).toContain('metadata:')
	expect(content).toContain('internal: true')
})

test('updateSkill preserves existing metadata block when upstream has different metadata', async () => {
	const skillDir = path.join(root, '.agents', 'skills', 'commit')
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(
		path.join(skillDir, 'SKILL.md'),
		'---\nname: commit\ndescription: old\nmetadata:\n  internal: true\n---\n\nbody',
	)
	setLockEntry(root, 'project', 'commit', {
		source: 'cyberuni/cyber-skills',
		sourceType: 'github',
		skillPath: 'skills/commit/SKILL.md',
	})
	mockFetchInstall('---\nname: commit\ndescription: updated\nmetadata:\n  other: value\n---\n\nbody')

	await updateSkill('commit', { root })

	const content = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8')
	expect(content).toContain('internal: true')
	expect(content).not.toContain('other: value')
})

test('updateSkill does not inject metadata when existing file has none', async () => {
	setupFakeLockEntry('commit', 'cyberuni/cyber-skills')
	mockFetchInstall('---\nname: commit\ndescription: updated\n---\n\nbody')

	await updateSkill('commit', { root })

	const content = fs.readFileSync(path.join(root, '.agents', 'skills', 'commit', 'SKILL.md'), 'utf8')
	expect(content).toContain('description: updated')
	expect(content).not.toContain('metadata:')
})

test('updateAllSkills updates all locked skills', async () => {
	setupFakeLockEntry('commit', 'cyberuni/cyber-skills')
	setupFakeLockEntry('add-changeset', 'repobuddy/agent-changesets')

	vi.mocked(fetchAndInstallSkill).mockImplementation(async (_provider, _spec, installDir, _branch, skillFilter) => {
		const names = skillFilter ?? ['commit']
		return names.map((name) => {
			const dest = path.join(installDir, name, 'SKILL.md')
			fs.mkdirSync(path.dirname(dest), { recursive: true })
			fs.writeFileSync(dest, `---\nname: ${name}\n---`)
			return { name, content: `---\nname: ${name}\n---`, skillPath: `skills/${name}/SKILL.md`, hash: 'fakehash' }
		})
	})

	const results = await updateAllSkills({ root })
	expect(results).toHaveLength(2)
	expect(results.every((r) => r.updated)).toBe(true)
})
