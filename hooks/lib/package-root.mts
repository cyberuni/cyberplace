import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Package root (parent of hooks/). */
export function getPackageRoot(): string {
	return join(dirname(fileURLToPath(import.meta.url)), '..', '..')
}
