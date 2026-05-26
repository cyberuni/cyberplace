import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { setLockEntry } from './lock.js'
import { updateAllSkills, updateSkill } from './update.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-update-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	vi.restoreAllMocks()
})

function setupFakeLockEntry(name: string, spec: string): void {
	const skillDir = path.join(root, '.agents', 'skills', name)
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---\nname: ${name}\n---`)
	setLockEntry(root, 'project', name, {
		spec,
		source: 'org/repo',
		sourceType: 'github',
		skillPath: `skills/${name}/SKILL.md`,
	})
}

test('updateSkill re-fetches and updates the skill file', async () => {
	setupFakeLockEntry('commit', 'cyberuni/cyber-skills:commit')

	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: commit\ndescription: updated\n---'),
		}),
	)

	const result = await updateSkill('commit', { root })
	expect(result.updated).toBe(true)

	const content = fs.readFileSync(path.join(root, '.agents', 'skills', 'commit', 'SKILL.md'), 'utf8')
	expect(content).toContain('updated')
})

test('updateSkill returns updated:false when skill not in lock', async () => {
	const result = await updateSkill('nonexistent', { root })
	expect(result.updated).toBe(false)
})

test('updateAllSkills updates all locked skills', async () => {
	setupFakeLockEntry('commit', 'cyberuni/cyber-skills:commit')
	setupFakeLockEntry('add-changeset', 'repobuddy/agent-changesets:add-changeset')

	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('---\nname: skill\n---'),
		}),
	)

	const results = await updateAllSkills({ root })
	expect(results).toHaveLength(2)
	expect(results.every((r) => r.updated)).toBe(true)
})
