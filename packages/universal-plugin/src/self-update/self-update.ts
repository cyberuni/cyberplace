import type { StateFile } from '../state/state.js'

export interface SelfUpdateFs {
	globHookFiles(): string[]
	readFile(filePath: string): string
	writeFile(filePath: string, content: string): void
	readGlobalState(): StateFile
	writeGlobalState(state: StateFile): void
}

export interface SelfUpdateResult {
	updatedCount: number
}

export function runSelfUpdate(opts: { toVersion: string; fs: SelfUpdateFs }): SelfUpdateResult {
	const { toVersion, fs } = opts
	const [major] = toVersion.split('.')
	if (!major || !/^\d+$/.test(major)) throw new Error(`Invalid version format: ${toVersion}`)
	// Matches `npx universal-plugin@<same-major>.<any>.<any>` — does not match other majors
	const pattern = new RegExp(`(npx universal-plugin@)${major}\\.[0-9]+\\.[0-9]+`, 'g')

	let updatedCount = 0
	for (const filePath of fs.globHookFiles()) {
		const content = fs.readFile(filePath)
		pattern.lastIndex = 0
		if (!pattern.test(content)) continue
		pattern.lastIndex = 0
		const updated = content.replace(pattern, `$1${toVersion}`)
		if (updated !== content) {
			fs.writeFile(filePath, updated)
			updatedCount++
		}
	}

	const state = fs.readGlobalState()
	const updates = { ...state.uniPluginUpdates }
	delete updates[major!]
	fs.writeGlobalState({ ...state, uniPluginUpdates: updates })

	return { updatedCount }
}
