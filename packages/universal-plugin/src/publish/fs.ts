import * as fs from 'node:fs'

export interface SyncVersionFs {
	exists(filePath: string): boolean
	read(filePath: string): string
	write(filePath: string, content: string): void
}

export const realSyncVersionFs: SyncVersionFs = {
	exists: (p) => fs.existsSync(p),
	read: (p) => fs.readFileSync(p, 'utf8'),
	write: (p, content) => fs.writeFileSync(p, content),
}
