import * as childProcess from 'node:child_process'
import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command } from 'commander'
import type { StateFile } from '../state/state.js'
import { emptyState, mergeSafeState } from '../state/state.js'
import { loadRegistry } from '../vendor-registry/fs.js'
import type { SyncFs } from './sync.js'
import { applySyncAction } from './sync.js'

function globalStatePath(): string {
	return path.join(os.homedir(), '.agents', 'universal-plugin.json')
}

function realSyncFs(): SyncFs {
	return {
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
		shell: (cmd: string): number => childProcess.spawnSync(cmd, { shell: true, stdio: 'inherit' }).status ?? 1,
	}
}

export function syncCommand(): Command {
	const cmd = new Command('sync').description('Manage cross-vendor plugin sync').helpCommand(false)

	cmd
		.command('apply')
		.description('Apply a pending sync action')
		.argument('<action-id>', 'Action ID from ~/.agents/universal-plugin.json')
		.action((actionId: string) => {
			const registry = loadRegistry()
			const result = applySyncAction({
				actionId,
				registry,
				fs: realSyncFs(),
				now: new Date().toISOString(),
			})
			if (result.outcome === 'applied') {
				process.stdout.write('Applied.\n')
			} else if (result.outcome === 'manual') {
				process.stdout.write(`${result.instruction}\n`)
			} else if (result.outcome === 'not-found') {
				process.stderr.write(`Action "${actionId}" not found in state file.\n`)
				process.exit(1)
			} else {
				process.stderr.write('Apply failed. Try again or install manually.\n')
				process.exit(1)
			}
		})

	return cmd
}
