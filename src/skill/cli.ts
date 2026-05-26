import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields, printTable } from '../output.js'
import { listSkills } from './list.js'
import { repairPrivateSkills, validatePrivateSkills } from './repair.js'
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
		.command('validate-private')
		.description('Validate repo-private skills under .agents/skills')
		.addOption(ROOT_OPTION)
		.option('--json', 'Output raw JSON')
		.action((opts: { root?: string }) => {
			const result = validatePrivateSkills(resolveRoot(opts.root))
			output(result, () => {
				printFields({
					ok: String(result.ok),
					issues: String(result.issues.length),
				})
				for (const issue of result.issues) {
					console.log(`- ${issue.skill}: ${issue.issue}${issue.details ? ` (${issue.details})` : ''}`)
				}
			})
			if (!result.ok) process.exit(1)
		})

	cmd
		.command('repair-private')
		.description('Repair repo-private skills under .agents/skills')
		.addOption(ROOT_OPTION)
		.option('--json', 'Output raw JSON')
		.action((opts: { root?: string }) => {
			const result = repairPrivateSkills(resolveRoot(opts.root))
			output(result, () => {
				printFields({
					changed: String(result.changed),
					actions: String(result.actions.length),
				})
				for (const action of result.actions) {
					console.log(`- ${action.skill}: ${action.action}${action.details ? ` (${action.details})` : ''}`)
				}
			})
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
