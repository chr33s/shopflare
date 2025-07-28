import type * as AppBridge from '@shopify/app-bridge-types';

declare module 'cloudflare:test' {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-object-type
	interface ProvidedEnv extends Env {}
}
declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	export namespace JSX {
		export interface IntrinsicElements {
			'ui-modal': AppBridge.UIModalAttributes;
			'ui-title-bar': AppBridge.UITitleBarAttributes;
			'ui-save-bar': AppBridge.UISaveBarAttributes;
			'ui-nav-menu': AppBridge.UINavMenuAttributes;
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
