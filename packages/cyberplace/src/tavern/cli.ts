import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { renderToonTable } from '../output.js'
import { readCrewPlugins } from './plugins.js'

// Rows beyond this are truncated with a size hint unless --full is passed.
const TRUNCATE_THRESHOLD = 20
// stderr next-step (#9): the natural follow-up after browsing the roster.
const NEXT_STEP = '→ cyberplace add <name>\n'

interface TavernOptions {
	root?: string
	full?: boolean
	format?: string
	json?: boolean
}

export function tavernCommand(): Command {
	const cmd = new Command('tavern')
		.description('Browse and recruit crews from the cyberplace marketplace')
		.argument('[query...]', 'Free-text filter over the crew roster')
		.addOption(ROOT_OPTION)
		.option('--full', 'Print the whole roster without truncation')
		.option('--format <format>', 'Output format: json or toon (default: toon)')
		.addOption(new Option('--json').hideHelp())
		.addHelpText('after', '\nExample:\n  $ cyberplace tavern navigator\n')
		.action((queryWords: string[], opts: TavernOptions) => {
			const query = queryWords.join(' ')
			const crews = readCrewPlugins(resolveRoot(opts.root), query || undefined).map((crew) => ({
				name: crew.name,
				description: crew.description,
				source: crew.source,
				tags: crew.tags,
				recruit: crew.recruit,
			}))

			const format = opts.format ?? (opts.json ? 'json' : 'toon')

			// stdout carries the machine result (payload + aggregate); stderr the
			// human affordance (next-step). --format json is never truncated.
			if (format === 'json') {
				console.log(JSON.stringify(crews, null, 2))
				process.stderr.write(NEXT_STEP)
				return
			}

			// Pre-computed aggregate (#4) + definitive empty state (#5).
			const aggregate = crews.length === 0 ? '0 crews found' : `${crews.length} crew${crews.length === 1 ? '' : 's'}`
			console.log(`summary: ${aggregate}`)

			// Content-first (#8): the bare command shows the roster, not help.
			const truncated = !opts.full && crews.length > TRUNCATE_THRESHOLD
			const rows = truncated ? crews.slice(0, TRUNCATE_THRESHOLD) : crews
			console.log(
				renderToonTable('crews', rows, [
					{ label: 'name', get: (c) => c.name },
					{ label: 'description', get: (c) => c.description },
					{ label: 'recruit', get: (c) => c.recruit },
				]),
			)
			if (truncated) {
				console.log(`… +${crews.length - TRUNCATE_THRESHOLD} lines — rerun with --full`)
			}

			process.stderr.write(NEXT_STEP)
		})

	return cmd
}
