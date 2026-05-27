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

type VisibleRow = { type: 'group'; name: string; items: SelectItem[] } | { type: 'item'; item: SelectItem }

function fuzzyMatch(pattern: string, str: string): boolean {
	if (!pattern) return true
	const p = pattern.toLowerCase()
	const s = str.toLowerCase()
	let pi = 0
	for (let si = 0; si < s.length && pi < p.length; si++) {
		if (s[si] === p[pi]) pi++
	}
	return pi === p.length
}

function buildVisibleRows(items: SelectItem[], filter: string): VisibleRow[] {
	const groups = new Map<string, SelectItem[]>()
	const ungrouped: SelectItem[] = []

	for (const item of items) {
		if (!fuzzyMatch(filter, item.label) && !fuzzyMatch(filter, item.value)) continue
		if (item.group) {
			if (!groups.has(item.group)) groups.set(item.group, [])
			groups.get(item.group)!.push(item)
		} else {
			ungrouped.push(item)
		}
	}

	const rows: VisibleRow[] = []

	for (const [name, groupItems] of groups) {
		rows.push({ type: 'group', name, items: groupItems })
		for (const item of groupItems) {
			rows.push({ type: 'item', item })
		}
	}

	if (ungrouped.length > 0) {
		if (groups.size > 0) {
			rows.push({ type: 'group', name: 'other', items: ungrouped })
		}
		for (const item of ungrouped) {
			rows.push({ type: 'item', item })
		}
	}

	return rows
}

function highlightFuzzy(pattern: string, str: string): string {
	if (!pattern) return str
	const p = pattern.toLowerCase()
	const s = str.toLowerCase()
	let result = ''
	let pi = 0
	for (let si = 0; si < str.length; si++) {
		if (pi < p.length && s[si] === p[pi]) {
			result += `\x1b[1m${str[si]}\x1b[22m`
			pi++
		} else {
			result += str[si]
		}
	}
	return result
}

const VIEWPORT = 10

export async function promptSkillSelect(iface: RlInterface, items: SelectItem[], source: string): Promise<string[]> {
	if (!process.stdin.isTTY) {
		return promptSkillSelectFallback(iface, items, source)
	}

	rl.emitKeypressEvents(process.stdin, iface as unknown as rl.Interface)
	const stdin = process.stdin as NodeJS.ReadStream & { isRaw?: boolean }
	const wasRaw = stdin.isRaw ?? false
	if (!wasRaw) stdin.setRawMode(true)

	process.stdout.write('\x1b[?25l')

	let filter = ''
	let cursor = 0
	let viewportStart = 0
	const selected = new Set<string>()
	let rows: VisibleRow[] = buildVisibleRows(items, filter)
	let lastLineCount = 0

	function clearPrev() {
		if (lastLineCount > 0) {
			process.stdout.write(`\x1b[${lastLineCount}A\r\x1b[J`)
		}
	}

	function render() {
		rows = buildVisibleRows(items, filter)
		if (cursor >= rows.length) cursor = Math.max(0, rows.length - 1)

		// Keep cursor inside viewport
		if (cursor < viewportStart) viewportStart = cursor
		if (cursor >= viewportStart + VIEWPORT) viewportStart = cursor - VIEWPORT + 1

		const lines: string[] = []

		if (rows.length === 0) {
			lines.push('')
			lines.push('  (no skills match)')
			lines.push('')
		} else {
			const countSelected = (start: number, end: number) =>
				rows
					.slice(start, end)
					.filter((r): r is { type: 'item'; item: SelectItem } => r.type === 'item' && selected.has(r.item.value))
					.length

			const aboveSel = countSelected(0, viewportStart)
			lines.push(
				viewportStart > 0
					? `  \x1b[2m↑ ${viewportStart} more${aboveSel > 0 ? ` (${aboveSel} selected)` : ''}\x1b[0m`
					: '',
			)

			const hasGroups = rows.some((r) => r.type === 'group')
			const itemIndent = hasGroups ? '      ' : '  '
			const end = Math.min(viewportStart + VIEWPORT, rows.length)
			for (let i = viewportStart; i < end; i++) {
				const row = rows[i]!
				const hi = i === cursor
				const color = hi ? '\x1b[36m' : ''
				const reset = hi ? '\x1b[0m' : ''

				if (row.type === 'group') {
					const selCount = row.items.filter((it) => selected.has(it.value)).length
					const allSel = selCount === row.items.length
					const someSel = selCount > 0
					const mark = allSel ? '[x]' : someSel ? '[-]' : '[ ]'
					lines.push(`  ${color}${mark} ${row.name} (${selCount}/${row.items.length})${reset}`)
				} else {
					const mark = selected.has(row.item.value) ? '[x]' : '[ ]'
					const hint = row.item.hint ? `  \x1b[2m${row.item.hint}\x1b[0m` : ''
					const label = highlightFuzzy(filter, row.item.label)
					lines.push(`${itemIndent}${color}${mark} ${label}${reset}${hint}`)
				}
			}

			const belowStart = viewportStart + VIEWPORT
			const below = rows.length - belowStart
			const belowSel = countSelected(belowStart, rows.length)
			lines.push(below > 0 ? `  \x1b[2m↓ ${below} more${belowSel > 0 ? ` (${belowSel} selected)` : ''}\x1b[0m` : '')
		}

		lines.push('')
		lines.push(
			`  \x1b[2m${selected.size} selected  |  ↑↓ navigate  Space toggle  Enter confirm  Esc cancel  Ctrl+A all\x1b[0m`,
		)

		clearPrev()
		process.stdout.write(`${lines.join('\r\n')}\r\n`)
		lastLineCount = lines.length
	}

	process.stdout.write(`\nAvailable skills from ${source}:\n`)
	render()

	return new Promise((resolve, reject) => {
		let done = false

		function finish(fn: () => void) {
			if (done) return
			done = true
			stdin.removeListener('keypress', onKeypress)
			if (!wasRaw) stdin.setRawMode(false)
			process.stdout.write('\x1b[?25h')
			fn()
		}

		const onKeypress = (_: unknown, key: { name?: string; ctrl?: boolean; sequence?: string } | undefined) => {
			if (!key) return

			if (key.ctrl && key.name === 'c') {
				finish(() => process.exit(0))
				return
			}

			if (key.name === 'escape') {
				clearPrev()
				finish(() => reject(new CancelError()))
				return
			}

			if (key.name === 'return' || key.name === 'enter') {
				clearPrev()
				finish(() => resolve([...selected]))
				return
			}

			if (key.name === 'up') {
				if (cursor > 0) cursor--
				render()
				return
			}

			if (key.name === 'down') {
				if (cursor < rows.length - 1) cursor++
				render()
				return
			}

			if (key.name === 'space') {
				const row = rows[cursor]
				if (!row) return
				if (row.type === 'group') {
					const allSel = row.items.every((it) => selected.has(it.value))
					for (const it of row.items) {
						if (allSel) selected.delete(it.value)
						else selected.add(it.value)
					}
				} else {
					if (selected.has(row.item.value)) selected.delete(row.item.value)
					else selected.add(row.item.value)
				}
				render()
				return
			}

			if (key.ctrl && key.name === 'a') {
				const visibleValues = rows
					.filter((r): r is { type: 'item'; item: SelectItem } => r.type === 'item')
					.map((r) => r.item.value)
				const allSel = visibleValues.every((v) => selected.has(v))
				for (const v of visibleValues) {
					if (allSel) selected.delete(v)
					else selected.add(v)
				}
				render()
				return
			}

			if (key.name === 'backspace') {
				if (filter.length > 0) {
					filter = filter.slice(0, -1)
					cursor = 0
					viewportStart = 0
					render()
				}
				return
			}

			const seq = key.sequence
			if (seq && seq.length === 1 && seq.charCodeAt(0) >= 32) {
				filter += seq
				cursor = 0
				viewportStart = 0
				render()
				return
			}
		}

		stdin.on('keypress', onKeypress)
	})
}

async function promptSkillSelectFallback(iface: RlInterface, items: SelectItem[], source: string): Promise<string[]> {
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

	const result: string[] = []
	for (const part of trimmed.split(',')) {
		const num = Number.parseInt(part.trim(), 10)
		const value = indexMap.get(num)
		if (value && !result.includes(value)) result.push(value)
	}
	return result
}

async function promptSingleSelect<T extends string>(
	iface: RlInterface,
	items: Array<{ value: T; label: string; hint?: string }>,
	prompt: string,
): Promise<T> {
	if (!process.stdin.isTTY) {
		return promptSingleSelectFallback(iface, items, prompt)
	}

	rl.emitKeypressEvents(process.stdin, iface as unknown as rl.Interface)
	const stdin = process.stdin as NodeJS.ReadStream & { isRaw?: boolean }
	const wasRaw = stdin.isRaw ?? false
	if (!wasRaw) stdin.setRawMode(true)

	process.stdout.write('\x1b[?25l')

	let cursor = 0
	let lastLineCount = 0

	const labelWidth = Math.max(...items.map((it) => it.label.length))

	function clearPrev() {
		if (lastLineCount > 0) {
			process.stdout.write(`\x1b[${lastLineCount}A\r\x1b[J`)
		}
	}

	function render() {
		const lines: string[] = []
		for (let i = 0; i < items.length; i++) {
			const item = items[i]!
			const hi = i === cursor
			const color = hi ? '\x1b[36m' : ''
			const reset = hi ? '\x1b[0m' : ''
			const marker = hi ? '>' : ' '
			const label = item.label.padEnd(labelWidth)
			const hint = item.hint ? `  \x1b[2m${item.hint}\x1b[0m` : ''
			lines.push(`  ${color}${marker} ${label}${reset}${hint}`)
		}
		lines.push('')
		lines.push('  \x1b[2m↑↓ navigate  Enter confirm  Esc cancel\x1b[0m')
		clearPrev()
		process.stdout.write(`${lines.join('\r\n')}\r\n`)
		lastLineCount = lines.length
	}

	process.stdout.write(`\n${prompt}\n`)
	render()

	return new Promise((resolve, reject) => {
		let done = false

		function finish(fn: () => void) {
			if (done) return
			done = true
			stdin.removeListener('keypress', onKeypress)
			if (!wasRaw) stdin.setRawMode(false)
			process.stdout.write('\x1b[?25h')
			fn()
		}

		const onKeypress = (_: unknown, key: { name?: string; ctrl?: boolean } | undefined) => {
			if (!key) return

			if (key.ctrl && key.name === 'c') {
				finish(() => process.exit(0))
				return
			}

			if (key.name === 'escape') {
				clearPrev()
				finish(() => reject(new CancelError()))
				return
			}

			if (key.name === 'return' || key.name === 'enter') {
				clearPrev()
				finish(() => resolve(items[cursor]!.value))
				return
			}

			if (key.name === 'up') {
				if (cursor > 0) cursor--
				render()
				return
			}

			if (key.name === 'down') {
				if (cursor < items.length - 1) cursor++
				render()
				return
			}
		}

		stdin.on('keypress', onKeypress)
	})
}

async function promptSingleSelectFallback<T extends string>(
	iface: RlInterface,
	items: Array<{ value: T; label: string; hint?: string }>,
	prompt: string,
): Promise<T> {
	console.log(`\n${prompt}`)
	const labelWidth = Math.max(...items.map((it) => it.label.length))
	for (let i = 0; i < items.length; i++) {
		const item = items[i]!
		const hint = item.hint ? `  ${item.hint}` : ''
		console.log(`  [${i + 1}] ${item.label.padEnd(labelWidth)}${hint}`)
	}
	const answer = await questionWithEsc(iface, 'Choose [1]: ')
	const num = Number.parseInt(answer.trim(), 10)
	if (num >= 1 && num <= items.length) return items[num - 1]!.value
	return items[0]!.value
}

export async function promptScopeSelect(iface: RlInterface): Promise<'project' | 'global' | 'both'> {
	return promptSingleSelect(
		iface,
		[
			{ value: 'project' as const, label: 'project', hint: 'Install in current directory (committed with project)' },
			{ value: 'global' as const, label: 'global', hint: 'Install in home directory (available across all projects)' },
			{ value: 'both' as const, label: 'both', hint: 'Install in project and global' },
		],
		'Install scope:',
	)
}

export async function promptUpdateScopeSelect(iface: RlInterface): Promise<'project' | 'global' | 'both'> {
	return promptSingleSelect(
		iface,
		[
			{ value: 'project' as const, label: 'project', hint: 'Update skills in current directory' },
			{ value: 'global' as const, label: 'global', hint: 'Update skills in home directory' },
			{ value: 'both' as const, label: 'both', hint: 'Update project and global skills' },
		],
		'Update scope:',
	)
}

export async function promptRemoveScopeSelect(iface: RlInterface): Promise<'project' | 'global' | 'both'> {
	return promptSingleSelect(
		iface,
		[
			{ value: 'project' as const, label: 'project', hint: 'Remove from current directory' },
			{ value: 'global' as const, label: 'global', hint: 'Remove from home directory' },
			{ value: 'both' as const, label: 'both', hint: 'Remove from project and global' },
		],
		'Remove from:',
	)
}
