/** Detects indentation style from JSON text. Returns `'\t'` for tabs or a number for space count.
 *  Falls back to `'\t'` when no indentation is detected. */
export function detectIndent(json: string): string | number {
	const match = json.match(/\n([ \t]+)/)
	if (!match) return '\t'
	return match[1].startsWith('\t') ? '\t' : match[1].length
}
