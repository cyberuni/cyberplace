import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { readConfig, writeConfig } from './config.js'
import { setLockEntry } from './lock.js'
import { removeSkill } from './remove.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-remove-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

function installFakeSkill(name: string): string {
	const skillDir = path.join(root, '.agents', 'skills', name)
	fs.mkdirSync(skillDir, { recursive: true })
	fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---\nname: ${name}\n---`)
	setLockEntry(root, 'project', name, {
		source: 'org/repo',
		sourceType: 'github',
		skillPath: `skills/${name}/SKILL.md`,
	})
	writeConfig(root, 'project', { version: 1, skills: { [name]: `org/repo:${name}` } })
	return skillDir
}

test('removeSkill removes skill directory', () => {
	const skillDir = installFakeSkill('commit')
	removeSkill('commit', { root })
	expect(fs.existsSync(skillDir)).toBe(false)
})

test('removeSkill removes lock entry', () => {
	installFakeSkill('commit')
	removeSkill('commit', { root })
	const config = readConfig(root, 'project')
	expect(config.skills?.['commit']).toBeUndefined()
})

test('removeSkill removes config entry', () => {
	installFakeSkill('commit')
	removeSkill('commit', { root })
	const config = readConfig(root, 'project')
	expect(config.skills?.['commit']).toBeUndefined()
})

test('removeSkill returns removed:true on success', () => {
	installFakeSkill('commit')
	const result = removeSkill('commit', { root })
	expect(result.removed).toBe(true)
	expect(result.name).toBe('commit')
})

test('removeSkill returns removed:false when skill not in lock', () => {
	const result = removeSkill('nonexistent', { root })
	expect(result.removed).toBe(false)
})

test('removeSkill is safe when skill dir is already gone', () => {
	installFakeSkill('commit')
	// manually delete dir before remove
	fs.rmSync(path.join(root, '.agents', 'skills', 'commit'), { recursive: true })
	const result = removeSkill('commit', { root })
	expect(result.removed).toBe(true)
})
