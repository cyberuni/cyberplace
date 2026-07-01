import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command, Option } from 'commander'
import { resolveRoot } from '../cli-options.js'
import { mergeSafeState } from '../state/state.js'
import { globalStorePath, projectStorePath } from './asset-store.js'
import { removeStore } from './fs.js'

function globalStatePath(): string {
	return path.join(os.homedir(), '.agents', 'universal-plugin.json')
}

function clearStateIndex(statePath: string): void {
	try {
		const raw = JSON.parse(fsNode.readFileSync(statePath, 'utf8'))
		const state = mergeSafeState(raw)
		const cleared = { ...state, plugins: {}, assets: {} }
		fsNode.writeFileSync(statePath, JSON.stringify(cleared, null, 2) + '\n', 'utf8')
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
	}
}

export function cleanCommand(): Command {
	return new Command('clean')
		.description('Remove the asset store')
		.addOption(new Option('--state', 'Also clear plugins and assets from state JSON'))
		.addOption(new Option('--scope <scope>', 'global or project').choices(['global', 'project']).default('global'))
		.option('--root <path>', 'Project root (for --scope project)')
		.action((opts: { state?: boolean; scope: string; root?: string }) => {
			const storePath = opts.scope === 'project' ? projectStorePath(resolveRoot(opts.root)) : globalStorePath()

			removeStore(storePath)
			process.stdout.write(`Removed ${storePath}\n`)

			if (opts.state) {
				clearStateIndex(globalStatePath())
				process.stdout.write('Cleared plugins and assets from state JSON\n')
			}
		})
}
