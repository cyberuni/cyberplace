import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields } from '../output.js'
import { findCrews } from './lib.js'
import { renderTavernPage } from './render.js'

export function tavernCommand(): Command {
	const cmd = new Command('tavern')
		.description('Browse and install crews (persona-gateway catalog entries tagged "crew")')
		.argument('[query...]', 'Free-text filter over the crew roster')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(async (queryWords: string[], opts: { root?: string }) => {
			const query = queryWords.join(' ')
			const crews = await findCrews(resolveRoot(opts.root), query)

			output(crews, () => {
				if (crews.length === 0) {
					console.log(query ? `No crews matched "${query}".` : 'No crews found in the tavern.')
					return
				}
				console.log(query ? `Crews matching "${query}":` : 'Crews available in the tavern:')
				for (const crew of crews) {
					const title = crew.type === 'repo' ? crew.repo : `${crew.repo}#${crew.skill}`
					console.log(`\n- ${title}`)
					console.log(`  ${crew.summary}`)
					console.log(`  Install: ${crew.installCommand}`)
				}
			})
		})

	cmd
		.command('render')
		.description('Regenerate the Tavern website page crew roster from the resolved catalog')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((_opts: { root?: string }, command: Command) => {
			// The parent `tavern` command also declares --root; merge globals so the flag
			// resolves whether it lands on the parent or this subcommand.
			const merged = command.optsWithGlobals() as { root?: string }
			const result = renderTavernPage(resolveRoot(merged.root))
			output(result, () => printFields({ pagePath: result.pagePath, changed: String(result.changed) }))
		})

	return cmd
}
