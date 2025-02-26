import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import * as Sentry from "@sentry/react-router";
import { defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

import i18nextLoaderOptions from "./i18n.config";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");
	const app = new URL(env.HOST ?? env.SHOPIFY_APP_URL);

	return {
		base: app.href,
		clearScreen: false,
		define: {
			ENVIRONMENT: JSON.stringify(env.SHOPIFY_APP_ENV),
			SENTRY_DSN: JSON.stringify(env.SENTRY_DSN),
			VERSION: JSON.stringify(env.npm_package_version ?? "0.0.0"),
		},
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			!env.VITEST && cloudflare({ viteEnvironment: { name: "ssr" } }),
			!env.VITEST && reactRouter(),
			!env.VITEST &&
				Sentry.sentryReactRouter(
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
