const INIT_HOOKS = [{
	id: "mark-internal",
	label: "PostToolUse › mark-internal",
	command: "bash .agents/hooks/mark-internal.sh",
	claude: {
		event: "PostToolUse",
		matcher: "Write|Edit"
	},
	cursor: { event: "afterFileEdit" },
	codex: {
		event: "PostToolUse",
		matcher: "Write|Edit"
	}
}, {
	id: "inject-local-augmentations",
	label: "SessionStart › inject-local-augmentations",
	command: "bash .agents/hooks/inject-local-augmentations.sh",
	claude: { event: "SessionStart" },
	codex: { event: "SessionStart" }
}];
//#endregion
export { INIT_HOOKS };
