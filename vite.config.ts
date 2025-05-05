import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

import i18nextLoaderOptions from "./i18n.config";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const shopifyApp = new URL(env.SHOPIFY_APP_URL);

	return {
		base: shopifyApp.href,
		clearScreen: false,
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			reactRouter(),
			tsconfigPaths(),
		],
		resolve: {
			mainFields: ["browser", "module", "main"],
		},
		server: {
			allowedHosts: [shopifyApp.hostname],
			cors: {
				origin: new RegExp(
					`^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\]|${shopifyApp.hostname.replace(/\./g, "\\.")})(?::\d+)?$`,
					"g",
				),
			},
			origin: shopifyApp.origin,
			port: Number(env.PORT || 8080),
		},
		ssr: {
			resolve: {
				conditions: ["workerd", "worker", "browser"],
			},
		},
	};
});
