import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Package root — walks up from this module until package.json is found. */
export function getPackageRoot(): string {
	let dir = dirname(fileURLToPath(import.meta.url))
	while (dir !== dirname(dir)) {
		if (existsSync(join(dir, 'package.json'))) return dir
		dir = dirname(dir)
	}
	throw new Error('Could not find package root (no package.json in parent directories)')
}
