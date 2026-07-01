import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VendorRegistry } from './vendor-registry.js'
import { mergeRegistries } from './vendor-registry.js'

function bundledRegistryPath(): string {
	const thisFile = fileURLToPath(import.meta.url)
	return path.join(path.dirname(thisFile), 'data', 'vendors.json')
}

function userOverridePath(): string {
	return path.join(os.homedir(), '.agents', 'universal-plugin-vendors.json')
}

export function loadRegistry(): VendorRegistry {
	const bundled = JSON.parse(fsNode.readFileSync(bundledRegistryPath(), 'utf8')) as VendorRegistry
	try {
		const override = JSON.parse(fsNode.readFileSync(userOverridePath(), 'utf8')) as VendorRegistry
		return mergeRegistries(bundled, override)
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') return bundled
		throw err
	}
}
