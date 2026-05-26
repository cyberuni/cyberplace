import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printTable } from '../output.js'
import { addSkill } from './add.js'
import { addProvider, listProviders, removeProvider, validateProviderType } from './config.js'
import { findSkills, findSkillsInRepo } from './find.js'
import { readLock } from './lock.js'
import { migrate } from './migrate.js'
import { removeSkill } from './remove.js'
import { updateAllSkills, updateSkill } from './update.js'

type Scope = 'project' | 'global'

function resolveScope(global?: boolean): Scope {
	return global ? 'global' : 'project'
}

export function addCommand(): Command {
	return new Command('add')
		.description('Install a skill from a GitHub repo (org/repo[:skill]) or npm package')
		.argument('<spec>', 'Repo spec (org/repo[:skill]) or npm package name')
		.addOption(ROOT_OPTION)
		.option('--global', 'Install to user global skills (~/.agents/skills)')
		.option('--branch <branch>', 'Git branch to fetch from', 'main')
		.option('--json', 'Output raw JSON')
		.action(async (spec: string, opts: { root?: string; global?: boolean; branch?: string }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const result = await addSkill(spec, { root, scope, branch: opts.branch })
			output(result, () => {
				console.log(`Installed ${result.installed.length} skill(s) from ${result.spec}:`)
				for (const s of result.installed) {
					console.log(`  + ${s.name}  ->  ${s.installedAt}`)
				}
			})
		})
}

export function removeCommand(): Command {
	return new Command('remove')
		.description('Remove an installed skill')
		.argument('<name>', 'Skill name to remove')
		.addOption(ROOT_OPTION)
		.option('--global', 'Remove from global skills')
		.option('--json', 'Output raw JSON')
		.action((name: string, opts: { root?: string; global?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const result = removeSkill(name, { root, scope })
			output(result, () => console.log(result.message))
			if (!result.removed) process.exit(1)
		})
}

export function updateCommand(): Command {
	return new Command('update')
		.description('Update an installed skill (or all skills if name omitted)')
		.argument('[name]', 'Skill name to update; omit to update all')
		.addOption(ROOT_OPTION)
		.option('--global', 'Update in global skills')
		.option('--branch <branch>', 'Git branch to fetch from', 'main')
		.option('--json', 'Output raw JSON')
		.action(async (name: string | undefined, opts: { root?: string; global?: boolean; branch?: string }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			if (name) {
				const result = await updateSkill(name, { root, scope })
				output(result, () => console.log(result.message))
				if (!result.updated) process.exit(1)
			} else {
				const results = await updateAllSkills({ root, scope })
				output(results, () => {
					for (const r of results) console.log(`${r.updated ? '+' : '!'} ${r.name}: ${r.message}`)
				})
			}
		})
}

export function listCommand(): Command {
	return new Command('list')
		.description('List installed skills from the lock file')
		.addOption(ROOT_OPTION)
		.option('--global', 'List global skills')
		.option('--json', 'Output raw JSON')
		.action((opts: { root?: string; global?: boolean }) => {
			const root = resolveRoot(opts.root)
			const scope = resolveScope(opts.global)
			const lock = readLock(root, scope)
			const skills = Object.entries(lock.skills).map(([name, entry]) => ({
				name,
				source: entry.source,
				sourceType: entry.sourceType,
				spec: entry.spec,
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
		.option('--json', 'Output raw JSON')
		.action(async (query: string | undefined, opts: { root?: string; in?: string }) => {
			const root = resolveRoot(opts.root)
			const q = query ?? ''
			const results = opts.in ? await findSkillsInRepo(opts.in, q) : await findSkills(q, { root })
			output(results, () =>
				printTable(results, [
					{ label: 'name', get: (r) => r.name },
					{ label: 'source', get: (r) => r.source },
					{ label: 'install', get: (r) => r.installCommand },
				]),
			)
		})
}

export function migrateCommand(): Command {
	return new Command('migrate')
		.description('Migrate skills-lock.json (npx skills) to .agents/cyber-skills-lock.json')
		.addOption(ROOT_OPTION)
		.option('--global', 'Migrate to global lock')
		.option('--dry-run', 'Preview without writing files')
		.option('--json', 'Output raw JSON')
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
		.option('--json', 'Output raw JSON')
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
		.option('--json', 'Output raw JSON')
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
		.option('--json', 'Output raw JSON')
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
