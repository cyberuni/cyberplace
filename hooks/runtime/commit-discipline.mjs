import { formatCommitDisciplineSection, parseCommitDisciplineSection } from "../lib/commit-discipline-content.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
//#region src/hooks/runtime/commit-discipline.mts
async function readStdin() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8").trim();
}
async function run() {
	const verbose = process.argv.includes("--verbose");
	const input = await readStdin();
	if (input && verbose) process.stderr.write(`commit-discipline hook: received ${input.length} bytes on stdin\n`);
	let context;
	const agentsPath = join(process.cwd(), "AGENTS.md");
	try {
		context = parseCommitDisciplineSection(readFileSync(agentsPath, "utf8")) ?? formatCommitDisciplineSection("commit");
	} catch {
		context = formatCommitDisciplineSection("commit");
	}
	const payload = { hookSpecificOutput: {
		hookEventName: "SessionStart",
		additionalContext: context.trim()
	} };
	process.stdout.write(`${JSON.stringify(payload)}\n`);
}
//#endregion
export { run as default };
