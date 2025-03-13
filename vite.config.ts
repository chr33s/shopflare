import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number(env.PORT || 8080);
	const shopifyApp = new URL(env.SHOPIFY_APP_URL);

	return {
		base: shopifyApp.href,
		build: {
			minify: true,
			rollupOptions: isSsrBuild
				? {
						input: "./server.ts",
					}
				: undefined,
		},
		clearScreen: false,
		plugins: [
			!env.VITEST &&
				cloudflareDevProxy({
					// biome-ignore lint/suspicious/noExplicitAny: upstream
					getLoadContext({ context }: any) {
						return { cloudflare: context.cloudflare };
					},
				}),
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
