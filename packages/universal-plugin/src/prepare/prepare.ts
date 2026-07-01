import type { StateFile } from '../state/state.js'
import { addPendingAction, emptyState, takeSnapshot, writeAssetIndex, writePluginIndex } from '../state/state.js'
import { computeDelta } from './delta.js'
import type { PrepareFs } from './fs.js'

export interface PrepareOptions {
	vendorId: string
	scope: 'global' | 'project'
	fs: PrepareFs
	now: string
	dryRun?: boolean
}

export interface PrepareResult {
	newActionCount: number
}

export function runPrepare(opts: PrepareOptions): PrepareResult {
	const { vendorId, scope, fs: prepareFs, now, dryRun } = opts

	const currentPlugins = prepareFs.readManifest()
	const state = scope === 'global' ? prepareFs.readGlobalState() : (prepareFs.readProjectState() ?? emptyState())

	const actions = computeDelta({ vendorId, scope, currentPlugins, state, now })

	let updatedState: StateFile = takeSnapshot(state, vendorId, scope, currentPlugins, now)
	for (const action of actions) {
		updatedState = addPendingAction(updatedState, action)
	}

	const pluginRoots = prepareFs.readPluginRoots()
	for (const [pluginName, pluginPath] of Object.entries(pluginRoots)) {
		const version = currentPlugins[pluginName] ?? 'unknown'
		updatedState = writePluginIndex(updatedState, vendorId, pluginName, {
			source: 'npm',
			path: pluginPath,
			version,
		})
		updatedState = writeAssetIndex(updatedState, pluginName, { source: 'npm', version })
	}

	if (!dryRun) {
		if (scope === 'global') prepareFs.writeGlobalState(updatedState)
		else prepareFs.writeProjectState(updatedState)
	}

	return { newActionCount: actions.length }
}
