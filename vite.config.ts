import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { playwright } from "@vitest/browser-playwright";
import { reactRouter } from "@react-router/dev/vite";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import babel from "vite-plugin-babel";
import i18nextLoader from "vite-plugin-i18next-loader";
import { defineConfig } from "vitest/config";

import i18nextLoaderOptions from "./i18n.config.ts";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");
	const app = new URL(env.HOST || env.SHOPIFY_APP_URL);
	const isTest = Boolean(env.VITEST);

	return {
		assetsInclude: ["**/*.gql"],
		base: app.href,
		build: {
			assetsInlineLimit: 0,
			rolldownOptions: { external: [/^cloudflare:/] },
		},
		clearScreen: false,
		define: [
			"SHOPIFY_API_KEY",
			"SHOPIFY_APP_HANDLE",
			"SHOPIFY_APP_LOG_LEVEL",
			"SHOPIFY_APP_URL",
		].reduce(
			(a, k) => ({
				...a,
				[`import.meta.env.${k}`]: JSON.stringify(env[k]),
			}),
			{},
		),
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			!isTest && cloudflare({ viteEnvironment: { name: "ssr" } }),
			reactRouter(),
			babel({
				babelConfig: {
					plugins: [["babel-plugin-react-compiler"]],
					presets: ["@babel/preset-typescript"],
				},
				optimizeOnSSR: true,
				filter: /\.[jt]sx?$/,
			}),
		].filter(Boolean),
		server: {
			allowedHosts: [app.hostname],
			// pass cors handling to react-router
			cors: false,
			fs: {
				// See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
				allow: ["app", "node_modules"],
			},
			origin: app.origin,
			port: Number(env.PORT || 8080),
			preflightContinue: true,
		},
		test: {
			css: true,
			globalSetup: ["./vitest.global-setup.ts"],
			projects: [
				{
					plugins: [cloudflareWorkersPlugin()],
					test: {
						browser: {
							enabled: true,
							headless: true,
							instances: [{ browser: "webkit" }],
							provider: playwright(),
						},
						include: ["app/**/*.browser.test.tsx"],
						name: "browser",
					},
				},
				{
					test: {
						environment: "happy-dom",
						include: ["app/**/*.client.test.tsx"],
						name: "client",
					},
				},
				{
					resolve: {
						alias: [
							{
								find: "virtual:i18next-loader",
								replacement: fileURLToPath(new URL("./app/i18n/resources.ts", import.meta.url)),
							},
							{
								find: "virtual:react-router/server-build",
								replacement: fileURLToPath(new URL("./build/server/index.js", import.meta.url)),
							},
						],
					},
					plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.json" } })],
					test: {
						include: ["app/**/*server.test.ts"],
						name: "server",
					},
				},
			],
			watch: false,
		},
	};
});

function cloudflareWorkersPlugin() {
	const virtualModuleId = "cloudflare:workers";
	const resolvedVirtualModuleId = `\0${virtualModuleId}`;

	return {
		load(id: string) {
			if (id !== resolvedVirtualModuleId) return;
			return `
				export const env = import.meta.env;
				export const waitUntil = Promise.resolve;
				export class DurableObject {};
			`;
		},
		name: virtualModuleId,
		resolveId(id: string) {
			if (id !== virtualModuleId) return;
			return resolvedVirtualModuleId;
		},
	};
}
