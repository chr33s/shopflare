import type { Config } from "@react-router/dev/config";

export default {
	future: {
		unstable_optimizeDeps: true,
		v8_middleware: true,
		v8_splitRouteModules: true,
		v8_viteEnvironmentApi: true,
	},
	// Fixes hot-reload on proxy paths
	routeDiscovery: { mode: "initial" },
	ssr: true,
} satisfies Config;
