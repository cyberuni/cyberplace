import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Package root. From dist/cli.js, go up one level. */
export function getPackageRoot(): string {
	return join(dirname(fileURLToPath(import.meta.url)), '..')
}
