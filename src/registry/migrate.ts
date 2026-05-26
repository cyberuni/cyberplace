import * as fs from 'node:fs'
import { join } from 'node:path'

import { type ConfigScope, readConfig, writeConfig } from './config.js'
import { type LockEntry, getLockPath, readLock, writeLock } from './lock.js'

export interface MigrateOptions {
	root: string
	scope?: ConfigScope
	dryRun?: boolean
}

export interface MigrateResult {
	migratedCount: number
	skippedCount: number
	sourcePath: string
	destPath: string
	entries: Array<{ name: string; status: 'migrated' | 'skipped'; reason?: string }>
}

interface OldLockEntry {
	source?: string
	sourceType?: string
	skillPath?: string
	computedHash?: string
}

interface OldLock {
	version?: number
	skills?: Record<string, OldLockEntry>
}

export function migrate(options: MigrateOptions): MigrateResult {
	const { root, scope = 'project', dryRun = false } = options
	const oldLockPath = join(root, 'skills-lock.json')
	const destPath = getLockPath(root, scope)
	const entries: MigrateResult['entries'] = []

	if (!fs.existsSync(oldLockPath)) {
		return {
			migratedCount: 0,
			skippedCount: 0,
			sourcePath: oldLockPath,
			destPath,
			entries: [{ name: 'skills-lock.json', status: 'skipped', reason: 'source file not found' }],
		}
	}

	let oldLock: OldLock
	try {
		oldLock = JSON.parse(fs.readFileSync(oldLockPath, 'utf8')) as OldLock
	} catch {
		return {
			migratedCount: 0,
			skippedCount: 0,
			sourcePath: oldLockPath,
			destPath,
			entries: [{ name: 'skills-lock.json', status: 'skipped', reason: 'could not parse source file' }],
		}
	}

	const existingLock = readLock(root, scope)
	const configSkills: Record<string, string> = {}
	let migratedCount = 0
	let skippedCount = 0

	for (const [name, entry] of Object.entries(oldLock.skills ?? {})) {
		if (existingLock.skills[name]) {
			entries.push({ name, status: 'skipped', reason: 'already in new lock file' })
			skippedCount++
			continue
		}

		const source = entry.source ?? 'unknown'
		const sourceType = (entry.sourceType as LockEntry['sourceType']) ?? 'github'
		const skillPath = entry.skillPath ?? `skills/${name}/SKILL.md`

		const newEntry: LockEntry = {
			spec: source !== 'unknown' ? `${source}:${name}` : name,
			source,
			sourceType,
			skillPath,
			installedAt: join(root, '.agents', 'skills', name, 'SKILL.md'),
			computedHash: entry.computedHash,
		}

		if (!dryRun) {
			existingLock.skills[name] = newEntry
			configSkills[name] = source !== 'unknown' ? source : name
		}

		entries.push({ name, status: 'migrated' })
		migratedCount++
	}

	if (!dryRun && migratedCount > 0) {
		writeLock(root, scope, existingLock)

		const config = readConfig(root, scope)
		const skills = { ...(config.skills ?? {}), ...configSkills }
		writeConfig(root, scope, { ...config, skills })
	}

	return { migratedCount, skippedCount, sourcePath: oldLockPath, destPath, entries }
}
