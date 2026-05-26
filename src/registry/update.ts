import { type ConfigScope, readConfig } from './config.js'
import { type LockScope, getLockEntry, readLock } from './lock.js'
import { addSkill } from './add.js'

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

export async function updateSkill(name: string, options: UpdateOptions): Promise<UpdateResult> {
	const { root, scope = 'project' } = options

	const entry = getLockEntry(root, toLockScope(scope), name)
	if (!entry) {
		return { name, updated: false, message: `Skill '${name}' not found in lock file` }
	}

	await addSkill(entry.spec, { root, scope })
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
