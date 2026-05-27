import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { isPackageManaged, readSkillManifest } from './manifest.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-manifest-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

test('readSkillManifest returns null when skill.json absent', () => {
	expect(readSkillManifest(root)).toBeNull()
})

test('readSkillManifest returns null when skill.json is invalid JSON', () => {
	fs.writeFileSync(path.join(root, 'skill.json'), 'not json')
	expect(readSkillManifest(root)).toBeNull()
})

test('readSkillManifest parses distribution metadata', () => {
	fs.writeFileSync(
		path.join(root, 'skill.json'),
		JSON.stringify({
			distribution: { install_via: 'package_manager', package: { name: 'cyber-asana', bin: 'cyber-asana' } },
		}),
	)
	const manifest = readSkillManifest(root)
	expect(manifest?.distribution?.install_via).toBe('package_manager')
	expect(manifest?.distribution?.package?.name).toBe('cyber-asana')
	expect(manifest?.distribution?.package?.bin).toBe('cyber-asana')
})

test('readSkillManifest handles missing optional bin field', () => {
	fs.writeFileSync(
		path.join(root, 'skill.json'),
		JSON.stringify({ distribution: { install_via: 'package_manager', package: { name: 'cyber-asana' } } }),
	)
	const manifest = readSkillManifest(root)
	expect(manifest?.distribution?.package?.bin).toBeUndefined()
})

test('isPackageManaged returns true when install_via is package_manager', () => {
	expect(isPackageManaged({ distribution: { install_via: 'package_manager' } })).toBe(true)
})

test('isPackageManaged returns false when install_via is something else', () => {
	expect(isPackageManaged({ distribution: { install_via: 'source' } })).toBe(false)
})

test('isPackageManaged returns false when no distribution', () => {
	expect(isPackageManaged({})).toBe(false)
})

test('isPackageManaged returns false for null manifest', () => {
	expect(isPackageManaged(null)).toBe(false)
})
