import { Option } from 'commander'

/** Repo root; resolves to cwd when omitted (not shown as an absolute path in help). */
export const ROOT_OPTION = new Option('--root <path>', 'Repo root')

export function resolveRoot(root?: string): string {
	return root ?? process.cwd()
}
