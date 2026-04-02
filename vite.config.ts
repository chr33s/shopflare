import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { reactRouter } from "@react-router/dev/vite";
import { playwright } from "@vitest/browser-playwright";
import { loadEnv } from "vite";
import babel from "vite-plugin-babel";
import cloudflareTunnel from "vite-plugin-cloudflare-tunnel";
import i18nextLoader from "vite-plugin-i18next-loader";
import { defineConfig } from "vitest/config";
import i18nextLoaderOptions from "./i18n.config.ts";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");
	const app = new URL(env.HOST || env.SHOPIFY_APP_URL);
	const port = Number.parseInt(env.PORT || "8080");

	const isTest = Boolean(env.VITEST);
	const isLocalhost = app.hostname === "localhost";

	return {
		assetsInclude: ["**/*.gql"],
		base: app.href,
		build: {
			assetsInlineLimit: 0,
			rollupOptions: {
				external: [/^cloudflare:/],
			},
		},
		clearScreen: false,
		define: define(env),
		optimizeDeps: {
			include: ["react/compiler-runtime"],
		},
		resolve: {
			dedupe: ["react", "react-dom", "react/compiler-runtime"],
		},
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			!(isLocalhost || isTest) &&
				cloudflareTunnel({
					apiToken: env.CLOUDFLARE_API_KEY,
					hostname: app.hostname,
					logLevel: "error",
					tunnelName: "shopflare",
					port,
				}),
			!isTest && cloudflare({ viteEnvironment: { name: "ssr" } }),
			reactRouter(),
			babel({
				babelConfig: {
					plugins: [["babel-plugin-react-compiler"]],
					presets: ["@babel/preset-typescript"],
				},
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
			port,
			preflightContinue: true,
		},
		test: {
			css: true,
			globalSetup: ["./vitest.global-setup.ts"],
			projects: [
				{
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
					extends: true,
					plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.json" } })],
					test: {
						include: ["app/*server.test.ts", "app/**/*server.test.ts"],
						name: "server",
					},
				},
			],
			watch: false,
		},
	};
});

export function define(env: Record<string, string>) {
	return ["SHOPIFY_API_KEY", "SHOPIFY_APP_HANDLE", "SHOPIFY_APP_URL"].reduce(
		(a, k) => ({
			...a,
			[`import.meta.env.${k}`]: JSON.stringify(env[k]),
		}),
		{},
	);
}
