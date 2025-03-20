import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number(env.PORT || 8080);
	const shopifyApp = new URL(env.SHOPIFY_APP_URL);

	return {
		base: shopifyApp.href,
		clearScreen: false,
		plugins: [
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			!env.VITEST && reactRouter(),
			tsconfigPaths(),
		],
		resolve: {
			mainFields: ["browser", "module", "main"],
		},
		server: {
			allowedHosts: [shopifyApp.hostname],
			cors: true,
			hmr: {
				protocol: "wss",
				host: shopifyApp.hostname,
				port,
				clientPort: 443,
			},
			origin: shopifyApp.origin,
			port,
		},
		ssr: {
			resolve: {
				conditions: ["workerd", "worker", "browser"],
			},
		},
		test: {
			env: {
				...env,
				SHOPIFY_APP_LOG_LEVEL: "error",
			},
			watch: false,
		},
	};
});
