import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Package root (parent of hooks/). */
export function getPackageRoot(): string {
	const candidate = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
	return basename(candidate) === 'src' ? dirname(candidate) : candidate
}
