import type { RegistryClient } from './pin.js'

interface NpmPackageDoc {
	'dist-tags'?: { latest?: string }
	versions?: Record<string, unknown>
}

function encodePkg(pkg: string): string {
	return pkg.replace('/', '%2f')
}

/** Registry client backed by the global `fetch` (Node ≥22). Resilient — network errors and
 *  non-2xx responses resolve to `null` rather than throwing. */
export function realRegistryClient(registryBase: string): RegistryClient {
	const base = registryBase.replace(/\/+$/, '')
	return {
		async fetchVersions(pkg: string) {
			try {
				const res = await fetch(`${base}/${encodePkg(pkg)}`)
				if (!res.ok) return null
				const doc = (await res.json()) as NpmPackageDoc
				const latest = doc['dist-tags']?.latest
				const versions = doc.versions ? Object.keys(doc.versions) : []
				if (!latest) return null
				return { latest, versions }
			} catch {
				return null
			}
		},
	}
}
