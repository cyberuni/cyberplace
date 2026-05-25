import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

import { parseMarkdownSection } from '../extract-section.js'

export interface InjectInstructionsOptions {
	name?: string
	file?: string
	glob?: string
	extract?: string
	heading?: string
	cwd?: string
}

function emitSessionStartContext(additionalContext: string) {
	const payload = {
		hookSpecificOutput: {
			hookEventName: 'SessionStart',
			additionalContext: additionalContext.trim(),
		},
	}
	process.stdout.write(`${JSON.stringify(payload)}\n`)
}

function readFileContext(filePath: string, cwd: string): string {
	const absolute = join(cwd, filePath)
	return readFileSync(absolute, 'utf8')
}

async function readGlobContext(pattern: string, cwd: string): Promise<string> {
	const matches: string[] = []
	for await (const match of glob(pattern, { cwd })) {
		matches.push(match)
	}
	if (matches.length === 0) return ''

	const parts: string[] = []
	for (const relativePath of matches.sort()) {
		const content = readFileSync(join(cwd, relativePath), 'utf8')
		if (pattern.includes('SKILL.local.md')) {
			const skill = basename(dirname(relativePath))
			parts.push(`### Local augmentation for skill: ${skill}\n\n${content}`)
		} else {
			parts.push(`### ${relativePath}\n\n${content}`)
		}
	}
	return parts.join('\n\n')
}

function readExtractContext(filePath: string, heading: string, cwd: string): string {
	const markdown = readFileSync(join(cwd, filePath), 'utf8')
	return parseMarkdownSection(markdown, heading) ?? ''
}

export default async function runInjectInstructions(options: InjectInstructionsOptions) {
	const cwd = options.cwd ?? process.cwd()
	const modes = [options.file, options.glob, options.extract].filter(Boolean)
	if (modes.length !== 1) {
		process.stderr.write('hook run requires exactly one of --file, --glob, or --extract\n')
		process.exit(1)
	}
	if (options.extract && !options.heading) {
		process.stderr.write('--extract requires --heading\n')
		process.exit(1)
	}

	let context = ''
	if (options.file) {
		context = readFileContext(options.file, cwd)
	} else if (options.glob) {
		context = await readGlobContext(options.glob, cwd)
	} else if (options.extract && options.heading) {
		context = readExtractContext(options.extract, options.heading, cwd)
	}

	if (!context.trim()) return
	emitSessionStartContext(context)
}
