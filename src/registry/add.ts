import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { type ConfigScope, matchProvider, readConfig, writeConfig } from './config.js'
import { fetchAndInstallSkill } from './github.js'
import { type LockScope, setLockEntry } from './lock.js'
import { installNpmPackage, listNpmSkills } from './npm.js'
import { isNpmSpec, isRepoSpec, parseSpec } from './spec.js'

export interface AddOptions {
	root: string
	scope?: ConfigScope
	branch?: string
	skills?: string[]
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

function getInstallDir(root: string, scope: ConfigScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'skills')
	return join(root, '.agents', 'skills')
}

function toLockScope(scope: ConfigScope): LockScope {
	return scope
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

export async function addSkill(input: string, options: AddOptions): Promise<AddResult> {
	const { root, scope = 'project', branch = 'main' } = options
	const spec = parseSpec(input)
	const installDir = getInstallDir(root, scope)
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
			setLockEntry(root, toLockScope(scope), f.name, {
				source: `${spec.owner}/${spec.repo}`,
				sourceType: provider?.type === 'gitlab' ? 'gitlab' : 'github',
				skillPath: f.skillPath,
				computedHash: f.hash,
			})
			installed.push({ name: f.name, skillPath: f.skillPath, installedAt })

			if (scope === 'project') {
				const skipped = tryCreateSkillsSymlink(root, f.name, join(installDir, f.name))
				if (skipped) skippedSymlinks.push(skipped)
			}
		}

		// record in config skills section
		const updatedConfig = readConfig(root, scope)
		const skills = updatedConfig.skills ?? {}
		for (const f of fetched) {
			skills[f.name] = input
		}
		writeConfig(root, scope, { ...updatedConfig, skills })
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

			setLockEntry(root, toLockScope(scope), skillName, {
				source: spec.packageName,
				sourceType: 'npm',
				skillPath: `skills/${skillName}/SKILL.md`,
			})
			installed.push({ name: skillName, skillPath: `skills/${skillName}/SKILL.md`, installedAt: destPath })

			if (scope === 'project') {
				const skipped = tryCreateSkillsSymlink(root, skillName, destDir)
				if (skipped) skippedSymlinks.push(skipped)
			}
		}

		// record in config skills section
		const updatedConfig = readConfig(root, scope)
		const skills = updatedConfig.skills ?? {}
		for (const skillName of skillNames) {
			skills[skillName] = input
		}
		writeConfig(root, scope, { ...updatedConfig, skills })
	}

	return { spec: input, installed, skippedSymlinks }
}
