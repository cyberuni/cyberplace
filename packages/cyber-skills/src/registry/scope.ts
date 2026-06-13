import { homedir } from 'node:os'
import { join } from 'node:path'

export type Scope = 'project' | 'global'

export function getInstallDir(root: string, scope: Scope, home?: string): string {
	if (scope === 'global') return join(home ?? homedir(), '.agents', 'skills')
	return join(root, '.agents', 'skills')
}
