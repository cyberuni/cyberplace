import { Command, Option } from 'commander'

import { output } from '../output.js'
import { listGovernances, loadGovernance } from './load.js'

export function governanceCommand(): Command {
	const cmd = new Command('governance').description('Agent-tool governance documents (version-pinned)')

	cmd
		.command('list')
		.description('List available governances')
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(() => {
			const governances = listGovernances()
			output({ governances: governances.map(({ name, title }) => ({ name, title })) }, () => {
				if (governances.length === 0) {
					console.log('(none)')
					return
				}
				for (const { name } of governances) {
					console.log(name)
				}
			})
		})

	cmd
		.command('show <name>')
		.description('Show governance body (agents: read stdout)')
		.option('--format <format>', 'Output format: json (structured with name, title, body) or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((name: string) => {
			try {
				const governance = loadGovernance(name)
				output(governance, () => {
					process.stdout.write(governance.body.endsWith('\n') ? governance.body : `${governance.body}\n`)
				})
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
