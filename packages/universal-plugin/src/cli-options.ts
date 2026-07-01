import { Option } from 'commander'

/** Repo root; resolves to cwd when omitted. */
export const ROOT_OPTION = new Option('--root <path>', 'Plugin root directory')

export function resolveRoot(root?: string): string {
	return root ?? process.cwd()
}
