import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import { registerHooks } from '../../../skills/init/scripts/register-hooks.mts'

function withTempRoot(setup: (root: string) => void, check: (root: string) => void): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'register-hooks-'))
  try {
    setup(root)
    check(root)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

// --- Agent detection ---

test('skips all agents when no agent dirs exist', () => {
  withTempRoot(
    (_root) => {},
    (root) => {
      const results = registerHooks({ root })
      assert.ok(results.every((r) => r.status === 'skipped (dir not found)'))
    },
  )
})

// --- Claude Code ---

test('registers Claude Code hooks when .claude dir exists and settings.json is absent', () => {
  withTempRoot(
    (root) => fs.mkdirSync(path.join(root, '.claude')),
    (root) => {
      const results = registerHooks({ root })
      const postToolUse = results.find((r) => r.agent === 'Claude Code' && r.hook.includes('PostToolUse'))
      const sessionStart = results.find((r) => r.agent === 'Claude Code' && r.hook.includes('SessionStart'))
      assert.equal(postToolUse?.status, 'registered')
      assert.equal(sessionStart?.status, 'registered')

      const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
        hooks: { PostToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }>; SessionStart: Array<{ hooks: Array<{ command: string }> }> }
      }
      assert.ok(settings.hooks.PostToolUse[0]?.hooks.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh'))
      assert.ok(settings.hooks.SessionStart[0]?.hooks.some((h) => h.command === 'bash .agents/hooks/inject-local-augmentations.sh'))
    },
  )
})

test('detects Claude Code hooks as already present when fully registered', () => {
  withTempRoot(
    (root) => {
      fs.mkdirSync(path.join(root, '.claude'))
      fs.writeFileSync(path.join(root, '.claude', 'settings.json'), JSON.stringify({
        hooks: {
          PostToolUse: [{ matcher: 'Write|Edit', hooks: [{ type: 'command', command: 'bash .agents/hooks/mark-internal.sh' }] }],
          SessionStart: [{ hooks: [{ type: 'command', command: 'bash .agents/hooks/inject-local-augmentations.sh' }] }],
        },
      }))
    },
    (root) => {
      const results = registerHooks({ root })
      const claude = results.filter((r) => r.agent === 'Claude Code')
      assert.ok(claude.every((r) => r.status === 'already present'))
    },
  )
})

test('does not clobber unrelated Claude Code settings', () => {
  withTempRoot(
    (root) => {
      fs.mkdirSync(path.join(root, '.claude'))
      fs.writeFileSync(path.join(root, '.claude', 'settings.json'), JSON.stringify({
        model: 'claude-opus-4-7',
        permissions: { allow: ['Bash'] },
        hooks: {},
      }))
    },
    (root) => {
      registerHooks({ root })
      const settings = readJson(path.join(root, '.claude', 'settings.json')) as { model: string; permissions: { allow: string[] } }
      assert.equal(settings.model, 'claude-opus-4-7')
      assert.deepEqual(settings.permissions.allow, ['Bash'])
    },
  )
})

test('merges into existing PostToolUse group with matching matcher', () => {
  withTempRoot(
    (root) => {
      fs.mkdirSync(path.join(root, '.claude'))
      fs.writeFileSync(path.join(root, '.claude', 'settings.json'), JSON.stringify({
        hooks: {
          PostToolUse: [{ matcher: 'Write|Edit', hooks: [{ type: 'command', command: 'bash other.sh' }] }],
        },
      }))
    },
    (root) => {
      registerHooks({ root })
      const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
        hooks: { PostToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }> }
      }
      const group = settings.hooks.PostToolUse.find((g) => g.matcher === 'Write|Edit')
      assert.ok(group?.hooks.some((h) => h.command === 'bash other.sh'), 'existing hook preserved')
      assert.ok(group?.hooks.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh'), 'new hook added')
      assert.equal(settings.hooks.PostToolUse.length, 1, 'no duplicate group created')
    },
  )
})

// --- Cursor ---

test('registers Cursor hook when .cursor dir exists and hooks.json is absent', () => {
  withTempRoot(
    (root) => fs.mkdirSync(path.join(root, '.cursor')),
    (root) => {
      const results = registerHooks({ root })
      const cursor = results.find((r) => r.agent === 'Cursor')
      assert.equal(cursor?.status, 'registered')

      const settings = readJson(path.join(root, '.cursor', 'hooks.json')) as {
        version: number
        hooks: { afterFileEdit: Array<{ command: string }> }
      }
      assert.equal(settings.version, 1)
      assert.ok(settings.hooks.afterFileEdit.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh'))
    },
  )
})

test('detects Cursor hook as already present', () => {
  withTempRoot(
    (root) => {
      fs.mkdirSync(path.join(root, '.cursor'))
      fs.writeFileSync(path.join(root, '.cursor', 'hooks.json'), JSON.stringify({
        version: 1,
        hooks: { afterFileEdit: [{ command: 'bash .agents/hooks/mark-internal.sh' }] },
      }))
    },
    (root) => {
      const results = registerHooks({ root })
      const cursor = results.find((r) => r.agent === 'Cursor')
      assert.equal(cursor?.status, 'already present')
    },
  )
})

// --- Codex ---

test('registers Codex hooks when .codex-plugin dir exists', () => {
  withTempRoot(
    (root) => fs.mkdirSync(path.join(root, '.codex-plugin')),
    (root) => {
      const results = registerHooks({ root })
      const postToolUse = results.find((r) => r.agent === 'Codex' && r.hook.includes('PostToolUse'))
      const sessionStart = results.find((r) => r.agent === 'Codex' && r.hook.includes('SessionStart'))
      assert.equal(postToolUse?.status, 'registered')
      assert.equal(sessionStart?.status, 'registered')
    },
  )
})

// --- Dry run ---

test('dry-run: writes no files even when hooks are missing', () => {
  withTempRoot(
    (root) => {
      fs.mkdirSync(path.join(root, '.claude'))
      fs.mkdirSync(path.join(root, '.cursor'))
    },
    (root) => {
      const results = registerHooks({ root, dryRun: true })
      assert.ok(results.some((r) => r.status === 'registered'), 'reported as registered')
      assert.ok(!fs.existsSync(path.join(root, '.claude', 'settings.json')), 'Claude settings not written')
      assert.ok(!fs.existsSync(path.join(root, '.cursor', 'hooks.json')), 'Cursor hooks not written')
    },
  )
})

// --- Idempotency ---

test('running twice produces no duplicate hooks', () => {
  withTempRoot(
    (root) => fs.mkdirSync(path.join(root, '.claude')),
    (root) => {
      registerHooks({ root })
      registerHooks({ root })
      const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
        hooks: { PostToolUse: Array<{ hooks: unknown[] }>; SessionStart: Array<{ hooks: unknown[] }> }
      }
      assert.equal(settings.hooks.PostToolUse[0]?.hooks.length, 1)
      assert.equal(settings.hooks.SessionStart[0]?.hooks.length, 1)
    },
  )
})
