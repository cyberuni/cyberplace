#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function usage() {
	process.stderr.write(`Usage: cyber-skills <command> [args]

Commands:
  run-hook <name>              Run a runtime hook by name
  register-hooks --set <set>   Register agent hooks (init | commit-discipline)
  inject-commit-discipline     Merge ## Commit Discipline into AGENTS.md
  skill-source <name>          Find the source repo of an installed skill

Options:
  --root <path>                Repo root (default: cwd)
  --dry-run                    Preview without writing
  --verbose                    Human-readable status on stderr
  --commit-skill <name>        Commit helper skill name (inject-commit-discipline)
`)
}

const [, , command, ...args] = process.argv

if (!command) {
	usage()
	process.exit(1)
}

function parseCommonArgs(argv: string[]) {
	return {
		dryRun: argv.includes('--dry-run'),
		verbose: argv.includes('--verbose'),
		root: (() => {
			const i = argv.indexOf('--root')
			return i !== -1 ? argv[i + 1]! : process.cwd()
		})(),
	}
}

if (command === 'run-hook') {
	const hookName = args[0]
	if (!hookName) {
		process.stderr.write('Usage: cyber-skills run-hook <name>\n')
		process.exit(1)
	}

	const hookFile = path.join(packageRoot, 'hooks', 'runtime', `${hookName}.mjs`)
	if (!fs.existsSync(hookFile)) {
		process.stderr.write(`Hook not found: ${hookName}\n`)
		process.exit(1)
	}

	const { default: run } = await import(pathToFileURL(hookFile).href)
	await run()
} else if (command === 'register-hooks') {
	const { dryRun, verbose, root } = parseCommonArgs(args)
	const setIdx = args.indexOf('--set')
	const set = setIdx !== -1 ? args[setIdx + 1] : undefined

	if (!set || (set !== 'init' && set !== 'commit-discipline')) {
		process.stderr.write('Usage: cyber-skills register-hooks --set init|commit-discipline [--root <path>]\n')
		process.exit(1)
	}

	const { registerHooksForSet } = await import(
		pathToFileURL(path.join(packageRoot, 'hooks', 'register-agent-hooks.mjs')).href
	)
	const results = registerHooksForSet(set, { root, dryRun })

	if (verbose) {
		if (dryRun) process.stderr.write('Dry run — no files written.\n\n')
		for (const r of results) {
			process.stderr.write(`${r.agent} | ${r.hook} | ${r.status}\n`)
		}
	}
} else if (command === 'inject-commit-discipline') {
	const { dryRun, verbose, root } = parseCommonArgs(args)
	const skillIdx = args.indexOf('--commit-skill')
	const commitSkill = skillIdx !== -1 ? args[skillIdx + 1] : undefined

	if (!commitSkill) {
		process.stderr.write('Usage: cyber-skills inject-commit-discipline --commit-skill <name>\n')
		process.exit(1)
	}

	const { injectCommitDiscipline } = await import(
		pathToFileURL(path.join(packageRoot, 'hooks', 'inject-commit-discipline.mjs')).href
	)
	try {
		const result = injectCommitDiscipline({ root, commitSkill, dryRun, verbose })
		process.stdout.write(`${JSON.stringify(result)}\n`)
	} catch (err) {
		process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
		process.exit(1)
	}
} else if (command === 'skill-source') {
	const skillName = args.find((a) => !a.startsWith('--'))
	if (!skillName) {
		process.stderr.write('Usage: cyber-skills skill-source <name> [--root <path>]\n')
		process.exit(1)
	}
	const { root } = parseCommonArgs(args)
	const { findSkillSource } = await import(
		pathToFileURL(path.join(packageRoot, 'dist', 'bin', 'skill-source.mjs')).href
	)
	const result = findSkillSource(skillName, root)
	process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
	if (!result.foundIn) process.exit(1)
} else {
	process.stderr.write(`Unknown command: ${command}\n`)
	usage()
	process.exit(1)
}
