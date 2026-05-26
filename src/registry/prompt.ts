import { createInterface } from 'node:readline/promises'

export type RlInterface = ReturnType<typeof createInterface>

export function isInteractive(): boolean {
	return process.stdin.isTTY === true && process.stdout.isTTY === true
}

export function createRl(): RlInterface {
	return createInterface({ input: process.stdin, output: process.stdout })
}

export interface SelectItem {
	value: string
	label: string
	hint?: string
	group?: string
}

export async function promptSkillSelect(rl: RlInterface, items: SelectItem[], source: string): Promise<string[]> {
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

	const answer = await rl.question('Select skills (numbers comma-separated, or "all") [all]: ')
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

export async function promptScopeSelect(rl: RlInterface): Promise<'project' | 'global'> {
	console.log('\nInstall scope:')
	console.log('  [p] project  Install in current directory (committed with project)')
	console.log('  [g] global   Install in home directory (available across all projects)')
	const answer = await rl.question('Choose [p]: ')
	const trimmed = answer.trim().toLowerCase()
	return trimmed === 'g' || trimmed === 'global' ? 'global' : 'project'
}
