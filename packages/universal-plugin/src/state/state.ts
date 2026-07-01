type ActionType = 'install' | 'upgrade' | 'remove'
type DismissalReason = 'version-skipped' | 'keep'

export interface PendingAction {
	id: string
	type: ActionType
	plugin: string
	version: string
	fromVendor: string
	toVendor: string
	scope: string
	detectedAt: string
}

interface DismissedEntry {
	reason: DismissalReason
	version: string | null
	dismissedAt: string
}

interface ScopeSnapshot {
	takenAt: string
	plugins: Record<string, string>
}

interface UniPluginUpdateEntry {
	current: string
	available: string
	detectedAt: string
}

export interface PluginIndexEntry {
	source: string
	path: string
	version: string
}

export interface AssetIndexEntry {
	source: string
	version: string
}

export interface StateFile {
	schemaVersion: 1
	snapshots: Record<string, Record<string, ScopeSnapshot>>
	dismissed: Record<string, DismissedEntry>
	pendingActions: PendingAction[]
	uniPluginUpdates: Record<string, UniPluginUpdateEntry>
	plugins: Record<string, Record<string, PluginIndexEntry>>
	assets: Record<string, AssetIndexEntry>
}

const KNOWN_ACTION_TYPES = new Set<string>(['install', 'upgrade', 'remove'])

export function emptyState(): StateFile {
	return {
		schemaVersion: 1,
		snapshots: {},
		dismissed: {},
		pendingActions: [],
		uniPluginUpdates: {},
		plugins: {},
		assets: {},
	}
}

export function mergeSafeState(raw: StateFile): StateFile {
	return {
		...raw,
		plugins: raw.plugins ?? {},
		assets: raw.assets ?? {},
		pendingActions: (raw.pendingActions ?? []).filter((a) => KNOWN_ACTION_TYPES.has(a.type)),
	}
}

export function writePluginIndex(
	state: StateFile,
	vendorId: string,
	pluginName: string,
	entry: PluginIndexEntry,
): StateFile {
	return {
		...state,
		plugins: {
			...state.plugins,
			[vendorId]: {
				...(state.plugins[vendorId] ?? {}),
				[pluginName]: entry,
			},
		},
	}
}

export function writeAssetIndex(state: StateFile, pluginName: string, entry: AssetIndexEntry): StateFile {
	return {
		...state,
		assets: {
			...state.assets,
			[pluginName]: entry,
		},
	}
}

export function takeSnapshot(
	state: StateFile,
	vendorId: string,
	scope: string,
	plugins: Record<string, string>,
	takenAt: string,
): StateFile {
	return {
		...state,
		snapshots: {
			...state.snapshots,
			[vendorId]: {
				...(state.snapshots[vendorId] ?? {}),
				[scope]: { takenAt, plugins },
			},
		},
	}
}

export function isDismissed(
	state: StateFile,
	vendorId: string,
	scope: string,
	plugin: string,
	version: string,
): boolean {
	const entry = state.dismissed[`${vendorId}/${scope}/${plugin}`]
	if (!entry) return false
	if (entry.reason === 'keep') return true
	return entry.version === version
}

export function addPendingAction(state: StateFile, action: PendingAction): StateFile {
	const key = `${action.type}|${action.plugin}|${action.toVendor}|${action.scope}`
	const exists = state.pendingActions.some((a) => `${a.type}|${a.plugin}|${a.toVendor}|${a.scope}` === key)
	if (exists) return state
	return { ...state, pendingActions: [...state.pendingActions, action] }
}
