import { Command } from 'commander'

import { output, printFields } from '../output.js'
import { findSkillSource } from './source.js'

export function skillCommand(): Command {
	const cmd = new Command('skill').description('Skill utilities')

	cmd
		.command('source <name>')
		.description('Find the source repo of an installed skill')
		.option('--root <path>', 'Repo root', process.cwd())
		.option('--json', 'Output raw JSON')
		.action((name: string, opts: { root: string }) => {
			const result = findSkillSource(name, opts.root)
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
