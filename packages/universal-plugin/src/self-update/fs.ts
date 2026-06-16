import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import type { StateFile } from '../state/state.js'
import { emptyState, mergeSafeState } from '../state/state.js'
import type { SelfUpdateFs } from './self-update.js'

function globalStatePath(): string {
	return path.join(os.homedir(), '.agents', 'universal-plugin.json')
}

export function realSelfUpdateFs(hookFilePaths: string[]): SelfUpdateFs {
	return {
		globHookFiles: () => hookFilePaths,
		readFile: (p) => fsNode.readFileSync(p, 'utf8'),
		writeFile: (p, c) => fsNode.writeFileSync(p, c, 'utf8'),
		readGlobalState: (): StateFile => {
			try {
				return mergeSafeState(JSON.parse(fsNode.readFileSync(globalStatePath(), 'utf8')) as StateFile)
			} catch (err: unknown) {
				if ((err as NodeJS.ErrnoException).code === 'ENOENT') return emptyState()
				throw err
			}
		},
		writeGlobalState: (s: StateFile): void => {
			fsNode.mkdirSync(path.dirname(globalStatePath()), { recursive: true })
			fsNode.writeFileSync(globalStatePath(), JSON.stringify(s, null, 2) + '\n')
		},
	}
}
