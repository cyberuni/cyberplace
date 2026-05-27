import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields, printTable } from '../output.js'
import { inspectSkillsRepo } from './inspect.js'
import { findAwesomeSkills } from './lib.js'
import { renderAwesomeList } from './render.js'
import { listSources, mutateSources, resolveLayer } from './sources.js'

export function awesomeCommand(): Command {
	const cmd = new Command('awesome').description('Awesome skills discovery and list management')

	cmd
		.command('find [query...]')
		.description('Search for awesome skills')
		.option('--limit <n>', 'Maximum results', '8')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(async (queryWords: string[], opts: { limit: string; root?: string }) => {
			const query = queryWords.join(' ')
			const limit = Math.max(1, Number(opts.limit) || 8)
			const results = (await findAwesomeSkills(resolveRoot(opts.root), query)).slice(0, limit)

			output(results, () => {
				if (results.length === 0) {
					console.log(query ? `No awesome skill matches for "${query}".` : 'No awesome skill entries found.')
					return
				}
				console.log(query ? `Awesome skill matches for "${query}":` : 'Awesome skill recommendations:')
				for (const result of results) {
					const title = result.type === 'repo' ? result.repo : `${result.repo}#${result.skill}`
					console.log(`\n- ${title} (catalog ${result.kind}, ${result.trust})`)
					console.log(`  ${result.summary}`)
					console.log(`  Why recommended: ${result.why_recommended}`)
					if (result.reasons.length > 0) console.log(`  Match: ${result.reasons.join('; ')}`)
					if (result.corroborationCount > 1)
						console.log(`  Also recommended by ${result.corroborationCount - 1} other source(s).`)
					console.log(`  Install: ${result.installCommand}`)
				}
			})
		})

	cmd
		.command('inspect <repo>')
		.description('Inspect skills in a GitHub repo')
		.option('--query <term>', 'Filter skills by term')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(async (repo: string, opts: { query?: string; root?: string }) => {
			const skills = await inspectSkillsRepo(repo, resolveRoot(opts.root))
			const filtered = opts.query
				? skills.filter((s) =>
						`${s.directory} ${s.name} ${s.description}`.toLowerCase().includes(opts.query!.toLowerCase()),
					)
				: skills

			output(filtered, () => {
				console.log(`${repo} has ${skills.length} public skill(s).`)
				for (const skill of filtered) console.log(`- ${skill.directory}: ${skill.description}`)
			})
		})

	cmd
		.command('render')
		.description('Render awesome-skills.json into readme.md')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string }) => {
			const result = renderAwesomeList(resolveRoot(opts.root))
			output(result, () => printFields({ readmePath: result.readmePath, changed: String(result.changed) }))
		})

	const sources = new Command('sources').description('Manage awesome skill source lists')

	sources
		.command('list')
		.description('List effective awesome sources')
		.addOption(ROOT_OPTION)
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string }) => {
			const result = listSources(resolveRoot(opts.root))
			output(result, () => {
				if (result.sources.length === 0) {
					console.log('No awesome sources configured.')
					return
				}
				printTable(result.sources, [
					{ label: 'Repo', get: (s) => s.repo },
					{ label: 'Path', get: (s) => s.path },
					{ label: 'Class', get: (s) => s.sourceClass },
				])
			})
		})

	for (const subcmd of ['add', 'remove', 'disable', 'enable'] as const) {
		sources
			.command(`${subcmd} <repo>`)
			.description(`${subcmd.charAt(0).toUpperCase() + subcmd.slice(1)} an awesome source`)
			.requiredOption('--layer <layer>', 'Layer: local | repo | global')
			.option('--path <path>', 'JSON file path in the repo', 'awesome-skills.json')
			.addOption(ROOT_OPTION)
			.option('--format <format>', 'Output format: json or text (default: text)')
			.addOption(new Option('--json').hideHelp())
			.action((repo: string, opts: { layer: string; path: string; root?: string }) => {
				try {
					const layer = resolveLayer(opts.layer)
					const result = mutateSources(subcmd, resolveRoot(opts.root), layer, repo, opts.path)
					output(result, () => {
						console.log(result.message)
						if (result.defaultDisabled)
							console.log('Note: this disables the built-in default source for the current repo as well.')
					})
				} catch (err) {
					process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
					process.exit(1)
				}
			})
	}

	cmd.addCommand(sources)

	return cmd
}
