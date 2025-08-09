import type {Config} from '@react-router/dev/config';

export default {
	future: {
		unstable_middleware: true,
		unstable_optimizeDeps: true,
		unstable_splitRouteModules: true,
		unstable_viteEnvironmentApi: true,
	},
	// Fixes hot-reload on proxy paths
	routeDiscovery: {mode: 'initial'},
	ssr: true,
} satisfies Config;
