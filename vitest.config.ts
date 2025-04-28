import { loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import i18nextLoaderOptions from "./i18n.config";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");

	return {
		optimizeDeps: {
			include: ["react/jsx-dev-runtime"],
		},
		plugins: [i18nextLoader(i18nextLoaderOptions), tsconfigPaths()],
		test: {
			css: true,
			env,
			watch: false,
		},
	};
});
