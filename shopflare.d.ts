import 'react-router';
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

declare module 'vite/client' {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-object-type
	interface ViteTypeOptions {}

	interface ImportMetaEnv {
		readonly SHOPIFY_API_KEY: string;
		readonly SHOPIFY_APP_HANDLE: string;
		readonly SHOPIFY_APP_LOG_LEVEL: string;
		readonly SHOPIFY_APP_URL: string;
	}

	export interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
