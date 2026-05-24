import { hookCommand } from "../lib/hook-command.mjs";
//#region src/hooks/definitions/commit-discipline.mts
function getCommitDisciplineHooks(root = process.cwd()) {
	return [{
		id: "commit-discipline",
		label: "SessionStart › commit-discipline",
		command: hookCommand("run-hook commit-discipline", root),
		claude: { event: "SessionStart" },
		codex: { event: "SessionStart" }
	}];
}
//#endregion
export { getCommitDisciplineHooks };
