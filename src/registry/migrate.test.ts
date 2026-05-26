import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { readLock } from './lock.js'
import { readConfig } from './config.js'
import { migrate } from './migrate.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-migrate-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

function writeOldLock(data: object): void {
	fs.writeFileSync(path.join(root, 'skills-lock.json'), JSON.stringify(data, null, 2))
}

const oldLockData = {
	version: 1,
	skills: {
		'add-changeset': {
			source: 'repobuddy/agent-changesets',
			sourceType: 'github',
			skillPath: 'skills/add-changeset/SKILL.md',
			computedHash: 'abc123',
		},
		commit: {
			source: 'cyberuni/cyber-skills',
			sourceType: 'github',
			skillPath: 'skills/commit/SKILL.md',
		},
	},
}

test('migrate returns not-found result when skills-lock.json absent', () => {
	const result = migrate({ root })
	expect(result.migratedCount).toBe(0)
	expect(result.entries[0]!.reason).toContain('not found')
})

test('migrate reads skills-lock.json and writes to new lock', () => {
	writeOldLock(oldLockData)
	const result = migrate({ root })
	expect(result.migratedCount).toBe(2)
	expect(result.skippedCount).toBe(0)

	const lock = readLock(root, 'project')
	expect(lock.skills['add-changeset']?.source).toBe('repobuddy/agent-changesets')
	expect(lock.skills['commit']?.source).toBe('cyberuni/cyber-skills')
})

test('migrate records skills in config', () => {
	writeOldLock(oldLockData)
	migrate({ root })

	const config = readConfig(root, 'project')
	expect(config.skills?.['add-changeset']).toBe('repobuddy/agent-changesets')
	expect(config.skills?.['commit']).toBe('cyberuni/cyber-skills')
})

test('migrate preserves computedHash', () => {
	writeOldLock(oldLockData)
	migrate({ root })

	const lock = readLock(root, 'project')
	expect(lock.skills['add-changeset']?.computedHash).toBe('abc123')
})

test('migrate skips entries already in new lock', () => {
	writeOldLock(oldLockData)
	migrate({ root }) // first run
	const result2 = migrate({ root }) // second run

	expect(result2.skippedCount).toBe(2)
	expect(result2.migratedCount).toBe(0)
})

test('migrate dry-run does not write files', () => {
	writeOldLock(oldLockData)
	migrate({ root, dryRun: true })

	const lock = readLock(root, 'project')
	expect(Object.keys(lock.skills)).toHaveLength(0)
})

test('migrate returns skipped on malformed JSON', () => {
	fs.writeFileSync(path.join(root, 'skills-lock.json'), 'not json')
	const result = migrate({ root })
	expect(result.migratedCount).toBe(0)
	expect(result.entries[0]!.reason).toContain('parse')
})
