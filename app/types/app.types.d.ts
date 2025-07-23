import type { UIModalAttributes, UITitleBarAttributes, UISaveBarAttributes, UINavMenuAttributes } from "@shopify/app-bridge-types";

declare module "*.json" {
	const content: string;
	export default content;
}

declare module 'cloudflare:test' {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-object-type
	interface ProvidedEnv extends Env {}
}

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"ui-modal": UIModalAttributes;
			"ui-title-bar": UITitleBarAttributes;
			"ui-save-bar": UISaveBarAttributes;
			"ui-nav-menu": UINavMenuAttributes;
		}
	}
}

declare module 'react-router' {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: Env;
		};
	}
	export interface Future {
		unstable_viteEnvironmentApi: true;
	}
}