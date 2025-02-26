import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// By default react-router's dev server uses Node.js, so we want to remove their server
// configuration to use the dev server provided by Vite + Workerd.
const reactRouterPlugins = reactRouter();
const reactRouterPlugin = reactRouterPlugins.find(
	(plugin) => plugin.name === "react-router",
)!;
reactRouterPlugin.configureServer = undefined;

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const shopifyApp = new URL(env.SHOPIFY_APP_URL);

	return {
		build: {
			minify: true,
			sourcemap: mode !== "test",
		},
		clearScreen: false,
		define: {
			SENTRY_DSN: JSON.stringify(env.SENTRY_DSN),
			SHOPIFY_APP_URL: JSON.stringify(env.SHOPIFY_APP_URL),
		},
		plugins: [
			!env.VITEST && cloudflare(),
			!env.VITEST && reactRouterPlugins,
			!env.VITEST &&
				sentryVitePlugin({
					authToken: env.SENTRY_AUTH_TOKEN,
					org: env.SENTRY_ORG,
					project: env.SENTRY_PROJECT,
				}),
			tsconfigPaths(),
		],
		resolve: {
			mainFields: ["browser", "module", "main"],
		},
		server: {
			allowedHosts: [shopifyApp.hostname],
			port: 8080,
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
