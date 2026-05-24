import { getPackageRoot } from "./package-root.mjs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
//#region src/hooks/lib/hook-command.mts
function getPackageVersion() {
	const pkgPath = join(getPackageRoot(), "package.json");
	return JSON.parse(readFileSync(pkgPath, "utf8")).version;
}
/**
* Build a hook command string for registration in agent settings.
* Prefers local node_modules bin when present (offline/local-agent setups);
* otherwise pins npx to the package version that ran register-hooks.
*/
function hookCommand(subcommand, root = process.cwd()) {
	const localBin = join(root, "node_modules", ".bin", "cyber-skills");
	if (existsSync(localBin)) return `${localBin} ${subcommand}`;
	return `npx cyber-skills@${getPackageVersion()} ${subcommand}`;
}
/** True when an existing registered command refers to the same hook id. */
function commandMatchesHook(existing, hookId, expectedCommand) {
	if (existing === expectedCommand) return true;
	if (hookId === "commit-discipline" && existing.includes("run-hook commit-discipline")) return true;
	return false;
}
//#endregion
export { commandMatchesHook, hookCommand };
