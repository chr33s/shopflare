import type { Config } from "@react-router/dev/config";

export default {
	future: {
		unstable_optimizeDeps: true,
	},
	// Fixes hot-reload on proxy paths
	routeDiscovery: { mode: "initial" },
	splitRouteModules: true,
	ssr: true,
} satisfies Config;
