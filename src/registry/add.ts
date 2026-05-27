import * as fs from 'node:fs'
import { join } from 'node:path'

import { matchProvider, type Provider, readConfig } from './config.js'
import { setLockEntry } from './lock.js'
import { installNpmPackage, listNpmSkills } from './npm.js'
import { fetchAndInstallSkill } from './remote.js'
import { getInstallDir, type Scope } from './scope.js'
import { type GitProviderHint, type GitUrlSpec, isGitUrlSpec, isNpmSpec, isRepoSpec, parseSpec } from './spec.js'

export interface AddOptions {
	root: string
	scope?: Scope
	branch?: string
	skills?: string[]
	home?: string
}

export interface SkippedSymlink {
	name: string
	path: string
}

export interface AddResult {
	spec: string
	installed: Array<{ name: string; skillPath: string; installedAt: string }>
	skippedSymlinks: SkippedSymlink[]
}

function tryCreateSkillsSymlink(root: string, name: string, canonicalDir: string): SkippedSymlink | null {
	const symlinkPath = join(root, 'skills', name)

	if (fs.existsSync(symlinkPath)) {
		const stat = fs.lstatSync(symlinkPath)
		if (!stat.isSymbolicLink()) {
			return { name, path: symlinkPath }
		}
		fs.unlinkSync(symlinkPath)
	}

	fs.mkdirSync(join(root, 'skills'), { recursive: true })
	fs.symlinkSync(canonicalDir, symlinkPath, 'junction')
	return null
}

function inferProviderFromHint(spec: GitUrlSpec): Provider | null {
	if (spec.providerHint === 'gitlab') return { type: 'gitlab', url: spec.host }
	if (spec.providerHint === 'gitea') return { type: 'custom', url: spec.host }
	return null
}

function hintToSourceType(hint: GitProviderHint): 'github' | 'gitlab' | 'custom' {
	if (hint === 'gitlab') return 'gitlab'
	if (hint === 'github') return 'github'
	return 'custom'
}

export async function addSkill(input: string, options: AddOptions): Promise<AddResult> {
	const { root, scope = 'project', branch = 'main', home } = options
	const spec = parseSpec(input)
	const installDir = getInstallDir(root, scope, home)
	const installed: AddResult['installed'] = []
	const skippedSymlinks: SkippedSymlink[] = []

	if (isRepoSpec(spec)) {
		const config = readConfig(root, scope)
		const providers = config.providers ?? []
		// match config patterns — null means GitHub default
		const provider = matchProvider(providers, `${spec.owner}/${spec.repo}`)

		const fetched = await fetchAndInstallSkill(provider, spec, installDir, branch, options.skills)

		for (const f of fetched) {
			const installedAt = join(installDir, f.name, 'SKILL.md')
			setLockEntry(
				root,
				scope,
				f.name,
				{
					source: `${spec.owner}/${spec.repo}`,
					sourceType: provider?.type === 'gitlab' ? 'gitlab' : 'github',
					skillPath: f.skillPath,
					computedHash: f.hash,
				},
				home,
			)
			installed.push({ name: f.name, skillPath: f.skillPath, installedAt })

			if (scope === 'project') {
				const skipped = tryCreateSkillsSymlink(root, f.name, join(installDir, f.name))
				if (skipped) skippedSymlinks.push(skipped)
			}
		}
	} else if (isGitUrlSpec(spec)) {
		const config = readConfig(root, scope)
		const providers = config.providers ?? []
		const configProvider = matchProvider(providers, `${spec.owner}/${spec.repo}`)
		const provider = configProvider ?? inferProviderFromHint(spec)

		const repoSpec = { type: 'repo' as const, owner: spec.owner, repo: spec.repo, skill: undefined, raw: spec.raw }
		const effectiveBranch = spec.branch ?? branch
		const fetched = await fetchAndInstallSkill(provider, repoSpec, installDir, effectiveBranch, options.skills)

		for (const f of fetched) {
			const installedAt = join(installDir, f.name, 'SKILL.md')
			const sourceType = configProvider
				? configProvider.type === 'gitlab'
					? 'gitlab'
					: configProvider.type === 'github'
						? 'github'
						: 'custom'
				: hintToSourceType(spec.providerHint)
			setLockEntry(
				root,
				scope,
				f.name,
				{
					source: spec.branch ? `${spec.cloneUrl}#${spec.branch}` : spec.cloneUrl,
					sourceType,
					skillPath: f.skillPath,
					computedHash: f.hash,
				},
				home,
			)
			installed.push({ name: f.name, skillPath: f.skillPath, installedAt })

			if (scope === 'project') {
				const skipped = tryCreateSkillsSymlink(root, f.name, join(installDir, f.name))
				if (skipped) skippedSymlinks.push(skipped)
			}
		}
	} else if (isNpmSpec(spec)) {
		const result = installNpmPackage(root, spec.packageName)
		if (!result.skillsDir) {
			throw new Error(`Package ${spec.packageName} has no skills/ directory`)
		}

		const skillNames = listNpmSkills(result.skillsDir)
		if (skillNames.length === 0) {
			throw new Error(`No skills found in ${spec.packageName}/skills/`)
		}

		for (const skillName of skillNames) {
			const sourcePath = join(result.skillsDir, skillName, 'SKILL.md')
			const destDir = join(installDir, skillName)
			const destPath = join(destDir, 'SKILL.md')
			fs.mkdirSync(destDir, { recursive: true })
			fs.copyFileSync(sourcePath, destPath)

			setLockEntry(
				root,
				scope,
				skillName,
				{
					source: spec.packageName,
					sourceType: 'npm',
					skillPath: `skills/${skillName}/SKILL.md`,
				},
				home,
			)
			installed.push({ name: skillName, skillPath: `skills/${skillName}/SKILL.md`, installedAt: destPath })

			if (scope === 'project') {
				const skipped = tryCreateSkillsSymlink(root, skillName, destDir)
				if (skipped) skippedSymlinks.push(skipped)
			}
		}
	}

	return { spec: input, installed, skippedSymlinks }
}
