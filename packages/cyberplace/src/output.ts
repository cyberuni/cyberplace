function printJson(data: unknown) {
	console.log(JSON.stringify(data, null, 2))
}

export function printFields(fields: Record<string, string | null | undefined>) {
	const entries = Object.entries(fields).filter(([, v]) => v != null) as [string, string][]
	const width = Math.max(...entries.map(([k]) => k.length))
	for (const [key, val] of entries) {
		console.log(`${key.padEnd(width)}  ${val}`)
	}
}

export function printTable<T>(items: T[], cols: { label: string; get: (item: T) => string }[]) {
	if (items.length === 0) {
		console.log('(none)')
		return
	}
	const widths = cols.map((c) => Math.max(c.label.length, ...items.map((i) => c.get(i).length)))
	console.log(cols.map((c, i) => c.label.toUpperCase().padEnd(widths[i]!)).join('  '))
	console.log(widths.map((w) => '-'.repeat(w)).join('  '))
	for (const item of items) {
		console.log(cols.map((c, i) => c.get(item).padEnd(widths[i]!)).join('  '))
	}
}

function toonScalar(value: string): string {
	// Quote a value that would otherwise break TOON row/field parsing.
	if (value === '' || /[",:\n]/.test(value) || value !== value.trim()) {
		return `"${value.replace(/"/g, '\\"')}"`
	}
	return value
}

/**
 * Renders a list of records as a TOON tabular array — the AXI default output
 * shape (../axi/README.md, #1). Emits a `<key>[<n>]{col,col,…}:` header
 * followed by one indented comma-joined row per item; values containing
 * delimiters are quoted. TOON is ~40% fewer tokens than JSON.
 */
export function renderToonTable<T>(
	key: string,
	items: T[],
	cols: { label: string; get: (item: T) => string }[],
): string {
	const header = `${key}[${items.length}]{${cols.map((c) => c.label).join(',')}}:`
	const rows = items.map((item) => `  ${cols.map((c) => toonScalar(c.get(item))).join(',')}`)
	return [header, ...rows].join('\n')
}

function getFormat(): string | undefined {
	const argv = process.argv
	const fmtIdx = argv.indexOf('--format')
	if (fmtIdx !== -1) return argv[fmtIdx + 1]
	if (argv.includes('--json')) return 'json' // hidden backward-compat alias
	return undefined
}

function isJsonOutput(): boolean {
	return getFormat() === 'json'
}

// True when the caller is a script or agent — suppress interactive prompts
export function isAutomatedOutput(): boolean {
	const fmt = getFormat()
	return fmt === 'json' || fmt === 'agent'
}

export function output(data: unknown, readable: () => void) {
	if (isJsonOutput()) printJson(data)
	else readable()
}
