import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import { dirname, join } from 'node:path'

import type { Provider } from './config.js'
import type { RepoSpec } from './spec.js'

export interface SkillMeta {
	name: string
	skillPath: string
}

export interface FetchedSkill {
	name: string
	content: string
	skillPath: string
	hash: string
}

function buildRawBase(provider: Provider | null, owner: string, repo: string, branch = 'main'): string {
	if (!provider || provider.type === 'github') {
		return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`
	}
	if (provider.type === 'gitlab') {
		const base = provider.url.replace(/\/$/, '')
		return `${base}/${owner}/${repo}/-/raw/${branch}`
	}
	const base = provider.url.replace(/\/$/, '')
	return `${base}/${owner}/${repo}/raw/${branch}`
}

function buildApiBase(provider: Provider | null, owner: string, repo: string): string {
	if (!provider || provider.type === 'github') {
		return `https://api.github.com/repos/${owner}/${repo}/contents`
	}
	if (provider.type === 'gitlab') {
		const base = provider.url.replace(/\/$/, '')
		return `${base}/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/tree`
	}
	const base = provider.url.replace(/\/$/, '')
	return `${base}/api/repos/${owner}/${repo}/contents`
}

export async function fetchSkillContent(
	provider: Provider | null,
	owner: string,
	repo: string,
	skillPath: string,
	branch = 'main',
): Promise<string> {
	const base = buildRawBase(provider, owner, repo, branch)
	const url = `${base}/${skillPath}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
	return res.text()
}

export async function listRepoSkills(
	provider: Provider | null,
	owner: string,
	repo: string,
	branch = 'main',
): Promise<SkillMeta[]> {
	// Try awesome-skills.json first (faster, no API rate limits)
	try {
		const base = buildRawBase(provider, owner, repo, branch)
		const url = `${base}/awesome-skills.json`
		const res = await fetch(url)
		if (res.ok) {
			const data = (await res.json()) as Array<{ name: string; path?: string; skillPath?: string }>
			return data.map((entry) => ({
				name: entry.name,
				skillPath: entry.skillPath ?? entry.path ?? `skills/${entry.name}/SKILL.md`,
			}))
		}
	} catch {
		// fall through to API
	}

	// Fall back to GitHub/GitLab API to list skills/ directory
	if (!provider || provider.type === 'github') {
		const url = `${buildApiBase(provider, owner, repo)}/skills`
		const res = await fetch(url, {
			headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cyber-skills-cli' },
		})
		if (!res.ok) throw new Error(`Failed to list skills in ${owner}/${repo}: ${res.status}`)
		const data = (await res.json()) as Array<{ name: string; type: string }>
		return data
			.filter((entry) => entry.type === 'dir')
			.map((entry) => ({ name: entry.name, skillPath: `skills/${entry.name}/SKILL.md` }))
	}

	throw new Error(`Cannot list skills for provider type: ${provider?.type ?? 'github'}`)
}

export function computeHash(content: string): string {
	return createHash('sha256').update(content).digest('hex')
}

export async function fetchAndInstallSkill(
	provider: Provider | null,
	spec: RepoSpec,
	installDir: string,
	branch = 'main',
): Promise<FetchedSkill[]> {
	const { owner, repo, skill } = spec
	const installed: FetchedSkill[] = []

	if (skill) {
		const skillPath = `skills/${skill}/SKILL.md`
		const content = await fetchSkillContent(provider, owner, repo, skillPath, branch)
		const hash = computeHash(content)
		const dest = join(installDir, skill, 'SKILL.md')
		fs.mkdirSync(dirname(dest), { recursive: true })
		fs.writeFileSync(dest, content)
		installed.push({ name: skill, content, skillPath, hash })
	} else {
		const skills = await listRepoSkills(provider, owner, repo, branch)
		for (const meta of skills) {
			const content = await fetchSkillContent(provider, owner, repo, meta.skillPath, branch)
			const hash = computeHash(content)
			const dest = join(installDir, meta.name, 'SKILL.md')
			fs.mkdirSync(dirname(dest), { recursive: true })
			fs.writeFileSync(dest, content)
			installed.push({ name: meta.name, content, skillPath: meta.skillPath, hash })
		}
	}

	return installed
}
