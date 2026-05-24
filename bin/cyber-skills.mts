#!/usr/bin/env node --experimental-strip-types
import * as fs from 'node:fs'
import * as path from 'node:path'

const [, , command, ...args] = process.argv

if (!command) {
	process.stderr.write('Usage: cyber-skills <command> [args]\n\nCommands:\n  run-hook <name>  Run a hook by name\n')
	process.exit(1)
}

if (command === 'run-hook') {
	const hookName = args[0]
	if (!hookName) {
		process.stderr.write('Usage: cyber-skills run-hook <name>\n')
		process.exit(1)
	}

	const hookFile = path.resolve('hooks', `${hookName}.mts`)
	if (!fs.existsSync(hookFile)) {
		process.stderr.write(`Hook not found: ${hookName}\n`)
		process.exit(1)
	}

	const { default: run } = await import(hookFile)
	await run()
} else {
	process.stderr.write(`Unknown command: ${command}\nRun cyber-skills without arguments for usage.\n`)
	process.exit(1)
}
