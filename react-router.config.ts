import type { Config } from "@react-router/dev/config";

export default {
	// Config options...
	future: {
		unstable_optimizeDeps: true,
		v8_splitRouteModules: true,
		v8_viteEnvironmentApi: true,
	},
	// Fixes hot-reload on proxy paths
	routeDiscovery: { mode: "initial" },
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: true,
} satisfies Config;
