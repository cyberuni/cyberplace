import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields } from '../output.js'
import { findSkillSource } from './source.js'

export function skillCommand(): Command {
	const cmd = new Command('skill').description('Skill utilities')

	cmd
		.command('source <name>')
		.description('Find the source repo of an installed skill')
		.addOption(ROOT_OPTION)
		.option('--json', 'Output raw JSON')
		.action((name: string, opts: { root?: string }) => {
			const result = findSkillSource(name, resolveRoot(opts.root))
			output(result, () =>
				printFields({
					name: result.name,
					source: result.source,
					sourceUrl: result.sourceUrl,
					skillPath: result.skillPath,
					foundIn: result.foundIn,
				}),
			)
			if (!result.foundIn) process.exit(1)
		})

	return cmd
}
