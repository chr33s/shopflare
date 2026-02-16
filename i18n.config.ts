import type { Options } from "vite-plugin-i18next-loader";

export default {
	include: ["**/*.json"],
	logLevel: "warn",
	namespaceResolution: "basename",
	paths: ["./app/i18n"],
} satisfies Options;
