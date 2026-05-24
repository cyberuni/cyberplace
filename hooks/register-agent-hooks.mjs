#!/usr/bin/env node
import { commandMatchesHook } from "./lib/hook-command.mjs";
import { getCommitDisciplineHooks } from "./definitions/commit-discipline.mjs";
import { INIT_HOOKS } from "./definitions/init.mjs";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
//#region src/hooks/register-agent-hooks.mts
/**
* Registers agent runtime hooks for detected AI agents (Claude Code, Cursor, Codex).
* Idempotent: safe to re-run; only writes when a hook is missing.
*/
function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}
function writeJson(path, data) {
	writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}
function commandExistsInGroups(groups, def) {
	return groups.some((g) => g.hooks.some((h) => commandMatchesHook(h.command, def.id, def.command)));
}
function registerClaudeHook(settings, def, event) {
	settings.hooks ??= {};
	settings.hooks[event] ??= [];
	if (commandExistsInGroups(settings.hooks[event], def)) return false;
	if (event === "PostToolUse") {
		const matcher = def.claude?.matcher ?? "Write|Edit";
		const group = settings.hooks.PostToolUse.find((g) => g.matcher === matcher);
		if (group) group.hooks.push({
			type: "command",
			command: def.command
		});
		else settings.hooks.PostToolUse.push({
			matcher,
			hooks: [{
				type: "command",
				command: def.command
			}]
		});
	} else if (settings.hooks.SessionStart.length > 0) settings.hooks.SessionStart[0].hooks.push({
		type: "command",
		command: def.command
	});
	else settings.hooks.SessionStart.push({ hooks: [{
		type: "command",
		command: def.command
	}] });
	return true;
}
function registerCursorHook(settings, def, event) {
	settings.version ??= 1;
	settings.hooks ??= {};
	settings.hooks[event] ??= [];
	const list = settings.hooks[event];
	if (list.some((h) => commandMatchesHook(h.command, def.id, def.command))) return false;
	list.push({ command: def.command });
	return true;
}
function registerAgentHooks(hooks, options = {}) {
	const root = options.root ?? process.cwd();
	const dryRun = options.dryRun ?? false;
	const results = [];
	const claudeDir = join(root, ".claude");
	const claudeSettingsPath = join(claudeDir, "settings.json");
	if (existsSync(claudeDir)) {
		const settings = existsSync(claudeSettingsPath) ? readJson(claudeSettingsPath) : {};
		let changed = false;
		for (const def of hooks) if (def.claude) if (registerClaudeHook(settings, def, def.claude.event)) {
			changed = true;
			results.push({
				agent: "Claude Code",
				hook: def.label,
				status: "registered"
			});
		} else results.push({
			agent: "Claude Code",
			hook: def.label,
			status: "already present"
		});
		if (changed && !dryRun) writeJson(claudeSettingsPath, settings);
	} else {
		const claudeHooks = hooks.filter((h) => h.claude);
		if (claudeHooks.length > 0) results.push({
			agent: "Claude Code",
			hook: claudeHooks.map((h) => h.label).join(", "),
			status: "skipped (dir not found)"
		});
	}
	const cursorDir = join(root, ".cursor");
	const cursorHooksPath = join(cursorDir, "hooks.json");
	if (existsSync(cursorDir)) {
		const settings = existsSync(cursorHooksPath) ? readJson(cursorHooksPath) : { version: 1 };
		let changed = false;
		for (const def of hooks) if (def.cursor) if (registerCursorHook(settings, def, def.cursor.event)) {
			changed = true;
			results.push({
				agent: "Cursor",
				hook: def.label,
				status: "registered"
			});
		} else results.push({
			agent: "Cursor",
			hook: def.label,
			status: "already present"
		});
		if (changed && !dryRun) writeJson(cursorHooksPath, settings);
	} else {
		const cursorHooks = hooks.filter((h) => h.cursor);
		if (cursorHooks.length > 0) results.push({
			agent: "Cursor",
			hook: cursorHooks.map((h) => h.label).join(", "),
			status: "skipped (dir not found)"
		});
	}
	const codexDir = join(root, ".codex-plugin");
	const codexHooksPath = join(codexDir, "hooks.json");
	if (existsSync(codexDir)) {
		const settings = existsSync(codexHooksPath) ? readJson(codexHooksPath) : {};
		let changed = false;
		for (const def of hooks) if (def.codex) if (registerClaudeHook(settings, def, def.codex.event)) {
			changed = true;
			results.push({
				agent: "Codex",
				hook: def.label,
				status: "registered"
			});
		} else results.push({
			agent: "Codex",
			hook: def.label,
			status: "already present"
		});
		if (changed && !dryRun) writeJson(codexHooksPath, settings);
	} else {
		const codexHooks = hooks.filter((h) => h.codex);
		if (codexHooks.length > 0) results.push({
			agent: "Codex",
			hook: codexHooks.map((h) => h.label).join(", "),
			status: "skipped (dir not found)"
		});
	}
	return results;
}
function hooksForSet(set, root) {
	switch (set) {
		case "init": return INIT_HOOKS;
		case "commit-discipline": return getCommitDisciplineHooks(root);
	}
}
function registerHooksForSet(set, options = {}) {
	return registerAgentHooks(hooksForSet(set, options.root ?? process.cwd()), options);
}
function printResults(results, dryRun) {
	if (dryRun) process.stderr.write("Dry run — no files written.\n\n");
	const agentWidth = Math.max(...results.map((r) => r.agent.length), 5);
	const hookWidth = Math.max(...results.map((r) => r.hook.length), 4);
	const statusWidth = Math.max(...results.map((r) => r.status.length), 6);
	function pad(s, n) {
		return s.padEnd(n);
	}
	function row(a, h, s) {
		return `| ${pad(a, agentWidth)} | ${pad(h, hookWidth)} | ${pad(s, statusWidth)} |`;
	}
	process.stderr.write(`${row("Agent", "Hook", "Status")}\n`);
	process.stderr.write(`|-${"-".repeat(agentWidth)}-|-${"-".repeat(hookWidth)}-|-${"-".repeat(statusWidth)}-|\n`);
	for (const r of results) process.stderr.write(`${row(r.agent, r.hook, r.status)}\n`);
}
if (process.argv[1] === import.meta.filename) {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const verbose = args.includes("--verbose");
	const setIdx = args.indexOf("--set");
	const rootIdx = args.indexOf("--root");
	const set = setIdx !== -1 ? args[setIdx + 1] : void 0;
	const root = rootIdx !== -1 ? args[rootIdx + 1] : process.cwd();
	if (!set || set !== "init" && set !== "commit-discipline") {
		process.stderr.write("Usage: register-agent-hooks.mjs --set init|commit-discipline [--root <path>] [--dry-run] [--verbose]\n");
		process.exit(1);
	}
	const results = registerHooksForSet(set, {
		root,
		dryRun
	});
	if (verbose) printResults(results, dryRun);
}
//#endregion
export { hooksForSet, registerAgentHooks, registerHooksForSet };
