import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");

	return {
		plugins: [tsconfigPaths()],
		test: {
			css: true,
			env,
			watch: false,
		},
	};
});
