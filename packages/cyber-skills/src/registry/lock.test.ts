import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { getLockEntry, getLockPath, readLock, removeLockEntry, setLockEntry, writeLock } from './lock.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-lock-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

const sampleEntry = {
	source: 'cyberuni/cyber-skills',
	sourceType: 'github' as const,
	skillPath: 'skills/commit/SKILL.md',
}

test('getLockPath returns project path', () => {
	expect(getLockPath(root, 'project')).toBe(path.join(root, '.agents', 'cyber-skills-lock.json'))
})

test('getLockPath returns global path', () => {
	expect(getLockPath(root, 'global')).toBe(path.join(os.homedir(), '.agents', 'cyber-skills-lock.json'))
})

test('readLock returns empty lock when file missing', () => {
	expect(readLock(root, 'project')).toEqual({ version: 1, skills: {} })
})

test('readLock returns empty lock on malformed JSON', () => {
	fs.mkdirSync(path.join(root, '.agents'), { recursive: true })
	fs.writeFileSync(path.join(root, '.agents', 'cyber-skills-lock.json'), 'not json')
	expect(readLock(root, 'project')).toEqual({ version: 1, skills: {} })
})

test('writeLock creates file with correct structure', () => {
	writeLock(root, 'project', { version: 1, skills: { commit: sampleEntry } })
	const filePath = path.join(root, '.agents', 'cyber-skills-lock.json')
	expect(fs.existsSync(filePath)).toBe(true)
	const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
	expect(parsed.version).toBe(1)
	expect(parsed.skills.commit.source).toBe('cyberuni/cyber-skills')
})

test('setLockEntry adds entry to lock', () => {
	setLockEntry(root, 'project', 'commit', sampleEntry)
	const lock = readLock(root, 'project')
	expect(lock.skills.commit).toMatchObject(sampleEntry)
})

test('setLockEntry overwrites existing entry', () => {
	setLockEntry(root, 'project', 'commit', sampleEntry)
	setLockEntry(root, 'project', 'commit', { ...sampleEntry, computedHash: 'abc123' })
	expect(readLock(root, 'project').skills.commit?.computedHash).toBe('abc123')
})

test('removeLockEntry removes the entry', () => {
	setLockEntry(root, 'project', 'commit', sampleEntry)
	removeLockEntry(root, 'project', 'commit')
	expect(readLock(root, 'project').skills.commit).toBeUndefined()
})

test('removeLockEntry is safe when entry not found', () => {
	removeLockEntry(root, 'project', 'nonexistent')
	expect(readLock(root, 'project').skills).toEqual({})
})

test('getLockEntry returns the entry when present', () => {
	setLockEntry(root, 'project', 'commit', sampleEntry)
	expect(getLockEntry(root, 'project', 'commit')).toMatchObject(sampleEntry)
})

test('getLockEntry returns null when entry not found', () => {
	expect(getLockEntry(root, 'project', 'commit')).toBeNull()
})
