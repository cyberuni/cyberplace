import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output } from '../output.js'
import { readCrewPlugins } from './plugins.js'

export function tavernCommand(): Command {
	const cmd = new Command('tavern')
		.description('Browse and recruit crews from the cyberplace marketplace')
		.argument('[query...]', 'Free-text filter over the crew roster')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((queryWords: string[], opts: { root?: string }) => {
			const query = queryWords.join(' ')
			const crews = readCrewPlugins(resolveRoot(opts.root), query || undefined).map((crew) => ({
				name: crew.name,
				description: crew.description,
				source: crew.source,
				tags: crew.tags,
				recruit: crew.recruit,
			}))

			output(crews, () => {
				if (crews.length === 0) {
					console.log(query ? `No crews matched "${query}".` : 'No crews found in the tavern.')
					return
				}
				console.log(query ? `Crews matching "${query}":` : 'Crews available in the tavern:')
				for (const crew of crews) {
					console.log(`\n- ${crew.name}`)
					console.log(`  ${crew.description}`)
					console.log(`  Recruit: ${crew.recruit}`)
				}
			})
		})

	return cmd
}
