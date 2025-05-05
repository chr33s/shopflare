import type { Config } from "@react-router/dev/config";

export default {
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
