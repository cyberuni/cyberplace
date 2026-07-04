// Markdown-oriented CLI output — aligned text reads better for an agent than JSON.

export function printFields(fields: Record<string, string | null | undefined>): void {
	const entries = Object.entries(fields).filter(([, v]) => v != null) as [string, string][]
	if (entries.length === 0) return
	const width = Math.max(...entries.map(([k]) => k.length))
	for (const [key, val] of entries) {
		console.log(`${key.padEnd(width)}  ${val}`)
	}
}

export function printTable<T>(items: T[], cols: { label: string; get: (item: T) => string }[]): void {
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
