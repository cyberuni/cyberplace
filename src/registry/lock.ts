import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

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

export type LockScope = 'project' | 'global'

export function getLockPath(root: string, scope: LockScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'cyber-skills-lock.json')
	return join(root, '.agents', 'cyber-skills-lock.json')
}

export function readLock(root: string, scope: LockScope): CyberSkillsLock {
	const filePath = getLockPath(root, scope)
	if (!fs.existsSync(filePath)) return { version: 1, skills: {} }
	try {
		const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Omit<CyberSkillsLock, 'version' | 'skills'>
		return { version: 1, skills: {}, ...raw }
	} catch {
		return { version: 1, skills: {} }
	}
}

export function writeLock(root: string, scope: LockScope, lock: CyberSkillsLock): void {
	const filePath = getLockPath(root, scope)
	fs.mkdirSync(dirname(filePath), { recursive: true })
	fs.writeFileSync(filePath, `${JSON.stringify({ version: 1, skills: lock.skills }, null, 2)}\n`)
}

export function setLockEntry(root: string, scope: LockScope, name: string, entry: LockEntry): void {
	const lock = readLock(root, scope)
	lock.skills[name] = entry
	writeLock(root, scope, lock)
}

export function removeLockEntry(root: string, scope: LockScope, name: string): void {
	const lock = readLock(root, scope)
	delete lock.skills[name]
	writeLock(root, scope, lock)
}

export function getLockEntry(root: string, scope: LockScope, name: string): LockEntry | null {
	return readLock(root, scope).skills[name] ?? null
}
