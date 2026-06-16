import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command, Option } from 'commander'
import { globalStorePath } from '../asset-store/asset-store.js'
import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printTable } from '../output.js'
import { emptyState, mergeSafeState } from '../state/state.js'
import { realGovernanceFs } from './fs.js'
import { listGovernances, showGovernance } from './governance.js'

function readGlobalState() {
	const p = path.join(os.homedir(), '.agents', 'universal-plugin.json')
	try {
		return mergeSafeState(JSON.parse(fsNode.readFileSync(p, 'utf8')))
	} catch {
		return emptyState()
	}
}

export function governanceCommand(): Command {
	const cmd = new Command('governance').description('Manage plugin governances').helpCommand(false)

	cmd
		.command('show <name>')
		.description('Show a governance by name')
		.addOption(ROOT_OPTION)
		.addOption(new Option('--json').hideHelp())
		.action((name: string, opts: { root?: string }) => {
			const result = showGovernance(name, resolveRoot(opts.root), realGovernanceFs, {
				state: readGlobalState(),
				globalStorePath: globalStorePath(),
			})
			if (!result) {
				process.stderr.write(`Governance "${name}" not found\n`)
				process.exit(1)
			}
			output(result, () => {
				process.stdout.write(result.content)
			})
		})

	cmd
		.command('list')
		.description('List available governances')
		.addOption(ROOT_OPTION)
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string }) => {
			const entries = listGovernances(resolveRoot(opts.root), realGovernanceFs)
			output(entries, () => {
				printTable(entries, [
					{ label: 'name', get: (e) => e.name },
					{ label: 'scope', get: (e) => e.scope },
				])
			})
		})

	return cmd
}
