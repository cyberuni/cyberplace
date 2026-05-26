import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import { type ConfigScope, readConfig, writeConfig } from './config.js'
import { type LockScope, getLockEntry, removeLockEntry } from './lock.js'

export interface RemoveOptions {
	root: string
	scope?: ConfigScope
}

export interface RemoveResult {
	name: string
	removed: boolean
	message: string
}

function getInstallDir(root: string, scope: ConfigScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'skills')
	return join(root, '.agents', 'skills')
}

function toLockScope(scope: ConfigScope): LockScope {
	return scope
}

export function removeSkill(name: string, options: RemoveOptions): RemoveResult {
	const { root, scope = 'project' } = options
	const lockScope = toLockScope(scope)

	const entry = getLockEntry(root, lockScope, name)
	if (!entry) {
		return { name, removed: false, message: `Skill '${name}' not found in lock file` }
	}

	const installDir = getInstallDir(root, scope)
	const skillDir = join(installDir, name)
	if (fs.existsSync(skillDir)) {
		fs.rmSync(skillDir, { recursive: true, force: true })
	}

	removeLockEntry(root, lockScope, name)

	const config = readConfig(root, scope)
	if (config.skills) {
		delete config.skills[name]
		writeConfig(root, scope, config)
	}

	return { name, removed: true, message: `Removed skill '${name}'` }
}

export function removeSkillDir(root: string, scope: ConfigScope, name: string): void {
	const installDir = getInstallDir(root, scope)
	const skillDir = join(installDir, name)
	if (fs.existsSync(skillDir)) {
		fs.rmSync(skillDir, { recursive: true, force: true })
	}
	// clean up empty parent
	if (fs.existsSync(dirname(skillDir))) {
		const siblings = fs.readdirSync(dirname(skillDir))
		if (siblings.length === 0) {
			fs.rmdirSync(dirname(skillDir))
		}
	}
}
