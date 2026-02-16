import { APP_LOG_LEVEL } from "./const";

function createLog(level: "error" | "warn" | "info" | "debug") {
	const levels = {
		debug: 3,
		error: 0,
		info: 2,
		warn: 1,
	} as const;
	const envLevel = (APP_LOG_LEVEL ?? "error") as typeof level;

	return (...args: unknown[]) => {
		if (levels[level] >= levels[envLevel]) {
			return console[level](...args);
		}
	};
}

export const log = {
	debug: createLog("debug"),
	error: createLog("error"),
	info: createLog("info"),
	warn: createLog("warn"),
};
