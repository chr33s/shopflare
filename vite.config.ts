import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { type Plugin, defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

import i18nextLoaderOptions from "./i18n.config";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const app = new URL(env.HOST ?? env.SHOPIFY_APP_URL);

	return {
		base: app.href,
		clearScreen: false,
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			reactRouter(),
			sql(),
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

export function sql(): Plugin {
	return {
		name: "vite-plugin-sql",
		enforce: "pre",
		transform(src: string, id: string) {
			if (id.endsWith(".sql")) {
				const escapedSrc = JSON.stringify(src).replace(
					/[\u2028\u2029]/g,
					(c) => `\\u${`000${c.charCodeAt(0).toString(16)}`.slice(-4)}`,
				);
				return {
					code: `export default ${escapedSrc};`,
					map: { mappings: "" },
				};
			}
		},
	};
}
