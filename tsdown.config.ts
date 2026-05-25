import { defineConfig } from 'tsdown'

export default defineConfig([
	{
		entry: ['src/bin/*.mts', '!src/bin/*.test.mts'],
		root: 'src',
		outDir: 'dist',
		unbundle: true,
		clean: false,
		format: 'esm',
		platform: 'node',
	},
	{
		entry: [
			'src/hooks/**/*.mts',
			'!src/hooks/**/*.test.mts',
			'src/skills/*/scripts/*.ts',
			'!src/skills/*/scripts/*.test.ts',
		],
		root: 'src',
		outDir: '.',
		unbundle: true,
		clean: false,
		format: 'esm',
		platform: 'node',
	},
])
