import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { type ConfigScope, readConfig, writeConfig } from './config.js'
import { fetchAndInstallSkill } from './github.js'
import { type LockScope, setLockEntry } from './lock.js'
import { installNpmPackage, listNpmSkills } from './npm.js'
import { type ParsedSpec, isNpmSpec, isRepoSpec, parseSpec } from './spec.js'

export interface AddOptions {
	root: string
	scope?: ConfigScope
	branch?: string
}

export interface AddResult {
	spec: string
	installed: Array<{ name: string; skillPath: string; installedAt: string }>
}

function getInstallDir(root: string, scope: ConfigScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'skills')
	return join(root, '.agents', 'skills')
}

function toLockScope(scope: ConfigScope): LockScope {
	return scope
}

export async function addSkill(input: string, options: AddOptions): Promise<AddResult> {
	const { root, scope = 'project', branch = 'main' } = options
	const spec = parseSpec(input)
	const installDir = getInstallDir(root, scope)
	const installed: AddResult['installed'] = []

	if (isRepoSpec(spec)) {
		const config = readConfig(root, scope)
		const providers = config.providers ?? []
		// find matching provider for the repo host, else use null (github default)
		const provider = providers.find((p) => p.type !== 'github') ?? null

		const fetched = await fetchAndInstallSkill(provider, spec, installDir, branch)

		for (const f of fetched) {
			const installedAt = join(installDir, f.name, 'SKILL.md')
			setLockEntry(root, toLockScope(scope), f.name, {
				spec: input,
				source: `${spec.owner}/${spec.repo}`,
				sourceType: provider?.type === 'gitlab' ? 'gitlab' : 'github',
				skillPath: f.skillPath,
				installedAt,
				computedHash: f.hash,
			})
			installed.push({ name: f.name, skillPath: f.skillPath, installedAt })
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
				spec: input,
				source: spec.packageName,
				sourceType: 'npm',
				skillPath: `skills/${skillName}/SKILL.md`,
				installedAt: destPath,
			})
			installed.push({ name: skillName, skillPath: `skills/${skillName}/SKILL.md`, installedAt: destPath })
		}

		// record in config skills section
		const updatedConfig = readConfig(root, scope)
		const skills = updatedConfig.skills ?? {}
		for (const skillName of skillNames) {
			skills[skillName] = input
		}
		writeConfig(root, scope, { ...updatedConfig, skills })

	}

	return { spec: input, installed }
}
