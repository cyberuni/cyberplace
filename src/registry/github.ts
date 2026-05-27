import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import type { Provider } from './config.js'
import type { Marketplace } from './marketplace.js'
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

function buildCloneUrl(provider: Provider | null, owner: string, repo: string): string {
	if (!provider || provider.type === 'github') {
		return `https://github.com/${owner}/${repo}.git`
	}
	if (provider.type === 'gitlab') {
		const base = provider.url.replace(/\/$/, '')
		return `${base}/${owner}/${repo}.git`
	}
	const base = provider.url.replace(/\/$/, '')
	return `${base}/${owner}/${repo}.git`
}

function isLocalFile(filename: string): boolean {
	return filename.includes('.local.')
}

function copySkillDir(srcDir: string, destDir: string): string {
	fs.mkdirSync(destDir, { recursive: true })
	let skillMdContent = ''

	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		if (entry.isDirectory()) continue
		if (isLocalFile(entry.name)) continue

		const src = join(srcDir, entry.name)
		const dest = join(destDir, entry.name)
		fs.copyFileSync(src, dest)

		if (entry.name === 'SKILL.md') {
			skillMdContent = fs.readFileSync(src, 'utf8')
		}
	}

	return skillMdContent
}

export function sparseCloneAndInstall(
	provider: Provider | null,
	owner: string,
	repo: string,
	metas: SkillMeta[],
	installDir: string,
	branch: string,
	/** Pre-populated directory for testing; skips git clone and cleanup when provided. */
	_cloneDir?: string,
): FetchedSkill[] {
	const cloneUrl = buildCloneUrl(provider, owner, repo)
	const tmpDir = _cloneDir ?? fs.mkdtempSync(join(tmpdir(), 'cyber-skills-'))

	try {
		if (!_cloneDir) {
			process.stderr.write(`Loading ${owner}/${repo}...\n`)
			const cloneResult = spawnSync(
				'git',
				[
					'clone',
					'--filter=blob:none',
					'--no-checkout',
					'--sparse',
					'--depth',
					'1',
					'--branch',
					branch,
					cloneUrl,
					tmpDir,
				],
				{ encoding: 'utf8' },
			)
			if (cloneResult.status !== 0) {
				throw new Error(`git clone failed: ${cloneResult.stderr}`)
			}

			const skillDirs = [...new Set(metas.map((m) => dirname(m.skillPath)))]
			const sparseResult = spawnSync('git', ['-C', tmpDir, 'sparse-checkout', 'set', ...skillDirs], {
				encoding: 'utf8',
			})
			if (sparseResult.status !== 0) {
				throw new Error(`git sparse-checkout failed: ${sparseResult.stderr}`)
			}

			const checkoutResult = spawnSync('git', ['-C', tmpDir, 'checkout'], { encoding: 'utf8' })
			if (checkoutResult.status !== 0) {
				throw new Error(`git checkout failed: ${checkoutResult.stderr}`)
			}
		}

		const installed: FetchedSkill[] = []
		const installedNames = new Set<string>()
		for (const meta of metas) {
			if (installedNames.has(meta.name)) continue
			const srcDir = join(tmpDir, dirname(meta.skillPath))
			if (!fs.existsSync(join(srcDir, 'SKILL.md'))) continue
			installedNames.add(meta.name)
			const destDir = join(installDir, meta.name)
			const content = copySkillDir(srcDir, destDir)
			const hash = computeHash(content)
			installed.push({ name: meta.name, content, skillPath: meta.skillPath, hash })
		}

		return installed
	} finally {
		if (!_cloneDir) fs.rmSync(tmpDir, { recursive: true, force: true })
	}
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

	// Fall back to GitHub/GitLab API to list skills/ and agents/skills/ directories
	if (!provider || provider.type === 'github') {
		const url = `${buildApiBase(provider, owner, repo)}/skills`
		const res = await fetch(url, {
			headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cyber-skills-cli' },
		})
		if (!res.ok) throw new Error(`Failed to list skills in ${owner}/${repo}: ${res.status}`)
		const data = (await res.json()) as Array<{ name: string; type: string }>
		const results: SkillMeta[] = data
			.filter((entry) => entry.type === 'dir')
			.map((entry) => ({ name: entry.name, skillPath: `skills/${entry.name}/SKILL.md` }))

		const seenNames = new Set(results.map((r) => r.name))
		const agentsUrl = `${buildApiBase(provider, owner, repo)}/agents/skills`
		const agentsRes = await fetch(agentsUrl, {
			headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cyber-skills-cli' },
		})
		if (agentsRes.ok) {
			const agentsData = (await agentsRes.json()) as Array<{ name: string; type: string }>
			for (const entry of agentsData.filter((e) => e.type === 'dir')) {
				if (!seenNames.has(entry.name)) {
					results.push({ name: entry.name, skillPath: `agents/skills/${entry.name}/SKILL.md` })
				}
			}
		}

		return results
	}

	throw new Error(`Cannot list skills for provider type: ${provider?.type ?? 'github'}`)
}

export function computeHash(content: string): string {
	return createHash('sha256').update(content).digest('hex')
}

export async function fetchMarketplace(
	provider: Provider | null,
	owner: string,
	repo: string,
	branch = 'main',
): Promise<Marketplace | null> {
	try {
		const base = buildRawBase(provider, owner, repo, branch)
		const res = await fetch(`${base}/.claude-plugin/marketplace.json`)
		if (!res.ok) return null
		return (await res.json()) as Marketplace
	} catch {
		return null
	}
}

export async function fetchAndInstallSkill(
	provider: Provider | null,
	spec: RepoSpec,
	installDir: string,
	branch = 'main',
	skillFilter?: string[],
	/** Pre-populated directory for testing; skips git clone and cleanup when provided. */
	_cloneDir?: string,
): Promise<FetchedSkill[]> {
	const { owner, repo, skill } = spec

	let metas: SkillMeta[]
	if (skill) {
		// Try skills/ first (canonical public location), fall back to agents/skills/
		metas = [
			{ name: skill, skillPath: `skills/${skill}/SKILL.md` },
			{ name: skill, skillPath: `agents/skills/${skill}/SKILL.md` },
		]
	} else {
		const skills = await listRepoSkills(provider, owner, repo, branch)
		metas = skillFilter ? skills.filter((s) => skillFilter.includes(s.name)) : skills
	}

	return sparseCloneAndInstall(provider, owner, repo, metas, installDir, branch, _cloneDir)
}
