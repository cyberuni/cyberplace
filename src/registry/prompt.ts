import * as rl from 'node:readline'
import { createInterface } from 'node:readline/promises'

export type RlInterface = ReturnType<typeof createInterface>

export class CancelError extends Error {
	constructor() {
		super('cancelled')
		this.name = 'CancelError'
	}
}

export function isInteractive(): boolean {
	return process.stdin.isTTY === true && process.stdout.isTTY === true
}

export function createRl(): RlInterface {
	return createInterface({ input: process.stdin, output: process.stdout })
}

async function questionWithEsc(iface: RlInterface, prompt: string): Promise<string> {
	if (!process.stdin.isTTY) {
		return iface.question(prompt)
	}

	rl.emitKeypressEvents(process.stdin, iface as unknown as rl.Interface)
	const stdin = process.stdin as NodeJS.ReadStream & { isRaw?: boolean }
	const wasRaw = stdin.isRaw ?? false
	if (!wasRaw) stdin.setRawMode(true)

	return new Promise((resolve, reject) => {
		let done = false

		const finish = (fn: () => void) => {
			if (done) return
			done = true
			if (!wasRaw) stdin.setRawMode(false)
			stdin.removeListener('keypress', onKeypress)
			fn()
		}

		const onKeypress = (_: unknown, key: { name?: string; ctrl?: boolean } | undefined) => {
			if (key?.name === 'escape') {
				finish(() => {
					iface.close()
					reject(new CancelError())
				})
			} else if (key?.ctrl && key?.name === 'c') {
				finish(() => {
					iface.close()
					process.exit(0)
				})
			}
		}

		stdin.on('keypress', onKeypress)

		iface.question(prompt).then(
			(answer) => finish(() => resolve(answer)),
			(err) => {
				if (!done) finish(() => reject(err))
			},
		)
	})
}

export interface SelectItem {
	value: string
	label: string
	hint?: string
	group?: string
}

export async function promptSkillSelect(iface: RlInterface, items: SelectItem[], source: string): Promise<string[]> {
	console.log(`\nAvailable skills from ${source}:\n`)

	const groups = new Map<string, SelectItem[]>()
	const ungrouped: SelectItem[] = []
	for (const item of items) {
		if (item.group) {
			if (!groups.has(item.group)) groups.set(item.group, [])
			groups.get(item.group)!.push(item)
		} else {
			ungrouped.push(item)
		}
	}

	let i = 1
	const indexMap = new Map<number, string>()

	const printItem = (item: SelectItem) => {
		const label = item.label.padEnd(28)
		const hint = item.hint ? `  ${item.hint}` : ''
		console.log(`    [${i}] ${label}${hint}`)
		indexMap.set(i, item.value)
		i++
	}

	for (const [groupName, groupItems] of groups) {
		console.log(`  ${groupName}`)
		for (const item of groupItems) printItem(item)
		console.log()
	}

	if (ungrouped.length > 0) {
		if (groups.size > 0) console.log('  other')
		for (const item of ungrouped) printItem(item)
		console.log()
	}

	const answer = await questionWithEsc(iface, 'Select skills (numbers comma-separated, or "all") [all]: ')
	const trimmed = answer.trim().toLowerCase()

	if (!trimmed || trimmed === 'all') return items.map((item) => item.value)

	const selected: string[] = []
	for (const part of trimmed.split(',')) {
		const num = Number.parseInt(part.trim(), 10)
		const value = indexMap.get(num)
		if (value && !selected.includes(value)) selected.push(value)
	}
	return selected
}

export async function promptScopeSelect(iface: RlInterface): Promise<'project' | 'global'> {
	console.log('\nInstall scope:')
	console.log('  [p] project  Install in current directory (committed with project)')
	console.log('  [g] global   Install in home directory (available across all projects)')
	const answer = await questionWithEsc(iface, 'Choose [p]: ')
	const trimmed = answer.trim().toLowerCase()
	return trimmed === 'g' || trimmed === 'global' ? 'global' : 'project'
}

export async function promptUpdateScopeSelect(iface: RlInterface): Promise<'project' | 'global' | 'both'> {
	console.log('\nUpdate scope:')
	console.log('  [p] project  Update skills in current directory')
	console.log('  [g] global   Update skills in home directory')
	console.log('  [b] both     Update project and global skills')
	const answer = await questionWithEsc(iface, 'Choose [b]: ')
	const trimmed = answer.trim().toLowerCase()
	if (trimmed === 'p' || trimmed === 'project') return 'project'
	if (trimmed === 'g' || trimmed === 'global') return 'global'
	return 'both'
}
