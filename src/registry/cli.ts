import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { isAutomatedOutput, output, printTable } from '../output.js'
import { addSkill } from './add.js'
import {
	addProvider,
	listProviders,
	matchProvider,
	readConfig,
	removeProvider,
	validateProviderType,
} from './config.js'
import { findSkills, findSkillsInRepo, printFindResults } from './find.js'
import { readLock } from './lock.js'
import { mapSkillsToPlugins } from './marketplace.js'
import { migrate } from './migrate.js'
import {
	CancelError,
	createRl,
	isInteractive,
	promptRemoveScopeSelect,
	promptScopeSelect,
	promptSkillSelect,
	promptUpdateScopeSelect,
} from './prompt.js'
import { fetchMarketplace, listRepoSkills } from './remote.js'
import { removeSkill } from './remove.js'
import type { Scope } from './scope.js'
import { isRepoSpec, parseSpec } from './spec.js'
import { updateAllSkills, updateSkill } from './update.js'

function resolveScope(global?: boolean): Scope {
	return global ? 'global' : 'project'
}

export function addCommand(): Command {
	return new Command('add')
		.description('Install a skill from a GitHub repo (org/repo[:skill]) or npm package')
		.argument('<spec>', 'Repo spec (org/repo[:skill]) or npm package name')
		.addOption(ROOT_OPTION)
		.option('--global', 'Install to user global skills (~/.agents/skills)')
		.option('--project', 'Install to project skills (.agents/skills)')
		.option('--branch <branch>', 'Git branch to fetch from', 'main')
		.option('--yes', 'Install all skills without prompting')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(
			async (
				spec: string,
				opts: {
					root?: string
					global?: boolean
					project?: boolean
					branch?: string
					yes?: boolean
					format?: string
					json?: boolean
				},
			) => {
				const root = resolveRoot(opts.root)
				const branch = opts.branch ?? 'main'
				const parsedSpec = parseSpec(spec)
				const scopeExplicit = opts.global || opts.project
				const machineOutput = isAutomatedOutput() || opts.json
				const interactive = isInteractive() && !opts.yes && !machineOutput && !scopeExplicit

				// Interactive flow: repo spec with no specific skill, running in a TTY
				if (isRepoSpec(parsedSpec) && !parsedSpec.skill && interactive) {
					const config = readConfig(root, 'project')
					const provider = matchProvider(config.providers ?? [], `${parsedSpec.owner}/${parsedSpec.repo}`)

					const [skills, marketplace] = await Promise.all([
						listRepoSkills(provider, parsedSpec.owner, parsedSpec.repo, branch),
						fetchMarketplace(provider, parsedSpec.owner, parsedSpec.repo, branch),
					])

					const pluginMap = marketplace ? mapSkillsToPlugins(marketplace) : new Map<string, string>()
					const items = skills.map((s) => ({
						value: s.name,
						label: s.name,
						group: pluginMap.get(s.name),
					}))

					const rl = createRl()
					let selectedSkills: string[]
					let addScope: 'project' | 'global' | 'both'
					try {
						selectedSkills = await promptSkillSelect(rl, items, `${parsedSpec.owner}/${parsedSpec.repo}`)
						addScope = await promptScopeSelect(rl)
					} catch (err) {
						if (err instanceof CancelError) {
							console.log('\nCancelled.')
							return
						}
						throw err
					} finally {
						rl.close()
					}

					if (selectedSkills.length === 0) {
						console.log('No skills selected.')
						return
					}

					const scopes: Array<'project' | 'global'> = addScope === 'both' ? ['project', 'global'] : [addScope]
					for (const s of scopes) {
						const result = await addSkill(spec, { root, scope: s, branch, skills: selectedSkills })
						output(result, () => {
							console.log(`Installed ${result.installed.length} skill(s) from ${result.spec}:`)
							for (const r of result.installed) {
								console.log(`  + ${r.name}`)
							}
							for (const sk of result.skippedSymlinks) {
								console.warn(`  ! ${sk.name}: skipped symlink — ${sk.path} is a real directory`)
							}
							for (const sk of result.skippedPackageManaged) {
								const installHint = sk.packageName ? `\n    skills add ${sk.packageName}` : ''
								console.warn(`  ! ${sk.name}: package-managed skill — install via npm instead:${installHint}`)
							}
						})
					}
					return
				}

				// Non-interactive / specific skill / npm package path
				const scope = resolveScope(opts.global)
				const result = await addSkill(spec, { root, scope, branch })
				output(result, () => {
					console.log(`Installed ${result.installed.length} skill(s) from ${result.spec}:`)
					for (const s of result.installed) {
						console.log(`  + ${s.name}`)
					}
					for (const sk of result.skippedSymlinks) {
						console.warn(`  ! ${sk.name}: skipped symlink — ${sk.path} is a real directory`)
					}
					for (const sk of result.skippedPackageManaged) {
						const installHint = sk.packageName ? `\n    skills add ${sk.packageName}` : ''
						console.warn(`  ! ${sk.name}: package-managed skill — install via npm instead:${installHint}`)
					}
				})
				if (result.installed.length === 0 && result.skippedPackageManaged.length > 0) {
					process.exitCode = 1
				}
			},
		)
}

export function removeCommand(): Command {
	return new Command('remove')
		.description('Remove an installed skill')
		.argument('[name]', 'Skill name to remove')
		.addOption(ROOT_OPTION)
		.option('--global', 'Remove from global skills')
		.option('--project', 'Remove from project skills')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(
			async (
				name: string | undefined,
				opts: { root?: string; global?: boolean; project?: boolean; format?: string; json?: boolean },
			) => {
				const root = resolveRoot(opts.root)
				const scopeExplicit = opts.global || opts.project
				const machineOutput = isAutomatedOutput() || opts.json
				const interactive = isInteractive() && !machineOutput && !scopeExplicit && !name

				if (interactive) {
					const rl = createRl()
					let removeScope: 'project' | 'global' | 'both'
					let selectedSkills: string[]
					try {
						removeScope = await promptRemoveScopeSelect(rl)

						const scopes: Array<'project' | 'global'> = removeScope === 'both' ? ['project', 'global'] : [removeScope]
						const items = scopes.flatMap((s) =>
							Object.keys(readLock(root, s).skills).map((n) => ({
								value: `${s}:${n}`,
								label: n,
								group: scopes.length > 1 ? s : undefined,
							})),
						)

						if (items.length === 0) {
							console.log('No skills installed.')
							return
						}

						selectedSkills = await promptSkillSelect(rl, items, 'installed skills')
					} catch (err) {
						if (err instanceof CancelError) {
							console.log('\nCancelled.')
							return
						}
						throw err
					} finally {
						rl.close()
					}

					if (selectedSkills.length === 0) {
						console.log('No skills selected.')
						return
					}

					const results = selectedSkills.map((sv) => {
						const colonIdx = sv.indexOf(':')
						const scope = sv.slice(0, colonIdx) as 'project' | 'global'
						const skillName = sv.slice(colonIdx + 1)
						return removeSkill(skillName, { root, scope })
					})
					output(results, () => {
						for (const r of results) {
							console.log(r.removed ? `  - ${r.name}` : `  ! ${r.name}: ${r.message}`)
						}
					})
					if (results.some((r) => !r.removed)) process.exit(1)
					return
				}

				if (!name) {
					console.error('Error: skill name required in non-interactive mode')
					process.exit(1)
				}
				const scope = resolveScope(opts.global)
				const result = removeSkill(name, { root, scope })
				output(result, () => console.log(result.message))
				if (!result.removed) process.exit(1)
			},
		)
}

export function updateCommand(): Command {
	return new Command('update')
		.description('Update an installed skill (or all skills if name omitted)')
		.argument('[name]', 'Skill name to update; omit to update all')
		.addOption(ROOT_OPTION)
		.option('--global', 'Update in global skills')
		.option('--project', 'Update in project skills')
		.option('--branch <branch>', 'Git branch to fetch from', 'main')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(
			async (
				name: string | undefined,
				opts: { root?: string; global?: boolean; project?: boolean; branch?: string; format?: string; json?: boolean },
			) => {
				const root = resolveRoot(opts.root)
				const scopeExplicit = opts.global || opts.project
				const machineOutput = isAutomatedOutput() || opts.json
				const interactive = isInteractive() && !machineOutput && !scopeExplicit && !name

				if (interactive) {
					const rl = createRl()
					let updateScope: 'project' | 'global' | 'both'
					try {
						updateScope = await promptUpdateScopeSelect(rl)
					} catch (err) {
						if (err instanceof CancelError) {
							console.log('\nCancelled.')
							return
						}
						throw err
					} finally {
						rl.close()
					}

					const scopes: Array<'project' | 'global'> = updateScope === 'both' ? ['project', 'global'] : [updateScope]
					const allResults: Array<{ scope: string; results: Awaited<ReturnType<typeof updateAllSkills>> }> = []
					for (const s of scopes) {
						const results = await updateAllSkills({ root, scope: s })
						allResults.push({ scope: s, results })
					}
					output(allResults, () => {
						for (const { scope: s, results } of allResults) {
							if (scopes.length > 1) console.log(`\n[${s}]`)
							for (const r of results) console.log(`${r.updated ? '+' : r.skipped ? '~' : '!'} ${r.name}: ${r.message}`)
						}
					})
					return
				}

				const scope = resolveScope(opts.global)
				if (name) {
					const result = await updateSkill(name, { root, scope })
					output(result, () => console.log(result.message))
					if (!result.updated && !result.skipped) process.exit(1)
				} else {
					const results = await updateAllSkills({ root, scope })
					output(results, () => {
						for (const r of results) console.log(`${r.updated ? '+' : r.skipped ? '~' : '!'} ${r.name}: ${r.message}`)
					})
				}
			},
		)
}

export function listCommand(): Command {
	return new Command('list')
		.description('List installed skills from the lock file')
		.addOption(ROOT_OPTION)
		.option('--global', 'List global skills')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string; global?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const lock = readLock(root, scope)
			const skills = Object.entries(lock.skills).map(([name, entry]) => ({
				name,
				source: entry.source,
				sourceType: entry.sourceType,
			}))
			output(skills, () =>
				printTable(skills, [
					{ label: 'name', get: (s) => s.name },
					{ label: 'source', get: (s) => s.source },
					{ label: 'type', get: (s) => s.sourceType },
				]),
			)
		})
}

export function findCommand(): Command {
	return new Command('find')
		.description('Search for available skills (default: cyberuni/cyber-skills)')
		.argument('[query]', 'Search term')
		.addOption(ROOT_OPTION)
		.option('--in <repo>', 'Search a specific org/repo (e.g., --in myorg/my-skills)')
		.option('--limit <n>', 'Maximum number of results to return (default: 10)', Number)
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action(async (query: string | undefined, opts: { root?: string; in?: string; limit?: number }) => {
			const root = resolveRoot(opts.root)
			const q = query ?? ''
			const results = opts.in
				? await findSkillsInRepo(opts.in, q, { limit: opts.limit })
				: await findSkills(q, { root, limit: opts.limit })
			output(results, () => printFindResults(results, q))
		})
}

export function migrateCommand(): Command {
	return new Command('migrate')
		.description('Migrate skills-lock.json (npx skills) to .agents/cyber-skills-lock.json')
		.addOption(ROOT_OPTION)
		.option('--global', 'Migrate to global lock')
		.option('--dry-run', 'Preview without writing files')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string; global?: boolean; dryRun?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const result = migrate({ root, scope, dryRun: opts.dryRun })
			output(result, () => {
				console.log(`Source: ${result.sourcePath}`)
				console.log(`Dest:   ${result.destPath}`)
				console.log(`Migrated: ${result.migratedCount}  Skipped: ${result.skippedCount}`)
				if (opts.dryRun) console.log('(dry-run -- no files written)')
				for (const e of result.entries) {
					const tag = e.status === 'migrated' ? '+' : 'o'
					const suffix = e.reason ? ` (${e.reason})` : ''
					console.log(`  ${tag} ${e.name}${suffix}`)
				}
			})
		})
}

export function configCommand(): Command {
	const cmd = new Command('config').description('Manage cyber-skills configuration')
	const providerCmd = new Command('provider').description('Manage skill source providers')

	providerCmd
		.command('add <url>')
		.description('Add a custom skill provider (e.g., https://gitlab.mycompany.com)')
		.addOption(ROOT_OPTION)
		.option('--global', 'Add to global config')
		.option('--type <type>', 'Provider type: github|gitlab|custom')
		.option('--match <glob>', 'Org/repo glob to auto-route to this provider (e.g., "mycompany/*")')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((url: string, opts: { root?: string; global?: boolean; type?: string; match?: string }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const resolvedType = opts.type ? validateProviderType(opts.type) : undefined
			addProvider(root, scope, url, resolvedType, opts.match)
			const providers = listProviders(root, scope)
			output({ providers }, () =>
				console.log(`Added provider: ${url.replace(/\/$/, '')}${opts.match ? ` (match: ${opts.match})` : ''}`),
			)
		})

	providerCmd
		.command('remove <url>')
		.description('Remove a skill provider')
		.addOption(ROOT_OPTION)
		.option('--global', 'Remove from global config')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((url: string, opts: { root?: string; global?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			removeProvider(root, scope, url)
			output({ removed: url }, () => console.log(`Removed provider: ${url.replace(/\/$/, '')}`))
		})

	providerCmd
		.command('list')
		.description('List configured providers')
		.addOption(ROOT_OPTION)
		.option('--global', 'List global providers')
		.option('--format <format>', 'Output format: agent, json, or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.action((opts: { root?: string; global?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const providers = listProviders(root, scope)
			output({ providers }, () =>
				printTable(providers, [
					{ label: 'url', get: (p) => p.url },
					{ label: 'type', get: (p) => p.type },
					{ label: 'match', get: (p) => p.match ?? '' },
				]),
			)
		})

	cmd.addCommand(providerCmd)
	return cmd
}
