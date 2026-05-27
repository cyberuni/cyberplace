import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import type { Scope } from './scope.js'

export interface LockEntry {
	source: string
	sourceType: 'github' | 'gitlab' | 'npm' | 'custom'
	skillPath: string
	computedHash?: string
}

export interface CyberSkillsLock {
	version: 1
	skills: Record<string, LockEntry>
}

export function getLockPath(root: string, scope: Scope, home?: string): string {
	if (scope === 'global') return join(home ?? homedir(), '.agents', 'cyber-skills-lock.json')
	return join(root, '.agents', 'cyber-skills-lock.json')
}

export function readLock(root: string, scope: Scope, home?: string): CyberSkillsLock {
	const filePath = getLockPath(root, scope, home)
	if (!fs.existsSync(filePath)) return { version: 1, skills: {} }
	try {
		const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Omit<CyberSkillsLock, 'version' | 'skills'>
		return { version: 1, skills: {}, ...raw }
	} catch {
		return { version: 1, skills: {} }
	}
}

export function writeLock(root: string, scope: Scope, lock: CyberSkillsLock, home?: string): void {
	const filePath = getLockPath(root, scope, home)
	fs.mkdirSync(dirname(filePath), { recursive: true })
	fs.writeFileSync(filePath, `${JSON.stringify({ version: 1, skills: lock.skills }, null, 2)}\n`)
}

export function setLockEntry(root: string, scope: Scope, name: string, entry: LockEntry, home?: string): void {
	const lock = readLock(root, scope, home)
	lock.skills[name] = entry
	writeLock(root, scope, lock, home)
}

export function removeLockEntry(root: string, scope: Scope, name: string, home?: string): void {
	const lock = readLock(root, scope, home)
	delete lock.skills[name]
	writeLock(root, scope, lock, home)
}

export function getLockEntry(root: string, scope: Scope, name: string, home?: string): LockEntry | null {
	return readLock(root, scope, home).skills[name] ?? null
}
