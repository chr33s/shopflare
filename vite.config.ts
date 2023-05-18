import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		clearScreen: false,
		define: {
			"process.env.SHOPIFY_API_KEY": JSON.stringify(env.SHOPIFY_API_KEY),
		},
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		test: {
			environment: "node",
			environmentMatchGlobs: [
				["src/**/*.test.tsx", "happy-dom"],
				["{functions,lib}/**/*.test.ts", "miniflare"],
			],
			environmentOptions: {
				bindings: { ...env },
				kvNamespaces: ["SHOPFLARE_KV"],
			},
			watch: false,
		},
	};
});
