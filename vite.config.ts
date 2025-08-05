import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import * as Sentry from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

import i18nextLoaderOptions from "./i18n.config";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");
	const app = new URL(env.HOST ?? env.SHOPIFY_APP_URL);

	const VERSION = env.npm_package_version ?? "0.0.0";

	return {
		base: app.href,
		clearScreen: false,
		define: {
			ENVIRONMENT: JSON.stringify(env.SHOPIFY_APP_ENV),
			SENTRY_DSN: JSON.stringify(env.SENTRY_DSN),
			VERSION: JSON.stringify(VERSION),
		},
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			!env.VITEST && cloudflare({ viteEnvironment: { name: "ssr" } }),
			!env.VITEST && reactRouter(),
			!env.VITEST &&
				Sentry.sentryVitePlugin({
					authToken: env.SENTRY_AUTH_TOKEN,
					disable: config.mode !== "production",
					org: env.SENTRY_ORG,
					project: env.SENTRY_PROJECT,
					release: { name: VERSION },
					telemetry: false,
				}),
			tsconfigPaths(),
		],
		resolve: {
			mainFields: ["browser", "module", "main"],
		},
		server: {
			allowedHosts: [app.hostname],
			cors: {
				origin: true,
				preflightContinue: true,
			},
			origin: app.origin,
			port: Number(env.PORT || 8080),
		},
		ssr: {
			resolve: {
				conditions: ["workerd", "worker", "browser"],
			},
		},
	};
});
