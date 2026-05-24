#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
//#region src/skills/init-commit-discipline/scripts/resolve-commit-skill.ts
/**
* Detect installed commit helper skills and recommend defaults.
*/
const RECOMMENDED_COMMIT_SKILL = "commit-work";
const RECOMMENDED_INSTALL = "npx skills add softaworks/agent-toolkit --skill commit-work -g";
const BUNDLED_COMMIT_SKILL = "commit";
const KNOWN_COMMIT_SKILL_NAMES = new Set([
	"commit-work",
	"commit",
	"git-commit",
	"commit-workflow"
]);
function skillDirs(root) {
	const home = homedir();
	return [
		join(root, ".agents", "skills"),
		join(home, ".agents", "skills"),
		join(root, ".claude", "skills"),
		join(home, ".claude", "skills")
	];
}
function detectCommitSkills(root = process.cwd()) {
	const found = /* @__PURE__ */ new Map();
	for (const base of skillDirs(root)) {
		if (!existsSync(base)) continue;
		for (const name of KNOWN_COMMIT_SKILL_NAMES) {
			const skillPath = join(base, name, "SKILL.md");
			if (existsSync(skillPath) && !found.has(name)) found.set(name, {
				name,
				path: skillPath
			});
		}
	}
	return [...found.values()];
}
function resolveCommitSkillName(detected, preferred) {
	if (preferred) return preferred;
	const commitWork = detected.find((s) => s.name === RECOMMENDED_COMMIT_SKILL);
	if (commitWork) return commitWork.name;
	if (detected.length === 1) return detected[0].name;
	return null;
}
if (process.argv[1] === import.meta.filename) {
	const args = process.argv.slice(2);
	const rootIdx = args.indexOf("--root");
	const root = rootIdx !== -1 ? args[rootIdx + 1] : process.cwd();
	if (args.includes("--recommend")) {
		process.stdout.write(`${RECOMMENDED_INSTALL}\n`);
		process.exit(0);
	}
	const detected = detectCommitSkills(root);
	const payload = {
		detected,
		recommended: RECOMMENDED_COMMIT_SKILL,
		recommendedInstall: RECOMMENDED_INSTALL,
		bundledFallback: BUNDLED_COMMIT_SKILL,
		resolved: resolveCommitSkillName(detected)
	};
	process.stdout.write(`${JSON.stringify(payload)}\n`);
	process.exit(detected.length > 0 ? 0 : 1);
}
//#endregion
export { BUNDLED_COMMIT_SKILL, RECOMMENDED_COMMIT_SKILL, RECOMMENDED_INSTALL, detectCommitSkills, resolveCommitSkillName };
