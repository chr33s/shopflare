import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import { defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");
	const shopifyApp = new URL(env.SHOPIFY_APP_URL);

	return {
		clearScreen: false,
		define: { SENTRY_DSN: JSON.stringify(env.SENTRY_DSN) },
		plugins: [
			i18nextLoader({
				include: ["**/*.json"],
				logLevel: "warn",
				namespaceResolution: "basename",
				paths: ["./app/i18n"],
			}),
			!env.VITEST && cloudflare({ viteEnvironment: { name: "ssr" } }),
			!env.VITEST && reactRouter(),
			!env.VITEST &&
				sentryReactRouter(
					{
						authToken: env.SENTRY_AUTH_TOKEN,
						org: env.SENTRY_ORG,
						project: env.SENTRY_PROJECT,
					},
					config,
				),
			tsconfigPaths(),
		],
		resolve: {
			mainFields: ["browser", "module", "main"],
		},
		server: {
			allowedHosts: [shopifyApp.hostname],
			port: Number(env.PORT || 8080),
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
