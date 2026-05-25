import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields, printTable } from '../output.js'
import { listSkills } from './list.js'
import { findSkillSource } from './source.js'

export function skillCommand(): Command {
	const cmd = new Command('skill').description('Skill utilities')

	cmd
		.command('list')
		.description('List skills from the repo, global install, and cyber-skills package')
		.addOption(ROOT_OPTION)
		.option('--grep <pattern>', 'Glob-style filter on skill name (for example init-*)')
		.option('--json', 'Output raw JSON')
		.action((opts: { root?: string; grep?: string }) => {
			const skills = listSkills(resolveRoot(opts.root), { grep: opts.grep })
			output(skills, () =>
				printTable(skills, [
					{ label: 'name', get: (s) => s.name },
					{ label: 'foundIn', get: (s) => s.foundIn },
					{ label: 'description', get: (s) => s.description },
				]),
			)
		})

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
