import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

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
		},
		clearScreen: false,
		plugins: [cloudflare(), reactRouterPlugins, tsconfigPaths()],
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
	};
});
