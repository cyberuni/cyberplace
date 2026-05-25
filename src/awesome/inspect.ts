import * as fs from 'node:fs'
import * as path from 'node:path'

import { normalizeRepo, parseRepositoryFromPackage } from './lib.js'

export interface SkillSummary {
	directory: string
	name: string
	description: string
}

function parseFrontmatter(content: string): { name: string; description: string } {
	const lines = content.split('\n')
	let frontmatterCount = 0
	let name = ''
	let description = ''
	for (const line of lines) {
		if (line.trim() === '---') {
			frontmatterCount += 1
			if (frontmatterCount === 2) break
			continue
		}
		if (frontmatterCount !== 1) continue
		const nameMatch = line.match(/^name:\s*(.+)$/)
		if (nameMatch) name = nameMatch[1]!.trim().replace(/^["']|["']$/g, '')
		const descriptionMatch = line.match(/^description:\s*(.+)$/)
		if (descriptionMatch) description = descriptionMatch[1]!.trim().replace(/^["']|["']$/g, '')
	}
	return { name, description }
}

async function fetchRepoSkills(repo: string): Promise<SkillSummary[]> {
	const response = await fetch(`https://api.github.com/repos/${repo}/contents/skills`, {
		headers: {
			Accept: 'application/vnd.github+json',
			'User-Agent': 'cyber-skills-awesome-skills',
		},
	})
	if (!response.ok) throw new Error(`Failed to inspect skills/ in ${repo}: ${response.status} ${response.statusText}`)
	const entries = (await response.json()) as Array<{ type: string; name: string }>
	const results: SkillSummary[] = []
	for (const directory of entries
		.filter((entry) => entry.type === 'dir')
		.map((entry) => entry.name)
		.sort()) {
		const skillResponse = await fetch(`https://api.github.com/repos/${repo}/contents/skills/${directory}/SKILL.md`, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'cyber-skills-awesome-skills',
			},
		})
		if (!skillResponse.ok) continue
		const body = (await skillResponse.json()) as { content?: string; encoding?: string }
		if (!body.content || body.encoding !== 'base64') continue
		const fm = parseFrontmatter(Buffer.from(body.content, 'base64').toString('utf8'))
		results.push({ directory, ...fm })
	}
	return results
}

function readLocalRepoSkills(cwd: string): SkillSummary[] {
	const skillsDir = path.join(cwd, 'skills')
	if (!fs.existsSync(skillsDir)) return []
	return fs
		.readdirSync(skillsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const skillMd = path.join(skillsDir, entry.name, 'SKILL.md')
			const content = fs.existsSync(skillMd) ? fs.readFileSync(skillMd, 'utf8') : ''
			const fm = parseFrontmatter(content)
			return { directory: entry.name, ...fm }
		})
		.filter((item) => item.name && item.description)
		.sort((a, b) => a.directory.localeCompare(b.directory))
}

export async function inspectSkillsRepo(repo: string, cwd: string): Promise<SkillSummary[]> {
	const normalized = normalizeRepo(repo)
	const currentRepo = parseRepositoryFromPackage(cwd)
	return normalized === currentRepo ? readLocalRepoSkills(cwd) : fetchRepoSkills(normalized)
}
