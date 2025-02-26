import type { Config } from "@react-router/dev/config";
import * as Sentry from "@sentry/react-router";

export default {
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	buildEnd: async (args: any) => {
		await Sentry.sentryOnBuildEnd(args);
	},
	// Config options...
	future: {
		unstable_optimizeDeps: true,
		unstable_splitRouteModules: true,
		unstable_viteEnvironmentApi: true,
	},
	// Fixes hot-reload on proxy paths
	routeDiscovery: { mode: "initial" },
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: true,
} satisfies Config;
