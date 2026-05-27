import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { getPackageRoot } from '../hook/package-root.js'

export type SkillLocation = 'repo' | 'global' | 'package'

export interface SkillSummary {
	name: string
	description: string
	foundIn: SkillLocation
}

function parseFrontmatter(content: string): { name: string; description: string } {
	const lines = content.split('\n')
	let fmCount = 0
	let name = ''
	let description = ''

	for (const line of lines) {
		if (line.trim() === '---') {
			fmCount++
			if (fmCount === 2) break
			continue
		}
		if (fmCount !== 1) continue

		const nameMatch = line.match(/^name:\s*(.+)/)
		if (nameMatch) name = nameMatch[1]!.trim().replace(/^["']|["']$/g, '')

		const descMatch = line.match(/^description:\s*(.+)/)
		if (descMatch) description = descMatch[1]!.trim().replace(/^["']|["']$/g, '')
	}

	return { name, description }
}

export function globToRegExp(pattern: string): RegExp {
	let regex = ''
	for (const char of pattern) {
		if (char === '*') regex += '.*'
		else if (char === '?') regex += '.'
		else if (/[.+^${}()|[\]\\]/.test(char)) regex += `\\${char}`
		else regex += char
	}
	return new RegExp(`^${regex}$`)
}

function matchesGrep(candidates: string[], grep?: RegExp): boolean {
	if (!grep) return true
	return candidates.some((candidate) => grep.test(candidate))
}

function collectSkillsFromDir(dir: string, foundIn: SkillLocation): SkillSummary[] {
	if (!existsSync(dir)) return []

	const results: SkillSummary[] = []
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue

		const skillFile = join(dir, entry.name, 'SKILL.md')
		if (!existsSync(skillFile)) continue

		const { name, description } = parseFrontmatter(readFileSync(skillFile, 'utf8'))
		results.push({
			name: name || entry.name,
			description,
			foundIn,
		})
	}

	return results
}

export function listSkills(root: string, options: { grep?: string; home?: string } = {}): SkillSummary[] {
	const grep = options.grep ? globToRegExp(options.grep) : undefined
	const home = options.home ?? homedir()

	const sources: { dir: string; foundIn: SkillLocation }[] = [
		{ dir: join(root, '.agents', 'skills'), foundIn: 'repo' },
		{ dir: join(root, 'agents', 'skills'), foundIn: 'repo' },
		{ dir: join(home, '.agents', 'skills'), foundIn: 'global' },
		{ dir: join(getPackageRoot(), 'agents', 'skills'), foundIn: 'package' },
	]

	const seen = new Set<string>()
	const results: SkillSummary[] = []

	for (const { dir, foundIn } of sources) {
		for (const skill of collectSkillsFromDir(dir, foundIn)) {
			if (seen.has(skill.name)) continue
			if (!matchesGrep([skill.name], grep)) continue

			seen.add(skill.name)
			results.push(skill)
		}
	}

	return results.sort((a, b) => a.name.localeCompare(b.name))
}
