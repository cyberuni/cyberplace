import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getPackageRoot } from './package-root.mts'

function getPackageVersion(): string {
	const pkgPath = join(getPackageRoot(), 'package.json')
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string }
	return pkg.version
}

/**
 * Build a hook command string for registration in agent settings.
 * Prefers local node_modules bin when cyber-skills is a devDependency.
 */
export function hookCommand(subcommand: string, root = process.cwd()): string {
	const localBin = join(root, 'node_modules', '.bin', 'cyber-skills')
	if (existsSync(localBin)) {
		return `${localBin} ${subcommand}`
	}
	const version = getPackageVersion()
	return `npx cyber-skills@${version} ${subcommand}`
}

/** True when an existing registered command refers to the same hook id. */
export function commandMatchesHook(existing: string, hookId: string, expectedCommand: string): boolean {
	if (existing === expectedCommand) return true
	if (hookId === 'commit-discipline' && existing.includes('run-hook commit-discipline')) return true
	return false
}
