import type { StateFile } from '../state/state.js'
import type { VendorRegistry } from '../vendor-registry/vendor-registry.js'

export interface SyncFs {
	readGlobalState(): StateFile
	writeGlobalState(state: StateFile): void
	shell(command: string): number
}

type SyncOutcome = 'applied' | 'failed' | 'manual' | 'not-found'

export interface SyncResult {
	outcome: SyncOutcome
	instruction?: string
}

export function applySyncAction(opts: {
	actionId: string
	registry: VendorRegistry
	fs: SyncFs
	now: string
}): SyncResult {
	const { actionId, registry, fs } = opts
	const state = fs.readGlobalState()
	const action = state.pendingActions.find((a) => a.id === actionId)
	if (!action) return { outcome: 'not-found' }

	const vendor = registry[action.toVendor]
	const templateCommand =
		action.type === 'install'
			? vendor?.installCommand
			: action.type === 'remove'
				? vendor?.removeCommand
				: vendor?.updateCommand

	const withoutAction = {
		...state,
		pendingActions: state.pendingActions.filter((a) => a.id !== actionId),
	}

	if (!templateCommand) {
		fs.writeGlobalState(withoutAction)
		return {
			outcome: 'manual',
			instruction: `Install ${action.plugin}@${action.version} in ${action.toVendor} via its marketplace, then run: sync apply ${action.id}`,
		}
	}

	const command = templateCommand.replace('{name}', action.plugin).replace('{version}', action.version)
	const exitCode = fs.shell(command)
	if (exitCode !== 0) return { outcome: 'failed' }

	fs.writeGlobalState(withoutAction)
	return { outcome: 'applied' }
}
