import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { addSkill } from './add.js'
import type { ConfigScope } from './config.js'
import { getLockEntry, type LockScope, readLock } from './lock.js'

export interface UpdateOptions {
	root: string
	scope?: ConfigScope
}

export interface UpdateResult {
	name: string
	updated: boolean
	message: string
}

function toLockScope(scope: ConfigScope): LockScope {
	return scope
}

function getInstallDir(root: string, scope: ConfigScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'skills')
	return join(root, '.agents', 'skills')
}

export function extractMetadataLines(content: string): string[] {
	const lines = content.split('\n')
	let fmCount = 0
	const result: string[] = []
	let metadataIndent: number | null = null

	for (const line of lines) {
		if (line.trim() === '---') {
			fmCount++
			if (fmCount === 2) break
			continue
		}
		if (fmCount !== 1) continue

		if (metadataIndent !== null) {
			const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0
			if (line.trim() && indent <= metadataIndent) {
				metadataIndent = null
			} else {
				result.push(line)
				continue
			}
		}

		const m = line.match(/^(\s*)metadata:\s*$/)
		if (m) {
			metadataIndent = m[1]!.length
			result.push(line)
		}
	}

	return result
}

export function injectMetadataLines(content: string, metadataLines: string[]): string {
	if (!metadataLines.length) return content

	const lines = content.split('\n')
	let fmCount = 0
	let metadataStart = -1
	let metadataEnd = -1
	let endFm = -1
	let metadataIndent: number | null = null

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!
		if (line.trim() === '---') {
			fmCount++
			if (fmCount === 1) continue
			endFm = i
			if (metadataIndent !== null) metadataEnd = i
			break
		}
		if (fmCount !== 1) continue

		if (metadataIndent !== null) {
			const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0
			if (line.trim() && indent <= metadataIndent) {
				metadataEnd = i
				metadataIndent = null
			}
		}

		const m = line.match(/^(\s*)metadata:\s*$/)
		if (m) {
			metadataIndent = m[1]!.length
			metadataStart = i
		}
	}

	if (endFm === -1) return content

	const result = [...lines]
	if (metadataStart !== -1) {
		const end = metadataEnd !== -1 ? metadataEnd : endFm
		result.splice(metadataStart, end - metadataStart, ...metadataLines)
	} else {
		result.splice(endFm, 0, ...metadataLines)
	}

	return result.join('\n')
}

export async function updateSkill(name: string, options: UpdateOptions): Promise<UpdateResult> {
	const { root, scope = 'project' } = options

	const entry = getLockEntry(root, toLockScope(scope), name)
	if (!entry) {
		return { name, updated: false, message: `Skill '${name}' not found in lock file` }
	}

	const existingPath = join(getInstallDir(root, scope), name, 'SKILL.md')
	const existingMetadata = fs.existsSync(existingPath)
		? extractMetadataLines(fs.readFileSync(existingPath, 'utf8'))
		: []

	const result = await addSkill(entry.spec, { root, scope })

	if (existingMetadata.length > 0) {
		for (const installed of result.installed) {
			if (installed.name !== name) continue
			const current = fs.readFileSync(installed.installedAt, 'utf8')
			const patched = injectMetadataLines(current, existingMetadata)
			if (patched !== current) fs.writeFileSync(installed.installedAt, patched)
		}
	}

	return { name, updated: true, message: `Updated skill '${name}'` }
}

export async function updateAllSkills(options: UpdateOptions): Promise<UpdateResult[]> {
	const { root, scope = 'project' } = options
	const lock = readLock(root, toLockScope(scope))
	const results: UpdateResult[] = []

	for (const name of Object.keys(lock.skills)) {
		const result = await updateSkill(name, options)
		results.push(result)
	}

	return results
}
