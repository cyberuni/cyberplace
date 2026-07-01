import type { PendingAction, StateFile } from '../state/state.js'
import { isDismissed } from '../state/state.js'

export interface DeltaInput {
	vendorId: string
	scope: string
	currentPlugins: Record<string, string>
	state: StateFile
	now: string
}

export function computeDelta(input: DeltaInput): PendingAction[] {
	const { vendorId, scope, currentPlugins, state, now } = input
	const previous = state.snapshots[vendorId]?.[scope]
	if (!previous) return []

	const previousPlugins = previous.plugins
	const added = Object.keys(currentPlugins).filter((p) => !(p in previousPlugins))
	const removed = Object.keys(previousPlugins).filter((p) => !(p in currentPlugins))

	const otherVendors = Object.entries(state.snapshots).filter(([id]) => id !== vendorId)
	const actions: PendingAction[] = []
	let counter = 0
	const makeId = () => `delta-${now}-${++counter}`

	for (const plugin of added) {
		const version = currentPlugins[plugin]!
		for (const [otherId, otherScopes] of otherVendors) {
			const otherScope = otherScopes[scope]
			if (!otherScope) continue
			if (plugin in otherScope.plugins) continue
			if (isDismissed(state, otherId, scope, plugin, version)) continue
			actions.push({
				id: makeId(),
				type: 'install',
				plugin,
				version,
				fromVendor: vendorId,
				toVendor: otherId,
				scope,
				detectedAt: now,
			})
		}
	}

	for (const plugin of removed) {
		for (const [otherId, otherScopes] of otherVendors) {
			const otherScope = otherScopes[scope]
			if (!otherScope) continue
			if (!(plugin in otherScope.plugins)) continue
			const otherVersion = otherScope.plugins[plugin]!
			if (isDismissed(state, otherId, scope, plugin, otherVersion)) continue
			actions.push({
				id: makeId(),
				type: 'remove',
				plugin,
				version: otherVersion,
				fromVendor: vendorId,
				toVendor: otherId,
				scope,
				detectedAt: now,
			})
		}
	}

	for (const [otherId, otherScopes] of otherVendors) {
		const otherScope = otherScopes[scope]
		if (!otherScope) continue
		for (const [plugin, version] of Object.entries(currentPlugins)) {
			const otherVersion = otherScope.plugins[plugin]
			if (!otherVersion || otherVersion === version) continue
			if (!isNewerSemver(version, otherVersion)) continue
			if (isDismissed(state, otherId, scope, plugin, version)) continue
			actions.push({
				id: makeId(),
				type: 'upgrade',
				plugin,
				version,
				fromVendor: vendorId,
				toVendor: otherId,
				scope,
				detectedAt: now,
			})
		}
	}

	return actions
}

function isNewerSemver(a: string, b: string): boolean {
	const [aMajor = 0, aMinor = 0, aPatch = 0] = a.split('.').map(Number)
	const [bMajor = 0, bMinor = 0, bPatch = 0] = b.split('.').map(Number)
	if (aMajor !== bMajor) return aMajor > bMajor
	if (aMinor !== bMinor) return aMinor > bMinor
	return aPatch > bPatch
}
