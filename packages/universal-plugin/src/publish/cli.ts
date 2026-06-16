import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields } from '../output.js'
import { realSyncVersionFs } from './fs.js'
import { syncVersion } from './sync-version.js'

export function publishCommand(): Command {
	const cmd = new Command('publish').description('Prepare plugin for publishing').helpCommand(false)

	cmd
		.command('sync-version')
		.description('Sync version from packagePath/package.json into .plugin/plugin.json')
		.addOption(ROOT_OPTION)
		.action((opts: { root?: string }) => {
			try {
				const result = syncVersion(resolveRoot(opts.root), realSyncVersionFs)
				output(result, () => {
					printFields({ version: result.version, manifest: result.manifestPath })
				})
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
