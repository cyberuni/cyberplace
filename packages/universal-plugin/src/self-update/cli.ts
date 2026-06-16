import * as fsNode from 'node:fs'
import * as os from 'node:os'
import { Command } from 'commander'
import { loadRegistry } from '../vendor-registry/fs.js'
import { realSelfUpdateFs } from './fs.js'
import { runSelfUpdate } from './self-update.js'

export function selfUpdateCommand(): Command {
	return new Command('self-update')
		.description('Update universal-plugin version pin in universal-plugin hook files')
		.argument('<version>', 'Target version (e.g. 1.5.0)')
		.action((toVersion: string) => {
			const registry = loadRegistry()
			const hookFilePaths = Object.values(registry)
				.map((v) => v.hookGlob)
				.filter((g): g is string => g !== null)
				.map((g) => g.replace('~', os.homedir()))
				.filter((p) => {
					try {
						fsNode.accessSync(p)
						return true
					} catch {
						return false
					}
				})
			const { updatedCount } = runSelfUpdate({
				toVersion,
				fs: realSelfUpdateFs(hookFilePaths),
			})
			process.stdout.write(`Updated ${updatedCount} hook file(s).\n`)
		})
}
