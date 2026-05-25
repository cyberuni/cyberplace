import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface SkillSourceResult {
	name: string
	source: string | null
	sourceUrl: string | null
	skillPath: string | null
	foundIn: 'repo' | 'global' | 'npx-skills' | null
}

function readLock(lockPath: string): Record<string, unknown> | null {
	if (!existsSync(lockPath)) return null
	try {
		return JSON.parse(readFileSync(lockPath, 'utf8'))
	} catch {
		return null
	}
}

function parseNpxSkillsOutput(raw: string, skillName: string): { source: string } | null {
	const ansiRe = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
	const clean = raw.replace(ansiRe, '')
	const regex = /([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)@([a-zA-Z0-9_-]+)/g
	let match: RegExpExecArray | null
	while ((match = regex.exec(clean)) !== null) {
		const [, ownerRepo, foundName] = match
		if (foundName === skillName) return { source: ownerRepo! }
	}
	return null
}

export function findSkillSource(skillName: string, root: string): SkillSourceResult {
	const repoLock = readLock(join(root, 'skills-lock.json'))
	if (repoLock) {
		const entry = (repoLock as { skills?: Record<string, Record<string, string>> }).skills?.[skillName]
		if (entry?.source) {
			return {
				name: skillName,
				source: entry.source,
				sourceUrl: `https://github.com/${entry.source}`,
				skillPath: entry.skillPath ?? null,
				foundIn: 'repo',
			}
		}
	}

	const globalLock = readLock(join(homedir(), '.agents', '.skill-lock.json'))
	if (globalLock) {
		const entry = (globalLock as { skills?: Record<string, Record<string, string>> }).skills?.[skillName]
		if (entry?.source) {
			return {
				name: skillName,
				source: entry.source,
				sourceUrl: entry.sourceUrl ?? `https://github.com/${entry.source}`,
				skillPath: entry.skillPath ?? null,
				foundIn: 'global',
			}
		}
	}

	try {
		const result = spawnSync('npx', ['--yes', 'skills', 'find', skillName], {
			encoding: 'utf8',
			timeout: 10_000,
			env: { ...process.env, NO_COLOR: '1', CI: '1' },
		})
		const out = (result.stdout ?? '') + (result.stderr ?? '')
		const parsed = parseNpxSkillsOutput(out, skillName)
		if (parsed) {
			return {
				name: skillName,
				source: parsed.source,
				sourceUrl: `https://github.com/${parsed.source}`,
				skillPath: `skills/${skillName}/SKILL.md`,
				foundIn: 'npx-skills',
			}
		}
	} catch {
		// npx not available or timed out
	}

	return {
		name: skillName,
		source: null,
		sourceUrl: null,
		skillPath: null,
		foundIn: null,
	}
}
