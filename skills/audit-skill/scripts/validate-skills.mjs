#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
//#region src/skills/audit-skill/scripts/validate-skills.ts
const SKILL_DIRS = ["skills", ".agents/skills"];
const GENERIC_PHRASES = [
	"helps with",
	"general purpose",
	"handles tasks",
	"use this skill when the user asks anything",
	"does things"
];
const E1_PATTERNS = [
	/rm\s+-[rRf]*f[rRf]*\s+/,
	/sudo\s+rm/,
	/curl[^|\n]*\|\s*(ba)?sh/,
	/wget[^|\n]*\|\s*(ba)?sh/,
	/\bdd\s+if=/,
	/\b(mkfs|fdisk|parted)\b/,
	/kill\s+-9\s+1\b/,
	/:\(\)\{\s*:\|:&\s*\}/,
	/chmod\s+-R\s+777\s+/
];
const E2_PATTERNS = [
	/[Ii]gnore (previous|all|prior) instructions/,
	/[Yy]ou are now [A-Z][a-zA-Z]/,
	/[Ff]rom now on you are /,
	/[Dd]isregard your (guidelines|rules)/,
	/[Ff]orget your (guidelines|training)/,
	/[Yy]our new instructions are/
];
function findSkillFiles(dirs, cwd) {
	const seen = /* @__PURE__ */ new Set();
	const results = [];
	for (const dir of dirs) {
		const base = path.join(cwd, dir);
		if (!fs.existsSync(base)) continue;
		for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
			const skillFile = path.join(base, entry.name, "SKILL.md");
			if (!fs.existsSync(skillFile)) continue;
			try {
				const real = fs.realpathSync(skillFile);
				if (!seen.has(real)) {
					seen.add(real);
					results.push(real);
				}
			} catch {}
		}
	}
	return results.sort();
}
function parseFrontmatter(content) {
	const lines = content.split("\n");
	let fmCount = 0;
	let name = "";
	let description = "";
	for (const line of lines) {
		if (line.trim() === "---") {
			fmCount++;
			if (fmCount === 2) break;
			continue;
		}
		if (fmCount !== 1) continue;
		const nameMatch = line.match(/^name:\s*(.+)/);
		if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
		const descMatch = line.match(/^description:\s*(.+)/);
		if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, "");
	}
	return {
		name,
		description
	};
}
function extractBody(content) {
	const lines = content.split("\n");
	let fmCount = 0;
	const bodyLines = [];
	for (const line of lines) {
		if (line.trim() === "---") {
			fmCount++;
			continue;
		}
		if (fmCount >= 2) bodyLines.push(line);
	}
	return bodyLines.join("\n");
}
function extractCodeBlocks(content) {
	const lines = content.split("\n");
	let inBlock = false;
	const out = [];
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("```")) {
			inBlock = !inBlock;
			continue;
		}
		if (inBlock) out.push(`${i + 1}: ${lines[i]}`);
	}
	return out.join("\n");
}
function stripExamples(content) {
	return content.replace(/`[^`]*`/g, "").replace(/"[^"]*"/g, "");
}
function isShellExpandedReference(source, matchIndex) {
	const previousChar = source[matchIndex - 1];
	const previousTwoChars = source.slice(Math.max(0, matchIndex - 2), matchIndex);
	return previousChar === "$" || previousTwoChars === ")/" || previousTwoChars === "}/";
}
function runChecks(filePath) {
	const criticals = [];
	const warnings = [];
	const crit = (checkId, name, evidence, fix) => criticals.push({
		severity: "CRITICAL",
		checkId,
		name,
		evidence,
		fix
	});
	const warn = (severity, checkId, name, evidence, fix) => warnings.push({
		severity,
		checkId,
		name,
		evidence,
		fix
	});
	const content = fs.readFileSync(filePath, "utf8");
	const skillDir = path.dirname(filePath);
	const dirName = path.basename(skillDir);
	const parent = path.basename(path.dirname(skillDir));
	const { name: fmName, description: fmDesc } = parseFrontmatter(content);
	const body = extractBody(content);
	const codeBlocks = extractCodeBlocks(content);
	const stripped = stripExamples(content);
	if (parent !== "skills") crit("S1", "SKILL.md in own directory", `path: ${filePath}`, "Move SKILL.md into its own named subdirectory under a skills/ directory");
	if (!fmName) crit("S2", "Required frontmatter: name", "name: field missing or empty", `Add 'name: ${dirName}' to the YAML frontmatter block`);
	if (!fmDesc) crit("S2", "Required frontmatter: description", "description: field missing or empty", "Add a description: field to the YAML frontmatter block");
	if (fmName && fmName !== dirName) warn("HIGH", "S3", "name matches directory", `name: '${fmName}' but directory is '${dirName}'`, `Set name: to '${dirName}'`);
	const s4RefPattern = /([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_./-]+\.[a-zA-Z]+)/g;
	const s4Skip = /[<>*]|^(https?:\/\/|~|\/|skills\/|\.agents\/|\.github\/|\.cursor\/|\.vscode\/)/;
	const s4Ext = /\.(md|sh|mts|mjs|js|ts|py|json|yaml|yml)$/;
	const s4Refs = /* @__PURE__ */ new Set();
	let m;
	while ((m = s4RefPattern.exec(codeBlocks)) !== null) {
		const ref = m[1];
		if (isShellExpandedReference(codeBlocks, m.index)) continue;
		if (m.index > 0 && codeBlocks[m.index - 1] === "/") continue;
		if (!s4Skip.test(ref) && s4Ext.test(ref)) s4Refs.add(ref);
	}
	for (const ref of s4Refs) if (!fs.existsSync(path.join(skillDir, ref))) warn("HIGH", "S4", "Referenced file does not exist in skill directory", `${ref} (looked for ${path.join(skillDir, ref)})`, "Create the file inside the skill directory or remove the reference");
	const anchorPattern = /\[([^\]]+)\]\(#([^)]+)\)/g;
	while ((m = anchorPattern.exec(stripped)) !== null) {
		const anchor = m[2];
		const headingPat = anchor.replace(/-/g, "[- ]");
		if (!new RegExp(`^#{1,6}.*${headingPat}`, "im").test(content)) warn("MEDIUM", "S5", "Internal anchor link does not resolve", `#${anchor}`, `Add a heading matching '${anchor.replace(/-/g, " ")}' or fix the link target`);
	}
	if (fmDesc && !/use this skill when|when to use/i.test(fmDesc)) warn("HIGH", "Q1", "Trigger language in description", `description: ${fmDesc}`, "Add 'Use this skill when ...' to the description field");
	if (fmDesc) {
		const wordCount = fmDesc.split(/\s+/).filter(Boolean).length;
		if (wordCount < 12) warn("HIGH", "Q2", "Description too short (specificity)", `${wordCount} words: ${fmDesc}`, "Expand the description to at least 12 words with specific trigger conditions");
		const genericHit = GENERIC_PHRASES.find((p) => new RegExp(p, "i").test(fmDesc));
		if (genericHit) warn("HIGH", "Q2", "Description uses vague generic phrase", `matched '${genericHit}' in: ${fmDesc}`, "Replace with specific trigger conditions and outcomes");
	}
	if (fmDesc && /called by\b|^internal\b/i.test(fmDesc) && !/^Internal skill:/i.test(fmDesc)) warn("MEDIUM", "Q3", "Sub-skill missing 'Internal skill:' prefix", `description: ${fmDesc}`, "Prefix description with 'Internal skill: ' to prevent unintended activation");
	if (!body.trim()) warn("MEDIUM", "Q4", "No actionable instruction body", "body is empty after frontmatter", "Add numbered steps, decision logic, or ## section headers");
	else if (!/^\d+\.|^#{1,4} /m.test(body)) warn("MEDIUM", "Q4", "No actionable instruction body", "body has no numbered steps or section headers", "Add numbered steps, decision logic, or ## section headers");
	if (fmDesc && fmDesc.length > 120) warn("MEDIUM", "Q5", "Description exceeds 120 characters", `description: ${fmDesc.slice(0, 80)}… (${fmDesc.length} chars)`, "Trim to ≤120 chars; move example phrases to the skill body");
	const q10Patterns = [
		/show (this |the )?(summary )?table/i,
		/parse (the )?stdout/i,
		/from the (script )?output/i,
		/prints a summary table/i,
		/print(s|ed)? a (summary )?table/i
	];
	const q10Line = body.split("\n").find((line) => {
		if (/\b(do not|don't|never)\b/i.test(line) && /parse (the )?stdout/i.test(line)) return false;
		return q10Patterns.some((pat) => pat.test(line));
	});
	if (q10Line) warn("HIGH", "Q10", "SKILL.md instructs parsing stdout prose/tables as data", q10Line.trim(), "Point agents at an artifact file or jq on CLI output; stdout should be JSON ack only");
	const scriptsDir = path.join(skillDir, "scripts");
	if (fs.existsSync(scriptsDir)) {
		if (fs.readdirSync(scriptsDir).filter((f) => !f.startsWith(".")).some((f) => {
			const src = fs.readFileSync(path.join(scriptsDir, f), "utf8");
			return /readline|createInterface|\.question\(/.test(src);
		}) && !/--yes|-y/.test(content)) warn("HIGH", "Q11", "Interactive script missing non-interactive agent path", "scripts/ uses readline/prompt but SKILL.md does not document --yes or -y", "Document --yes (or equivalent) in SKILL.md for autonomous agent runs");
	}
	for (const pat of E1_PATTERNS) {
		const hit = codeBlocks.split("\n").find((l) => pat.test(l));
		if (hit) {
			crit("E1", "Dangerous shell command (in code block)", hit.trim(), "Remove or rewrite; never embed destructive commands in a skill");
			break;
		}
	}
	for (const pat of E2_PATTERNS) {
		const hit = stripped.split("\n").find((l) => pat.test(l));
		if (hit) {
			crit("E2", "Prompt injection pattern", hit.trim(), "Remove prompt-injection content; treat skill body as untrusted data");
			break;
		}
	}
	const e6Hit = stripped.split("\n").find((l) => /git push.*(--force|-f )/.test(l) && /(main|master)/.test(l));
	if (e6Hit) warn("HIGH", "E6", "Silent permission escalation: force-push to main/master", e6Hit.trim(), "Add an explicit user-confirmation step before the force-push");
	return {
		criticals,
		warnings
	};
}
function printFinding(f) {
	const icon = f.severity === "CRITICAL" ? "❌" : "⚠️ ";
	console.info(`  ${icon} [${f.severity}] ${f.checkId} — ${f.name}`);
	console.info(`     Evidence: ${f.evidence}`);
	console.info(`     Fix:      ${f.fix}`);
}
function main() {
	const args = process.argv.slice(2);
	const pathIdx = args.indexOf("--path");
	const targetPath = pathIdx !== -1 ? args[pathIdx + 1] : void 0;
	const cwd = process.cwd();
	let skillFiles;
	if (targetPath) {
		const resolved = path.resolve(cwd, targetPath);
		const skillMd = resolved.endsWith("SKILL.md") ? resolved : path.join(resolved, "SKILL.md");
		if (!fs.existsSync(skillMd)) {
			console.error(`No SKILL.md found at ${skillMd}`);
			process.exit(1);
		}
		skillFiles = [fs.realpathSync(skillMd)];
	} else skillFiles = findSkillFiles(SKILL_DIRS, cwd);
	if (skillFiles.length === 0) {
		console.info("No SKILL.md files found.");
		process.exit(0);
	}
	console.info(`Validating ${skillFiles.length} skill(s)…`);
	let totalCriticals = 0;
	let totalWarnings = 0;
	for (const filePath of skillFiles) {
		const dirName = path.basename(path.dirname(filePath));
		console.info(`\n── ${dirName} ─────────────────────────`);
		const { criticals, warnings } = runChecks(filePath);
		totalCriticals += criticals.length;
		totalWarnings += warnings.length;
		for (const f of criticals) printFinding(f);
		for (const f of warnings) printFinding(f);
		if (criticals.length === 0) console.info("  ✅ no CRITICAL findings");
		else console.info("  🚨 DO NOT commit or install until all CRITICAL findings are resolved.");
	}
	console.info("\n══════════════════════════════════════");
	console.info(`Results: ${totalCriticals} critical failure(s), ${totalWarnings} warning(s)`);
	if (totalCriticals > 0) {
		console.info("❌ Fix all CRITICAL findings before merging.");
		process.exit(1);
	}
	console.info("✅ All checks passed (S1–S5, Q1–Q5, Q10–Q11, E1–E2, E6).");
	console.info("   Run the audit-skill agent skill for full quality review (Q6–Q12, E3–E5, E7).");
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
//#endregion
export { runChecks };
