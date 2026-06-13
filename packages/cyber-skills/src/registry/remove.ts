import * as fs from 'node:fs'
import { dirname, join } from 'node:path'

import { getLockEntry, removeLockEntry } from './lock.js'
import { getInstallDir, type Scope } from './scope.js'

export interface RemoveOptions {
	root: string
	scope?: Scope
}

export interface RemoveResult {
	name: string
	removed: boolean
	message: string
}

export function removeSkill(name: string, options: RemoveOptions): RemoveResult {
	const { root, scope = 'project' } = options

	const entry = getLockEntry(root, scope, name)
	if (!entry) {
		return { name, removed: false, message: `Skill '${name}' not found in lock file` }
	}

	const installDir = getInstallDir(root, scope)
	const skillDir = join(installDir, name)
	if (fs.existsSync(skillDir)) {
		fs.rmSync(skillDir, { recursive: true, force: true })
	}

	removeLockEntry(root, scope, name)

	return { name, removed: true, message: `Removed skill '${name}'` }
}

function removeSkillDir(root: string, scope: Scope, name: string): void {
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
