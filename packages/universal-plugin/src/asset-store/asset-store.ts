import * as os from 'node:os'
import * as path from 'node:path'

export const ASSET_DIRS = ['governances', 'disciplines', 'guidelines', 'templates'] as const

export function globalStorePath(): string {
	return path.join(os.homedir(), '.agents', '.universal-plugin', 'plugins')
}

export function projectStorePath(root: string): string {
	return path.join(root, '.agents', '.universal-plugin', 'plugins')
}

export function storeEntryPath(storePath: string, segment: string): string {
	return path.join(storePath, segment)
}
