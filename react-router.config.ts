import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	buildEnd: async (args: any) => {
		await sentryOnBuildEnd(args);
	},
	// Config options...
	future: {
		unstable_viteEnvironmentApi: true,
	},
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: true,
} satisfies Config;
