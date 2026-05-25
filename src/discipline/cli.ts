import { Command } from 'commander'

import { output } from '../output.js'
import { listDisciplines, loadDiscipline } from './load.js'

export function disciplineCommand(): Command {
	const cmd = new Command('discipline').description('Agent-tool discipline documents (version-pinned)')

	cmd
		.command('list')
		.description('List available disciplines')
		.option('--json', 'Output raw JSON')
		.action(() => {
			const disciplines = listDisciplines()
			output({ disciplines: disciplines.map(({ name, title }) => ({ name, title })) }, () => {
				if (disciplines.length === 0) {
					console.log('(none)')
					return
				}
				for (const { name } of disciplines) {
					console.log(name)
				}
			})
		})

	cmd
		.command('show <name>')
		.description('Show discipline body (agents: read stdout)')
		.option('--json', 'Output structured JSON with name, title, and body')
		.action((name: string) => {
			try {
				const discipline = loadDiscipline(name)
				output(discipline, () => {
					process.stdout.write(discipline.body.endsWith('\n') ? discipline.body : `${discipline.body}\n`)
				})
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
